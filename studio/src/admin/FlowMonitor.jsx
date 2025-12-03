// VibeAI - Admin Flow Monitor
// Real-time monitoring of all user flows

import { useState, useEffect } from 'react';
import './FlowMonitor.css';

export default function FlowMonitor() {
    const [activeFlows, setActiveFlows] = useState([]);
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, failed: 0 });

    // Load active flows
    useEffect(() => {
        loadActiveFlows();
        const interval = setInterval(loadActiveFlows, 3000); // Refresh every 3s
        return () => clearInterval(interval);
    }, []);

    const loadActiveFlows = async () => {
        try {
            const response = await fetch('http://localhost:8000/flow/active');
            const data = await response.json();
            
            setActiveFlows(data.active_flows || []);
            updateStats(data.active_flows || []);
        } catch (error) {
            console.error('Failed to load flows:', error);
        }
    };

    const updateStats = (flows) => {
        const active = flows.filter(f => f.status === 'starting' || f.status === 'running').length;
        const completed = flows.filter(f => f.status === 'completed').length;
        const failed = flows.filter(f => f.status === 'failed').length;
        
        setStats({
            total: flows.length,
            active,
            completed,
            failed
        });
    };

    const viewFlowDetails = async (flowId) => {
        try {
            const response = await fetch(`http://localhost:8000/flow/${flowId}`);
            const data = await response.json();
            setSelectedFlow(data);
        } catch (error) {
            console.error('Failed to load flow details:', error);
        }
    };

    const getStepStatus = (flow, step) => {
        if (!flow.results || !flow.results[step]) {
            return 'pending';
        }
        if (flow.current_step === step) {
            return 'in-progress';
        }
        return 'completed';
    };

    return (
        <div className="flow-monitor">
            <div className="monitor-header">
                <h2>🔍 Flow Monitor - Live</h2>
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Active</span>
                        <span className="stat-value active">{stats.active}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value completed">{stats.completed}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Failed</span>
                        <span className="stat-value failed">{stats.failed}</span>
                    </div>
                </div>
            </div>

            <div className="monitor-content">
                {/* Active Flows List */}
                <div className="flows-list">
                    <h3>Active Flows</h3>
                    {activeFlows.length === 0 ? (
                        <div className="no-flows">No active flows</div>
                    ) : (
                        activeFlows.map(flow => (
                            <div 
                                key={flow.flow_id} 
                                className={`flow-card ${selectedFlow?.flow_id === flow.flow_id ? 'selected' : ''}`}
                                onClick={() => viewFlowDetails(flow.flow_id)}
                            >
                                <div className="flow-card-header">
                                    <span className="flow-id">{flow.flow_id}</span>
                                    <span className={`flow-status ${flow.status}`}>
                                        {flow.status}
                                    </span>
                                </div>
                                
                                <div className="flow-card-body">
                                    <div className="flow-info">
                                        <span className="label">User:</span>
                                        <span>{flow.user_id}</span>
                                    </div>
                                    <div className="flow-info">
                                        <span className="label">Framework:</span>
                                        <span>{flow.framework}</span>
                                    </div>
                                    <div className="flow-info">
                                        <span className="label">Prompt:</span>
                                        <span className="prompt-preview">{flow.prompt}</span>
                                    </div>
                                </div>

                                <div className="flow-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${flow.progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{flow.progress}%</span>
                                </div>

                                <div className="flow-current-step">
                                    Current: <strong>{flow.current_step}</strong>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Flow Details */}
                {selectedFlow && (
                    <div className="flow-details">
                        <h3>Flow Details</h3>
                        
                        <div className="detail-section">
                            <h4>Pipeline Steps</h4>
                            <div className="pipeline-steps">
                                {['ui', 'code', 'preview', 'build', 'download'].map((step, index) => {
                                    const status = getStepStatus(selectedFlow, step);
                                    return (
                                        <div key={step} className={`pipeline-step ${status}`}>
                                            <div className="step-number">{index + 1}</div>
                                            <div className="step-name">{step}</div>
                                            <div className="step-icon">
                                                {status === 'completed' && '✅'}
                                                {status === 'in-progress' && '⏳'}
                                                {status === 'pending' && '⏸️'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Results</h4>
                            <div className="results-preview">
                                {selectedFlow.results?.ui && (
                                    <div className="result-item">
                                        <strong>UI Generated:</strong> ✅
                                    </div>
                                )}
                                {selectedFlow.results?.code && (
                                    <div className="result-item">
                                        <strong>Code Generated:</strong> ✅
                                        <details>
                                            <summary>View Code</summary>
                                            <pre>{JSON.stringify(selectedFlow.results.code, null, 2)}</pre>
                                        </details>
                                    </div>
                                )}
                                {selectedFlow.results?.preview && (
                                    <div className="result-item">
                                        <strong>Preview:</strong> 
                                        <a href={selectedFlow.results.preview.url} target="_blank" rel="noreferrer">
                                            {selectedFlow.results.preview.url}
                                        </a>
                                    </div>
                                )}
                                {selectedFlow.results?.build && (
                                    <div className="result-item">
                                        <strong>Build ID:</strong> {selectedFlow.results.build.build_id}
                                    </div>
                                )}
                                {selectedFlow.results?.download && (
                                    <div className="result-item">
                                        <strong>Download:</strong>
                                        <a href={selectedFlow.results.download.url} target="_blank" rel="noreferrer">
                                            Download APK/ZIP
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedFlow.errors && selectedFlow.errors.length > 0 && (
                            <div className="detail-section errors">
                                <h4>Errors</h4>
                                {selectedFlow.errors.map((error, index) => (
                                    <div key={index} className="error-item">
                                        {error}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
