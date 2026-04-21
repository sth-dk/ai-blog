---
title: 'Hermes Agent 绑定微信完整教程'
description: '从安装到绑定，手把手教你在 Windows、macOS、Linux 上将 Hermes Agent 连接到个人微信。'
pubDate: 2026-04-21
tags: ['Hermes', '微信', '教程', 'AI Agent']
---

[Hermes Agent](https://github.com/NousResearch/hermes-agent) 是 Nous Research 开发的一款自改进型 AI Agent，支持连接多个聊天平台，包括个人微信。绑定之后，你可以直接在微信里和 AI 助手对话。

本文从零开始，覆盖 **Windows、macOS、Linux** 三大平台的安装和微信绑定流程。

> 本教程针对**个人微信**（Weixin），不是企业微信（WeCom）。企业微信是另一套适配器，流程不同。

---

## 一、安装 Hermes Agent

Hermes Agent 唯一的前置条件是 **Git**。安装器会自动处理 Python 3.11、Node.js、ripgrep、ffmpeg 等所有依赖。

### macOS

1. 确认 Git 已安装（macOS 一般自带）：

```bash
git --version
```

2. 运行一键安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

3. 安装完成后，重新加载 Shell：

```bash
source ~/.zshrc
```

4. 验证安装：

```bash
hermes version
hermes doctor
```

### Linux

1. 确认 Git 已安装：

```bash
git --version
# 如果没有，先安装：
# Ubuntu/Debian: sudo apt install git
# CentOS/Fedora: sudo dnf install git
```

2. 运行一键安装命令（和 macOS 一样）：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

3. 重新加载 Shell：

```bash
source ~/.bashrc
```

4. 验证安装：

```bash
hermes version
hermes doctor
```

### Windows

> Hermes Agent **不支持原生 Windows**，需要通过 WSL2（Windows Subsystem for Linux）来运行。

1. 安装 WSL2。打开 **PowerShell（管理员）**，执行：

```powershell
wsl --install
```

安装完成后**重启电脑**。重启后会自动弹出 Ubuntu 终端，按提示设置用户名和密码。

2. 进入 WSL2 终端，确认 Git 已安装：

```bash
git --version
# 如果没有：sudo apt install git
```

3. 运行一键安装命令：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

4. 重新加载 Shell：

```bash
source ~/.bashrc
```

5. 验证安装：

```bash
hermes version
hermes doctor
```

> 之后所有 Hermes 相关的操作，都在 WSL2 终端中执行，不要用 PowerShell 或 CMD。

---

## 二、配置 LLM 模型

安装完成后，需要先配置 AI 模型，Hermes 才能正常工作。

```bash
hermes model
```

会出现交互式菜单，选择你想使用的模型提供商。常见选择：

| 提供商 | 说明 |
|--------|------|
| **OpenRouter** | 聚合多个模型，推荐新手使用 |
| **DeepSeek** | 国产模型，性价比高 |
| **Anthropic** | Claude 系列 |
| **OpenAI** | GPT 系列 |
| **阿里云 DashScope** | Qwen 系列，中文能力好 |
| **Ollama / 自定义端点** | 本地部署，完全免费 |

根据提示输入对应的 API Key 即可。

---

## 三、绑定微信

模型配好之后，就可以开始绑定微信了。**三大平台绑定微信的流程是一样的**，区别只在终端环境不同。

### 第一步：安装微信适配器依赖

```bash
pip install aiohttp cryptography
```

如果想在终端中直接显示二维码（推荐）：

```bash
pip install hermes-agent[messaging]
```

### 第二步：运行配置向导

```bash
hermes gateway setup
```

出现平台选择时，选择 **Weixin**。

### 第三步：扫码登录

向导会做以下事情：

1. 向 iLink Bot API 请求一个二维码
2. 在终端中显示二维码（或提供一个 URL）
3. 等待你用微信扫码

**扫码方法：**

- 打开手机微信，点右上角 **「+」→「扫一扫」**
- 扫描终端中显示的二维码
- 在手机上**确认登录**

成功后终端会显示：

```
微信连接成功，account_id=your-account-id
```

> 二维码会自动刷新，最多 3 次。如果一直过期，检查网络连接。

> **Windows 用户注意：** WSL2 终端可能无法正确渲染二维码。如果二维码显示乱码，看终端上方会打印一个 URL，复制到浏览器中打开，然后用微信扫浏览器上的二维码。

> **SSH 远程服务器用户注意：** 如果你在远程服务器上运行 Hermes，终端二维码可能也显示不正常，同样使用 URL 方式扫码。

### 第四步：配置环境变量（可选）

扫码成功后，向导已经自动保存了凭证。你可以编辑 `~/.hermes/.env` 进行更多配置：

```bash
# 扫码后自动生成，一般不需要手动改
WEIXIN_ACCOUNT_ID=your-account-id

# 私聊策略（默认 open，任何人可以私聊）
WEIXIN_DM_POLICY=open

# 如果只想让特定的人能私聊：
# WEIXIN_DM_POLICY=allowlist
# WEIXIN_ALLOWED_USERS=user_id_1,user_id_2

# 群聊策略（默认 disabled，不响应群消息）
# WEIXIN_GROUP_POLICY=open
```

#### 私聊策略详解

| 值 | 行为 |
|----|------|
| `open` | 任何人都可以和机器人私聊（默认） |
| `allowlist` | 只有 `WEIXIN_ALLOWED_USERS` 中的用户可以私聊 |
| `disabled` | 忽略所有私聊消息 |
| `pairing` | 配对模式，用于初始设置 |

#### 群聊策略详解

| 值 | 行为 |
|----|------|
| `open` | 机器人在所有群聊中响应 |
| `allowlist` | 只在 `WEIXIN_GROUP_ALLOWED_USERS` 中的群响应 |
| `disabled` | 忽略所有群消息（默认） |

> 群聊默认关闭，因为个人微信通常加了很多群，全开会非常吵。建议按需开启。

### 第五步：启动网关

```bash
hermes gateway
```

网关启动后会自动连接微信，开始接收消息。现在打开微信，给你的 AI 助手发一条消息试试！

---

## 四、各平台操作差异总结

| 环节 | macOS | Linux | Windows (WSL2) |
|------|-------|-------|----------------|
| 安装命令 | 相同 | 相同 | 相同（在 WSL2 中执行） |
| Shell 配置文件 | `~/.zshrc` | `~/.bashrc` | `~/.bashrc` |
| 终端二维码显示 | 正常 | 正常 | 可能乱码，用 URL 替代 |
| 后台运行建议 | `tmux` 或 `screen` | `tmux` 或 `screen` | WSL2 中用 `tmux` |
| 文件路径 | `~/.hermes/` | `~/.hermes/` | WSL2 中 `~/.hermes/` |

---

## 五、绑定后支持的功能

| 功能 | 说明 |
|------|------|
| 文字对话 | 支持 Markdown 渲染 |
| 发送/接收图片 | 自动 AES 加密传输 |
| 发送/接收文件 | 保留原文件名 |
| 发送/接收视频 | 自动处理 |
| 语音消息 | 自动提取文字转录 |
| 引用回复 | AI 能理解引用的上下文 |
| 输入状态 | 对方能看到"正在输入..." |
| 长消息自动分段 | 超过 4000 字自动在段落边界拆分 |

---

## 六、常见问题排查

| 问题 | 解决方法 |
|------|---------|
| `hermes: command not found` | 执行 `source ~/.bashrc`（或 `~/.zshrc`）重新加载 Shell |
| 提示缺少 `aiohttp` 和 `cryptography` | 执行 `pip install aiohttp cryptography` |
| 提示 `WEIXIN_TOKEN is required` | 运行 `hermes gateway setup` 重新扫码登录 |
| 提示 `WEIXIN_ACCOUNT_ID is required` | 在 `~/.hermes/.env` 中设置，或重新运行 setup |
| 另一个网关正在使用该 token | 同一 token 只允许一个网关实例，先关闭另一个 |
| 登录过期（`errcode=-14`） | 重新执行 `hermes gateway setup` 扫码 |
| 私聊没有回复 | 检查 `WEIXIN_DM_POLICY`，如果是 `allowlist`，确认 ID 在列表中 |
| 群聊没有回复 | 默认关闭，需设置 `WEIXIN_GROUP_POLICY=open` |
| 媒体下载/上传失败 | 确认 `cryptography` 已安装，检查网络是否能访问 `novac2c.cdn.weixin.qq.com` |
| WSL2 终端二维码乱码 | 使用终端打印的 URL 在浏览器中打开扫码 |
| 终端二维码无法显示 | 执行 `pip install hermes-agent[messaging]` |

---

## 七、小结

整个流程回顾：

1. **安装 Hermes Agent** — macOS/Linux 一行命令，Windows 先装 WSL2 再执行同样的命令
2. **配置模型** — `hermes model`，选一个 LLM 提供商
3. **绑定微信** — `hermes gateway setup` → 选 Weixin → 扫码确认
4. **启动网关** — `hermes gateway`
5. **开始对话** — 打开微信，发消息给你的 AI 助手

之后每次只需要执行 `hermes gateway` 就能恢复微信连接，不需要重新扫码（除非登录过期）。
