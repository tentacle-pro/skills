#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";

interface CliArgs {
  input: string;
  templateId?: string;
  output?: string;
  title?: string;
  summary?: string;
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
  --template <id>   Template ID (default: $TEMPLATE_ID env var, then "preset-classic")
  --output <path>   Output html path
  --title <text>    Optional title override
  --summary <text>  Article summary injected as frontmatter (max 120 chars, shown as lead block)
  --dry-run         Request only, no file write
  -h, --help        Show help`);
    process.exit(0);
  }

  const args: CliArgs = { input: "", dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("-") && !args.input) {
      args.input = arg;
      continue;
    }
    if (arg === "--template" && argv[i + 1]) args.templateId = argv[++i]!;
    else if (arg === "--output" && argv[i + 1]) args.output = argv[++i]!;
    else if (arg === "--title" && argv[i + 1]) args.title = argv[++i]!;
    else if (arg === "--summary" && argv[i + 1]) args.summary = argv[++i]!;
    else if (arg === "--dry-run") args.dryRun = true;
  }

  if (!args.input) throw new Error("Missing markdown file path");
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

  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  // main.ts is at .agents/skills/tentacle-markdown2html/scripts/main.ts
  // .env is at .agents/skills/.env
  // So we need to go up 2 levels: scripts -> tentacle-markdown2html -> .agents/skills
  const sharedEnvPath = path.resolve(scriptDir, "../../.env");
  const env = loadEnvFile(sharedEnvPath);

  const apiKey = process.env.API_KEY || env.API_KEY;
  const isDev = (process.env.NODE_ENV || env.NODE_ENV) === 'development';
  const defaultBaseUrl = isDev ? 'http://127.0.0.1:3001' : 'https://api.tentacle.pro';
  const baseUrl = process.env.TENTACLE_BASE_URL || env.TENTACLE_BASE_URL || defaultBaseUrl;
  const templateId = args.templateId || process.env.TEMPLATE_ID || env.TEMPLATE_ID || "preset-classic";
  if (!apiKey) throw new Error("Missing API_KEY. Set it in .agents/skills/.env");

  const rawMarkdown = preprocessObsidianEmbedSyntax(fs.readFileSync(inputPath, "utf-8"));
  // Inject --summary into frontmatter so the renderer can display it as a lead block.
  // If the file already has a frontmatter block we append the field; otherwise we prepend one.
  let markdown = rawMarkdown;
  if (args.summary) {
    const summaryLine = `summary: ${args.summary.replace(/\n/g, ' ')}`;
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n/);
    if (frontmatterMatch) {
      // Insert inside existing frontmatter block
      markdown = markdown.replace(/^(---\n[\s\S]*?)(\n---)/, `$1\n${summaryLine}$2`);
    } else {
      markdown = `---\n${summaryLine}\n---\n\n${markdown}`;
    }
  }
  const payload: Record<string, unknown> = {
    markdown,
    templateId,
  };
  if (args.title) payload.title = args.title;

  const endpoint = `${baseUrl.replace(/\/$/, "")}/markdown2html`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`markdown2html request failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const html = normalizeResultHtml(data);
  const defaultOutputPath = inputPath.replace(/\.md$/i, ".html");
  let resolvedOutput = path.resolve(args.output || defaultOutputPath);
  // 如果 --output 指向的是一个目录，则在该目录下写同名 .html
  if (args.output && fs.existsSync(resolvedOutput) && fs.statSync(resolvedOutput).isDirectory()) {
    resolvedOutput = path.join(resolvedOutput, path.basename(defaultOutputPath));
  }
  const outputPath = resolvedOutput;

  if (!args.dryRun) {
    fs.writeFileSync(outputPath, html, "utf-8");
  }

  console.log(JSON.stringify({
    ok: true,
    endpoint,
    inputPath,
    outputPath,
    templateId,
    written: !args.dryRun,
  }, null, 2));
}

await main().catch((error) => {
  console.error(String(error instanceof Error ? error.message : error));
  process.exit(1);
});
