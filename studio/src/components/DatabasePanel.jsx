import React, { useState } from 'react';
import './DatabasePanel.css';

const DatabasePanel = ({ projectId }) => {
  const [databaseType, setDatabaseType] = useState('supabase');
  const [customSchema, setCustomSchema] = useState({
    tables: [
      {
        name: 'users',
        fields: [
          { name: 'id', type: 'uuid', primary: true },
          { name: 'email', type: 'string', unique: true },
          { name: 'password', type: 'string' },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    ]
  });
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);

  const databases = [
    {
      id: 'supabase',
      name: 'Supabase',
      icon: '🐘',
      color: '#3ECF8E',
      features: ['PostgreSQL', 'RLS', 'Real-time', 'Auto APIs']
    },
    {
      id: 'prisma',
      name: 'Prisma',
      icon: '🔷',
      color: '#2D3748',
      features: ['Type-safe', 'Migrations', 'Studio', 'Multi-DB']
    },
    {
      id: 'firebase',
      name: 'Firebase',
      icon: '🔥',
      color: '#FFCA28',
      features: ['Firestore', 'Auth', 'Real-time', 'Security Rules']
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      icon: '🍃',
      color: '#4DB33D',
      features: ['NoSQL', 'Mongoose', 'Flexible', 'Scalable']
    },
    {
      id: 'sqlite',
      name: 'SQLite',
      icon: '💾',
      color: '#003B57',
      features: ['File-based', 'Zero Config', 'Embedded', 'Lightweight']
    }
  ];

  const fieldTypes = [
    'uuid', 'string', 'text', 'int', 'float', 'boolean', 'timestamp', 'date'
  ];

  const addTable = () => {
    setCustomSchema(prev => ({
      ...prev,
      tables: [
        ...prev.tables,
        {
          name: `table_${prev.tables.length + 1}`,
          fields: [
            { name: 'id', type: 'uuid', primary: true }
          ]
        }
      ]
    }));
  };

  const removeTable = (tableIndex) => {
    setCustomSchema(prev => ({
      ...prev,
      tables: prev.tables.filter((_, i) => i !== tableIndex)
    }));
  };

  const updateTableName = (tableIndex, newName) => {
    setCustomSchema(prev => ({
      ...prev,
      tables: prev.tables.map((table, i) => 
        i === tableIndex ? { ...table, name: newName } : table
      )
    }));
  };

  const addField = (tableIndex) => {
    setCustomSchema(prev => ({
      ...prev,
      tables: prev.tables.map((table, i) => 
        i === tableIndex 
          ? { 
              ...table, 
              fields: [...table.fields, { name: 'new_field', type: 'string' }] 
            }
          : table
      )
    }));
  };

  const removeField = (tableIndex, fieldIndex) => {
    setCustomSchema(prev => ({
      ...prev,
      tables: prev.tables.map((table, i) => 
        i === tableIndex 
          ? { 
              ...table, 
              fields: table.fields.filter((_, fi) => fi !== fieldIndex) 
            }
          : table
      )
    }));
  };

  const updateField = (tableIndex, fieldIndex, key, value) => {
    setCustomSchema(prev => ({
      ...prev,
      tables: prev.tables.map((table, i) => 
        i === tableIndex 
          ? {
              ...table,
              fields: table.fields.map((field, fi) => 
                fi === fieldIndex 
                  ? { ...field, [key]: value }
                  : field
              )
            }
          : table
      )
    }));
  };

  const generateDatabase = async () => {
    setIsGenerating(true);
    setGeneratedFiles([]);

    try {
      const response = await fetch('/db-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database_type: databaseType,
          project_id: projectId,
          db_schema: customSchema
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedFiles(data.files || []);
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
      }
    } catch (error) {
      alert('Fehler beim Generieren: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDatabase = databases.find(db => db.id === databaseType);

  return (
    <div className="database-panel">
      <div className="database-header">
        <h2>🗄️ Database Generator</h2>
        <p>Generiere Schema, Models und Config für 5 Datenbanken</p>
      </div>

      {/* Database Type Selector */}
      <div className="database-selector">
        {databases.map(db => (
          <button
            key={db.id}
            className={`database-card ${databaseType === db.id ? 'active' : ''}`}
            onClick={() => setDatabaseType(db.id)}
            style={{ '--db-color': db.color }}
          >
            <span className="db-icon">{db.icon}</span>
            <span className="db-name">{db.name}</span>
            <div className="db-features">
              {db.features.map((feature, i) => (
                <span key={i} className="db-feature-tag">{feature}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Current Database Info */}
      {currentDatabase && (
        <div className="current-db-info" style={{ borderColor: currentDatabase.color }}>
          <div className="db-info-header">
            <span className="db-info-icon">{currentDatabase.icon}</span>
            <h3>{currentDatabase.name}</h3>
          </div>
          <div className="db-info-features">
            {currentDatabase.features.map((feature, i) => (
              <div key={i} className="feature-badge" style={{ background: currentDatabase.color }}>
                {feature}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema Editor Toggle */}
      <div className="schema-editor-toggle">
        <button 
          className="toggle-btn"
          onClick={() => setShowSchemaEditor(!showSchemaEditor)}
        >
          {showSchemaEditor ? '📋 Schema Editor ausblenden' : '✏️ Schema Editor öffnen'}
        </button>
      </div>

      {/* Schema Editor */}
      {showSchemaEditor && (
        <div className="schema-editor">
          <div className="schema-editor-header">
            <h3>Schema Editor</h3>
            <button className="add-table-btn" onClick={addTable}>
              ➕ Tabelle hinzufügen
            </button>
          </div>

          {customSchema.tables.map((table, tableIndex) => (
            <div key={tableIndex} className="table-editor">
              <div className="table-header">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTableName(tableIndex, e.target.value)}
                  className="table-name-input"
                  placeholder="Tabellen-Name"
                />
                <button 
                  className="remove-table-btn"
                  onClick={() => removeTable(tableIndex)}
                >
                  🗑️
                </button>
              </div>

              <div className="fields-list">
                {table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="field-row">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(tableIndex, fieldIndex, 'name', e.target.value)}
                      className="field-name-input"
                      placeholder="Feld-Name"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(tableIndex, fieldIndex, 'type', e.target.value)}
                      className="field-type-select"
                    >
                      {fieldTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <label className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={field.primary || false}
                        onChange={(e) => updateField(tableIndex, fieldIndex, 'primary', e.target.checked)}
                      />
                      Primary
                    </label>
                    <label className="field-checkbox">
                      <input
                        type="checkbox"
                        checked={field.unique || false}
                        onChange={(e) => updateField(tableIndex, fieldIndex, 'unique', e.target.checked)}
                      />
                      Unique
                    </label>
                    <button
                      className="remove-field-btn"
                      onClick={() => removeField(tableIndex, fieldIndex)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button 
                className="add-field-btn"
                onClick={() => addField(tableIndex)}
              >
                ➕ Feld hinzufügen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      <div className="generate-section">
        <button
          className="generate-db-btn"
          onClick={generateDatabase}
          disabled={isGenerating}
          style={{ background: currentDatabase?.color }}
        >
          {isGenerating ? '⚙️ Generiere...' : `🚀 ${currentDatabase?.name} Schema generieren`}
        </button>
      </div>

      {/* Generated Files */}
      {generatedFiles.length > 0 && (
        <div className="generated-files">
          <h3>✅ Generierte Dateien</h3>
          <div className="files-list">
            {generatedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-path">{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🐘</div>
          <h4>Supabase</h4>
          <p>PostgreSQL + RLS Policies + Real-time + Auto APIs</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔷</div>
          <h4>Prisma</h4>
          <p>Type-safe ORM + Migrations + Prisma Studio GUI</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔥</div>
          <h4>Firebase</h4>
          <p>Firestore + Auth + Security Rules + Cloud Functions</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🍃</div>
          <h4>MongoDB</h4>
          <p>NoSQL + Mongoose + Flexible Schema + Aggregation</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💾</div>
          <h4>SQLite</h4>
          <p>File-based + Zero Config + Embedded + Lightweight</p>
        </div>
      </div>
    </div>
  );
};

export default DatabasePanel;
