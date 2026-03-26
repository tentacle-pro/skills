---
name: tentacle-markdown2html
description: Enterprise markdown-to-html renderer via API service. Sends markdown to api.tentacle.pro and writes returned html locally.
---

# tentacle-markdown2html (Enterprise Edition)

## Purpose

Call enterprise rendering service instead of local renderer:

- Endpoint: `https://api.tentacle.pro/markdown2html`
- Auth: `API_KEY` from `.agents/skills/.env`

## Runtime

```bash
bun .agents/skills/tentacle-markdown2html/scripts/main.ts <markdown_file> [options]
```

## Shared .env (`.agents/skills/.env`)

```dotenv
API_KEY=tpk-xxx
```

## Input/Output

- Input: markdown file
- Request payload: `{ markdown, title? }`
- Output: html file (default same-name `.html`)

## Options

| Flag | Description |
|------|-------------|
| `--output <path>` | Output HTML path |
| `--title <text>` | Title override |
| `--summary <text>` | Article summary (max 120 chars). Injected as `summary:` into frontmatter so the renderer displays it as a themed lead block after the h1. Use this when the markdown has no frontmatter or when the agent dynamically generates a summary. |
| `--template <id>` | Template ID (default: `preset-classic`). See preset list below. |
| `--dry-run` | Fetch only, skip file write |

## Preset Templates

| Template ID | 名称 | 特色 |
|---|---|---|
| `preset-classic` | 经典 | 平衡的信息密度与阅读舒适度（默认） |
| `preset-grace` | 优雅 | 柔和色彩，适合观点表达和品牌内容 |
| `preset-simple` | 简洁 | 去装饰，适合知识密集型内容 |
| `preset-sports` | 运动风 | 橙绿双色渐变，活力动感 |
| `preset-warm` | 温暖 | 砖红色调，贴近原生公众号体验 |
| `preset-elegant-green` | 精致·翡翠绿 | 层次丰富，适合品牌内容与知识型文章 |
| `preset-liguan` | 理观 | 锈红铜金，大号序号二级标题（`## 01 标题` 语法），适合地理/自然/人文深度长文 |

## Preprocessing

- Before request, script normalizes Obsidian image embeds like `![[cover.jpg]]` to standard markdown image syntax.
- This keeps enterprise behavior aligned with community flow and ensures downstream image extraction/replacement can work consistently.

## WeChat-Oriented Expectation

- The generated HTML is expected to be consumed by `tentacle-post2wechat`, where:
	- inline images are uploaded with `uploadimg` semantics and rewritten as URL;
	- cover image is uploaded as permanent material and used as `thumb_media_id`.

## Example

```bash
bun .agents/skills/tentacle-markdown2html/scripts/main.ts "02 Projects/article.md" \
  --summary "早餐是一个向量空间。煎饼、可丽饼和炒蛋安置在一个单纯形上，是否存在从未被探索的'暗早餐'？"
```
