// 💻 ULTIMATE CODE STUDIO PRO - Better than VS Code
import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiDownload, FiFolder, FiFile, FiPlus, FiX, FiTerminal, FiMaximize2, FiMinimize2, FiGitBranch, FiRefreshCw } from 'react-icons/fi';
import './CodeStudioPro.css';

const CodeStudioPro = () => {
  // State Management
  const [files, setFiles] = useState([
    { id: 1, name: 'index.html', language: 'html', content: '<h1>Hello World</h1>' },
    { id: 2, name: 'style.css', language: 'css', content: 'body { margin: 0; }' },
    { id: 3, name: 'script.js', language: 'javascript', content: 'console.log("Ready!");' }
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const [terminalOutput, setTerminalOutput] = useState('> Terminal Ready...\n');
  const [terminalInput, setTerminalInput] = useState('');
  const [previewMode, setPreviewMode] = useState('browser'); // browser, mobile, tablet
  const [previewContent, setPreviewContent] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiHistory, setAiHistory] = useState([]);
  
  const editorRef = useRef(null);
  const iframeRef = useRef(null);

  // Get active file
  const activeFile = files.find(f => f.id === activeFileId);

  // Monaco Editor Setup
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Custom Theme
    monaco.editor.defineTheme('vscode-dark-pro', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
      }
    });
    monaco.editor.setTheme('vscode-dark-pro');
  };

  // Update file content
  const handleEditorChange = (value) => {
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, content: value } : f
    ));
    
    // Auto-update preview for HTML/CSS/JS
    if (['html', 'css', 'javascript'].includes(activeFile?.language)) {
      updatePreview();
    }
  };

  // Run Code
  const runCode = async () => {
    setIsRunning(true);
    setConsoleOutput([]);
    addConsoleOutput('🚀 Running...', 'info');

    const activeContent = activeFile.content;
    const lang = activeFile.language;

    try {
      if (lang === 'javascript' || lang === 'typescript') {
        // Execute JavaScript
        try {
          const result = eval(activeContent);
          addConsoleOutput(`✅ Output: ${result}`, 'success');
        } catch (err) {
          addConsoleOutput(`❌ Error: ${err.message}`, 'error');
        }
      } else if (lang === 'html') {
        // Update HTML preview
        updatePreview();
        addConsoleOutput('✅ HTML rendered', 'success');
      } else if (lang === 'python') {
        // Send to backend for execution
        const response = await fetch('http://localhost:8005/api/run-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: activeContent, language: 'python' })
        });
        const data = await response.json();
        addConsoleOutput(data.output || data.error, data.error ? 'error' : 'success');
      } else {
        addConsoleOutput('⚠️ Language not yet supported for execution', 'warning');
      }
    } catch (error) {
      addConsoleOutput(`❌ Error: ${error.message}`, 'error');
    }

    setIsRunning(false);
  };

  // Update Preview
  const updatePreview = () => {
    const htmlFile = files.find(f => f.language === 'html');
    const cssFile = files.find(f => f.language === 'css');
    const jsFile = files.find(f => f.language === 'javascript');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile?.content || ''}</style>
        </head>
        <body>
          ${htmlFile?.content || ''}
          <script>${jsFile?.content || ''}</script>
        </body>
      </html>
    `;

    setPreviewContent(html);
    
    // Update iframe
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(html);
      doc.close();
    }
  };

  // Add console output
  const addConsoleOutput = (message, type = 'log') => {
    setConsoleOutput(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
  };

  // Execute Terminal Command
  const executeTerminal = async () => {
    if (!terminalInput.trim()) return;
    
    const command = terminalInput.trim();
    setTerminalOutput(prev => prev + `$ ${command}\n`);
    setTerminalInput('');

    try {
      // Send to backend
      const response = await fetch('http://localhost:8005/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const data = await response.json();
      setTerminalOutput(prev => prev + data.output + '\n');
    } catch (error) {
      setTerminalOutput(prev => prev + `Error: ${error.message}\n`);
    }
  };

  // AI Chat
  const sendAiMessage = async () => {
    if (!aiMessage.trim()) return;
    
    const userMessage = aiMessage;
    setAiHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiMessage('');

    try {
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: 'gpt-4o',
          prompt: `Code Context:\n${activeFile?.content}\n\nUser: ${userMessage}`
        })
      });
      const data = await response.json();
      setAiHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setAiHistory(prev => [...prev, { role: 'error', content: error.message }]);
    }
  };

  // Auto-update preview on mount
  useEffect(() => {
    updatePreview();
  }, []);

  return (
    <div className="code-studio-pro">
      {/* Top Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn-icon" onClick={() => setShowSidebar(!showSidebar)}>
            <FiFolder />
          </button>
          <button className="btn-icon" onClick={() => setShowTerminal(!showTerminal)}>
            <FiTerminal />
          </button>
          <button className="btn-run" onClick={runCode} disabled={isRunning}>
            <FiPlay /> {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button className="btn-icon" onClick={updatePreview}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
        <div className="toolbar-center">
          <span className="project-name">💻 Code Studio Pro</span>
        </div>
        <div className="toolbar-right">
          <button className="btn-icon">
            <FiGitBranch /> main
          </button>
          <button className="btn-icon" onClick={() => setAiChatOpen(!aiChatOpen)}>
            🤖 AI Chat
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        {showSidebar && (
          <div className="sidebar">
            <div className="sidebar-header">
              <span>FILES</span>
              <button className="btn-icon-small"><FiPlus /></button>
            </div>
            <div className="file-list">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
                  onClick={() => setActiveFileId(file.id)}
                >
                  <FiFile className="file-icon" />
                  <span>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="editor-area">
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
                  <FiX className="close-icon" onClick={(e) => {
                    e.stopPropagation();
                    setFiles(files.filter(f => f.id !== file.id));
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="editor-container">
            <Editor
              height="100%"
              language={activeFile?.language}
              value={activeFile?.content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="preview-area">
          <div className="preview-header">
            <span>🔴 LIVE PREVIEW</span>
            <div className="preview-controls">
              <button className={previewMode === 'browser' ? 'active' : ''} onClick={() => setPreviewMode('browser')}>
                💻
              </button>
              <button className={previewMode === 'mobile' ? 'active' : ''} onClick={() => setPreviewMode('mobile')}>
                📱
              </button>
              <button className={previewMode === 'tablet' ? 'active' : ''} onClick={() => setPreviewMode('tablet')}>
                📱
              </button>
            </div>
          </div>
          <div className={`preview-viewport ${previewMode}`}>
            <iframe ref={iframeRef} className="preview-iframe" sandbox="allow-scripts" />
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      {showTerminal && (
        <div className="bottom-panel">
          <div className="panel-tabs">
            <button className="active">Terminal</button>
            <button>Console</button>
            <button>Problems</button>
          </div>
          
          <div className="terminal-content">
            {/* Console Output */}
            <div className="console-output">
              {consoleOutput.map((log, i) => (
                <div key={i} className={`console-line ${log.type}`}>
                  <span className="time">[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>

            {/* Terminal */}
            <div className="terminal-output">
              <pre>{terminalOutput}</pre>
            </div>
            <div className="terminal-input">
              <span className="prompt">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeTerminal()}
                placeholder="Type command..."
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Sidebar */}
      {aiChatOpen && (
        <div className="ai-chat-sidebar">
          <div className="ai-chat-header">
            <span>🤖 AI Assistant</span>
            <FiX onClick={() => setAiChatOpen(false)} />
          </div>
          <div className="ai-chat-messages">
            {aiHistory.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
          </div>
          <div className="ai-chat-input">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
              placeholder="Ask AI for help..."
            />
            <button onClick={sendAiMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeStudioPro;
