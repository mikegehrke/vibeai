/* --------------------------------------------------------
   VIBEAI – LIVE PREVIEW COMPONENT (FLUTTER/REACT)
   -------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import './LivePreview.css';

/**
 * Live Preview Component
 * 
 * Displays Flutter/React dev server in IFRAME with live logs
 * 
 * Features:
 * - Start/Stop server
 * - Live logs via WebSocket
 * - Hot reload detection
 * - Server status monitoring
 */
export default function LivePreview({ 
  projectPath, 
  framework = 'flutter',
  onServerStart,
  onServerStop
}) {
  const [serverStatus, setServerStatus] = useState('stopped');
  const [serverId, setServerId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);

  // Start server
  const startServer = async () => {
    try {
      setServerStatus('starting');

      const endpoint = framework === 'flutter' 
        ? '/preview/flutter/start'
        : '/preview/react/start';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: projectPath })
      });

      const data = await res.json();

      if (data.success) {
        setServerId(data.server_id);
        setPreviewUrl(data.url);
        setServerStatus('running');
        
        // Connect WebSocket for logs
        connectWebSocket(data.server_id);

        if (onServerStart) {
          onServerStart(data);
        }
      } else {
        setServerStatus('error');
        addLog({ type: 'error', message: data.error || 'Failed to start server' });
      }
    } catch (error) {
      setServerStatus('error');
      addLog({ type: 'error', message: error.message });
    }
  };

  // Stop server
  const stopServer = async () => {
    if (!serverId) return;

    try {
      const endpoint = framework === 'flutter'
        ? '/preview/flutter/stop'
        : '/preview/react/stop';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId })
      });

      const data = await res.json();

      if (data.success) {
        setServerStatus('stopped');
        setServerId(null);
        setPreviewUrl(null);

        // Close WebSocket
        if (wsConnection) {
          wsConnection.close();
          setWsConnection(null);
        }

        if (onServerStop) {
          onServerStop(data);
        }
      }
    } catch (error) {
      addLog({ type: 'error', message: error.message });
    }
  };

  // Reload preview (Flutter hot reload)
  const reloadPreview = async () => {
    if (!serverId || framework !== 'flutter') return;

    try {
      const res = await fetch('/preview/flutter/reload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_id: serverId })
      });

      const data = await res.json();
      
      if (data.success) {
        addLog({ type: 'event', message: '🔥 Hot Reload Triggered' });
      }
    } catch (error) {
      addLog({ type: 'error', message: error.message });
    }
  };

  // WebSocket connection for live logs
  const connectWebSocket = (sid) => {
    const ws = new WebSocket(`ws://localhost:8000/preview/ws/logs/${sid}`);

    ws.onopen = () => {
      addLog({ type: 'info', message: '📡 Connected to live logs' });
    };

    ws.onmessage = (event) => {
      const log = JSON.parse(event.data);
      addLog(log);
    };

    ws.onerror = (error) => {
      addLog({ type: 'error', message: 'WebSocket error' });
    };

    ws.onclose = () => {
      addLog({ type: 'info', message: '📡 Disconnected from live logs' });
    };

    setWsConnection(ws);
  };

  // Add log
  const addLog = (log) => {
    setLogs(prev => [...prev, { ...log, timestamp: Date.now() }].slice(-100));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  return (
    <div className="live-preview">
      {/* Header */}
      <div className="preview-header">
        <div className="preview-title">
          <span className="preview-icon">
            {framework === 'flutter' ? '📱' : '⚛️'}
          </span>
          <span>{framework === 'flutter' ? 'Flutter' : 'React'} Live Preview</span>
        </div>

        <div className="preview-controls">
          {serverStatus === 'stopped' && (
            <button onClick={startServer} className="btn-start">
              ▶️ Start Server
            </button>
          )}

          {serverStatus === 'running' && (
            <>
              {framework === 'flutter' && (
                <button onClick={reloadPreview} className="btn-reload">
                  🔥 Hot Reload
                </button>
              )}
              <button onClick={stopServer} className="btn-stop">
                ⏹️ Stop
              </button>
            </>
          )}

          <div className={`status-indicator status-${serverStatus}`}>
            {serverStatus === 'starting' && '⏳ Starting...'}
            {serverStatus === 'running' && '✅ Running'}
            {serverStatus === 'stopped' && '⏸️ Stopped'}
            {serverStatus === 'error' && '❌ Error'}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content">
        {/* IFRAME Preview */}
        <div className="preview-frame-container">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="preview-frame"
              title="Live Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          ) : (
            <div className="preview-placeholder">
              <div className="placeholder-icon">
                {framework === 'flutter' ? '📱' : '⚛️'}
              </div>
              <div className="placeholder-text">
                Click "Start Server" to launch live preview
              </div>
              <div className="placeholder-info">
                Project: {projectPath || 'Not set'}
              </div>
            </div>
          )}
        </div>

        {/* Logs Panel */}
        <div className="logs-panel">
          <div className="logs-header">
            <span>📋 Live Logs</span>
            <button 
              onClick={() => setLogs([])} 
              className="btn-clear-logs"
            >
              Clear
            </button>
          </div>

          <div className="logs-content">
            {logs.length === 0 && (
              <div className="logs-empty">No logs yet</div>
            )}

            {logs.map((log, idx) => (
              <div key={idx} className={`log-entry log-${log.type}`}>
                <span className="log-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
