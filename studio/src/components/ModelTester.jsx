import React, { useState } from 'react';
import './ModelTester.css';

const ModelTester = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-5');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0
  });

  // Quick test prompts
  const quickPrompts = [
    {
      name: "🧪 General Test",
      prompt: "Hello! Please introduce yourself and tell me about your capabilities."
    },
    {
      name: "💻 Code Test",
      prompt: "Write a Python function to calculate fibonacci numbers using memoization."
    },
    {
      name: "🎨 Creative Test",
      prompt: "Write a short creative story about a robot discovering emotions."
    },
    {
      name: "🧮 Reasoning Test",
      prompt: "Solve this step by step: If a train travels 120 miles in 2 hours, and another train travels 180 miles in 3 hours, which train is faster and by how much?"
    },
    {
      name: "📊 Analysis Test",
      prompt: "Analyze the pros and cons of renewable energy vs fossil fuels."
    },
    {
      name: "🌍 Knowledge Test",
      prompt: "Explain quantum computing in simple terms that a 10-year-old could understand."
    }
  ];

  const testModel = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt!');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch('http://127.0.0.1:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt,
          settings: settings
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (data.error) {
        throw new Error(data.error);
      }

      const testResult = {
        id: Date.now(),
        model: selectedModel,
        prompt: prompt,
        response: data.response,
        responseTime: responseTime,
        tokens: data.tokens || 0,
        cost: data.cost || 0,
        timestamp: new Date().toLocaleString()
      };

      setResponse(data.response);
      setTestHistory(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 tests

    } catch (error) {
      setResponse(`❌ Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const clearHistory = () => {
    setTestHistory([]);
    setResponse('');
    setPrompt('');
  };

  const loadPrompt = (promptText) => {
    setPrompt(promptText);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(testHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibeai-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="model-tester">
      <div className="tester-header">
        <h2>🧪 Interactive Model Tester</h2>
        <p>Test any of your 88 premium models with custom prompts</p>
      </div>

      <div className="tester-content">
        <div className="left-panel">
          {/* Model Selection */}
          <div className="section">
            <h3>🎯 Select Model</h3>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              <optgroup label="🚀 GPT-5 Series">
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5-pro">GPT-5 Pro</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-5-nano">GPT-5 Nano</option>
              </optgroup>
              <optgroup label="🧠 GPT-4 Series">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4.1">GPT-4.1</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
              </optgroup>
              <optgroup label="🧮 O-Series (Reasoning)">
                <option value="o1">O1</option>
                <option value="o1-pro">O1 Pro</option>
                <option value="o1-mini">O1 Mini</option>
                <option value="o3">O3</option>
                <option value="o3-pro">O3 Pro</option>
                <option value="o3-mini">O3 Mini</option>
                <option value="o4-mini">O4 Mini</option>
              </optgroup>
              <optgroup label="🎨 Creative Models">
                <option value="dall-e-3">DALL-E 3</option>
                <option value="sora-2">SORA-2</option>
                <option value="sora-2-pro">SORA-2 Pro</option>
              </optgroup>
              <optgroup label="🎵 Audio Models">
                <option value="whisper-1">Whisper-1</option>
                <option value="tts-1">TTS-1</option>
                <option value="tts-1-hd">TTS-1 HD</option>
                <option value="gpt-audio">GPT Audio</option>
              </optgroup>
            </select>
          </div>

          {/* Quick Prompts */}
          <div className="section">
            <h3>⚡ Quick Test Prompts</h3>
            <div className="quick-prompts">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="prompt-btn"
                  onClick={() => loadPrompt(prompt.prompt)}
                >
                  {prompt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="section">
            <h3>⚙️ Advanced Settings</h3>
            <div className="settings-grid">
              <div className="setting">
                <label>Temperature: {settings.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="setting">
                <label>Max Tokens: {settings.maxTokens}</label>
                <input
                  type="range"
                  min="100"
                  max="4000"
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="setting">
                <label>Top P: {settings.topP}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.topP}
                  onChange={(e) => setSettings(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {/* Prompt Input */}
          <div className="section">
            <h3>💬 Your Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... Be creative! 🎨"
              className="prompt-input"
              rows={6}
            />
            
            <div className="test-controls">
              <button 
                className="test-button"
                onClick={testModel}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? '🔄 Testing...' : `🚀 Test ${selectedModel}`}
              </button>
              
              <button className="clear-button" onClick={clearHistory}>
                🧹 Clear All
              </button>
              
              {testHistory.length > 0 && (
                <button className="export-button" onClick={exportResults}>
                  💾 Export Results
                </button>
              )}
            </div>
          </div>

          {/* Response */}
          {response && (
            <div className="section">
              <h3>🤖 Model Response</h3>
              <div className="response-container">
                <pre className="response-text">{response}</pre>
              </div>
            </div>
          )}

          {/* Test History */}
          {testHistory.length > 0 && (
            <div className="section">
              <h3>📊 Test History</h3>
              <div className="history-container">
                {testHistory.map((test) => (
                  <div key={test.id} className="history-item">
                    <div className="history-header">
                      <span className="model-name">{test.model}</span>
                      <span className="timestamp">{test.timestamp}</span>
                    </div>
                    <div className="history-prompt">
                      <strong>Prompt:</strong> {test.prompt.substring(0, 100)}...
                    </div>
                    <div className="history-metrics">
                      ⚡ {test.responseTime}ms | 
                      💰 ${test.cost?.toFixed(4) || '0.0000'} | 
                      🔢 {test.tokens} tokens
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelTester;