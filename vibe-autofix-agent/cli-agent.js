#!/usr/bin/env node

/**
 * VIBE Auto-Fix Agent v2.0 - Standalone CLI
 * Läuft ohne VS Code direkt im Terminal
 */

const path = require("path");
const { scanFiles } = require("./core/fileScanner");
const planner = require("./agent/planner");
const executor = require("./agent/executor");
const logger = require("./agent/logger");

async function main() {
  console.log("🤖 VIBE Auto-Fix Agent v2.0 gestartet\n");

  logger.clear();
  logger.log("Agent analysiert Projekt...");

  const workspaceRoot = path.join(__dirname, "..");
  logger.log(`📁 Workspace: ${workspaceRoot}`);

  const files = await scanFiles(workspaceRoot);
  console.log(`✅ Gefundene Dateien: ${files.length}`);

  if (files.length === 0) {
    console.log("❌ Keine Python-Dateien gefunden in backend/");
    return;
  }

  console.log("\n📂 Sample Dateien:");
  files.slice(0, 5).forEach(f => console.log(`  - ${f}`));
  console.log("");

  console.log(`\n📋 Erstelle Task-Plan...\n`);

  const taskPlan = await planner.createPlan(files);
  logger.log(`📋 Plan erstellt: ${taskPlan.length} Tasks`);

  console.log("\n" + "=".repeat(60));
  console.log(`TASK PLAN: ${taskPlan.length} Dateien werden analysiert`);
  console.log("=".repeat(60));
  console.log("Jede Datei wird mit GPT-4o auf Fehler analysiert:");
  console.log("  - Import-Fehler");
  console.log("  - Syntax-Fehler");
  console.log("  - Undefined Variables");
  console.log("  - Type-Errors");
  console.log("  - Code-Smells");
  console.log("=".repeat(60) + "\n");

  console.log("🚀 Starte Execution...\n");

  await executor.run(taskPlan, logger);

  console.log("\n✅ VIBE Agent: Auto-Fix abgeschlossen!");
  console.log(`📦 Backups: ${workspaceRoot}/.vibe-agent-backup/\n`);

  // Finale Stats
  const done = taskPlan.filter(t => t.status === "done").length;
  const errors = taskPlan.filter(t => t.status === "error").length;

  console.log("=".repeat(60));
  console.log(`✅ Erfolgreich: ${done}/${taskPlan.length}`);
  console.log(`❌ Fehler: ${errors}/${taskPlan.length}`);
  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});
