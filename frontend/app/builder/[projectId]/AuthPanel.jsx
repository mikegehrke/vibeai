// -------------------------------------------------------------
// VIBEAI – AUTH GENERATOR PANEL
// -------------------------------------------------------------
"use client";

import { useState } from "react";
import "./AuthPanel.css";

export default function AuthPanel({ projectId }) {
  const [backendFramework, setBackendFramework] = useState("fastapi");
  const [frontendFramework, setFrontendFramework] = useState("flutter");
  const [jwtSecret, setJwtSecret] = useState("VIBEAI_SECRET_KEY");
  const [sessionTimeout, setSessionTimeout] = useState(86400);
  const [style, setStyle] = useState("material");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const backendFrameworks = ["fastapi", "nodejs", "django"];
  const frontendFrameworks = ["flutter", "react", "nextjs", "vue"];
  const styles = ["material", "cupertino", "custom"];

  async function generateBackend() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/auth-gen/generate/backend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: backendFramework,
          project_id: projectId,
          options: {
            jwt_secret: jwtSecret,
            session_timeout: sessionTimeout
          }
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Fehler bei Backend-Generierung");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateFrontend() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/auth-gen/generate/frontend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: frontendFramework,
          project_id: projectId,
          style: style
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Fehler bei Frontend-Generierung");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateFull() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `/auth-gen/generate/full?backend_framework=${backendFramework}&frontend_framework=${frontendFramework}&project_id=${projectId}`,
        { method: "POST" }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Fehler bei Full-Stack-Generierung");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-header">
        <h2>🔐 Auth Generator</h2>
        <p>Erstelle komplette Authentication Systeme (Login, Signup, JWT)</p>
      </div>

      <div className="auth-config">
        {/* Backend Framework */}
        <div className="config-section">
          <h3>Backend Framework</h3>
          <div className="framework-selector">
            {backendFrameworks.map((fw) => (
              <button
                key={fw}
                className={backendFramework === fw ? "active" : ""}
                onClick={() => setBackendFramework(fw)}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Frontend Framework */}
        <div className="config-section">
          <h3>Frontend Framework</h3>
          <div className="framework-selector">
            {frontendFrameworks.map((fw) => (
              <button
                key={fw}
                className={frontendFramework === fw ? "active" : ""}
                onClick={() => setFrontendFramework(fw)}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="config-section">
          <h3>UI Style</h3>
          <div className="style-selector">
            {styles.map((s) => (
              <button
                key={s}
                className={style === s ? "active" : ""}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* JWT Options */}
        <div className="config-section">
          <h3>JWT Konfiguration</h3>
          <div className="form-group">
            <label>JWT Secret:</label>
            <input
              type="text"
              value={jwtSecret}
              onChange={(e) => setJwtSecret(e.target.value)}
              placeholder="VIBEAI_SECRET_KEY"
            />
          </div>
          <div className="form-group">
            <label>Session Timeout (Sekunden):</label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
              placeholder="86400"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="auth-actions">
        <button
          className="btn btn-backend"
          onClick={generateBackend}
          disabled={loading}
        >
          {loading ? "Generiere..." : "🔧 Backend generieren"}
        </button>
        
        <button
          className="btn btn-frontend"
          onClick={generateFrontend}
          disabled={loading}
        >
          {loading ? "Generiere..." : "🎨 Frontend generieren"}
        </button>
        
        <button
          className="btn btn-full"
          onClick={generateFull}
          disabled={loading}
        >
          {loading ? "Generiere..." : "⚡ Full-Stack generieren"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="auth-error">
          <strong>❌ Fehler:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="auth-result">
          <h3>✅ Erfolgreich generiert!</h3>
          
          {result.backend && (
            <div className="result-section">
              <h4>Backend ({result.backend.framework})</h4>
              <p><strong>Dateien:</strong> {result.backend.files?.length || 0}</p>
              {result.backend.endpoints && (
                <div className="endpoints-list">
                  <strong>Endpoints:</strong>
                  <ul>
                    {result.backend.endpoints.map((ep, idx) => (
                      <li key={idx}>{ep}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.backend.features && (
                <div className="features-list">
                  <strong>Features:</strong>
                  <ul>
                    {result.backend.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.frontend && (
            <div className="result-section">
              <h4>Frontend ({result.frontend.framework})</h4>
              <p><strong>Dateien:</strong> {result.frontend.files?.length || 0}</p>
              {result.frontend.screens && (
                <div className="screens-list">
                  <strong>Screens:</strong>
                  <ul>
                    {result.frontend.screens.map((screen, idx) => (
                      <li key={idx}>{screen}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.framework && !result.backend && !result.frontend && (
            <div className="result-section">
              <h4>{result.framework}</h4>
              <p><strong>Dateien:</strong> {result.files?.length || 0}</p>
              {result.endpoints && (
                <div className="endpoints-list">
                  <strong>Endpoints:</strong>
                  <ul>
                    {result.endpoints.map((ep, idx) => (
                      <li key={idx}>{ep}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.screens && (
                <div className="screens-list">
                  <strong>Screens:</strong>
                  <ul>
                    {result.screens.map((screen, idx) => (
                      <li key={idx}>{screen}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.total_files && (
            <div className="total-files">
              <strong>Gesamt:</strong> {result.total_files} Dateien erstellt
            </div>
          )}

          {result.files && (
            <div className="files-list">
              <strong>Erstellte Dateien:</strong>
              <ul>
                {result.files.slice(0, 10).map((file, idx) => (
                  <li key={idx} title={file}>
                    {file.split('/').pop()}
                  </li>
                ))}
                {result.files.length > 10 && (
                  <li>... und {result.files.length - 10} weitere</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feature Overview */}
      <div className="auth-features">
        <h3>🚀 Generierte Features</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <strong>Login Screen</strong>
            <p>Email + Password</p>
          </div>
          <div className="feature-card">
            <strong>Signup Screen</strong>
            <p>User Registration</p>
          </div>
          <div className="feature-card">
            <strong>Forgot Password</strong>
            <p>Password Reset Flow</p>
          </div>
          <div className="feature-card">
            <strong>JWT Tokens</strong>
            <p>Secure Authentication</p>
          </div>
          <div className="feature-card">
            <strong>API Controller</strong>
            <p>/auth/* Endpoints</p>
          </div>
          <div className="feature-card">
            <strong>Session Handling</strong>
            <p>Token Verification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
