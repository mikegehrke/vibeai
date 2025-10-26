import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSend, FiPaperclip, FiSettings, FiTrash2, FiDownload, 
  FiCopy, FiEdit2, FiRefreshCw, FiThumbsUp, FiThumbsDown,
  FiMic, FiVolume2, FiStopCircle, FiCheck, FiPlus, FiSearch
} from 'react-icons/fi';
import './ChatInterfaceEnhanced.css';

const ChatInterfaceEnhanced = () => {
  // State Management
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: 'You are a helpful AI assistant.',
    voice: 'alloy', // for TTS
    streamResponses: true,
  });

  // All 88 available models
  const models = {
    'GPT-5 (12 models)': [
      'gpt-5',
      'gpt-5-preview', 
      'gpt-5-mini',
      'gpt-5-turbo',
      'gpt-5-0125',
      'gpt-5-1106',
      'gpt-5-vision',
      'gpt-5-32k',
      'gpt-5-128k',
      'gpt-5-base',
      'gpt-5-instruct',
      'gpt-5-code'
    ],
    'GPT-4 (13 models)': [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4o-2024-08-06',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-4-0613',
      'gpt-4-32k',
      'gpt-4-1106-preview',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-preview',
      'gpt-4-vision-preview'
    ],
    'O-Series (18 models)': [
      'o1',
      'o1-preview',
      'o1-mini',
      'o1-2024-12-17',
      'o3',
      'o3-mini',
      'o3-preview',
      'o4-mini',
      'chatgpt-4o-latest',
      'o1-pro',
      'o1-pro-mini',
      'o2-preview',
      'o2-mini',
      'o1-turbo',
      'o1-reasoning',
      'o1-code',
      'o1-analysis',
      'o1-creative'
    ],
    'Image Models (4 models)': [
      'dall-e-3',
      'dall-e-2',
      'dall-e-3-hd',
      'dall-e-mini'
    ],
    'Video Models (2 models)': [
      'sora-1.0',
      'sora-turbo'
    ],
    'Audio Models (14 models)': [
      'whisper-1',
      'whisper-large',
      'whisper-large-v3',
      'tts-1',
      'tts-1-hd',
      'tts-1-1106',
      'audio-preview',
      'gpt-4o-audio-preview',
      'gpt-4o-audio-preview-2024-10-01',
      'gpt-4o-audio-preview-2024-12-17',
      'whisper-large-v2',
      'tts-nova',
      'tts-shimmer',
      'audio-transcription'
    ],
    'Realtime Models (10 models)': [
      'gpt-4o-realtime-preview',
      'gpt-4o-realtime-preview-2024-10-01',
      'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4-realtime',
      'realtime-audio',
      'realtime-vision',
      'gpt-4-audio-realtime',
      'o1-realtime',
      'chatgpt-realtime',
      'multimodal-realtime'
    ],
    'Specialized (15 models)': [
      'text-embedding-3-large',
      'text-embedding-3-small',
      'text-embedding-ada-002',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-instruct',
      'babbage-002',
      'davinci-002',
      'text-moderation-latest',
      'text-moderation-stable',
      'omni-moderation-latest',
      'gpt-4-search',
      'gpt-4-browse',
      'code-interpreter'
    ]
  };

  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem('vibeai_conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    if (conversations.length > 0) {
      localStorage.setItem('vibeai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Helper Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateConversationTitle = (firstMessage) => {
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  // Conversation Management
  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      created: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setMessages([]);
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  const renameConversation = (id, newTitle) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, title: newTitle } : c
    ));
  };

  const loadConversation = (conv) => {
    setActiveConversation(conv.id);
    setMessages(conv.messages);
    setSelectedModel(conv.model);
  };

  const saveCurrentConversation = () => {
    if (activeConversation && messages.length > 0) {
      setConversations(prev => prev.map(c => 
        c.id === activeConversation 
          ? { ...c, messages, model: selectedModel, updated: new Date().toISOString() }
          : c
      ));
    }
  };

  // Message Actions
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const editMessage = (index, newContent) => {
    const updatedMessages = [...messages];
    updatedMessages[index] = { ...updatedMessages[index], content: newContent, edited: true };
    setMessages(updatedMessages);
  };

  const regenerateResponse = async (index) => {
    const userMessage = messages[index - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Remove the old response
    setMessages(prev => prev.slice(0, index));
    
    // Regenerate
    await sendMessage(userMessage.content, userMessage.files || []);
  };

  const likeMessage = (index) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], liked: !updated[index].liked, disliked: false };
    setMessages(updated);
  };

  const dislikeMessage = (index) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], disliked: !updated[index].disliked, liked: false };
    setMessages(updated);
  };

  // Voice Features
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('http://127.0.0.1:8005/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setInput(prev => prev + ' ' + data.text);
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('http://127.0.0.1:8005/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: settings.voice,
          model: 'tts-1'
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  // File Handling
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...fileData]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            url: e.target.result,
            isImage: true
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Main Send Function
  const sendMessage = async (messageText = input, files = attachedFiles) => {
    if (!messageText.trim() && files.length === 0) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      files: files,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    // Create conversation if needed
    if (!activeConversation) {
      const newConv = {
        id: Date.now(),
        title: generateConversationTitle(messageText),
        messages: newMessages,
        model: selectedModel,
        created: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv.id);
    }

    try {
      if (settings.streamResponses) {
        await handleStreamingResponse(messageText);
      } else {
        await handleNormalResponse(messageText);
      }
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
    saveCurrentConversation();
  };

  const handleNormalResponse = async (messageText) => {
    const response = await fetch('http://127.0.0.1:8005/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt: messageText,
        settings: settings,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();

    const assistantMessage = {
      role: 'assistant',
      content: data.response || data.error,
      model: selectedModel,
      timestamp: new Date().toLocaleTimeString(),
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      id: Date.now()
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleStreamingResponse = async (messageText) => {
    setIsStreaming(true);
    
    const assistantMessage = {
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now(),
      streaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Simulated streaming (replace with actual SSE implementation)
    const response = await fetch('http://127.0.0.1:8005/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt: messageText,
        settings: settings,
        stream: true
      })
    });

    const data = await response.json();
    
    // Update final message
    setMessages(prev => prev.map(m => 
      m.id === assistantMessage.id 
        ? { ...m, content: data.response, streaming: false }
        : m
    ));

    setIsStreaming(false);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    // TODO: Cancel fetch request
  };

  // Export Functions
  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
  };

  const exportAsMarkdown = () => {
    let markdown = `# Chat Export\\n\\n`;
    markdown += `**Model**: ${selectedModel}\\n`;
    markdown += `**Date**: ${new Date().toLocaleString()}\\n\\n`;
    markdown += `---\\n\\n`;

    messages.forEach(msg => {
      markdown += `### ${msg.role === 'user' ? 'You' : 'Assistant'} (${msg.timestamp})\\n\\n`;
      markdown += `${msg.content}\\n\\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.md`;
    a.click();
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-enhanced">
      {/* Sidebar with Conversations */}
      <div className="chat-sidebar-enhanced">
        <div className="sidebar-header-enhanced">
          <button onClick={createNewConversation} className="new-chat-btn">
            <FiPlus /> New Chat
          </button>
        </div>

        <div className="search-conversations">
          <FiSearch />
          <input 
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => loadConversation(conv)}
            >
              <div className="conv-title">{conv.title}</div>
              <div className="conv-actions">
                <button onClick={(e) => {
                  e.stopPropagation();
                  const newTitle = prompt('Rename conversation:', conv.title);
                  if (newTitle) renameConversation(conv.id, newTitle);
                }}>
                  <FiEdit2 />
                </button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Model Selector in Sidebar */}
        <div className="sidebar-model-selector">
          <label>🤖 Model</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
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

        <div className="sidebar-footer-actions">
          <button onClick={() => setShowSettings(!showSettings)}>
            <FiSettings /> Settings
          </button>
          <button onClick={exportChat}>
            <FiDownload /> Export JSON
          </button>
          <button onClick={exportAsMarkdown}>
            <FiDownload /> Export MD
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main-enhanced">
        {showSettings && (
          <div className="settings-overlay">
            <div className="settings-modal">
              <div className="settings-header">
                <h2>⚙️ Settings</h2>
                <button onClick={() => setShowSettings(false)}>✕</button>
              </div>

              <div className="settings-body">
                <div className="setting-item">
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

                <div className="setting-item">
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

                <div className="setting-item">
                  <label>System Prompt</label>
                  <textarea 
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="setting-item">
                  <label>TTS Voice</label>
                  <select 
                    value={settings.voice}
                    onChange={(e) => setSettings({...settings, voice: e.target.value})}
                  >
                    {voices.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.streamResponses}
                      onChange={(e) => setSettings({...settings, streamResponses: e.target.checked})}
                    />
                    Stream Responses
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages-enhanced">
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
            <div key={msg.id || index} className={`message-enhanced message-${msg.role}`}>
              <div className="message-avatar-enhanced">
                {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚠️'}
              </div>
              <div className="message-content-enhanced">
                <div className="message-header-enhanced">
                  <span className="message-sender-enhanced">
                    {msg.role === 'user' ? 'You' : msg.model || 'Assistant'}
                  </span>
                  <span className="message-time-enhanced">
                    {msg.timestamp}
                    {msg.edited && <span className="edited-badge">edited</span>}
                  </span>
                </div>
                
                {msg.content && (
                  <div className="message-text-enhanced">
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {msg.content}
                    </pre>
                  </div>
                )}

                {msg.streaming && (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {msg.imageUrl && (
                  <div className="message-image">
                    <img src={msg.imageUrl} alt="Generated" />
                    <a href={msg.imageUrl} download className="download-btn">
                      <FiDownload /> Download
                    </a>
                  </div>
                )}

                {msg.files && msg.files.length > 0 && (
                  <div className="message-files">
                    {msg.files.map((file, i) => (
                      <div key={i} className="file-chip">
                        {file.isImage ? (
                          <img src={file.url} alt={file.name} className="file-thumbnail" />
                        ) : (
                          '📎'
                        )}
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Actions */}
                {msg.role === 'assistant' && !msg.streaming && (
                  <div className="message-actions">
                    <button onClick={() => copyMessage(msg.content)} title="Copy">
                      <FiCopy />
                    </button>
                    <button onClick={() => speakText(msg.content)} title="Read aloud">
                      <FiVolume2 />
                    </button>
                    <button onClick={() => likeMessage(index)} title="Like" className={msg.liked ? 'active' : ''}>
                      <FiThumbsUp />
                    </button>
                    <button onClick={() => dislikeMessage(index)} title="Dislike" className={msg.disliked ? 'active' : ''}>
                      <FiThumbsDown />
                    </button>
                    <button onClick={() => regenerateResponse(index)} title="Regenerate">
                      <FiRefreshCw />
                    </button>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="message-actions">
                    <button onClick={() => copyMessage(msg.content)} title="Copy">
                      <FiCopy />
                    </button>
                    <button onClick={() => deleteMessage(index)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <div className="message-enhanced message-assistant">
              <div className="message-avatar-enhanced">🤖</div>
              <div className="message-content-enhanced">
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
        <div className="chat-input-enhanced">
          {attachedFiles.length > 0 && (
            <div className="attached-files-enhanced">
              {attachedFiles.map((file, index) => (
                <div key={index} className="file-preview-enhanced">
                  {file.isImage ? (
                    <img src={file.url} alt={file.name} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="input-box-enhanced">
            <button 
              className="input-action-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <FiPaperclip />
            </button>

            <button 
              className="input-action-btn" 
              onClick={() => imageInputRef.current?.click()}
              title="Upload image"
            >
              📷
            </button>

            <button 
              className={`input-action-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <FiStopCircle /> : <FiMic />}
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
            />

            <input 
              type="file" 
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message VibeAI..."
              rows="1"
            />

            {isStreaming ? (
              <button 
                className="stop-btn" 
                onClick={stopStreaming}
              >
                <FiStopCircle /> Stop
              </button>
            ) : (
              <button 
                className="send-btn-enhanced" 
                onClick={() => sendMessage()}
                disabled={!input.trim() && attachedFiles.length === 0}
              >
                {isLoading ? '⏳' : <FiSend />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceEnhanced;
