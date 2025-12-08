# 🤖 VIBE AUTO-FIX AGENT v2.0

**Autonomer KI-Agent für VS Code** – Analysiert dein komplettes Projekt, erstellt einen Reparatur-Plan, und behebt automatisch alle Fehler.

## ✨ Features

✅ **Vollständige Projekt-Analyse** – Scannt alle Python-Dateien  
✅ **Intelligente Task-Planung** – GPT-4o erstellt Auto-Fix Tasks  
✅ **Autonomous Reasoning** – Jede Datei wird einzeln analysiert  
✅ **Automatische Backups** – Alle Änderungen werden gesichert  
✅ **Live-Logs Panel** – Zeigt Fortschritt in VS Code  
✅ **Rate-Limit-Safe** – 2 Sekunden Pause zwischen Requests  

---

## 🚀 Installation

### 1. Dependencies installieren
```bash
cd vibe-autofix-agent
npm install
```

### 2. OpenAI API-Key setzen
Bearbeite `.env`:
```
OPENAI_API_KEY=your-api-key-here
```

### 3. Extension in VS Code laden
- Drücke **F5** in VS Code (im `vibe-autofix-agent` Ordner)
- Eine neue VS Code Instanz startet mit geladener Extension

---

## 📖 Verwendung

### Command 1: Auto-Fix starten
1. Öffne dein Projekt in VS Code
2. Drücke **Cmd+Shift+P** (Mac) oder **Ctrl+Shift+P** (Windows)
3. Tippe: `Vibe Agent: Auto Fix Project`
4. Agent analysiert alle Backend-Dateien und behebt Fehler

### Command 2: Logs anzeigen
1. Drücke **Cmd+Shift+P**
2. Tippe: `Vibe Agent: Show Panel`
3. Logs werden im Panel angezeigt

---

## 🏗️ Architektur

```
vibe-autofix-agent/
├── extension.js          # Haupt-Controller
├── agent/
│   ├── taskManager.js    # Task-Erstellung
│   ├── planner.js        # AI-basierte Task-Planung
│   ├── reasoning.js      # Pro-Datei Analyse
│   ├── executor.js       # Task-Ausführung
│   └── logger.js         # Logging-System
├── core/
│   ├── fileScanner.js    # Projekt-Scanner
│   ├── backup.js         # Backup-System
│   ├── patcher.js        # Diff-Anwendung
│   ├── diffEngine.js     # Diff-Generierung
│   └── utils.js          # Helfer-Funktionen
├── api/
│   └── openaiClient.js   # GPT-4o Integration
└── panel/
    ├── panel.js          # VS Code Webview
    └── webview.html      # UI Template
```

---

## 🎯 Workflow

1. **Scan** – Agent findet alle Python-Dateien
2. **Plan** – GPT-4o analysiert Sample und erstellt Tasks
3. **Reason** – Jede Datei wird einzeln analysiert
4. **Backup** – Original wird gesichert
5. **Fix** – Reparierter Code wird geschrieben
6. **Log** – Fortschritt wird angezeigt

---

## 🔧 Anpassungen

### Andere Dateitypen scannen
Bearbeite `core/fileScanner.js`:
```javascript
glob("**/*.{js,ts,py,java}", ...)
```

### Anderes AI-Modell verwenden
Bearbeite `api/openaiClient.js`:
```javascript
model: "gpt-4o-mini"  // oder "gpt-3.5-turbo"
```

### Rate-Limit anpassen
Bearbeite `agent/executor.js`:
```javascript
setTimeout(resolve, 1000)  // 1 Sekunde statt 2
```

---

## 📦 Backups

Alle Änderungen werden gesichert in:
```
.vibe-agent-backup/
```

---

## 🎉 Fertig!

Du hast jetzt einen vollständigen autonomen Code-Agent wie **Cursor** oder **Claude Coder** – komplett selbst gebaut und kontrolliert! 🚀
