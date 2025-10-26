// 🚀 ULTRA AI Code Studio - Professional IDE with ALL Features
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import GitPanel from './GitPanel';
import { FiPlay, FiDownload, FiFolder, FiPlus, FiX, FiSettings, FiZap, FiTerminal, FiCpu, FiCheckCircle, FiPackage, FiFileText } from 'react-icons/fi';
import './CodeStudio.css';

const CodeStudio = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'main.dart', language: 'dart', content: '// Welcome to Ultra AI Code Studio\nvoid main() {\n  print("Hello World!");\n}' }
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const [template, setTemplate] = useState('flutter');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiPanel, setAiPanel] = useState({ visible: false, mode: '' });
  const [terminalOutput, setTerminalOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [previewDevice, setPreviewDevice] = useState('iphone'); // iphone, android, web
  const [previewContent, setPreviewContent] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  
  // 🆕 ULTRA FEATURES
  const [projectPath, setProjectPath] = useState('');
  const [includeTests, setIncludeTests] = useState(true);
  const [includeStoreAssets, setIncludeStoreAssets] = useState(true);
  const [includeDeployment, setIncludeDeployment] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('files'); // files, git, settings
  
  const editorRef = useRef(null);

  const templates = [
    { id: 'flutter', name: '🦋 Flutter', lang: 'dart', file: 'main.dart' },
    { id: 'react', name: '⚛️ React', lang: 'javascript', file: 'App.jsx' },
    { id: 'python', name: '🐍 Python', lang: 'python', file: 'main.py' },
    { id: 'swift-ios', name: '🍎 Swift', lang: 'swift', file: 'ContentView.swift' },
    { id: 'kotlin-android', name: '🤖 Kotlin', lang: 'kotlin', file: 'MainActivity.kt' },
  ];

  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco settings
    monaco.editor.defineTheme('vibeai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0a0e27',
        'editor.foreground': '#e0e0e0',
      }
    });
    monaco.editor.setTheme('vibeai-dark');
    
    // Add AI autocomplete
    monaco.languages.registerCompletionItemProvider(activeFile?.language || 'dart', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'AI: Generate function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '// AI will generate this...',
            documentation: 'Let AI write this function for you'
          }
        ]
      })
    });
  };

  const generateProject = async () => {
    setGenerating(true);
    setTerminalOutput('🏗️ Generating ULTRA project with all features...\n');
    
    try {
      // 🆕 Build enhanced feature list with Ultra options
      let enhancedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      
      if (includeTests) {
        enhancedFeatures.push('comprehensive unit tests');
        enhancedFeatures.push('integration tests');
        setTerminalOutput(prev => prev + '🧪 Adding tests...\n');
      }
      
      if (includeStoreAssets) {
        enhancedFeatures.push('app store description');
        enhancedFeatures.push('privacy policy');
        enhancedFeatures.push('terms of service');
        setTerminalOutput(prev => prev + '📱 Adding store assets...\n');
      }
      
      if (includeDeployment) {
        enhancedFeatures.push('CI/CD pipeline config');
        enhancedFeatures.push('deployment scripts');
        enhancedFeatures.push('environment configs');
        setTerminalOutput(prev => prev + '🚀 Adding deployment configs...\n');
      }
      
      const response = await fetch('http://localhost:8005/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          description,
          features: enhancedFeatures
        })
      });

      const data = await response.json();
      
      if (data.success && data.files) {
        const newFiles = data.files.map((file, idx) => ({
          id: idx + 1,
          name: file.filename,
          language: getLanguageFromFilename(file.filename),
          content: file.code
        }));
        
        setFiles(newFiles);
        setActiveFileId(1);
        setTerminalOutput(prev => prev + `\n✅ Generated ${newFiles.length} files with ULTRA features!\n${newFiles.map(f => `  - ${f.name}`).join('\n')}`);
        
        // Update preview
        updatePreview(newFiles);
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `\n❌ Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const updatePreview = (filesArray = files) => {
    const mainFile = filesArray.find(f => 
      f.name.includes('main.') || 
      f.name.includes('App.') || 
      f.name.includes('index.')
    );
    
    if (!mainFile) return;

    if (template === 'react' || template === 'vue' || template === 'nextjs') {
      // Web preview
      setPreviewContent(generateWebPreview(mainFile.content));
    } else if (template === 'flutter' || template === 'swift-ios' || template === 'kotlin-android') {
      // Mobile preview
      setPreviewContent(generateMobilePreview(mainFile.content, template));
    } else {
      // Code output
      setPreviewContent(generateCodeOutput(mainFile.content));
    }
  };

  const generateWebPreview = (code) => {
    // Extract React/Vue component and render
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { margin: 0; font-family: system-ui; background: #f5f5f5; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
          </script>
        </body>
      </html>
    `;
  };

  const generateMobilePreview = (code, framework) => {
    // Simulate mobile app UI
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #333;
            }
            .app-preview {
              background: white;
              border-radius: 16px;
              padding: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 100%;
              animation: fadeIn 0.5s ease;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .preview-header {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 16px;
              color: #667eea;
            }
            .preview-content {
              background: #f8f9fa;
              padding: 16px;
              border-radius: 8px;
              white-space: pre-wrap;
              font-family: 'SF Mono', Monaco, monospace;
              font-size: 13px;
              line-height: 1.6;
              max-height: 500px;
              overflow-y: auto;
            }
            .status-bar {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              padding: 8px 16px;
              border-radius: 8px 8px 0 0;
              font-size: 12px;
              display: flex;
              justify-content: space-between;
              margin: -20px -20px 16px;
            }
          </style>
        </head>
        <body>
          <div class="app-preview">
            <div class="status-bar">
              <span>📱 ${framework === 'flutter' ? 'Flutter App' : framework === 'swift-ios' ? 'iOS App' : 'Android App'}</span>
              <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="preview-header">🎨 Live Preview</div>
            <div class="preview-content">${escapeHtml(code)}</div>
          </div>
        </body>
      </html>
    `;
  };

  const generateCodeOutput = (code) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #1e1e1e;
              color: #d4d4d4;
              font-family: 'Consolas', 'Monaco', monospace;
            }
            pre {
              background: #2d2d2d;
              padding: 20px;
              border-radius: 8px;
              overflow-x: auto;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <pre>${escapeHtml(code)}</pre>
        </body>
      </html>
    `;
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const aiChangeRequest = async () => {
    if (!aiInstruction.trim()) return;
    
    setAiPanel({ visible: true, mode: 'modifying' });
    setTerminalOutput(prev => prev + `\n🤖 AI: "${aiInstruction}"\n`);
    
    try {
      const response = await fetch('http://localhost:8005/api/improve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile?.content || '',
          language: activeFile?.language || 'dart',
          improvements: [aiInstruction]
        })
      });

      const data = await response.json();
      
      if (data.success && activeFile) {
        updateFileContent(activeFileId, data.improved_code);
        setTerminalOutput(prev => prev + '✅ Changes applied!\n');
        setAiInstruction('');
        
        // Update preview
        setTimeout(() => updatePreview(), 100);
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `❌ Error: ${error.message}\n`);
    } finally {
      setAiPanel({ visible: false, mode: '' });
    }
  };

  const fixErrors = async () => {
    if (!activeFile) return;
    
    setAiPanel({ visible: true, mode: 'fixing' });
    
    try {
      const response = await fetch('http://localhost:8005/api/fix-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
          errors: errors.map(e => e.message)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        updateFileContent(activeFileId, data.fixed_code);
        setErrors([]);
        setTerminalOutput(prev => prev + '\n🔧 Code fixed automatically!\n');
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `\n❌ Fix failed: ${error.message}`);
    } finally {
      setAiPanel({ visible: false, mode: '' });
    }
  };

  const improveCode = async () => {
    if (!activeFile) return;
    
    setAiPanel({ visible: true, mode: 'improving' });
    
    try {
      const response = await fetch('http://localhost:8005/api/improve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language,
          improvements: ['performance', 'readability', 'maintainability']
        })
      });

      const data = await response.json();
      
      if (data.success) {
        updateFileContent(activeFileId, data.improved_code);
        setTerminalOutput(prev => prev + '\n✨ Code improved and refactored!\n');
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `\n❌ Improvement failed: ${error.message}`);
    } finally {
      setAiPanel({ visible: false, mode: '' });
    }
  };

  const explainCode = async () => {
    if (!activeFile) return;
    
    setAiPanel({ visible: true, mode: 'explaining' });
    
    try {
      const response = await fetch('http://localhost:8005/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: activeFile.language
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTerminalOutput(prev => prev + '\n📖 Code Explanation:\n' + data.explanation + '\n');
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `\n❌ Explanation failed: ${error.message}`);
    } finally {
      setAiPanel({ visible: false, mode: '' });
    }
  };

  const updateFileContent = (fileId, newContent) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ));
  };

  const addNewFile = () => {
    const newId = Math.max(...files.map(f => f.id), 0) + 1;
    const newFile = {
      id: newId,
      name: `untitled${newId}.txt`,
      language: 'plaintext',
      content: ''
    };
    setFiles([...files, newFile]);
    setActiveFileId(newId);
  };

  const closeFile = (fileId, e) => {
    e.stopPropagation();
    if (files.length === 1) return; // Keep at least one file
    
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const downloadFile = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop();
    const map = {
      'dart': 'dart',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'swift': 'swift',
      'kt': 'kotlin',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'yaml': 'yaml',
      'json': 'json',
      'md': 'markdown'
    };
    return map[ext] || 'plaintext';
  };

  return (
    <div className="code-studio">
      {/* Top Toolbar */}
      <div className="studio-toolbar">
        <div className="toolbar-left">
          <select 
            value={template} 
            onChange={(e) => setTemplate(e.target.value)}
            className="template-select"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Project description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="project-input"
          />
          
          <button 
            onClick={generateProject} 
            disabled={generating}
            className="btn-generate"
          >
            <FiCpu /> {generating ? 'Generating...' : 'Generate Project'}
          </button>
          
          {/* 🆕 ULTRA OPTIONS */}
          <div className="ultra-checkboxes">
            <label title="Include tests">
              <input
                type="checkbox"
                checked={includeTests}
                onChange={(e) => setIncludeTests(e.target.checked)}
              />
              🧪
            </label>
            <label title="Include store assets">
              <input
                type="checkbox"
                checked={includeStoreAssets}
                onChange={(e) => setIncludeStoreAssets(e.target.checked)}
              />
              📱
            </label>
            <label title="Include deployment configs">
              <input
                type="checkbox"
                checked={includeDeployment}
                onChange={(e) => setIncludeDeployment(e.target.checked)}
              />
              🚀
            </label>
          </div>
        </div>
        
        <div className="toolbar-right">
          <button onClick={fixErrors} className="btn-ai" title="Fix Errors">
            <FiZap /> Fix
          </button>
          <button onClick={improveCode} className="btn-ai" title="Improve Code">
            ✨ Improve
          </button>
          <button onClick={explainCode} className="btn-ai" title="Explain Code">
            💡 Explain
          </button>
          <button onClick={downloadFile} className="btn-icon" title="Download">
            <FiDownload />
          </button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="file-tabs">
        {files.map(file => (
          <div
            key={file.id}
            className={`file-tab ${activeFileId === file.id ? 'active' : ''}`}
            onClick={() => setActiveFileId(file.id)}
          >
            <span>{file.name}</span>
            {files.length > 1 && (
              <FiX className="close-tab" onClick={(e) => closeFile(file.id, e)} />
            )}
          </div>
        ))}
        <button className="add-file-btn" onClick={addNewFile}>
          <FiPlus />
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="editor-container">
        {/* 🆕 LEFT SIDEBAR - Git & Settings */}
        <div className="left-sidebar">
          <div className="sidebar-tabs">
            <button
              className={sidebarTab === 'files' ? 'active' : ''}
              onClick={() => setSidebarTab('files')}
              title="Files"
            >
              <FiFolder />
            </button>
            <button
              className={sidebarTab === 'git' ? 'active' : ''}
              onClick={() => setSidebarTab('git')}
              title="Git"
            >
              🔧
            </button>
            <button
              className={sidebarTab === 'settings' ? 'active' : ''}
              onClick={() => setSidebarTab('settings')}
              title="Settings"
            >
              <FiSettings />
            </button>
          </div>

          <div className="sidebar-content">
            {sidebarTab === 'files' && (
              <div className="files-panel">
                <h4>📁 Files ({files.length})</h4>
                <div className="files-list">
                  {files.map(file => (
                    <div
                      key={file.id}
                      className={`file-list-item ${activeFileId === file.id ? 'active' : ''}`}
                      onClick={() => setActiveFileId(file.id)}
                    >
                      <FiCode size={14} />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sidebarTab === 'git' && (
              <div className="git-panel-wrapper">
                <GitPanel projectPath={projectPath} projectName="code-studio-project" />
              </div>
            )}

            {sidebarTab === 'settings' && (
              <div className="settings-panel">
                <h4>⚙️ Project Options</h4>
                <div className="settings-list">
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={includeTests}
                      onChange={(e) => setIncludeTests(e.target.checked)}
                    />
                    <div className="setting-info">
                      <span className="setting-title">🧪 Include Tests</span>
                      <span className="setting-desc">Unit & integration tests</span>
                    </div>
                  </label>
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={includeStoreAssets}
                      onChange={(e) => setIncludeStoreAssets(e.target.checked)}
                    />
                    <div className="setting-info">
                      <span className="setting-title">📱 Store Assets</span>
                      <span className="setting-desc">Privacy policy, terms, description</span>
                    </div>
                  </label>
                  <label className="setting-item">
                    <input
                      type="checkbox"
                      checked={includeDeployment}
                      onChange={(e) => setIncludeDeployment(e.target.checked)}
                    />
                    <div className="setting-info">
                      <span className="setting-title">🚀 Deployment</span>
                      <span className="setting-desc">CI/CD, configs, scripts</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="editor-wrapper">
          {activeFile && (
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={(value) => {
                updateFileContent(activeFileId, value || '');
                // Auto-update preview after typing
                setTimeout(() => updatePreview(), 500);
              }}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                parameterHints: { enabled: true },
              }}
            />
          )}
        </div>

        {/* Live Preview Emulator */}
        <div className="preview-emulator">
          <div className="emulator-controls">
            <div className="device-selector">
              <button 
                className={previewDevice === 'iphone' ? 'active' : ''}
                onClick={() => setPreviewDevice('iphone')}
              >
                📱 iPhone
              </button>
              <button 
                className={previewDevice === 'android' ? 'active' : ''}
                onClick={() => setPreviewDevice('android')}
              >
                🤖 Android
              </button>
              <button 
                className={previewDevice === 'web' ? 'active' : ''}
                onClick={() => setPreviewDevice('web')}
              >
                🌐 Web
              </button>
            </div>
            <button 
              className="reload-btn"
              onClick={() => updatePreview()}
              title="Reload Preview"
            >
              🔄 Reload
            </button>
          </div>

          <div className={`device-frame ${previewDevice}`}>
            {previewDevice === 'iphone' && (
              <div className="iphone-notch"></div>
            )}
            <iframe
              className="preview-iframe"
              srcDoc={previewContent || '<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#666;">Generate a project to see live preview 🚀</body>'}
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* AI Change Request Panel */}
          <div className="ai-request-panel">
            <input
              type="text"
              placeholder="Tell AI what to change... (e.g., 'make button bigger', 'change color to blue')"
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aiChangeRequest()}
              className="ai-input"
            />
            <button 
              onClick={aiChangeRequest}
              disabled={!aiInstruction.trim()}
              className="ai-apply-btn"
            >
              🪄 Apply
            </button>
          </div>
        </div>

        {/* Integrated Terminal */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <FiTerminal /> Terminal
          </div>
          <div className="terminal-content">
            <pre>{terminalOutput || '> Ready for AI code generation...'}</pre>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      {aiPanel.visible && (
        <div className="ai-panel">
          <div className="ai-panel-content">
            <div className="ai-loader"></div>
            <p>
              {aiPanel.mode === 'fixing' && '🔧 Fixing errors with AI...'}
              {aiPanel.mode === 'improving' && '✨ Improving code quality...'}
              {aiPanel.mode === 'explaining' && '💡 Analyzing code...'}
              {aiPanel.mode === 'modifying' && '🪄 Applying your changes...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudio;
