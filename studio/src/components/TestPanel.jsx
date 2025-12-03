import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './TestPanel.css';

const TestPanel = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [framework, setFramework] = useState('python');
  const [testTypes, setTestTypes] = useState(['unit']);
  const [generatedTests, setGeneratedTests] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [targetCoverage, setTargetCoverage] = useState(80);

  const frameworks = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'flutter', name: 'Flutter', icon: '📱' },
    { id: 'react_native', name: 'React Native', icon: '📱' },
    { id: 'vue', name: 'Vue', icon: '💚' }
  ];

  const testTypeOptions = [
    { id: 'unit', name: 'Unit Tests', icon: '🧪' },
    { id: 'integration', name: 'Integration', icon: '🔗' },
    { id: 'widget', name: 'Widget Tests', icon: '🎨', frameworks: ['flutter'] },
    { id: 'component', name: 'Component', icon: '🧩', frameworks: ['react', 'vue', 'react_native'] },
    { id: 'api', name: 'API Tests', icon: '🌐' }
  ];

  const analyzeCode = async () => {
    if (!sourceCode.trim()) {
      alert('⚠️ Please enter source code to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/test-gen/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sourceCode,
          framework: framework
        })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('❌ Code analysis failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateTests = async () => {
    if (!sourceCode.trim()) {
      alert('⚠️ Please enter source code to test');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/test-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: sourceCode,
          framework: framework,
          test_types: testTypes,
          target_coverage: targetCoverage,
          write_files: false // Only generate, don't write
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedTests(data.tests);
        alert(`✅ Generated ${data.test_count} tests!`);
      }
    } catch (error) {
      console.error('Test generation failed:', error);
      alert('❌ Test generation failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTests = () => {
    generatedTests.forEach(test => {
      const blob = new Blob([test.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = test.test_name;
      a.click();
      URL.revokeObjectURL(url);
    });
    alert(`✅ Downloaded ${generatedTests.length} test files!`);
  };

  const toggleTestType = (typeId) => {
    if (testTypes.includes(typeId)) {
      setTestTypes(testTypes.filter(t => t !== typeId));
    } else {
      setTestTypes([...testTypes, typeId]);
    }
  };

  const getLanguage = () => {
    const langMap = {
      python: 'python',
      react: 'jsx',
      react_native: 'jsx',
      flutter: 'dart',
      vue: 'javascript'
    };
    return langMap[framework] || 'javascript';
  };

  const exampleCode = {
    python: `def calculate_total(items, tax_rate=0.1):
    """Calculate total price with tax"""
    subtotal = sum(item['price'] for item in items)
    tax = subtotal * tax_rate
    return subtotal + tax

class UserService:
    def __init__(self, db):
        self.db = db
    
    async def get_user(self, user_id):
        return await self.db.fetch_one("SELECT * FROM users WHERE id = ?", user_id)`,
    
    react: `function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return response.json();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}`,
    
    flutter: `class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  Future<void> _handleLogin() async {
    final email = _emailController.text;
    final password = _passwordController.text;
    
    final response = await http.post(
      Uri.parse('/api/login'),
      body: {'email': email, 'password': password}
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TextField(controller: _emailController),
          TextField(controller: _passwordController, obscureText: true),
          ElevatedButton(onPressed: _handleLogin, child: Text('Login'))
        ]
      )
    );
  }
}`
  };

  const loadExample = () => {
    setSourceCode(exampleCode[framework] || exampleCode.python);
  };

  return (
    <div className="test-panel">
      <div className="test-header">
        <h1>🧪 AI Test Generator</h1>
        <p>Automatische Test-Generierung für alle Frameworks</p>
      </div>

      <div className="test-controls">
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

        {/* Test Type Selection */}
        <div className="control-section">
          <h2>🎯 Test Types</h2>
          <div className="test-type-selector">
            {testTypeOptions
              .filter(type => !type.frameworks || type.frameworks.includes(framework))
              .map(type => (
                <button
                  key={type.id}
                  className={`test-type-btn ${testTypes.includes(type.id) ? 'active' : ''}`}
                  onClick={() => toggleTestType(type.id)}
                >
                  <span>{type.icon}</span> {type.name}
                </button>
              ))}
          </div>
        </div>

        {/* Coverage Target */}
        <div className="control-section">
          <h2>📊 Target Coverage: {targetCoverage}%</h2>
          <input
            type="range"
            min="50"
            max="100"
            value={targetCoverage}
            onChange={(e) => setTargetCoverage(parseInt(e.target.value))}
            className="coverage-slider"
          />
        </div>
      </div>

      {/* Code Input */}
      <div className="code-section">
        <div className="section-header">
          <h2>📝 Source Code</h2>
          <button className="example-btn" onClick={loadExample}>
            📋 Load Example
          </button>
        </div>
        <textarea
          className="code-input"
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder={`Paste your ${framework} code here...`}
        />
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="analyze-btn"
          onClick={analyzeCode}
          disabled={loading || !sourceCode.trim()}
        >
          🔍 Analyze Code
        </button>
        <button
          className="generate-btn"
          onClick={generateTests}
          disabled={loading || !sourceCode.trim() || testTypes.length === 0}
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Tests'}
        </button>
        {generatedTests.length > 0 && (
          <button className="download-btn" onClick={downloadTests}>
            💾 Download All Tests
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-section">
          <h2>🔍 Code Analysis</h2>
          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="card-value">{analysis.complexity}</div>
              <div className="card-label">Complexity</div>
            </div>
            <div className="analysis-card">
              <div className="card-value">{analysis.testability_score?.toFixed(0) || 0}</div>
              <div className="card-label">Testability Score</div>
            </div>
            {analysis.functions && (
              <div className="analysis-card">
                <div className="card-value">{analysis.functions.length}</div>
                <div className="card-label">Functions</div>
              </div>
            )}
            {analysis.components && (
              <div className="analysis-card">
                <div className="card-value">{analysis.components.length}</div>
                <div className="card-label">Components</div>
              </div>
            )}
            {analysis.widgets && (
              <div className="analysis-card">
                <div className="card-value">{analysis.widgets.length}</div>
                <div className="card-label">Widgets</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Tests */}
      {generatedTests.length > 0 && (
        <div className="tests-section">
          <h2>✅ Generated Tests ({generatedTests.length})</h2>
          {generatedTests.map((test, index) => (
            <div key={index} className="test-card">
              <div className="test-card-header">
                <h3>{test.test_name}</h3>
                <div className="test-badges">
                  <span className="test-type-badge">{test.test_type}</span>
                  <span className="test-framework-badge">{framework}</span>
                </div>
              </div>
              <div className="test-path">{test.file_path}</div>
              <div className="test-code-container">
                <SyntaxHighlighter
                  language={getLanguage()}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  {test.code}
                </SyntaxHighlighter>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!sourceCode && !generatedTests.length && (
        <div className="empty-state">
          <div className="empty-icon">🧪</div>
          <h3>Ready to Generate Tests</h3>
          <p>Paste your code or load an example to get started</p>
          <ul className="feature-list">
            <li>✅ Unit Tests for functions & methods</li>
            <li>✅ Component/Widget Tests with interactions</li>
            <li>✅ Integration Tests for APIs</li>
            <li>✅ Mock Services automatically generated</li>
            <li>✅ Files ready to download</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestPanel;
