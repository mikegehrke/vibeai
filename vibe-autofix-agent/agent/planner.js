const openai = require("../api/openaiClient");
const taskManager = require("./taskManager");
const fs = require("fs-extra");

exports.createPlan = async function (files) {
  // Nur Python-Dateien für Backend-Projekt
  const pythonFiles = files.filter(f => f.endsWith(".py"));

  if (pythonFiles.length === 0) {
    return [];
  }

  // ALLE Dateien analysieren (nicht nur Sample)
  console.log(`📋 Erstelle Tasks für ALLE ${pythonFiles.length} Dateien...`);

  // Erstelle Task für jede Datei direkt
  return pythonFiles.map(f =>
    taskManager.createTask("auto-fix", f, "Analyze and fix all errors (imports, syntax, types, undefined vars)")
  );

  /* ALTE VERSION: Nur erste 5 für AI-Planung
  const sampleFiles = pythonFiles.slice(0, 5);
  
  const fileContents = await Promise.all(
    sampleFiles.map(async f => {
      const content = await fs.readFile(f, "utf-8");
      return { path: f, preview: content.slice(0, 500) };
    })
  );

  const prompt = `Analysiere diese Python-Backend-Dateien und erstelle eine Task-Liste für einen Auto-Fix Agent.

Dateien:
${fileContents.map(f => `${f.path}:\n${f.preview}\n`).join("\n")}

Finde:
- Import-Fehler
- Syntax-Fehler  
- Fehlende Funktionen
- Type-Errors
- Code-Smells

Antwortformat (nur JSON, kein Text):
[
  { "type": "fix-import", "description": "Fix missing import", "file": "path/to/file.py" },
  { "type": "fix-syntax", "description": "Fix syntax error", "file": "path/to/file.py" }
]`;

  try {
    const response = await openai.reason(prompt);
    
    // Parse JSON aus Response
    let jsonStr = response;
    if (response.includes("```json")) {
      jsonStr = response.split("```json")[1].split("```")[0].trim();
    } else if (response.includes("```")) {
      jsonStr = response.split("```")[1].split("```")[0].trim();
    }
    
    const tasks = JSON.parse(jsonStr);
    return tasks.map(t => taskManager.createTask(t.type, t.file, t.description));
  } catch (err) {
    console.error("Planner error:", err);
    
    // Fallback: Erstelle Tasks für alle Python-Dateien
    return pythonFiles.map(f => 
      taskManager.createTask("auto-fix", f, "Analyze and fix all errors")
    );
  }
  */
};
