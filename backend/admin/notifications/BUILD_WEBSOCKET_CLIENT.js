// ============================================================
// VIBEAI – BUILD LOGS WEBSOCKET CLIENT (Frontend Example)
// ============================================================
// React/Vue/Vanilla JS example for live build logs
// ============================================================

class BuildLogStream {
  constructor(buildId, authToken) {
    this.buildId = buildId;
    this.authToken = authToken;
    this.ws = null;
    this.listeners = {
      connected: [],
      log: [],
      status: [],
      error: [],
      complete: [],
      disconnected: []
    };
  }

  // Connect to WebSocket
  connect() {
    const wsUrl = `ws://localhost:8005/ws/build/${this.buildId}?token=${this.authToken}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log(`✅ Connected to build ${this.buildId}`);
      this.trigger('connected', { buildId: this.buildId });
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'connected':
          this.trigger('connected', data);
          break;
          
        case 'log':
          this.trigger('log', data.text);
          console.log(`[BUILD LOG] ${data.text}`);
          break;
          
        case 'status':
          this.trigger('status', {
            status: data.status,
            progress: data.progress
          });
          console.log(`[STATUS] ${data.status} - ${data.progress}%`);
          break;
          
        case 'error':
          this.trigger('error', data.error);
          console.error(`[BUILD ERROR] ${data.error}`);
          break;
          
        case 'complete':
          this.trigger('complete', {
            success: data.success,
            artifacts: data.artifacts
          });
          console.log(`[BUILD COMPLETE] Success: ${data.success}`);
          break;
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.trigger('disconnected', {});
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        console.log('Reconnecting...');
        this.connect();
      }, 3000);
    };
  }

  // Send ping to keep connection alive
  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
    }
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
}


// ============================================================
// USAGE EXAMPLE (React)
// ============================================================

/*
import { useEffect, useState } from 'react';

function BuildMonitor({ buildId, authToken }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('CONNECTING');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stream = new BuildLogStream(buildId, authToken);

    // Listen to events
    stream.on('connected', () => {
      setStatus('CONNECTED');
    });

    stream.on('log', (text) => {
      setLogs(prev => [...prev, text]);
    });

    stream.on('status', ({ status, progress }) => {
      setStatus(status);
      setProgress(progress || 0);
    });

    stream.on('error', (error) => {
      console.error('Build error:', error);
    });

    stream.on('complete', ({ success, artifacts }) => {
      setStatus(success ? 'SUCCESS' : 'FAILED');
      console.log('Artifacts:', artifacts);
    });

    // Connect
    stream.connect();

    // Keep-alive ping every 30 seconds
    const pingInterval = setInterval(() => {
      stream.ping();
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(pingInterval);
      stream.disconnect();
    };
  }, [buildId, authToken]);

  return (
    <div className="build-monitor">
      <h2>Build: {buildId}</h2>
      
      <div className="status">
        Status: {status}
        {progress > 0 && <span> ({progress}%)</span>}
      </div>

      <div className="logs">
        {logs.map((log, i) => (
          <div key={i} className="log-line">{log}</div>
        ))}
      </div>
    </div>
  );
}
*/


// ============================================================
// USAGE EXAMPLE (Vue)
// ============================================================

/*
<template>
  <div class="build-monitor">
    <h2>Build: {{ buildId }}</h2>
    
    <div class="status">
      Status: {{ status }}
      <span v-if="progress > 0"> ({{ progress }}%)</span>
    </div>

    <div class="logs">
      <div v-for="(log, i) in logs" :key="i" class="log-line">
        {{ log }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['buildId', 'authToken'],
  
  data() {
    return {
      logs: [],
      status: 'CONNECTING',
      progress: 0,
      stream: null
    };
  },

  mounted() {
    this.stream = new BuildLogStream(this.buildId, this.authToken);

    this.stream.on('log', (text) => {
      this.logs.push(text);
    });

    this.stream.on('status', ({ status, progress }) => {
      this.status = status;
      this.progress = progress || 0;
    });

    this.stream.on('complete', ({ success }) => {
      this.status = success ? 'SUCCESS' : 'FAILED';
    });

    this.stream.connect();

    this.pingInterval = setInterval(() => {
      this.stream.ping();
    }, 30000);
  },

  beforeUnmount() {
    clearInterval(this.pingInterval);
    this.stream.disconnect();
  }
};
</script>
*/


// ============================================================
// USAGE EXAMPLE (Vanilla JS)
// ============================================================

/*
const buildId = 'build-abc123';
const authToken = 'your-jwt-token';

const stream = new BuildLogStream(buildId, authToken);

// Setup listeners
stream.on('log', (text) => {
  const logsDiv = document.getElementById('logs');
  const line = document.createElement('div');
  line.textContent = text;
  logsDiv.appendChild(line);
});

stream.on('status', ({ status, progress }) => {
  document.getElementById('status').textContent = 
    `${status} ${progress ? `- ${progress}%` : ''}`;
});

stream.on('complete', ({ success, artifacts }) => {
  console.log('Build complete!', success, artifacts);
  
  if (success && artifacts) {
    // Show download links
    artifacts.forEach(file => {
      console.log(`Download: ${file}`);
    });
  }
});

// Connect
stream.connect();

// Keep alive
setInterval(() => stream.ping(), 30000);
*/


export default BuildLogStream;
