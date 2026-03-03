---
name: tentacle-post2wechat
description: Enterprise WeChat draft publisher via api.tentacle.pro. Uses API_KEY, server-side credential mapping, token caching/refresh, cover upload, inline image upload, and draft/add.
---

# tentacle-post2wechat (Enterprise Edition)

## Purpose

Enterprise publisher that sends requests to `api.tentacle.pro`.
Server resolves `API_KEY -> AppID/AppSecret`, caches/refreshes WeChat tokens, then forwards to WeChat APIs.

## Runtime

```bash
bun .agents/skills/tentacle-post2wechat/scripts/main.ts <html_file> [options]
```

## .env

```dotenv
API_KEY=...
POST2WECHAT_BASE_URL=https://api.tentacle.pro
```

## Behavior

1. Force-compress local images before upload (`jpeg`, quality `65`).
2. Upload inline images using enterprise endpoint and replace `<img src>` URLs.
3. Upload cover image as permanent material and obtain `thumb_media_id`.
4. Save to draft box only (`draft/add`).

## Required Inputs

- HTML file from previous conversion step
- Cover image (`--cover`) or first inline image fallback

## Example

```bash
bun .agents/skills/tentacle-post2wechat/scripts/main.ts article.html \
  --cover Assets/Cover-Images/topic/cover.jpg \
  --title "标题" \
  --author "作者" \
  --summary "摘要"
```

## API Contract

See `references/api-contract.md`.
