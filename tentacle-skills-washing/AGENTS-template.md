# 🤖 SYSTEM INSTRUCTIONS FOR AI AGENTS

**CRITICAL:** This document contains the operational rules for all AI coding assistants working in this workspace. You MUST read and adhere to these constraints before creating, modifying, or executing any Agent Skills.

## 1. Workspace Architecture & Boundaries
- **Environment:** This is an Obsidian Vault managed by a WebDAV sync plugin (Remotely Save). 
- **CWD:** The root of this vault is your Current Working Directory (`CWD`). All relative paths in your scripts MUST resolve from the Vault Root.
- **Git Isolation:** The Vault Root is **NOT** a Git repository. DO NOT run `git init` or `git commit` in the root. 
- **Skill Location:** All agent skills are stored in `.agents/skills/<skill-name>`. ONLY the `.agents/skills` directory is managed by Git.

## 2. Python Development Standard (Strict)
We use `uv` for ultra-fast, ephemeral Python environments. 
- **NO Virtual Environments:** Do not create `.venv` folders, `requirements.txt`, or `pyproject.toml` for standard skills.
- **PEP 723 Inline Metadata:** Every standalone Python script MUST declare its dependencies using PEP 723 inline script metadata at the very top of the file.

**Template for Python Skills:**
```python
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "requests",
#     "pyyaml",
# ]
# ///
import requests
# Your logic here...

```

* **Execution:** Always instruct the user or execute the script via:
`uv run .agents/skills/<skill-name>/main.py [args]`

## 3. TypeScript Development Standard (Strict)

We use `bun` for TypeScript execution and package management due to its speed and global caching.

* **Local Isolation:** Each TS skill must have its own `package.json` inside its specific skill directory.
* **Installation:** If a module is missing, run `bun add <package>` INSIDE the specific skill directory (e.g., `cd .agents/skills/my-skill && bun add zod`).
* **Execution:** Execute TS scripts using:
`bun .agents/skills/<skill-name>/main.ts [args]`

## 4. Obsidian Data Integrity

* When reading or modifying `.md` files in this vault, you MUST preserve existing YAML Frontmatter blocks (`---`).
* Use standard Obsidian wikilink syntax `[[Page Name]]` when generating cross-references.
* DO NOT generate `.log`, `.tmp`, or other hidden artifacts in the standard note directories. Keep all execution artifacts inside the specific `.agents/skills/<skill-name>/` directory.

---

## 5. Prerequisites & Environment Setup (For Human Users)

*(Note to humans: Ensure these 4 core components are installed to use this skill framework)*

### Windows
We recommend using `winget` and PowerShell for a seamless installation. Open PowerShell as Administrator and run the following commands:

- **Git & Node.js:** ```powershell
  winget install Git.Git
  winget install OpenJS.NodeJS.LTS

```

* **uv:** ```powershell
powershell -ExecutionPolicy ByPass -c "irm [https://astral.sh/uv/install.ps1](https://astral.sh/uv/install.ps1) | iex"
```

```


* **Bun:** ```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

```



*(Note: If `winget` or the scripts fail due to network or environment issues, please download the installers manually from their official websites: [Add your links here])*

### macOS

For macOS, Homebrew is highly recommended. We also use `nvm` to manage Node.js versions to avoid permission issues. Open your Terminal:

* **1. Install Homebrew (if not installed):**
```bash
/bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"

```


* **2. Install Git, uv, and Bun:**
```bash
brew install git uv
curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash

```


* **3. Install Node.js via NVM:**
```bash
brew install nvm

```


After installing `nvm`, you MUST add its configuration to your shell profile. Run this to append it to your `~/.zshrc` and update your `$PATH`:
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

```


Finally, install the LTS version of Node.js (which includes `npx`):
```bash
nvm install --lts
nvm use --lts

```



### Linux

As a Linux user, you likely have your preferred package manager (e.g., `apt`, `pacman`, `dnf`). Please ensure the following core dependencies are available in your `$PATH`:

* **Git:** Install via your distro's package manager.
* **Node.js (LTS):** Recommended to use `nvm` or your distro's official NodeSource repository. Ensure `npx` is available.
* **uv:** `curl -LsSf https://astral.sh/uv/install.sh | sh`
* **Bun:** `curl -fsSL https://bun.sh/install | bash`


