// 🎨 ULTRA App Studio - Rapid Prototyping with ALL Features
import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import GitPanel from './GitPanel';
import JSZip from 'jszip';
import { FiPlay, FiDownload, FiCopy, FiCode, FiZap, FiPackage, FiFileText, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import './AppStudio.css';

const AppStudioUltra = () => {
  const [template, setTemplate] = useState('flutter');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  
  // 🆕 ULTRA FEATURES
  const [includeTests, setIncludeTests] = useState(true);
  const [includeStoreAssets, setIncludeStoreAssets] = useState(true);
  const [includeDeployment, setIncludeDeployment] = useState(true);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  const [viewMode, setViewMode] = useState('code'); // code, preview
  const [previewDevice, setPreviewDevice] = useState('iphone');
  
  const editorRef = useRef(null);

  const templates = [
    { id: 'flutter', name: '📱 Flutter', desc: 'Cross-platform mobile app', lang: 'dart' },
    { id: 'react', name: '⚛️ React', desc: 'Modern web application', lang: 'javascript' },
    { id: 'vue', name: '💚 Vue 3', desc: 'Progressive framework', lang: 'javascript' },
    { id: 'nextjs', name: '▲ Next.js', desc: 'React framework', lang: 'javascript' },
    { id: 'react-native', name: '📱 React Native', desc: 'Native mobile app', lang: 'javascript' },
    { id: 'swift-ios', name: '🍎 Swift iOS', desc: 'Native iOS app', lang: 'swift' },
    { id: 'kotlin-android', name: '🤖 Kotlin', desc: 'Native Android', lang: 'kotlin' },
    { id: 'python', name: '🐍 Python', desc: 'Python application', lang: 'python' },
    { id: 'php', name: '🐘 PHP', desc: 'PHP web app', lang: 'php' },
    { id: 'node', name: '🟢 Node.js', desc: 'Backend server', lang: 'javascript' },
    { id: 'django', name: '🎸 Django', desc: 'Python framework', lang: 'python' },
    { id: 'laravel', name: '🔺 Laravel', desc: 'PHP framework', lang: 'php' },
    { id: 'express', name: '🚂 Express', desc: 'Node.js framework', lang: 'javascript' },
    { id: 'fastapi', name: '⚡ FastAPI', desc: 'Python API', lang: 'python' },
    { id: 'spring-boot', name: '🍃 Spring Boot', desc: 'Java framework', lang: 'java' },
    { id: 'dotnet', name: '🔷 .NET', desc: 'C# application', lang: 'csharp' },
    { id: 'go', name: '🔵 Go', desc: 'Go application', lang: 'go' },
    { id: 'rust', name: '🦀 Rust', desc: 'Rust application', lang: 'rust' }
  ];

  const generateUltraApp = async () => {
    if (!description.trim()) {
      alert('Please enter an app description!');
      return;
    }

    setIsGenerating(true);
    setGeneratedFiles([]);
    setActiveFile(null);
    setPreviewContent('');

    try {
      // Build enhanced prompt with all features
      let enhancedFeatures = features ? features.split(',').map(f => f.trim()) : [];
      
      if (includeTests) {
        enhancedFeatures.push('comprehensive unit tests');
        enhancedFeatures.push('integration tests');
        enhancedFeatures.push('test coverage report');
      }
      
      if (includeStoreAssets) {
        enhancedFeatures.push('app store description');
        enhancedFeatures.push('privacy policy');
        enhancedFeatures.push('terms of service');
      }
      
      if (includeDeployment) {
        enhancedFeatures.push('CI/CD pipeline config');
        enhancedFeatures.push('deployment scripts');
        enhancedFeatures.push('environment configs');
      }

      const response = await fetch('http://127.0.0.1:8005/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          description,
          features: enhancedFeatures,
          model: 'gpt-4o'
        })
      });

      const data = await response.json();

      if (data.success && data.files) {
        const files = data.files.map(f => ({
          name: f.filename,
          content: f.code,
          category: getCategoryFromFilename(f.filename)
        }));
        
        setGeneratedFiles(files);
        if (files.length > 0) {
          setActiveFile(files[0]);
          generatePreview(files[0]);
        }
        
        alert(`✅ Generated ${files.length} files with Tests, Store Assets & Deployment!`);
      } else {
        alert('Generation failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate app: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryFromFilename = (filename) => {
    if (filename.includes('test')) return 'tests';
    if (filename.includes('privacy') || filename.includes('terms') || filename.includes('store')) return 'store';
    if (filename.includes('deploy') || filename.includes('ci') || filename.includes('.yml') || filename.includes('.yaml')) return 'deployment';
    return 'code';
  };

  const generatePreview = (file) => {
    if (!file) return;
    
    const templateData = templates.find(t => t.id === template);
    const lang = templateData?.lang || 'javascript';
    
    if (lang === 'javascript' || lang === 'typescript') {
      // React/Vue/Node preview
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
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
            }
            .preview-container {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 30px;
              max-width: 600px;
              margin: 40px auto;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h1>✨ ${templateData?.name} App</h1>
            <p style="margin-top: 10px; opacity: 0.9;">File: ${file.name}</p>
            <p style="margin-top: 20px;">Lines: ${file.content.split('\n').length}</p>
            <div style="margin-top: 30px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
              <h3>📦 Features</h3>
              <p style="margin-top: 10px; font-size: 14px;">
                ${includeTests ? '✅ Tests included' : ''}<br>
                ${includeStoreAssets ? '✅ Store assets included' : ''}<br>
                ${includeDeployment ? '✅ Deployment configs included' : ''}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    } else {
      // Generic preview
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              font-family: system-ui;
              color: white;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: rgba(255,255,255,0.15);
              backdrop-filter: blur(10px);
              border-radius: 16px;
              padding: 40px;
              text-align: center;
            }
            h1 { font-size: 36px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 ${templateData?.name}</h1>
            <p>${file.name}</p>
            <p style="margin-top: 20px; font-size: 18px;">${file.content.split('\n').length} lines generated</p>
          </div>
        </body>
        </html>
      `;
      setPreviewContent(htmlContent);
    }
  };

  const aiImproveCode = async () => {
    if (!activeFile || !aiInstruction.trim()) {
      alert('Select a file and enter an instruction!');
      return;
    }

    setAiProcessing(true);
    try {
      const response = await fetch('http://localhost:8005/api/improve-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFile.content,
          language: templates.find(t => t.id === template)?.lang || 'javascript',
          instruction: aiInstruction
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedFiles = generatedFiles.map(f =>
          f.name === activeFile.name
            ? { ...f, content: data.improved_code }
            : f
        );
        setGeneratedFiles(updatedFiles);
        setActiveFile({ ...activeFile, content: data.improved_code });
        generatePreview({ ...activeFile, content: data.improved_code });
        
        alert('✅ Code improved!');
        setAiInstruction('');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAiProcessing(false);
    }
  };

  const updateFileContent = (newCode) => {
    if (!activeFile) return;
    
    const updatedFiles = generatedFiles.map(f =>
      f.name === activeFile.name
        ? { ...f, content: newCode }
        : f
    );
    setGeneratedFiles(updatedFiles);
    setActiveFile({ ...activeFile, content: newCode });
  };

  const downloadAllAsZip = async () => {
    if (generatedFiles.length === 0) return;

    try {
      const zip = new JSZip();
      
      generatedFiles.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      const readme = `# ${template.toUpperCase()} App - Ultra Generated

## Description
${description}

## Features
${features || 'Core functionality'}

${includeTests ? '✅ Tests Included\n- Unit tests\n- Integration tests\n- Coverage reports\n' : ''}
${includeStoreAssets ? '✅ Store Assets Included\n- App description\n- Privacy policy\n- Terms of service\n' : ''}
${includeDeployment ? '✅ Deployment Ready\n- CI/CD pipeline\n- Environment configs\n- Deployment scripts\n' : ''}

Generated by VibeAI App Studio ULTRA
${new Date().toLocaleString()}
`;
      zip.file('README.md', readme);
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template}-ultra-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('✅ ZIP downloaded!');
    } catch (error) {
      alert('Error creating ZIP: ' + error.message);
    }
  };

  const getFileCounts = () => {
    return {
      code: generatedFiles.filter(f => f.category === 'code').length,
      tests: generatedFiles.filter(f => f.category === 'tests').length,
      store: generatedFiles.filter(f => f.category === 'store').length,
      deployment: generatedFiles.filter(f => f.category === 'deployment').length,
    };
  };

  const counts = getFileCounts();

  return (
    <div className="app-studio-ultra">
      <div className="studio-container">
        {/* Left Panel: Configuration */}
        <div className="config-panel">
          <div className="panel-header">
            <h2>🎨 Ultra App Studio</h2>
            <p>Rapid prototyping with tests, store assets & deployment</p>
          </div>

          <div className="config-form">
            <div className="form-section">
              <label>Select Template</label>
              <div className="template-grid">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`template-btn ${template === t.id ? 'active' : ''}`}
                    onClick={() => setTemplate(t.id)}
                  >
                    <span className="template-name">{t.name}</span>
                    <span className="template-desc">{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Describe Your App</label>
              <textarea
                placeholder="E.g., A task management app with categories, due dates, and notifications"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-text"
              />
            </div>

            <div className="form-section">
              <label>Additional Features (optional)</label>
              <input
                type="text"
                placeholder="dark mode, offline support, analytics"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="input-text"
              />
            </div>

            <div className="form-section">
              <label>✨ ULTRA Options</label>
              <div className="ultra-options">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeTests}
                    onChange={(e) => setIncludeTests(e.target.checked)}
                  />
                  <span>🧪 Include Tests (Unit + Integration)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeStoreAssets}
                    onChange={(e) => setIncludeStoreAssets(e.target.checked)}
                  />
                  <span>📱 Include Store Assets (Privacy, Terms, Description)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeDeployment}
                    onChange={(e) => setIncludeDeployment(e.target.checked)}
                  />
                  <span>🚀 Include Deployment Configs (CI/CD, Scripts)</span>
                </label>
              </div>
            </div>

            <button
              onClick={generateUltraApp}
              disabled={isGenerating || !description.trim()}
              className="btn-generate"
            >
              {isGenerating ? '⏳ Generating...' : '🚀 Generate Ultra App'}
            </button>

            {generatedFiles.length > 0 && (
              <>
                <div className="file-stats">
                  <h4>📊 Generated Files</h4>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-count">{counts.code}</span>
                      <span className="stat-label">Code Files</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-count">{counts.tests}</span>
                      <span className="stat-label">Tests</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-count">{counts.store}</span>
                      <span className="stat-label">Store Assets</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-count">{counts.deployment}</span>
                      <span className="stat-label">Deployment</span>
                    </div>
                  </div>
                </div>

                <div className="file-list">
                  <h4>📁 Files</h4>
                  {generatedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className={`file-item ${activeFile?.name === file.name ? 'active' : ''}`}
                      onClick={() => {
                        setActiveFile(file);
                        generatePreview(file);
                      }}
                    >
                      <FiCode />
                      <span>{file.name}</span>
                      {file.category === 'tests' && <span className="badge badge-test">Test</span>}
                      {file.category === 'store' && <span className="badge badge-store">Store</span>}
                      {file.category === 'deployment' && <span className="badge badge-deploy">Deploy</span>}
                    </div>
                  ))}
                </div>

                <button onClick={downloadAllAsZip} className="btn-download-all">
                  <FiDownload /> Download All as ZIP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center: Monaco Editor */}
        <div className="editor-panel">
          {activeFile ? (
            <>
              <div className="editor-header">
                <span><FiCode /> {activeFile.name}</span>
                <div className="header-actions">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeFile.content);
                      alert('📋 Copied!');
                    }}
                    className="btn-header"
                  >
                    <FiCopy /> Copy
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([activeFile.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = activeFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn-header"
                  >
                    <FiDownload /> Save
                  </button>
                </div>
              </div>
              <Editor
                height="calc(100% - 50px)"
                language={templates.find(t => t.id === template)?.lang || 'javascript'}
                value={activeFile.content}
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
                }}
              />
            </>
          ) : (
            <div className="editor-empty">
              <FiCode size={64} />
              <h3>No file selected</h3>
              <p>Generate an app or select a file from the list</p>
            </div>
          )}
        </div>

        {/* Right Panel: Preview + AI + Git */}
        <div className="right-panel">
          {/* Live Preview */}
          <div className="preview-section">
            <div className="section-header">
              <span>👁️ Live Preview</span>
              <div className="device-toggle">
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
            
            <div className={`preview-device ${previewDevice}`}>
              {previewDevice === 'iphone' && <div className="iphone-notch"></div>}
              <iframe
                srcDoc={previewContent || '<body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#666;">Generate an app to see preview</body>'}
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
                className="preview-frame"
              />
            </div>
          </div>

          {/* AI Chat */}
          <div className="ai-section">
            <div className="section-header">
              <FiMessageSquare /> AI Assistant
            </div>
            <input
              type="text"
              placeholder="Tell AI what to change..."
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && aiImproveCode()}
              className="ai-input"
              disabled={aiProcessing}
            />
            <button
              onClick={aiImproveCode}
              disabled={aiProcessing || !aiInstruction.trim() || !activeFile}
              className="ai-btn"
            >
              {aiProcessing ? '⏳ Processing...' : '🪄 Apply Changes'}
            </button>
          </div>

          {/* Git Panel */}
          <GitPanel projectPath={projectPath} projectName={`${template}-app`} />
        </div>
      </div>
    </div>
  );
};

export default AppStudioUltra;
