# redbookskills overrides

本文件只保留本技能特有约定；通用规则以 `../../AGENTS.md` 与 `../AGENTS.md` 为准。

## Runtime

- Python 通过 `uv run` 执行，不使用 `.venv`、`requirements.txt`。
- 入口命令示例：`uv run .agents/skills/redbookskills/scripts/publish_pipeline.py --help`。

## Artefact boundaries

- 运行时产物必须留在本技能目录内：
- 浏览器 profile：`.agents/skills/redbookskills/.runtime/chrome-profiles/`
- 进程锁与缓存：`.agents/skills/redbookskills/.runtime/`
- 下载临时媒体：`.agents/skills/redbookskills/images/publish_temp/`

## Documentation sync

- 变更 `scripts/` 行为后，需同步更新 `SKILL.md` 与 `README.md` 的命令示例。
