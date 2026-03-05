#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";

interface CliArgs {
  input: string;
  templateId: string;
  output?: string;
  title?: string;
  dryRun: boolean;
}

function isImageFilename(name: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function preprocessObsidianEmbedSyntax(markdown: string): string {
  return markdown.replace(/!\[\[([^\]]+)\]\]/g, (full, inner: string) => {
    const raw = String(inner || "").trim();
    const parts = raw.split("|").map((p) => p.trim()).filter(Boolean);
    const target = (parts[0] || "").split("#")[0]?.trim() || "";
    if (!target || !isImageFilename(target)) return full;

    const second = parts[1] || "";
    const isSizeHint = /^\d+(x\d+)?$/i.test(second);
    const alt = second && !isSizeHint
      ? second
      : path.basename(target, path.extname(target));
    return `![${alt}](${target})`;
  });
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
    console.log(`Usage: bun .agents/skills/tentacle-markdown2html/scripts/main.ts <markdown_file> --template <templateId> [options]

Options:
  --template <id>   Template ID (required)
  --output <path>   Output html path
  --title <text>    Optional title override
  --dry-run         Request only, no file write
  -h, --help        Show help`);
    process.exit(0);
  }

  const args: CliArgs = { input: "", templateId: "", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("-") && !args.input) {
      args.input = arg;
      continue;
    }
    if (arg === "--template" && argv[i + 1]) args.templateId = argv[++i]!;
    else if (arg === "--output" && argv[i + 1]) args.output = argv[++i]!;
    else if (arg === "--title" && argv[i + 1]) args.title = argv[++i]!;
    else if (arg === "--dry-run") args.dryRun = true;
  }

  if (!args.input) throw new Error("Missing markdown file path");
  if (!args.templateId) throw new Error("Missing --template <templateId>");
  return args;
}

function normalizeResultHtml(data: any): string {
  if (typeof data?.html === "string") return data.html;
  if (typeof data?.data?.html === "string") return data.data.html;
  if (typeof data?.result?.html === "string") return data.result.html;
  throw new Error("Invalid response: html not found");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) throw new Error(`Input not found: ${inputPath}`);

  const skillDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const env = loadEnvFile(path.join(skillDir, ".env"));

  const apiKey = process.env.API_KEY || env.API_KEY;
  const baseUrl = process.env.MARKDOWN2HTML_BASE_URL || env.MARKDOWN2HTML_BASE_URL || "https://api.tentacle.pro";
  if (!apiKey) throw new Error("Missing API_KEY. Set it in .agents/skills/tentacle-markdown2html/.env");

  const markdown = preprocessObsidianEmbedSyntax(fs.readFileSync(inputPath, "utf-8"));
  const payload: Record<string, unknown> = {
    markdown,
    templateId: args.templateId,
  };
  if (args.title) payload.title = args.title;

  const endpoint = `${baseUrl.replace(/\/$/, "")}/markdown2html`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`markdown2html request failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const html = normalizeResultHtml(data);
  const outputPath = path.resolve(args.output || inputPath.replace(/\.md$/i, ".html"));

  if (!args.dryRun) {
    fs.writeFileSync(outputPath, html, "utf-8");
  }

  console.log(JSON.stringify({
    ok: true,
    endpoint,
    inputPath,
    outputPath,
    templateId: args.templateId,
    written: !args.dryRun,
  }, null, 2));
}

await main().catch((error) => {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
});
