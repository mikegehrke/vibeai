import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

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

  // All available models
  const models = {
    'GPT-5': ['gpt-5', 'gpt-5-preview', 'gpt-5-mini'],
    'GPT-4': ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'],
    'O-Series': ['o1', 'o1-preview', 'o1-mini', 'o3-mini'],
    'Images': ['dall-e-3', 'dall-e-2'],
    'Audio': ['whisper-1', 'tts-1', 'tts-1-hd']
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
    </div>
  );
};

export default ChatInterface;
