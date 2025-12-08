# 🔍 VIBE Agents - Dateien untersuchen und fixen

## 🎯 Übersicht

Alle drei VIBE Agent Versionen können deine Dateien automatisch **analysieren**, **untersuchen** und **fixen**. Hier ist wie:

---

## 🤖 v2.0 - CLI Auto-Fix (Schnellste Methode)

### Einzelne Datei fixen:

```bash
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent

# 1. Bearbeite agent/reasoning.js um einzelne Datei zu analysieren
# 2. Oder nutze das CLI direkt:

node -e "
const reasoning = require('./agent/reasoning');
const fs = require('fs');

async function fixFile(filepath) {
  const code = fs.readFileSync(filepath, 'utf8');
  const fixed = await reasoning.analyzeFile(filepath, code);
  console.log('Fixed code:', fixed);
}

fixFile('/Users/mikegehrke/dev/vibeai/backend/models.py');
"
```

### Ganzes Verzeichnis scannen und fixen:

```bash
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent

# Scannt automatisch alle Python-Dateien im backend/
node cli-agent.js

# Oder mit custom path:
WORKSPACE_PATH=/Users/mikegehrke/dev/vibeai/backend node cli-agent.js
```

---

## 🔥 v3.0 - Multi-Agent Analyse (Beste für systematische Repairs)

### In VS Code:

1. **Öffne v3.0:**
```bash
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3
```

2. **Drücke F5** → Extension Development Host startet

3. **Öffne dein Projekt** (z.B. VibeAI Backend):
```bash
# Im Extension Development Host:
File → Open Folder → /Users/mikegehrke/dev/vibeai
```

4. **Starte Analyse:**
- Cmd+Shift+P
- `Vibe Auto-Fix Full Project`

### Was passiert:

```
Datei → Analyzer Agent (findet ALLE Fehler)
     ↓
     Fix Agent (erstellt Fixes)
     ↓
     Refactor Agent (optimiert Code)
     ↓
     Security Agent (härtet ab)
     ↓
     Diff Preview → Du entscheidest: Apply/Skip
```

### Nur bestimmte Dateien analysieren:

Bearbeite `/Users/mikegehrke/dev/vibeai/vibe-autofix-v3/services/fileService.js`:

```javascript
// Zeile ~14: Ändere Patterns um nur bestimmte Dateien zu scannen
const patterns = [
  "**/models.py",      // Nur models.py
  "**/auth.py",        // Nur auth.py
  "backend/core/**"    // Alle Dateien in backend/core/
];
```

---

## 🌊 v6.0 - SWARM Analyse (Kompletteste Lösung)

### Automatische Projekt-Analyse mit kompletten Team:

1. **Öffne v6.0:**
```bash
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6
```

2. **Drücke F5** → Extension Development Host

3. **Öffne Projekt:**
```bash
# Im Extension Development Host:
File → Open Folder → /Users/mikegehrke/dev/vibeai
```

4. **Starte SWARM:**
- Cmd+Shift+P
- `VIBE Swarm: Auto Dev`

### SWARM Workflow für Backend-Analyse:

```
PM Agent
  ↓ Analysiert Backlog, wählt "Fix all backend errors"
  ↓
Architect Agent
  ↓ Plant Architektur-Strategie
  ↓
┌────────── PARALLEL ──────────┐
│                              │
│ Bugfix Agent                 │ → Scannt ALLE Dateien, findet Fehler
│ Refactor Agent               │ → Optimiert Code-Struktur
│ Security Agent               │ → OWASP Audit
│ Tester Agent                 │ → Schreibt Tests
│                              │
└──────────────────────────────┘
  ↓
Reviewer Agent
  ↓ Validiert alle Änderungen
  ↓
Documentation Agent
  ↓ Updated Docs
  ↓
Git Commit → Alle Fixes committed
```

### Einzelne Datei mit SWARM analysieren:

Erstelle `/Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6/analyze-file.js`:

```javascript
const bugfix = require('./swarm/agents/bugfix');
const security = require('./swarm/agents/security');
const refactor = require('./swarm/agents/refactor');
const fs = require('fs-extra');

async function analyzeFile(filepath) {
  console.log(`🔍 Analyzing: ${filepath}`);
  
  const workspaceRoot = '/Users/mikegehrke/dev/vibeai';
  
  // Run all agents on single file
  console.log('🐛 Bugfix Agent...');
  const bugs = await bugfix.searchAndFix(workspaceRoot);
  
  console.log('🛡️ Security Agent...');
  const security = await security.audit(workspaceRoot);
  
  console.log('✨ Refactor Agent...');
  const refactors = await refactor.optimize(workspaceRoot);
  
  console.log('✅ Analysis complete!');
  console.log('Bugs:', bugs);
  console.log('Security:', security);
  console.log('Refactors:', refactors);
}

analyzeFile(process.argv[2] || 'backend/models.py');
```

Dann:
```bash
cd /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6
node analyze-file.js backend/models.py
```

---

## 🎯 Praktische Beispiele

### Beispiel 1: VibeAI Backend komplett fixen

**Mit v3.0 (empfohlen):**

```bash
# 1. Starte v3.0
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3

# 2. In VS Code:
#    - F5 drücken
#    - Extension Development Host öffnet
#    - File → Open Folder → /Users/mikegehrke/dev/vibeai
#    - Cmd+Shift+P → "Vibe Auto-Fix Full Project"

# 3. Warte ~30 Minuten (237 Dateien)

# 4. Siehst du in Sidebar:
#    - Welche Dateien gerade processed werden
#    - Welche fixed wurden
#    - Welche Errors gefunden wurden

# 5. Für jede Datei: Apply/Skip entscheiden
```

### Beispiel 2: Nur models.py untersuchen

**Mit v2.0 (schnellste):**

```bash
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent

# Erstelle single-file.js:
cat > single-file.js << 'EOF'
const reasoning = require('./agent/reasoning');
const fs = require('fs-extra');
const path = require('path');

async function fixSingleFile(filepath) {
  console.log(`🔍 Analyzing: ${filepath}`);
  
  const code = await fs.readFile(filepath, 'utf8');
  const relativePath = path.relative(process.cwd(), filepath);
  
  // Backup
  await fs.copy(filepath, filepath + '.backup');
  
  // Analyze & Fix
  const fixed = await reasoning.analyzeFile(relativePath, code);
  
  if (fixed !== code) {
    await fs.writeFile(filepath, fixed, 'utf8');
    console.log('✅ Fixed and saved!');
  } else {
    console.log('⏭️ No changes needed');
  }
}

const file = process.argv[2] || '../backend/models.py';
fixSingleFile(file).catch(console.error);
EOF

node single-file.js /Users/mikegehrke/dev/vibeai/backend/models.py
```

### Beispiel 3: Alle Python-Dateien in backend/core/ fixen

**Mit v6.0 SWARM:**

```bash
# 1. Öffne v6.0
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-swarm-agent-v6

# 2. Bearbeite services/file.js:
#    Zeile ~14-20: Ändere patterns:
#    const patterns = ["backend/core/**/*.py"];

# 3. F5 drücken → Extension Development Host

# 4. Öffne /Users/mikegehrke/dev/vibeai

# 5. Cmd+Shift+P → "VIBE Swarm: Auto Dev"

# 6. SWARM analysiert und fixt parallel mit 5 Agents!
```

### Beispiel 4: Spezifische Fehlertypen finden

**Mit v3.0 Analyzer Agent:**

```bash
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-v3

# Erstelle error-scanner.js:
cat > error-scanner.js << 'EOF'
const analyzerAgent = require('./agents/analyzerAgent');
const file = require('./services/file');

async function scanForErrors(filepath) {
  const code = await file.readFileContent(filepath);
  const analysis = await analyzerAgent.run(filepath, code);
  
  console.log('\n📊 Error Analysis Results:\n');
  console.log(`Total Issues: ${analysis.summary.totalIssues}`);
  console.log(`Critical: ${analysis.summary.critical}`);
  console.log(`Warnings: ${analysis.summary.warnings}`);
  console.log('\n🔍 Problems Found:\n');
  
  analysis.problems.forEach(p => {
    console.log(`Line ${p.line}: [${p.category}] ${p.message}`);
  });
  
  console.log('\n✅ Required Fixes:\n');
  analysis.requiredFixes.forEach(f => {
    console.log(`- ${f.problem}`);
    console.log(`  Solution: ${f.solution}\n`);
  });
}

const filepath = process.argv[2] || '../backend/models.py';
scanForErrors(filepath).catch(console.error);
EOF

node error-scanner.js /Users/mikegehrke/dev/vibeai/backend/auth.py
```

---

## 📊 Vergleich: Welcher Agent für was?

| Aufgabe | v2.0 | v3.0 | v6.0 |
|---------|------|------|------|
| Schnelle Einzeldatei-Fix | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Komplettes Projekt scannen | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Detaillierte Fehleranalyse | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Security Audit | ❌ | ⭐⭐⭐ | ⭐⭐⭐ |
| Code Refactoring | ❌ | ⭐⭐⭐ | ⭐⭐⭐ |
| Test Generation | ❌ | ❌ | ⭐⭐⭐ |
| CI/CD Setup | ❌ | ❌ | ⭐⭐⭐ |
| Parallele Verarbeitung | ❌ | ❌ | ⭐⭐⭐ |
| CLI-Nutzung | ⭐⭐⭐ | ❌ | ❌ |

---

## 🚀 Quick Commands Cheat Sheet

```bash
# v2.0 - Schnelle CLI Fixes
cd /Users/mikegehrke/dev/vibeai/vibe-autofix-agent
node cli-agent.js                                    # Ganzes Projekt
node single-file.js backend/models.py                # Einzelne Datei

# v3.0 - Systematische Multi-Agent Analyse
# In VS Code:
# 1. F5 drücken
# 2. Cmd+Shift+P → "Vibe Auto-Fix Full Project"
# 3. Diff Preview → Apply/Skip

# v6.0 - Complete SWARM
# In VS Code:
# 1. F5 drücken
# 2. Cmd+Shift+P → "VIBE Swarm: Auto Dev"
# 3. Alle 10 Agents arbeiten parallel!

# Status checken
ps aux | grep node                                   # Laufende Agents
tail -f vibe-autofix-agent/full-run.log             # v2.0 Logs
# v3.0 & v6.0 → Siehe Sidebar Panel in VS Code
```

---

## 💡 Best Practices

### 1. Immer Backups erstellen
Alle Agents erstellen automatisch Backups, aber zusätzlich:
```bash
cp -r /Users/mikegehrke/dev/vibeai/backend /Users/mikegehrke/dev/vibeai/backend.backup
```

### 2. Starte mit kleinem Scope
```bash
# Teste erst mit 1-2 Dateien
node single-file.js backend/auth.py

# Dann erweitere
node cli-agent.js backend/core/
```

### 3. Nutze Diff Preview (v3.0)
- Sieh IMMER die Änderungen bevor du sie applied
- Skip wenn unsicher
- Review später in Git

### 4. Parallele Agents begrenzen (v6.0)
```json
// VS Code Settings
{
  "vibe.swarm.parallelAgents": 3  // Start mit 3, nicht 10
}
```

### 5. Monitor Logs
```bash
# v2.0
tail -f vibe-autofix-agent/full-run.log

# v3.0 & v6.0
# → Sidebar Panel in VS Code zeigt Live-Status
```

---

## 🎯 Nächster Schritt

**Für VibeAI Backend (237 Python Files mit Errors):**

```bash
# Empfehlung: Nutze v3.0

# 1. Starte v3.0
open -a "Visual Studio Code" /Users/mikegehrke/dev/vibeai/vibe-autofix-v3

# 2. F5 drücken

# 3. Öffne VibeAI Projekt
#    File → Open Folder → /Users/mikegehrke/dev/vibeai

# 4. Starte Auto-Fix
#    Cmd+Shift+P → "Vibe Auto-Fix Full Project"

# 5. Warte 30 Min, review Diffs, apply fixes

# 6. Test backend
cd /Users/mikegehrke/dev/vibeai/backend
python3 -c "import main; print('✅ FIXED!')"
```

**Viel Erfolg!** 🔥
