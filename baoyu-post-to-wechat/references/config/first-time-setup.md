---
name: first-time-setup
description: Legacy setup note for baoyu-post-to-wechat preferences
---

# Legacy Note

该文档描述的历史交互式偏好初始化流程已废弃，不再用于当前发布链路。

当前配置来源：

- 社区版发布：优先读取 `.agents/skills/.env`（其次读取进程环境变量）
- 企业版服务：读取 `.agents/skills/.env` 的 `API_KEY`

如需修改默认行为，请更新对应 skill 的 `SKILL.md` 与脚本参数说明。
