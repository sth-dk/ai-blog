---
title: 'Hermes + Ollama：零成本打造你的微信 AI 助手'
description: '不花一分钱 API 费用，用 Ollama 在本地跑大模型，配合 Hermes Agent 接入微信，打造完全免费、隐私安全的私人 AI 助手。'
pubDate: 2026-04-22
tags: ['Hermes', 'Ollama', '本地部署', '教程', 'AI Agent']
---

上一篇教程我们把 Hermes Agent 绑定到了微信，但用的是云端 API——每次对话都要花钱。今天换一种玩法：**用 Ollama 在本地跑大模型，让 Hermes 连接本地模型，实现完全免费、数据不出本机的微信 AI 助手。**

---

## 为什么选择本地部署？

- **完全免费** — 没有 API 调用费用，聊多少都不心疼
- **隐私安全** — 所有对话数据都在你自己的电脑上，不经过任何第三方服务器
- **无需联网** — 模型下载完成后，断网也能正常使用（微信网关本身需要网络）
- **自由选择模型** — Ollama 支持上百个开源模型，随时切换
- **响应速度快** — 本地推理没有网络延迟，Apple Silicon 和 NVIDIA 显卡加速效果明显

> 唯一的门槛是你的电脑配置需要达到一定要求，后面会详细说明。

---

## 硬件要求

本地跑大模型对硬件有一定要求，但不需要顶级配置。以下是不同模型规模的参考：

| 模型规模 | 最低内存/显存 | 推荐配置 | 适合场景 |
|----------|--------------|---------|---------|
| 1B - 3B | 4 GB | 8 GB 内存 | 简单问答，响应快 |
| 7B - 8B | 8 GB | 16 GB 内存 | 日常对话，性价比最高 |
| 14B - 27B | 16 GB | 32 GB 内存 / 显卡 | 高质量对话 |
| 30B+ | 24 GB+ | 32 GB+ 显存 | 接近云端模型的体验 |

**macOS 用户的好消息：** Apple Silicon（M1/M2/M3/M4）的统一内存架构天然适合跑本地模型，16 GB 的 MacBook 就能流畅运行 8B 模型。

**Windows 用户：** 如果有 NVIDIA 显卡（6 GB 显存以上），体验会非常好。没有独显也可以用 CPU 跑，只是速度慢一些。

---

## 一、安装 Ollama

### macOS

两种方式，任选其一：

**方式一：官网下载（推荐）**

前往 [ollama.com/download](https://ollama.com/download) 下载 macOS 版本，双击安装即可。

**方式二：Homebrew 安装**

```bash
brew install ollama
```

安装完成后验证：

```bash
ollama --version
```

### Windows

> **注意安装路径！** 如果你直接双击安装包，Ollama 会默认装到 C 盘，后续下载的模型也会存在 C 盘，动辄几个 GB 甚至十几个 GB 的模型文件很容易把 C 盘撑满。**推荐使用命令行方式安装到其他盘：**
>
> 1. 从 [ollama.com/download](https://ollama.com/download) 下载 `OllamaSetup.exe`
> 2. 打开**命令提示符（CMD）**，不要用 PowerShell，执行：
>
> ```cmd
> OllamaSetup.exe /DIR="D:\ollama"
> ```
>
> 把 `D:\ollama` 换成你想安装的路径。
>
> 3. 同时建议把模型存储路径也改到 C 盘外。打开 **系统设置 → 搜索"环境变量" → 编辑用户环境变量**，新建一个变量：
>    - 变量名：`OLLAMA_MODELS`
>    - 变量值：`D:\ollama\models`（或你喜欢的路径）
>
> 设置完成后重启 Ollama 即可生效。

如果你不在意安装位置，也可以直接双击 `.exe` 安装包，一路默认完成安装。

安装完成后，Ollama 会作为系统服务自动运行。打开 **命令提示符** 或 **PowerShell** 验证：

```powershell
ollama --version
```

> Windows 版 Ollama 是原生支持的，不需要 WSL2。但后面配置 Hermes 时仍然需要在 WSL2 中操作。

---

## 二、下载模型

Ollama 安装好之后，需要先拉取一个模型。这一步会下载模型文件到本地，只需要做一次。

### 推荐模型

| 模型 | 命令 | 大小 | 特点 |
|------|------|------|------|
| **Qwen3 8B** | `ollama pull qwen3:8b` | ~5 GB | 中文能力出色，推荐中文用户首选 |
| **Gemma4 12B** | `ollama pull gemma4:12b` | ~8 GB | 推理和代码能力强，综合均衡 |
| **Llama 3.2 3B** | `ollama pull llama3.2:3b` | ~2 GB | 体积小速度快，适合低配机器 |
| **Qwen3 30B-A3B** | `ollama pull qwen3:30b-a3b` | ~18 GB | MoE 架构，仅激活 3B 参数，兼顾效果和速度 |
| **Gemma4 27B** | `ollama pull gemma4:27b` | ~17 GB | 高质量对话，需要较大内存 |

**如果只下载一个，推荐 Qwen3 8B** — 中文能力好、体积适中、对硬件要求不高：

```bash
ollama pull qwen3:8b
```

下载完成后，可以先试试效果：

```bash
ollama run qwen3:8b
```

输入几句话测试，按 `Ctrl+D` 退出。

---

## 三、启动 Ollama 服务

模型下载好之后，需要确保 Ollama 服务在后台运行，这样 Hermes 才能连接到它。

### macOS

如果你是通过官网安装的，Ollama 应用启动后会自动在后台运行服务（菜单栏会出现 Ollama 图标）。

如果你用 Homebrew 安装，手动启动服务：

```bash
ollama serve
```

### Windows

Windows 版 Ollama 安装后会自动注册为系统服务，开机自启。一般不需要手动操作。

如果服务没有运行，可以在开始菜单中搜索 **Ollama** 并打开它。

### 验证服务是否正常

在终端中执行：

```bash
curl http://localhost:11434
```

如果返回 `Ollama is running`，说明一切正常。

> **Windows 用户注意：** 上面的 `curl` 命令需要在 PowerShell 或 WSL2 中执行。如果在 WSL2 中访问 Windows 上运行的 Ollama，URL 可能需要改为 `http://host.docker.internal:11434` 或 Windows 的实际 IP 地址，而不是 `localhost`。

---

## 四、让 Hermes 连接 Ollama

> 前提：你已经按照 [上一篇教程](/ai-blog/blog/hermes-bindwechat/) 安装好了 Hermes Agent。如果还没装，请先完成安装。

### 方式一：交互式配置（推荐）

```bash
hermes model
```

在出现的菜单中：

1. 选择 **Custom endpoint**
2. 输入 Ollama 的 API 地址：`http://127.0.0.1:11434/v1`
3. API Key 留空，直接回车
4. 输入你下载的模型名称，比如 `qwen3:8b`

### 方式二：直接编辑配置文件

编辑 `~/.hermes/config.yaml`：

```yaml
model:
  default: qwen3:8b
  provider: custom
  base_url: http://127.0.0.1:11434/v1
```

保存后重启 Hermes 即可生效。

### Windows 用户的特殊配置

由于 Hermes 运行在 WSL2 中，而 Ollama 运行在 Windows 上，两者不在同一个网络环境中。需要找到 Windows 的 IP 地址：

在 WSL2 终端中执行：

```bash
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
```

假设输出是 `172.28.0.1`，那么配置中的地址应该改为：

```yaml
model:
  default: qwen3:8b
  provider: custom
  base_url: http://172.28.0.1:11434/v1
```

> 或者你也可以在 WSL2 中直接安装 Ollama（Linux 版），这样就不用处理跨网络的问题了。命令和 macOS 一样：`curl -fsSL https://ollama.com/install.sh | sh`。

---

## 五、启动微信 AI 助手

一切配置就绪后，启动 Hermes 网关：

```bash
hermes gateway
```

如果你之前已经绑定过微信，网关会自动连接。如果还没绑定，先执行 `hermes gateway setup` 完成微信扫码绑定（详见 [上一篇教程](/ai-blog/blog/hermes-bindwechat/)）。

现在打开微信，给你的 AI 助手发一条消息，它会通过你本地的 Ollama 模型来回复——完全免费，完全本地。

---

## 六、进阶：辅助任务也走本地模型

Hermes 除了主对话之外，还有一些辅助任务（文本压缩、网页提取、图片理解等）。默认情况下这些任务也会使用你配置的主模型，但你可以单独配置一个更轻量的模型来处理它们，节省资源：

编辑 `~/.hermes/config.yaml`，添加：

```yaml
auxiliary:
  local:
    base_url: http://127.0.0.1:11434/v1
    model: llama3.2:3b
    tasks:
      - compression
      - web_extract
```

这样主对话用 Qwen3 8B 保证质量，辅助任务用 Llama 3.2 3B 保证速度，各司其职。

---

## 七、模型切换和管理

Ollama 可以同时管理多个模型，你可以随时切换：

```bash
# 查看已下载的模型
ollama list

# 下载新模型
ollama pull gemma4:12b

# 删除不需要的模型（释放磁盘空间）
ollama rm llama3.2:3b
```

切换 Hermes 使用的模型，只需要修改 `~/.hermes/config.yaml` 中的 `default` 字段，然后重启网关即可。

---

## 八、常见问题排查

| 问题 | 解决方法 |
|------|---------|
| `connection refused` 连不上 Ollama | 确认 Ollama 服务已启动：macOS 检查菜单栏图标，Windows 检查任务栏 |
| WSL2 中无法访问 Windows 的 Ollama | 不要用 `localhost`，用 `cat /etc/resolv.conf` 找到 Windows IP |
| 模型响应很慢 | 换更小的模型（如 3B），或确认 GPU 加速是否生效：`ollama ps` 查看 |
| 内存不足 / 系统卡死 | 模型太大了，换一个更小的模型，或关闭其他占用内存的程序 |
| 中文回复质量不好 | 换 Qwen3 系列模型，中文能力明显优于其他模型 |
| `model not found` | 确认模型名称拼写正确，执行 `ollama list` 查看已下载的模型 |

---

## 九、小结

整个流程回顾：

1. **安装 Ollama** — macOS 用 Homebrew 或官网下载，Windows 直接装
2. **下载模型** — `ollama pull qwen3:8b`（推荐）
3. **配置 Hermes 连接 Ollama** — `hermes model` → Custom endpoint → `http://127.0.0.1:11434/v1`
4. **启动网关** — `hermes gateway`
5. **开始对话** — 打开微信，零成本畅聊

本地部署的核心优势就是**免费和隐私**。虽然本地模型在能力上不如 GPT-4o 或 Claude 这样的顶级云端模型，但对于日常对话、简单问答、翻译、文本处理这些场景，完全够用。而且随着开源模型的快速发展，差距正在不断缩小。
