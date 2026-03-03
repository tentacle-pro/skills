---
name: baoyu-markdown-to-html
description: Converts Markdown to WeChat-compatible HTML subset with selectable themes. Community local converter for article publishing workflow.
---

# baoyu-markdown-to-html (Community Edition)

Converts Obsidian markdown to WeChat-friendly HTML in local environment.

## Runtime

- Entry script: `scripts/main.ts`
- Run command:

```bash
bun .agents/skills/baoyu-markdown-to-html/scripts/main.ts <markdown_file> [options]
```

## Output

- Writes `<same-name>.html` in the same directory.
- If existing html exists, creates timestamped backup.
- Returns JSON including `htmlPath`, `title`, and extracted image info.

## Supported Options

- `--theme <name>`: `default | grace | simple | modern`
- `--color <name|hex>`
- `--title <text>`
- `--keep-title`

## Example

```bash
bun .agents/skills/baoyu-markdown-to-html/scripts/main.ts article.md --theme modern --color red
```

## Notes

- This is local conversion and does not publish.
- For enterprise template rendering, use `tentacle-markdown2html`.
