# 🚀 VibeAI - Premium AI App Development Studio

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18.0+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)

**VibeAI** ist ein vollständiges AI-gestütztes App Development Studio für Flutter/Dart Entwicklung mit Echtzeit-Preview, Monaco Code Editor, Git Integration und AI Chat Assistant.

## ✨ Features

### 🎨 3 Komplette Studios
1. **App Builder** - Vollständige App-Generierung mit MVVM-Struktur
2. **Code Studio** - Professioneller Code Editor mit Live Preview
3. **App Studio** - Komplette App-Verwaltung und Testing

### 🤖 AI-Features
- ✅ **GPT-4o Integration** - Intelligente Code-Generierung
- ✅ **AI Chat Assistant** - ChatGPT-like Konversationen mit History
- ✅ **Auto Code Fixing** - Automatische Fehlerbehebung
- ✅ **Code Improvement** - AI-gestützte Optimierungen
- ✅ **Live Build Streaming** - Schritt-für-Schritt Build-Visualisierung

### 💻 Editor Features
- ✅ **Monaco Editor** - VS Code-like Editing Experience
- ✅ **Syntax Highlighting** - Dart, JavaScript, Python, JSON, YAML
- ✅ **Auto-Completion** - IntelliSense für alle Sprachen
- ✅ **File Tree** - Interaktive Dateistruktur
- ✅ **Multi-File Support** - Mehrere Dateien gleichzeitig bearbeiten

### 📱 Preview Features
- ✅ **Live Preview** - Echtzeit App-Vorschau
- ✅ **Interactive Emulator** - Echte funktionierende Timer-App
- ✅ **Fullscreen Mode** - Emulator in neuem Fenster
- ✅ **Device Frames** - iPhone, Android, Web Previews
- ✅ **Hot Reload Simulation** - Code-Änderungen sofort sichtbar

### 🔧 Git Integration
- ✅ **Git Status** - Änderungen anzeigen
- ✅ **Commit & Push** - Direkt aus dem Studio
- ✅ **GitHub Integration** - Repository erstellen
- ✅ **Branch Management** - Branches wechseln und erstellen
- ✅ **GitPanel Component** - Wiederverwendbare Git-UI

### 💬 AI Chat System
- ✅ **Conversation History** - Vollständiger Chat-Verlauf
- ✅ **Context Memory** - AI erinnert sich an alles
- ✅ **Message Bubbles** - ChatGPT-like Interface
- ✅ **Timestamps** - Wann wurde was gesagt
- ✅ **Auto-Scroll** - Immer neueste Nachricht sichtbar

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Python 3.9+ Web Framework
- **OpenAI GPT-4o** - AI Code Generation
- **Uvicorn** - ASGI Server
- **Python dotenv** - Environment Management

### Frontend
- **React 18** - UI Framework
- **Vite** - Build Tool & Dev Server
- **Monaco Editor** - Code Editor (wie VS Code)
- **React Icons** - Icon Library
- **JSZip** - ZIP Download Support

## 📦 Installation

### 1. Repository klonen
```bash
git clone https://github.com/yourusername/vibeai.git
cd vibeai
```

### 2. Backend Setup
```bash
cd backend

# Virtual Environment erstellen
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# oder
venv\Scripts\activate     # Windows

# Dependencies installieren
pip install -r requirements.txt

# .env Datei erstellen
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

### 3. Frontend Setup
```bash
cd studio

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

## 🚀 Verwendung

### Backend starten (Port 8005)
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8005
```

### Frontend starten (Port 5176)
```bash
cd studio
npm run dev
```

### Öffnen
- **Frontend**: http://localhost:5176
- **Backend API**: http://localhost:8005
- **API Docs**: http://localhost:8005/docs

## 📖 API Endpoints

### Code Generation
- `POST /api/generate-project` - MVVM Projekt generieren
- `POST /api/build-complete-app` - Komplette App mit Store Assets
- `POST /api/fix-errors` - Fehler automatisch beheben
- `POST /api/improve-code` - Code mit AI verbessern (mit Conversation History)
- `POST /api/explain-code` - Code erklären lassen

### Git Operations
- `POST /api/git/status` - Git Status anzeigen
- `POST /api/git/init` - Repository initialisieren
- `POST /api/git/commit` - Changes committen
- `POST /api/git/push` - Zum Remote pushen
- `POST /api/git/pull` - Vom Remote pullen

### GitHub Integration
- `POST /api/github/create-repo` - GitHub Repository erstellen

## 🎯 Hauptfunktionen

### 1. App Builder
```
Vollständige Flutter App Generierung:
- MVVM Architektur
- Store Assets (Icons, Screenshots)
- Deployment Configs
- Tests
- README
- 25+ generierte Dateien
```

### 2. Code Studio
```
Professioneller Code Editor:
- Monaco Editor Integration
- Syntax Highlighting
- Auto-Completion
- Multi-File Support
- Live Preview
```

### 3. AI Chat Assistant
```
ChatGPT-like Interface:
- "add dark mode" → AI fügt Theme Switcher hinzu
- "make it bigger" → AI versteht Kontext
- "center the title" → AI ändert Layout
- Vollständige Conversation History
```

### 4. Live Build Streaming
```
Optional aktivierbar:
- Schritt-für-Schritt Build-Visualisierung
- Pause/Resume Buttons
- Live Preview Updates
- Build Progress Tracking
```

## 📁 Projekt Struktur

```
vibeai/
├── backend/                 # FastAPI Backend
│   ├── main.py             # Hauptserver (1562 Zeilen)
│   ├── requirements.txt    # Python Dependencies
│   └── .env                # API Keys
│
├── studio/                 # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppBuilder.jsx      (1252 Zeilen)
│   │   │   ├── CodeStudio.jsx      (950+ Zeilen)
│   │   │   ├── AppStudio.jsx       (800+ Zeilen)
│   │   │   ├── GitPanel.jsx        (332 Zeilen)
│   │   │   ├── InteractivePreview.jsx (68 Zeilen)
│   │   │   └── *.css               (Styling)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🎨 UI Features

### Monaco Editor
- VS Code-like Experience
- Themes: Dark, Light
- Auto-Completion
- Error Highlighting
- Multi-Language Support

### Device Previews
- iPhone Frame
- Android Frame
- Web Browser Frame
- Fullscreen Emulator

### AI Chat Interface
- User Messages (rechts, lila)
- AI Messages (links, dunkel)
- Timestamps
- Auto-Scroll
- Empty State

## 🔐 Environment Variables

```env
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...    # Optional für GitHub Integration
```

## 📝 Entwicklung

### Build für Production
```bash
cd studio
npm run build
```

### Code Quality
```bash
# Backend
cd backend
python -m pytest

# Frontend
cd studio
npm run lint
```

## 🤝 Contributing

Contributions sind willkommen! Bitte:
1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Changes committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 Lizenz

MIT License - siehe LICENSE Datei

## 🙏 Credits

- **OpenAI GPT-4o** - AI Code Generation
- **Monaco Editor** - Code Editor von Microsoft
- **FastAPI** - Python Web Framework
- **React** - UI Framework
- **Vite** - Build Tool

## 📞 Support

Bei Fragen oder Problemen:
- Issue erstellen auf GitHub
- Dokumentation lesen (`CHAT_HISTORY_FEATURE.md`)

---

**Made with ❤️ and AI**

🚀 Version 2.0.0 - Oktober 2025
