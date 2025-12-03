// VIBEAI - Navigation Panel Component
// Automatische Navigation-Generierung für Flutter, React, Next.js

'use client';

import { useState } from 'react';
import './NavigationPanel.css';

export default function NavigationPanel({ projectId }) {
  const [framework, setFramework] = useState('flutter');
  const [screens, setScreens] = useState([{ name: 'Home', path: '/' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [extractedRoutes, setExtractedRoutes] = useState([]);

  // Screen hinzufügen
  function addScreen() {
    setScreens([...screens, { name: '', path: '' }]);
  }

  // Screen entfernen
  function removeScreen(index) {
    setScreens(screens.filter((_, i) => i !== index));
  }

  // Screen aktualisieren
  function updateScreen(index, field, value) {
    const updated = [...screens];
    updated[index][field] = value;
    setScreens(updated);
  }

  // Navigation generieren
  async function generateNavigation() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/navigation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': 'demo' },
        body: JSON.stringify({
          framework,
          project_id: projectId,
          screens: screens.filter(s => s.name.trim())
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Existierende Routes extrahieren
  async function extractRoutes() {
    setLoading(true);

    try {
      const res = await fetch('/navigation/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': 'demo' },
        body: JSON.stringify({ framework, project_id: projectId })
      });

      const data = await res.json();
      if (data.success) {
        setExtractedRoutes(data.routes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="navigation-panel">
      {/* Header */}
      <div className="nav-header">
        <h2>🧭 Navigation Manager</h2>
        <p>Automatische Route-Generierung</p>
      </div>

      {/* Framework Selector */}
      <div className="framework-selector">
        <label>Framework:</label>
        <div className="framework-buttons">
          <button
            className={framework === 'flutter' ? 'active' : ''}
            onClick={() => setFramework('flutter')}
          >
            📱 Flutter
          </button>
          <button
            className={framework === 'react' ? 'active' : ''}
            onClick={() => setFramework('react')}
          >
            ⚛️ React
          </button>
          <button
            className={framework === 'nextjs' ? 'active' : ''}
            onClick={() => setFramework('nextjs')}
          >
            ▲ Next.js
          </button>
        </div>
      </div>

      {/* Screens Editor */}
      <div className="screens-editor">
        <div className="screens-header">
          <h3>Screens / Routes</h3>
          <button onClick={addScreen} className="add-screen-btn">+ Add Screen</button>
        </div>

        {screens.map((screen, index) => (
          <div key={index} className="screen-row">
            <input
              type="text"
              placeholder="Screen Name (z.B. Home)"
              value={screen.name}
              onChange={(e) => updateScreen(index, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Path (z.B. /home)"
              value={screen.path}
              onChange={(e) => updateScreen(index, 'path', e.target.value)}
            />
            <button
              className="remove-btn"
              onClick={() => removeScreen(index)}
              disabled={screens.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="nav-actions">
        <button
          className="generate-btn"
          onClick={generateNavigation}
          disabled={loading || screens.filter(s => s.name.trim()).length === 0}
        >
          {loading ? '⏳ Generiere...' : '🚀 Generate Navigation'}
        </button>
        <button
          className="extract-btn"
          onClick={extractRoutes}
          disabled={loading}
        >
          📥 Extract Routes
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <div>
              <h4>✅ Navigation erstellt!</h4>
              <p><strong>Framework:</strong> {result.framework}</p>
              {result.file_path && <p><strong>Datei:</strong> {result.file_path}</p>}
              {result.routes_count !== undefined && (
                <p><strong>Routes:</strong> {result.routes_count}</p>
              )}
              {result.routes_created && (
                <div className="routes-list">
                  <strong>Erstellt:</strong>
                  <ul>
                    {result.routes_created.map((r, i) => (
                      <li key={i}>{r.route} → {r.file}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4>❌ Fehler</h4>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Extracted Routes */}
      {extractedRoutes.length > 0 && (
        <div className="extracted-routes">
          <h4>📥 Gefundene Routes ({extractedRoutes.length})</h4>
          <ul>
            {extractedRoutes.map((route, i) => (
              <li key={i}>
                <strong>{route.name}</strong>
                {route.path && <span> → {route.path}</span>}
                {route.file && <span className="file-tag">{route.file}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
