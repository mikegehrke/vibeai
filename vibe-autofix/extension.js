const vscode = require("vscode");
const { scanFiles } = require("./fileScanner");
const { generatePatch } = require("./openaiClient");
const { applyPatch } = require("./patcher");
const { backupFile } = require("./utils/backup");

async function activate(context) {
  console.log("VIBE Auto-Fix Agent activated.");

  let disposable = vscode.commands.registerCommand("vibe.autofix", async () => {
    vscode.window.showInformationMessage("VIBE Auto-Fix gestartet…");

    const folder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!folder) {
      vscode.window.showErrorMessage("Kein geöffnetes Projekt gefunden.");
      return;
    }

    const files = await scanFiles(folder);
    vscode.window.showInformationMessage(`Gefundene Dateien: ${files.length}`);

    let fixed = 0;
    let errors = 0;

    for (const file of files) {
      try {
        const document = await vscode.workspace.openTextDocument(file);
        const originalCode = document.getText();

        await backupFile(file, originalCode);

        vscode.window.showInformationMessage(`Repariere: ${file}`);

        const patch = await generatePatch(file, originalCode);
        if (!patch) {
          errors++;
          continue;
        }

        await applyPatch(file, originalCode, patch);
        fixed++;

      } catch (err) {
        errors++;
        console.error(`Error fixing ${file}:`, err);
      }
    }

    vscode.window.showInformationMessage(
      `VIBE Auto-Fix abgeschlossen! ✅ ${fixed} behoben, ❌ ${errors} Fehler`
    );
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};
