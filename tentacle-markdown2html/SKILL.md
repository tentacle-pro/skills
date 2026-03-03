---
name: tentacle-markdown2html
description: Enterprise markdown-to-html renderer via API service. Sends markdown + templateId to api.tentacle.pro and writes returned html locally.
---

# tentacle-markdown2html (Enterprise Edition)

## Purpose

Call enterprise rendering service instead of local renderer:

- Endpoint: `https://api.tentacle.pro/markdown2html`
- Auth: `API_KEY` from `.env`
- Supports per-request `templateId`

## Runtime

```bash
bun .agents/skills/tentacle-markdown2html/scripts/main.ts <markdown_file> --template <templateId> [options]
```

## .env

```dotenv
API_KEY=...
MARKDOWN2HTML_BASE_URL=https://api.tentacle.pro
```

## Input/Output

- Input: markdown file
- Request payload: `{ markdown, templateId, title? }`
- Output: html file (default same-name `.html`)

## Example

```bash
bun .agents/skills/tentacle-markdown2html/scripts/main.ts 02\ Projects/article.md --template corp-a-v3
```
