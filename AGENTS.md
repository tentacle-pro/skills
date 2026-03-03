# 🤖 AGENTS — Skill Development Standards

> Runtime and toolchain standards for all Agent Skills in this vault.  
> Scope: `.agents/skills/` and below.  
> Parent rules (vault-wide): [AGENTS.md](../../AGENTS.md)

**All agents writing or modifying skills MUST read this file.**

---

## Python Standard

We use **`uv`** for ultra-fast, ephemeral Python environments. No virtual environments, no `requirements.txt`.

### PEP 723 Inline Metadata (required)

Every standalone Python script **MUST** declare dependencies at the very top of the file:

```python
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests",
#     "pyyaml",
# ]
# ///

import requests
# your logic here
```

### Execution

```bash
uv run .agents/skills/<skill-name>/main.py [args]
```

**Do NOT create:** `.venv/`, `requirements.txt`, `pyproject.toml` (unless the skill is a full package).

---

## TypeScript Standard

We use **`bun`** for execution and package management.

### Isolation rule

Each TS skill has its own `package.json` inside its skill directory.

```bash
# Install a dependency (run inside the skill directory)
cd .agents/skills/<skill-name>
bun add zod
```

### Execution

```bash
bun .agents/skills/<skill-name>/main.ts [args]
```

---

## Prerequisites — Environment Setup

### macOS (recommended: Homebrew)

```bash
# 1. Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Git, uv, Bun
brew install git uv
curl -fsSL https://bun.sh/install | bash

# 3. Node.js via nvm (provides npx)
brew install nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts && nvm use --lts
```

### Windows (PowerShell as Administrator)

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Linux

```bash
# uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# Bun
curl -fsSL https://bun.sh/install | bash
# Node.js: use nvm or your distro's NodeSource repo
```
