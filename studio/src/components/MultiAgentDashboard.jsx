/* --------------------------------------------------------
   VIBEAI – MULTI-AGENT DASHBOARD
   -------------------------------------------------------- */

import React, { useState, useEffect } from 'react';
import LivePreview from './LivePreview';
import './MultiAgentDashboard.css';

/**
 * Multi-Agent Dashboard
 * 
 * Complete AI → UI → Code → Preview → Build → Deploy Pipeline
 * 
 * Features:
 * - Natural language input
 * - Pipeline selection
 * - Real-time agent execution
 * - Live preview integration
 * - Build & download
 */
export default function MultiAgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('flutter');
  const [pipelineType, setPipelineType] = useState('preview_screen');
  const [projectPath, setProjectPath] = useState('');
  
  const [executing, setExecuting] = useState(false);
  const [currentPipeline, setCurrentPipeline] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  // Example prompts
  const examples = [
    'Create a login screen with email and password',
    'Build a profile page with avatar and bio',
    'Generate a product list with images and prices',
    'Create a settings screen with toggles',
    'Build a chat interface with messages'
  ];

  // Pipeline types
  const pipelines = [
    { value: 'create_ui', label: '🎨 UI Only', description: 'Generate UI structure' },
    { value: 'generate_screen', label: '💻 UI + Code', description: 'Generate UI & Code' },
    { value: 'preview_screen', label: '👁️ UI + Code + Preview', description: 'Full preview' },
    { value: 'build_app', label: '📦 Build App', description: 'Build APK/Web' },
    { value: 'full_cycle', label: '🚀 Full Cycle', description: 'Complete pipeline' }
  ];

  // Execute pipeline
  const executeAgents = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    setExecuting(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/agents/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipeline_type: pipelineType,
          params: {
            prompt,
            framework,
            project_path: projectPath || `/tmp/vibeai_${framework}_${Date.now()}`
          }
        })
      });

      const data = await res.json();

      if (data.success) {
        setCurrentPipeline(data);
        setResults(data.results || []);
      } else {
        setError(data.error || 'Pipeline execution failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  // Use smart routing
  const useSmartRouting = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    setExecuting(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/agents/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            framework,
            project_path: projectPath || `/tmp/vibeai_${framework}_${Date.now()}`
          }
        })
      });

      const data = await res.json();

      if (data.success) {
        setCurrentPipeline(data);
        setResults(data.results || []);
        setPipelineType(data.pipeline_type);
      } else {
        setError(data.error || 'Smart routing failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="multi-agent-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🤖 Multi-Agent App Builder</h1>
        <p>AI → UI → Code → Preview → Build → Deploy</p>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-group">
          <label>📝 What do you want to build?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your app or screen in natural language..."
            rows={4}
            className="prompt-input"
          />
        </div>

        <div className="input-row">
          <div className="input-group">
            <label>🎯 Framework</label>
            <select 
              value={framework} 
              onChange={(e) => setFramework(e.target.value)}
              className="select-input"
            >
              <option value="flutter">📱 Flutter</option>
              <option value="react">⚛️ React</option>
              <option value="vue">💚 Vue</option>
            </select>
          </div>

          <div className="input-group">
            <label>🔄 Pipeline</label>
            <select 
              value={pipelineType} 
              onChange={(e) => setPipelineType(e.target.value)}
              className="select-input"
            >
              {pipelines.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>📂 Project Path (optional)</label>
          <input
            type="text"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            placeholder="/path/to/project (auto-generated if empty)"
            className="text-input"
          />
        </div>

        {/* Example Prompts */}
        <div className="examples">
          <span className="examples-label">💡 Examples:</span>
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(ex)}
              className="example-btn"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={executeAgents}
            disabled={executing}
            className="btn-execute"
          >
            {executing ? '⏳ Executing...' : '▶️ Execute Pipeline'}
          </button>

          <button
            onClick={useSmartRouting}
            disabled={executing}
            className="btn-smart"
          >
            {executing ? '⏳ Routing...' : '🧠 Smart Routing'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="results-section">
          <h2>📊 Pipeline Results</h2>
          
          {currentPipeline && (
            <div className="pipeline-info">
              <div className="info-item">
                <span className="info-label">Pipeline:</span>
                <span className="info-value">{currentPipeline.pipeline_type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duration:</span>
                <span className="info-value">{currentPipeline.duration?.toFixed(2)}s</span>
              </div>
              <div className="info-item">
                <span className="info-label">Steps:</span>
                <span className="info-value">{results.length}</span>
              </div>
            </div>
          )}

          {/* Agent Results */}
          <div className="agent-results">
            {results.map((result, idx) => (
              <div key={idx} className={`agent-result ${result.success ? 'success' : 'failed'}`}>
                <div className="result-header">
                  <div className="result-title">
                    <span className="result-icon">
                      {result.agent === 'ui_agent' && '🎨'}
                      {result.agent === 'code_agent' && '💻'}
                      {result.agent === 'preview_agent' && '👁️'}
                      {result.agent === 'build_agent' && '📦'}
                      {result.agent === 'deploy_agent' && '🚀'}
                    </span>
                    <span className="result-agent">{result.agent}</span>
                  </div>
                  <span className={`result-status ${result.success ? 'success' : 'failed'}`}>
                    {result.success ? '✅ Success' : '❌ Failed'}
                  </span>
                </div>

                {result.result && (
                  <div className="result-details">
                    {/* UI Agent Result */}
                    {result.agent === 'ui_agent' && result.result.screen && (
                      <div>
                        <strong>Screen:</strong> {result.result.screen.name}
                        <br />
                        <strong>Components:</strong> {result.result.screen.components?.length || 0}
                      </div>
                    )}

                    {/* Code Agent Result */}
                    {result.agent === 'code_agent' && result.result.code && (
                      <div>
                        <strong>Language:</strong> {result.result.language}
                        <br />
                        <strong>Screen:</strong> {result.result.screen_name}
                        <br />
                        <details>
                          <summary>View Code</summary>
                          <pre className="code-preview">{result.result.code}</pre>
                        </details>
                      </div>
                    )}

                    {/* Preview Agent Result */}
                    {result.agent === 'preview_agent' && result.result.url && (
                      <div>
                        <strong>Server:</strong> {result.result.server_id}
                        <br />
                        <strong>URL:</strong> <a href={result.result.url} target="_blank" rel="noopener noreferrer">{result.result.url}</a>
                        <br />
                        <strong>Status:</strong> {result.result.status}
                      </div>
                    )}
                  </div>
                )}

                {result.error && (
                  <div className="result-error">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Preview (if preview agent executed) */}
      {results.some(r => r.agent === 'preview_agent' && r.success) && (
        <div className="preview-section">
          <h2>👁️ Live Preview</h2>
          <LivePreview
            projectPath={projectPath || results.find(r => r.agent === 'preview_agent')?.result?.project_path}
            framework={framework}
          />
        </div>
      )}
    </div>
  );
}
