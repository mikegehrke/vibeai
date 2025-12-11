# 📱 App Builder Modul - Komplette Dokumentation

## 🎯 Übersicht

Das **App Builder Modul** ist das Herzstück von VibeAI - ein vollständiger, AI-gestützter App-Entwicklungseditor mit Live-Code-Generierung, Echtzeit-Preview, und professionellen Entwicklungstools. Es kombiniert die Power von VS Code mit KI-gestützter App-Generierung.

**URL:** `/builder/[projectId]`

---

## 🚀 Hauptfunktionen

### 1. **AI-gestützte App-Generierung**
- **Smart Agent**: Einzelner intelligenter Agent, der Schritt-für-Schritt komplette Apps erstellt
- **Team Agent**: Mehrere spezialisierte Agenten arbeiten parallel für schnellere, bessere Ergebnisse
- **Live Code Streaming**: Zeichen-für-Zeichen Code-Generierung im Editor (wie ein echter Entwickler tippt)
- **Automatische Asset-Generierung**: Icons, Splash Screens, Logos, App Store/Play Store Beschreibungen

### 2. **Professioneller Code Editor**
- **Monaco Editor**: Gleiche Engine wie VS Code
- **Syntax Highlighting**: Für alle gängigen Sprachen (Dart, JavaScript, TypeScript, Python, etc.)
- **IntelliSense**: Auto-Completion, Code-Vorschläge, Fehlererkennung
- **Multi-File Editing**: Mehrere Dateien gleichzeitig in Tabs öffnen
- **Framework-Icons**: Echte Framework-Logos (Flutter, React, Next.js, etc.) basierend auf Projekttyp

### 3. **Live Preview System**
- **Echtzeit-Vorschau**: App wird live im Browser angezeigt
- **Multi-Framework Support**: Flutter, React/Next.js, HTML/CSS/JS
- **Browser-Tabs im Editor**: Preview öffnet sich direkt im Editor, nicht separat
- **Hot Reload**: Änderungen werden sofort sichtbar
- **Device Frames**: iPhone, Android, Web Previews

### 4. **AI Chat System**
- **4 Spezialisierte Agenten**: Aura, Cora, Devra, Lumi
- **Parallele Arbeit**: Chat ist IMMER verfügbar, auch während Smart Agent arbeitet
- **Streaming Responses**: Antworten kommen in Echtzeit
- **Code-Integration**: Agent kann Code direkt in Dateien schreiben
- **Terminal-Befehle**: Agent kann Terminal-Befehle vorschlagen (mit Bestätigung)

### 5. **Entwicklungstools**
- **Git Integration**: Status, Commit, Push, Branch Management
- **Terminal**: Vollständiges Terminal im Editor
- **Suche & Ersetzen**: Projektweite Suche mit Regex, Whole Word, Case Sensitive
- **Run & Debug**: Launch App, Run Tests, Build Commands
- **Package Manager**: npm, yarn, pnpm, pub get, etc.
- **Testing Panel**: Test-Ausführung und Ergebnisse

---

## 🤖 Die 4 AI-Agenten

### ✨ **Aura** - Allgemeiner AI Assistant
- **Rolle**: Beantwortet Fragen, hilft bei allem
- **Einsatz**: Allgemeine Fragen, Erklärungen, Hilfe
- **Icon**: ⚡ Zap
- **Emoji**: ✨

### 💡 **Cora** - Code Expert
- **Rolle**: Programmieren, Debuggen, Code-Generierung
- **Einsatz**: Code schreiben, Fehler finden, Optimierungen
- **Icon**: 💡 Code
- **Emoji**: 💡

### 🧠 **Devra** - Deep Thinker
- **Rolle**: Komplexe Analysen, Reasoning, Erklärungen
- **Einsatz**: Architektur-Entscheidungen, komplexe Probleme lösen
- **Icon**: 🧠 Brain
- **Emoji**: 🧠

### 🎨 **Lumi** - Creative Genius
- **Rolle**: Design, Kreativität, Ideen, Writing
- **Einsatz**: UI/UX Design, kreative Lösungen, Texte schreiben
- **Icon**: 🎨 Palette
- **Emoji**: 🎨

**Wechsel zwischen Agenten**: Klicke auf das Agent-Icon im Chat-Panel, um zwischen den Agenten zu wechseln.

---

## 🎯 Smart Agent vs. Team Agent

### 🤖 **Smart Agent** (Einzelner Agent)
- **Wie es funktioniert**: Ein intelligenter Agent arbeitet Schritt-für-Schritt
- **Vorteile**: 
  - Konsistenter Code-Stil
  - Gut für kleinere Projekte
  - Einfacher zu verfolgen
- **Verwendung**: 
  ```
  "Erstelle eine Flutter App namens MyApp"
  ```
- **Live-Features**:
  - Schritt-für-Schritt Datei-Erstellung
  - Zeichen-für-Zeichen Code-Streaming
  - Detaillierte Erklärungen während der Generierung
  - Automatische Asset-Generierung

### 👥 **Team Agent** (Mehrere Agenten parallel)
- **Wie es funktioniert**: Mehrere spezialisierte Agenten arbeiten GLEICHZEITIG
- **Agenten im Team**:
  - **Frontend Agent**: UI/UX, Components
  - **Backend Agent**: API, Services, Logic
  - **Designer Agent**: UI Design, Styling
  - **Architect Agent**: Structure, Best Practices
  - **Code Generator**: Implementation
  - **Reviewer**: Quality Check
  - **Package Manager**: Dependencies
  - **Auto-Fix**: Error Fixing
- **Vorteile**:
  - Schneller (parallel)
  - Besser (spezialisierte Expertise)
  - Umfassender (mehr Perspektiven)
- **Verwendung**:
  ```
  "Erstelle eine komplexe Flutter App mit Team Agent"
  ```
- **Team-Modi**:
  - **Parallel**: Alle Agenten arbeiten gleichzeitig
  - **Sequential**: Agenten arbeiten nacheinander
  - **Consensus**: Agenten diskutieren und einigen sich

---

## 📋 Editor-Panels

### 🔍 **Explorer Panel** (Links)
- **File Tree**: Projektstruktur mit Icons
- **Framework-Erkennung**: Automatische Icon-Zuweisung basierend auf Dateityp
- **Datei-Operationen**: Öffnen, Umbenennen, Löschen
- **Ordner-Operationen**: Erstellen, Löschen, Expandieren/Kollabieren

### 💬 **Chat Panel** (Rechts)
- **AI Chat**: Chat mit den 4 Agenten
- **Model-Auswahl**: GPT-4, GPT-4 Turbo, Claude 3 Sonnet, Claude 3 Opus, Gemini Pro
- **Agent-Auswahl**: Aura, Cora, Devra, Lumi
- **Team Mode**: Mehrere Agenten gleichzeitig aktivieren
- **Chat History**: Vollständiger Verlauf mit Timestamps
- **Code-Integration**: Agent schreibt Code direkt in Dateien

### 📺 **Review Panel** (Rechts)
- **Projekt-Übersicht**: Statistiken, Dateien, Framework
- **Build-Status**: Aktueller Status der App-Generierung
- **Live-Updates**: Echtzeit-Updates während Smart/Team Agent arbeitet

### 🔍 **Search Panel** (Links)
- **Projektweite Suche**: Suche in allen Dateien
- **Erweiterte Optionen**:
  - **Regex**: Reguläre Ausdrücke
  - **Whole Word**: Nur ganze Wörter
  - **Case Sensitive**: Groß-/Kleinschreibung beachten
- **Ersetzen**: Find & Replace in Dateien
- **Datei-Öffnen**: Klick auf Ergebnis öffnet Datei im Editor

### 🔧 **Source Control Panel** (Links)
- **Git Status**: Geänderte, neue, gelöschte Dateien
- **Commit**: Änderungen committen
- **Push/Pull**: Zu/von Remote synchronisieren
- **Branch Management**: Branches erstellen, wechseln, mergen
- **GitHub Integration**: Repository erstellen

### ▶️ **Run & Debug Panel** (Links)
- **Launch App**: Startet Preview-Server und öffnet Browser
- **Run Tests**: Führt Tests aus
- **Build**: Kompiliert Projekt
- **Konfigurationen**: Automatisch erkannt basierend auf Projekttyp
  - Flutter: `flutter run`, `flutter test`, `flutter build`
  - React/Next.js: `npm run dev`, `npm test`, `npm run build`
  - Python: `python main.py`, `pytest`

### 🧪 **Testing Panel** (Links)
- **Test-Ausführung**: Tests ausführen und Ergebnisse anzeigen
- **Test-Status**: Welche Tests bestanden/fehlgeschlagen
- **Coverage**: Code-Coverage anzeigen

### 📦 **Extensions Panel** (Links)
- **Verfügbare Extensions**: Liste aller Extensions
- **Installation**: Extensions installieren/deinstallieren
- **Verwaltung**: Extension-Einstellungen

### 💻 **Terminal Panel** (Unten)
- **Vollständiges Terminal**: Shell-Zugriff
- **Command History**: Vorherige Befehle
- **Auto-Scroll**: Automatisches Scrollen bei Output
- **Multi-Terminal**: Mehrere Terminal-Tabs

---

## 🎨 Prompt Builder

### Was ist der Prompt Builder?
Der **Prompt Builder** ist ein visueller Assistent, der dir hilft, perfekte Prompts für die App-Generierung zu erstellen.

### Verwendung:
1. **Projekt-Name eingeben**: z.B. "MyAwesomeApp"
2. **Framework wählen**: Flutter, React, Next.js, etc.
3. **Beschreibung schreiben**: Was soll die App machen?
4. **Features hinzufügen**: Welche Features soll die App haben?
5. **Smart Agent oder Team Agent wählen**
6. **Generieren klicken**

### Beispiel-Prompt:
```
Projekt: FitConnect
Framework: Flutter
Beschreibung: Eine moderne Fitness-App mit Social Features
Features:
- User Authentication
- Workout Tracking
- Social Feed
- Progress Charts
- Push Notifications
```

---

## 🔄 Workflow: App erstellen

### Schritt 1: Projekt starten
1. Gehe zu `/builder`
2. Klicke auf "Neues Projekt" oder wähle ein existierendes
3. Projekt wird erstellt/geöffnet

### Schritt 2: Prompt eingeben
**Option A: Im Chat**
```
"Erstelle eine Flutter App namens MyApp mit Dark Mode und Navigation"
```

**Option B: Prompt Builder**
1. Öffne Prompt Builder
2. Fülle alle Felder aus
3. Klicke "Generieren"

### Schritt 3: Live-Generierung beobachten
- **Smart Agent**: Sieh zu, wie Dateien Schritt-für-Schritt erstellt werden
- **Team Agent**: Mehrere Agenten arbeiten parallel
- **Code-Streaming**: Code wird Zeichen-für-Zeichen geschrieben
- **Erklärungen**: Agent erklärt, was er gerade macht

### Schritt 4: Code anpassen
- **Im Editor**: Öffne Dateien und bearbeite Code
- **Mit Chat**: Sage "Ändere die Farbe zu Blau" oder "Füge einen Button hinzu"
- **Auto-Save**: Änderungen werden automatisch gespeichert

### Schritt 5: Preview ansehen
- **Launch App**: Klicke auf "Launch App" im Run & Debug Panel
- **Browser öffnet sich**: Preview im Editor
- **Hot Reload**: Änderungen werden sofort sichtbar

### Schritt 6: Git & Deployment
- **Commit**: Änderungen committen
- **Push**: Zu GitHub pushen
- **Deploy**: App deployen

---

## 🛠️ Erweiterte Features

### 🔍 **Suche & Ersetzen**
- **Projektweite Suche**: `Ctrl/Cmd + Shift + F`
- **In Datei suchen**: `Ctrl/Cmd + F`
- **Ersetzen**: Find & Replace mit Vorschau
- **Regex**: Unterstützung für reguläre Ausdrücke

### 🎯 **Command Palette**
- **Öffnen**: `Ctrl/Cmd + Shift + P`
- **Befehle**: Alle verfügbaren Aktionen
- **Schnellzugriff**: Schnelle Navigation zu Features

### 📝 **Code-Integration**
- **Agent schreibt Code**: Agent kann Code direkt in Dateien schreiben
- **Code-Blöcke**: Agent erkennt Code-Blöcke in Chat und wendet sie an
- **Terminal-Befehle**: Agent schlägt Terminal-Befehle vor (mit Bestätigung)

### 🔄 **Live-Updates**
- **WebSocket**: Echtzeit-Updates während Generierung
- **File Watcher**: Automatische Aktualisierung bei Datei-Änderungen
- **Build Progress**: Fortschrittsanzeige während Generierung

### 🎨 **Themes & Customization**
- **Dark/Light Mode**: Editor-Theme wechseln
- **Font Size**: Schriftgröße anpassen
- **Layout**: Panel-Größen anpassen

---

## 📚 Unterstützte Frameworks

### Mobile
- **Flutter/Dart**: Vollständige Unterstützung
- **React Native**: JavaScript/TypeScript
- **iOS Native**: Swift/SwiftUI
- **Android Native**: Kotlin

### Web
- **React**: JavaScript/TypeScript
- **Next.js**: Full-Stack React
- **Vue.js**: Progressive Framework
- **Angular**: TypeScript Framework
- **HTML/CSS/JS**: Vanilla Web

### Backend
- **Python**: FastAPI, Flask, Django
- **Node.js**: Express, NestJS
- **Go**: Gin, Echo
- **Rust**: Actix, Rocket

---

## 🎓 Lernen & Tutorials

### Tutorial Guide
- **Schritt-für-Schritt Anleitungen**: Geführte Touren
- **Tooltips**: Kontextbezogene Hilfe
- **Interaktive Tutorials**: Lerne während du arbeitest

### Verfügbare Tutorials:
1. **Deine erste App erstellen**: Grundlagen
2. **Drag & Drop Editor nutzen**: Visueller Editor
3. **Git verwenden**: Version Control
4. **Tests schreiben**: Testing
5. **App deployen**: Deployment

---

## 🔐 Sicherheit & Best Practices

### API Keys
- **OpenAI API Key**: Erforderlich für AI-Features
- **GitHub Token**: Optional für GitHub Integration
- **Sicher speichern**: Keys werden nie im Code gespeichert

### Code-Qualität
- **Auto-Fix**: Automatische Fehlerbehebung
- **Linting**: Code-Qualitätsprüfung
- **Formatting**: Automatische Code-Formatierung

---

## 🐛 Troubleshooting

### Smart Agent startet nicht
- **Prüfe API Key**: `OPENAI_API_KEY` in `.env` gesetzt?
- **Backend läuft**: Backend auf Port 8005?
- **Logs prüfen**: Terminal-Ausgabe anschauen

### Preview zeigt nichts
- **Server läuft**: Preview-Server gestartet?
- **Port verfügbar**: Port nicht blockiert?
- **Browser öffnen**: Browser-Tab im Editor?

### Chat antwortet nicht
- **Streaming aktiv**: Antwort kommt in Echtzeit?
- **Model verfügbar**: Gewähltes Model verfügbar?
- **API Key gültig**: API Key korrekt?

---

## 📖 Weitere Ressourcen

- **API Dokumentation**: `/docs` (Swagger UI)
- **GitHub Repository**: [Link]
- **Support**: Issues auf GitHub
- **Community**: [Link]

---

**Made with ❤️ and AI by Mike Gehrke**

