#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

interface CliArgs {
  input: string;
  title?: string;
  author?: string;
  summary?: string;
  cover?: string;
  dryRun: boolean;
}

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  const text = fs.readFileSync(filePath, "utf-8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function parseArgs(argv: string[]): CliArgs {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    console.log(`Usage: bun .agents/skills/tentacle-post2wechat/scripts/main.ts <html_file> [options]

Options:
  --title <text>      Title override
  --author <text>     Author override
  --summary <text>    Summary override
  --cover <path|url>  Cover image path or url
  --dry-run           Build payload only, no publish
  -h, --help          Show help`);
    process.exit(0);
  }

  const args: CliArgs = { input: "", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("-") && !args.input) {
      args.input = arg;
      continue;
    }
    if (arg === "--title" && argv[i + 1]) args.title = argv[++i]!;
    else if (arg === "--author" && argv[i + 1]) args.author = argv[++i]!;
    else if (arg === "--summary" && argv[i + 1]) args.summary = argv[++i]!;
    else if (arg === "--cover" && argv[i + 1]) args.cover = argv[++i]!;
    else if (arg === "--dry-run") args.dryRun = true;
  }
  if (!args.input) throw new Error("Missing html file path");
  return args;
}

function inferTitleFromHtml(html: string, fallbackName: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  if (h1) return h1;
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim();
  return title || fallbackName;
}

function inferSummaryFromHtml(html: string): string {
  const pTags = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  for (const item of pTags) {
    const text = (item[1] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length >= 20) return text.length > 120 ? `${text.slice(0, 117)}...` : text;
  }
  return "";
}

function findFirstImage(html: string): string | undefined {
  const m = html.match(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return m?.[1];
}

function extractImageSources(html: string): string[] {
  const matches = [...html.matchAll(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)];
  return matches.map((m) => m[1]!).filter(Boolean);
}

function compressLocalImageIfNeeded(inputPath: string, baseDir: string): string {
  if (inputPath.startsWith("http://") || inputPath.startsWith("https://")) return inputPath;
  const absInput = path.isAbsolute(inputPath) ? inputPath : path.resolve(baseDir, inputPath);
  if (!fs.existsSync(absInput)) throw new Error(`Image not found: ${absInput}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tentacle-post2wechat-"));
  const outputPath = path.join(tempDir, `${path.basename(absInput, path.extname(absInput))}.jpg`);

  const cmd = [
    ".agents/skills/baoyu-compress-image/scripts/main.ts",
    absInput,
    "--format", "jpeg",
    "--quality", "65",
    "--output", outputPath,
    "--keep",
  ];

  const result = spawnSync("bun", cmd, { cwd: process.cwd(), stdio: "pipe" });
  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || "";
    throw new Error(`Image compression failed: ${stderr}`);
  }
  return outputPath;
}

async function uploadByPathOrUrl(baseUrl: string, apiKey: string, endpoint: string, image: string): Promise<any> {
  const url = `${baseUrl.replace(/\/$/, "")}${endpoint}`;

  const form = new FormData();
  if (image.startsWith("http://") || image.startsWith("https://")) {
    form.append("image_url", image);
  } else {
    const absPath = path.resolve(image);
    const buffer = fs.readFileSync(absPath);
    const blob = new Blob([buffer]);
    form.append("media", blob, path.basename(absPath));
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(`Upload failed ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function saveDraft(baseUrl: string, apiKey: string, payload: Record<string, unknown>): Promise<any> {
  const url = `${baseUrl.replace(/\/$/, "")}/post2wechat/draft/add`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(`Draft add failed ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) throw new Error(`Input html not found: ${inputPath}`);
  const htmlBaseDir = path.dirname(inputPath);

  const skillDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const env = loadEnvFile(path.join(skillDir, ".env"));
  const baseUrl = process.env.POST2WECHAT_BASE_URL || env.POST2WECHAT_BASE_URL || "https://api.tentacle.pro";
  const apiKey = process.env.API_KEY || env.API_KEY;

  let html = fs.readFileSync(inputPath, "utf-8");
  const fallbackName = path.basename(inputPath, path.extname(inputPath));
  const title = args.title || inferTitleFromHtml(html, fallbackName);
  const digest = args.summary || inferSummaryFromHtml(html);

  const coverSource = args.cover || findFirstImage(html);
  if (!coverSource) {
    throw new Error("Cover image is required. Provide --cover or ensure first inline image exists.");
  }

  const imgSources = extractImageSources(html);

  if (args.dryRun) {
    const payloadPreview = {
      title,
      author: args.author || "",
      digest,
      content: html,
      thumb_media_id: "__DRY_RUN__",
      need_open_comment: 1,
      only_fans_can_comment: 0,
    };

    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      networkCalls: 0,
      coverSource,
      inlineImageCount: imgSources.length,
      payloadPreview,
    }, null, 2));
    return;
  }

  if (!apiKey) throw new Error("Missing API_KEY. Set it in .agents/skills/tentacle-post2wechat/.env");

  const replacementMap = new Map<string, string>();

  for (const src of imgSources) {
    if (src.startsWith("https://mmbiz.qpic.cn") || src.startsWith("http://mmbiz.qpic.cn")) continue;
    const uploadSource = compressLocalImageIfNeeded(src, htmlBaseDir);
    const uploaded = await uploadByPathOrUrl(baseUrl, apiKey, "/post2wechat/upload/article-image", uploadSource);
    if (!uploaded?.url) throw new Error(`Inline image upload returned no url: ${src}`);
    replacementMap.set(src, uploaded.url);
  }

  for (const [from, to] of replacementMap) {
    html = html.replaceAll(`src="${from}"`, `src="${to}"`);
    html = html.replaceAll(`src='${from}'`, `src="${to}"`);
  }

  const compressedCover = compressLocalImageIfNeeded(coverSource, htmlBaseDir);
  const coverResp = await uploadByPathOrUrl(baseUrl, apiKey, "/post2wechat/upload/permanent-image", compressedCover);
  const thumbMediaId = coverResp?.media_id;
  if (!thumbMediaId) throw new Error("Cover upload returned no media_id");

  const payload = {
    title,
    author: args.author || "",
    digest,
    content: html,
    thumb_media_id: thumbMediaId,
    need_open_comment: 1,
    only_fans_can_comment: 0,
  };

  const draftResp = await saveDraft(baseUrl, apiKey, payload);
  console.log(JSON.stringify({ ok: true, title, media_id: draftResp?.media_id || "", draftResponse: draftResp }, null, 2));
}

await main().catch((error) => {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
});
