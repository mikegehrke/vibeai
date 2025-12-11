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

### 2. **Professioneller Code Editor** (VS Code Engine)
- **Monaco Editor**: Gleiche Engine wie VS Code (Microsoft)
- **Syntax Highlighting**: Für alle gängigen Sprachen (Dart, JavaScript, TypeScript, Python, etc.)
- **IntelliSense**: Auto-Completion, Code-Vorschläge, Fehlererkennung
- **Multi-File Editing**: Mehrere Dateien gleichzeitig in Tabs öffnen
- **Framework-Icons**: Echte Framework-Logos (Flutter, React, Next.js, etc.) basierend auf Projekttyp
- **Minimap**: Code-Übersicht wie in VS Code
- **Multi-Cursor**: Mehrere Cursor gleichzeitig (`Ctrl/Cmd + Click`)
- **Code Folding**: Code-Bereiche ein-/ausklappen
- **Bracket Pair Colorization**: Farbige Klammern-Paare
- **Code Lens**: Inline-Informationen über Code
- **Color Decorators**: Farb-Vorschau direkt im Editor
- **Format on Save**: Automatische Formatierung beim Speichern
- **Format on Paste**: Automatische Formatierung beim Einfügen
- **Format on Type**: Automatische Formatierung beim Tippen
- **Go to Definition**: Springe zu Definitionen
- **Peek Definition**: Definition in Popup anzeigen
- **Find References**: Alle Referenzen finden
- **Rename Symbol**: Symbol umbenennen (refactoring)
- **Error Detection**: Live Fehlererkennung und -markierung
- **Word Wrap**: Automatischer Zeilenumbruch
- **Smooth Scrolling**: Sanftes Scrollen
- **Mouse Wheel Zoom**: Zoom mit Mausrad (`Ctrl/Cmd + Scroll`)
- **Drag & Drop**: Dateien per Drag & Drop öffnen
- **Context Menu**: Rechtsklick-Menü mit allen Aktionen
- **Line Numbers**: Zeilennummern
- **Whitespace Rendering**: Leerzeichen sichtbar machen
- **Indentation Detection**: Automatische Einrückungserkennung
- **Auto-Save**: Automatisches Speichern
- **Undo/Redo**: Vollständige Undo/Redo-Funktionalität

### 3. **Live Preview System**
- **Echtzeit-Vorschau**: App wird live im Browser angezeigt
- **Multi-Framework Support**: Flutter, React/Next.js, HTML/CSS/JS
- **Browser-Tabs im Editor**: Preview öffnet sich direkt im Editor, nicht separat
- **Hot Reload**: Änderungen werden sofort sichtbar
- **Device Frames**: iPhone, Android, Web Previews

### 4. **AI Chat System** (Vollwertig wie ChatGPT/Cursor)
- **4 Spezialisierte Agenten**: Aura, Cora, Devra, Lumi
- **5 AI-Modelle**: GPT-4, GPT-4 Turbo, Claude 3 Sonnet, Claude 3 Opus, Gemini Pro
- **Parallele Arbeit**: Chat ist IMMER verfügbar, auch während Smart Agent arbeitet
- **Streaming Responses**: Antworten kommen in Echtzeit (Zeichen-für-Zeichen)
- **Code-Integration**: Agent kann Code direkt in Dateien schreiben
- **Terminal-Befehle**: Agent kann Terminal-Befehle vorschlagen (mit Bestätigung)
- **Conversation History**: Vollständiger Chat-Verlauf mit Timestamps
- **Team Mode**: Mehrere Agenten gleichzeitig aktivieren (Parallel, Sequential, Consensus)
- **Chat Sessions**: Mehrere Chat-Sessions verwalten
- **Markdown Rendering**: Vollständige Markdown-Unterstützung mit Code-Highlighting
- **Message Actions**: Copy, Regenerate, Edit Messages
- **Auto-Scroll**: Automatisches Scrollen zu neuesten Nachrichten
- **Context Memory**: Agent erinnert sich an gesamte Konversation
- **Intelligente Erkennung**: Erkennt automatisch App-Erstellungs-Anfragen, Code-Fragen, Fehler, etc.

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

### 🔍 **Explorer Panel** (Links) - File Tree
- **File Tree**: Projektstruktur mit Icons
- **Framework-Erkennung**: Automatische Icon-Zuweisung basierend auf Dateityp
- **Datei-Operationen**: 
  - Öffnen (Klick oder Doppelklick)
  - Umbenennen (F2)
  - Löschen (Delete)
  - Kopieren
  - Ausschneiden
  - Einfügen
- **Ordner-Operationen**: 
  - Erstellen (Rechtsklick → New Folder)
  - Löschen
  - Expandieren/Kollabieren
  - Umbenennen
- **Context Menu**: Rechtsklick-Menü mit allen Aktionen
- **File Icons**: Framework-spezifische Icons (Flutter, React, etc.)
- **File Status**: Geänderte Dateien werden markiert
- **Search in Tree**: Dateien im Tree suchen
- **Collapse All**: Alle Ordner einklappen
- **Refresh**: Projektstruktur aktualisieren

### 💬 **Chat Panel** (Rechts) - Vollwertiger AI Chat
- **AI Chat Interface**: ChatGPT/Cursor-ähnliches Interface
- **Model-Auswahl**: GPT-4, GPT-4 Turbo, Claude 3 Sonnet, Claude 3 Opus, Gemini Pro
- **Agent-Auswahl**: Aura, Cora, Devra, Lumi (mit Beschreibungen)
- **Team Mode**: Mehrere Agenten gleichzeitig aktivieren (Parallel, Sequential, Consensus)
- **Chat History**: Vollständiger Verlauf mit Timestamps
- **Streaming Responses**: Antworten kommen in Echtzeit (Zeichen-für-Zeichen)
- **Markdown Rendering**: Vollständige Markdown-Unterstützung
- **Code Highlighting**: Syntax-Highlighting in Code-Blöcken
- **Message Bubbles**: User (rechts, lila), AI (links, dunkel)
- **Message Actions**: 
  - Copy Message
  - Regenerate Response
  - Edit Message
  - Delete Message
- **Code-Integration**: Agent schreibt Code direkt in Dateien
- **Terminal Commands**: Agent schlägt Terminal-Befehle vor (mit Bestätigung)
- **Auto-Scroll**: Automatisches Scrollen zu neuesten Nachrichten
- **Empty State**: Willkommens-Nachricht wenn Chat leer
- **Loading States**: Lade-Animation während Antwort generiert wird
- **Error Handling**: Fehlerbehandlung mit Retry-Option
- **Chat Sessions**: Mehrere Chat-Sessions verwalten
- **Context Memory**: Agent erinnert sich an gesamte Konversation
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + L`: Chat fokussieren
  - `Enter`: Nachricht senden
  - `Shift + Enter`: Neue Zeile

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

### 🔧 **Source Control Panel** (Links) - Git Integration
- **Git Status**: Geänderte, neue, gelöschte Dateien
- **Staged Changes**: Staged/Unstaged Dateien
- **Commit**: Änderungen committen (mit Message)
- **Push/Pull**: Zu/von Remote synchronisieren
- **Branch Management**: 
  - Branches erstellen
  - Branches wechseln
  - Branches mergen
  - Branch-Liste anzeigen
- **GitHub Integration**: Repository erstellen
- **Git History**: Commit-Historie anzeigen
- **Diff View**: Änderungen zwischen Commits anzeigen
- **File Status Icons**: Visuelle Markierung geänderter Dateien
- **Commit Message**: Commit-Message eingeben
- **Git Init**: Repository initialisieren

### ▶️ **Run & Debug Panel** (Links) - VS Code Style
- **Launch App**: Startet Preview-Server und öffnet Browser automatisch
- **Run Tests**: Führt Tests aus
- **Build**: Kompiliert Projekt
- **Stop Execution**: Laufende Prozesse stoppen
- **Konfigurationen**: Automatisch erkannt basierend auf Projekttyp
  - Flutter: `flutter run`, `flutter test`, `flutter build`
  - React/Next.js: `npm run dev`, `npm test`, `npm run build`
  - Python: `python main.py`, `pytest`
- **Project Type Badge**: Zeigt erkannten Projekttyp
- **Output Display**: Ausgabe der Befehle wird angezeigt
- **Auto-Scroll**: Automatisches Scrollen bei Output
- **Configuration Dropdown**: Verschiedene Konfigurationen wählen
- **Play Button**: Befehl ausführen
- **Stop Button**: Ausführung stoppen

### 🧪 **Testing Panel** (Links)
- **Test-Ausführung**: Tests ausführen und Ergebnisse anzeigen
- **Test-Status**: Welche Tests bestanden/fehlgeschlagen
- **Coverage**: Code-Coverage anzeigen
- **Test Explorer**: Alle Tests in Baumstruktur
- **Test Results**: Detaillierte Testergebnisse
- **Test Filtering**: Tests nach Status filtern
- **Test Rerun**: Tests erneut ausführen
- **Test Debugging**: Tests im Debug-Modus ausführen

### 📦 **Extensions Panel** (Links) - VS Code Marketplace
- **Installed Extensions**: Liste aller installierten Extensions
- **Extension Marketplace**: Durchsuche verfügbare Extensions
- **Installation**: Extensions mit einem Klick installieren
- **Deinstallation**: Extensions entfernen
- **Extension Details**: Name, Publisher, Version, Beschreibung
- **Ratings & Downloads**: Bewertungen und Download-Zahlen
- **Suche**: Extension-Marketplace durchsuchen
- **Kategorien**: Extensions nach Kategorien filtern
- **Beispiele**: ESLint, Prettier, GitLens, Python, JavaScript, TypeScript

### 💻 **Terminal Panel** (Unten) - Vollständiges Terminal
- **Vollständiges Terminal**: Shell-Zugriff (bash, zsh, etc.)
- **Command History**: Vorherige Befehle mit Pfeiltasten
- **Auto-Scroll**: Automatisches Scrollen bei Output
- **Multi-Terminal**: Mehrere Terminal-Tabs
- **Terminal Execution**: Befehle direkt ausführen
- **Output Streaming**: Output in Echtzeit
- **Error Handling**: Fehlerbehandlung und Anzeige
- **Command Approval**: Terminal-Befehle vom Agent mit Bestätigung
- **Terminal Integration**: Terminal-Befehle aus Chat ausführen
- **Stop Execution**: Laufende Befehle abbrechen (`Ctrl+C`)

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

### 🔍 **Suche & Ersetzen** (VS Code Style)
- **Projektweite Suche**: `Ctrl/Cmd + Shift + F`
- **In Datei suchen**: `Ctrl/Cmd + F`
- **Ersetzen**: Find & Replace mit Vorschau
- **Regex**: Unterstützung für reguläre Ausdrücke
- **Whole Word**: Nur ganze Wörter finden
- **Case Sensitive**: Groß-/Kleinschreibung beachten
- **File Filter**: Suche in bestimmten Dateitypen
- **Exclude Patterns**: Dateien/Ordner ausschließen
- **Search Results**: Alle Treffer mit Kontext anzeigen
- **Replace All**: Alle Treffer auf einmal ersetzen
- **Replace in Selection**: Nur in Auswahl ersetzen
- **File Opening**: Klick auf Ergebnis öffnet Datei im Editor

### 🎨 **Visual Editor** (Drag & Drop)
- **Figma-Style UI Builder**: Visueller Editor für UI-Komponenten
- **Component Palette**: Vordefinierte Komponenten (Text, Button, Input, Image, Container)
- **Drag & Drop**: Komponenten per Drag & Drop hinzufügen
- **Canvas**: Drop-Zone für Komponenten
- **Property Editor**: Eigenschaften von Komponenten bearbeiten
- **Component Reordering**: Komponenten neu anordnen
- **Visual Feedback**: Visuelles Feedback während Drag
- **Auto-Save**: Änderungen werden automatisch gespeichert

### 🌐 **Browser Tabs im Editor**
- **Multi-Tab Browser**: Mehrere Browser-Tabs gleichzeitig öffnen
- **Tab Management**: Tabs erstellen, schließen, umbenennen
- **URL Navigation**: URLs direkt eingeben
- **Reload**: Seite neu laden
- **Back/Forward**: Browser-Navigation
- **Sandbox Mode**: Sicherer iframe-Sandbox
- **Preview Integration**: Preview öffnet sich direkt im Editor
- **Fullscreen**: Browser-Tab im Vollbild

### ⌨️ **Keyboard Shortcuts** (VS Code Style)
- **Command Palette**: `Ctrl/Cmd + Shift + P` oder `Ctrl/Cmd + K`
- **New File**: `Ctrl/Cmd + N`
- **Open File**: `Ctrl/Cmd + O`
- **Save**: `Ctrl/Cmd + S`
- **Format Document**: `Shift + Alt + F`
- **Find in File**: `Ctrl/Cmd + F`
- **Find in Project**: `Ctrl/Cmd + Shift + F`
- **Toggle Terminal**: `Ctrl/Cmd + `` (Backtick)
- **AI Chat**: `Ctrl/Cmd + L`
- **Settings**: `Ctrl/Cmd + ,`
- **Go to Line**: `Ctrl/Cmd + G`
- **Multi-Cursor**: `Ctrl/Cmd + Click` oder `Alt + Click`
- **Select All Occurrences**: `Ctrl/Cmd + Shift + L`
- **Undo**: `Ctrl/Cmd + Z`
- **Redo**: `Ctrl/Cmd + Shift + Z` oder `Ctrl/Cmd + Y`
- **Copy Line**: `Shift + Alt + Up/Down`
- **Move Line**: `Alt + Up/Down`
- **Delete Line**: `Ctrl/Cmd + Shift + K`
- **Comment Line**: `Ctrl/Cmd + /`
- **Zoom In**: `Ctrl/Cmd + +`
- **Zoom Out**: `Ctrl/Cmd + -`
- **Reset Zoom**: `Ctrl/Cmd + 0`

### 🎯 **Command Palette** (VS Code Style)
- **Öffnen**: `Ctrl/Cmd + Shift + P` oder `Ctrl/Cmd + K`
- **Befehle**: Alle verfügbaren Aktionen
- **Kategorien**: 
  - File: New File, Open File, Save
  - Editor: Format Document, Go to Line
  - View: Toggle Terminal, Toggle Sidebar
  - Git: Status, Commit, Push
  - Package: Install Package
  - AI: AI Chat, Smart Agent
  - Preferences: Settings
- **Schnellzugriff**: Schnelle Navigation zu Features
- **Fuzzy Search**: Intelligente Suche (findet auch bei Tippfehlern)
- **Keyboard Shortcuts**: Zeigt Shortcuts für jeden Befehl
- **Command History**: Vorherige Befehle schnell wiederholen

### 📝 **Code-Integration & Automatisierung**
- **Agent schreibt Code**: Agent kann Code direkt in Dateien schreiben
- **Code-Blöcke**: Agent erkennt Code-Blöcke in Chat und wendet sie automatisch an
- **Terminal-Befehle**: Agent schlägt Terminal-Befehle vor (mit Bestätigung)
- **Auto-Fix**: Automatische Fehlerbehebung
- **Code Analysis**: Automatische Code-Analyse
- **Live Code Updates**: Code wird live im Editor aktualisiert
- **File Creation**: Agent erstellt automatisch neue Dateien
- **File Modification**: Agent bearbeitet existierende Dateien
- **Dependency Management**: Automatische Installation von Dependencies
- **Build Automation**: Automatische Build-Prozesse
- **Test Generation**: Automatische Test-Generierung

### 🔄 **Live-Updates & Real-Time Features**
- **WebSocket**: Echtzeit-Updates während Generierung
- **File Watcher**: Automatische Aktualisierung bei Datei-Änderungen
- **Build Progress**: Fortschrittsanzeige während Generierung
- **Live Code Streaming**: Zeichen-für-Zeichen Code-Generierung
- **Live Preview**: Echtzeit-Vorschau der App
- **Hot Reload**: Änderungen werden sofort sichtbar
- **Live Terminal Output**: Terminal-Output in Echtzeit
- **Live Chat Streaming**: Chat-Antworten in Echtzeit
- **Live Build Status**: Build-Status in Echtzeit
- **Live File Updates**: Datei-Änderungen werden sofort angezeigt

### 🎨 **Themes & Customization**
- **Dark/Light Mode**: Editor-Theme wechseln
- **Monaco Themes**: VS Code Dark, VS Code Light
- **Font Size**: Schriftgröße anpassen (Editor-Optionen)
- **Layout**: Panel-Größen anpassen (resizable Panels)
- **Panel Visibility**: Panels ein-/ausblenden
- **Sidebar Position**: Links/Rechts
- **Editor Options**: Alle Monaco Editor Optionen konfigurierbar

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

## 🎓 Lernen & Tutorials - Interaktive Hilfe

### 📚 Tutorial-System (Hilfe-Button "?")
Der App Builder hat ein **vollständiges interaktives Tutorial-System**, das dir hilft, dich zurechtzufinden und alle Features zu lernen.

#### **Wie starte ich ein Tutorial?**
1. **Hilfe-Button**: Klicke auf das **"?"** Icon in der oberen Toolbar (rechts neben dem AI-Button)
2. **Tutorial-Liste**: Eine Liste aller verfügbaren Tutorials öffnet sich
3. **Tutorial wählen**: Klicke auf ein Tutorial, um es zu starten
4. **Schritt-für-Schritt**: Folge den Anweisungen und klicke auf "Weiter"

#### **Tutorial-Features:**
- **Interaktive Highlights**: Wichtige Bereiche werden hervorgehoben
- **Schritt-für-Schritt Anleitung**: Geführte Touren durch alle Features
- **Progress Bar**: Sieh deinen Fortschritt im Tutorial
- **Auto-Scroll**: Automatisches Scrollen zu relevanten Bereichen
- **Fertig-Markierung**: Abgeschlossene Tutorials werden markiert
- **Wiederverwendbar**: Starte Tutorials jederzeit erneut

### 📖 Verfügbare Tutorials:

#### 1. **🎯 Deine erste App erstellen**
- Willkommen im App Builder
- Chat öffnen und nutzen
- App anfordern
- Live-Erstellung beobachten
- Preview ansehen

#### 2. **🧭 Navigation im App Builder**
- Linke Sidebar (Explorer, Suche, Git, etc.)
- Rechte Sidebar (Review, Chat)
- Unteres Panel (Terminal, Output)
- Command Palette

#### 3. **🤖 AI-Agenten verstehen**
- Die 4 Agenten (Aura, Cora, Devra, Lumi)
- Agent wechseln
- Team Mode aktivieren
- Model-Auswahl

#### 4. **🚀 Smart Agent nutzen**
- Smart Agent starten
- Live-Generierung beobachten
- Erklärungen lesen
- Während Generierung chatten

#### 5. **👥 Team Agent nutzen**
- Team Agent starten
- Parallele Arbeit verstehen
- Team-Modi (Parallel, Sequential, Consensus)

#### 6. **📁 Dateien verwalten**
- File Tree nutzen
- Dateien öffnen
- Dateien erstellen
- Dateien umbenennen
- Auto-Save

#### 7. **🔍 Suchen & Ersetzen**
- Search Panel öffnen
- Projektweite Suche
- Erweiterte Optionen (Regex, Whole Word, Case Sensitive)
- Ersetzen
- Datei öffnen aus Suchergebnissen

#### 8. **🔧 Git verwenden**
- Git Panel öffnen
- Git Status anzeigen
- Staging
- Commit
- Push/Pull
- Branch Management

#### 9. **💻 Terminal nutzen**
- Terminal öffnen
- Befehle ausführen
- Agent-Befehle bestätigen
- Multi-Terminal
- Command History

#### 10. **▶️ Run & Debug**
- Run & Debug Panel
- Launch App
- Run Tests
- Build
- Konfigurationen

#### 11. **📺 Preview System**
- Preview starten
- Browser-Tabs im Editor
- Hot Reload
- URL Navigation
- Reload

#### 12. **⌨️ Keyboard Shortcuts**
- Command Palette
- Datei-Operationen
- Suche
- Editor-Shortcuts
- Panel-Shortcuts

#### 13. **📦 Extensions**
- Extensions Panel
- Installierte Extensions
- Marketplace
- Extension Details
- Deinstallation

#### 14. **🎨 Drag & Drop Editor nutzen**
- Visual Editor öffnen
- Komponenten hinzufügen
- Eigenschaften anpassen

#### 15. **💻 Code bearbeiten**
- Datei öffnen
- Code schreiben
- Live Preview

### 💡 Tipps für Tutorials:
- **Starte mit "Deine erste App erstellen"**: Perfekt für Anfänger
- **Folge der Reihenfolge**: Tutorials bauen aufeinander auf
- **Wiederhole Tutorials**: Starte sie erneut, wenn du etwas vergessen hast
- **Nutze die Highlights**: Die hervorgehobenen Bereiche zeigen dir, wo du klicken musst
- **Lies die Erklärungen**: Jeder Schritt erklärt, warum und wie

### 🎯 Tutorial-Status:
- **Abgeschlossene Tutorials** werden mit einem ✓ markiert
- **Fortschritt wird gespeichert**: Dein Fortschritt bleibt erhalten
- **Jederzeit wiederholbar**: Starte Tutorials erneut, wann immer du willst

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

## 📊 Feature-Übersicht: Was macht den App Builder besonders?

### 🎯 **VS Code Engine + AI Power**
Der App Builder kombiniert die bewährte **Monaco Editor Engine** (gleiche wie VS Code) mit **KI-gestützter Automatisierung**. Du bekommst:
- Alle VS Code Features (Editor, IntelliSense, Debugging, etc.)
- Plus: KI-gestützte Code-Generierung und Automatisierung
- Plus: Live Preview, Browser-Tabs, Visual Editor

### 🤖 **Vollwertiger AI Chat** (wie ChatGPT/Cursor)
- **4 spezialisierte Agenten** für verschiedene Aufgaben
- **5 AI-Modelle** zur Auswahl (GPT-4, Claude, Gemini)
- **Streaming Responses** in Echtzeit
- **Code-Integration**: Agent schreibt Code direkt in Dateien
- **Terminal-Integration**: Agent führt Befehle aus (mit Bestätigung)
- **Parallele Arbeit**: Chat funktioniert während Smart Agent arbeitet

### 🚀 **Zwei Agent-Modi**
- **Smart Agent**: Einzelner Agent, Schritt-für-Schritt, konsistent
- **Team Agent**: Mehrere Agenten parallel, schneller, umfassender

### 🎨 **Vollständiges Development Environment**
- **Monaco Editor**: Alle VS Code Features
- **Extensions System**: VS Code Marketplace Integration
- **Git Integration**: Vollständige Git-Funktionalität
- **Terminal**: Vollständiges Terminal im Editor
- **Browser Tabs**: Preview direkt im Editor
- **Visual Editor**: Drag & Drop UI Builder
- **Command Palette**: VS Code Style
- **Keyboard Shortcuts**: Alle VS Code Shortcuts

### 📦 **Multi-Framework Support**
- **Mobile**: Flutter, React Native, iOS, Android
- **Web**: React, Next.js, Vue, Angular, HTML/CSS/JS
- **Backend**: Python, Node.js, Go, Rust, Java, C#, PHP
- **DevOps**: Docker, Kubernetes
- **Desktop**: Electron, Tauri

### 🔄 **Live & Real-Time**
- **Live Code Streaming**: Zeichen-für-Zeichen Code-Generierung
- **Live Preview**: Echtzeit-App-Vorschau
- **Hot Reload**: Änderungen sofort sichtbar
- **Live Updates**: WebSocket-basierte Echtzeit-Updates
- **Live Terminal**: Terminal-Output in Echtzeit

### 🛠️ **Professionelle Tools**
- **Suche & Ersetzen**: Projektweit mit Regex
- **Run & Debug**: Launch App, Tests, Build
- **Testing Panel**: Test-Ausführung und Coverage
- **Package Manager**: npm, yarn, pub, pip, cargo, etc.
- **Git Panel**: Status, Commit, Push, Branch Management
- **Extensions**: Install, Manage, Update

### 📚 **Lernen & Tutorials**
- **Tutorial Guide**: Schritt-für-Schritt Anleitungen
- **Interaktive Tutorials**: Lerne während du arbeitest
- **Tooltips**: Kontextbezogene Hilfe
- **Code-Erklärungen**: Agent erklärt Code und Konzepte

---

## 🎓 Zusammenfassung

Der **App Builder** ist ein **vollständiges, professionelles Development Environment** mit:
- ✅ **VS Code Engine** (Monaco Editor)
- ✅ **Vollwertiger AI Chat** (4 Agenten, 5 Modelle)
- ✅ **Smart & Team Agent** für App-Generierung
- ✅ **Live Preview** mit Browser-Tabs
- ✅ **Git Integration** vollständig
- ✅ **Extensions System** wie VS Code
- ✅ **Terminal, Suche, Debug, Testing** - alles dabei
- ✅ **Multi-Framework Support** (Flutter, React, Python, etc.)
- ✅ **Visual Editor** für Drag & Drop
- ✅ **Command Palette** & Keyboard Shortcuts
- ✅ **Live Updates** & Real-Time Features

**Es ist VS Code + ChatGPT + Cursor + mehr - alles in einem!**

---

**Made with ❤️ and AI by Mike Gehrke**

