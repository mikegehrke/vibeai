const fs = require("fs-extra");
const path = require("path");
const reasoning = require("./reasoning");
const { createBackup } = require("../core/backup");

exports.run = async function (tasks, logger) {
  let fixed = 0;
  let errors = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    logger.log(`\n[${i + 1}/${tasks.length}] 🔧 ${task.description}`);
    logger.log(`📄 File: ${task.file}`);

    try {
      const fileContent = await fs.readFile(task.file, "utf-8");

      // Backup erstellen
      await createBackup(task.file, fileContent);
      logger.log("💾 Backup erstellt");

      // AI Reasoning
      logger.log("🤖 AI analysiert...");
      const fixedCode = await reasoning.analyzeFile(task.file, fileContent, task);

      if (!fixedCode || fixedCode.trim().length === 0) {
        logger.log("⏭️  Keine Änderung nötig");
        continue;
      }

      // Nur schreiben wenn unterschiedlich
      if (fixedCode !== fileContent) {
        await fs.writeFile(task.file, fixedCode, "utf-8");
        logger.log("✅ Fixed!");
        fixed++;
        task.status = "done";
      } else {
        logger.log("⏭️  Keine Änderung");
      }

    } catch (err) {
      logger.log(`❌ Error: ${err.message}`);
      errors++;
      task.status = "error";
    }

    // Rate-Limit-Pause (1 Sekunde für schnellere Durchführung)
    if (i < tasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  logger.log(`\n${"=".repeat(60)}`);
  logger.log(`✅ Fixed: ${fixed}`);
  logger.log(`❌ Errors: ${errors}`);
  logger.log(`📊 Total: ${tasks.length}`);
  logger.log(`${"=".repeat(60)}`);
};
