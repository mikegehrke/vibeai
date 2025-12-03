import React, { useState } from 'react';
import './StorePanel.css';

const StorePanel = () => {
  const [config, setConfig] = useState({
    appName: 'My Awesome App',
    appDescription: 'A revolutionary app that changes everything',
    category: 'productivity',
    platforms: 'both',
    keywords: ['productivity', 'tasks', 'organize'],
    targetAudience: 'Professionals and students',
    primaryColor: '#007AFF',
    version: '1.0.0',
    generateScreenshots: true,
    generateIcons: true,
    generatePrivacyPolicy: true,
    generateTerms: true
  });

  const [generatedData, setGeneratedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('metadata');

  const categories = [
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'productivity', name: 'Productivity', icon: '📋' },
    { id: 'social', name: 'Social', icon: '💬' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'health', name: 'Health & Fitness', icon: '❤️' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'utilities', name: 'Utilities', icon: '🔧' },
    { id: 'games', name: 'Games', icon: '🎮' }
  ];

  const quickExamples = [
    {
      name: 'Productivity App',
      config: {
        appName: 'TaskMaster Pro',
        appDescription: 'The ultimate productivity app to manage your tasks, projects, and goals efficiently.',
        category: 'productivity',
        keywords: ['tasks', 'todo', 'productivity', 'planner', 'organize'],
        targetAudience: 'Professionals and students',
        primaryColor: '#007AFF'
      }
    },
    {
      name: 'Social Chat',
      config: {
        appName: 'ChatHub',
        appDescription: 'Connect with friends through instant messaging, voice calls, and video chats.',
        category: 'social',
        keywords: ['chat', 'messaging', 'social', 'friends', 'video call'],
        targetAudience: 'Social users who want to stay connected',
        primaryColor: '#34C759'
      }
    },
    {
      name: 'Fitness Tracker',
      config: {
        appName: 'FitTracker',
        appDescription: 'Track your fitness journey with workout plans, calorie counting, and health insights.',
        category: 'health',
        keywords: ['fitness', 'health', 'workout', 'tracker', 'exercise'],
        targetAudience: 'Fitness enthusiasts',
        primaryColor: '#FF3B30'
      }
    },
    {
      name: 'Finance Manager',
      config: {
        appName: 'MoneyWise',
        appDescription: 'Take control of your finances with budget tracking and expense management.',
        category: 'finance',
        keywords: ['budget', 'finance', 'money', 'expense', 'savings'],
        targetAudience: 'Personal finance managers',
        primaryColor: '#5856D6'
      }
    }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/store-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: config.appName,
          app_description: config.appDescription,
          category: config.category,
          platforms: config.platforms,
          keywords: config.keywords,
          target_audience: config.targetAudience,
          primary_color: config.primaryColor,
          version: config.version,
          generate_screenshots: config.generateScreenshots,
          generate_icons: config.generateIcons,
          generate_privacy_policy: config.generatePrivacyPolicy,
          generate_terms: config.generateTerms
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedData(data);
      setActiveTab('metadata');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example) => {
    setConfig({
      ...config,
      ...example.config
    });
  };

  const addKeyword = () => {
    const keyword = prompt('Enter keyword:');
    if (keyword && keyword.trim()) {
      setConfig({
        ...config,
        keywords: [...config.keywords, keyword.trim()]
      });
    }
  };

  const removeKeyword = (index) => {
    setConfig({
      ...config,
      keywords: config.keywords.filter((_, i) => i !== index)
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadAsFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="store-panel">
      <div className="store-header">
        <h1>🏪 AI Store Generator</h1>
        <p>Automatische App Store + Play Store Listings, Screenshots, Icons, Manifeste</p>
      </div>

      <div className="store-content">
        {/* Configuration Section */}
        <div className="config-section">
          <h2>📱 App Configuration</h2>

          {/* Quick Examples */}
          <div className="quick-examples">
            <h3>Quick Examples</h3>
            <div className="examples-grid">
              {quickExamples.map((example, idx) => (
                <button
                  key={idx}
                  className="example-btn"
                  onClick={() => loadExample(example)}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-group">
            <label>App Name</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
              placeholder="My Awesome App"
              maxLength={30}
            />
            <small>{config.appName.length}/30 characters</small>
          </div>

          <div className="form-group">
            <label>App Description</label>
            <textarea
              value={config.appDescription}
              onChange={(e) => setConfig({ ...config, appDescription: e.target.value })}
              placeholder="A revolutionary app that..."
              rows={4}
              maxLength={4000}
            />
            <small>{config.appDescription.length}/4000 characters</small>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-btn ${config.category === cat.id ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, category: cat.id })}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="form-group">
            <label>Platform</label>
            <div className="platform-selector">
              <button
                className={`platform-btn ${config.platforms === 'ios' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, platforms: 'ios' })}
              >
                 iOS
              </button>
              <button
                className={`platform-btn ${config.platforms === 'android' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, platforms: 'android' })}
              >
                🤖 Android
              </button>
              <button
                className={`platform-btn ${config.platforms === 'both' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, platforms: 'both' })}
              >
                📱 Both
              </button>
            </div>
          </div>

          {/* Keywords */}
          <div className="form-group">
            <label>Keywords</label>
            <div className="keywords-container">
              {config.keywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                  <button onClick={() => removeKeyword(idx)}>×</button>
                </span>
              ))}
              <button className="add-keyword-btn" onClick={addKeyword}>
                + Add Keyword
              </button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="form-group">
            <label>Target Audience</label>
            <input
              type="text"
              value={config.targetAudience}
              onChange={(e) => setConfig({ ...config, targetAudience: e.target.value })}
              placeholder="Professionals, students, etc."
            />
          </div>

          {/* Primary Color */}
          <div className="form-group">
            <label>Primary Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                placeholder="#007AFF"
              />
            </div>
          </div>

          {/* Version */}
          <div className="form-group">
            <label>Version</label>
            <input
              type="text"
              value={config.version}
              onChange={(e) => setConfig({ ...config, version: e.target.value })}
              placeholder="1.0.0"
            />
          </div>

          {/* Generation Options */}
          <div className="form-group">
            <label>Generate Assets</label>
            <div className="checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.generateScreenshots}
                  onChange={(e) => setConfig({ ...config, generateScreenshots: e.target.checked })}
                />
                <span>Screenshots</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.generateIcons}
                  onChange={(e) => setConfig({ ...config, generateIcons: e.target.checked })}
                />
                <span>Icons</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.generatePrivacyPolicy}
                  onChange={(e) => setConfig({ ...config, generatePrivacyPolicy: e.target.checked })}
                />
                <span>Privacy Policy</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.generateTerms}
                  onChange={(e) => setConfig({ ...config, generateTerms: e.target.checked })}
                />
                <span>Terms of Service</span>
              </label>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '🚀 Generate Store Listing'}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {generatedData && (
          <div className="results-section">
            <h2>📦 Generated Listing</h2>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
              >
                📝 Metadata
              </button>
              <button
                className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
                onClick={() => setActiveTab('assets')}
              >
                🎨 Assets
              </button>
              <button
                className={`tab ${activeTab === 'legal' ? 'active' : ''}`}
                onClick={() => setActiveTab('legal')}
              >
                ⚖️ Legal
              </button>
              <button
                className={`tab ${activeTab === 'build' ? 'active' : ''}`}
                onClick={() => setActiveTab('build')}
              >
                🛠️ Build
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'metadata' && (
                <div className="metadata-content">
                  <h3> App Store</h3>
                  <div className="metadata-item">
                    <strong>Title:</strong>
                    <p>{generatedData.app_store_metadata.name}</p>
                  </div>
                  <div className="metadata-item">
                    <strong>Subtitle:</strong>
                    <p>{generatedData.app_store_metadata.subtitle}</p>
                  </div>
                  <div className="metadata-item">
                    <strong>Description:</strong>
                    <pre>{generatedData.app_store_metadata.description}</pre>
                    <button onClick={() => copyToClipboard(generatedData.app_store_metadata.description)}>
                      📋 Copy
                    </button>
                  </div>
                  <div className="metadata-item">
                    <strong>Keywords:</strong>
                    <p>{generatedData.app_store_metadata.keywords}</p>
                  </div>

                  <h3>🤖 Play Store</h3>
                  <div className="metadata-item">
                    <strong>Title:</strong>
                    <p>{generatedData.play_store_metadata.title}</p>
                  </div>
                  <div className="metadata-item">
                    <strong>Short Description:</strong>
                    <p>{generatedData.play_store_metadata.short_description}</p>
                  </div>
                  <div className="metadata-item">
                    <strong>Full Description:</strong>
                    <pre>{generatedData.play_store_metadata.full_description}</pre>
                    <button onClick={() => copyToClipboard(generatedData.play_store_metadata.full_description)}>
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="assets-content">
                  <h3>📱 Icon Exports</h3>
                  <pre>{JSON.stringify(generatedData.icon_exports, null, 2)}</pre>
                  <button onClick={() => downloadAsFile(JSON.stringify(generatedData.icon_exports, null, 2), 'icon_exports.json')}>
                    💾 Download JSON
                  </button>

                  <h3>🖼️ Splash Screens</h3>
                  <pre>{JSON.stringify(generatedData.splash_exports, null, 2)}</pre>

                  <h3>📸 Screenshots</h3>
                  {generatedData.screenshot_mockups.map((mockup, idx) => (
                    <pre key={idx}>{mockup}</pre>
                  ))}
                </div>
              )}

              {activeTab === 'legal' && (
                <div className="legal-content">
                  <h3>🔒 Privacy Policy</h3>
                  <pre>{generatedData.privacy_policy}</pre>
                  <button onClick={() => downloadAsFile(generatedData.privacy_policy, 'privacy_policy.md')}>
                    💾 Download
                  </button>

                  <h3>📜 Terms of Service</h3>
                  <pre>{generatedData.terms_of_service}</pre>
                  <button onClick={() => downloadAsFile(generatedData.terms_of_service, 'terms_of_service.md')}>
                    💾 Download
                  </button>
                </div>
              )}

              {activeTab === 'build' && (
                <div className="build-content">
                  <h3>📱 Manifests</h3>
                  {Object.entries(generatedData.manifest_files).map(([key, value]) => (
                    <div key={key} className="manifest-item">
                      <h4>{key}</h4>
                      <pre>{value}</pre>
                      <button onClick={() => downloadAsFile(value, `${key}`)}>
                        💾 Download
                      </button>
                    </div>
                  ))}

                  <h3>🛠️ Build Commands</h3>
                  <pre>{generatedData.build_commands}</pre>
                  <button onClick={() => downloadAsFile(generatedData.build_commands, 'build_commands.sh')}>
                    💾 Download
                  </button>

                  <h3>📝 Changelog</h3>
                  <pre>{generatedData.changelog}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePanel;
