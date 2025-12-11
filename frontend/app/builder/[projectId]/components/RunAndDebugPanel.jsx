'use client';

import { useState } from 'react';
import { Play, Square, Bug, Settings } from 'lucide-react';

export default function RunAndDebugPanel({ projectId, activeFile }) {
  const [configurations, setConfigurations] = useState([
    { name: 'Launch App', type: 'node', command: 'npm start' },
    { name: 'Run Tests', type: 'test', command: 'npm test' },
    { name: 'Debug', type: 'debug', command: 'node --inspect index.js' }
  ]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState([]);

  const runConfiguration = async (config) => {
    setIsRunning(true);
    setOutput([`🚀 Running: ${config.name}...`]);
    setSelectedConfig(config);

    try {
      const response = await fetch('http://localhost:8005/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          command: config.command
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(prev => [...prev, data.output || 'Command executed']);
      } else {
        const error = await response.json();
        setOutput(prev => [...prev, `❌ Error: ${error.detail || 'Command failed'}`]);
      }
    } catch (error) {
      setOutput(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOutput(prev => [...prev, '⏹️ Execution stopped']);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Bug size={16} color="#858585" />
        <span style={{ fontSize: '12px', fontWeight: '500' }}>Run and Debug</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {}}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            <Settings size={12} />
          </button>
        </div>
      </div>

      {/* Configurations */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#858585',
          marginBottom: '8px'
        }}>
          Configurations
        </div>
        {configurations.map((config, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              background: selectedConfig?.name === config.name ? '#37373d' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedConfig(config)}
            onMouseEnter={(e) => {
              if (selectedConfig?.name !== config.name) {
                e.currentTarget.style.background = '#2d2d30';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedConfig?.name !== config.name) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Play size={12} color="#4ec9b0" />
            <span style={{ fontSize: '11px', flex: 1 }}>{config.name}</span>
            <span style={{ fontSize: '10px', color: '#858585' }}>{config.type}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => selectedConfig && runConfiguration(selectedConfig)}
          disabled={!selectedConfig || isRunning}
          style={{
            padding: '6px 12px',
            background: selectedConfig && !isRunning ? '#007acc' : '#3c3c3c',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '11px',
            cursor: selectedConfig && !isRunning ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Play size={12} />
          Start Debugging
        </button>
        {isRunning && (
          <button
            onClick={stopExecution}
            style={{
              padding: '6px 12px',
              background: '#f48771',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Square size={12} />
            Stop
          </button>
        )}
      </div>

      {/* Output */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        background: '#0d1117',
        color: '#c9d1d9'
      }}>
        {output.length === 0 ? (
          <div style={{ color: '#858585' }}>
            Select a configuration and click "Start Debugging"
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}






