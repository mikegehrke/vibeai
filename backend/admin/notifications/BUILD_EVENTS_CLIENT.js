// ============================================================
// VIBEAI – BUILD EVENTS WEBSOCKET CLIENT (Simplified)
// ============================================================
// Einfache Nutzung für Frontend
// ============================================================

class BuildEventsClient {
  constructor(buildId) {
    this.buildId = buildId;
    this.ws = null;
    this.listeners = {
      connected: [],
      log: [],
      status: [],
      error: [],
      complete: []
    };
  }

  // Connect to WebSocket
  connect() {
    const wsUrl = `ws://localhost:8005/ws/build-events/${this.buildId}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`✅ Connected to build ${this.buildId}`);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Trigger event handlers
      this.trigger(data.type, data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        console.log('Reconnecting...');
        this.connect();
      }, 3000);
    };
  }

  // Event listeners
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Keep alive ping
  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
    }
  }
}


// ============================================================
// USAGE EXAMPLE (Vanilla JS)
// ============================================================

/*
// 1. Start Build (REST API)
const response = await fetch('http://localhost:8005/build/start', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    project_id: 'proj-123',
    build_type: 'flutter_android'
  })
});

const {build_id} = await response.json();

// 2. Connect to Live Build Events
const buildEvents = new BuildEventsClient(build_id);

buildEvents.on('connected', (data) => {
  console.log('Connected:', data);
  document.getElementById('status').textContent = 'Connected';
});

buildEvents.on('log', (data) => {
  console.log('LOG:', data.text);
  
  // Add to log display
  const logDiv = document.getElementById('logs');
  const line = document.createElement('div');
  line.textContent = data.text;
  logDiv.appendChild(line);
});

buildEvents.on('status', (data) => {
  console.log('STATUS:', data.status, data.progress);
  
  document.getElementById('status').textContent = data.status;
  
  if (data.progress) {
    document.getElementById('progress').textContent = `${data.progress}%`;
  }
});

buildEvents.on('error', (data) => {
  console.error('ERROR:', data.error);
  alert('Build Error: ' + data.error);
});

buildEvents.on('complete', (data) => {
  console.log('COMPLETE:', data.success, data.artifacts);
  
  if (data.success) {
    alert('Build Successful! 🎉');
    
    // Show download links
    if (data.artifacts) {
      const downloads = document.getElementById('downloads');
      data.artifacts.forEach(file => {
        const link = document.createElement('a');
        link.href = `/build/download?build_id=${build_id}&file=${file}`;
        link.textContent = `Download ${file}`;
        downloads.appendChild(link);
      });
    }
  } else {
    alert('Build Failed ❌');
  }
});

// 3. Connect
buildEvents.connect();

// 4. Keep alive (optional)
setInterval(() => buildEvents.ping(), 30000);
*/


// ============================================================
// HTML EXAMPLE
// ============================================================

/*
<!DOCTYPE html>
<html>
<head>
  <title>Build Monitor</title>
  <style>
    .logs {
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: monospace;
      padding: 16px;
      height: 400px;
      overflow-y: auto;
      border-radius: 8px;
    }
    .status {
      padding: 8px;
      background: #007acc;
      color: white;
      border-radius: 4px;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <h1>Build Monitor</h1>
  
  <div class="status">
    Status: <span id="status">Connecting...</span>
    <span id="progress"></span>
  </div>
  
  <div class="logs" id="logs"></div>
  
  <div id="downloads"></div>
  
  <script src="build-events-client.js"></script>
  <script>
    // Your code here...
  </script>
</body>
</html>
*/


export default BuildEventsClient;
