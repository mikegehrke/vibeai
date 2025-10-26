// 🚀 ULTRA AI App Builder - Complete App Generation with LIVE EDITING
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import GitPanel from './GitPanel';
import InteractivePreview from './InteractivePreview';
import { FiCheck, FiDownload, FiFolder, FiCode, FiEdit, FiEye, FiMessageSquare, FiZap } from 'react-icons/fi';
import './AppBuilder.css';

const AppBuilder = () => {
  const [step, setStep] = useState(1); // 1=describe, 2=building, 3=preview
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('flutter');
  const [features, setFeatures] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState([]);
  const [generatedApp, setGeneratedApp] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTree, setFileTree] = useState([]);
  
  // 🆕 NEW ULTRA FEATURES
  const [viewMode, setViewMode] = useState('all'); // all, tree, editor, preview
  const [previewDevice, setPreviewDevice] = useState('iphone'); // iphone, android, web
  const [previewContent, setPreviewContent] = useState('');
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  
  // 💬 AI CHAT WITH HISTORY
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // For API context
  
  // 🎬 LIVE BUILD STREAMING
  const [liveStreamMode, setLiveStreamMode] = useState(false); // Toggle for live streaming
  const [buildPaused, setBuildPaused] = useState(false);
  const [buildChat, setBuildChat] = useState('');
  const [currentBuildStep, setCurrentBuildStep] = useState(null);
  const [livePreviewContent, setLivePreviewContent] = useState('');
  const buildControlRef = useRef({ paused: false, chatMessages: [] });
  
  const editorRef = useRef(null);

  const platforms = [
    { id: 'flutter', name: '🦋 Flutter', desc: 'iOS + Android (Cross-platform)', icon: '📱' },
    { id: 'react-native', name: '⚛️ React Native', desc: 'iOS + Android (JavaScript)', icon: '📱' },
    { id: 'swift-ios', name: '🍎 Swift', desc: 'Native iOS App', icon: '📱' },
    { id: 'kotlin-android', name: '🤖 Kotlin', desc: 'Native Android App', icon: '📱' },
    { id: 'react', name: '⚛️ React', desc: 'Web Application', icon: '🌐' },
    { id: 'vue', name: '💚 Vue', desc: 'Web Application', icon: '🌐' },
    { id: 'nextjs', name: '▲ Next.js', desc: 'Full-Stack Web App', icon: '🌐' },
  ];

  const buildCompleteApp = async () => {
    setBuilding(true);
    setStep(2);
    setBuildProgress([]);
    buildControlRef.current = { paused: false, chatMessages: [] };

    const featureList = features.split(',').map(f => f.trim()).filter(f => f);

    try {
      // Show building steps
      const steps = [
        { name: 'Project Structure', icon: '📁', desc: 'Creating folder structure and base files...' },
        { name: 'Features', icon: '⚙️', desc: 'Implementing core functionality...' },
        { name: 'Tests', icon: '🧪', desc: 'Generating unit and integration tests...' },
        { name: 'Store Assets', icon: '📱', desc: 'Creating privacy policy, terms, descriptions...' },
        { name: 'Deployment', icon: '🚀', desc: 'Setting up CI/CD and deployment configs...' },
        { name: 'Documentation', icon: '📖', desc: 'Writing README and API docs...' }
      ];

      // 🎬 LIVE BUILD WITH STREAMING PREVIEW
      for (let i = 0; i < steps.length; i++) {
        setCurrentBuildStep(steps[i]);
        setBuildProgress(prev => [...prev, { ...steps[i], status: 'building' }]);
        
        // Update live preview for this step
        updateLiveBuildPreview(steps[i], i + 1, steps.length);
        
        // Simulate step duration with pause check
        await simulateStepWithPause(1500, i);
        
        // Mark step as completed
        setBuildProgress(prev => 
          prev.map((s, idx) => 
            idx === i ? { ...s, status: 'completed' } : s
          )
        );
      }

      // Call API to actually generate
      setCurrentBuildStep({ name: 'Finalizing', icon: '✨', desc: 'AI is writing your complete app...' });
      updateLiveBuildPreview({ name: 'AI Generation', icon: '🤖', desc: 'GPT-4o is writing code...' }, 7, 7);
      
      const response = await fetch('http://localhost:8005/api/build-complete-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: appName,
          description,
          platform,
          features: featureList
        })
      });

      const data = await response.json();

      if (data.success) {
        // Mark all steps as complete
        setBuildProgress(prev => prev.map(s => ({ ...s, status: 'completed' })));
        
        // Organize files into tree structure
        const tree = buildFileTree(data.files);
        setFileTree(tree);
        setGeneratedApp(data);
        
        // Show success preview
        updateLiveBuildPreview({ name: 'Complete!', icon: '✅', desc: `${data.total_files} files ready!` }, 100, 100);
        
        // Wait a moment before transitioning
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStep(3);
      } else {
        alert('Build failed: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
      setBuildProgress(prev => prev.map(s => ({ ...s, status: 'error' })));
    } finally {
      setBuilding(false);
      setBuildPaused(false);
      setCurrentBuildStep(null);
    }
  };

  // 🎬 SIMULATE STEP WITH PAUSE SUPPORT
  const simulateStepWithPause = async (duration, stepIndex) => {
    const checkInterval = 100;
    let elapsed = 0;
    
    while (elapsed < duration) {
      // Check if paused
      if (buildControlRef.current.paused) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        continue;
      }
      
      // Progress normally
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
  };

  // 🎬 UPDATE LIVE BUILD PREVIEW
  const updateLiveBuildPreview = (step, current, total) => {
    const percentage = Math.round((current / total) * 100);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
          }
          .build-container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .build-icon {
            font-size: 80px;
            animation: pulse 2s ease-in-out infinite;
            margin-bottom: 20px;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          h1 {
            font-size: 32px;
            margin-bottom: 16px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
          .step-name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .step-desc {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 30px;
          }
          .progress-bar {
            width: 100%;
            height: 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 16px;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #00d4ff);
            width: ${percentage}%;
            transition: width 0.5s ease;
            box-shadow: 0 0 20px rgba(0,255,255,0.6);
          }
          .percentage {
            font-size: 48px;
            font-weight: 700;
            text-shadow: 0 0 30px rgba(0,255,255,0.8);
          }
          .app-name {
            margin-top: 20px;
            font-size: 18px;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="build-container">
          <div class="build-icon">${step.icon}</div>
          <h1>Building ${appName}</h1>
          <div class="step-name">${step.name}</div>
          <div class="step-desc">${step.desc}</div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="percentage">${percentage}%</div>
          <div class="app-name">Step ${current} of ${total}</div>
        </div>
      </body>
      </html>
    `;
    
    setLivePreviewContent(htmlContent);
  };

  // 🎬 PAUSE BUILD
  const pauseBuild = () => {
    setBuildPaused(true);
    buildControlRef.current.paused = true;
  };

  // 🎬 RESUME BUILD
  const resumeBuild = () => {
    setBuildPaused(false);
    buildControlRef.current.paused = false;
  };

  // 🎬 SEND CHAT DURING BUILD
  const sendBuildChat = () => {
    if (!buildChat.trim()) return;
    
    buildControlRef.current.chatMessages.push({
      time: new Date().toLocaleTimeString(),
      message: buildChat,
      step: currentBuildStep?.name
    });
    
    alert(`📝 Note saved: "${buildChat}"\nWill be applied after build completes!`);
    setBuildChat('');
  };

  const buildFileTree = (files) => {
    const tree = {};
    
    files.forEach(file => {
      const parts = file.filename.split('/');
      let current = tree;
      
      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          // File
          if (!current._files) current._files = [];
          current._files.push(file);
        } else {
          // Folder
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      });
    });
    
    return tree;
  };

  // 🆕 GENERATE LIVE PREVIEW
  const generatePreview = (file) => {
    if (!file) return;
    
    const ext = file.filename.split('.').pop();
    
    if (ext === 'jsx' || ext === 'js' || ext === 'tsx' || ext === 'ts') {
      // React/Web preview
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${file.code}
            
            // Try to render if there's a default export or App component
            try {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              const Component = typeof App !== 'undefined' ? App : () => <div style={{padding: '20px'}}>Preview Ready</div>;
              root.render(<Component />);
            } catch (e) {
              document.getElementById('root').innerHTML = '<div style="padding:20px;color:#666;">Code loaded - manual preview needed</div>';
            }
          </script>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    } else if (ext === 'html') {
      setPreviewContent(file.code);
    } else if (ext === 'dart') {
      // Flutter-style preview (simulated)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: 'Roboto', sans-serif;
              color: white;
            }
            .flutter-container {
              text-align: center;
              padding: 40px;
              background: rgba(255,255,255,0.1);
              border-radius: 16px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 32px; margin-bottom: 20px; }
            p { font-size: 16px; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="flutter-container">
            <h1>🦋 Flutter App</h1>
            <p>${appName || 'Flutter Preview'}</p>
            <p style="margin-top: 20px; font-size: 14px;">Flutter apps run natively - preview in emulator</p>
          </div>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    } else {
      // Generic code preview
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              padding: 20px;
              font-family: 'JetBrains Mono', monospace;
              background: #0a0e27;
              color: #e0e0e0;
            }
            pre { 
              white-space: pre-wrap; 
              word-wrap: break-word;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h3 style="color: #a78bfa;">Code Preview: ${file.filename}</h3>
          <pre>${file.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    }
  };

  // 🆕 AI IMPROVE CODE - WITH CONVERSATION HISTORY
  const aiImproveCode = async () => {
    if (!aiInstruction.trim()) {
      alert('⚠️ Bitte eine Anweisung eingeben!');
      return;
    }

    // If no file selected, use main file
    let fileToImprove = selectedFile;
    if (!fileToImprove && generatedApp?.files) {
      // Find main.dart or first file
      fileToImprove = generatedApp.files.find(f => 
        f.filename.includes('main.dart') || 
        f.filename.includes('main.') ||
        f.filename.includes('App.')
      ) || generatedApp.files[0];
      
      if (fileToImprove) {
        setSelectedFile(fileToImprove);
      }
    }

    if (!fileToImprove) {
      alert('⚠️ Keine Datei zum Bearbeiten gefunden!');
      return;
    }

    setAiProcessing(true);
    
    try {
      // Add user message to chat
      const userMessage = {
        role: 'user',
        content: aiInstruction,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      // Build conversation history for API
      const newHistory = [...chatHistory, {
        role: 'user',
        content: aiInstruction
      }];

      const response = await fetch('http://localhost:8005/api/improve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: fileToImprove.code,
          language: fileToImprove.filename.split('.').pop(),
          instruction: aiInstruction,
          conversation_history: newHistory // Send full conversation
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the file content
        const updatedFiles = generatedApp.files.map(f =>
          f.filename === fileToImprove.filename
            ? { ...f, code: data.improved_code }
            : f
        );
        setGeneratedApp({ ...generatedApp, files: updatedFiles });
        setSelectedFile({ ...fileToImprove, code: data.improved_code });
        
        // Update tree
        const tree = buildFileTree(updatedFiles);
        setFileTree(tree);
        
        // Update preview
        generatePreview({ ...fileToImprove, code: data.improved_code });
        
        // Add AI response to chat
        const aiMessage = {
          role: 'assistant',
          content: data.explanation || `✅ Code in ${fileToImprove.filename} verbessert!`,
          timestamp: new Date().toISOString()
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Update conversation history
        const updatedHistory = [...newHistory, {
          role: 'assistant',
          content: aiMessage.content
        }];
        setChatHistory(updatedHistory);
        
        setAiInstruction('');
      } else {
        throw new Error(data.error || 'Verbesserung fehlgeschlagen');
      }
    } catch (error) {
      console.error('AI Error:', error);
      
      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: `❌ Fehler: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      
      alert(`❌ Fehler: ${error.message}`);
    } finally {
      setAiProcessing(false);
    }
  };

  // 🔧 FIX ERRORS
  const aiFixErrors = async () => {
    if (!selectedFile) {
      alert('⚠️ Bitte eine Datei auswählen!');
      return;
    }

    setAiProcessing(true);
    try {
      const response = await fetch('http://localhost:8005/api/fix-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: selectedFile.code,
          language: selectedFile.filename.split('.').pop()
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedFiles = generatedApp.files.map(f =>
          f.filename === selectedFile.filename
            ? { ...f, code: data.fixed_code }
            : f
        );
        setGeneratedApp({ ...generatedApp, files: updatedFiles });
        setSelectedFile({ ...selectedFile, code: data.fixed_code });
        
        const tree = buildFileTree(updatedFiles);
        setFileTree(tree);
        
        generatePreview({ ...selectedFile, code: data.fixed_code });
        
        alert('✅ Fehler behoben!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAiProcessing(false);
    }
  };

  // 🆕 UPDATE FILE CONTENT FROM EDITOR
  const updateFileContent = (newCode) => {
    if (!selectedFile) return;
    
    const updatedFiles = generatedApp.files.map(f =>
      f.filename === selectedFile.filename
        ? { ...f, code: newCode }
        : f
    );
    setGeneratedApp({ ...generatedApp, files: updatedFiles });
    setSelectedFile({ ...selectedFile, code: newCode });
    
    // Auto-update preview
    setTimeout(() => generatePreview({ ...selectedFile, code: newCode }), 500);
  };

  // 🆕 SELECT FILE (with preview update)
  const selectFile = (file) => {
    setSelectedFile(file);
    generatePreview(file);
    setViewMode('editor');
  };

  // Helper: Get Monaco language from filename
  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'dart': 'dart',
      'swift': 'swift',
      'kt': 'kotlin',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    return langMap[ext] || 'plaintext';
  };

  const downloadAllFiles = () => {
    if (!generatedApp) return;

    // Create ZIP using JSZip
    import('jszip').then(JSZipModule => {
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      generatedApp.files.forEach(file => {
        zip.file(file.filename, file.code);
      });

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${appName.replace(/\s+/g, '_')}_complete_app.zip`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  };

  const FileTreeView = ({ tree, path = '' }) => {
    return (
      <div className="file-tree">
        {Object.keys(tree).map(key => {
          if (key === '_files') {
            return tree[key].map(file => (
              <div
                key={file.filename}
                className={`tree-file ${selectedFile?.filename === file.filename ? 'selected' : ''}`}
                onClick={() => selectFile(file)}
              >
                <FiCode /> {file.filename.split('/').pop()}
              </div>
            ));
          } else {
            return (
              <details key={key} open>
                <summary className="tree-folder">
                  <FiFolder /> {key}
                </summary>
                <div className="tree-children">
                  <FileTreeView tree={tree[key]} path={`${path}${key}/`} />
                </div>
              </details>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="app-builder">
      {/* STEP 1: Describe App */}
      {step === 1 && (
        <div className="builder-wizard">
          <div className="wizard-header">
            <h1>🚀 AI App Builder</h1>
            <p>Describe your app and AI will build everything - code, tests, store assets, deployment!</p>
          </div>

          <div className="wizard-form">
            <div className="form-group">
              <label>App Name</label>
              <input
                type="text"
                placeholder="My Awesome App"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="app-input"
              />
            </div>

            <div className="form-group">
              <label>Platform / Technology</label>
              <div className="platform-grid">
                {platforms.map(p => (
                  <div
                    key={p.id}
                    className={`platform-card ${platform === p.id ? 'selected' : ''}`}
                    onClick={() => setPlatform(p.id)}
                  >
                    <div className="platform-icon">{p.icon}</div>
                    <div className="platform-name">{p.name}</div>
                    <div className="platform-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Describe Your App</label>
              <textarea
                placeholder="E.g., A fitness tracking app where users can log workouts, track progress, set goals, and view statistics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="app-textarea"
              />
            </div>

            <div className="form-group">
              <label>Key Features (comma separated)</label>
              <input
                type="text"
                placeholder="user authentication, workout logging, progress charts, social sharing"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="app-input"
              />
            </div>

            {/* 🎬 LIVE STREAM TOGGLE */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={liveStreamMode}
                  onChange={(e) => setLiveStreamMode(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span>🎬 Enable Live Build Preview (Watch steps in real-time)</span>
              </label>
            </div>

            <button
              className="btn-build"
              onClick={buildCompleteApp}
              disabled={!appName || !description || building}
            >
              🚀 Build Complete App
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Building - Toggle between Live View and Classic View */}
      {step === 2 && !liveStreamMode && (
        <div className="building-view">
          <div className="building-header">
            <h2>🏗️ Building Your App</h2>
            <p>AI is generating a complete production-ready application...</p>
          </div>

          <div className="build-steps">
            {buildProgress.map((s, idx) => (
              <div key={idx} className={`build-step ${s.status}`}>
                <div className="step-icon">
                  {s.status === 'building' && <div className="spinner">⏳</div>}
                  {s.status === 'completed' && <FiCheck />}
                  {s.status === 'error' && '❌'}
                </div>
                <div className="step-name">{s.icon} {s.name}</div>
                <div className="step-status">{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: LIVE BUILD WITH STREAMING PREVIEW (Optional) */}
      {step === 2 && liveStreamMode && (
        <div className="live-building-view">
          {/* Left: Build Steps Progress */}
          <div className="build-steps-panel">
            <div className="building-header">
              <h2>🏗️ Building {appName}</h2>
              <p>Watch your app come to life in real-time</p>
            </div>

            <div className="build-steps">
              {buildProgress.map((s, idx) => (
                <div key={idx} className={`build-step ${s.status}`}>
                  <div className="step-icon">
                    {s.status === 'building' && <div className="spinner">⏳</div>}
                    {s.status === 'completed' && <FiCheck />}
                    {s.status === 'error' && '❌'}
                  </div>
                  <div className="step-info">
                    <div className="step-name">{s.icon} {s.name}</div>
                    {s.desc && <div className="step-desc">{s.desc}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Build Controls */}
            <div className="build-controls">
              {!buildPaused ? (
                <button onClick={pauseBuild} className="btn-pause" disabled={!building}>
                  ⏸️ Pause Build
                </button>
              ) : (
                <button onClick={resumeBuild} className="btn-resume">
                  ▶️ Resume Build
                </button>
              )}
            </div>

            {/* Live Chat During Build */}
            <div className="build-chat-panel">
              <h4>💬 Add Notes / Changes</h4>
              <p className="chat-hint">Pause to add modifications - will apply after build</p>
              <input
                type="text"
                placeholder="e.g., 'make buttons bigger', 'add dark mode'"
                value={buildChat}
                onChange={(e) => setBuildChat(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendBuildChat()}
                className="build-chat-input"
                disabled={!buildPaused}
              />
              <button 
                onClick={sendBuildChat} 
                className="btn-send-chat"
                disabled={!buildPaused || !buildChat.trim()}
              >
                📝 Save Note
              </button>
              
              {buildControlRef.current.chatMessages.length > 0 && (
                <div className="chat-messages">
                  <h5>📋 Saved Notes ({buildControlRef.current.chatMessages.length})</h5>
                  {buildControlRef.current.chatMessages.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                      <span className="msg-time">{msg.time}</span>
                      <span className="msg-step">{msg.step}</span>
                      <span className="msg-text">{msg.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: LIVE PREVIEW EMULATOR */}
          <div className="live-preview-panel">
            <div className="preview-header-live">
              <h3>👁️ Live Build Preview</h3>
              <div className="device-selector-mini">
                <button 
                  className={previewDevice === 'iphone' ? 'active' : ''}
                  onClick={() => setPreviewDevice('iphone')}
                >
                  📱
                </button>
                <button 
                  className={previewDevice === 'android' ? 'active' : ''}
                  onClick={() => setPreviewDevice('android')}
                >
                  🤖
                </button>
                <button 
                  className={previewDevice === 'web' ? 'active' : ''}
                  onClick={() => setPreviewDevice('web')}
                >
                  🌐
                </button>
              </div>
            </div>

            <div className={`live-device-frame ${previewDevice}`}>
              {previewDevice === 'iphone' && (
                <div className="iphone-notch"></div>
              )}
              <iframe
                className="live-preview-iframe"
                srcDoc={livePreviewContent || '<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:24px;">Initializing build... 🚀</body>'}
                title="Live Build Preview"
                sandbox="allow-scripts"
              />
            </div>

            {currentBuildStep && (
              <div className="current-step-indicator">
                <span className="step-icon-large">{currentBuildStep.icon}</span>
                <div className="step-details">
                  <h4>{currentBuildStep.name}</h4>
                  <p>{currentBuildStep.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: ULTRA PREVIEW - Editor, Live Preview, AI Chat, Git */}
      {step === 3 && generatedApp && (
        <div className="ultra-preview-view">
          {/* Top Controls */}
          <div className="preview-header">
            <div className="header-left">
              <h2>✅ {appName} - Ultra Development Studio</h2>
              <p>{generatedApp.total_files} files | Edit, Preview, AI Chat, Git</p>
            </div>
            <div className="header-actions">
              <button 
                className={`view-toggle ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode(viewMode === 'tree' ? 'all' : 'tree')}
              >
                <FiFolder /> Files
              </button>
              <button 
                className={`view-toggle ${viewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setViewMode(viewMode === 'editor' ? 'all' : 'editor')}
              >
                <FiEdit /> Editor
              </button>
              <button 
                className={`view-toggle ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode(viewMode === 'preview' ? 'all' : 'preview')}
              >
                <FiEye /> Preview
              </button>
              <button className="btn-download" onClick={downloadAllFiles}>
                <FiDownload /> Download ZIP
              </button>
            </div>
          </div>

          <div className="ultra-content">
            {/* Left Sidebar: File Tree */}
            <div className="ultra-sidebar">
              <div className="explorer-header">
                <FiFolder /> Project Structure
              </div>
              <FileTreeView tree={fileTree} />
              
              {/* Build Summary in Sidebar */}
              <div className="sidebar-summary">
                <h4>📦 Package Includes</h4>
                {generatedApp.steps.map((s, idx) => (
                  <div key={idx} className="summary-item">
                    <span className="summary-count">{s.files}</span>
                    <span className="summary-label">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Code Editor */}
            <div className="ultra-editor">
              {selectedFile ? (
                <>
                  <div className="editor-header">
                    <span><FiCode /> {selectedFile.filename}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedFile.code);
                        alert('📋 Copied to clipboard!');
                      }}
                      className="btn-copy"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <Editor
                    height="calc(100% - 40px)"
                    language={getLanguageFromFilename(selectedFile.filename)}
                    value={selectedFile.code}
                    onChange={(value) => updateFileContent(value || '')}
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
                    }}
                  />
                </>
              ) : (
                <div className="no-file-selected">
                  <FiCode size={64} />
                  <h3>Select a file to edit</h3>
                  <p>Click a file from the sidebar to start editing</p>
                </div>
              )}
            </div>

            {/* Right: Live Preview + AI + Git */}
            <div className="ultra-right-panel">
              {/* Live Preview Emulator */}
              <div className="preview-emulator-section">
                <div className="emulator-header">
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
                  
                  {/* 🔲 FULLSCREEN BUTTON */}
                  <button 
                    className="btn-fullscreen-emulator"
                    onClick={() => {
                      const fullscreenWindow = window.open('', '_blank', 'width=400,height=800,toolbar=no,menubar=no');
                      fullscreenWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${appName} - Live Preview</title>
                          <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                              background: #1a1a1a;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              min-height: 100vh;
                              padding: 20px;
                            }
                            .emulator-container {
                              width: 100%;
                              max-width: 400px;
                              height: 100vh;
                              background: white;
                              border-radius: 24px;
                              box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                              overflow: hidden;
                              position: relative;
                            }
                            #preview-content {
                              width: 100%;
                              height: 100%;
                            }
                            /* ⬅️ CLOSE BUTTON */
                            .btn-close {
                              position: absolute;
                              top: 12px;
                              right: 12px;
                              z-index: 9999;
                              background: rgba(0, 0, 0, 0.7);
                              color: white;
                              border: none;
                              border-radius: 20px;
                              padding: 10px 20px;
                              font-size: 14px;
                              font-weight: 600;
                              cursor: pointer;
                              backdrop-filter: blur(10px);
                              transition: all 0.2s;
                              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            }
                            .btn-close:hover {
                              background: rgba(239, 68, 68, 0.9);
                              transform: scale(1.05);
                            }
                          </style>
                        </head>
                        <body>
                          <div class="emulator-container">
                            <button class="btn-close" onclick="window.close()">
                              ✕ Schließen
                            </button>
                            <div id="preview-content"></div>
                          </div>
                          <script>
                            // Render the interactive preview
                            const container = document.getElementById('preview-content');
                            
                            // Timer App Implementation
                            container.innerHTML = \`
                              <div style="display: flex; flex-direction: column; height: 100%; font-family: Roboto, sans-serif;">
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 48px 16px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                  <h1 style="font-size: 20px; font-weight: 500; margin: 0;">${appName}</h1>
                                </div>
                                
                                <div style="flex: 1; padding: 40px 20px; text-align: center; display: flex; align-items: center; justify-content: center;">
                                  <div>
                                    <div id="timerCircle" style="width: 280px; height: 280px; margin: 0 auto 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5); position: relative; transition: transform 0.3s;">
                                      <div style="position: absolute; inset: 10px; border-radius: 50%; background: white;"></div>
                                      <div id="timerText" style="position: relative; z-index: 1; font-size: 64px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; font-family: 'SF Mono', Monaco, monospace;">00:00</div>
                                    </div>
                                    
                                    <div id="statusBadge" style="display: inline-block; padding: 12px 28px; border-radius: 24px; font-size: 15px; font-weight: 600; margin-bottom: 40px; background: rgba(107, 114, 128, 0.1); color: #6b7280; border: 2px solid rgba(107, 114, 128, 0.2);">
                                      ⏸️ Ready
                                    </div>
                                    
                                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                                      <button id="btnStart" onclick="startTimer()" style="padding: 16px 32px; border: none; border-radius: 28px; font-size: 16px; font-weight: 600; cursor: pointer; min-width: 130px; background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s;">
                                        ▶️ Start
                                      </button>
                                      <button id="btnStop" onclick="stopTimer()" style="padding: 16px 32px; border: none; border-radius: 28px; font-size: 16px; font-weight: 600; cursor: pointer; min-width: 130px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s;">
                                        ⏸️ Pause
                                      </button>
                                      <button id="btnReset" onclick="resetTimer()" style="padding: 16px 32px; border: none; border-radius: 28px; font-size: 16px; font-weight: 600; cursor: pointer; min-width: 130px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s;">
                                        🔄 Reset
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            \`;
                            
                            let seconds = 0;
                            let interval = null;
                            
                            window.startTimer = function() {
                              if (interval) return;
                              
                              document.getElementById('statusBadge').style.background = 'rgba(16, 185, 129, 0.15)';
                              document.getElementById('statusBadge').style.color = '#059669';
                              document.getElementById('statusBadge').style.borderColor = 'rgba(16, 185, 129, 0.3)';
                              document.getElementById('statusBadge').textContent = '▶️ Running';
                              
                              const circle = document.getElementById('timerCircle');
                              circle.style.animation = 'pulse 2s ease-in-out infinite';
                              
                              interval = setInterval(() => {
                                seconds++;
                                updateDisplay();
                              }, 1000);
                            };
                            
                            window.stopTimer = function() {
                              if (!interval) return;
                              
                              clearInterval(interval);
                              interval = null;
                              
                              document.getElementById('statusBadge').style.background = 'rgba(107, 114, 128, 0.1)';
                              document.getElementById('statusBadge').style.color = '#6b7280';
                              document.getElementById('statusBadge').style.borderColor = 'rgba(107, 114, 128, 0.2)';
                              document.getElementById('statusBadge').textContent = '⏸️ Paused';
                              
                              const circle = document.getElementById('timerCircle');
                              circle.style.animation = 'none';
                            };
                            
                            window.resetTimer = function() {
                              stopTimer();
                              seconds = 0;
                              updateDisplay();
                              document.getElementById('statusBadge').textContent = '⏸️ Ready';
                            };
                            
                            function updateDisplay() {
                              const mins = Math.floor(seconds / 60);
                              const secs = seconds % 60;
                              document.getElementById('timerText').textContent = 
                                String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
                            }
                            
                            // Add pulse animation
                            const style = document.createElement('style');
                            style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }';
                            document.head.appendChild(style);
                          </script>
                        </body>
                        </html>
                      `);
                      fullscreenWindow.document.close();
                    }}
                    title="Open in fullscreen window"
                  >
                    🔲 Fullscreen
                  </button>
                </div>

                <div className={`device-frame ${previewDevice}`}>
                  {previewDevice === 'iphone' && (
                    <div className="iphone-notch"></div>
                  )}
                  {/* 🎮 INTERACTIVE PREVIEW */}
                  <InteractivePreview 
                    files={generatedApp?.files || []}
                    appName={appName}
                    platform={platform}
                  />
                </div>
              </div>

              {/* AI Chat Panel */}
              <div className="ai-chat-panel">
                <div className="ai-header">
                  <FiMessageSquare /> AI Code Assistant
                </div>
                
                {/* Chat Messages Display */}
                <div className="chat-messages-container">
                  {chatMessages.length === 0 ? (
                    <div className="chat-empty-state">
                      <FiMessageSquare size={48} opacity={0.3} />
                      <p>Start a conversation with AI...</p>
                      <p className="chat-hint">Try: "add dark mode" or "improve performance"</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-message ${msg.role}`}>
                        <div className="chat-message-header">
                          <span className="chat-role">
                            {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                          </span>
                          <span className="chat-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="chat-content">
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>

                <div className="chat-input-container">
                  <input
                    type="text"
                    placeholder="Tell AI what to change... (e.g., 'add dark mode', 'improve performance')"
                    value={aiInstruction}
                    onChange={(e) => setAiInstruction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !aiProcessing && aiImproveCode()}
                    className="ai-input"
                    disabled={aiProcessing}
                  />
                  <button 
                    onClick={aiImproveCode}
                    disabled={aiProcessing || !aiInstruction.trim()}
                    className="ai-apply-btn"
                  >
                    {aiProcessing ? '⏳ Processing...' : '🪄 Apply AI Changes'}
                  </button>
                </div>
              </div>

              {/* Git Integration */}
              <GitPanel 
                projectPath={projectPath} 
                projectName={appName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppBuilder;
