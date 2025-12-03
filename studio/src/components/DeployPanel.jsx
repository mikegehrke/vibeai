import React, { useState } from 'react';
import './DeployPanel.css';

const DeployPanel = ({ projectId }) => {
  const [deployType, setDeployType] = useState('web');
  const [platform, setPlatform] = useState('vercel');
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [deployCommand, setDeployCommand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = {
    web: [
      { id: 'vercel', name: 'Vercel', icon: '▲', color: '#000000', time: '~30s' },
      { id: 'netlify', name: 'Netlify', icon: '🌐', color: '#00C7B7', time: '~1m' },
      { id: 'cloudflare', name: 'Cloudflare', icon: '☁️', color: '#F38020', time: '~15s' }
    ],
    backend: [
      { id: 'railway', name: 'Railway', icon: '🚂', color: '#0B0D0E', time: '~2m' },
      { id: 'render', name: 'Render', icon: '🎨', color: '#46E3B7', time: '~3m' },
      { id: 'flyio', name: 'Fly.io', icon: '✈️', color: '#7B3FF2', time: '~1m' },
      { id: 'docker', name: 'Docker', icon: '🐳', color: '#2496ED', time: '~5m' }
    ],
    mobile: [
      { id: 'github_actions', name: 'GitHub Actions', icon: '⚙️', color: '#2088FF', time: '~10-15m' },
      { id: 'fastlane', name: 'Fastlane', icon: '🚀', color: '#FF2D55', time: '~5-10m' }
    ]
  };

  const currentPlatforms = platforms[deployType] || [];
  const currentPlatform = currentPlatforms.find(p => p.id === platform);

  const generateDeployment = async () => {
    setIsGenerating(true);
    setGeneratedFiles([]);
    setDeployCommand('');

    try {
      const response = await fetch('/deploy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          project_type: deployType,
          project_id: projectId,
          options: { framework: 'fastapi' }
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedFiles(data.files || []);
        setDeployCommand(data.deploy_command || '');
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      alert('Fehler beim Generieren: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="deploy-panel">
      <div className="deploy-header">
        <h2>🚀 Deployment Pipeline</h2>
        <p>One-Click Deploy für Web, Backend & Mobile</p>
      </div>

      {/* Deploy Type Selector */}
      <div className="deploy-type-selector">
        <button
          className={`type-btn ${deployType === 'web' ? 'active' : ''}`}
          onClick={() => { setDeployType('web'); setPlatform('vercel'); }}
        >
          <span className="type-icon">🌐</span>
          <span className="type-name">Web</span>
        </button>
        <button
          className={`type-btn ${deployType === 'backend' ? 'active' : ''}`}
          onClick={() => { setDeployType('backend'); setPlatform('railway'); }}
        >
          <span className="type-icon">⚙️</span>
          <span className="type-name">Backend</span>
        </button>
        <button
          className={`type-btn ${deployType === 'mobile' ? 'active' : ''}`}
          onClick={() => { setDeployType('mobile'); setPlatform('github_actions'); }}
        >
          <span className="type-icon">📱</span>
          <span className="type-name">Mobile</span>
        </button>
      </div>

      {/* Platform Selector */}
      <div className="platform-selector">
        {currentPlatforms.map(p => (
          <button
            key={p.id}
            className={`platform-card ${platform === p.id ? 'active' : ''}`}
            onClick={() => setPlatform(p.id)}
            style={{ '--platform-color': p.color }}
          >
            <span className="platform-icon">{p.icon}</span>
            <span className="platform-name">{p.name}</span>
            <span className="platform-time">{p.time}</span>
          </button>
        ))}
      </div>

      {/* Current Platform Info */}
      {currentPlatform && (
        <div className="current-platform-info" style={{ borderColor: currentPlatform.color }}>
          <div className="platform-info-header">
            <span className="platform-info-icon">{currentPlatform.icon}</span>
            <h3>{currentPlatform.name}</h3>
            <span className="deploy-time">⏱️ {currentPlatform.time}</span>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="generate-section">
        <button
          className="generate-deploy-btn"
          onClick={generateDeployment}
          disabled={isGenerating}
          style={{ background: currentPlatform?.color }}
        >
          {isGenerating
            ? '⚙️ Generiere...'
            : `🚀 ${currentPlatform?.name} Config generieren`}
        </button>
      </div>

      {/* Generated Files & Command */}
      {(generatedFiles.length > 0 || deployCommand) && (
        <div className="generated-content">
          {/* Files */}
          {generatedFiles.length > 0 && (
            <div className="generated-files">
              <h3>✅ Generierte Dateien ({generatedFiles.length})</h3>
              <div className="files-list">
                {generatedFiles.map((file, index) => {
                  const filename = file.split('/').pop();
                  const extension = filename.split('.').pop();
                  const icon = 
                    extension === 'json' ? '📋' :
                    extension === 'toml' ? '⚙️' :
                    extension === 'yml' || extension === 'yaml' ? '📝' :
                    extension === 'sh' ? '🔧' :
                    filename === 'Dockerfile' ? '🐳' :
                    filename === 'Procfile' ? '📦' : '📄';
                  
                  return (
                    <div key={index} className="file-item">
                      <span className="file-icon">{icon}</span>
                      <span className="file-name">{filename}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deploy Command */}
          {deployCommand && (
            <div className="deploy-command">
              <h3>🔧 Deploy Command</h3>
              <div className="command-box">
                <code>{deployCommand}</code>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(deployCommand);
                    alert('Command copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h4>Instant Deploy</h4>
          <p>Deploy in seconds with one command</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌍</div>
          <h4>Global CDN</h4>
          <p>Serve content from edge locations worldwide</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h4>Auto SSL</h4>
          <p>Free SSL certificates for all deployments</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h4>Analytics</h4>
          <p>Monitor performance and usage metrics</p>
        </div>
      </div>

      {/* Platform Details */}
      <div className="platform-details">
        <h3>Platform Features</h3>
        <div className="details-grid">
          {deployType === 'web' && (
            <>
              <div className="detail-item">
                <strong>Vercel:</strong> Next.js optimized, Edge Functions, Preview Deployments
              </div>
              <div className="detail-item">
                <strong>Netlify:</strong> Serverless Functions, Form Handling, Split Testing
              </div>
              <div className="detail-item">
                <strong>Cloudflare:</strong> Edge Computing, Workers, DDoS Protection
              </div>
            </>
          )}
          {deployType === 'backend' && (
            <>
              <div className="detail-item">
                <strong>Railway:</strong> Instant Deploy, Auto Scaling, Database Support
              </div>
              <div className="detail-item">
                <strong>Render:</strong> Free SSL, Auto Deploy, Database Included
              </div>
              <div className="detail-item">
                <strong>Fly.io:</strong> Edge Locations, Fast Boot, Global Network
              </div>
              <div className="detail-item">
                <strong>Docker:</strong> Containerization, Portable, Multi-stage Build
              </div>
            </>
          )}
          {deployType === 'mobile' && (
            <>
              <div className="detail-item">
                <strong>GitHub Actions:</strong> iOS TestFlight, Android Play Store, Automated CI/CD
              </div>
              <div className="detail-item">
                <strong>Fastlane:</strong> iOS & Android Automation, Screenshot Generation
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployPanel;
