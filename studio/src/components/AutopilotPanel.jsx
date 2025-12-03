import React, { useState, useEffect } from 'react';
import './AutopilotPanel.css';

const AutopilotPanel = () => {
  const [activeTab, setActiveTab] = useState('autopilot');
  const [loading, setLoading] = useState(false);
  
  // Autopilot State
  const [projectId, setProjectId] = useState('');
  const [featureTask, setFeatureTask] = useState('');
  const [autoDeploy, setAutoDeploy] = useState(false);
  const [autopilotResult, setAutopilotResult] = useState(null);
  
  // Team State
  const [teamTask, setTeamTask] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [parallelExecution, setParallelExecution] = useState(true);
  const [teamInfo, setTeamInfo] = useState(null);
  const [teamResult, setTeamResult] = useState(null);
  
  // Memory State
  const [memoryProjectId, setMemoryProjectId] = useState('');
  const [memoryKey, setMemoryKey] = useState('');
  const [memoryValue, setMemoryValue] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('preferences');
  const [allMemories, setAllMemories] = useState(null);
  
  // Optimizer State
  const [optimizerProjectId, setOptimizerProjectId] = useState('');
  const [analysisType, setAnalysisType] = useState('full');
  const [optimizerResult, setOptimizerResult] = useState(null);
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Load team info on mount
  useEffect(() => {
    fetchTeamInfo();
    fetchStats();
  }, []);
  
  const fetchTeamInfo = async () => {
    try {
      const res = await fetch('http://localhost:8000/autopilot/team/info');
      const data = await res.json();
      setTeamInfo(data);
    } catch (error) {
      console.error('Failed to fetch team info:', error);
    }
  };
  
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/autopilot/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  // ============================================================
  // AUTOPILOT ACTIONS
  // ============================================================
  
  const handleBuildFeature = async () => {
    if (!projectId || !featureTask) {
      alert('Please enter project ID and task');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/build-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          task: featureTask,
          auto_deploy: autoDeploy
        })
      });
      
      const data = await res.json();
      setAutopilotResult(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOptimizeProject = async () => {
    if (!projectId) {
      alert('Please enter project ID');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/optimize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId
        })
      });
      
      const data = await res.json();
      setAutopilotResult(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // ============================================================
  // TEAM ACTIONS
  // ============================================================
  
  const handleTeamCollaborate = async () => {
    if (!teamTask) {
      alert('Please enter task');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/team/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: teamTask,
          team_members: selectedTeamMembers.length > 0 ? selectedTeamMembers : null,
          parallel: parallelExecution
        })
      });
      
      const data = await res.json();
      setTeamResult(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleTeamMember = (role) => {
    if (selectedTeamMembers.includes(role)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(r => r !== role));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, role]);
    }
  };
  
  // ============================================================
  // MEMORY ACTIONS
  // ============================================================
  
  const handleMemoryRemember = async () => {
    if (!memoryProjectId || !memoryKey || !memoryValue) {
      alert('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/memory/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: memoryProjectId,
          key: memoryKey,
          value: memoryValue,
          category: memoryCategory
        })
      });
      
      const data = await res.json();
      alert('Memory saved!');
      
      // Reload memories
      handleMemoryGetAll();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMemoryGetAll = async () => {
    if (!memoryProjectId) {
      alert('Please enter project ID');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/autopilot/memory/all/${memoryProjectId}`);
      const data = await res.json();
      setAllMemories(data.memories);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // ============================================================
  // OPTIMIZER ACTIONS
  // ============================================================
  
  const handleOptimizerAnalyze = async () => {
    if (!optimizerProjectId) {
      alert('Please enter project ID');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/optimizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: optimizerProjectId,
          analysis_type: analysisType
        })
      });
      
      const data = await res.json();
      setOptimizerResult(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFindDeadCode = async () => {
    if (!optimizerProjectId) {
      alert('Please enter project ID');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/autopilot/optimizer/dead-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: optimizerProjectId
        })
      });
      
      const data = await res.json();
      setOptimizerResult(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="autopilot-panel">
      {/* Header */}
      <div className="panel-header">
        <h1>🤖 AI Autopilot System</h1>
        <p>Multi-Agent Team · Long-Term Memory · Project Optimization</p>
      </div>
      
      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.team.available_agents}</span>
            <span className="stat-label">Team Agents</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.team.default_team_size}</span>
            <span className="stat-label">Default Team</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.memory.projects_with_memory}</span>
            <span className="stat-label">Projects with Memory</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">4</span>
            <span className="stat-label">Analysis Types</span>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'autopilot' ? 'active' : ''}
          onClick={() => setActiveTab('autopilot')}
        >
          🚀 Autopilot
        </button>
        <button 
          className={activeTab === 'team' ? 'active' : ''}
          onClick={() => setActiveTab('team')}
        >
          🤝 Team
        </button>
        <button 
          className={activeTab === 'memory' ? 'active' : ''}
          onClick={() => setActiveTab('memory')}
        >
          🧠 Memory
        </button>
        <button 
          className={activeTab === 'optimizer' ? 'active' : ''}
          onClick={() => setActiveTab('optimizer')}
        >
          ⚡ Optimizer
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {/* AUTOPILOT TAB */}
        {activeTab === 'autopilot' && (
          <div className="autopilot-tab">
            <h2>Multi-Agent Autopilot</h2>
            <p>Let the AI team build complete features automatically</p>
            
            <div className="form-section">
              <label>Project ID:</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="my-app"
              />
              
              <label>Feature Task:</label>
              <textarea
                value={featureTask}
                onChange={(e) => setFeatureTask(e.target.value)}
                placeholder="Add user authentication with email/password, including login/register screens, password reset, and session management"
                rows="4"
              />
              
              <label>
                <input
                  type="checkbox"
                  checked={autoDeploy}
                  onChange={(e) => setAutoDeploy(e.target.checked)}
                />
                Auto-Deploy (experimental)
              </label>
              
              <div className="button-group">
                <button onClick={handleBuildFeature} disabled={loading}>
                  🚀 Build Feature
                </button>
                <button onClick={handleOptimizeProject} disabled={loading}>
                  ⚡ Optimize Project
                </button>
              </div>
            </div>
            
            {autopilotResult && (
              <div className="result-section">
                <h3>Result</h3>
                <div className="result-card">
                  <p><strong>Success:</strong> {autopilotResult.success ? '✅ Yes' : '❌ No'}</p>
                  {autopilotResult.feature_path && (
                    <p><strong>Feature File:</strong> {autopilotResult.feature_path}</p>
                  )}
                  {autopilotResult.files_created && (
                    <p><strong>Files Created:</strong> {autopilotResult.files_created.length}</p>
                  )}
                  {autopilotResult.execution_time && (
                    <p><strong>Time:</strong> {autopilotResult.execution_time.toFixed(2)}s</p>
                  )}
                  {autopilotResult.collaboration && (
                    <div className="collaboration-preview">
                      <h4>Team Collaboration:</h4>
                      {Object.entries(autopilotResult.collaboration).map(([role, content]) => (
                        <div key={role} className="agent-contribution">
                          <strong>{role}:</strong>
                          <p>{content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="team-tab">
            <h2>Multi-Agent Team</h2>
            <p>Collaborate with specialized AI agents</p>
            
            <div className="form-section">
              <label>Task:</label>
              <textarea
                value={teamTask}
                onChange={(e) => setTeamTask(e.target.value)}
                placeholder="Design REST API for user management with authentication, CRUD operations, and rate limiting"
                rows="4"
              />
              
              <label>Team Members (optional - leave empty for default team):</label>
              <div className="team-selector">
                {teamInfo && teamInfo.available_roles.map(role => (
                  <button
                    key={role}
                    className={selectedTeamMembers.includes(role) ? 'selected' : ''}
                    onClick={() => toggleTeamMember(role)}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
              
              <label>
                <input
                  type="checkbox"
                  checked={parallelExecution}
                  onChange={(e) => setParallelExecution(e.target.checked)}
                />
                Parallel Execution (faster, all agents work simultaneously)
              </label>
              
              <button onClick={handleTeamCollaborate} disabled={loading}>
                🤝 Start Collaboration
              </button>
            </div>
            
            {teamResult && (
              <div className="result-section">
                <h3>Team Collaboration Result</h3>
                <div className="result-card">
                  <p><strong>Task:</strong> {teamResult.task}</p>
                  <p><strong>Team Size:</strong> {teamResult.team.length} agents</p>
                  <p><strong>Execution Time:</strong> {teamResult.execution_time.toFixed(2)}s</p>
                  <p><strong>Mode:</strong> {teamResult.parallel ? 'Parallel' : 'Sequential'}</p>
                  
                  <h4>Consensus:</h4>
                  <div className="consensus">
                    {teamResult.consensus}
                  </div>
                  
                  <h4>Individual Perspectives:</h4>
                  <div className="perspectives">
                    {Object.entries(teamResult.results).map(([role, result]) => (
                      <div key={role} className="perspective-card">
                        <strong>{role}:</strong>
                        <p>{result.response || result.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* MEMORY TAB */}
        {activeTab === 'memory' && (
          <div className="memory-tab">
            <h2>Project Memory</h2>
            <p>Long-term memory for AI consistency</p>
            
            <div className="form-section">
              <label>Project ID:</label>
              <input
                type="text"
                value={memoryProjectId}
                onChange={(e) => setMemoryProjectId(e.target.value)}
                placeholder="my-app"
              />
              
              <div className="memory-grid">
                <div className="memory-save">
                  <h3>Save Memory</h3>
                  <label>Category:</label>
                  <select 
                    value={memoryCategory}
                    onChange={(e) => setMemoryCategory(e.target.value)}
                  >
                    <option value="preferences">Preferences</option>
                    <option value="code_style">Code Style</option>
                    <option value="architecture">Architecture</option>
                    <option value="ui_standards">UI Standards</option>
                    <option value="tech_stack">Tech Stack</option>
                  </select>
                  
                  <label>Key:</label>
                  <input
                    type="text"
                    value={memoryKey}
                    onChange={(e) => setMemoryKey(e.target.value)}
                    placeholder="state_management"
                  />
                  
                  <label>Value:</label>
                  <input
                    type="text"
                    value={memoryValue}
                    onChange={(e) => setMemoryValue(e.target.value)}
                    placeholder="riverpod"
                  />
                  
                  <button onClick={handleMemoryRemember} disabled={loading}>
                    💾 Remember
                  </button>
                </div>
                
                <div className="memory-view">
                  <h3>View Memories</h3>
                  <button onClick={handleMemoryGetAll} disabled={loading}>
                    🔍 Load All Memories
                  </button>
                  
                  {allMemories && (
                    <div className="memories-list">
                      {Object.entries(allMemories).map(([category, items]) => (
                        <div key={category} className="memory-category">
                          <h4>{category}</h4>
                          {Object.keys(items).length > 0 ? (
                            <ul>
                              {Object.entries(items).map(([key, data]) => (
                                <li key={key}>
                                  <strong>{key}:</strong> {data.value}
                                  <small>{new Date(data.timestamp).toLocaleString()}</small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="empty">No memories</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* OPTIMIZER TAB */}
        {activeTab === 'optimizer' && (
          <div className="optimizer-tab">
            <h2>Project Optimizer</h2>
            <p>Analyze and optimize your project</p>
            
            <div className="form-section">
              <label>Project ID:</label>
              <input
                type="text"
                value={optimizerProjectId}
                onChange={(e) => setOptimizerProjectId(e.target.value)}
                placeholder="my-app"
              />
              
              <label>Analysis Type:</label>
              <select 
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
              >
                <option value="full">Full Analysis</option>
                <option value="code">Code Quality Only</option>
                <option value="structure">Architecture Only</option>
                <option value="performance">Performance Only</option>
              </select>
              
              <div className="button-group">
                <button onClick={handleOptimizerAnalyze} disabled={loading}>
                  🔍 Analyze
                </button>
                <button onClick={handleFindDeadCode} disabled={loading}>
                  🗑️ Find Dead Code
                </button>
              </div>
            </div>
            
            {optimizerResult && (
              <div className="result-section">
                <h3>Optimization Report</h3>
                <div className="result-card">
                  <p><strong>Success:</strong> {optimizerResult.success ? '✅ Yes' : '❌ No'}</p>
                  {optimizerResult.files_analyzed && (
                    <p><strong>Files Analyzed:</strong> {optimizerResult.files_analyzed}</p>
                  )}
                  {optimizerResult.issues_found !== undefined && (
                    <p><strong>Issues Found:</strong> {optimizerResult.issues_found}</p>
                  )}
                  {optimizerResult.dead_code_found !== undefined && (
                    <p><strong>Dead Code Items:</strong> {optimizerResult.dead_code_found}</p>
                  )}
                  {optimizerResult.report && (
                    <div className="report-details">
                      <h4>Report:</h4>
                      <pre>{optimizerResult.report.raw_report}</pre>
                    </div>
                  )}
                  {optimizerResult.recommendations && optimizerResult.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        {optimizerResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default AutopilotPanel;
