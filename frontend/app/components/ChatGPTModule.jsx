'use client'
import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiChevronDown, FiMenu, FiMessageSquare, FiPlus, FiSearch, FiSend, FiSettings, FiTrash2 } from 'react-icons/fi'

export default function ChatGPTModule() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [agentMode, setAgentMode] = useState('auto')
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('de')
  const [showAllModels, setShowAllModels] = useState(true)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const messagesEndRef = useRef(null)

  // Agenten EXAKT wie ChatGPT
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
    }
  ]

  // ALLE Modelle (wird vom Backend geladen)
  const defaultModels = [
    // GPT-5 Serie
    { id: 'gpt-5.1-instant', name: 'ChatGPT 5.1 Instant', category: 'ChatGPT', icon: '⚡', description: 'Sofortige Antworten' },
    { id: 'gpt-5.1-thinking', name: 'ChatGPT 5.1 Thinking', category: 'ChatGPT', icon: '🧠', description: 'Tieferes Denken' },
    { id: 'gpt-5.1-thinking-mini', name: 'ChatGPT 5 Thinking mini', category: 'ChatGPT', icon: '🎯', description: 'Kompakt' },

    // O-Serie
    { id: 'o3', name: 'o3', category: 'O-Serie', icon: '🔮', description: 'Neuestes Reasoning' },
    { id: 'o4-mini', name: 'o4-mini', category: 'O-Serie', icon: '⚡', description: 'Schnell' },

    // GPT-4
    { id: 'gpt-4o', name: 'GPT-4o', category: 'GPT-4', icon: '🧠', description: 'Multimodal' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'GPT-4', icon: '💨', description: 'Effizient' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'GPT-4', icon: '🚀', description: 'Erweitert' },

    // Claude
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', category: 'Claude', icon: '🤖', description: 'Neueste Version' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', category: 'Claude', icon: '👑', description: 'Höchste Qualität' },

    // Gemini
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', category: 'Gemini', icon: '✨', description: 'Neu' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', category: 'Gemini', icon: '💫', description: 'Pro' }
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/models/available')
      const data = await response.json()

      if (data.models) {
        const models = []
        Object.entries(data.models).forEach(([provider, providerModels]) => {
          providerModels.forEach(model => {
            models.push({
              id: model.id,
              name: model.name,
              category: provider,
              description: `${provider} Modell`,
              icon: getProviderIcon(provider)
            })
          })
        })
        setAvailableModels([...defaultModels, ...models])
      }
    } catch (error) {
      setAvailableModels(defaultModels)
    }
  }

  const getProviderIcon = (provider) => {
    const icons = {
      'OpenAI': '🧠', 'Anthropic': '🤖', 'Google': '✨',
      'GitHub': '💻', 'Ollama': '🦙', 'Perplexity': '🔍'
    }
    return icons[provider] || '🤖'
  }

  const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    setChatHistory(history)
  }

  const saveChatHistory = (chatId, title, messages) => {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    const chatData = {
      id: chatId,
      title: title,
      messages: messages,
      timestamp: new Date().toISOString(),
      model: selectedModel,
      agent: selectedAgent
    }

    const existingIndex = history.findIndex(c => c.id === chatId)
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
    if (!input.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chatgpt/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          model: selectedModel,
          agent: selectedAgent?.id,
          webSearch: webSearchEnabled,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Chat failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        model: selectedModel,
        agent: selectedAgent?.name
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                assistantMessage.content += data.content
                setMessages([...newMessages, { ...assistantMessage }])
              }
              if (data.done) break
            } catch (e) { }
          }
        }
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      const chatId = currentChatId || Date.now().toString()
      setCurrentChatId(chatId)
      const title = newMessages[0]?.content.slice(0, 50) || 'Neuer Chat'
      saveChatHistory(chatId, title, finalMessages)

    } catch (error) {
      console.error('Chat error:', error)
      setMessages([...newMessages, {
        role: 'assistant',
        content: '❌ Fehler beim Senden. Bitte versuche es erneut.',
        timestamp: new Date().toISOString(),
        error: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setSelectedAgent(null)
    setWebSearchEnabled(false)
  }

  const loadChat = (chat) => {
    setMessages(chat.messages || [])
    setCurrentChatId(chat.id)
    setSelectedModel(chat.model || 'gpt-4o')
    setSelectedAgent(agents.find(a => a.id === chat.agent?.id) || null)
  }

  const deleteChat = (chatId) => {
    const history = chatHistory.filter(c => c.id !== chatId)
    localStorage.setItem('chatHistory', JSON.stringify(history))
    setChatHistory(history)
    if (currentChatId === chatId) startNewChat()
  }

  const modelsByCategory = {}
  const displayModels = availableModels.length > 0 ? availableModels : defaultModels
  displayModels.forEach(model => {
    if (!modelsByCategory[model.category]) modelsByCategory[model.category] = []
    modelsByCategory[model.category].push(model)
  })

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#212121', color: '#ececec', fontFamily: 'Söhne, -apple-system, sans-serif' }}>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: '260px', background: '#171717', borderRight: '1px solid #2f2f2f', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 8px' }}>
            <button onClick={startNewChat} style={{
              width: '100%', padding: '10px 12px', background: 'transparent', border: '1px solid #4d4d4d',
              borderRadius: '8px', color: '#ececec', display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s'
            }}
              onMouseOver={e => e.target.style.background = '#2f2f2f'}
              onMouseOut={e => e.target.style.background = 'transparent'}>
              <FiPlus size={16} /> Neuer Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
            <div style={{ fontSize: '11px', color: '#8e8e8e', padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase' }}>Heute</div>
            {chatHistory.map((chat) => (
              <div key={chat.id} onClick={() => loadChat(chat)} style={{
                padding: '10px 12px', marginBottom: '4px', borderRadius: '8px', cursor: 'pointer',
                background: currentChatId === chat.id ? '#2f2f2f' : 'transparent', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between'
              }}
                onMouseOver={e => { if (currentChatId !== chat.id) e.currentTarget.style.background = '#2a2a2a' }}
                onMouseOut={e => { if (currentChatId !== chat.id) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                  <FiMessageSquare size={14} color="#8e8e8e" />
                  <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                  style={{ background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', padding: '4px' }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #2f2f2f', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
              onMouseOver={e => e.currentTarget.style.background = '#2f2f2f'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>MG</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Mike Gehrke</div>
                <div style={{ fontSize: '12px', color: '#8e8e8e' }}>Plus</div>
              </div>
              <FiChevronDown size={16} color="#8e8e8e" />
            </div>
          </div>
        </div>
      )}

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <div style={{ height: '60px', borderBottom: '1px solid #2f2f2f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#ececec', cursor: 'pointer', padding: '8px' }}>
              <FiMenu size={20} />
            </button>

            {/* Model Selector */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowModelDropdown(!showModelDropdown)} style={{
                padding: '6px 12px', background: '#2f2f2f', border: '1px solid #4d4d4d', borderRadius: '8px',
                color: '#ececec', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: 500
              }}>
                <span>{displayModels.find(m => m.id === selectedModel)?.icon || '🧠'}</span>
                <span>{displayModels.find(m => m.id === selectedModel)?.name || 'ChatGPT'}</span>
                <FiChevronDown size={14} />
              </button>

              {showModelDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#2a2a2a',
                  border: '1px solid #4d4d4d', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  width: '320px', maxHeight: '500px', overflowY: 'auto', zIndex: 1000, padding: '8px'
                }}>
                  {Object.entries(modelsByCategory).map(([category, models]) => (
                    <div key={category} style={{ marginBottom: '12px' }}>
                      <div style={{ padding: '8px 12px', fontSize: '11px', color: '#8e8e8e', fontWeight: 600, textTransform: 'uppercase' }}>{category}</div>
                      {models.map(model => (
                        <div key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false) }} style={{
                          padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                          background: selectedModel === model.id ? '#3d3d3d' : 'transparent', marginBottom: '2px'
                        }}
                          onMouseOver={e => { if (selectedModel !== model.id) e.currentTarget.style.background = '#333' }}
                          onMouseOut={e => { if (selectedModel !== model.id) e.currentTarget.style.background = 'transparent' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px' }}>{model.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 500 }}>{model.name}</div>
                              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{model.description}</div>
                            </div>
                            {selectedModel === model.id && <FiCheck size={16} color="#10a37f" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: '#8e8e8e', cursor: 'pointer', padding: '8px' }}>
            <FiSettings size={20} />
          </button>
        </div>

        {/* MESSAGES */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '60px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '32px', textAlign: 'center' }}>Wie kann ich dir helfen?</h1>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {agents.map(agent => (
                    <div key={agent.id} onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)} style={{
                      padding: '16px', background: selectedAgent?.id === agent.id ? agent.color + '20' : '#2a2a2a',
                      border: `2px solid ${selectedAgent?.id === agent.id ? agent.color : 'transparent'}`,
                      borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseOver={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = '#333' }}
                      onMouseOut={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = '#2a2a2a' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{agent.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{agent.name}</div>
                      <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{agent.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', background: '#2a2a2a', borderRadius: '8px' }}>
                  <input type="checkbox" checked={webSearchEnabled} onChange={(e) => setWebSearchEnabled(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  <FiSearch size={16} />
                  <span style={{ fontSize: '14px' }}>Web-Suche</span>
                </label>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{
                padding: '24px 0', maxWidth: '800px', margin: '0 auto',
                borderBottom: idx < messages.length - 1 ? '1px solid #2f2f2f' : 'none'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: msg.role === 'user' ? '#10a37f' : '#5436DA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontWeight: 600, fontSize: '14px'
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

        {/* INPUT */}
        <div style={{ borderTop: '1px solid #2f2f2f', padding: '20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {selectedAgent && (
              <div style={{
                marginBottom: '12px', padding: '8px 12px', background: selectedAgent.color + '20',
                border: `1px solid ${selectedAgent.color}`, borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'
              }}>
                <span>{selectedAgent.icon}</span>
                <span><strong>{selectedAgent.name}</strong> aktiviert</span>
                <button onClick={() => setSelectedAgent(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ececec', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={selectedAgent ? `Frage an ${selectedAgent.name}...` : 'Stelle irgendeine Frage'}
                disabled={isLoading}
                style={{
                  width: '100%', minHeight: '56px', maxHeight: '200px', padding: '16px 52px 16px 16px',
                  background: '#2f2f2f', border: '1px solid #4d4d4d', borderRadius: '12px', color: '#ececec',
                  fontSize: '15px', resize: 'none', outline: 'none', fontFamily: 'inherit'
                }}
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} style={{
                position: 'absolute', right: '12px', bottom: '12px', width: '32px', height: '32px',
                borderRadius: '8px', background: input.trim() && !isLoading ? '#ececec' : '#4d4d4d',
                border: 'none', color: '#212121', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FiSend size={16} />
              </button>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8e8e8e', textAlign: 'center' }}>
              ChatGPT kann Fehler machen. Überprüfe wichtige Informationen.
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }} onClick={() => setShowSettings(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#2a2a2a', borderRadius: '16px', width: '90%', maxWidth: '600px',
            maxHeight: '80vh', overflow: 'auto', border: '1px solid #4d4d4d'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #4d4d4d', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Einstellungen</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#ececec', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Allgemein</h3>
              <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div style={{ fontWeight: 500 }}>Sprache</div><div style={{ fontSize: '13px', color: '#8e8e8e' }}>German</div></div>
                  <FiChevronDown size={16} />
                </div>
              </div>

              <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontWeight: 500 }}>Weitere Modelle anzeigen</div><div style={{ fontSize: '13px', color: '#8e8e8e' }}>Experimentelle Modelle</div></div>
                  <div onClick={() => setShowAllModels(!showAllModels)} style={{
                    width: '48px', height: '28px', background: showAllModels ? '#10a37f' : '#4d4d4d',
                    borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', [showAllModels ? 'right' : 'left']: '3px', top: '3px',
                      width: '22px', height: '22px', background: '#fff', borderRadius: '50%', transition: 'all 0.2s'
                    }} />
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Memory</h3>
              <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>Chat-Verlauf speichern</div>
                <div style={{ fontSize: '13px', color: '#8e8e8e', marginBottom: '12px' }}>Aktiviere Memory um Konversationen zu speichern</div>
                <div onClick={() => setMemoryEnabled(!memoryEnabled)} style={{
                  width: '48px', height: '28px', background: memoryEnabled ? '#10a37f' : '#4d4d4d',
                  borderRadius: '14px', position: 'relative', cursor: 'pointer'
                }}>
                  <div style={{
                    position: 'absolute', [memoryEnabled ? 'right' : 'left']: '3px', top: '3px',
                    width: '22px', height: '22px', background: '#fff', borderRadius: '50%'
                  }} />
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Daten & Privatsphäre</h3>
              <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                <div style={{ fontWeight: 500 }}>Daten exportieren</div>
                <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Alle Chat-Daten herunterladen</div>
              </div>
              <div style={{ padding: '16px', background: '#212121', borderRadius: '8px', cursor: 'pointer' }}>
                <div style={{ fontWeight: 500, color: '#ff4444' }}>Alle Chats löschen</div>
                <div style={{ fontSize: '13px', color: '#8e8e8e' }}>Unwiderruflich löschen</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
