import React, { useState } from 'react';
import './ModelPanel.css';

const ModelPanel = ({ projectId }) => {
  const [framework, setFramework] = useState('fastapi');
  const [models, setModels] = useState([
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'int', auto: true },
        { name: 'email', type: 'string', email: true, unique: true },
        { name: 'username', type: 'string', min_length: 3, max_length: 50 }
      ]
    }
  ]);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [generatedEndpoints, setGeneratedEndpoints] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const frameworks = [
    { id: 'fastapi', name: 'FastAPI', icon: '⚡', color: '#009688' },
    { id: 'flask', name: 'Flask', icon: '🧪', color: '#000000' },
    { id: 'django', name: 'Django', icon: '🐍', color: '#0C4B33' },
    { id: 'express', name: 'Express', icon: '🚂', color: '#68A063' }
  ];

  const fieldTypes = [
    'string', 'text', 'int', 'float', 'boolean', 'date', 'datetime', 
    'email', 'url', 'uuid', 'json'
  ];

  const addModel = () => {
    setModels([
      ...models,
      {
        name: `Model${models.length + 1}`,
        fields: [{ name: 'id', type: 'int', auto: true }]
      }
    ]);
  };

  const removeModel = (modelIndex) => {
    setModels(models.filter((_, i) => i !== modelIndex));
  };

  const updateModelName = (modelIndex, newName) => {
    setModels(
      models.map((model, i) => 
        i === modelIndex ? { ...model, name: newName } : model
      )
    );
  };

  const addField = (modelIndex) => {
    setModels(
      models.map((model, i) =>
        i === modelIndex
          ? {
              ...model,
              fields: [...model.fields, { name: 'new_field', type: 'string' }]
            }
          : model
      )
    );
  };

  const removeField = (modelIndex, fieldIndex) => {
    setModels(
      models.map((model, i) =>
        i === modelIndex
          ? {
              ...model,
              fields: model.fields.filter((_, fi) => fi !== fieldIndex)
            }
          : model
      )
    );
  };

  const updateField = (modelIndex, fieldIndex, key, value) => {
    setModels(
      models.map((model, i) =>
        i === modelIndex
          ? {
              ...model,
              fields: model.fields.map((field, fi) =>
                fi === fieldIndex ? { ...field, [key]: value } : field
              )
            }
          : model
      )
    );
  };

  const generateBackend = async () => {
    setIsGenerating(true);
    setGeneratedFiles([]);
    setGeneratedEndpoints([]);

    try {
      const response = await fetch('/backend-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          project_id: projectId,
          models,
          options: { database: 'postgresql' }
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedFiles(data.files || []);
        setGeneratedEndpoints(data.endpoints || []);
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      alert('Fehler beim Generieren: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentFramework = frameworks.find(f => f.id === framework);

  return (
    <div className="model-panel">
      <div className="model-header">
        <h2>🏗️ Backend Model Generator</h2>
        <p>Generiere Models, Controllers, CRUD & Routes automatisch</p>
      </div>

      {/* Framework Selector */}
      <div className="framework-selector">
        {frameworks.map(fw => (
          <button
            key={fw.id}
            className={`framework-btn ${framework === fw.id ? 'active' : ''}`}
            onClick={() => setFramework(fw.id)}
            style={{ '--fw-color': fw.color }}
          >
            <span className="fw-icon">{fw.icon}</span>
            <span className="fw-name">{fw.name}</span>
          </button>
        ))}
      </div>

      {/* Current Framework Info */}
      {currentFramework && (
        <div className="current-fw-info" style={{ borderColor: currentFramework.color }}>
          <div className="fw-info-header">
            <span className="fw-info-icon">{currentFramework.icon}</span>
            <h3>{currentFramework.name}</h3>
          </div>
        </div>
      )}

      {/* Models Editor */}
      <div className="models-editor">
        <div className="models-editor-header">
          <h3>Models</h3>
          <button className="add-model-btn" onClick={addModel}>
            ➕ Model hinzufügen
          </button>
        </div>

        {models.map((model, modelIndex) => (
          <div key={modelIndex} className="model-editor">
            <div className="model-header">
              <input
                type="text"
                value={model.name}
                onChange={(e) => updateModelName(modelIndex, e.target.value)}
                className="model-name-input"
                placeholder="Model Name"
              />
              <button
                className="remove-model-btn"
                onClick={() => removeModel(modelIndex)}
              >
                🗑️
              </button>
            </div>

            <div className="fields-list">
              <div className="fields-header">
                <span>Field Name</span>
                <span>Type</span>
                <span>Constraints</span>
                <span>Actions</span>
              </div>

              {model.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="field-row">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateField(modelIndex, fieldIndex, 'name', e.target.value)
                    }
                    className="field-name-input"
                    placeholder="field_name"
                  />

                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(modelIndex, fieldIndex, 'type', e.target.value)
                    }
                    className="field-type-select"
                  >
                    {fieldTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <div className="field-constraints">
                    <label className="constraint-checkbox">
                      <input
                        type="checkbox"
                        checked={field.unique || false}
                        onChange={(e) =>
                          updateField(modelIndex, fieldIndex, 'unique', e.target.checked)
                        }
                      />
                      Unique
                    </label>
                    <label className="constraint-checkbox">
                      <input
                        type="checkbox"
                        checked={field.email || false}
                        onChange={(e) =>
                          updateField(modelIndex, fieldIndex, 'email', e.target.checked)
                        }
                      />
                      Email
                    </label>
                    <label className="constraint-checkbox">
                      <input
                        type="checkbox"
                        checked={field.auto || false}
                        onChange={(e) =>
                          updateField(modelIndex, fieldIndex, 'auto', e.target.checked)
                        }
                      />
                      Auto
                    </label>
                  </div>

                  <button
                    className="remove-field-btn"
                    onClick={() => removeField(modelIndex, fieldIndex)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              className="add-field-btn"
              onClick={() => addField(modelIndex)}
            >
              ➕ Field hinzufügen
            </button>
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="generate-section">
        <button
          className="generate-backend-btn"
          onClick={generateBackend}
          disabled={isGenerating || models.length === 0}
          style={{ background: currentFramework?.color }}
        >
          {isGenerating
            ? '⚙️ Generiere...'
            : `🚀 ${currentFramework?.name} Backend generieren`}
        </button>
      </div>

      {/* Generated Files & Endpoints */}
      {(generatedFiles.length > 0 || generatedEndpoints.length > 0) && (
        <div className="generated-content">
          {/* Files */}
          {generatedFiles.length > 0 && (
            <div className="generated-files">
              <h3>✅ Generierte Dateien ({generatedFiles.length})</h3>
              <div className="files-list">
                {generatedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">
                      {file.endsWith('.py') ? '🐍' : '📄'}
                    </span>
                    <span className="file-path">{file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endpoints */}
          {generatedEndpoints.length > 0 && (
            <div className="generated-endpoints">
              <h3>🔗 API Endpoints ({generatedEndpoints.length})</h3>
              <div className="endpoints-list">
                {generatedEndpoints.map((endpoint, index) => {
                  const [method, path] = endpoint.split(' ');
                  return (
                    <div key={index} className="endpoint-item">
                      <span className={`method-badge ${method.toLowerCase()}`}>
                        {method}
                      </span>
                      <span className="endpoint-path">{path}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h4>Pydantic Models</h4>
          <p>Type-safe models with automatic validation</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h4>CRUD Operations</h4>
          <p>Complete Create, Read, Update, Delete logic</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔗</div>
          <h4>REST API Routes</h4>
          <p>Auto-generated endpoints with documentation</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✅</div>
          <h4>Validators</h4>
          <p>Email, URL, min/max length validation</p>
        </div>
      </div>
    </div>
  );
};

export default ModelPanel;
