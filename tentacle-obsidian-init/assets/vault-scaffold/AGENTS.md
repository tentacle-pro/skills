# 🤖 AGENTS — Vault Operating Rules

> **All AI agents working in this vault MUST read this file before creating or modifying any content.**

This is an **Obsidian Vault** for a content creator (text & image). It doubles as a long-term second brain. Follow the folder conventions below strictly to keep the vault coherent.

---

## Vault Architecture

| Folder | Purpose | When to write here |
|--------|---------|-------------------|
| `00 Inbox/` | Unprocessed captures | Raw ideas, links, drafts that haven't been categorised yet |
| `Daily/` | Daily notes | One file per day, named `YYYY-MM-DD.md` |
| `01 Notes/` | Evergreen notes | One atomic concept per file; use a full-sentence title |
| `02 Projects/` | Active content projects | Has a defined deliverable and end date; use `Templates/Project.md` |
| `03 Resources/Inspiration/` | Visual & conceptual references | Screenshots, mood boards, reference images |
| `03 Resources/Swipe File/` | Copy & composition examples | Headline swipes, caption references, layout samples |
| `03 Resources/Tools & Workflow/` | Tool & process notes | How-to and config notes for software / workflows |
| `04 Areas/` | Ongoing responsibilities | No end date; e.g. brand identity, platform strategy, audience |
| `Archive/` | Completed or paused work | Move here when done; never delete |
| `Assets/` | Local media attachments | Images and files embedded in notes; do NOT put `.md` files here |
| `Templates/` | Note templates | Do not create content here; only template scaffolding |
| `.agents/skills/` | Agent skill code | All skill source code lives here; managed by Git |

### Hard Rules

- **CWD is the vault root.** All relative paths must resolve from here.
- **Git boundary:** Only `.agents/skills/` is a Git repo. Do NOT run `git init` at vault root.
- **No artefacts in note folders.** Keep logs, temp files, and build output inside `.agents/skills/<skill-name>/`.
- **Preserve YAML frontmatter** when reading or editing any `.md` file.
- **Use wikilink syntax** `[[Page Name]]` for cross-references between notes.
- **Attachments** go in `Assets/` — set Obsidian's default attachment path accordingly.

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Daily note | `YYYY-MM-DD.md` | `2026-03-03.md` |
| Evergreen note | One-sentence claim | `优质内容需要先建立受众信任.md` |
| Project | Prefix with type | `文章 - XX平台内容计划 2026Q1.md` |
| Resource | Descriptive title | `Instagram 竖版构图参考.md` |

---

## Skill Development Standards

For Python (`uv`) and TypeScript (`bun`) runtime conventions, dependency management, and environment setup, **agents MUST also read**:

→ **[.agents/skills/AGENTS.md](.agents/skills/AGENTS.md)**
