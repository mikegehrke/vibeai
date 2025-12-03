# Builder Pipeline - VibeAI App Builder

## ✅ KOMPLETT IMPLEMENTIERT (1-8)

Die Builder Pipeline ist das Herz des VibeAI App Builders. Sie orchestriert die vollautomatische Generierung von Apps für verschiedene Plattformen.

---

## 📦 Komponenten

### 1️⃣ **ProjectTreeGenerator** ✅
Generiert komplette Projektstrukturen für verschiedene Frameworks.

**Unterstützte Projekttypen:**
- Flutter Apps
- React Native Apps
- Next.js Web Apps
- Node.js Backend
- FastAPI Backend
- iOS Swift Apps
- Android Kotlin Apps

**Features:**
- Template-basierte Ordnerstrukturen
- Automatische Config-Dateien
- Verschachtelte Ordner-Hierarchien
- JSON-Export für Frontend

---

### 2️⃣ **FileGenerator** ✅
Generiert Code-Dateien mit KI-Unterstützung.

**Features:**
- KI-basierte Code-Generierung (GPT-4o, Claude, etc.)
- Multi-Provider Fallback
- Template-basierte Prompts
- Sprach-spezifische Generierung
- Fallback-Templates wenn KI nicht verfügbar

**Unterstützte Sprachen:**
- Dart, TypeScript, Python, Swift, Kotlin, JavaScript

---

### 3️⃣ **ConfigWriter** ✅
Generiert projekt-spezifische Config-Dateien.

**Generiert:**
- `package.json` (Node.js, React Native, Next.js)
- `pubspec.yaml` (Flutter)
- `requirements.txt` (Python)
- `tsconfig.json` (TypeScript)
- `.gitignore` (alle Frameworks)
- Framework-spezifische Build-Configs

---

### 4️⃣ **ErrorDetector** ✅
Erkennt Fehler in generiertem Code.

**Prüft:**
- **Syntax-Fehler** (Python Compile, Bracket-Matching)
- **Lint-Fehler** (Trailing Whitespace, Line Length, etc.)
- **Import-Fehler** (Fehlende Extensions, Invalid Imports)
- **Code-Qualität** (TODO-Comments, console.log, etc.)

**Output:**
- Strukturierte Fehlerberichte
- Severity Levels (error, warning, info)
- Zeilennummern
- Fehler-Zusammenfassungen

---

### 5️⃣ **CodeFormatter** ✅
Formatiert Code automatisch.

**Formatierungs-Stile:**
- Python (Black-style)
- JavaScript/TypeScript (Prettier-style)
- Dart (dart format)
- Swift (SwiftFormat)
- Kotlin (ktlint)

**Features:**
- Automatische Einrückung
- Trailing Whitespace Removal
- Line Ending Normalisierung
- Import-Organisation

---

### 6️⃣ **LanguageDetector** ✅
Erkennt Programmiersprache anhand Dateiendung.

**Unterstützt:**
- 20+ Programmiersprachen
- Kommentar-Syntax Detection
- Code-File Detection
- Extension Mapping

---

### 7️⃣ **FileMerger** ✅
Merged bestehende Dateien mit neuen Änderungen.

**Merge-Strategien:**
- **smart**: Intelligentes Merging (Import/Function/Class-Merging)
- **overwrite**: Kompletter Replace
- **append**: Anhängen
- **imports_only**: Nur Imports mergen

**Features:**
- Import-Deduplication
- Konflikt-Erkennung
- Similarity-Checks
- Language-aware Merging

---

### 8️⃣ **StructuredOutput** ✅
Erstellt strukturierte JSON-Outputs für Frontend.

**Output-Typen:**
- **Project Output**: Vollständige Projekt-Übersicht
- **File Info**: Detaillierte Datei-Informationen
- **Build Status**: Live-Build-Updates
- **Error Reports**: Gruppierte Fehlerberichte
- **Generation Logs**: Schritt-für-Schritt Logs

---

## 🚀 Verwendung

### Vollständiges Projekt generieren

```python
from builder.builder_pipeline import builder_pipeline

result = await builder_pipeline.build_project(
    project_name="MyApp",
    project_type="flutter",
    description="A beautiful Flutter app",
    model="gpt-4o"
)

# Result enthält:
# - Alle generierten Dateien
# - Config-Dateien
# - Fehler-Reports
# - Build-Logs
```

### Einzelne Datei aktualisieren

```python
result = await builder_pipeline.update_file(
    file_path="lib/main.dart",
    original_content="...",
    updates="...",
    merge_strategy="smart"
)
```

---

## 🌐 API Endpunkte

### `POST /api/builder/create-project`
Generiert ein komplettes Projekt.

**Request:**
```json
{
  "project_name": "MyApp",
  "project_type": "flutter",
  "description": "My awesome app",
  "model": "gpt-4o"
}
```

### `POST /api/builder/update-file`
Aktualisiert eine Datei.

**Request:**
```json
{
  "file_path": "lib/main.dart",
  "original_content": "...",
  "updates": "...",
  "merge_strategy": "smart"
}
```

### `GET /api/builder/project-types`
Liefert alle unterstützten Projekttypen.

---

## 💡 Features

✅ **Multi-Framework Support** - Flutter, React Native, Next.js, Node.js, FastAPI, Swift, Kotlin  
✅ **KI-Powered** - Nutzt GPT-4o, Claude, Gemini mit automatischem Fallback  
✅ **Intelligent Merging** - Smart Merging von bestehenden und neuen Dateien  
✅ **Error Detection** - Automatische Syntax & Lint-Checks  
✅ **Code Formatting** - Automatische Code-Formatierung  
✅ **Structured Output** - JSON-Outputs für Frontend-Integration  
✅ **Production-Ready** - Sauberer, getesteter, formatierter Code  

---

## 🔄 Integration mit VibeAI

Die Builder Pipeline integriert sich nahtlos mit:
- **Multi-Agent System** (Aura, Cora, Devra, Lumi)
- **Model Router V2** (Intelligente Provider-Auswahl)
- **Provider Clients** (OpenAI, Claude, Gemini, Copilot, Ollama)
- **Billing System** (Token-Tracking, Kosten-Berechnung)
- **Auth System** (User-basierte Berechtigungen)

---

## 🎯 Nächste Schritte

Die Builder Pipeline ist **komplett fertig**. Sie kann jetzt:
1. In `main.py` registriert werden
2. Im Frontend genutzt werden
3. Mit Code Studio integriert werden
4. Mit App Studio verbunden werden

**Bereit für Produktion!** 🚀
