# ⚡ QUICK START - VIBEAI APP BUILDER

**Get the App Builder running in 2 minutes**

---

## 📋 Prerequisites

✅ Node.js 18+  
✅ Python 3.9+  
✅ Backend running on port 8000

---

## 🚀 Installation

### 1. Install Dependencies

```bash
cd /Users/mikegehrke/dev/vibeai/frontend
npm install
```

**Installs:**
- Next.js 14
- React 18
- Monaco Editor
- ESLint

---

## 🎯 Start Development Server

```bash
npm run dev
```

**Output:**
```
✓ Ready in 2.1s
○ Local:    http://localhost:3000
```

---

## 🌐 Open App Builder

### Landing Page

```
http://localhost:3000
```

Click **"🚀 Open Builder"**

### Direct Builder Access

```
http://localhost:3000/builder/demo-project
```

Replace `demo-project` with any project ID.

---

## 🔌 Backend Connection

### Ensure Backend Running

```bash
cd /Users/mikegehrke/dev/vibeai/backend
python main.py
```

**Expected:**
```
✅ Server running on port 8000
```

### Test API

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

---

## 🎨 Builder Interface

### Layout Overview

```
┌─────────────┬──────────────────┬─────────────┐
│ 📁 Files    │ 💻 Editor        │ 🔴 Preview  │
├─────────────┴──────────────────┴─────────────┤
│ 🤖 AI Assistant Chat                         │
└──────────────────────────────────────────────┘
```

### Workflow

1. **Select File** → File Explorer (left)
2. **Edit Code** → Monaco Editor (center)
3. **See Changes** → Live Preview (right)
4. **Get Help** → AI Chat (bottom)

---

## 🤖 AI Assistant Usage

### Example Prompts

```
"Add a dark mode toggle"
"Optimize the header component"
"Generate a contact form"
"Fix TypeScript errors"
"Add responsive styles"
```

### AI Features

- ✅ Code suggestions
- ✅ Error fixes
- ✅ Component generation
- ✅ Performance tips
- ✅ Best practices

---

## 📝 File Operations

### Read File

1. Click file in File Explorer
2. File opens in Monaco Editor
3. Edit freely

### Save File

**Method 1:** Click "💾 Save" button  
**Method 2:** Press `Cmd + S` (Mac) or `Ctrl + S` (Windows)

### Create New File

Currently via backend API. UI coming soon.

---

## 🔴 Live Preview

### Web Preview

Automatically starts when builder loads:
- React apps
- Next.js apps
- HTML/CSS/JS

### Refresh

Click **🔄** button in preview header

### Open in New Tab

Click **🔗** button in preview header

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save file |
| `Cmd/Ctrl + F` | Find in file |
| `Cmd/Ctrl + H` | Replace |
| `Cmd/Ctrl + /` | Toggle comment |
| `Alt + Up/Down` | Move line |
| `Cmd/Ctrl + D` | Duplicate line |

---

## 🐛 Common Issues

### Monaco Editor White Screen

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Preview Not Loading

**Check:**
1. Backend running? `curl http://localhost:8000/health`
2. Preview endpoint? `curl -X POST http://localhost:8000/preview/start_web`
3. CORS enabled in backend?

### AI Chat Offline (Red Indicator)

**Fix:**
1. Ensure orchestrator running
2. Test: `curl -X POST http://localhost:8000/ai/orchestrator`
3. Check backend logs

### Files Not Loading

**Check:**
1. File API endpoints registered
2. Project ID correct
3. Files exist in project directory

---

## 📦 Project Structure

```
frontend/
├── app/
│   ├── page.jsx                    # Landing page
│   ├── layout.jsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── builder/
│       └── [projectId]/
│           ├── page.jsx            # Builder layout
│           ├── FileExplorer.jsx    # File tree
│           ├── EditorTabs.jsx      # Code editor
│           ├── LivePreview.jsx     # Preview panel
│           ├── AIPanel.jsx         # AI chat
│           └── styles.css          # Styles
├── package.json                    # Dependencies
├── next.config.js                  # Next.js config
└── README.md                       # Full docs
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 🌐 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/files/list` | GET | List project files |
| `/api/files/read` | POST | Read file content |
| `/api/files/write` | POST | Save file content |
| `/preview/start_web` | POST | Start web preview |
| `/ai/orchestrator` | POST | AI chat requests |

---

## 🎯 Next Steps

### After Getting It Running

1. ✅ Explore the interface
2. ✅ Try editing a file
3. ✅ Chat with AI
4. ✅ See live preview
5. ✅ Save changes

### Advanced Usage

- Create new project via API
- Use different frameworks
- Build & deploy apps
- AI-powered refactoring

---

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Environment Variables

Set in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend.com
```

---

## 📞 Support

### Issues?

1. Check backend running
2. Check browser console
3. Check backend logs
4. Clear cache: `rm -rf .next`

### Logs

```bash
# Frontend
npm run dev
# Watch terminal

# Backend
cd ../backend
python main.py
# Watch terminal
```

---

## ✅ Verification Checklist

Before reporting issues:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Backend running on port 8000
- [ ] `http://localhost:3000` opens
- [ ] File Explorer shows files
- [ ] Monaco Editor loads
- [ ] Preview iframe visible
- [ ] AI chat responds
- [ ] No console errors

---

## 🎉 You're Ready!

The App Builder is running. Now:

1. **Build** your app visually
2. **Code** with Monaco Editor
3. **Preview** changes live
4. **Chat** with AI for help

**Happy building!** 🚀

---

Built with ❤️ by VibeAI
