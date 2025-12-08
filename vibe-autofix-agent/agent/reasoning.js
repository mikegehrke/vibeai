const openai = require("../api/openaiClient");

exports.analyzeFile = async function (filename, code, task) {
  const prompt = `Du bist ein Code-Repair-Agent. Analysiere diese Datei und behebe ALLE Fehler.

Task: ${task.description}
Datei: ${filename}

Code:
${code}

WICHTIG: 
- Gib den KOMPLETTEN reparierten Code zurück
- Nicht nur Diff, sondern den VOLLEN Fixed Code
- Behebe: Import-Fehler, Syntax-Fehler, undefined variables, Type-Errors
- Behalte alle Funktionen und Kommentare
- Keine Markdown-Blöcke, nur reiner Python-Code

Fixed Code:`;

  try {
    const response = await openai.reason(prompt);

    // Entferne Markdown Code-Blöcke
    let cleaned = response;
    if (cleaned.includes("```python")) {
      cleaned = cleaned.split("```python")[1].split("```")[0].trim();
    } else if (cleaned.includes("```")) {
      cleaned = cleaned.split("```")[1].split("```")[0].trim();
    }

    return cleaned;
  } catch (err) {
    console.error("Reasoning error:", err);
    return null;
  }
};
