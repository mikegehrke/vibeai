import React, { useState, useEffect } from 'react';
import './AIIntelligencePanel.css';

const AIIntelligencePanel = () => {
  const [activeTab, setActiveTab] = useState('pricing');
  const [models, setModels] = useState([]);
  const [providers, setProviders] = useState({});
  const [agents, setAgents] = useState({});
  const [budgetStatus, setBudgetStatus] = useState({});
  const [benchmarkRanking, setBenchmarkRanking] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // User state
  const [userId, setUserId] = useState('user123');
  
  // Selection states
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [minQuality, setMinQuality] = useState(5);
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Agent states
  const [selectedAgent, setSelectedAgent] = useState('lead_developer');
  const [agentTask, setAgentTask] = useState('');
  
  // Budget states
  const [budgetPeriod, setBudgetPeriod] = useState('daily');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchSystemStats();
    fetchModels();
    fetchProviders();
    fetchAgents();
    fetchBudgetStatus();
    fetchBenchmarkRanking();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/stats');
      const data = await res.json();
      setSystemStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/pricing/models');
      const data = await res.json();
      setModels(Object.entries(data.models || {}));
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/fallback/providers');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/agents/all');
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const res = await fetch(`http://localhost:8000/ai-intelligence/budget/status/${userId}`);
      const data = await res.json();
      setBudgetStatus(data);
    } catch (err) {
      console.error('Error fetching budget:', err);
    }
  };

  const fetchBenchmarkRanking = async () => {
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/benchmark/ranking');
      const data = await res.json();
      setBenchmarkRanking(data.ranking || []);
    } catch (err) {
      console.error('Error fetching ranking:', err);
    }
  };

  const handleSelectModel = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/selector/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: selectedStrategy,
          min_quality: parseInt(minQuality),
          max_price_per_1k: maxPrice ? parseFloat(maxPrice) : null
        })
      });
      const data = await res.json();
      setSelectedModel(data.model_id);
      alert(`Best model: ${data.model_id}\nQuality: ${data.details.quality}\nPrice: €${data.details.input}/€${data.details.output} per 1K`);
    } catch (err) {
      alert('Error selecting model: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallAI = async () => {
    if (!selectedModel || !prompt) {
      alert('Please select a model and enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel,
          prompt: prompt,
          user_id: userId,
          max_retries: 3
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setAiResponse(data.result);
        alert(`Response received!\nModel: ${data.model_used}\nLatency: ${data.latency_ms}ms\nCost: €${data.cost_euros?.toFixed(6) || 'N/A'}`);
        fetchBudgetStatus(); // Refresh budget
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error calling AI: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchAgent = async () => {
    if (!agentTask) {
      alert('Please enter a task');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/agents/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_type: selectedAgent,
          task: agentTask,
          quality: parseInt(minQuality)
        })
      });
      const data = await res.json();
      alert(`Agent dispatched!\nAgent: ${data.agent_type}\nModel: ${data.model_used}\nStrategy: ${data.criteria.strategy}`);
    } catch (err) {
      alert('Error dispatching agent: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async () => {
    if (!budgetLimit) {
      alert('Please enter a budget limit');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/budget/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          period: budgetPeriod,
          limit_euros: parseFloat(budgetLimit)
        })
      });
      await res.json();
      alert('Budget set successfully!');
      fetchBudgetStatus();
    } catch (err) {
      alert('Error setting budget: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async (modelId) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/ai-intelligence/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: modelId,
          num_iterations: 3
        })
      });
      const data = await res.json();
      alert(`Benchmark complete!\nLatency: ${data.avg_latency_ms.toFixed(0)}ms\nQuality: ${data.quality_score.toFixed(1)}/10\nSuccess: ${data.success_rate.toFixed(1)}%`);
      fetchBenchmarkRanking();
    } catch (err) {
      alert('Error running benchmark: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-intelligence-panel">
      <div className="panel-header">
        <h1>🤖 AI Intelligence System</h1>
        <p className="subtitle">Blocks A-F: Multi-Provider, Budget-Aware AI Platform</p>
      </div>

      {systemStats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Models:</span>
            <span className="stat-value">{systemStats.pricing.total_models}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Providers:</span>
            <span className="stat-value">{systemStats.pricing.total_providers}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Agents:</span>
            <span className="stat-value">{systemStats.agents.total_agents}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Healthy:</span>
            <span className="stat-value">{systemStats.fallback.healthy_providers.length}</span>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => setActiveTab('pricing')}>
          💰 Pricing
        </button>
        <button className={activeTab === 'selector' ? 'active' : ''} onClick={() => setActiveTab('selector')}>
          🎯 Model Selector
        </button>
        <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>
          🤖 Agents
        </button>
        <button className={activeTab === 'budget' ? 'active' : ''} onClick={() => setActiveTab('budget')}>
          💳 Budget
        </button>
        <button className={activeTab === 'fallback' ? 'active' : ''} onClick={() => setActiveTab('fallback')}>
          🔄 Fallback
        </button>
        <button className={activeTab === 'benchmark' ? 'active' : ''} onClick={() => setActiveTab('benchmark')}>
          📊 Benchmark
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'pricing' && (
          <div className="pricing-tab">
            <h2>Model Pricing Database</h2>
            <div className="models-grid">
              {models.map(([modelId, data]) => (
                <div key={modelId} className="model-card">
                  <div className="model-header">
                    <h3>{modelId}</h3>
                    <span className={`provider-badge ${data.provider}`}>{data.provider}</span>
                  </div>
                  <div className="model-details">
                    <div className="detail-row">
                      <span>Quality:</span>
                      <span className="quality-score">{data.quality}/10</span>
                    </div>
                    <div className="detail-row">
                      <span>Input:</span>
                      <span>€{data.input.toFixed(6)}/1K</span>
                    </div>
                    <div className="detail-row">
                      <span>Output:</span>
                      <span>€{data.output.toFixed(6)}/1K</span>
                    </div>
                    <div className="detail-row">
                      <span>Speed:</span>
                      <span className={`speed-badge ${data.speed}`}>{data.speed}</span>
                    </div>
                    <div className="detail-row">
                      <span>Context:</span>
                      <span>{(data.context_window / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="model-capabilities">
                    {data.capabilities.map(cap => (
                      <span key={cap} className="capability-tag">{cap}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'selector' && (
          <div className="selector-tab">
            <h2>Intelligent Model Selection</h2>
            
            <div className="selection-form">
              <div className="form-group">
                <label>Strategy:</label>
                <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)}>
                  <option value="balanced">Balanced</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="fastest">Fastest</option>
                  <option value="best_quality">Best Quality</option>
                  <option value="cost_performance">Cost Performance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Min Quality (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={minQuality}
                  onChange={(e) => setMinQuality(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Max Price (€/1K, optional):</label>
                <input
                  type="number"
                  step="0.001"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No limit"
                />
              </div>

              <button onClick={handleSelectModel} disabled={loading} className="primary-btn">
                {loading ? 'Selecting...' : 'Find Best Model'}
              </button>
            </div>

            {selectedModel && (
              <div className="selected-model">
                <h3>Selected Model:</h3>
                <p className="model-name">{selectedModel}</p>
                
                <div className="ai-call-section">
                  <h3>Test AI Call:</h3>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt..."
                    rows={4}
                  />
                  <button onClick={handleCallAI} disabled={loading} className="primary-btn">
                    {loading ? 'Calling...' : 'Call AI'}
                  </button>
                  
                  {aiResponse && (
                    <div className="ai-response">
                      <h4>Response:</h4>
                      <pre>{aiResponse}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agents-tab">
            <h2>Multi-Agent Dispatcher</h2>
            
            <div className="agents-grid">
              {Object.entries(agents).map(([agentType, info]) => (
                <div key={agentType} className="agent-card">
                  <h3>{agentType.replace(/_/g, ' ').toUpperCase()}</h3>
                  <p className="agent-description">{info.description}</p>
                  <div className="agent-details">
                    <div className="detail-row">
                      <span>Model:</span>
                      <span>{info.recommended_model}</span>
                    </div>
                    <div className="detail-row">
                      <span>Quality:</span>
                      <span>{info.min_quality}/10</span>
                    </div>
                    <div className="detail-row">
                      <span>Strategy:</span>
                      <span>{info.strategy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="agent-dispatch-form">
              <h3>Dispatch Agent:</h3>
              <div className="form-group">
                <label>Select Agent:</label>
                <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                  {Object.keys(agents).map(agentType => (
                    <option key={agentType} value={agentType}>{agentType.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Task:</label>
                <textarea
                  value={agentTask}
                  onChange={(e) => setAgentTask(e.target.value)}
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              <button onClick={handleDispatchAgent} disabled={loading} className="primary-btn">
                {loading ? 'Dispatching...' : 'Dispatch Agent'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="budget-tab">
            <h2>Budget Management</h2>
            
            <div className="budget-set-form">
              <h3>Set Budget Limit:</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Period:</label>
                  <select value={budgetPeriod} onChange={(e) => setBudgetPeriod(e.target.value)}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="total">Total</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Limit (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="1.00"
                  />
                </div>

                <button onClick={handleSetBudget} disabled={loading} className="primary-btn">
                  Set Budget
                </button>
              </div>
            </div>

            <div className="budget-status">
              <h3>Budget Status:</h3>
              <div className="budget-periods">
                {Object.entries(budgetStatus).map(([period, data]) => (
                  <div key={period} className="budget-period-card">
                    <h4>{period.toUpperCase()}</h4>
                    {data.limit ? (
                      <>
                        <div className="budget-bar">
                          <div
                            className="budget-fill"
                            style={{
                              width: `${Math.min(data.percentage_used, 100)}%`,
                              backgroundColor: data.percentage_used > 90 ? '#e74c3c' : data.percentage_used > 70 ? '#f39c12' : '#2ecc71'
                            }}
                          />
                        </div>
                        <div className="budget-numbers">
                          <span>€{data.spent.toFixed(4)} / €{data.limit.toFixed(2)}</span>
                          <span className="percentage">{data.percentage_used.toFixed(1)}%</span>
                        </div>
                        <div className="budget-remaining">
                          Remaining: €{data.remaining.toFixed(4)}
                        </div>
                      </>
                    ) : (
                      <p className="no-limit">No limit set</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fallback' && (
          <div className="fallback-tab">
            <h2>Provider Fallback System</h2>
            
            <div className="providers-status">
              {Object.entries(providers).map(([provider, status]) => (
                status && (
                  <div key={provider} className="provider-card">
                    <div className="provider-header">
                      <h3>{provider.toUpperCase()}</h3>
                      <span className={`health-badge ${status.health}`}>
                        {status.health}
                      </span>
                    </div>
                    <div className="provider-details">
                      <div className="detail-row">
                        <span>Latency:</span>
                        <span>{status.avg_latency_ms}ms</span>
                      </div>
                      <div className="detail-row">
                        <span>Failures:</span>
                        <span>{status.consecutive_failures}</span>
                      </div>
                      <div className="detail-row">
                        <span>Last Check:</span>
                        <span>{new Date(status.last_check).toLocaleTimeString()}</span>
                      </div>
                      {status.last_error && (
                        <div className="error-message">
                          Error: {status.last_error}
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>

            {systemStats && (
              <div className="fallback-chain">
                <h3>Fallback Chain:</h3>
                <div className="chain">
                  {systemStats.fallback.fallback_chain.map((provider, index) => (
                    <React.Fragment key={provider}>
                      <div className="chain-item">{provider}</div>
                      {index < systemStats.fallback.fallback_chain.length - 1 && (
                        <div className="chain-arrow">→</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'benchmark' && (
          <div className="benchmark-tab">
            <h2>Model Benchmarking</h2>
            
            <div className="ranking-table">
              <h3>Overall Ranking:</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Model</th>
                    <th>Score</th>
                    <th>Quality</th>
                    <th>Speed (ms)</th>
                    <th>Reliability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRanking.slice(0, 10).map((model, index) => (
                    <tr key={model.model_id}>
                      <td>{index + 1}</td>
                      <td>{model.model_id}</td>
                      <td><strong>{model.composite_score.toFixed(1)}</strong></td>
                      <td>{model.quality.toFixed(1)}/10</td>
                      <td>{model.speed.toFixed(0)}</td>
                      <td>{model.reliability.toFixed(1)}%</td>
                      <td>
                        <button
                          onClick={() => handleRunBenchmark(model.model_id)}
                          disabled={loading}
                          className="small-btn"
                        >
                          Re-test
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default AIIntelligencePanel;
