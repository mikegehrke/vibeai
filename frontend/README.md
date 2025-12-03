# VIBEAI APP BUILDER FRONTEND

**Next.js-based visual development environment with AI assistance**

---

## 🎯 Overview

Complete app builder UI that combines:
- **Monaco Code Editor** (VS Code engine)
- **Live Preview** (Web + Flutter)
- **AI Assistant** (Real-time chat)
- **File Explorer** (Project tree)

**Think: VS Code + Figma + ChatGPT in one interface**

---

## 🏗️ Architecture

```
frontend/
├── app/
│   ├── layout.jsx              # Root layout
│   ├── page.jsx                # Landing page
│   ├── globals.css             # Global styles
│   └── builder/
│       └── [projectId]/
│           ├── page.jsx        # ⭐ Main builder layout
│           ├── FileExplorer.jsx    # 📁 File tree
│           ├── EditorTabs.jsx      # 💻 Monaco editor
│           ├── LivePreview.jsx     # 🔴 Live preview
│           ├── AIPanel.jsx         # 🤖 AI assistant
│           └── styles.css          # Builder styles
├── package.json
├── next.config.js
└── README.md
```

---

## 📦 Grid Layout

```
┌─────────────┬──────────────────┬─────────────┐
│             │                  │             │
│  File       │  Code Editor     │  Live       │
│  Explorer   │  (Monaco)        │  Preview    │
│  250px      │  (flexible)      │  400px      │
│             │                  │             │
├─────────────┴──────────────────┴─────────────┤
│                                               │
│  AI Assistant Chat Panel                      │
│  230px height                                 │
│                                               │
└───────────────────────────────────────────────┘
```

**CSS Grid:**
- Columns: `250px 1fr 400px`
- Rows: `1fr 230px`
- Total: 100vh x 100vw

---

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

---

## 🎨 Components

### 1. FileExplorer.jsx

**Purpose:** Display project file tree

**Features:**
- Lists all files via API
- File icons by extension
- Click to open in editor
- Active file highlighting
- Custom event dispatching

**API Endpoint:**
```
GET /api/files/list?projectId={id}
```

**Response:**
```json
{
  "files": [
    "src/App.jsx",
    "src/components/Header.jsx",
    "package.json"
  ]
}
```

**File Icons:**
- 📄 `.js` / `.jsx`
- 🔷 `.ts` / `.tsx`
- 🎨 `.css`
- 🌐 `.html`
- 🐍 `.py`
- 🎯 `.dart`

---

### 2. EditorTabs.jsx

**Purpose:** Monaco code editor with multi-tab support

**Features:**
- Monaco Editor integration
- Multi-file tabs
- Syntax highlighting
- IntelliSense
- Auto-save indicator
- Keyboard shortcuts (Cmd+S)
- Language detection

**API Endpoints:**

**Read File:**
```
POST /api/files/read
{
  "projectId": "demo-project",
  "file": "src/App.jsx"
}
```

**Write File:**
```
POST /api/files/write
{
  "projectId": "demo-project",
  "file": "src/App.jsx",
  "content": "..."
}
```

**Monaco Options:**
```javascript
{
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: 'on',
  wordWrap: 'on',
  quickSuggestions: true,
  snippetSuggestions: 'top'
}
```

---

### 3. LivePreview.jsx

**Purpose:** Real-time preview of web/Flutter apps

**Features:**
- Web preview (iframe)
- Flutter preview support
- Hot reload
- Refresh button
- Open in new tab
- Error handling

**API Endpoint:**
```
POST /preview/start_web
{
  "project_id": "demo-project"
}
```

**Response:**
```json
{
  "preview_url": "http://localhost:5173",
  "status": "running"
}
```

**Preview Types:**
- `web` - React, Next.js, HTML
- `flutter` - Flutter web/mobile

---

### 4. AIPanel.jsx ⭐ CRITICAL

**Purpose:** Live AI assistant during development

**Features:**
- Real-time chat with AI
- Code improvement suggestions
- UI optimization tips
- Build error explanations
- Auto-generate components
- Direct file modifications
- Context-aware responses

**API Endpoint:**
```
POST /ai/orchestrator
{
  "project_id": "demo-project",
  "prompt": "Improve the button styling",
  "context": {
    "type": "builder",
    "action": "chat"
  }
}
```

**Example Prompts:**
- "Add a dark mode toggle"
- "Optimize the header component"
- "Fix the build errors"
- "Generate a contact form"
- "Refactor this function"
- "Add TypeScript types"

**AI Capabilities:**
- ✅ Code review
- ✅ UI suggestions
- ✅ Performance tips
- ✅ Security checks
- ✅ Component generation
- ✅ Bug fixes
- ✅ Refactoring

---

## 🔌 Backend Integration

### API Base URL

Development: `http://localhost:8000`

### Required Endpoints

**File Operations:**
- `GET /api/files/list?projectId={id}` - List files
- `POST /api/files/read` - Read file content
- `POST /api/files/write` - Write file content

**Preview:**
- `POST /preview/start_web` - Start web preview
- `POST /preview/start_flutter` - Start Flutter preview

**AI Orchestrator:**
- `POST /ai/orchestrator` - AI chat & commands

### Proxy Configuration

Next.js automatically proxies API calls:

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/api/:path*'
    }
  ]
}
```

---

## 🎯 User Flow

### 1. Open Builder

```
User → http://localhost:3000/builder/demo-project
```

### 2. File Explorer Loads

```
FileExplorer → GET /api/files/list
Backend → Returns file list
FileExplorer → Displays files with icons
```

### 3. User Clicks File

```
FileExplorer → Dispatch 'fileSelected' event
EditorTabs → Listen for event
EditorTabs → POST /api/files/read
Monaco → Display file content
```

### 4. User Edits Code

```
Monaco → onChange event
EditorTabs → Update state
EditorTabs → Show "Save *" indicator
```

### 5. User Saves

```
User → Click "Save" or Cmd+S
EditorTabs → POST /api/files/write
Backend → Write file to disk
EditorTabs → Show "Saved" indicator
```

### 6. Preview Updates

```
LivePreview → iframe hot reload
Preview → Shows updated app
```

### 7. AI Assistance

```
User → Type in AI Panel: "Add dark mode"
AIPanel → POST /ai/orchestrator
Backend → Multi-agent processes request
AI → Returns code + suggestions
AIPanel → Display response
AI (optional) → Directly writes files
Preview → Auto-updates
```

---

## 🤖 AI Assistant Workflow

### Parallel Development

**While you code:**
- AI monitors changes
- Suggests improvements
- Catches errors early
- Proposes optimizations

**Example:**

```
You: *editing Header.jsx*

AI: 💡 Suggestion: Add PropTypes validation
AI: 💡 Tip: Use semantic HTML (<header> tag)
AI: 🔍 Performance: Memoize this component

You: "Generate a footer component"

AI: ✅ Created components/Footer.jsx
AI: ✅ Updated App.jsx imports
AI: ✅ Added responsive styles
```

### Context Awareness

AI knows:
- Current open files
- Project framework (React/Next/Flutter)
- File structure
- Dependencies
- Build status

---

## 🎨 Styling & Theme

### Dark Theme

```css
--bg-primary: #181818
--bg-secondary: #1e1e1e
--bg-tertiary: #252525
--border: #333
--text-primary: #fff
--text-secondary: #ccc
--text-muted: #666
--accent: #4fc3f7
--ai-accent: #9c27b0
```

### Responsive Design

Currently optimized for desktop. Responsive layout planned.

---

## 📊 Performance

### Monaco Editor

- Lazy loaded
- Single instance
- Virtual scrolling
- Syntax worker threads

### Preview

- Sandboxed iframe
- Isolated context
- Hot reload ready

### AI Chat

- Async requests
- Message streaming (future)
- Optimistic UI updates

---

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Monaco Language Support

Currently supported:
- JavaScript
- TypeScript
- JSON
- CSS
- HTML
- Markdown
- Python
- Dart
- YAML

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel
```

### Environment

Set `NEXT_PUBLIC_API_URL` to production backend URL.

---

## 🎯 Future Enhancements

### Planned Features

- [ ] Multi-user collaboration (real-time)
- [ ] Git integration (commit/push from UI)
- [ ] Terminal panel (integrated shell)
- [ ] Component library browser
- [ ] Design mode (visual editor)
- [ ] Mobile responsive layout
- [ ] Keyboard shortcuts panel
- [ ] Theme customization
- [ ] Plugin system
- [ ] AI code completion (inline)

---

## 🐛 Troubleshooting

### Monaco Editor Not Loading

**Issue:** White screen in editor

**Solution:**
```bash
npm install @monaco-editor/react
```

### Preview Not Working

**Issue:** Iframe blocked

**Solution:** Check CORS in backend, ensure preview server running

### AI Panel Offline

**Issue:** Red indicator

**Solution:**
```bash
# Check backend running
curl http://localhost:8000/health

# Check orchestrator endpoint
curl -X POST http://localhost:8000/ai/orchestrator
```

### File Operations Failing

**Issue:** Files not loading/saving

**Solution:** Verify API endpoints in backend:
```python
# backend/main.py
app.include_router(file_router)  # Ensure registered
```

---

## 📝 Development Tips

### Hot Reload

Save files → Next.js auto-reloads → Changes instant

### Browser DevTools

- Network tab → Monitor API calls
- Console → Check errors
- React DevTools → Inspect components

### Backend Logs

```bash
cd backend
python main.py
# Watch terminal for API requests
```

---

## ✅ Testing Checklist

- [ ] File Explorer loads files
- [ ] Click file → Opens in editor
- [ ] Edit code → Shows "Save *"
- [ ] Save file → Updates on disk
- [ ] Preview iframe loads
- [ ] AI chat responds
- [ ] Monaco syntax highlighting works
- [ ] Multiple tabs work
- [ ] Refresh preview works
- [ ] AI suggestions appear

---

## 🎉 Status

**✅ COMPLETE** - All core components implemented

**Features:**
- ✅ Grid layout with 4 panels
- ✅ File Explorer with icons
- ✅ Monaco Editor with multi-tabs
- ✅ Live Preview with iframe
- ✅ AI Assistant with chat
- ✅ Next.js 14 App Router
- ✅ Backend API integration
- ✅ Responsive styling
- ✅ Error handling

**Ready for:**
- Block 11: File Writer + Project Manager
- Block 12: AI Action Panel
- Block 13: Everything Connected

---

## 🌟 The Vision

**You build the app.**  
**AI builds it better.**

While you code in the center, AI watches from the right:
- Suggests improvements
- Catches bugs
- Optimizes performance
- Generates boilerplate
- Reviews code quality

**Like pair programming with a senior developer who never sleeps.**

---

Built with ❤️ by VibeAI
