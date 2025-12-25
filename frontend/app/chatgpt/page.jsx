'use client'
import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiMenu, FiMessageSquare, FiPlus, FiSearch, FiSend, FiSettings, FiTrash2 } from 'react-icons/fi'
import { useSSEChat } from '@/lib/useSSEChat'

export default function ChatGPTPage() {
  const { messages: kernelMessages, running, sendMessage: sendKernelMessage, stop } = useSSEChat()
  const [chatMessages, setChatMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const messagesEndRef = useRef(null)

  // Convert kernel events to chat messages
  useEffect(() => {
    if (kernelMessages.length > 0) {
      const lastEvent = kernelMessages[kernelMessages.length - 1]
      
      // Bei done Event: Sammle alle message und step Events
      if (lastEvent.type === 'done') {
        // Sammle message Events (Dialog)
        const messageEvents = kernelMessages
          .filter(e => e.type === 'message' && e.message)
          .map(e => e.message)
          .join('')
        
        // Sammle step Events (Job-Modus)
        const stepEvents = kernelMessages
          .filter(e => e.type === 'step' && e.message)
          .map(e => e.message)
          .join('\n\n')
        
        const content = messageEvents || stepEvents || 'Aufgabe abgeschlossen.'
        
        if (content) {
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString(),
            model: selectedModel,
            agent: selectedAgent?.name
          }])
        }
      }
    }
  }, [kernelMessages, selectedModel, selectedAgent])

  // Agenten wie in ChatGPT
  const agents = [
    {
      id: 'deep-research',
      name: 'Deep Research',
      icon: '🔍',
      description: 'Ausführliche Recherche mit Quellenangaben',
      color: '#10a37f'
    },
    {
      id: 'code-assistant',
      name: 'Code Assistent',
      icon: '💻',
      description: 'Programmierung und Debugging',
      color: '#0066ff'
    },
    {
      id: 'image-generator',
      name: 'Bild erstellen',
      icon: '🎨',
      description: 'DALL-E 3 Bildgenerierung',
      color: '#ff6b6b'
    },
    {
      id: 'shopping',
      name: 'Shopping-Assistent',
      icon: '🛍️',
      description: 'Produktvergleiche und Empfehlungen',
      color: '#ffa500'
    },
    {
      id: 'data-analyst',
      name: 'Datenanalyst',
      icon: '📊',
      description: 'Datenanalyse und Visualisierung',
      color: '#9b59b6'
    },
    {
      id: 'custom',
      name: 'Neuer Agent',
      icon: '➕',
      description: 'Eigenen Agenten erstellen',
      color: '#95a5a6'
    }
  ]

  // ALLE Modelle (wird vom Backend geladen)
  const defaultModels = [
    // GPT-4 Serie (Verfügbar)
    { id: 'gpt-4o', name: 'GPT-4o', category: 'GPT-4', icon: '🧠', description: 'Neuestes Multimodal Modell' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'GPT-4', icon: '⚡', description: 'Schnell & Günstig' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'GPT-4', icon: '🚀', description: 'Erweiterte Fähigkeiten' },
    { id: 'gpt-4', name: 'GPT-4', category: 'GPT-4', icon: '💎', description: 'Original GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'GPT-3.5', icon: '💨', description: 'Schnell' },

    // O-Serie (Reasoning)
    { id: 'o1-preview', name: 'O1 Preview', category: 'O-Serie', icon: '🔮', description: 'Reasoning Modell' },
    { id: 'o1-mini', name: 'O1 Mini', category: 'O-Serie', icon: '🎯', description: 'Kompakt' },

    // Claude (Anthropic)
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'Claude', icon: '🤖', description: 'Neueste Version' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'Claude', icon: '👑', description: 'Höchste Qualität' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', category: 'Claude', icon: '🎭', description: 'Ausgewogen' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', category: 'Claude', icon: '🌸', description: 'Schnell' },

    // Gemini (Google)
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'Gemini', icon: '✨', description: 'Pro-Version' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', category: 'Gemini', icon: '⚡', description: 'Blitzschnell' }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  useEffect(() => {
    // Lade Chat History
    loadChatHistory()
    // Lade verfügbare Modelle
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:8005/api/models')
      const data = await response.json()

      if (Array.isArray(data)) {
        const models = data.map(model => ({
          id: model.id,
          name: model.name,
          category: model.provider,
          description: model.type === 'reasoning' ? 'Reasoning Model' : 'Chat Model',
          icon: getProviderIcon(model.provider)
        }))
        setAvailableModels(models)
      }
    } catch (error) {
      console.error('Error loading models:', error)
      console.error('Using default models instead')
      setAvailableModels(defaultModels)
    }
  }

  const getProviderIcon = (provider) => {
    const icons = {
      'OpenAI': '🧠',
      'Anthropic': '🤖',
      'Google': '✨',
      'GitHub': '💻',
      'Ollama': '🦙',
      'Perplexity': '🔍',
      'Mistral': '🌪️',
      'Cohere': '📚'
    }
    return icons[provider] || '🤖'
  }

  const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    setChatHistory(history)
  }

  const saveChatHistory = (chatId, title, messages) => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    const existingIndex = history.findIndex(c => c.id === chatId)

    const chatData = {
      id: chatId,
      title: title,
      messages: messages,
      timestamp: new Date().toISOString(),
      model: selectedModel,
      agent: selectedAgent
    }

    if (existingIndex >= 0) {
      history[existingIndex] = chatData
    } else {
      history.unshift(chatData)
    }

    localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 50)))
    setChatHistory(history.slice(0, 50))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!input.trim() || running) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    const task = input
    setInput('')
    sendKernelMessage(task)
  }

  const startNewChat = () => {
    setChatMessages([])
    setCurrentChatId(null)
    setSelectedAgent(null)
    setWebSearchEnabled(false)
  }

  const loadChat = (chat) => {
    setChatMessages(chat.messages || [])
    setCurrentChatId(chat.id)
    setSelectedModel(chat.model || 'gpt-4o')
    setSelectedAgent(agents.find(a => a.id === chat.agent) || null)
  }

  const deleteChat = (chatId) => {
    const history = chatHistory.filter(c => c.id !== chatId)
    localStorage.setItem('chatHistory', JSON.stringify(history))
    setChatHistory(history)
    if (currentChatId === chatId) {
      startNewChat()
    }
  }

  const modelsByCategory = {}
  const displayModels = availableModels.length > 0 ? availableModels : defaultModels
  displayModels.forEach(model => {
    if (!modelsByCategory[model.category]) {
      modelsByCategory[model.category] = []
    }
    modelsByCategory[model.category].push(model)
  })

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#212121', color: '#ececec', fontFamily: 'Söhne, system-ui, sans-serif' }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: '260px', background: '#171717', borderRight: '1px solid #2f2f2f', display: 'flex', flexDirection: 'column' }}>
          {/* Neuer Chat Button */}
          <div style={{ padding: '12px 8px' }}>
            <button
              onClick={startNewChat}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'transparent',
                border: '1px solid #4d4d4d',
                borderRadius: '8px',
                color: '#ececec',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.target.style.background = '#2f2f2f'}
              onMouseOut={e => e.target.style.background = 'transparent'}
            >
              <FiPlus size={16} />
              Neuer Chat
            </button>
          </div>

          {/* Chat History */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            <div style={{ fontSize: '11px', color: '#8e8e8e', padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Heute
            </div>
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => loadChat(chat)}
                style={{
                  padding: '10px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: currentChatId === chat.id ? '#2f2f2f' : 'transparent',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  group: 'chat-item'
                }}
                onMouseOver={e => { if (currentChatId !== chat.id) e.currentTarget.style.background = '#2a2a2a' }}
                onMouseOut={e => { if (currentChatId !== chat.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                  <FiMessageSquare size={14} style={{ color: '#8e8e8e', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                  style={{ opacity: 0, background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', padding: '4px' }}
                  onMouseOver={e => e.currentTarget.style.opacity = 1}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div style={{ borderTop: '1px solid #2f2f2f', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.background = '#2f2f2f'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                MG
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Mike Gehrke</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Plus</div>
              </div>
              <FiChevronDown size={16} color="#8e8e8e" />
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ height: '60px', borderBottom: '1px solid #2f2f2f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#ececec', cursor: 'pointer', padding: '8px' }}>
                <FiMenu size={20} />
              </button>
            )}
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#ececec', cursor: 'pointer', padding: '8px' }}>
                <FiMenu size={20} />
              </button>
            )}

            {/* Model Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                style={{
                  padding: '6px 12px',
                  background: '#2f2f2f',
                  border: '1px solid #4d4d4d',
                  borderRadius: '8px',
                  color: '#ececec',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                <span>{displayModels.find(m => m.id === selectedModel)?.icon || '🧠'}</span>
                <span>{displayModels.find(m => m.id === selectedModel)?.name || 'VibeAI'}</span>
                <FiChevronDown size={14} />
              </button>

              {showModelDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  background: '#2a2a2a',
                  border: '1px solid #4d4d4d',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  width: '320px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  padding: '8px'
                }}>
                  {Object.entries(modelsByCategory).map(([category, models]) => (
                    <div key={category} style={{ marginBottom: '12px' }}>
                      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#8e8e8e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {category}
                      </div>
                      {models.map(model => (
                        <div
                          key={model.id}
                          onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false) }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: selectedModel === model.id ? '#3d3d3d' : 'transparent',
                            marginBottom: '2px'
                          }}
                          onMouseOver={e => { if (selectedModel !== model.id) e.currentTarget.style.background = '#333' }}
                          onMouseOut={e => { if (selectedModel !== model.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>{model.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{model.name}</div>
                              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{model.description}</div>
                            </div>
                            {selectedModel === model.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10a37f' }} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', padding: '8px' }}>
              <FiSettings size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {chatMessages.length === 0 ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '60px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '32px', textAlign: 'center' }}>
                Wie kann ich dir helfen?
              </h1>

              {/* Agent Selector */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                      style={{
                        padding: '16px',
                        background: selectedAgent?.id === agent.id ? agent.color + '20' : '#2a2a2a',
                        border: `2px solid ${selectedAgent?.id === agent.id ? agent.color : 'transparent'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = '#333' }}
                      onMouseOut={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = '#2a2a2a' }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{agent.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{agent.name}</div>
                      <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{agent.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Web Search Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', background: '#2a2a2a', borderRadius: '8px' }}>
                  <input
                    type="checkbox"
                    checked={webSearchEnabled}
                    onChange={(e) => setWebSearchEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <FiSearch size={16} />
                  <span style={{ fontSize: '14px' }}>Web-Suche aktivieren</span>
                </label>
              </div>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} style={{
                padding: '24px 0',
                maxWidth: '800px',
                margin: '0 auto',
                borderBottom: idx < chatMessages.length - 1 ? '1px solid #2f2f2f' : 'none'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: msg.role === 'user' ? '#10a37f' : '#5436DA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {msg.role === 'user' ? 'MG' : (msg.agent ? agents.find(a => a.name === msg.agent)?.icon : '🤖')}
                  </div>
                  <div style={{ flex: 1 }}>
                    {msg.role === 'assistant' && msg.agent && (
                      <div style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '8px' }}>
                        {msg.agent} • {msg.model}
                      </div>
                    )}
                    <div style={{ fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '1px solid #2f2f2f', padding: '20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {selectedAgent && (
              <div style={{ marginBottom: '12px', padding: '8px 12px', background: selectedAgent.color + '20', border: `1px solid ${selectedAgent.color}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span>{selectedAgent.icon}</span>
                <span><strong>{selectedAgent.name}</strong> aktiviert</span>
                <button onClick={() => setSelectedAgent(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ececec', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={selectedAgent ? `Frage an ${selectedAgent.name}...` : 'Stelle irgendeine Frage'}
                disabled={running}
                style={{
                  width: '100%',
                  minHeight: '56px',
                  maxHeight: '200px',
                  padding: '16px 52px 16px 16px',
                  background: '#2f2f2f',
                  border: '1px solid #4d4d4d',
                  borderRadius: '12px',
                  color: '#ececec',
                  fontSize: '15px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || running}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: input.trim() && !running ? '#ececec' : '#4d4d4d',
                  border: 'none',
                  color: '#212121',
                  cursor: input.trim() && !running ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <FiSend size={16} />
              </button>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8e8e8e', textAlign: 'center' }}>
              VibeAI kann Fehler machen. Überprüfe wichtige Informationen.
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}
          onClick={() => setShowSettings(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#2a2a2a',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid #4d4d4d'
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #4d4d4d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Einstellungen</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#ececec', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Allgemein</h3>
                <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>Sprache</div>
                      <div style={{ fontSize: '13px', color: '#8e8e8e' }}>German</div>
                    </div>
                    <FiChevronDown size={16} />
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>Weitere Modelle anzeigen</div>
                      <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Experimentelle Modelle einblenden</div>
                    </div>
                    <div style={{ width: '48px', height: '28px', background: '#10a37f', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', right: '3px', top: '3px', width: '22px', height: '22px', background: '#fff', borderRadius: '50%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Memory</h3>
                <div style={{ padding: '16px', background: '#212121', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>Chat-Verlauf speichern</div>
                  <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '12px' }}>
                    Aktiviere Memory um Konversationen zu speichern und zu durchsuchen
                  </div>
                  <button style={{
                    padding: '8px 16px',
                    background: '#4d4d4d',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ececec',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Memory aktivieren
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Daten & Privatsphäre</h3>
                <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Daten exportieren</div>
                  <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Alle Chat-Daten herunterladen</div>
                </div>
                <div style={{ padding: '16px', background: '#212121', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px', color: '#ff4444' }}>Alle Chats löschen</div>
                  <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Gesamten Verlauf unwiderruflich löschen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
