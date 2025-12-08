# 🔥 VIBE AUTO-FIX AGENT v3.0

**Autonomous Multi-Agent AI System for Complete Project Auto-Repair**

## 💥 Features

✅ **Multi-Agent Architecture**
- **Analyzer Agent**: Deep code analysis (LSP-like)
- **Fix Agent**: Automatic error fixing
- **Refactor Agent**: Code improvement & clean code
- **Security Agent**: Vulnerability detection & patching

✅ **VS Code Integration**
- Sidebar panel with live status
- Command palette integration
- Autopilot mode (auto-apply all fixes)
- Diff preview before applying patches

✅ **Advanced Capabilities**
- Unified patch system (PR-style)
- Automatic version snapshots (`.vibe-history/`)
- Project memory system
- Parallel agent execution
- GPT-4o / GPT-4.1 support

## 🚀 Installation

1. Copy `vibe-autofix-v3/` folder to your project
2. Open in VS Code
3. Run: `npm install`
4. Press `F5` to launch extension development host
5. Set your OpenAI API key in VS Code settings: `vibe.openaiApiKey`

## 📖 Usage

### Command Palette
- `Vibe Auto-Fix Full Project` - Analyze and fix entire project
- `Vibe Autopilot Mode` - Enable automatic patching
- `Create Vibe Snapshot` - Manual project snapshot

### Sidebar Panel
- View live agent progress
- See which files are being processed
- Track applied patches in real-time

## ⚙️ Configuration

Open VS Code Settings:

```json
{
  "vibe.openaiApiKey": "sk-proj-YOUR_KEY",
  "vibe.autopilotMode": false,
  "vibe.model": "gpt-4o"
}
```

## 🏗️ Architecture

```
vibe-autofix-v3/
├── agents/           # 4 specialized AI agents
├── services/         # Core services (OpenAI, File, Patch, Snapshot)
├── webview/          # Sidebar UI
├── utils/            # Helpers (Diff, Logger)
└── extension.js      # Main controller
```

## 🔐 Security

- All changes backed up to `.vibe-history/`
- Patches shown before applying (unless autopilot enabled)
- Snapshots created before each run
- No automatic file deletion

## 📊 Agent Pipeline

```
File → Analyzer → Fix → Refactor → Security → Patch → Apply
```

Each agent processes the file sequentially, building on previous agent's output.

## 🛠️ Development

```bash
npm install
code .
# Press F5 to debug
```

## 📝 License

MIT License - VibeAI 2025
