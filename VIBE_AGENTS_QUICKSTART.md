# 🔥 VIBE Agent Extensions - Quick Start Guide

## 📦 Installierte Versionen

Du hast jetzt **3 komplette VIBE Agent Extensions** installiert:

### 🤖 v2.0 - Original Auto-Fix Agent
**Pfad:** `/Users/mikegehrke/dev/vibeai/vibe-autofix-agent`

**Features:**
- ✅ Autonomous file scanning
- ✅ GPT-4o powered repairs
- ✅ Automatic backups
- ✅ CLI + VS Code Extension

**Starten:**
```bash
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent

# CLI Mode:
node cli-agent.js

# VS Code Extension:
# 1. Öffne Ordner in VS Code
# 2. Drücke F5
# 3. Extension Development Host startet
```

---

### 🔥 v3.0 - Multi-Agent System
**Pfad:** `/Users/mikegehrke/dev/vibeai/vibe-autofix-v3`

**Features:**
- ✅ 4 AI Agents (Analyzer → Fix → Refactor → Security)
- ✅ Sidebar Panel mit Live-Status
- ✅ Diff Preview vor Apply
- ✅ Autopilot Mode
- ✅ Version Snapshots (.vibe-history/)

**VS Code Commands:**
- `Vibe Auto-Fix Full Project`
- `Vibe Autopilot Mode`
- `Create Vibe Snapshot`

**Starten:**
```bash
# 1. Öffne in VS Code
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3

# 2. Drücke F5
# 3. Setze API Key: vibe.openaiApiKey in Settings
```

---

### 🌊 v6.0 - SWARM (Complete Dev Team)
**Pfad:** `/Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6`

**Features:**
- ✅ **10 Specialized Agents** (komplettes Senior-Team)
- ✅ **Parallel Execution** (bis zu 5 Agents gleichzeitig)
- ✅ **Agent Communication** (Message Bus)
- ✅ **GUI Builder** (React/Flutter/SwiftUI/Compose/Vue)
- ✅ **Full Project Generator**
- ✅ **Project Memory** (Langzeit-Gedächtnis)
- ✅ **Autopilot Continuous Mode**

**Die 10 Agents:**
1. **Chief Architect** - Tech Stack, Patterns, Architecture
2. **Project Manager** - Roadmap, Tickets, Prioritization
3. **Feature Dev** - Implementation
4. **Bugfix** - Error Detection & Fixes
5. **Refactor** - Clean Code, Modernization
6. **Tester** - Unit, Integration, UI Tests
7. **DevOps** - CI/CD, Docker, Deployments
8. **Security** - OWASP Audits, Hardening
9. **Documentation** - README, API Docs, Architecture
10. **Reviewer** - PR Review, Quality Gates

**VS Code Commands:**
- `VIBE Swarm: Auto Dev`
- `VIBE Swarm: Autopilot Mode`
- `VIBE GUI Builder`
- `VIBE Full Project Generator`
- `VIBE Dev Console`

**Starten:**
```bash
# 1. Öffne in VS Code
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6

# 2. Drücke F5
# 3. Setze API Key: vibe.swarm.openaiApiKey in Settings
# 4. Setze Parallel Agents: vibe.swarm.parallelAgents (1-10)
```

---

## 🚀 Alle drei gleichzeitig starten

```bash
# Öffne alle drei in VS Code
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-agent
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6

# In jedem Fenster: F5 drücken
```

---

## 📊 Vergleich der Versionen

| Feature | v2.0 | v3.0 | v6.0 |
|---------|------|------|------|
| Agents | 1 | 4 | 10 |
| Parallel Execution | ❌ | ❌ | ✅ |
| Sidebar UI | ❌ | ✅ | ✅ |
| Diff Preview | ❌ | ✅ | ✅ |
| Autopilot | ❌ | ✅ | ✅ (Continuous) |
| Agent Communication | ❌ | ❌ | ✅ |
| GUI Builder | ❌ | ❌ | ✅ |
| Project Generator | ❌ | ❌ | ✅ |
| Project Memory | ❌ | ❌ | ✅ |
| Snapshots | ✅ | ✅ | ✅ |
| CLI Mode | ✅ | ❌ | ❌ |

---

## ⚙️ Konfiguration

### v2.0
```bash
# .env file
OPENAI_API_KEY=sk-proj-YOUR_KEY
```

### v3.0
```json
// VS Code Settings
{
  "vibe.openaiApiKey": "sk-proj-YOUR_KEY",
  "vibe.autopilotMode": false,
  "vibe.model": "gpt-4o"
}
```

### v6.0
```json
// VS Code Settings
{
  "vibe.swarm.openaiApiKey": "sk-proj-YOUR_KEY",
  "vibe.swarm.model": "gpt-4o",
  "vibe.swarm.parallelAgents": 5,
  "vibe.swarm.autopilot": false
}
```

---

## 💡 Welche Version verwenden?

**v2.0** - Wenn du:
- Schnelle CLI-basierte Repairs brauchst
- Einfaches Single-Agent System willst
- Background Processing bevorzugst

**v3.0** - Wenn du:
- Multi-Agent Pipeline willst
- Diff Preview vor Apply brauchst
- Snapshots für Rollback möchtest

**v6.0** - Wenn du:
- Complete autonomous dev team brauchst
- GUI Builder nutzen willst
- Full Project Generator brauchst
- Parallele Agent-Execution willst
- Agent-to-Agent Communication brauchst

---

## 🎯 Empfehlung

**Für VibeAI Backend Repairs:** Starte mit **v3.0**
- Analyzer findet alle Fehler
- Fix Agent repariert automatisch
- Refactor Agent optimiert Code
- Security Agent härtet ab
- Du siehst Diff Preview vor Apply

**Für neue Features/Projects:** Nutze **v6.0 SWARM**
- PM Agent plant Tasks
- Architect Agent designed
- FeatureDev implementiert
- Alle anderen Agents optimieren parallel
- Komplettes autonomes Team

---

## 📝 Quick Commands

```bash
# v2.0 CLI Run
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent
node cli-agent.js

# Alle Extensions öffnen
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-agent
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6

# Dependencies check
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent && npm list --depth=0
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-v3 && npm list --depth=0
cd /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6 && npm list --depth=0
```

---

**Du hast jetzt die mächtigsten AI Development Tools ever built!** 🔥
