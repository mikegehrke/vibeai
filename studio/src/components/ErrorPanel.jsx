import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ErrorPanel.css';

const ErrorPanel = () => {
  const [buildLog, setBuildLog] = useState('');
  const [framework, setFramework] = useState('react');
  const [errors, setErrors] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoFix, setAutoFix] = useState(false);
  const [stats, setStats] = useState(null);

  const frameworks = [
    { id: 'flutter', name: 'Flutter', icon: '📱' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'react_native', name: 'React Native', icon: '📱' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'typescript', name: 'TypeScript', icon: '📘' },
    { id: 'javascript', name: 'JavaScript', icon: '📙' },
    { id: 'vue', name: 'Vue', icon: '💚' },
    { id: 'fastapi', name: 'FastAPI', icon: '⚡' }
  ];

  const severityColors = {
    critical: '#ef4444',
    error: '#f59e0b',
    warning: '#eab308',
    info: '#3b82f6'
  };

  const loadExampleLog = async () => {
    try {
      const response = await fetch(`/error-fixer/example-logs/${framework}`);
      const data = await response.json();
      if (data.success) {
        setBuildLog(data.example_log);
      }
    } catch (error) {
      console.error('Failed to load example:', error);
    }
  };

  const analyzeBuildLog = async () => {
    if (!buildLog.trim()) {
      alert('⚠️ Please paste a build log');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/error-fixer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          build_log: buildLog,
          framework: framework,
          auto_fix: autoFix
        })
      });

      const data = await response.json();
      if (data.success) {
        setErrors(data.errors);
        setFixes(data.fixes);
        setStats({
          total: data.total_errors,
          fixable: data.fixable_errors,
          applied: data.applied_fixes,
          successRate: data.success_rate
        });

        if (autoFix && data.applied_fixes > 0) {
          alert(`✅ Applied ${data.applied_fixes} fixes automatically!`);
        } else {
          alert(`🔍 Found ${data.total_errors} errors, ${data.fixable_errors} fixable`);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('❌ Failed to analyze build log');
    } finally {
      setLoading(false);
    }
  };

  const applyFix = async (fix) => {
    try {
      const response = await fetch('/error-fixer/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: fix.file,
          line_number: fix.line,
          original_code: fix.original,
          fixed_code: fix.fixed,
          explanation: fix.explanation
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Fix applied to ${fix.file}`);
      } else {
        alert(`❌ Failed to apply fix: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to apply fix:', error);
      alert('❌ Failed to apply fix');
    }
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      error: '🟠',
      warning: '🟡',
      info: '🔵'
    };
    return icons[severity] || '⚪';
  };

  return (
    <div className="error-panel">
      <div className="error-header">
        <h1>🔧 AI Error Fixer</h1>
        <p>Automatische Fehleranalyse und -behebung aus Build-Logs</p>
      </div>

      <div className="error-controls">
        {/* Framework Selection */}
        <div className="control-section">
          <h2>⚙️ Framework</h2>
          <div className="framework-selector">
            {frameworks.map(fw => (
              <button
                key={fw.id}
                className={`framework-btn ${framework === fw.id ? 'active' : ''}`}
                onClick={() => setFramework(fw.id)}
              >
                <span>{fw.icon}</span> {fw.name}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-Fix Toggle */}
        <div className="control-section">
          <label className="auto-fix-toggle">
            <input
              type="checkbox"
              checked={autoFix}
              onChange={(e) => setAutoFix(e.target.checked)}
            />
            <span className="toggle-label">
              ⚡ Auto-Fix (Apply fixes automatically)
            </span>
          </label>
        </div>
      </div>

      {/* Build Log Input */}
      <div className="log-section">
        <div className="section-header">
          <h2>📋 Build Log</h2>
          <button className="example-btn" onClick={loadExampleLog}>
            📝 Load Example
          </button>
        </div>
        <textarea
          className="log-input"
          value={buildLog}
          onChange={(e) => setBuildLog(e.target.value)}
          placeholder={`Paste your ${framework} build log here...

Example errors:
- Module not found
- Syntax errors
- Type mismatches
- Undefined variables
- Missing dependencies`}
        />
      </div>

      {/* Action Button */}
      <div className="action-buttons">
        <button
          className="analyze-btn"
          onClick={analyzeBuildLog}
          disabled={loading || !buildLog.trim()}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze & Fix Errors'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-section">
          <h2>📊 Analysis Results</h2>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Errors</div>
            </div>
            <div className="stat-card fixable">
              <div className="stat-value">{stats.fixable}</div>
              <div className="stat-label">Fixable</div>
            </div>
            <div className="stat-card applied">
              <div className="stat-value">{stats.applied}</div>
              <div className="stat-label">Applied</div>
            </div>
            <div className="stat-card rate">
              <div className="stat-value">{(stats.successRate * 100).toFixed(0)}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Errors List */}
      {errors.length > 0 && (
        <div className="errors-section">
          <h2>🐛 Detected Errors ({errors.length})</h2>
          {errors.map((error, index) => (
            <div key={index} className="error-card">
              <div className="error-header-row">
                <div className="error-severity">
                  <span className="severity-icon">{getSeverityIcon(error.severity)}</span>
                  <span className="severity-label">{error.severity}</span>
                </div>
                <div className="error-type-badge">{error.type}</div>
              </div>
              
              <div className="error-message">{error.message}</div>
              
              {error.file && (
                <div className="error-location">
                  <span className="location-icon">📁</span>
                  {error.file}
                  {error.line && `:${error.line}`}
                  {error.column && `:${error.column}`}
                </div>
              )}
              
              {error.suggestion && (
                <div className="error-suggestion">
                  <span className="suggestion-icon">💡</span>
                  {error.suggestion}
                </div>
              )}
              
              {error.stack_trace && error.stack_trace.length > 0 && (
                <details className="stack-trace">
                  <summary>Stack Trace ({error.stack_trace.length} frames)</summary>
                  <pre>{error.stack_trace.join('\n')}</pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fixes List */}
      {fixes.length > 0 && (
        <div className="fixes-section">
          <h2>✅ Generated Fixes ({fixes.length})</h2>
          {fixes.map((fix, index) => (
            <div key={index} className="fix-card">
              <div className="fix-header">
                <h3>Fix #{index + 1}</h3>
                <div className="fix-confidence">
                  <span className="confidence-label">Confidence:</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${fix.confidence * 100}%` }}
                    />
                  </div>
                  <span className="confidence-value">{(fix.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="fix-explanation">{fix.explanation}</div>
              
              <div className="fix-location">
                📁 {fix.file}:{fix.line}
              </div>
              
              <div className="fix-code">
                {fix.original && (
                  <div className="code-section">
                    <div className="code-label">❌ Original:</div>
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, fontSize: '0.85rem' }}
                    >
                      {fix.original}
                    </SyntaxHighlighter>
                  </div>
                )}
                
                <div className="code-section">
                  <div className="code-label">✅ Fixed:</div>
                  <SyntaxHighlighter
                    language="javascript"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, fontSize: '0.85rem' }}
                  >
                    {fix.fixed}
                  </SyntaxHighlighter>
                </div>
              </div>
              
              {!autoFix && (
                <button 
                  className="apply-fix-btn"
                  onClick={() => applyFix(fix)}
                >
                  ⚡ Apply This Fix
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!buildLog && !errors.length && (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>Ready to Fix Errors</h3>
          <p>Paste your build log or load an example to get started</p>
          <ul className="feature-list">
            <li>✅ Parses Flutter, React, Python, TypeScript errors</li>
            <li>✅ Detects import errors, syntax errors, type mismatches</li>
            <li>✅ Generates intelligent fixes automatically</li>
            <li>✅ Apply fixes with one click or auto-fix mode</li>
            <li>✅ Shows confidence scores for each fix</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorPanel;
