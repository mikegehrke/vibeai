# ============================================================
# VIBEAI – FULL CYCLE SYSTEM DOCUMENTATION
# ============================================================

## 🚀 FULL CYCLE ARCHITECTURE

### Complete Pipeline:
```
User Prompt
    ↓
AI Model (GPT-4)
    ↓
UI Structure (JSON)
    ↓
Preview Renderer
    ↓
HTML Preview (IFRAME)
    ↓
Code Generator
    ↓
Flutter/React/Vue Code
    ↓
Build System
    ↓
APK/App Bundle
    ↓
Download Link
```

---

## 📦 SYSTEM COMPONENTS

### 1. AI UI Generator (`ai/ui_generator.py`)
- **Input**: Natural language prompt
- **Process**: GPT-4 generates UI structure
- **Output**: JSON component structure

**Example:**
```python
prompt = "Login screen with email and password"
result = await ai_ui_generator.generate_ui_from_prompt(
    prompt=prompt,
    framework="flutter",
    style="material"
)
# Returns: { screen, html_preview, code }
```

### 2. Preview Renderer (`preview/preview_renderer.py`)
- **Input**: UI structure (JSON)
- **Process**: Renders to HTML
- **Output**: Complete HTML page

**Example:**
```python
html = preview_renderer.render_screen_html(
    screen=ui_structure,
    style="tailwind"
)
# Returns: "<html><body>...</body></html>"
```

### 3. Code Generator (`ai/ui_generator.py` - CodeGenerator)
- **Input**: UI structure + framework
- **Process**: Generates framework-specific code
- **Output**: Flutter/React/Vue code

**Supported Frameworks:**
- Flutter (Dart)
- React (JSX)
- Vue (Template)
- HTML (Static)

### 4. Build System (`buildsystem/`)
- **Input**: Code files
- **Process**: Compiles to APK/App
- **Output**: Downloadable artifacts

**Build Types:**
- flutter_apk
- flutter_web
- react_web
- vue_web

---

## 🔌 API ENDPOINTS

### AI UI Generator

#### POST `/ai/generate_ui`
Generate UI from natural language prompt.

**Request:**
```json
{
    "prompt": "Create a login screen with email and password",
    "framework": "flutter",
    "style": "material"
}
```

**Response:**
```json
{
    "success": true,
    "screen": {
        "name": "LoginScreen",
        "components": [
            { "type": "heading", "text": "Login" },
            { "type": "input", "props": { "placeholder": "Email" } },
            { "type": "input", "props": { "placeholder": "Password" } },
            { "type": "button", "text": "Login" }
        ]
    },
    "html_preview": "<html>...</html>",
    "code": "class LoginScreen extends StatelessWidget...",
    "framework": "flutter"
}
```

#### POST `/ai/suggest_components`
Get component suggestions based on description.

**Request:**
```json
{
    "description": "I need a user profile form",
    "existing_components": [...]
}
```

**Response:**
```json
{
    "success": true,
    "components": [
        { "type": "heading", "text": "Profile" },
        { "type": "input", "props": { "placeholder": "Name" } },
        { "type": "button", "text": "Save" }
    ]
}
```

#### POST `/ai/improve_ui`
Improve existing UI based on request.

**Request:**
```json
{
    "screen": { ... },
    "improvement_request": "Make it more modern and add icons"
}
```

**Response:**
```json
{
    "success": true,
    "screen": { ... improved ... },
    "html_preview": "<html>...</html>"
}
```

#### POST `/ai/generate_app`
Generate complete multi-screen app.

**Request:**
```json
{
    "app_description": "E-commerce app with products, cart, and checkout",
    "framework": "flutter"
}
```

**Response:**
```json
{
    "success": true,
    "app_name": "MyEcommerceApp",
    "screens": [...],
    "navigation": {...},
    "theme": {...},
    "code_files": {
        "HomeScreen.dart": "...",
        "ProductScreen.dart": "...",
        "CartScreen.dart": "..."
    }
}
```

### Preview System

#### POST `/preview/render_screen`
Render screen to HTML for live preview.

**Request:**
```json
{
    "screen": {
        "name": "LoginScreen",
        "components": [...],
        "style": "tailwind"
    }
}
```

**Response:**
```json
{
    "success": true,
    "html": "<html>...</html>",
    "screen_name": "LoginScreen"
}
```

#### POST `/preview/render_component`
Render single component to HTML.

**Request:**
```json
{
    "component": {
        "type": "button",
        "text": "Click me",
        "props": { "color": "#007acc" }
    },
    "style": "tailwind"
}
```

**Response:**
```json
{
    "success": true,
    "html": "<button style=\"...\">Click me</button>"
}
```

### Build System

#### POST `/build/start`
Start app build.

**Request:**
```json
{
    "build_type": "flutter_apk",
    "code_files": {
        "LoginScreen.dart": "..."
    }
}
```

**Response:**
```json
{
    "success": true,
    "build_id": "build_123456",
    "status": "queued"
}
```

#### GET `/build/{build_id}/download`
Download build artifacts (APK/ZIP).

---

## 🎯 FRONTEND INTEGRATION

### Components

1. **AIUIGenerator** (`components/AIUIGenerator.jsx`)
   - Natural language input
   - Framework/Style selection
   - Live preview
   - Code export
   - Build trigger

2. **AppBuilderPreview** (`components/AppBuilderPreview.jsx`)
   - IFRAME preview
   - Auto-refresh
   - Error handling

3. **ScreenBuilder** (`components/ScreenBuilder.jsx`)
   - Visual component tree
   - Drag & drop (planned)
   - Property editor

4. **FullCycleDemo** (`pages/demo/FullCycleDemo.jsx`)
   - Complete pipeline demonstration
   - Step-by-step visualization
   - Progress tracking

### Hooks

1. **usePreview** (`hooks/usePreview.js`)
   - Preview server management
   - WebSocket logs
   - Auto-restart

2. **useBuildLogs** (`hooks/useBuildLogs.js`)
   - Live build logs
   - Progress tracking
   - Artifact download

---

## 🔄 COMPLETE FLOW EXAMPLE

### 1. User Input
```jsx
<AIUIGenerator
    onGenerate={(screen) => setScreen(screen)}
    onBuild={(buildData) => startBuild(buildData)}
/>
```

### 2. AI Generation
```javascript
const res = await fetch("/ai/generate_ui", {
    method: "POST",
    body: JSON.stringify({
        prompt: "Login screen",
        framework: "flutter"
    })
});
const { screen, html_preview, code } = await res.json();
```

### 3. Preview
```jsx
<iframe srcDoc={html_preview} />
```

### 4. Code Display
```jsx
<CodeEditor value={code} language="dart" />
```

### 5. Build
```javascript
const buildRes = await fetch("/build/start", {
    method: "POST",
    body: JSON.stringify({
        build_type: "flutter_apk",
        code_files: { "LoginScreen.dart": code }
    })
});
const { build_id } = await buildRes.json();
```

### 6. Download
```jsx
<a href={`/build/${build_id}/download`} download>
    Download APK
</a>
```

---

## 🎨 UI COMPONENT STRUCTURE

### Component Types
- **heading**: Large text (h1-h6)
- **text**: Regular text/paragraph
- **button**: Action button
- **input**: Text input field
- **image**: Image display
- **container**: Layout container

### Component Schema
```json
{
    "type": "button",
    "text": "Click me",
    "props": {
        "color": "#007acc",
        "size": "medium",
        "variant": "primary"
    },
    "children": []
}
```

---

## 🚀 DEPLOYMENT

### Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd studio
npm run dev
```

### Required Environment Variables
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

---

## 📊 PERFORMANCE

### Benchmarks
- AI Generation: ~2-5 seconds
- HTML Preview: <100ms
- Code Generation: <500ms
- Build (Flutter APK): ~60-120 seconds
- Build (Web): ~10-30 seconds

### Optimizations
- ✅ Cached AI responses
- ✅ Incremental builds
- ✅ WebSocket streaming
- ✅ Lazy loading
- ✅ Code splitting

---

## 🔒 SECURITY

### API Authentication
All endpoints require authentication via JWT token.

### Rate Limiting
- AI endpoints: 10 requests/minute
- Build endpoints: 5 builds/hour (free tier)
- Preview endpoints: Unlimited

### Sandboxing
- IFRAME preview uses `sandbox` attribute
- Build processes run in isolated containers
- User code validation before execution

---

## 📈 ROADMAP

### Phase 1 (Current) ✅
- AI UI Generation
- HTML Preview
- Code Generation (Flutter, React, Vue)
- Build System
- Download Artifacts

### Phase 2 (Planned)
- [ ] Drag & Drop UI Builder
- [ ] Real-time collaboration
- [ ] Template marketplace
- [ ] Version control integration
- [ ] Advanced AI customization

### Phase 3 (Future)
- [ ] Mobile emulator integration
- [ ] A/B testing
- [ ] Analytics dashboard
- [ ] Plugin system
- [ ] White-label solution

---

## 🆘 TROUBLESHOOTING

### AI Generation Fails
- Check OpenAI API key
- Verify prompt length (<2000 chars)
- Check rate limits

### Preview Not Loading
- Verify `/preview/render_screen` endpoint
- Check CORS settings
- Inspect browser console

### Build Fails
- Check code syntax
- Verify dependencies
- Check build logs in `/build/{id}/logs`

---

## 📚 ADDITIONAL RESOURCES

- API Documentation: `/docs` (FastAPI Swagger)
- WebSocket Events: See `preview/preview_ws.py`
- Component Library: See `ComponentLibrary.js`
- Build Types: See `buildsystem/build_validation.py`

---

**Created**: December 2025  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
