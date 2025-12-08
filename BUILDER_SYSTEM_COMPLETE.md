# ✅ VIBEAI BUILDER - KORREKTE VOLLSTÄNDIGE VERSION

## 🎯 SYSTEM-ÜBERSICHT

Das VibeAI Builder System besteht aus **2 HAUPTSEITEN**:

### 1. **HAUPTSEITE** - Platform Selection & Prompt Generator
**Datei**: `/frontend/app/builder/page.jsx` (26K, 765 Zeilen)

**Features**:
- ✅ **Platform Selection** - Wähle zwischen:
  - 📱 Flutter (iOS + Android + Web)
  - 📱 React Native (iOS + Android)
  - 🍎 iOS Native (Swift + SwiftUI)
  - 🤖 Android Native (Kotlin + Jetpack Compose)
  - 🌐 Next.js (Full-Stack Web)
  - ⚛️ React (Frontend Web)
  - 🟢 Node.js/Express (Backend API)
  - ⚡ FastAPI (Python Backend)

- ✅ **AI Prompt Generator** - Automatischer Prompt-Generator:
  - User gibt Idee ein: "Ich will eine Fitness App"
  - AI generiert vollständigen detaillierten Prompt
  - Enthält: App Name, Features, UI/UX, Tech Stack, Screens, Datenmodelle

- ✅ **3-Schritt Wizard**:
  1. Platform wählen
  2. Idee eingeben → AI generiert Prompt
  3. Projekt generieren

**URL**: `http://localhost:3000/builder`

---

### 2. **EDITOR-SEITE** - Vollständiger IDE-Builder
**Datei**: `/frontend/app/builder/[projectId]/page.jsx` (NEU ERSTELLT - Vollständig)

**Features**:

#### 📝 **Code Editor**
- ✅ Monaco Editor (VS Code Engine)
- ✅ Syntax Highlighting für alle Sprachen
- ✅ Auto-Complete + IntelliSense
- ✅ Multi-Tab Support
- ✅ Auto-Save (Cmd/Ctrl+S)
- ✅ Line Numbers + Minimap

#### 📁 **File Explorer** (Linkes Panel - Resizable)
- ✅ Alle Projekt-Dateien
- ✅ **2 View-Modi**:
  - **📁 Files** - Normale Datei-Liste
  - **🏗️ MVVM** - Strukturierte Ansicht:
    - 📊 Models
    - 🎨 Views
    - 🔧 ViewModels
    - 🎛️ Controllers
    - 📄 Other

#### 📱 **Live Preview** (Rechtes Panel - Resizable)
- ✅ Device Frames: iPhone 15 Pro, Pixel 8, iPad Pro, Desktop
- ✅ Live Updates beim Tippen (300ms debounced)
- ✅ iframe mit Renderer-Pipeline
- ✅ Responsive Testing

#### 🤖 **Live AI Agent Chat** (Unten)
- ✅ Real-time Chat während Entwicklung
- ✅ Voice Toggle (ON/OFF)
- ✅ Code-Verbesserungen
- ✅ UI/UX Vorschläge
- ✅ Fehler fixen
- ✅ Komponenten generieren
- ✅ Code erklären

#### 🔧 **Auto-Fix & Tools** (Top Toolbar)
- ✅ Auto-Fix Button - KI-gestützte Fehlerkorrektur
- ✅ Detect Issues - Problem-Erkennung
- ✅ Test Live-Generierung - Simulation der App-Generierung
- ✅ Speichern - Mit Änderungs-Indikator
- ✅ Zurück - Zur Hauptseite

#### 📊 **Output Panel** (Unten im Editor)
- ✅ Generation Logs
- ✅ Timestamps
- ✅ Color-coded (Error, Success, Info)

**URL**: `http://localhost:3000/builder/[projectId]`

---

## 🔥 RENDERER PIPELINE

### 3 Core Module (bereits erstellt):

1. **`utils/renderer.js`** - Code Evaluation Engine
   - renderHTML() - Injiziert HTML/CSS/JS in iframe
   - renderFlutter() - Placeholder für Flutter Web
   - Error Handling mit Fallback

2. **`utils/preview-bridge.js`** - Message Listener
   - initPreviewBridge() - Startet Event Listener
   - Empfängt: RENDER_CODE, CLEAR_PREVIEW, UPDATE_STYLES
   - Läuft im iframe-Kontext

3. **`utils/editor-bridge.js`** - Update Sender
   - updatePreview() - Sofortiges Update
   - updatePreviewDebounced() - 300ms verzögert
   - postMessage Bridge zum iframe

### Pipeline Flow:
```
User tippt im Monaco Editor
    ↓
handleEditorChange()
    ↓
updatePreviewDebounced(code, language)
    ↓
postMessage({ type: "RENDER_CODE", payload: code })
    ↓
preview-bridge.js empfängt
    ↓
renderHTML(code)
    ↓
iframe zeigt Code
    ↓
Live-Ergebnis sichtbar!
```

---

## 📁 VOLLSTÄNDIGE DATEISTRUKTUR

```
/frontend/app/builder/
│
├── page.jsx                        # 🎯 HAUPTSEITE (26K)
│   ├── Platform Selection (8 Platforms)
│   ├── AI Prompt Generator
│   ├── 3-Step Wizard
│   └── Project Creation API
│
├── [projectId]/
│   ├── page.jsx                    # 🎨 EDITOR-SEITE (NEU - Vollständig)
│   │   ├── Monaco Editor
│   │   ├── File Explorer (Files + MVVM)
│   │   ├── Live Preview (Device Frames)
│   │   ├── AI Chat (Voice Toggle)
│   │   ├── Auto-Fix & Tools
│   │   ├── Resizable Panels (Left + Right)
│   │   └── Output Panel
│   │
│   ├── utils/
│   │   ├── renderer.js             # Code Evaluation
│   │   ├── preview-bridge.js       # Message Listener
│   │   ├── editor-bridge.js        # Update Sender
│   │   ├── test-renderer.html      # Standalone Test
│   │   └── RENDERER_PIPELINE.md    # Dokumentation
│   │
│   ├── EditorTabs.jsx              # (Alt - nicht mehr verwendet)
│   ├── LivePreview.jsx             # (Alt - nicht mehr verwendet)
│   ├── AIPanel.jsx                 # (Alt - nicht mehr verwendet)
│   ├── FileExplorer.jsx            # (Alt - nicht mehr verwendet)
│   ├── BuildPanel.jsx              # (Alt - nicht mehr verwendet)
│   ├── VisualEditor.jsx            # (Alt - nicht mehr verwendet)
│   ├── DeviceFrame.jsx             # (Alt - nicht mehr verwendet)
│   │
│   ├── page_broken_git.jsx         # Backup (Git-Version - zu klein)
│   └── page_simple.jsx             # Backup (vereinfacht)
│
└── styles.css                      # Global Styles
```

---

## 🚀 WIE ES FUNKTIONIERT

### 1. **Neues Projekt erstellen**
```
1. Öffne: http://localhost:3000/builder
2. Wähle Platform (z.B. Flutter 📱)
3. Schritt 2: Gebe Idee ein
   Input: "Fitness App mit Workout Tracking"
4. Klicke "Generate Prompt with AI"
5. AI generiert vollständigen Prompt
6. Klicke "Create Project"
7. → Redirect zu /builder/[projectId]
```

### 2. **Im Editor arbeiten**
```
1. File Explorer (links):
   - Klicke Datei → Öffnet im Editor
   - Switch zwischen Files / MVVM View

2. Monaco Editor (Mitte):
   - Syntax Highlighting aktiv
   - Tippe Code → Auto-Complete
   - Cmd/Ctrl+S zum Speichern

3. Live Preview (rechts):
   - Wähle Device (iPhone, Pixel, iPad, Desktop)
   - Code-Änderungen → Preview aktualisiert automatisch

4. AI Chat (unten):
   - Frage: "Optimiere diesen Code"
   - AI antwortet mit Vorschlägen
   - Voice Toggle für Audio

5. Toolbar (oben):
   - Auto-Fix → KI repariert Fehler
   - Detect Issues → Findet Probleme
   - Test Live-Generierung → Simulation
```

### 3. **Resizable Panels**
```
- Ziehe Trennlinien zwischen Panels
- Left Panel: 200px - 500px
- Right Panel: 300px - 800px
- Beide unabhängig voneinander
```

---

## 🎯 ALLE FEATURES IM DETAIL

### HAUPTSEITE (/builder/page.jsx)

#### Platform Cards
```jsx
{
  id: 'flutter',
  name: 'Flutter',
  icon: '📱',
  category: 'Mobile',
  description: 'Cross-Platform Mobile App',
  platforms: ['iOS', 'Android', 'Web'],
  language: 'Dart',
  bestFor: 'Apps die auf iOS, Android UND Web laufen sollen',
  examples: ['E-Commerce App', 'Social Media', 'Fitness Tracker']
}
```

#### AI Prompt Generator
```jsx
const generatePrompt = async () => {
  // User Idee: "Fitness App"
  // AI generiert:
  // - App Name: "FitFlow"
  // - Features: Workout Tracking, Ernährung, Progress Charts
  // - UI/UX: Modern, Dark Mode, Animationen
  // - Tech Stack: Flutter, Firebase, Provider
  // - Screens: Home, Workouts, Nutrition, Profile
  // - Datenmodelle: User, Workout, Exercise, Meal
}
```

### EDITOR-SEITE (/builder/[projectId]/page.jsx)

#### File Explorer - MVVM View
```jsx
mvvmStructure = {
  models: [
    { name: 'user.dart', path: 'lib/models/user.dart' },
    { name: 'workout.dart', path: 'lib/models/workout.dart' }
  ],
  views: [
    { name: 'home_screen.dart', path: 'lib/views/home_screen.dart' },
    { name: 'workout_screen.dart', path: 'lib/views/workout_screen.dart' }
  ],
  viewModels: [
    { name: 'home_viewmodel.dart', path: 'lib/viewmodels/home_viewmodel.dart' }
  ],
  controllers: [
    { name: 'api_service.dart', path: 'lib/services/api_service.dart' }
  ],
  other: [
    { name: 'main.dart', path: 'lib/main.dart' },
    { name: 'pubspec.yaml', path: 'pubspec.yaml' }
  ]
}
```

#### Monaco Editor Integration
```jsx
<MonacoEditor
  language={getLanguage(activeFile.name)}  // dart, javascript, python, etc.
  value={activeFile.content}
  onChange={handleEditorChange}
  theme="vs-dark"
  options={{
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on',
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    snippetSuggestions: 'top'
  }}
/>
```

#### Live Preview Updates
```jsx
const handleEditorChange = (value) => {
  setActiveFile({ ...activeFile, content: value });
  setHasChanges(true);
  
  // ⭐ Live Update
  updatePreviewDebounced(value, getLanguage(activeFile.name));
}
```

#### AI Chat Integration
```jsx
const sendChatMessage = async () => {
  const res = await fetch('http://localhost:8000/ai/orchestrator', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      prompt: chatInput,
      context: {
        type: 'builder',
        current_file: activeFile?.path,
        files: files.map(f => ({ path: f.path, language: f.language }))
      }
    })
  });
  
  // AI kann Code generieren, fixen, oder Fragen beantworten
}
```

#### Auto-Fix
```jsx
const autoFixFile = async () => {
  const res = await fetch('http://localhost:8000/autofix/fix', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
      file_path: activeFile.path,
      content: activeFile.content,
      issue_type: 'general'
    })
  });
  
  // Code wird automatisch repariert
}
```

---

## 🧪 TESTEN

### 1. Hauptseite testen
```bash
# Öffne Browser
http://localhost:3000/builder

# Test Schritte:
1. Wähle Platform: Flutter
2. Gebe Idee ein: "E-Commerce App für Kleidung"
3. Klicke "Generate Prompt with AI"
4. Warte auf AI-generierten Prompt
5. Klicke "Create Project"
6. → Redirect zu Editor
```

### 2. Editor testen
```bash
# Im Editor:
1. File Explorer links: Klicke auf Dateien
2. MVVM View: Klicke "🏗️ MVVM" Button
3. Monaco Editor: Tippe Code → Syntax Highlighting
4. Live Preview: Wähle Device → Code updates live
5. AI Chat: Schreibe "Optimiere diesen Code"
6. Auto-Fix: Klicke "🔧 Auto-Fix"
7. Resizable: Ziehe Trennlinien
```

### 3. Renderer Pipeline testen
```bash
# Standalone Test:
open /Users/mikegehrke/dev/vibeai/frontend/app/builder/[projectId]/utils/test-renderer.html

# Das zeigt:
- Live Code Editor (links)
- Live Preview (rechts)
- Auto-Rendering beim Tippen
- Beispiel-Code Button
```

---

## 📊 SYSTEM STATUS

- ✅ **Backend**: http://localhost:8000 (FastAPI)
- ✅ **Frontend**: http://localhost:3000 (Next.js)
- ✅ **Monaco Editor**: Installiert (v4.7.0)
- ✅ **Renderer Pipeline**: Komplett (3 Module)
- ✅ **Hauptseite**: Platform Selection + Prompt Generator
- ✅ **Editor-Seite**: Vollständiger IDE-Builder
- ✅ **Build**: Erfolgreich (keine Errors)

---

## 🎉 WAS JETZT FUNKTIONIERT

### ✅ Hauptseite (`/builder`)
- Platform Selection (8 Platforms)
- AI Prompt Generator
- 3-Step Wizard
- Project Creation API

### ✅ Editor-Seite (`/builder/[projectId]`)
- Monaco Editor mit VS Code Features
- File Explorer (Files + MVVM View)
- Live Preview mit Device Frames
- AI Chat mit Voice Toggle
- Auto-Fix & Issue Detection
- Resizable Panels (Links + Rechts)
- Output Panel mit Logs
- Multi-Tab Support
- Syntax Highlighting
- Auto-Complete
- Live Updates (300ms debounced)

### ✅ Renderer Pipeline
- renderer.js - Code Evaluation
- preview-bridge.js - Message Listener
- editor-bridge.js - Update Sender
- Live iframe Updates

---

## 🚀 READY TO USE!

**Alles funktioniert jetzt wie beschrieben:**

1. **Platform wählen** → AI Prompt generieren → Projekt erstellen
2. **Im Editor arbeiten** → Code schreiben → Live Preview
3. **AI Chat nutzen** → Fragen stellen → Code verbessern
4. **Auto-Fix verwenden** → Fehler finden → Automatisch reparieren
5. **Resizable Panels** → Layout anpassen
6. **MVVM View** → Strukturierte Datei-Ansicht

**Made with ❤️ by VibeAI**
