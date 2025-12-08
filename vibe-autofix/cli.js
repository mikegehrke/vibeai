#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const { generatePatch } = require("./openaiClient");

async function main() {
  const backendDir = path.join(__dirname, "..", "backend");
  console.log("🔍 Scanne Backend-Dateien...");

  const files = glob.sync("**/*.py", {
    cwd: backendDir,
    ignore: ["**/__pycache__/**", "**/.venv/**", "**/venv/**"],
    absolute: true
  });

  console.log(`📁 Gefunden: ${files.length} Python-Dateien\n`);

  const backupDir = path.join(__dirname, "..", ".vibe-backup");
  await fs.ensureDir(backupDir);

  let fixed = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relPath = path.relative(backendDir, file);

    console.log(`[${i + 1}/${files.length}] ${relPath}`);

    try {
      const originalCode = await fs.readFile(file, "utf-8");

      // Backup
      const backupPath = path.join(backupDir, relPath.replace(/\//g, "_"));
      await fs.writeFile(backupPath, originalCode);

      // GPT-4 Analyse
      const fixedCode = await generatePatch(relPath, originalCode);

      if (!fixedCode || fixedCode.trim().length === 0) {
        console.log(`  ⏭️  Übersprungen (keine Änderung)\n`);
        skipped++;
        continue;
      }

      // Entferne Markdown Code-Blöcke
      let cleaned = fixedCode;
      if (cleaned.includes("```python")) {
        cleaned = cleaned.split("```python")[1].split("```")[0].trim();
      } else if (cleaned.includes("```")) {
        cleaned = cleaned.split("```")[1].split("```")[0].trim();
      }

      // Nur schreiben wenn wirklich unterschiedlich
      if (cleaned !== originalCode) {
        await fs.writeFile(file, cleaned, "utf-8");
        console.log(`  ✅ Repariert\n`);
        fixed++;
      } else {
        console.log(`  ⏭️  Keine Änderung nötig\n`);
        skipped++;
      }

    } catch (err) {
      console.log(`  ❌ Fehler: ${err.message}\n`);
      errors++;
    }

    // Pause um Rate Limits zu vermeiden
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Auto-Fix Abgeschlossen!");
  console.log("=".repeat(60));
  console.log(`✅ Repariert: ${fixed}`);
  console.log(`⏭️  Übersprungen: ${skipped}`);
  console.log(`❌ Fehler: ${errors}`);
  console.log(`📦 Backups: ${backupDir}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
