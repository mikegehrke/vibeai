import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowPanel.css';

const FlowPanel = () => {
  const [framework, setFramework] = useState('react');
  const [flowType, setFlowType] = useState('auth');
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [flowData, setFlowData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const generateFlow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/flow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework: framework,
          flow_type: flowType
        })
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedFiles(data.files);
        setFlowData(data.flow_data);
        
        // Convert to React Flow format
        const flowNodes = data.flow_data.screens.map((screen, index) => ({
          id: screen.name,
          type: screen.requires_auth ? 'default' : 'input',
          data: { 
            label: (
              <div>
                <strong>{screen.name}</strong>
                <div style={{fontSize: '0.8em', color: '#666'}}>
                  {screen.route}
                </div>
                {screen.requires_auth && (
                  <div style={{fontSize: '0.7em', color: '#f59e0b'}}>🔒 Auth Required</div>
                )}
              </div>
            )
          },
          position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 150 },
          style: {
            background: screen.requires_auth ? '#fef3c7' : '#dbeafe',
            border: '2px solid',
            borderColor: screen.requires_auth ? '#f59e0b' : '#3b82f6',
            borderRadius: '8px',
            padding: '10px',
            width: 200
          }
        }));

        const flowEdges = data.flow_data.edges.map((edge, index) => ({
          id: `e${index}`,
          source: edge.from_screen,
          target: edge.to_screen,
          label: edge.action,
          type: edge.action === 'modal' ? 'step' : 'smoothstep',
          animated: edge.action === 'push',
          style: { stroke: edge.condition ? '#ec4899' : '#667eea' }
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);

        // Analyze flow
        analyzeFlow(data.flow_data);
      }
    } catch (error) {
      console.error('Flow generation failed:', error);
      alert('Failed to generate flow. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFlow = async (flow) => {
    try {
      const response = await fetch('/flow/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow_data: flow })
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Flow analysis failed:', error);
    }
  };

  const frameworks = [
    { id: 'flutter', name: 'Flutter', icon: '📱' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'nextjs', name: 'Next.js', icon: '▲' },
    { id: 'vue', name: 'Vue', icon: '💚' },
    { id: 'react_native', name: 'React Native', icon: '📱' }
  ];

  const flowTypes = [
    { id: 'auth', name: 'Authentication', desc: 'Login, Register, Forgot Password' },
    { id: 'ecommerce', name: 'E-Commerce', desc: 'Products, Cart, Checkout' },
    { id: 'onboarding', name: 'Onboarding', desc: 'Welcome, Tutorial Steps' },
    { id: 'social', name: 'Social Media', desc: 'Feed, Profile, Messages' },
    { id: 'dashboard', name: 'Dashboard', desc: 'Analytics, Settings, Users' }
  ];

  return (
    <div className="flow-panel">
      <div className="flow-header">
        <h1>🗺️ Navigation Flow Builder</h1>
        <p>AI-Generated Screen Flows mit Guards & Routes</p>
      </div>

      <div className="flow-controls">
        {/* Framework Selection */}
        <div className="flow-section">
          <h2>⚙️ Framework</h2>
          <div className="framework-grid-mini">
            {frameworks.map((fw) => (
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

        {/* Flow Type Selection */}
        <div className="flow-section">
          <h2>📊 Flow Type</h2>
          <div className="flow-type-grid">
            {flowTypes.map((type) => (
              <div
                key={type.id}
                className={`flow-type-card ${flowType === type.id ? 'active' : ''}`}
                onClick={() => setFlowType(type.id)}
              >
                <h3>{type.name}</h3>
                <p>{type.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          className="flow-generate-button"
          onClick={generateFlow}
          disabled={loading}
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Flow'}
        </button>
      </div>

      {/* Flow Visualization */}
      {nodes.length > 0 && (
        <div className="flow-visualization">
          <h2>🗺️ Flow Map</h2>
          <div className="flow-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="flow-section">
          <h2>🔍 Flow Analysis</h2>
          <div className="analysis-grid">
            <div className={`analysis-card ${analysis.valid ? 'valid' : 'invalid'}`}>
              <div className="analysis-status">
                {analysis.valid ? '✅ Valid' : '❌ Invalid'}
              </div>
              <div className="analysis-metrics">
                <div className="metric">
                  <span className="metric-value">{analysis.metrics.total_screens}</span>
                  <span className="metric-label">Screens</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{analysis.metrics.total_edges}</span>
                  <span className="metric-label">Routes</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{analysis.metrics.auth_screens}</span>
                  <span className="metric-label">Protected</span>
                </div>
              </div>
            </div>
          </div>

          {analysis.issues.length > 0 && (
            <div className="issues-list">
              <h3>❌ Issues</h3>
              {analysis.issues.map((issue, index) => (
                <div key={index} className="issue-item error">
                  {issue}
                </div>
              ))}
            </div>
          )}

          {analysis.warnings.length > 0 && (
            <div className="issues-list">
              <h3>⚠️ Warnings</h3>
              {analysis.warnings.map((warning, index) => (
                <div key={index} className="issue-item warning">
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generated Files */}
      {generatedFiles.length > 0 && (
        <div className="flow-section">
          <h2>📦 Generated Files</h2>
          <div className="generated-files">
            {generatedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-icon">📄</span>
                <span className="file-path">{file}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flow Data Details */}
      {flowData && (
        <div className="flow-section">
          <h2>📋 Flow Details</h2>
          <div className="flow-details">
            <div className="detail-card">
              <h3>Screens</h3>
              <div className="screen-list">
                {flowData.screens.map((screen, index) => (
                  <div key={index} className="screen-item">
                    <div className="screen-name">{screen.name}</div>
                    <div className="screen-route">{screen.route}</div>
                    {screen.requires_auth && <span className="auth-badge">🔒</span>}
                    {screen.params.length > 0 && (
                      <span className="params-badge">
                        Params: {screen.params.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-card">
              <h3>Navigation Edges</h3>
              <div className="edge-list">
                {flowData.edges.map((edge, index) => (
                  <div key={index} className="edge-item">
                    <span className="edge-from">{edge.from_screen}</span>
                    <span className="edge-arrow">→</span>
                    <span className="edge-to">{edge.to_screen}</span>
                    <span className="edge-action">{edge.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowPanel;
