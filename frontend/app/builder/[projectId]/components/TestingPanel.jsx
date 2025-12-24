'use client';

import { useState } from 'react';
import { TestTube, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function TestingPanel({ projectId, files }) {
  const [tests, setTests] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const discoverTests = () => {
    // Find test files
    const testFiles = files.filter(f => 
      f.name.includes('test') || 
      f.name.includes('spec') ||
      f.path.includes('__tests__')
    );

    const discoveredTests = [];
    testFiles.forEach(file => {
      if (!file.content) return;
      
      const lines = file.content.split('\n');
      lines.forEach((line, index) => {
        // Common test patterns
        if (line.match(/(it|test|describe|context)\(/)) {
          const match = line.match(/(it|test|describe|context)\(['"]([^'"]+)['"]/);
          if (match) {
            discoveredTests.push({
              file: file.path,
              name: match[2],
              type: match[1],
              line: index + 1
            });
          }
        }
      });
    });

    setTests(discoveredTests);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:8005/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          command: 'npm test'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Parse test results (simplified)
        const passed = (data.output || '').match(/(\d+) passing/g);
        const failed = (data.output || '').match(/(\d+) failing/g);
        
        setResults({
          passed: passed ? parseInt(passed[0]) : 0,
          failed: failed ? parseInt(failed[0]) : 0,
          output: data.output || ''
        });
      }
    } catch (error) {
      setResults({
        passed: 0,
        failed: 1,
        output: `Error: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <TestTube size={16} color="#858585" />
        <span style={{ fontSize: '12px', fontWeight: '500' }}>Testing</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            onClick={discoverTests}
            style={{
              padding: '4px 8px',
              background: '#2d2d30',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            Discover
          </button>
          <button
            onClick={runTests}
            disabled={isRunning}
            style={{
              padding: '4px 8px',
              background: isRunning ? '#3c3c3c' : '#007acc',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '10px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Play size={12} />
            Run All
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {results && (
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #3c3c3c',
          display: 'flex',
          gap: '16px',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ec9b0' }}>
            <CheckCircle2 size={14} />
            <span>{results.passed} passed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f48771' }}>
            <XCircle size={14} />
            <span>{results.failed} failed</span>
          </div>
        </div>
      )}

      {/* Test List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px'
      }}>
        {tests.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#858585',
            fontSize: '12px'
          }}>
            <TestTube size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>No tests discovered</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              Click "Discover" to find tests
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '8px',
              fontSize: '11px',
              color: '#858585',
              borderBottom: '1px solid #3c3c3c',
              marginBottom: '8px'
            }}>
              {tests.length} tests found
            </div>
            {tests.map((test, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #2d2d30',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <TestTube size={12} color="#858585" />
                <span style={{ flex: 1 }}>{test.name}</span>
                <span style={{ color: '#858585', fontSize: '10px' }}>
                  {test.file.split('/').pop()}:{test.line}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Output */}
      {results && (
        <div style={{
          height: '150px',
          overflow: 'auto',
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '10px',
          background: '#0d1117',
          color: '#c9d1d9',
          borderTop: '1px solid #3c3c3c'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{results.output}</pre>
        </div>
      )}
    </div>
  );
}













