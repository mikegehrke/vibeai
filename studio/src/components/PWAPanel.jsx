import React, { useState } from 'react';
import './PWAPanel.css';

const PWAPanel = () => {
  const [appName, setAppName] = useState('VibeAI App');
  const [shortName, setShortName] = useState('VibeAI');
  const [description, setDescription] = useState('Progressive Web Application');
  const [themeColor, setThemeColor] = useState('#667eea');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [displayMode, setDisplayMode] = useState('standalone');
  const [cacheStrategy, setCacheStrategy] = useState('network_first');
  const [orientation, setOrientation] = useState('portrait-primary');
  const [shareTarget, setShareTarget] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState([]);

  // Load cache strategies on mount
  React.useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/pwa/strategies');
      const data = await response.json();
      setStrategies(data.strategies);
    } catch (error) {
      console.error('Failed to load strategies:', error);
    }
  };

  const generatePWA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/pwa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: appName,
          short_name: shortName,
          description: description,
          theme_color: themeColor,
          background_color: backgroundColor,
          display: displayMode,
          cache_strategy: cacheStrategy,
          orientation: orientation,
          share_target: shareTarget,
          cache_urls: ['/index.html', '/styles.css', '/app.js'],
          categories: ['utilities', 'productivity']
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedFiles(data.files);
        setFeatures(data.features);
      }
    } catch (error) {
      console.error('PWA generation failed:', error);
      alert('Failed to generate PWA. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const displayModes = [
    { id: 'standalone', name: 'Standalone', desc: 'Läuft wie native App' },
    { id: 'fullscreen', name: 'Fullscreen', desc: 'Vollbildmodus' },
    { id: 'minimal-ui', name: 'Minimal UI', desc: 'Minimale Browser-UI' },
    { id: 'browser', name: 'Browser', desc: 'Normal Browser Tab' }
  ];

  const orientations = [
    'portrait-primary',
    'portrait-secondary',
    'landscape-primary',
    'landscape-secondary',
    'any'
  ];

  return (
    <div className="pwa-panel">
      <div className="pwa-header">
        <h1>⚡ PWA & Offline Generator</h1>
        <p>Progressive Web App Konfiguration mit Service Worker</p>
      </div>

      {/* App Info Section */}
      <div className="pwa-section">
        <h2>📱 App Information</h2>
        <div className="pwa-grid">
          <div className="pwa-input-group">
            <label>App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="VibeAI App"
            />
          </div>
          <div className="pwa-input-group">
            <label>Short Name</label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="VibeAI"
            />
          </div>
          <div className="pwa-input-group full-width">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Progressive Web Application"
            />
          </div>
        </div>
      </div>

      {/* Theme & Colors Section */}
      <div className="pwa-section">
        <h2>🎨 Theme & Colors</h2>
        <div className="pwa-grid">
          <div className="pwa-input-group">
            <label>Theme Color</label>
            <div className="color-input">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
              />
              <input
                type="text"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                placeholder="#667eea"
              />
            </div>
          </div>
          <div className="pwa-input-group">
            <label>Background Color</label>
            <div className="color-input">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display Mode Section */}
      <div className="pwa-section">
        <h2>📺 Display Mode</h2>
        <div className="display-modes">
          {displayModes.map((mode) => (
            <div
              key={mode.id}
              className={`display-mode-card ${displayMode === mode.id ? 'active' : ''}`}
              onClick={() => setDisplayMode(mode.id)}
            >
              <h3>{mode.name}</h3>
              <p>{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Strategy Section */}
      <div className="pwa-section">
        <h2>💾 Cache Strategy</h2>
        <div className="cache-strategies">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={`strategy-card ${cacheStrategy === strategy.id ? 'active' : ''}`}
              onClick={() => setCacheStrategy(strategy.id)}
            >
              <h3>{strategy.name}</h3>
              <p className="strategy-desc">{strategy.description}</p>
              <span className="strategy-use-case">{strategy.use_case}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options Section */}
      <div className="pwa-section">
        <h2>⚙️ Advanced Options</h2>
        <div className="pwa-grid">
          <div className="pwa-input-group">
            <label>Orientation</label>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
              {orientations.map((ori) => (
                <option key={ori} value={ori}>
                  {ori}
                </option>
              ))}
            </select>
          </div>
          <div className="pwa-input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={shareTarget}
                onChange={(e) => setShareTarget(e.target.checked)}
              />
              Share Target API
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        className="pwa-generate-button"
        onClick={generatePWA}
        disabled={loading}
      >
        {loading ? '⏳ Generating...' : '⚡ Generate PWA'}
      </button>

      {/* Generated Files Section */}
      {generatedFiles.length > 0 && (
        <div className="pwa-section">
          <h2>📦 Generated Files</h2>
          <div className="generated-files">
            {generatedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-path">{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      {features.length > 0 && (
        <div className="pwa-section">
          <h2>✨ PWA Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-badge">
                ✓ {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PWA Info Cards */}
      <div className="pwa-section">
        <h2>📖 PWA Benefits</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">📴</div>
            <h3>Offline Support</h3>
            <p>Works without internet connection using cached content</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📲</div>
            <h3>Installable</h3>
            <p>Add to home screen like native apps</p>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Fast Loading</h3>
            <p>Instant loading with cache-first strategy</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔔</div>
            <h3>Push Notifications</h3>
            <p>Engage users with push notifications</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔄</div>
            <h3>Background Sync</h3>
            <p>Sync data when connection is restored</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🌐</div>
            <h3>Cross-Platform</h3>
            <p>Works on all devices and operating systems</p>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="pwa-section">
        <h2>🚀 Implementation Steps</h2>
        <div className="implementation-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Add Manifest Link</h3>
              <code>&lt;link rel="manifest" href="/manifest.json"&gt;</code>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Register Service Worker</h3>
              <code>&lt;script src="/sw-register.js"&gt;&lt;/script&gt;</code>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Add Install Prompt</h3>
              <code>&lt;script src="/install-prompt.js"&gt;&lt;/script&gt;</code>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Test on HTTPS</h3>
              <code>Service Workers require HTTPS (or localhost)</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAPanel;
