import React, { useState } from 'react';
import PromptHelper from './PromptHelper';
import './ModelTester.css';

const ModelTester = () => {
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
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
        <p>Test any of your 95 premium models with custom prompts</p>
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
              <optgroup label="🚀 OpenAI GPT-4o">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="chatgpt-4o-latest">ChatGPT-4o Latest</option>
                <option value="gpt-4o-2024-11-20">GPT-4o (Nov 2024)</option>
                <option value="gpt-4o-2024-08-06">GPT-4o (Aug 2024)</option>
                <option value="gpt-4o-2024-05-13">GPT-4o (May 2024)</option>
                <option value="gpt-4o-realtime-preview">GPT-4o Realtime</option>
              </optgroup>
              <optgroup label="🧠 OpenAI GPT-4">
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-32k">GPT-4 32K</option>
                <option value="gpt-4-turbo-2024-04-09">GPT-4 Turbo (Apr 2024)</option>
              </optgroup>
              <optgroup label="💬 OpenAI GPT-3.5">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                <option value="gpt-3.5-turbo-instruct">GPT-3.5 Turbo Instruct</option>
              </optgroup>
              <optgroup label="🎯 OpenAI O1">
                <option value="o1-preview">O1 Preview</option>
                <option value="o1-mini">O1 Mini</option>
              </optgroup>
              <optgroup label="🤖 Claude 3.5">
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Oct 2024)</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Oct 2024)</option>
                <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet (Jun 2024)</option>
              </optgroup>
              <optgroup label="🎭 Claude 3">
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </optgroup>
              <optgroup label="📜 Claude 2">
                <option value="claude-2.1">Claude 2.1</option>
                <option value="claude-2.0">Claude 2.0</option>
              </optgroup>
              <optgroup label="✨ Gemini 2.0">
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Exp)</option>
              </optgroup>
              <optgroup label="💎 Gemini 1.5">
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Latest)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</option>
                <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
              </optgroup>
              <optgroup label="🌟 Gemini 1.0">
                <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                <option value="gemini-pro">Gemini Pro</option>
              </optgroup>
              <optgroup label="🦙 Ollama - Llama">
                <option value="llama3.2:1b">Llama 3.2 1B</option>
                <option value="llama3.2:3b">Llama 3.2 3B</option>
                <option value="llama3.1:8b">Llama 3.1 8B</option>
                <option value="llama3.1:70b">Llama 3.1 70B</option>
                <option value="llama3:8b">Llama 3 8B</option>
                <option value="llama3:70b">Llama 3 70B</option>
              </optgroup>
              <optgroup label="🌪️ Ollama - Mistral">
                <option value="mistral:7b">Mistral 7B</option>
                <option value="mistral-small:24b">Mistral Small 24B</option>
                <option value="mixtral:8x7b">Mixtral 8x7B</option>
                <option value="mixtral:8x22b">Mixtral 8x22B</option>
              </optgroup>
              <optgroup label="💻 Ollama - Code">
                <option value="codellama:7b">CodeLlama 7B</option>
                <option value="codellama:13b">CodeLlama 13B</option>
                <option value="codellama:34b">CodeLlama 34B</option>
                <option value="deepseek-coder:6.7b">DeepSeek Coder 6.7B</option>
                <option value="deepseek-coder:33b">DeepSeek Coder 33B</option>
              </optgroup>
              <optgroup label="🔧 Ollama - Other">
                <option value="qwen2.5:7b">Qwen 2.5 7B</option>
                <option value="phi3:mini">Phi-3 Mini</option>
                <option value="gemma2:9b">Gemma2 9B</option>
                <option value="neural-chat:7b">Neural Chat 7B</option>
                <option value="starling-lm:7b">Starling-LM 7B</option>
                <option value="vicuna:13b">Vicuna 13B</option>
                <option value="orca-mini:3b">Orca Mini 3B</option>
                <option value="dolphin-mixtral:8x7b">Dolphin Mixtral 8x7B</option>
              </optgroup>
              <optgroup label="🪟 GitHub - Microsoft">
                <option value="Phi-4">Phi-4</option>
                <option value="Phi-3.5-mini-instruct">Phi-3.5 Mini</option>
                <option value="Phi-3.5-MoE-instruct">Phi-3.5 MoE</option>
              </optgroup>
              <optgroup label="🦾 GitHub - Meta">
                <option value="Meta-Llama-3.1-405B-Instruct">Llama 3.1 405B</option>
                <option value="Meta-Llama-3.1-70B-Instruct">Llama 3.1 70B</option>
                <option value="Meta-Llama-3-70B-Instruct">Llama 3 70B</option>
              </optgroup>
              <optgroup label="🌀 GitHub - Mistral">
                <option value="Mistral-large-2411">Mistral Large (Nov 2024)</option>
                <option value="Mistral-large-2407">Mistral Large (Jul 2024)</option>
                <option value="Mistral-small">Mistral Small</option>
              </optgroup>
              <optgroup label="🔮 GitHub - Cohere">
                <option value="Cohere-command-r-plus">Command R+</option>
                <option value="Cohere-command-r">Command R</option>
              </optgroup>
              <optgroup label="🎲 GitHub - AI21">
                <option value="AI21-Jamba-1.5-Large">Jamba 1.5 Large</option>
                <option value="AI21-Jamba-1.5-Mini">Jamba 1.5 Mini</option>
              </optgroup>
              <optgroup label="🎨 Multimodal - Images">
                <option value="dall-e-3">DALL-E 3</option>
                <option value="dall-e-2">DALL-E 2</option>
              </optgroup>
              <optgroup label="🎵 Multimodal - Audio">
                <option value="whisper-1">Whisper-1</option>
                <option value="tts-1">TTS-1</option>
                <option value="tts-1-hd">TTS-1 HD</option>
              </optgroup>
              <optgroup label="📊 Embeddings">
                <option value="text-embedding-3-large">Embedding 3 Large</option>
                <option value="text-embedding-3-small">Embedding 3 Small</option>
                <option value="text-embedding-ada-002">Embedding Ada-002</option>
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

          {/* Prompt Helper */}
          <PromptHelper onInsertPrompt={(promptText) => setPrompt(prompt + '\n' + promptText)} />
        </div>
      </div>
    </div>
  );
};

export default ModelTester;