// -------------------------------------------------------------
// VIBEAI – API CONNECTOR GENERATOR PANEL
// -------------------------------------------------------------
"use client";

import { useState } from "react";
import "./APIPanel.css";

export default function APIPanel({ projectId }) {
  const [framework, setFramework] = useState("flutter");
  const [protocol, setProtocol] = useState("rest");
  const [baseUrl, setBaseUrl] = useState("https://api.example.com");
  const [authType, setAuthType] = useState("bearer");
  const [timeout, setTimeout] = useState(30000);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [example, setExample] = useState(null);

  const frameworks = ["flutter", "react", "nextjs", "vue", "nodejs"];
  const protocols = ["rest", "graphql", "websocket"];
  const authTypes = ["bearer", "basic", "none"];

  async function generateAPI() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api-gen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework,
          protocol,
          project_id: projectId,
          options: {
            base_url: baseUrl,
            auth_type: authType,
            timeout: timeout
          }
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Fehler bei API-Generierung");
      }
      
      setResult(data);
      
      // Lade Beispiel-Code
      loadExample();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadExample() {
    try {
      const res = await fetch(`/api-gen/examples/${protocol}/${framework}`);
      const data = await res.json();
      setExample(data.example);
    } catch (err) {
      console.error("Fehler beim Laden des Beispiels:", err);
    }
  }

  async function validateConfig() {
    try {
      const res = await fetch(
        `/api-gen/validate?base_url=${encodeURIComponent(baseUrl)}&protocol=${protocol}&auth_required=${authType !== 'none'}`,
        { method: "POST" }
      );
      const data = await res.json();
      
      if (!data.valid) {
        setError(data.error);
      } else if (data.warnings && data.warnings.length > 0) {
        alert("Warnungen:\n" + data.warnings.join("\n"));
      } else {
        alert("✅ Konfiguration ist gültig!");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="api-panel">
      <div className="api-header">
        <h2>🔌 API Connector Generator</h2>
        <p>Erstelle REST, GraphQL oder WebSocket Clients</p>
      </div>

      <div className="api-config">
        {/* Framework Auswahl */}
        <div className="config-section">
          <h3>Framework</h3>
          <div className="framework-selector">
            {frameworks.map((fw) => (
              <button
                key={fw}
                className={framework === fw ? "active" : ""}
                onClick={() => setFramework(fw)}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Protokoll Auswahl */}
        <div className="config-section">
          <h3>Protokoll</h3>
          <div className="protocol-selector">
            {protocols.map((proto) => (
              <button
                key={proto}
                className={protocol === proto ? "active" : ""}
                onClick={() => setProtocol(proto)}
              >
                {proto.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* API Konfiguration */}
        <div className="config-section">
          <h3>API Konfiguration</h3>
          
          <div className="form-group">
            <label>Base URL:</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>

          {protocol === "rest" && (
            <>
              <div className="form-group">
                <label>Auth Type:</label>
                <select value={authType} onChange={(e) => setAuthType(e.target.value)}>
                  {authTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Timeout (ms):</label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value))}
                  placeholder="30000"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="api-actions">
        <button
          className="btn btn-validate"
          onClick={validateConfig}
          disabled={loading}
        >
          🔍 Validieren
        </button>
        
        <button
          className="btn btn-generate"
          onClick={generateAPI}
          disabled={loading}
        >
          {loading ? "Generiere..." : "⚡ API Client generieren"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="api-error">
          <strong>❌ Fehler:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="api-result">
          <h3>✅ API Client erstellt!</h3>
          
          <div className="result-info">
            <div className="info-item">
              <strong>Framework:</strong> {result.framework}
            </div>
            <div className="info-item">
              <strong>Protokoll:</strong> {result.protocol}
            </div>
            <div className="info-item">
              <strong>Dateien:</strong> {result.files?.length || 0}
            </div>
          </div>

          {result.methods && (
            <div className="methods-list">
              <strong>Verfügbare Methoden:</strong>
              <div className="method-tags">
                {result.methods.map((method, idx) => (
                  <span key={idx} className="method-tag">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.features && (
            <div className="features-list">
              <strong>Features:</strong>
              <ul>
                {result.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {result.files && (
            <div className="files-list">
              <strong>Erstellte Dateien:</strong>
              <ul>
                {result.files.map((file, idx) => (
                  <li key={idx} title={file}>
                    {file.split('/').pop()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Code Example */}
      {example && (
        <div className="api-example">
          <h3>📝 Code Beispiel</h3>
          <pre>
            <code>{example}</code>
          </pre>
        </div>
      )}

      {/* Feature Cards */}
      <div className="api-features">
        <h3>🚀 Unterstützte Protokolle</h3>
        <div className="feature-grid">
          <div className="feature-card rest">
            <div className="card-icon">🌐</div>
            <strong>REST</strong>
            <p>GET, POST, PUT, DELETE</p>
            <small>HTTP-basierte APIs</small>
          </div>
          
          <div className="feature-card graphql">
            <div className="card-icon">📊</div>
            <strong>GraphQL</strong>
            <p>Query, Mutation</p>
            <small>Flexible Datenabfragen</small>
          </div>
          
          <div className="feature-card websocket">
            <div className="card-icon">⚡</div>
            <strong>WebSocket</strong>
            <p>Real-time Communication</p>
            <small>Bidirektionale Streams</small>
          </div>
        </div>
      </div>

      {/* Framework Support */}
      <div className="framework-support">
        <h3>📱 Framework Support</h3>
        <div className="support-grid">
          <div className="support-item">
            <span className="icon">📱</span>
            <strong>Flutter</strong>
            <small>Dart, HTTP, WebSocket</small>
          </div>
          <div className="support-item">
            <span className="icon">⚛️</span>
            <strong>React</strong>
            <small>Fetch, Apollo, Hooks</small>
          </div>
          <div className="support-item">
            <span className="icon">▲</span>
            <strong>Next.js</strong>
            <small>SSR, API Routes</small>
          </div>
          <div className="support-item">
            <span className="icon">💚</span>
            <strong>Vue</strong>
            <small>Axios, Composition API</small>
          </div>
          <div className="support-item">
            <span className="icon">🟢</span>
            <strong>Node.js</strong>
            <small>Express, Axios</small>
          </div>
        </div>
      </div>
    </div>
  );
}
