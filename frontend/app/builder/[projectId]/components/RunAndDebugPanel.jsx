'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Bug, Settings } from 'lucide-react';

export default function RunAndDebugPanel({ 
  projectId, 
  activeFile, 
  files = [], 
  terminalRef,
  onPreviewStart // ⚡ Callback für Preview-Start
}) {
  // ⚡ DYNAMISCHE KONFIGURATIONEN: Basierend auf Projekttyp
  const detectProjectType = () => {
    if (!files || files.length === 0) return null;
    
    const fileNames = files.map(f => f.name || f.path || '').join(' ').toLowerCase();
    const filePaths = files.map(f => f.path || f.name || '').join(' ').toLowerCase();
    
    // Framework-Erkennung
    if (fileNames.includes('pubspec.yaml') || filePaths.includes('.dart')) {
      return 'flutter';
    }
    if (fileNames.includes('package.json') && (fileNames.includes('react') || filePaths.includes('jsx') || filePaths.includes('tsx'))) {
      return 'react';
    }
    if (fileNames.includes('next.config') || filePaths.includes('_app') || filePaths.includes('_document')) {
      return 'nextjs';
    }
    if (fileNames.includes('requirements.txt') || filePaths.includes('.py')) {
      return 'python';
    }
    if (fileNames.includes('package.json')) {
      return 'node';
    }
    if (fileNames.includes('cargo.toml') || filePaths.includes('.rs')) {
      return 'rust';
    }
    if (fileNames.includes('go.mod') || filePaths.includes('.go')) {
      return 'go';
    }
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle') || filePaths.includes('.java')) {
      return 'java';
    }
    if (filePaths.includes('.cs') || fileNames.includes('.csproj')) {
      return 'csharp';
    }
    
    return 'generic';
  };

  const projectType = detectProjectType();
  
  // ⚡ PROJEKTSPEZIFISCHE KONFIGURATIONEN
  const getConfigurations = () => {
    const baseConfigs = [];
    
    switch (projectType) {
      case 'flutter':
        baseConfigs.push(
          { name: 'Launch App', type: 'flutter', command: 'flutter run -d web-server', icon: '📱' },
          { name: 'Run Tests', type: 'test', command: 'flutter test', icon: '🧪' },
          { name: 'Build APK', type: 'build', command: 'flutter build apk', icon: '📦' },
          { name: 'Build Web', type: 'build', command: 'flutter build web', icon: '🌐' }
        );
        break;
      case 'react':
      case 'nextjs':
        baseConfigs.push(
          { name: 'Launch App', type: 'node', command: 'npm run dev', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'npm test', icon: '🧪' },
          { name: 'Build', type: 'build', command: 'npm run build', icon: '📦' },
          { name: 'Debug', type: 'debug', command: 'node --inspect node_modules/.bin/next dev', icon: '🐛' }
        );
        break;
      case 'python':
        baseConfigs.push(
          { name: 'Launch App', type: 'python', command: 'python app.py', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'pytest', icon: '🧪' },
          { name: 'Debug', type: 'debug', command: 'python -m pdb app.py', icon: '🐛' }
        );
        break;
      case 'node':
        baseConfigs.push(
          { name: 'Launch App', type: 'node', command: 'npm start', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'npm test', icon: '🧪' },
          { name: 'Debug', type: 'debug', command: 'node --inspect index.js', icon: '🐛' }
        );
        break;
      case 'rust':
        baseConfigs.push(
          { name: 'Launch App', type: 'rust', command: 'cargo run', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'cargo test', icon: '🧪' },
          { name: 'Build', type: 'build', command: 'cargo build --release', icon: '📦' }
        );
        break;
      case 'go':
        baseConfigs.push(
          { name: 'Launch App', type: 'go', command: 'go run main.go', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'go test ./...', icon: '🧪' },
          { name: 'Build', type: 'build', command: 'go build', icon: '📦' }
        );
        break;
      case 'java':
        baseConfigs.push(
          { name: 'Launch App', type: 'java', command: 'mvn spring-boot:run', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'mvn test', icon: '🧪' },
          { name: 'Build', type: 'build', command: 'mvn clean package', icon: '📦' }
        );
        break;
      case 'csharp':
        baseConfigs.push(
          { name: 'Launch App', type: 'csharp', command: 'dotnet run', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'dotnet test', icon: '🧪' },
          { name: 'Build', type: 'build', command: 'dotnet build', icon: '📦' }
        );
        break;
      default:
        baseConfigs.push(
          { name: 'Launch App', type: 'generic', command: 'npm start', icon: '🚀' },
          { name: 'Run Tests', type: 'test', command: 'npm test', icon: '🧪' }
        );
    }
    
    return baseConfigs;
  };

  const [configurations, setConfigurations] = useState(() => getConfigurations());
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState([]);
  const outputEndRef = useRef(null);
  const runningProcessRef = useRef(null);

  // ⚡ UPDATE KONFIGURATIONEN wenn Files sich ändern
  useEffect(() => {
    const newConfigs = getConfigurations();
    setConfigurations(newConfigs);
    // Wähle erste Konfiguration automatisch wenn keine ausgewählt
    if (newConfigs.length > 0 && !selectedConfig) {
      setSelectedConfig(newConfigs[0]);
    }
    // Wenn aktuelle Konfiguration nicht mehr existiert, wähle erste
    if (selectedConfig && !newConfigs.find(c => c.name === selectedConfig.name)) {
      setSelectedConfig(newConfigs[0]);
    }
  }, [files, projectType]);

  // ⚡ AUTO-SCROLL zu letztem Output
  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const runConfiguration = async (config) => {
    setIsRunning(true);
    setOutput([`🚀 Running: ${config.name}...`, `📝 Command: ${config.command}`, '']);
    setSelectedConfig(config);

    try {
      // ⚡ SPEZIAL: "Launch App" startet auch Preview
      const isLaunchApp = config.name === 'Launch App';
      
      if (isLaunchApp && onPreviewStart) {
        setOutput(prev => [...prev, '📱 Starting preview server...']);
        try {
          // Bestimme Preview-Typ basierend auf Projekttyp
          let previewType = 'web';
          if (projectType === 'flutter') {
            previewType = 'flutter';
          } else if (projectType === 'react' || projectType === 'nextjs') {
            previewType = 'web';
          } else if (projectType === 'python') {
            previewType = 'web'; // Python kann auch Web-Server haben
          }
          
          // Starte Preview
          await onPreviewStart(previewType);
          setOutput(prev => [...prev, '✅ Preview server started!', '🌐 Opening browser tab...']);
        } catch (previewError) {
          setOutput(prev => [...prev, `⚠️ Preview start failed: ${previewError.message}`, 'Continuing with command execution...']);
        }
      }

      // ⚡ WICHTIG: Verwende Terminal-Ref wenn verfügbar (für Live-Output)
      if (terminalRef?.current?.executeCommand) {
        console.log('✅ Verwende Terminal-Ref für Live-Output');
        // Terminal öffnen und Command ausführen
        const result = await terminalRef.current.executeCommand(config.command);
        if (result && result.output) {
          const outputLines = (result.output || '').split('\n');
          setOutput(prev => [...prev, ...outputLines]);
        }
      } else {
        // Fallback: API-Call
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
          const outputLines = (data.output || 'Command executed').split('\n');
          setOutput(prev => [...prev, ...outputLines]);
        } else {
          const error = await response.json();
          setOutput(prev => [...prev, `❌ Error: ${error.detail || 'Command failed'}`]);
        }
      }
      
      if (isLaunchApp) {
        setOutput(prev => [...prev, '', '✅ App launched successfully!', '📱 Check the preview panel or browser tab.']);
      }
    } catch (error) {
      setOutput(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
      runningProcessRef.current = null;
    }
  };

  const stopExecution = async () => {
    setIsRunning(false);
    setOutput(prev => [...prev, '⏹️ Execution stopped']);
    
    // ⚡ Versuche Prozess zu stoppen (falls Terminal-Ref verfügbar)
    if (terminalRef?.current?.stopCommand) {
      await terminalRef.current.stopCommand();
    }
    
    runningProcessRef.current = null;
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
        {projectType && (
          <span style={{ 
            fontSize: '10px', 
            color: '#4ec9b0', 
            padding: '2px 6px', 
            background: '#1e1e1e', 
            borderRadius: '3px' 
          }}>
            {projectType.toUpperCase()}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              // Refresh configurations
              const newConfigs = getConfigurations();
              setConfigurations(newConfigs);
              if (newConfigs.length > 0 && !selectedConfig) {
                setSelectedConfig(newConfigs[0]);
              }
            }}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '10px',
              cursor: 'pointer'
            }}
            title="Refresh configurations"
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
            <span style={{ fontSize: '14px' }}>{config.icon || '▶️'}</span>
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
        gap: '8px',
        flexDirection: 'column'
      }}>
        {/* ⚡ DYNAMISCHER BUTTON-TEXT: Basierend auf ausgewählter Konfiguration */}
        <button
          onClick={() => {
            if (selectedConfig && !isRunning) {
              runConfiguration(selectedConfig);
            }
          }}
          disabled={!selectedConfig || isRunning}
          style={{
            padding: '8px 16px',
            background: selectedConfig && !isRunning ? '#007acc' : '#3c3c3c',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '500',
            cursor: selectedConfig && !isRunning ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (selectedConfig && !isRunning) {
              e.currentTarget.style.background = '#005a9e';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedConfig && !isRunning) {
              e.currentTarget.style.background = '#007acc';
            }
          }}
        >
          <Play size={14} />
          {(() => {
            if (!selectedConfig) return 'Select a configuration';
            if (isRunning) return 'Running...';
            // Dynamischer Text basierend auf Konfiguration
            if (selectedConfig.type === 'debug') return 'Start Debugging';
            if (selectedConfig.name === 'Launch App') return 'Launch App';
            if (selectedConfig.type === 'test') return 'Run Tests';
            if (selectedConfig.type === 'build') return 'Build';
            return 'Run';
          })()}
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
              justifyContent: 'center',
              gap: '4px',
              width: '100%',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d66b5a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f48771';
            }}
          >
            <Square size={12} />
            Stop Execution
          </button>
        )}
        
        {/* ⚡ INFO: Zeige ausgewählte Konfiguration */}
        {selectedConfig && !isRunning && (
          <div style={{
            fontSize: '10px',
            color: '#858585',
            padding: '4px 8px',
            background: '#1e1e1e',
            borderRadius: '3px',
            textAlign: 'center'
          }}>
            {selectedConfig.icon} {selectedConfig.name} • {selectedConfig.command}
          </div>
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
          <>
            {output.map((line, index) => (
              <div key={index} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap' }}>
                {line}
              </div>
            ))}
            <div ref={outputEndRef} />
          </>
        )}
      </div>
    </div>
  );
}






