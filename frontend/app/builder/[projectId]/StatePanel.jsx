// VIBEAI - State Management Panel
// Generiert State Management Code für Flutter, React, Vue

'use client';

import { useState } from 'react';
import './StatePanel.css';

export default function StatePanel({ projectId }) {
  const [framework, setFramework] = useState('flutter');
  const [library, setLibrary] = useState('riverpod');
  const [stateName, setStateName] = useState('app');
  const [fields, setFields] = useState([
    { name: 'count', type: 'int', default: '0' }
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');

  const libraries = {
    flutter: ['riverpod', 'provider', 'bloc', 'getx'],
    react: ['zustand', 'redux', 'context', 'recoil'],
    vue: ['pinia', 'vuex']
  };

  // Framework wechseln
  function changeFramework(fw) {
    setFramework(fw);
    setLibrary(libraries[fw][0]);
    updateFieldTypes(fw);
  }

  // Feld-Typen anpassen
  function updateFieldTypes(fw) {
    const typeMap = {
      flutter: 'int',
      react: 'number',
      vue: 'number'
    };
    setFields(fields.map(f => ({ ...f, type: typeMap[fw] })));
  }

  // Feld hinzufügen
  function addField() {
    const typeMap = { flutter: 'String', react: 'string', vue: 'string' };
    setFields([...fields, { name: '', type: typeMap[framework], default: '""' }]);
  }

  // Feld entfernen
  function removeField(index) {
    setFields(fields.filter((_, i) => i !== index));
  }

  // Feld aktualisieren
  function updateField(index, key, value) {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  }

  // State generieren
  async function generateState() {
    setLoading(true);
    setResult(null);
    setGeneratedCode('');

    try {
      const res = await fetch('/state/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user': 'demo' },
        body: JSON.stringify({
          framework,
          library,
          state_name: stateName,
          fields: fields.filter(f => f.name.trim()),
          project_id: projectId,
          save_to_file: false
        })
      });

      const data = await res.json();
      setResult(data);
      if (data.success && data.code) {
        setGeneratedCode(data.code);
      }
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Template laden
  async function loadTemplate() {
    try {
      const res = await fetch(`/state/templates/${library}`);
      const data = await res.json();
      if (data.success && data.code) {
        setGeneratedCode(data.code);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="state-panel">
      {/* Header */}
      <div className="state-header">
        <h2>🔄 State Manager</h2>
        <p>State Management Code-Generator</p>
      </div>

      {/* Framework Selector */}
      <div className="framework-selector">
        <label>Framework:</label>
        <div className="framework-buttons">
          {Object.keys(libraries).map(fw => (
            <button
              key={fw}
              className={framework === fw ? 'active' : ''}
              onClick={() => changeFramework(fw)}
            >
              {fw === 'flutter' && '📱'}
              {fw === 'react' && '⚛️'}
              {fw === 'vue' && '🟢'}
              {' '}{fw.charAt(0).toUpperCase() + fw.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Library Selector */}
      <div className="library-selector">
        <label>Library:</label>
        <select value={library} onChange={(e) => setLibrary(e.target.value)}>
          {libraries[framework].map(lib => (
            <option key={lib} value={lib}>{lib}</option>
          ))}
        </select>
      </div>

      {/* State Name */}
      <div className="state-name">
        <label>State Name:</label>
        <input
          type="text"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          placeholder="z.B. user, app, auth"
        />
      </div>

      {/* Fields Editor */}
      <div className="fields-editor">
        <div className="fields-header">
          <h3>State Fields</h3>
          <button onClick={addField} className="add-field-btn">+ Add Field</button>
        </div>

        {fields.map((field, index) => (
          <div key={index} className="field-row">
            <input
              type="text"
              placeholder="Name"
              value={field.name}
              onChange={(e) => updateField(index, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Type"
              value={field.type}
              onChange={(e) => updateField(index, 'type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Default"
              value={field.default}
              onChange={(e) => updateField(index, 'default', e.target.value)}
            />
            <button
              className="remove-btn"
              onClick={() => removeField(index)}
              disabled={fields.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="state-actions">
        <button
          className="generate-btn"
          onClick={generateState}
          disabled={loading || !stateName.trim()}
        >
          {loading ? '⏳ Generiere...' : '🚀 Generate State'}
        </button>
        <button className="template-btn" onClick={loadTemplate} disabled={loading}>
          📄 Load Template
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <div>
              <h4>✅ State generiert!</h4>
              <p><strong>Framework:</strong> {result.framework}</p>
              <p><strong>Library:</strong> {result.library}</p>
              <p><strong>State:</strong> {result.state_name}</p>
              {result.file_path && <p><strong>Datei:</strong> {result.file_path}</p>}
            </div>
          ) : (
            <div>
              <h4>❌ Fehler</h4>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Generated Code */}
      {generatedCode && (
        <div className="generated-code">
          <div className="code-header">
            <h4>📝 Generierter Code</h4>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="copy-btn"
            >
              📋 Copy
            </button>
          </div>
          <pre><code>{generatedCode}</code></pre>
        </div>
      )}
    </div>
  );
}
