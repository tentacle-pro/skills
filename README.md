# Repo introduction

这个Agent Skills仓库是“合金触手”学习型社群的公开仓库，存放了跟Obsidian配合使用的智能体技能。我们会在这个仓库里持续更新和维护这些技能，欢迎大家关注和使用。

## 技能介绍

- **tentacle-obsidian-init**：Obsidian环境初始化技能，帮助用户快速生成适合“图文内容创作者”的Obsidian目录结构。

- **tentacle-skills-washing**: 修改指定的skill代码进行当前文件夹结构和代码运行环境的适配，确保技能能够在当前环境中正常运行。

- **tentacle-markdown2html**: [alpha] 企业级markdown转html渲染器，通过调用企业渲染服务来生成html，支持模板化渲染。

- **tentacle-post2wechat**: [alpha] 企业级微信发布技能，处理图片上传和接口调用细节，简化从Obsidian到微信公众号的发布流程。

- `baoyu-` 开头的系列技能，来自[宝玉](https://github.com/JimLiu/baoyu-skills) , 经过适配和裁剪后可以在当前环境中使用，速度更快，提供了从内容创作到发布的全链路支持。

    - `baoyu-image-gen` 和 `baiyu-post-to-wechat` 需要在`.agents/skills/.env` 中配置大模型API_KEY和微信公众号相关的API凭证，才能正常使用，具体见其目录下的`.env.sample`模板。事实上所有baoyu系列生图技能后面都是调用`baoyu-image-gen` 来生成图片的。

## 安装过程

- 如果安装了Node.js环境，可以使用以下命令安装技能：
`npx -y skills add tentacle-pro/skills --all`

- 如果安装了Bun环境，可以使用以下命令安装技能：
`bunx skills add tentacle-pro/skills --all`

## 最佳实践

- 调用 `tentacle-obsidian-init` 技能来快速设置你的Obsidian环境，确保你的目录结构符合[PARA](https://fortelabs.com/blog/para/) 原则，个人认为这也是最适合“图文内容创作者”的目录结构。

    - 注意新的仓库要在配置中指定“模板”所在文件夹和“日记”使用的模板文件夹。

- 每次安装了第三方skill后应立即调用 `tentacle-skills-washing` 技能来适配当前环境，即“洗技能”——你的就是我的，我的还是我的^_^

- 与内容创作和Obsidian本身关系不大的Skill，尤其是通用的底层的工具技能如`ast-grep`，建议安装为全局(Global)技能(放在用户home目录下)，这样可以避免在其他代码项目、文档项目中重复安装，也能通过`npx skills update` 来统一更新。

## 贡献指南
我们欢迎社区成员为这个仓库贡献代码和技能。如果你有一个新的技能想要分享，或者对现有技能有改进建议，请按照以下步骤进行：
1. Fork这个仓库到你的GitHub账户。
2. 在你的Fork中创建一个新的分支，命名为 `feature/your-skill-name` 。
3. 在这个分支中添加你的技能代码和相关文档。
    
    3.1 建议在新的Obsidian仓库根目录运行 `git clone git@github.com:OWNER/skills.git .agents/skills` 来获取最新的技能代码。
    
    3.2 调用 `skill-creator` skill来生成新技能

4. 提交你的更改并推送到你的Fork。
5. 在GitHub上创建一个Pull Request，描述你的技能和改动内容。
我们会尽快审查你的Pull Request，并与你沟通任何需要修改的地方。

