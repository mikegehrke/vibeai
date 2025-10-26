import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';
import { FiPlay, FiDownload, FiCopy, FiCode, FiZap } from 'react-icons/fi';
import './AppStudio.css';

const AppStudio = () => {
  const [template, setTemplate] = useState('flutter');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');

  const templates = [
    { id: 'flutter', name: '📱 Flutter', desc: 'Cross-platform mobile app' },
    { id: 'react', name: '⚛️ React', desc: 'Modern web application' },
    { id: 'vue', name: '💚 Vue 3', desc: 'Progressive framework' },
    { id: 'nextjs', name: '▲ Next.js', desc: 'React framework' },
    { id: 'react-native', name: '📱 React Native', desc: 'Native mobile app' },
    { id: 'swift-ios', name: '🍎 Swift iOS', desc: 'Native iOS app' },
    { id: 'kotlin-android', name: '🤖 Kotlin Android', desc: 'Native Android app' },
    { id: 'python', name: '🐍 Python', desc: 'Python application' },
    { id: 'php', name: '🐘 PHP', desc: 'PHP web application' },
    { id: 'node', name: '🟢 Node.js', desc: 'Backend server' },
    { id: 'django', name: '🎸 Django', desc: 'Python web framework' },
    { id: 'laravel', name: '🔺 Laravel', desc: 'PHP framework' },
    { id: 'express', name: '🚂 Express', desc: 'Node.js framework' },
    { id: 'fastapi', name: '⚡ FastAPI', desc: 'Python API framework' },
    { id: 'spring-boot', name: '🍃 Spring Boot', desc: 'Java framework' },
    { id: 'dotnet', name: '🔷 .NET', desc: 'C# application' },
    { id: 'go', name: '🔵 Go', desc: 'Go application' },
    { id: 'rust', name: '🦀 Rust', desc: 'Rust application' }
  ];

  const exampleDescriptions = {
    flutter: 'Todo app with local storage, Material Design 3, add/delete/complete tasks, filter by status',
    react: 'Portfolio website with project showcase, contact form, smooth animations, responsive design',
    vue: 'Blog platform with markdown editor, post management, tags, search functionality',
    nextjs: 'E-commerce store with product catalog, shopping cart, checkout, admin panel',
    'react-native': 'Weather app with location services, 7-day forecast, animated backgrounds',
    'swift-ios': 'iOS notes app with iCloud sync, search, rich text editing, dark mode',
    'kotlin-android': 'Android fitness tracker with step counter, workout logging, Material You design',
    python: 'Data analysis tool with pandas, matplotlib charts, CSV export, data cleaning',
    php: 'Content management system with user auth, article management, admin dashboard',
    node: 'REST API server with Express, JWT authentication, MongoDB database, rate limiting',
    django: 'Full-stack web app with user auth, CRUD operations, admin panel, PostgreSQL',
    laravel: 'E-commerce backend with products, orders, payments, email notifications',
    express: 'Chat API with WebSocket support, real-time messaging, room management',
    fastapi: 'Machine learning API with model inference, async processing, OpenAPI docs',
    'spring-boot': 'Microservice with REST endpoints, JPA, H2 database, security',
    dotnet: 'ASP.NET Core web API with Entity Framework, authentication, Swagger',
    go: 'High-performance web server with Gin framework, middleware, JSON responses',
    rust: 'CLI tool with file processing, error handling, performance optimization'
  };

  const generateApp = async () => {
    if (!description.trim()) {
      alert('Please enter an app description!');
      return;
    }

    setIsGenerating(true);
    setGeneratedFiles([]);
    setActiveFile(null);
    setPreviewContent('');

    try {
      const response = await fetch('http://127.0.0.1:8005/api/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          description,
          features: features ? features.split(',').map(f => f.trim()) : [],
          model: 'gpt-4o'
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedFiles(data.files);
        if (data.files.length > 0) {
          setActiveFile(data.files[0]);
          generatePreview(data.files[0]);
        }
      } else {
        alert('Generation failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate app: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePreview = (file) => {
    // Generate simple preview based on template
    if (template === 'flutter') {
      setPreviewContent(`
        <div style="font-family: 'Roboto', sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; height: 100%;">
          <h2>📱 Flutter App Preview</h2>
          <p>Generated: ${file.name}</p>
          <div style="background: white; color: #333; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <h3>✨ Your Flutter App is Ready!</h3>
            <p>Lines of code: ${file.content.split('\n').length}</p>
            <p>To run: flutter run</p>
          </div>
        </div>
      `);
    } else if (template === 'react' || template === 'vue') {
      setPreviewContent(`
        <div style="font-family: system-ui; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; height: 100%;">
          <h2>⚛️ ${template === 'react' ? 'React' : 'Vue'} App Preview</h2>
          <p>Generated: ${file.name}</p>
          <div style="background: white; color: #333; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <h3>✨ Your ${template.toUpperCase()} App is Ready!</h3>
            <p>Components: ${file.content.match(/function|const.*=>/g)?.length || 1}</p>
            <p>To run: npm install && npm start</p>
          </div>
        </div>
      `);
    } else {
      setPreviewContent(`
        <div style="font-family: system-ui; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; height: 100%;">
          <h2>🚀 App Generated Successfully!</h2>
          <p>File: ${file.name}</p>
          <p>Template: ${template}</p>
          <div style="background: white; color: #333; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <h3>✨ Ready to Deploy!</h3>
            <p>Lines: ${file.content.split('\n').length}</p>
          </div>
        </div>
      `);
    }
  };

  const copyToClipboard = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      alert('✅ Code copied to clipboard!');
    }
  };

  const downloadFile = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadAllAsZip = async () => {
    if (generatedFiles.length === 0) return;

    try {
      const zip = new JSZip();
      
      // Add all files to ZIP
      generatedFiles.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      // Add README
      const readme = `# ${template.toUpperCase()} App
      
Generated with VibeAI App Studio

## Description
${description}

## Features
${features || 'Basic functionality'}

## Setup
1. Extract this ZIP file
2. Follow the instructions in the generated files
3. Run the app according to the template requirements

Generated on: ${new Date().toLocaleString()}
`;
      zip.file('README.md', readme);
      
      // Generate ZIP blob
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template}-app-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('✅ All files downloaded as ZIP!');
    } catch (error) {
      console.error('ZIP creation error:', error);
      alert('❌ Failed to create ZIP file');
    }
  };

  return (
    <div className="app-studio">
      {/* Header */}
      <div className="studio-header">
        <div className="header-left">
          <FiCode className="header-icon" />
          <h1>AI App Studio</h1>
          <span className="beta-badge">BETA</span>
        </div>
        <div className="header-stats">
          <span className="stat">
            <FiZap /> {generatedFiles.length} files
          </span>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="config-panel">
        <div className="template-selector">
          <label>📋 Template</label>
          <div className="template-grid">
            {templates.map(t => (
              <button
                key={t.id}
                className={`template-card ${template === t.id ? 'active' : ''}`}
                onClick={() => {
                  setTemplate(t.id);
                  setDescription(exampleDescriptions[t.id]);
                }}
              >
                <div className="template-name">{t.name}</div>
                <div className="template-desc">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>📝 App Description</label>
          <textarea
            placeholder="Describe your app in detail... (e.g., 'A todo app with categories, due dates, and cloud sync')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="input-group">
          <label>✨ Features (comma-separated, optional)</label>
          <input
            type="text"
            placeholder="e.g., authentication, dark mode, offline support"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </div>

        <button
          className="generate-btn"
          onClick={generateApp}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="spinner"></div>
              Generating with GPT-4o...
            </>
          ) : (
            <>
              <FiPlay /> Generate App
            </>
          )}
        </button>
      </div>

      {/* Code Editor & Preview */}
      {generatedFiles.length > 0 && (
        <div className="workspace">
          {/* Left: File Tabs & Code Editor */}
          <div className="editor-section">
            <div className="file-tabs">
              {generatedFiles.map((file, idx) => (
                <button
                  key={idx}
                  className={`file-tab ${activeFile === file ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFile(file);
                    generatePreview(file);
                  }}
                >
                  {file.name}
                </button>
              ))}
            </div>

            <div className="editor-toolbar">
              <span className="file-info">
                {activeFile?.name} - {activeFile?.content.split('\n').length} lines
              </span>
              <div className="toolbar-actions">
                <button onClick={copyToClipboard} title="Copy to clipboard">
                  <FiCopy /> Copy
                </button>
                <button onClick={downloadFile} title="Download file">
                  <FiDownload /> Download
                </button>
              </div>
            </div>

            <Editor
              height="700px"
              language={activeFile?.language || 'javascript'}
              value={activeFile?.content || ''}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: false,
                wordWrap: 'on'
              }}
              onChange={(value) => {
                if (activeFile) {
                  activeFile.content = value || '';
                }
              }}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="preview-section">
            <div className="preview-header">
              <span>🎨 Live Preview</span>
              <button onClick={downloadAllAsZip} className="download-all-btn">
                <FiDownload /> Download All
              </button>
            </div>
            <iframe
              srcDoc={previewContent}
              title="Preview"
              className="preview-frame"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedFiles.length === 0 && !isGenerating && (
        <div className="empty-state">
          <FiCode className="empty-icon" />
          <h2>Ready to Build Something Amazing?</h2>
          <p>Select a template, describe your app, and let AI generate the code!</p>
        </div>
      )}
    </div>
  );
};

export default AppStudio;
