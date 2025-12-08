const vscode = require("vscode");

/**
 * Dev Console webview for detailed swarm activity
 */
class DevConsoleView {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
  }

  getHtmlContent(webview) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VIBE Dev Console</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: monospace;
      color: #eee;
      background: #1e1e1e;
      padding: 20px;
    }
    h1 {
      color: #4fc3f7;
      margin-bottom: 20px;
    }
    .console {
      background: #252526;
      padding: 16px;
      border-radius: 4px;
      max-height: 80vh;
      overflow-y: auto;
    }
    .log {
      margin: 4px 0;
      padding: 4px 8px;
      border-left: 3px solid #444;
    }
    .log.info { border-left-color: #4fc3f7; }
    .log.warn { border-left-color: #ffb74d; }
    .log.error { border-left-color: #e57373; }
    .log.success { border-left-color: #81c784; }
    ::-webkit-scrollbar {
      width: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>🔥 VIBE SWARM Dev Console</h1>
  <div class="console" id="console">
    <div class="log info">Dev Console ready...</div>
  </div>

  <script>
    const consoleEl = document.getElementById("console");

    function addLog(type, message) {
      const log = document.createElement("div");
      log.className = "log " + type;
      log.textContent = "[" + new Date().toLocaleTimeString() + "] " + message;
      consoleEl.appendChild(log);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    // Simulate activity
    setInterval(() => {
      const types = ["info", "success", "warn"];
      const messages = [
        "Agent processing...",
        "Task completed",
        "Analyzing codebase...",
        "Generating patch...",
        "Review in progress..."
      ];
      addLog(
        types[Math.floor(Math.random() * types.length)],
        messages[Math.floor(Math.random() * messages.length)]
      );
    }, 3000);
  </script>
</body>
</html>`;
  }
}

module.exports = DevConsoleView;
