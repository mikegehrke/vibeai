import React, { useState, useEffect } from 'react';
import './ModelComparison.css';

const ModelComparison = () => {
  const [selectedModels, setSelectedModels] = useState(['gpt-5', 'gpt-4o', 'o1']);
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState('speed'); // speed, quality, cost

  const availableModels = [
    { id: 'gpt-5', name: 'GPT-5', category: 'gpt5', speed: 95, quality: 100, cost: 85 },
    { id: 'gpt-5-pro', name: 'GPT-5 Pro', category: 'gpt5', speed: 80, quality: 100, cost: 70 },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', category: 'gpt5', speed: 100, quality: 90, cost: 95 },
    { id: 'gpt-4o', name: 'GPT-4o', category: 'gpt4', speed: 90, quality: 95, cost: 90 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'gpt4', speed: 100, quality: 85, cost: 98 },
    { id: 'gpt-4.1', name: 'GPT-4.1', category: 'gpt4', speed: 85, quality: 92, cost: 85 },
    { id: 'o1', name: 'O1', category: 'reasoning', speed: 40, quality: 98, cost: 60 },
    { id: 'o1-pro', name: 'O1 Pro', category: 'reasoning', speed: 30, quality: 100, cost: 50 },
    { id: 'o1-mini', name: 'O1 Mini', category: 'reasoning', speed: 70, quality: 90, cost: 85 },
    { id: 'o3', name: 'O3', category: 'reasoning', speed: 35, quality: 99, cost: 55 },
    { id: 'o3-pro', name: 'O3 Pro', category: 'reasoning', speed: 25, quality: 100, cost: 45 },
    { id: 'o3-mini', name: 'O3 Mini', category: 'reasoning', speed: 65, quality: 92, cost: 80 }
  ];

  const comparisonPrompts = [
    {
      name: "⚡ Speed Test",
      prompt: "List 5 benefits of renewable energy. Be concise.",
      focus: "Response speed and efficiency"
    },
    {
      name: "🧮 Complex Reasoning",
      prompt: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? Show your reasoning step by step.",
      focus: "Logical reasoning ability"
    },
    {
      name: "💻 Code Challenge",
      prompt: "Write a Python function that finds the longest palindromic substring in a given string. Include comments and handle edge cases.",
      focus: "Code quality and completeness"
    },
    {
      name: "🎨 Creative Writing",
      prompt: "Write a short story about a time traveler who accidentally changes history. Keep it under 200 words but make it engaging.",
      focus: "Creativity and storytelling"
    },
    {
      name: "📊 Data Analysis",
      prompt: "Compare the environmental impact of electric cars vs gasoline cars. Consider manufacturing, usage, and disposal phases.",
      focus: "Analytical depth and accuracy"
    }
  ];

  const compareModels = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt!');
      return;
    }

    if (selectedModels.length < 2) {
      alert('Please select at least 2 models to compare!');
      return;
    }

    setIsLoading(true);
    const newResults = {};

    // Test all selected models simultaneously
    const promises = selectedModels.map(async (modelId) => {
      const startTime = Date.now();
      try {
        const response = await fetch('http://127.0.0.1:8005/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelId,
            prompt: prompt
          })
        });

        const data = await response.json();
        const endTime = Date.now();

        return {
          modelId,
          success: true,
          response: data.response,
          responseTime: endTime - startTime,
          tokens: data.tokens || 0,
          cost: data.cost || 0
        };
      } catch (error) {
        return {
          modelId,
          success: false,
          error: error.message,
          responseTime: 0,
          tokens: 0,
          cost: 0
        };
      }
    });

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      newResults[result.modelId] = result;
    });

    setResults(newResults);
    setIsLoading(false);
  };

  const toggleModel = (modelId) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const getModelInfo = (modelId) => {
    return availableModels.find(m => m.id === modelId);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#00ff88';
    if (score >= 70) return '#ffa500';
    if (score >= 50) return '#ff6b6b';
    return '#8b5a3c';
  };

  const getBestModel = (metric) => {
    if (!Object.keys(results).length) return null;
    
    let bestModel = null;
    let bestValue = -1;

    Object.entries(results).forEach(([modelId, result]) => {
      if (!result.success) return;
      
      let value = 0;
      switch (metric) {
        case 'speed':
          value = result.responseTime > 0 ? 10000 / result.responseTime : 0;
          break;
        case 'efficiency':
          value = result.tokens > 0 ? result.tokens / result.responseTime : 0;
          break;
        case 'cost':
          value = result.cost > 0 ? 1 / result.cost : 100;
          break;
        default:
          return;
      }
      
      if (value > bestValue) {
        bestValue = value;
        bestModel = modelId;
      }
    });

    return bestModel;
  };

  return (
    <div className="model-comparison">
      <div className="comparison-header">
        <h2>⚔️ Model Battle Arena</h2>
        <p>Compare multiple AI models side by side</p>
      </div>

      <div className="comparison-content">
        {/* Model Selection */}
        <div className="model-selection">
          <h3>🎯 Select Models to Compare (Max 4)</h3>
          <div className="model-grid">
            {availableModels.map(model => (
              <div 
                key={model.id}
                className={`model-card ${selectedModels.includes(model.id) ? 'selected' : ''}`}
                onClick={() => toggleModel(model.id)}
              >
                <div className="model-info">
                  <h4>{model.name}</h4>
                  <div className="model-stats">
                    <div className="stat">
                      <span>Speed</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.speed}%`,
                            backgroundColor: getScoreColor(model.speed)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span>Quality</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.quality}%`,
                            backgroundColor: getScoreColor(model.quality)
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="stat">
                      <span>Cost Efficiency</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{ 
                            width: `${model.cost}%`,
                            backgroundColor: getScoreColor(model.cost)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedModels.includes(model.id) && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts">
          <h3>⚡ Comparison Prompts</h3>
          <div className="prompt-buttons">
            {comparisonPrompts.map((p, index) => (
              <button
                key={index}
                className="prompt-button"
                onClick={() => setPrompt(p.prompt)}
              >
                <span className="prompt-name">{p.name}</span>
                <span className="prompt-focus">{p.focus}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="prompt-section">
          <h3>💬 Test Prompt</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt to test across all selected models..."
            className="prompt-input"
            rows={4}
          />
          
          <div className="comparison-controls">
            <button 
              className="compare-button"
              onClick={compareModels}
              disabled={isLoading || selectedModels.length < 2 || !prompt.trim()}
            >
              {isLoading ? '🔄 Comparing...' : `⚔️ Battle ${selectedModels.length} Models`}
            </button>
            
            <div className="view-mode">
              <span>View Mode:</span>
              <select value={compareMode} onChange={(e) => setCompareMode(e.target.value)}>
                <option value="speed">⚡ Speed Focus</option>
                <option value="quality">🎯 Quality Focus</option>
                <option value="cost">💰 Cost Focus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="results-section">
            <h3>🏆 Battle Results</h3>
            
            {/* Performance Summary */}
            <div className="performance-summary">
              <div className="winner-card">
                <h4>🏃‍♂️ Speed Champion</h4>
                <span className="winner">{getBestModel('speed') && getModelInfo(getBestModel('speed'))?.name}</span>
              </div>
              <div className="winner-card">
                <h4>💰 Cost Champion</h4>
                <span className="winner">{getBestModel('cost') && getModelInfo(getBestModel('cost'))?.name}</span>
              </div>
              <div className="winner-card">
                <h4>⚡ Efficiency Champion</h4>
                <span className="winner">{getBestModel('efficiency') && getModelInfo(getBestModel('efficiency'))?.name}</span>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="results-grid">
              {selectedModels.map(modelId => {
                const result = results[modelId];
                const modelInfo = getModelInfo(modelId);
                
                if (!result) return null;

                return (
                  <div key={modelId} className="result-card">
                    <div className="result-header">
                      <h4>{modelInfo?.name}</h4>
                      {result.success ? (
                        <div className="metrics">
                          <span>⚡ {result.responseTime}ms</span>
                          <span>💰 ${result.cost?.toFixed(4) || '0.0000'}</span>
                          <span>🔢 {result.tokens} tokens</span>
                        </div>
                      ) : (
                        <span className="error">❌ Failed</span>
                      )}
                    </div>
                    
                    <div className="result-content">
                      {result.success ? (
                        <div className="response">
                          <p>{result.response}</p>
                        </div>
                      ) : (
                        <div className="error-message">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelComparison;