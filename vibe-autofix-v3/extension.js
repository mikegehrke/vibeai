const vscode = require("vscode");
const path = require("path");
const { scanWorkspaceFiles, readFileContent, writeFileContent } = require("./services/fileService");
const { createSnapshot, restoreSnapshot, listSnapshots } = require("./services/snapshotService");
const { applyUnifiedPatch, previewPatch } = require("./services/patchService");
const logger = require("./utils/logger");

const analyzerAgent = require("./agents/analyzerAgent");
const fixAgent = require("./agents/fixAgent");
const refactorAgent = require("./agents/refactorAgent");
const securityAgent = require("./agents/securityAgent");

let sidebarProvider;

/**
 * Extension activation entry point
 */
function activate(context) {
  logger.info("🔥 VIBE Auto-Fix Agent v3.0 activated");

  // Initialize sidebar provider
  const SidebarViewProvider = require("./sidebarView");
  sidebarProvider = new SidebarViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vibeSidebar", sidebarProvider)
  );

  // Register commands
  registerCommands(context);

  logger.info("✅ Extension ready");
}

/**
 * Register all VS Code commands
 */
function registerCommands(context) {
  // Main auto-fix command
  const autofixCommand = vscode.commands.registerCommand("vibe.autofix", async () => {
    await runAutoFix(false);
  });

  // Autopilot mode command
  const autopilotCommand = vscode.commands.registerCommand("vibe.autopilot", async () => {
    await runAutoFix(true);
  });

  // Create snapshot command
  const snapshotCommand = vscode.commands.registerCommand("vibe.snapshot", async () => {
    const folder = getWorkspaceRoot();
    if (!folder) return;

    sidebarProvider.updateStatus("Creating snapshot...");
    const snapshotId = await createSnapshot(folder);
    sidebarProvider.updateStatus(`✅ Snapshot created: ${snapshotId}`);
    vscode.window.showInformationMessage(`Snapshot created: ${snapshotId}`);
  });

  context.subscriptions.push(autofixCommand, autopilotCommand, snapshotCommand);
}

/**
 * Main auto-fix pipeline
 */
async function runAutoFix(autopilotMode) {
  const folder = getWorkspaceRoot();
  if (!folder) {
    vscode.window.showErrorMessage("Kein Workspace geöffnet!");
    return;
  }

  // Check API key
  const apiKey = vscode.workspace.getConfiguration("vibe").get("openaiApiKey");
  if (!apiKey) {
    vscode.window.showErrorMessage("Bitte OpenAI API Key in Settings setzen: vibe.openaiApiKey");
    return;
  }

  logger.info("🚀 Starting Auto-Fix pipeline...");
  sidebarProvider.updateStatus("🔍 Scanning workspace...");

  try {
    // Create snapshot before any changes
    const snapshotId = await createSnapshot(folder);
    logger.info(`📸 Snapshot created: ${snapshotId}`);
    sidebarProvider.updateStatus(`📸 Snapshot: ${snapshotId}`);

    // Scan all files
    const files = await scanWorkspaceFiles(folder);
    logger.info(`Found ${files.length} files to process`);
    sidebarProvider.updateStatus(`Found ${files.length} files`);

    let fixedCount = 0;
    let errorCount = 0;

    // Process each file through agent pipeline
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = path.relative(folder, file);

      logger.info(`[${i + 1}/${files.length}] Processing: ${relativePath}`);
      sidebarProvider.logFile(`[${i + 1}/${files.length}] ${relativePath}`);
      sidebarProvider.updateStatus(`Processing ${i + 1}/${files.length}...`);

      try {
        const code = await readFileContent(file);

        // Agent pipeline: Analyzer → Fix → Refactor → Security
        logger.info(`  🔍 Analyzer Agent...`);
        const analysis = await analyzerAgent.run(file, code);

        if (!analysis.problems || analysis.problems.length === 0) {
          logger.info(`  ✅ No issues found`);
          sidebarProvider.logSkip(relativePath);
          continue;
        }

        logger.info(`  🛠️  Fix Agent...`);
        const fixes = await fixAgent.run(file, analysis, code);

        logger.info(`  ✨ Refactor Agent...`);
        const refactored = await refactorAgent.run(file, fixes, code);

        logger.info(`  🛡️  Security Agent...`);
        const secured = await securityAgent.run(file, refactored, code);

        // Apply patch if we have one
        if (secured.patch) {
          if (autopilotMode) {
            // Auto-apply in autopilot mode
            await applyUnifiedPatch(file, code, secured.patch);
            logger.info(`  ✅ Patch applied automatically`);
            sidebarProvider.logFixed(relativePath);
            fixedCount++;
          } else {
            // Show preview and ask user
            const preview = await previewPatch(code, secured.patch);
            const action = await vscode.window.showInformationMessage(
              `Apply fixes to ${relativePath}?`,
              "Apply", "Skip", "Preview"
            );

            if (action === "Apply") {
              await applyUnifiedPatch(file, code, secured.patch);
              logger.info(`  ✅ Patch applied`);
              sidebarProvider.logFixed(relativePath);
              fixedCount++;
            } else if (action === "Preview") {
              // Show diff in editor
              const doc = await vscode.workspace.openTextDocument({ content: preview, language: "diff" });
              await vscode.window.showTextDocument(doc);
            } else {
              logger.info(`  ⏭️  Skipped by user`);
              sidebarProvider.logSkip(relativePath);
            }
          }
        } else {
          logger.info(`  ℹ️  No patch generated`);
          sidebarProvider.logSkip(relativePath);
        }

      } catch (error) {
        logger.error(`  ❌ Error processing ${relativePath}: ${error.message}`);
        sidebarProvider.logError(relativePath, error.message);
        errorCount++;
      }

      // Rate limiting
      await sleep(1000);
    }

    // Final summary
    const summary = `✅ Auto-Fix complete!\n\n` +
      `Files processed: ${files.length}\n` +
      `Files fixed: ${fixedCount}\n` +
      `Errors: ${errorCount}\n` +
      `Snapshot: ${snapshotId}`;

    logger.info(summary);
    sidebarProvider.updateStatus("✅ Complete");
    vscode.window.showInformationMessage(summary);

  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    sidebarProvider.updateStatus(`❌ Error: ${error.message}`);
    vscode.window.showErrorMessage(`Auto-Fix failed: ${error.message}`);
  }
}

/**
 * Get workspace root folder
 */
function getWorkspaceRoot() {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extension deactivation
 */
function deactivate() {
  logger.info("VIBE Auto-Fix Agent v3.0 deactivated");
}

module.exports = { activate, deactivate };
