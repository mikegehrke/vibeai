const vscode = require("vscode");

let currentPanel = null;

exports.createPanel = function (logger) {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Two);
    currentPanel.webview.html = getWebviewContent(logger);
    return;
  }

  currentPanel = vscode.window.createWebviewPanel(
    "vibeAgentPanel",
    "VIBE Agent – Logs",
    vscode.ViewColumn.Two,
    {
      enableScripts: true
    }
  );

  currentPanel.webview.html = getWebviewContent(logger);

  currentPanel.onDidDispose(() => {
    currentPanel = null;
  });
};

function getWebviewContent(logger) {
  const logs = logger.getLogs();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      font-size: 14px;
    }
    h2 {
      color: #4ec9b0;
      border-bottom: 2px solid #4ec9b0;
      padding-bottom: 10px;
    }
    pre {
      background: #252526;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .timestamp {
      color: #608b4e;
    }
  </style>
</head>
<body>
  <h2>🤖 VIBE AGENT LOGS</h2>
  <pre>${logs || "Keine Logs verfügbar. Starte den Agent mit 'Vibe Agent: Auto Fix Project'"}</pre>
</body>
</html>`;
}
