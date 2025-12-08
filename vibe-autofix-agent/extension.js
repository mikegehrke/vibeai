const vscode = require("vscode");
const { scanFiles } = require("./core/fileScanner");
const planner = require("./agent/planner");
const executor = require("./agent/executor");
const logger = require("./agent/logger");
const { createPanel } = require("./panel/panel");

async function activate(context) {
  console.log("VIBE Auto-Fix Agent v2.0 activated.");

  const runAutoFix = vscode.commands.registerCommand("vibe.autofix", async () => {
    logger.clear();
    logger.log("🤖 Agent gestartet – analysiere dein Projekt …");

    const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!folder) {
      vscode.window.showErrorMessage("Kein Projekt gefunden.");
      return;
    }

    logger.log(`📁 Workspace: ${folder}`);

    const files = await scanFiles(folder);
    logger.log(`✅ Gefundene Dateien: ${files.length}`);

    vscode.window.showInformationMessage(`VIBE Agent analysiert ${files.length} Dateien...`);

    const taskPlan = await planner.createPlan(files);
    logger.log(`📋 Plan erstellt: ${taskPlan.length} Tasks`);
    logger.log(JSON.stringify(taskPlan, null, 2));

    await executor.run(taskPlan, logger);

    vscode.window.showInformationMessage("✅ VIBE Agent: Auto-Fix abgeschlossen!");
    logger.log("🎉 Alle Tasks abgeschlossen!");
  });

  const showPanel = vscode.commands.registerCommand("vibe.agentPanel", () => {
    createPanel(logger);
  });

  context.subscriptions.push(runAutoFix, showPanel);
}

function deactivate() { }

module.exports = { activate, deactivate };
