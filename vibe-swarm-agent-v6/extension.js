const vscode = require("vscode");
const Sidebar = require("./sidebarView");
const DevConsole = require("./devconsoleView");
const Orchestrator = require("./swarm/orchestrator");
const guiBuilder = require("./services/guiBuilder");
const projectGenerator = require("./services/projectGenerator");
const logger = require("./utils/logger");

let sidebar;
let devConsole;

/**
 * Extension activation
 */
function activate(context) {
  logger.info("🔥 VIBE SWARM v6.0 activated");

  // Initialize UI providers
  sidebar = new Sidebar(context.extensionUri);
  devConsole = new DevConsole(context.extensionUri);

  // Register webview providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vibeSwarmSidebar", sidebar)
  );

  // Register commands
  registerCommands(context);

  logger.info("✅ SWARM ready - " + getAgentCount() + " agents online");
}

/**
 * Register all VS Code commands
 */
function registerCommands(context) {
  // Main SWARM command
  const swarmCommand = vscode.commands.registerCommand("vibe.swarm", async () => {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      vscode.window.showErrorMessage("Kein Workspace geöffnet!");
      return;
    }

    // Check API key
    if (!getApiKey()) {
      vscode.window.showErrorMessage("Bitte OpenAI API Key setzen: vibe.swarm.openaiApiKey");
      return;
    }

    sidebar.updateStatus("🚀 Initializing SWARM...");

    try {
      const orchestrator = new Orchestrator(sidebar, workspaceRoot);
      await orchestrator.run();

      vscode.window.showInformationMessage("✅ SWARM Task completed!");
    } catch (error) {
      logger.error(`SWARM error: ${error.message}`);
      vscode.window.showErrorMessage(`SWARM failed: ${error.message}`);
      sidebar.updateStatus(`❌ Error: ${error.message}`);
    }
  });

  // Autopilot mode
  const autopilotCommand = vscode.commands.registerCommand("vibe.swarmAutopilot", async () => {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) {
      vscode.window.showErrorMessage("Kein Workspace geöffnet!");
      return;
    }

    if (!getApiKey()) {
      vscode.window.showErrorMessage("Bitte OpenAI API Key setzen: vibe.swarm.openaiApiKey");
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      "Autopilot Mode aktivieren? SWARM wird autonom arbeiten ohne Bestätigung.",
      "Ja, starten",
      "Abbrechen"
    );

    if (confirm !== "Ja, starten") return;

    sidebar.updateStatus("🤖 Autopilot Mode activated");

    try {
      const orchestrator = new Orchestrator(sidebar, workspaceRoot, { autopilot: true });
      await orchestrator.runContinuous();

      vscode.window.showInformationMessage("✅ Autopilot completed!");
    } catch (error) {
      logger.error(`Autopilot error: ${error.message}`);
      vscode.window.showErrorMessage(`Autopilot failed: ${error.message}`);
    }
  });

  // GUI Builder
  const guiBuilderCommand = vscode.commands.registerCommand("vibe.guiBuilder", async () => {
    const description = await vscode.window.showInputBox({
      prompt: "Describe the UI you want to build",
      placeHolder: "e.g., Login screen with email/password fields and Google sign-in button"
    });

    if (!description) return;

    const framework = await vscode.window.showQuickPick(
      ["React", "Flutter", "SwiftUI", "Jetpack Compose", "Vue.js"],
      { placeHolder: "Select UI framework" }
    );

    if (!framework) return;

    sidebar.updateStatus("🎨 Generating UI...");

    try {
      const code = await guiBuilder.generateUI(description, framework);

      // Create new file with generated code
      const doc = await vscode.workspace.openTextDocument({
        content: code,
        language: getLanguageForFramework(framework)
      });
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage("✅ UI generated!");
      sidebar.updateStatus("✅ UI ready");
    } catch (error) {
      logger.error(`GUI Builder error: ${error.message}`);
      vscode.window.showErrorMessage(`GUI Builder failed: ${error.message}`);
    }
  });

  // Project Generator
  const projectGenCommand = vscode.commands.registerCommand("vibe.projectGen", async () => {
    const projectType = await vscode.window.showQuickPick(
      [
        "Full-Stack Web App (React + Node.js + PostgreSQL)",
        "Mobile App (Flutter)",
        "REST API (Node.js + Express)",
        "GraphQL API (Node.js + Apollo)",
        "Microservices (Node.js + Docker)",
        "Python REST API (FastAPI + PostgreSQL)",
        "Custom (describe your stack)"
      ],
      { placeHolder: "Select project type" }
    );

    if (!projectType) return;

    let stack = projectType;

    if (projectType.startsWith("Custom")) {
      const customStack = await vscode.window.showInputBox({
        prompt: "Describe your tech stack",
        placeHolder: "e.g., Vue.js frontend, Python Flask backend, MongoDB database"
      });
      if (!customStack) return;
      stack = customStack;
    }

    sidebar.updateStatus("🏗️ Generating project...");

    try {
      const project = await projectGenerator.generate(stack, getWorkspaceRoot());

      vscode.window.showInformationMessage(`✅ Project generated: ${project.name}`);
      sidebar.updateStatus("✅ Project ready");

      // Reload workspace
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    } catch (error) {
      logger.error(`Project Generator error: ${error.message}`);
      vscode.window.showErrorMessage(`Project Generator failed: ${error.message}`);
    }
  });

  // Dev Console
  const devConsoleCommand = vscode.commands.registerCommand("vibe.devConsole", async () => {
    const panel = vscode.window.createWebviewPanel(
      "vibeDevConsole",
      "VIBE Dev Console",
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    panel.webview.html = devConsole.getHtmlContent(panel.webview);
  });

  context.subscriptions.push(
    swarmCommand,
    autopilotCommand,
    guiBuilderCommand,
    projectGenCommand,
    devConsoleCommand
  );
}

/**
 * Get workspace root
 */
function getWorkspaceRoot() {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

/**
 * Get API key from settings
 */
function getApiKey() {
  return vscode.workspace.getConfiguration("vibe.swarm").get("openaiApiKey");
}

/**
 * Get agent count
 */
function getAgentCount() {
  return 10; // Chief Architect, PM, FeatureDev, Bugfix, Refactor, Tester, DevOps, Security, Docs, Review
}

/**
 * Get language ID for framework
 */
function getLanguageForFramework(framework) {
  const map = {
    "React": "javascriptreact",
    "Vue.js": "vue",
    "Flutter": "dart",
    "SwiftUI": "swift",
    "Jetpack Compose": "kotlin"
  };
  return map[framework] || "javascript";
}

/**
 * Extension deactivation
 */
function deactivate() {
  logger.info("VIBE SWARM v6.0 deactivated");
}

module.exports = { activate, deactivate };
