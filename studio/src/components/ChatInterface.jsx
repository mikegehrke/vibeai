import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';
import PromptHelper from './PromptHelper';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: '',
  });

  // All available models - COMPLETE 250+ catalog (Nov 2025)
  const models = {
    'OpenAI GPT-5.1': ['gpt-5.1', 'gpt-5.1-turbo', 'gpt-5.1-mini', 'gpt-5.1-preview', 'gpt-5.1-codex', 'gpt-5.1-codex-mini'],
    'OpenAI GPT-5': ['gpt-5', 'gpt-5-turbo', 'gpt-5-mini', 'gpt-5-preview', 'gpt-5-32k'],
    'OpenAI GPT-4.1': ['gpt-4.1', 'gpt-4.1-turbo', 'gpt-4.1-mini', 'gpt-4.1-preview', 'gpt-4.1-32k'],
    'OpenAI GPT-4o': ['gpt-4o', 'gpt-4o-2024-11-20', 'gpt-4o-2024-08-06', 'gpt-4o-2024-05-13', 'gpt-4o-mini', 'gpt-4o-mini-2024-07-18', 'gpt-4o-realtime-preview', 'gpt-4o-audio-preview', 'chatgpt-4o-latest'],
    'OpenAI GPT-4': ['gpt-4-turbo', 'gpt-4-turbo-preview', 'gpt-4-turbo-2024-04-09', 'gpt-4', 'gpt-4-0613', 'gpt-4-0314', 'gpt-4-32k', 'gpt-4-32k-0613'],
    'OpenAI GPT-3.5': ['gpt-3.5-turbo', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613', 'gpt-3.5-turbo-instruct'],
    'OpenAI O3': ['o3', 'o3-mini', 'o3-preview', 'o3-turbo', 'o3-mini-turbo'],
    'OpenAI O1': ['o1', 'o1-preview', 'o1-mini', 'o1-2024-12-17'],
    'OpenAI Codex': ['codex', 'codex-turbo', 'codex-mini', 'code-davinci-002', 'code-cushman-001'],
    'Claude 4.5': ['claude-4.5', 'claude-4.5-opus', 'claude-4.5-sonnet', 'claude-4.5-haiku', 'claude-opus-4.5', 'claude-sonnet-4.5', 'claude-haiku-4.5'],
    'Claude 4': ['claude-4', 'claude-4-opus', 'claude-4-sonnet', 'claude-4-haiku', 'claude-4.0', 'claude-4.0-opus'],
    'Claude 3.5': ['claude-3.5', 'claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-20240620', 'claude-3-5-haiku-20241022', 'claude-3-5-opus'],
    'Claude 3': ['claude-3', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    'Claude 2': ['claude-2.1', 'claude-2.0', 'claude-instant-1.2'],
    'Gemini 3': ['gemini-3', 'gemini-3-pro', 'gemini-3-ultra', 'gemini-3-flash', 'gemini-3-nano'],
    'Gemini 2.5': ['gemini-2.5', 'gemini-2.5-pro', 'gemini-2.5-flash'],
    'Gemini 2.0': ['gemini-2.0', 'gemini-2.0-flash-exp', 'gemini-2.0-pro', 'gemini-2.0-ultra', 'gemini-2.0-nano'],
    'Gemini 1.5': ['gemini-1.5', 'gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-8b', 'gemini-1.5-flash-002'],
    'Gemini 1.0': ['gemini-1.0', 'gemini-1.0-pro', 'gemini-1.0-ultra', 'gemini-pro', 'gemini-pro-vision'],
    'Gemini Experimental': ['gemini-bananas', 'gemini-banana-001'],
    'GitHub Copilot - GPT': ['github-gpt-4o', 'github-gpt-4.1', 'github-gpt-4.1-mini', 'github-gpt-4', 'github-gpt-4-turbo', 'github-gpt-4-mini', 'github-o3', 'github-o3-mini', 'github-o1', 'github-o1-preview', 'github-codex', 'github-codex-turbo'],
    'GitHub Copilot - Claude': ['github-claude-4.5', 'github-claude-4.5-opus', 'github-claude-4.5-sonnet', 'github-claude-4', 'github-claude-4-opus', 'github-claude-3.5', 'github-claude-3.5-sonnet', 'github-claude-3.5-haiku', 'github-claude-3', 'github-claude-3-opus'],
    'GitHub Copilot - Gemini': ['github-gemini-3', 'github-gemini-2.5', 'github-gemini-2.0-flash', 'github-gemini-1.5-pro'],
    'Ollama - Llama 3.3': ['llama3.3', 'llama3.3:70b'],
    'Ollama - Llama 3.2': ['llama3.2', 'llama3.2:1b', 'llama3.2:3b', 'llama3.2:11b'],
    'Ollama - Llama 3.1': ['llama3.1', 'llama3.1:8b', 'llama3.1:70b', 'llama3.1:405b'],
    'Ollama - Llama 3': ['llama3', 'llama3:8b', 'llama3:70b'],
    'Ollama - Llama 2': ['llama2', 'llama2:7b', 'llama2:13b', 'llama2:70b'],
    'Ollama - Mistral': ['mistral', 'mistral:7b', 'mistral:latest', 'mistral-small', 'mistral-small:24b', 'mistral-large', 'mistral-large:latest', 'mixtral', 'mixtral:8x7b', 'mixtral:8x22b', 'mistral-nemo', 'mistral-nemo:12b'],
    'Ollama - Code': ['codellama', 'codellama:7b', 'codellama:13b', 'codellama:34b', 'codellama:70b', 'codegemma', 'codegemma:7b', 'deepseek-coder', 'deepseek-coder:6.7b', 'deepseek-coder:33b', 'deepseek-coder-v2', 'deepseek-coder-v2:16b', 'qwen2.5-coder', 'qwen2.5-coder:7b', 'qwen2.5-coder:32b', 'starcoder2', 'starcoder2:7b', 'starcoder2:15b'],
    'Ollama - Qwen': ['qwen2.5', 'qwen2.5:7b', 'qwen2.5:14b', 'qwen2.5:32b', 'qwen2.5:72b', 'qwen2', 'qwen2:7b', 'qwen', 'qwen:7b'],
    'Ollama - Phi': ['phi3', 'phi3:mini', 'phi3:medium', 'phi3:14b', 'phi3.5', 'phi3.5:latest'],
    'Ollama - Gemma': ['gemma2', 'gemma2:2b', 'gemma2:9b', 'gemma2:27b', 'gemma', 'gemma:7b'],
    'Ollama - Others': ['neural-chat', 'neural-chat:7b', 'starling-lm', 'starling-lm:7b', 'vicuna', 'vicuna:7b', 'vicuna:13b', 'vicuna:33b', 'orca-mini', 'orca-mini:3b', 'orca-mini:7b', 'orca2', 'orca2:7b', 'orca2:13b', 'dolphin-mixtral', 'dolphin-mixtral:8x7b', 'dolphin-mixtral:8x22b', 'dolphin-mistral', 'dolphin-mistral:7b', 'yi', 'yi:6b', 'yi:34b', 'solar', 'solar:10.7b', 'openchat', 'openchat:7b', 'wizardlm2', 'wizardlm2:7b', 'nous-hermes2', 'nous-hermes2:latest'],
    'GitHub Models - Phi': ['Phi-4', 'Phi-3.5-mini-instruct', 'Phi-3.5-MoE-instruct', 'Phi-3-mini-4k-instruct', 'Phi-3-mini-128k-instruct', 'Phi-3-small-8k-instruct', 'Phi-3-medium-4k-instruct'],
    'GitHub Models - Llama': ['Meta-Llama-3.1-405B-Instruct', 'Meta-Llama-3.1-70B-Instruct', 'Meta-Llama-3.1-8B-Instruct', 'Meta-Llama-3-70B-Instruct', 'Meta-Llama-3-8B-Instruct', 'Llama-3.2-90B-Vision-Instruct', 'Llama-3.2-11B-Vision-Instruct'],
    'GitHub Models - Mistral': ['Mistral-large', 'Mistral-large-2411', 'Mistral-large-2407', 'Mistral-Nemo', 'Mistral-small', 'Mistral-7B-Instruct-v0.3'],
    'GitHub Models - Cohere': ['Cohere-command-r', 'Cohere-command-r-plus', 'Cohere-command-r-08-2024'],
    'GitHub Models - AI21': ['AI21-Jamba-1.5-Large', 'AI21-Jamba-1.5-Mini', 'AI21-Jamba-Instruct'],
    'GitHub Models - NVIDIA': ['nvidia/Llama-3.1-Nemotron-70B-Instruct'],
    'Multimodal - Images': ['dall-e-3', 'dall-e-2', 'stable-diffusion-xl'],
    'Multimodal - Audio': ['whisper-1', 'whisper-large-v3', 'tts-1', 'tts-1-hd'],
    'Embeddings': ['text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002', 'text-embedding-004']
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;

    const userMessage = {
      role: 'user',
      content: input,
      files: attachedFiles,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: input,
          settings: settings,
          files: attachedFiles
        })
      });

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.response || data.error,
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString(),
        imageUrl: data.imageUrl, // For DALL-E responses
        audioUrl: data.audioUrl   // For TTS responses
      };

      setMessages(prev => [...prev, assistantMessage]);
      setAttachedFiles([]);
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setAttachedFiles(prev => [...prev, ...fileData]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearChat = () => {
    setMessages([]);
    setAttachedFiles([]);
  };

  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="chat-interface">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Chat</h2>
          <button onClick={clearChat} className="clear-btn" title="New Chat">
            ➕
          </button>
        </div>

        <div className="model-selector">
          <label>🤖 Model</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-dropdown"
          >
            {Object.entries(models).map(([category, modelList]) => (
              <optgroup key={category} label={category}>
                {modelList.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="sidebar-actions">
          <button onClick={() => setShowSettings(!showSettings)} className="action-btn">
            ⚙️ Settings
          </button>
          <button onClick={exportChat} className="action-btn">
            💾 Export
          </button>
        </div>

        {showSettings && (
          <div className="settings-panel">
            <h3>Settings</h3>
            
            <div className="setting-group">
              <label>Temperature: {settings.temperature}</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1" 
                value={settings.temperature}
                onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
              />
            </div>

            <div className="setting-group">
              <label>Max Tokens: {settings.maxTokens}</label>
              <input 
                type="range" 
                min="100" 
                max="8000" 
                step="100" 
                value={settings.maxTokens}
                onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
              />
            </div>

            <div className="setting-group">
              <label>System Prompt</label>
              <textarea 
                value={settings.systemPrompt}
                onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
                placeholder="You are a helpful assistant..."
                rows="4"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <h1>👋 Welcome to VibeAI</h1>
              <p>Start a conversation with any AI model</p>
              <div className="quick-prompts">
                <button onClick={() => setInput("Explain quantum computing in simple terms")}>
                  🔬 Explain Quantum Computing
                </button>
                <button onClick={() => setInput("Write a Python function for sorting")}>
                  💻 Code Example
                </button>
                <button onClick={() => setInput("Tell me a creative story")}>
                  🎨 Creative Story
                </button>
                <button onClick={() => setInput("Analyze pros and cons of AI")}>
                  📊 Analysis Task
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message message-${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚠️'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {msg.role === 'user' ? 'You' : msg.model || 'Assistant'}
                  </span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
                
                {msg.content && (
                  <div className="message-text">
                    {msg.content}
                  </div>
                )}

                {msg.imageUrl && (
                  <div className="message-image">
                    <img src={msg.imageUrl} alt="Generated" />
                    <a href={msg.imageUrl} download className="download-btn">
                      ⬇️ Download Image
                    </a>
                  </div>
                )}

                {msg.audioUrl && (
                  <div className="message-audio">
                    <audio controls src={msg.audioUrl} />
                  </div>
                )}

                {msg.files && msg.files.length > 0 && (
                  <div className="message-files">
                    {msg.files.map((file, i) => (
                      <div key={i} className="file-chip">
                        📎 {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message message-assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-container">
          {attachedFiles.length > 0 && (
            <div className="attached-files">
              {attachedFiles.map((file, index) => (
                <div key={index} className="file-preview">
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>❌</button>
                </div>
              ))}
            </div>
          )}

          <div className="chat-input-box">
            <button 
              className="attach-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              📎
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message VibeAI..."
              rows="1"
            />

            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!input.trim() && attachedFiles.length === 0}
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </div>
      </div>

      <PromptHelper onInsertPrompt={(prompt) => setInput(prompt)} />
    </div>
  );
};

export default ChatInterface;
