import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './FlowchartPanel.css';

const FlowchartPanel = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [autoFixMode, setAutoFixMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('mermaid');
  const [exportedContent, setExportedContent] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds)),
    [setEdges]
  );

  // Load template
  const loadTemplate = async (templateName) => {
    try {
      const response = await fetch('/flowchart/templates');
      const data = await response.json();
      
      if (data.success && data.templates[templateName]) {
        const template = data.templates[templateName];
        setSelectedTemplate(templateName);
        
        // Convert screens to nodes
        const templateNodes = template.screens.map((screen, index) => ({
          id: screen.name,
          type: 'default',
          data: {
            label: (
              <div className="flowchart-node">
                <div className="node-header">
                  <strong>{screen.name}</strong>
                  {screen.is_entry_point && <span className="entry-badge">Entry</span>}
                </div>
                <div className="node-route">{screen.route}</div>
                <div className="node-auth">
                  {screen.auth_level === 'auth_required' && '🔒 Auth Required'}
                  {screen.auth_level === 'admin_only' && '🔐 Admin Only'}
                  {screen.auth_level === 'public' && '🌐 Public'}
                </div>
              </div>
            )
          },
          position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 200 },
          style: {
            background: getNodeColor(screen.auth_level),
            border: '2px solid',
            borderColor: screen.is_entry_point ? '#10b981' : '#667eea',
            borderRadius: '12px',
            padding: '15px',
            width: 250
          }
        }));

        // Convert edges
        const templateEdges = template.edges.map((edge, index) => ({
          id: `e${index}`,
          source: edge.from_screen,
          target: edge.to_screen,
          type: 'smoothstep',
          animated: edge.navigation_type === 'push',
          label: edge.label || edge.navigation_type,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: {
            stroke: edge.requires_auth ? '#f59e0b' : '#667eea',
            strokeWidth: 2
          }
        }));

        setNodes(templateNodes);
        setEdges(templateEdges);
        
        // Auto-analyze
        analyzeFlow(template.screens, template.edges);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  // Analyze flow
  const analyzeFlow = async (screens, flowEdges) => {
    try {
      const response = await fetch('/flowchart/analyze-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screens, edges: flowEdges })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Flow analysis failed:', error);
    }
  };

  // Apply auto-fix
  const applyAutoFix = async (issue) => {
    try {
      const response = await fetch('/flowchart/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Fixed: ${data.message}`);
        
        // Reload analysis
        if (selectedTemplate) {
          loadTemplate(selectedTemplate);
        }
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
      alert('❌ Auto-fix failed. Check console for details.');
    }
  };

  // Export flowchart
  const exportFlowchart = async () => {
    try {
      // Convert nodes back to screens
      const screens = nodes.map(node => ({
        name: node.id,
        route: `/${node.id.toLowerCase()}`,
        screen_type: 'fullscreen',
        auth_level: 'public',
        params: [],
        tabs: [],
        has_bottom_nav: false,
        has_drawer: false,
        is_entry_point: false,
        color: node.style?.background || '#3b82f6'
      }));

      // Convert edges
      const flowEdges = edges.map(edge => ({
        from_screen: edge.source,
        to_screen: edge.target,
        navigation_type: 'push',
        condition: null,
        requires_auth: false,
        params_passed: [],
        label: edge.label || '',
        color: edge.style?.stroke || '#667eea'
      }));

      const response = await fetch('/flowchart/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screens, edges: flowEdges, format: exportFormat })
      });

      const data = await response.json();
      if (data.success) {
        setExportedContent(data.content);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Helper: Get node color based on auth level
  const getNodeColor = (authLevel) => {
    switch (authLevel) {
      case 'auth_required': return '#fef3c7';
      case 'admin_only': return '#fee2e2';
      case 'auth_optional': return '#ede9fe';
      default: return '#dbeafe';
    }
  };

  return (
    <div className="flowchart-panel">
      <div className="flowchart-header">
        <h1>🗺️ AI Screen Flow Charts</h1>
        <p>Intelligent Flow Analysis with Auto-Fix</p>
      </div>

      <div className="flowchart-controls">
        {/* Template Selection */}
        <div className="control-section">
          <h2>📋 Templates</h2>
          <div className="template-grid">
            <button
              className={`template-btn ${selectedTemplate === 'simple_app' ? 'active' : ''}`}
              onClick={() => loadTemplate('simple_app')}
            >
              <span>📱</span> Simple App
            </button>
            <button
              className={`template-btn ${selectedTemplate === 'ecommerce' ? 'active' : ''}`}
              onClick={() => loadTemplate('ecommerce')}
            >
              <span>🛒</span> E-Commerce
            </button>
          </div>
        </div>

        {/* Export Controls */}
        {nodes.length > 0 && (
          <div className="control-section">
            <h2>📤 Export</h2>
            <div className="export-controls">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-select"
              >
                <option value="mermaid">Mermaid</option>
                <option value="json">JSON</option>
              </select>
              <button className="export-btn" onClick={exportFlowchart}>
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flow Canvas */}
      {nodes.length > 0 && (
        <div className="flowchart-canvas-container">
          <h2>🎨 Flow Map</h2>
          <div className="flowchart-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Background color="#1e293b" gap={16} />
              <Controls />
              <MiniMap
                nodeColor={(node) => node.style?.background || '#3b82f6'}
                maskColor="rgba(0, 0, 0, 0.5)"
              />
            </ReactFlow>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-section">
          <h2>🔍 Flow Analysis</h2>
          
          {/* Metrics */}
          <div className="analysis-metrics">
            <div className="metric-card">
              <div className="metric-value">{analysis.metrics.total_screens}</div>
              <div className="metric-label">Screens</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analysis.metrics.total_edges}</div>
              <div className="metric-label">Routes</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analysis.metrics.auth_required_screens}</div>
              <div className="metric-label">Protected</div>
            </div>
            <div className="metric-card error">
              <div className="metric-value">{analysis.metrics.errors}</div>
              <div className="metric-label">Errors</div>
            </div>
            <div className="metric-card warning">
              <div className="metric-value">{analysis.metrics.warnings}</div>
              <div className="metric-label">Warnings</div>
            </div>
            <div className="metric-card success">
              <div className="metric-value">{analysis.metrics.auto_fixable_issues}</div>
              <div className="metric-label">Auto-Fixable</div>
            </div>
          </div>

          {/* Issues */}
          {analysis.issues.length > 0 && (
            <div className="issues-container">
              <h3>⚠️ Issues & Suggestions</h3>
              {analysis.issues.map((issue, index) => (
                <div key={index} className={`issue-card ${issue.severity}`}>
                  <div className="issue-header">
                    <span className="issue-severity">
                      {issue.severity === 'error' && '❌'}
                      {issue.severity === 'warning' && '⚠️'}
                      {issue.severity === 'info' && 'ℹ️'}
                    </span>
                    <span className="issue-message">{issue.message}</span>
                  </div>
                  
                  {issue.suggestion && (
                    <div className="issue-suggestion">
                      💡 {issue.suggestion}
                    </div>
                  )}
                  
                  {issue.auto_fixable && (
                    <button
                      className="auto-fix-btn"
                      onClick={() => applyAutoFix(issue)}
                    >
                      🔧 Auto-Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="suggestions-container">
              <h3>💡 AI Suggestions</h3>
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exported Content */}
      {exportedContent && (
        <div className="export-section">
          <h2>📄 Exported Content</h2>
          <pre className="export-content">{exportedContent}</pre>
          <button
            className="copy-btn"
            onClick={() => {
              navigator.clipboard.writeText(exportedContent);
              alert('✅ Copied to clipboard!');
            }}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="legend-section">
          <h3>🎨 Legend</h3>
          <div className="legend-grid">
            <div className="legend-item">
              <div className="legend-color" style={{background: '#dbeafe'}}></div>
              <span>Public Screen</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{background: '#fef3c7'}}></div>
              <span>Auth Required</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{background: '#fee2e2'}}></div>
              <span>Admin Only</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{background: '#ede9fe'}}></div>
              <span>Auth Optional</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowchartPanel;
