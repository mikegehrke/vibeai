import React, { useState } from 'react';
import './ThemePanel.css';

const ThemePanel = () => {
  const [framework, setFramework] = useState('react');
  const [colors, setColors] = useState({
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  });
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [themeData, setThemeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState([]);

  React.useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const response = await fetch('/theme/palette/presets');
      const data = await response.json();
      setPresets(data.presets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const generateTheme = async () => {
    setLoading(true);
    try {
      const response = await fetch('/theme/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: framework,
          colors: colors,
          include_dark_mode: true
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedFiles(data.files);
        setThemeData(data.theme_data);
      }
    } catch (error) {
      console.error('Theme generation failed:', error);
      alert('Failed to generate theme. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setColors(preset.colors);
  };

  const updateColor = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const frameworks = [
    { id: 'flutter', name: 'Flutter', icon: '📱' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'css', name: 'CSS', icon: '🎨' },
    { id: 'tailwind', name: 'Tailwind', icon: '💨' },
    { id: 'vuejs', name: 'Vue.js', icon: '💚' },
    { id: 'angular', name: 'Angular', icon: '🅰️' }
  ];

  return (
    <div className="theme-panel">
      <div className="theme-header">
        <h1>🎨 Theme Generator</h1>
        <p>Light & Dark Mode für alle Frameworks</p>
      </div>

      {/* Framework Selection */}
      <div className="theme-section">
        <h2>⚙️ Framework</h2>
        <div className="framework-grid">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className={`framework-card ${framework === fw.id ? 'active' : ''}`}
              onClick={() => setFramework(fw.id)}
            >
              <span className="framework-icon">{fw.icon}</span>
              <span className="framework-name">{fw.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div className="theme-section">
        <h2>🎨 Color Presets</h2>
        <div className="presets-grid">
          {presets.map((preset, index) => (
            <div
              key={index}
              className="preset-card"
              onClick={() => applyPreset(preset)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-colors">
                <span
                  className="preset-color"
                  style={{ backgroundColor: preset.colors.primary }}
                />
                <span
                  className="preset-color"
                  style={{ backgroundColor: preset.colors.secondary }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="theme-section">
        <h2>🌈 Custom Colors</h2>
        <div className="colors-grid">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="#667eea"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        className="theme-generate-button"
        onClick={generateTheme}
        disabled={loading}
      >
        {loading ? '⏳ Generating...' : '🎨 Generate Theme'}
      </button>

      {/* Generated Files */}
      {generatedFiles.length > 0 && (
        <div className="theme-section">
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

      {/* Theme Preview */}
      {themeData && (
        <div className="theme-section">
          <h2>✨ Theme Features</h2>
          <div className="features-grid">
            {themeData.features.map((feature, index) => (
              <div key={index} className="feature-badge">
                ✓ {feature}
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <h2>🎨 Color Preview</h2>
          <div className="color-preview">
            <div className="preview-mode">
              <h3>Light Mode</h3>
              <div className="preview-card light">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="preview-color-item">
                    <div
                      className="preview-color-box"
                      style={{ backgroundColor: value }}
                    />
                    <span className="preview-color-name">{key}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-mode">
              <h3>Dark Mode</h3>
              <div className="preview-card dark">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="preview-color-item">
                    <div
                      className="preview-color-box"
                      style={{ backgroundColor: value }}
                    />
                    <span className="preview-color-name">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Guide */}
      <div className="theme-section">
        <h2>📖 Implementation Guide</h2>
        <div className="implementation-tabs">
          {framework === 'flutter' && (
            <div className="implementation-content">
              <h3>Flutter Integration</h3>
              <pre><code>{`// main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/theme.dart';
import 'theme/theme_provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => ThemeProvider(),
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    
    return MaterialApp(
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: themeProvider.themeMode,
      home: HomeScreen(),
    );
  }
}`}</code></pre>
            </div>
          )}

          {framework === 'react' && (
            <div className="implementation-content">
              <h3>React Integration</h3>
              <pre><code>{`// App.jsx
import { ThemeProvider } from './theme/ThemeContext';
import { useTheme } from './theme/useTheme';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}

// Component.jsx
function Component() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div style={{ background: theme.background }}>
      <button onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}`}</code></pre>
            </div>
          )}

          {framework === 'css' && (
            <div className="implementation-content">
              <h3>CSS Integration</h3>
              <pre><code>{`<!-- index.html -->
<link rel="stylesheet" href="/styles/theme.css">
<script type="module" src="/scripts/theme-switcher.js"></script>

<!-- Usage -->
<button id="theme-toggle">Toggle Theme</button>

<script type="module">
  import themeSwitcher from './scripts/theme-switcher.js';
  
  document.getElementById('theme-toggle')
    .addEventListener('click', () => {
      themeSwitcher.toggle();
    });
</script>`}</code></pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemePanel;
