# VibeAI - Complete Multi-Agent Orchestrator System

## 🎯 System Overview

Das **Multi-Agent Orchestrator System** ist das Herzstück von VibeAI. Es orchestriert 5 spezialisierte AI-Agenten, um vollständige Apps zu erstellen - von der Idee bis zum Download.

```
User Prompt
    ↓
Orchestrator (Intent Classification)
    ↓
┌─────────────┬─────────────┬──────────────┬─────────────┬──────────────┐
│  UI Agent   │ Code Agent  │Preview Agent │ Build Agent │Deploy Agent  │
└─────────────┴─────────────┴──────────────┴─────────────┴──────────────┘
    ↓             ↓              ↓              ↓              ↓
UI JSON      Flutter/React   Live Server    APK Build     Download URL
```

---

## 📁 System Architecture

```
backend/ai/orchestrator/
├── orchestrator.py          # Main Orchestrator
├── routes.py               # REST API
├── EXAMPLES.py             # Usage Examples
├── agents/
│   ├── ui_agent.py         # UI Generation (GPT-4)
│   ├── code_agent.py       # Multi-Framework Code Gen
│   ├── preview_agent.py    # Live Preview Management
│   ├── build_agent.py      # Build Process
│   └── deploy_agent.py     # Deployment & Downloads
└── memory/
    └── project_context.py  # Persistent Context Storage

backend/ai/project_generator/
├── generator.py            # Project Generator
└── templates/
    ├── flutter_template.py # Flutter Boilerplate
    └── react_template.py   # React/Vite Boilerplate
```

---

## 🤖 The 5 Agents

### 1. **UI Agent** (`ui_agent.py`)
**Purpose:** Generate UI structures from natural language

**Capabilities:**
- Create screens
- Suggest components
- Generate layouts
- Design patterns

**Example:**
```python
result = await ui_agent.create_ui(
    prompt="Create a login screen with email and password",
    context={"framework": "flutter"}
)

# Returns:
{
    "success": True,
    "screen": {
        "name": "LoginScreen",
        "title": "Login",
        "components": [
            {"type": "text", "value": "Welcome"},
            {"type": "input", "placeholder": "Email"},
            {"type": "input", "placeholder": "Password"},
            {"type": "button", "label": "Login"}
        ]
    }
}
```

---

### 2. **Code Agent** (`code_agent.py`)
**Purpose:** Generate code from UI structures

**Supported Frameworks:**
- Flutter/Dart
- React/JSX
- Vue
- HTML/CSS

**Example:**
```python
# Single framework
result = await code_agent.generate_code(screen, framework="flutter")

# All frameworks
all_code = await code_agent.generate_all_frameworks(screen)

# Returns:
{
    "success": True,
    "code": "import 'package:flutter/material.dart';...",
    "framework": "flutter",
    "files": {
        "main.dart": "..."
    }
}
```

---

### 3. **Preview Agent** (`preview_agent.py`)
**Purpose:** Manage live preview servers

**Capabilities:**
- Start Flutter web server
- Start React/Vite dev server
- Hot reload (Flutter)
- Auto-save code files
- WebSocket notifications
- Stop servers

**Workflow:**
1. Save generated code to project files
2. Stop existing preview server
3. Start new preview server
4. Send WebSocket notification

**Example:**
```python
result = await preview_agent.update_preview(
    user_id="user123",
    project_id="proj456"
)

# Returns:
{
    "success": True,
    "preview_url": "http://localhost:8080",
    "server_id": "server_abc",
    "framework": "flutter",
    "files_saved": 3
}
```

**Features:**
- **Auto-Save:** Automatically writes generated code to project files
- **Hot Reload:** Flutter hot reload support
- **Multi-Framework:** Supports Flutter, React, Vue
- **WebSocket:** Real-time notifications via WebSocket

---

### 4. **Build Agent** (`build_agent.py`)
**Purpose:** Manage build processes

**Build Types:**
- APK (Flutter Android)
- Web (Flutter/React)
- Desktop (Flutter Desktop)

**Example:**
```python
result = await build_agent.start_build(
    user_id="user123",
    project_id="proj456",
    build_type="apk"
)

# Returns:
{
    "success": True,
    "build_id": "build_xyz",
    "status": "started",
    "framework": "flutter"
}
```

---

### 5. **Deploy Agent** (`deploy_agent.py`)
**Purpose:** Deployment and distribution

**Capabilities:**
- Package artifacts (ZIP)
- Generate download links
- Upload to storage

**Example:**
```python
url = await deploy_agent.deploy_project(
    user_id="user123",
    project_id="proj456"
)

# Returns: "http://localhost:8000/downloads/proj456.zip"
```

---

## 🎯 Orchestrator

### Intent Classification

Der Orchestrator klassifiziert automatisch User-Prompts:

| Intent | Keywords | Agent |
|--------|----------|-------|
| **ui** | screen, ui, design, interface, layout | UI Agent |
| **code** | code, flutter, react, entwickle | Code Agent |
| **preview** | preview, zeige, vorschau, live | Preview Agent |
| **build** | build, apk, kompilier, baue | Build Agent |
| **deploy** | deploy, veröffentlich, publish | Deploy Agent |

### Workflows

**3 vordefinierte Workflows:**

#### 1. `create_app`
```
UI → Code → Preview
```

#### 2. `build_app`
```
Code → Build → Deploy
```

#### 3. `full_cycle`
```
UI → Code → Preview → Build → Deploy
```

---

## 📦 Project Generator

### Supported Templates

#### Flutter Template
```
my_app/
├── lib/
│   └── main.dart
├── test/
├── assets/
├── pubspec.yaml
├── README.md
└── .gitignore
```

#### React Template
```
my_app/
├── src/
│   ├── App.jsx
│   ├── index.jsx
│   └── App.css
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

#### Node.js Backend Template
```
my_app/
├── src/
│   └── index.js
├── routes/
├── package.json
└── README.md
```

---

## 💾 Project Context Memory

### Storage System

**Dual Storage:**
- **Memory:** Fast access (in-process)
- **Disk:** Persistent storage (`/tmp/vibeai_contexts/`)

### Context Structure

```json
{
  "user_id": "user123",
  "project_id": "proj456",
  "framework": "flutter",
  "screens": [
    {
      "name": "LoginScreen",
      "components": [...]
    }
  ],
  "code": {
    "flutter": {...},
    "react": {...}
  },
  "project_path": "/tmp/vibeai_projects/proj456",
  "server_id": "server_abc",
  "build_id": "build_xyz",
  "deploy_url": "http://localhost:8000/downloads/proj456.zip"
}
```

---

## 🌐 REST API

### Base URL: `/orchestrator`

### Endpoints

#### 1. Handle Prompt
```http
POST /orchestrator/handle
Content-Type: application/json

{
  "user_id": "user123",
  "project_id": "proj456",
  "prompt": "Create a login screen"
}
```

#### 2. Execute Workflow
```http
POST /orchestrator/workflow
Content-Type: application/json

{
  "user_id": "user123",
  "project_id": "proj456",
  "workflow": "full_cycle",
  "params": {
    "prompt": "Create social media app"
  }
}
```

#### 3. Create Project
```http
POST /orchestrator/project/create
Content-Type: application/json

{
  "user_id": "user123",
  "project_id": "proj456",
  "framework": "flutter",
  "project_name": "my_app"
}
```

#### 4. Get Project Context
```http
GET /orchestrator/project/proj456?user_id=user123
```

#### 5. List User Projects
```http
GET /orchestrator/projects?user_id=user123
```

#### 6. Delete Project
```http
DELETE /orchestrator/project/proj456?user_id=user123
```

---

## 🚀 Complete Usage Example

### Scenario: Create Social Media App → Download APK

```python
from ai.orchestrator.orchestrator import orchestrator
from ai.project_generator.generator import project_generator

# 1. Create Project
project = await project_generator.create_project(
    project_id="social_app_001",
    framework="flutter",
    project_name="social_media_app"
)

# 2. Execute Full Workflow
result = await orchestrator.execute_workflow(
    user_id="user123",
    project_id="social_app_001",
    workflow="full_cycle",
    params={
        "prompt": "Create a social media app with feed, posts and comments"
    }
)

# Result:
# {
#   "workflow": "full_cycle",
#   "steps": 5,
#   "results": [
#     {"agent": "ui_agent", "success": True},
#     {"agent": "code_agent", "success": True},
#     {"agent": "preview_agent", "success": True},
#     {"agent": "build_agent", "success": True},
#     {"agent": "deploy_agent", "success": True}
#   ],
#   "success": True
# }

# 3. Get Download URL
ctx = project_context.load("user123", "social_app_001")
print(f"Download: {ctx['deploy_url']}")
```

---

## 📊 System Statistics

```
Total Agents:               5
Workflows:                  3
Supported Frameworks:       4 (Flutter, React, Vue, HTML)
Project Templates:          3 (Flutter, React, Node)
API Endpoints:              7
Storage Systems:            2 (Memory + Disk)
Code Lines:              ~1,500
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
VIBEAI_PROJECT_DIR=/tmp/vibeai_projects
VIBEAI_CONTEXT_DIR=/tmp/vibeai_contexts
```

### Dependencies

```python
# backend/requirements.txt
fastapi>=0.104.0
openai>=1.3.0
pydantic>=2.5.0
```

---

## 🎯 Next Steps

### Phase 1 (Complete ✅)
- [x] Multi-Agent Orchestrator
- [x] 5 Specialized Agents
- [x] Project Context Memory
- [x] Project Generator
- [x] REST API

### Phase 2 (In Progress)
- [ ] App Builder Frontend UI
- [ ] WebSocket Real-time Updates
- [ ] Multi-User Dashboard

### Phase 3 (Planned)
- [ ] Cloud Storage Integration
- [ ] GitHub Integration
- [ ] CI/CD Pipeline
- [ ] Analytics & Monitoring

---

## 📚 Additional Resources

- **Examples:** See `EXAMPLES.py` for complete usage examples
- **API Docs:** Run server and visit `/docs`
- **Templates:** Check `ai/project_generator/templates/`

---

## 🎉 Summary

**VibeAI Multi-Agent Orchestrator** ist ein vollständiges System für AI-gesteuerte App-Entwicklung:

✅ Natural Language → UI Generation (GPT-4)  
✅ UI → Multi-Framework Code (Flutter/React/Vue/HTML)  
✅ Code → Live Preview (Hot Reload)  
✅ Preview → Build (APK/Web)  
✅ Build → Deploy (Download Links)  
✅ Complete Project Templates  
✅ Persistent Context Memory  
✅ Multi-User Support  

**Status: Production Ready** 🚀
