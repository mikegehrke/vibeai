const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

/**
 * Sidebar webview provider for SWARM status
 */
class SidebarViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case "clearLogs":
          this.clearLogs();
          break;
      }
    });
  }

  updateStatus(message) {
    if (this._view) {
      this._view.webview.postMessage({ type: "status", text: message });
    }
  }

  logAgent(agentName, message) {
    if (this._view) {
      this._view.webview.postMessage({ type: "agent", agent: agentName, message });
    }
  }

  logAgentMessage(from, to, message) {
    if (this._view) {
      this._view.webview.postMessage({ type: "agentMessage", from, to, message });
    }
  }

  clearLogs() {
    if (this._view) {
      this._view.webview.postMessage({ type: "clear" });
    }
  }

  _getHtmlContent(webview) {
    const htmlPath = path.join(__dirname, "webview", "sidebar.html");

    if (fs.existsSync(htmlPath)) {
      return fs.readFileSync(htmlPath, "utf8");
    }

    return this._getInlineHtml();
  }

  _getInlineHtml() {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIBE SWARM</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
    }
    h2 {
      font-size: 18px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    #status {
      padding: 12px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .controls {
      margin-bottom: 16px;
    }
    button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    #log {
      max-height: 600px;
      overflow-y: auto;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
    }
    .log-item {
      padding: 8px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 12px;
      font-family: var(--vscode-editor-font-family);
    }
    .log-item:last-child {
      border-bottom: none;
    }
    .log-item.agent {
      color: var(--vscode-terminal-ansiBlue);
      font-weight: 500;
    }
    .log-item.message {
      color: var(--vscode-terminal-ansiGreen);
      font-style: italic;
    }
    ::-webkit-scrollbar {
      width: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--vscode-scrollbarSlider-background);
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h2>🔥 VIBE SWARM v6.0</h2>
  <div id="status">Waiting...</div>
  <div class="controls">
    <button onclick="clearLogs()">Clear</button>
  </div>
  <div id="log"></div>

  <script>
    const vscode = acquireVsCodeApi();
    const log = document.getElementById("log");
    const status = document.getElementById("status");

    window.addEventListener("message", event => {
      const msg = event.data;

      switch (msg.type) {
        case "status":
          status.textContent = msg.text;
          break;

        case "agent":
          addLog("agent", msg.agent + ": " + msg.message);
          break;

        case "agentMessage":
          addLog("message", msg.from + " → " + msg.to + ": " + msg.message);
          break;

        case "clear":
          log.innerHTML = "";
          break;
      }

      log.scrollTop = log.scrollHeight;
    });

    function addLog(type, text) {
      const item = document.createElement("div");
      item.className = "log-item " + type;
      item.textContent = text;
      log.appendChild(item);
    }

    function clearLogs() {
      vscode.postMessage({ type: "clearLogs" });
    }
  </script>
</body>
</html>`;
  }
}

module.exports = SidebarViewProvider;
