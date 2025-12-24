'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Blocks, 
  MessageSquare, 
  Palette, 
  Zap, 
  Search, 
  Rocket,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Check,
  Activity,
  Server,
  Globe,
  Cpu,
  Send,
  X,
  ChevronDown,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  File,
  Mic,
  StopCircle,
  Trash2,
  RotateCcw,
  Copy,
  User,
  Bot
} from 'lucide-react'

// Full Chat Component - Standalone
function FullChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('vibeai-4-mini')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // VibeAI Models - All branded as VibeAI
  const models = [
    { id: 'vibeai-4-mini', name: 'VibeAI 4.0 Mini', description: 'Fast & Efficient', icon: '⚡', apiModel: 'gpt-4o-mini' },
    { id: 'vibeai-4', name: 'VibeAI 4.0', description: 'Most Capable', icon: '🧠', apiModel: 'gpt-4o' },
    { id: 'vibeai-4-turbo', name: 'VibeAI 4.0 Turbo', description: 'Enhanced Speed', icon: '🚀', apiModel: 'gpt-4-turbo' },
    { id: 'vibeai-pro', name: 'VibeAI Pro', description: 'Premium Quality', icon: '👑', apiModel: 'claude-3-5-sonnet-20241022' },
    { id: 'vibeai-ultra', name: 'VibeAI Ultra', description: 'Maximum Power', icon: '💎', apiModel: 'claude-3-opus-20240229' },
    { id: 'vibeai-flash', name: 'VibeAI Flash', description: 'Lightning Fast', icon: '✨', apiModel: 'gemini-1.5-flash' },
    { id: 'vibeai-reasoning', name: 'VibeAI Reasoning', description: 'Deep Thinking', icon: '🔮', apiModel: 'o1-preview' },
    { id: 'vibeai-reasoning-mini', name: 'VibeAI Reasoning Mini', description: 'Quick Analysis', icon: '🎯', apiModel: 'o1-mini' }
  ]

  // Real Agents from the system
  const agents = [
    { 
      id: 'aura', 
      name: 'Aura', 
      description: 'General AI Assistant - Creative & Helpful',
      icon: '✨',
      color: '#8b5cf6',
      specialty: 'General tasks, writing, ideas'
    },
    { 
      id: 'cora', 
      name: 'Cora', 
      description: 'Code Expert - Programming & Development',
      icon: '💻',
      color: '#3b82f6',
      specialty: 'Coding, debugging, architecture'
    },
    { 
      id: 'lumi', 
      name: 'Lumi', 
      description: 'Research Specialist - Deep Analysis',
      icon: '🔍',
      color: '#10b981',
      specialty: 'Research, analysis, facts'
    },
    { 
      id: 'devra', 
      name: 'Devra', 
      description: 'DevOps & Deployment Expert',
      icon: '🚀',
      color: '#f97316',
      specialty: 'Deployment, CI/CD, infrastructure'
    }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files) => {
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const currentModel = models.find(m => m.id === selectedModel)
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      attachments: attachments.map(a => ({ name: a.name, type: a.type, preview: a.preview })),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([])
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          model: currentModel?.apiModel || 'gpt-4o-mini',
          agent: selectedAgent?.id || 'aura',
          stream: false,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Request failed')

      const data = await response.json()
      
      if (data.success && data.response) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          model: currentModel?.name,
          agent: selectedAgent?.name || 'Aura'
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ Connection error. Please make sure the backend is running on port 8005.\n\nError: ${error.message}`,
        timestamp: new Date(),
        error: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setAttachments([])
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
  }

  const currentModel = models.find(m => m.id === selectedModel)

  return (
    <>
      {/* Chat Trigger Button - Top Center */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          cursor: 'pointer',
          animation: 'slideDown 400ms ease-out'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '100px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(124, 58, 237, 0.1)',
          transition: 'all var(--transition-base)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            fontWeight: '500'
          }}>
            Ask VibeAI anything...
          </span>
          <div style={{
            padding: '0.25rem 0.5rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.6875rem',
            fontWeight: '600',
            color: 'var(--text-muted)'
          }}>
            ⌘K
          </div>
        </div>
      </div>

      {/* Full Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 1001
            }}
          />

          {/* Chat Window */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              height: '85vh',
              maxHeight: '700px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1002,
              animation: 'scaleIn 200ms ease-out'
            }}
          >
            {/* Drop Zone Overlay */}
            {isDragging && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(124, 58, 237, 0.1)',
                border: '2px dashed #7c3aed',
                borderRadius: 'var(--radius-2xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#7c3aed'
                }}>
                  <Paperclip size={48} style={{ marginBottom: '1rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>Drop files here</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Images, documents, code files</div>
                </div>
              </div>
            )}

            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Logo */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}>
                  <Sparkles size={20} color="white" />
                </div>

                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    VibeAI Assistant
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                    }} />
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    {currentModel?.name} {selectedAgent ? `• ${selectedAgent.name}` : '• Aura'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Model & Agent Selectors */}
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-secondary)',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              background: 'var(--bg-secondary)'
            }}>
              {/* Model Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowModelDropdown(!showModelDropdown)
                    setShowAgentDropdown(false)
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{currentModel?.icon}</span>
                  <span>{currentModel?.name}</span>
                  <ChevronDown size={14} style={{
                    transform: showModelDropdown ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 150ms'
                  }} />
                </button>

                {showModelDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    width: '280px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                    padding: '0.5rem',
                    zIndex: 20,
                    maxHeight: '320px',
                    overflowY: 'auto'
                  }}>
                    <div style={{
                      fontSize: '0.6875rem',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.5rem 0.75rem'
                    }}>
                      Select Model
                    </div>
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setShowModelDropdown(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: selectedModel === model.id ? 'var(--bg-tertiary)' : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>{model.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {model.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {model.description}
                          </div>
                        </div>
                        {selectedModel === model.id && (
                          <Check size={16} style={{ color: '#10b981' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Agent Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowAgentDropdown(!showAgentDropdown)
                    setShowModelDropdown(false)
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedAgent ? `${selectedAgent.color}15` : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedAgent ? selectedAgent.color + '40' : 'var(--border-primary)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    color: selectedAgent ? selectedAgent.color : 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>{selectedAgent?.icon || '✨'}</span>
                  <span>{selectedAgent?.name || 'Aura'}</span>
                  <ChevronDown size={14} style={{
                    transform: showAgentDropdown ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 150ms'
                  }} />
                </button>

                {showAgentDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    width: '300px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
                    padding: '0.5rem',
                    zIndex: 20
                  }}>
                    <div style={{
                      fontSize: '0.6875rem',
                      fontWeight: '600',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '0.5rem 0.75rem'
                    }}>
                      Select Agent
                    </div>
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)
                          setShowAgentDropdown(false)
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: selectedAgent?.id === agent.id ? `${agent.color}10` : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          background: `${agent.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.125rem',
                          flexShrink: 0
                        }}>
                          {agent.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)',
                            marginBottom: '0.125rem'
                          }}>
                            {agent.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            {agent.description}
                          </div>
                          <div style={{ 
                            fontSize: '0.6875rem', 
                            color: agent.color,
                            fontWeight: '500'
                          }}>
                            {agent.specialty}
                          </div>
                        </div>
                        {selectedAgent?.id === agent.id && (
                          <Check size={16} style={{ color: agent.color, flexShrink: 0 }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '2rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
                  }}>
                    <Sparkles size={40} color="white" />
                  </div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '0.75rem'
                  }}>
                    How can I help you?
                  </h2>
                  <p style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-tertiary)',
                    maxWidth: '400px',
                    marginBottom: '2rem'
                  }}>
                    Ask me anything about coding, get help with projects, or explore ideas together.
                  </p>

                  {/* Agent Quick Select */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    width: '100%',
                    maxWidth: '500px'
                  }}>
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        style={{
                          padding: '1rem',
                          background: selectedAgent?.id === agent.id ? `${agent.color}15` : 'var(--bg-tertiary)',
                          border: `1px solid ${selectedAgent?.id === agent.id ? agent.color + '40' : 'var(--border-secondary)'}`,
                          borderRadius: 'var(--radius-lg)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          marginBottom: '0.375rem'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>{agent.icon}</span>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: 'var(--text-primary)' 
                          }}>
                            {agent.name}
                          </span>
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--text-muted)' 
                        }}>
                          {agent.specialty}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        gap: '0.875rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: msg.role === 'user' 
                          ? 'var(--bg-tertiary)' 
                          : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {msg.role === 'user' ? (
                          <User size={18} style={{ color: 'var(--text-secondary)' }} />
                        ) : (
                          <Sparkles size={18} color="white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.375rem'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {msg.role === 'user' ? 'You' : (msg.agent || 'Aura')}
                          </span>
                          {msg.model && (
                            <span style={{
                              fontSize: '0.6875rem',
                              color: 'var(--text-muted)',
                              padding: '0.125rem 0.375rem',
                              background: 'var(--bg-tertiary)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {msg.model}
                            </span>
                          )}
                        </div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.75rem'
                          }}>
                            {msg.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.5rem',
                                  background: 'var(--bg-tertiary)',
                                  borderRadius: 'var(--radius-md)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                {att.preview ? (
                                  <img 
                                    src={att.preview} 
                                    alt={att.name}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      borderRadius: 'var(--radius-sm)'
                                    }}
                                  />
                                ) : (
                                  <>
                                    <File size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      {att.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Content */}
                        <div style={{
                          fontSize: '0.9375rem',
                          lineHeight: '1.7',
                          color: msg.error ? '#ef4444' : 'var(--text-primary)',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.content}
                        </div>

                        {/* Actions */}
                        {msg.role === 'assistant' && (
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginTop: '0.75rem'
                          }}>
                            <button
                              onClick={() => copyMessage(msg.content)}
                              style={{
                                padding: '0.375rem 0.625rem',
                                background: 'transparent',
                                border: '1px solid var(--border-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Copy size={12} />
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading */}
                  {isLoading && (
                    <div style={{
                      display: 'flex',
                      gap: '0.875rem',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Sparkles size={18} color="white" />
                      </div>
                      <div style={{
                        padding: '1rem',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Loader2 size={16} style={{ 
                          color: 'var(--text-muted)',
                          animation: 'spin 1s linear infinite' 
                        }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {selectedAgent?.name || 'Aura'} is thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid var(--border-secondary)',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                background: 'var(--bg-secondary)'
              }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      position: 'relative',
                      padding: '0.5rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {att.preview ? (
                      <img 
                        src={att.preview} 
                        alt={att.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      />
                    ) : (
                      <>
                        <File size={16} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.name}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.75rem',
                padding: '0.75rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)'
              }}>
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.md,.js,.jsx,.ts,.tsx,.py,.json,.csv"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Paperclip size={18} />
                </button>

                {/* Image Upload */}
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.multiple = true
                    input.onchange = (e) => handleFiles(Array.from(e.target.files))
                    input.click()
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ImageIcon size={18} />
                </button>

                {/* Text Input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={`Message ${selectedAgent?.name || 'Aura'}...`}
                  rows={1}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.9375rem',
                    color: 'var(--text-primary)',
                    resize: 'none',
                    minHeight: '24px',
                    maxHeight: '120px',
                    lineHeight: '1.5'
                  }}
                />

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: (input.trim() || attachments.length > 0) && !isLoading
                      ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)'
                      : 'var(--bg-card)',
                    border: 'none',
                    cursor: (input.trim() || attachments.length > 0) && !isLoading ? 'pointer' : 'default',
                    color: (input.trim() || attachments.length > 0) && !isLoading ? 'white' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>

              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                VibeAI can make mistakes. Verify important information.
              </div>
            </div>
          </div>

          {/* Spin Animation */}
          <style jsx global>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </>
  )
}

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('vibeai-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('vibeai-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const modules = [
    {
      id: 'builder',
      title: 'App Builder',
      description: 'Build complete apps in Flutter, React, Next.js & more with AI assistance',
      href: '/app-builder',
      icon: Blocks,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      features: ['8 Platforms', 'AI Generator', 'Full-Stack', 'Mobile + Web']
    },
    {
      id: 'chatgpt',
      title: 'VibeAI Chat',
      description: 'Multi-model AI chat with agents, web search & deep research capabilities',
      href: '/chatgpt',
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      features: ['250+ Models', 'Agent Mode', 'Web Search', 'Deep Research']
    },
    {
      id: 'studio',
      title: 'Code Studio',
      description: 'Advanced code editor with intelligent AI assistance and real-time suggestions',
      href: '/studio',
      icon: Palette,
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      features: ['AI Autocomplete', 'Refactoring', 'Bug Detection']
    },
    {
      id: 'generator',
      title: 'Project Generator',
      description: 'Generate complete full-stack projects with a single prompt',
      href: '/generator',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      features: ['React', 'Next.js', 'Python', 'Flutter']
    },
    {
      id: 'analyzer',
      title: 'Code Analyzer',
      description: 'Deep code analysis, optimization suggestions & security scanning',
      href: '/analyzer',
      icon: Search,
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      features: ['Error Detection', 'Performance', 'Security']
    },
    {
      id: 'deployer',
      title: 'Deployer',
      description: 'One-click deployment to any cloud platform with zero configuration',
      href: '/deployer',
      icon: Rocket,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
      features: ['Vercel', 'AWS', 'Docker', 'Kubernetes']
    }
  ]

  const stats = [
    { icon: Server, label: 'Backend API', status: 'Online', detail: ':8005', color: '#10b981' },
    { icon: Cpu, label: 'AI Models', status: 'Active', detail: '250+', color: '#8b5cf6' },
    { icon: Globe, label: 'Frontend', status: 'Running', detail: ':3000', color: '#3b82f6' }
  ]

  if (!mounted) return null

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Full Chat */}
      <FullChat />

      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--gradient-mesh)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Floating Orbs */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '10%',
        right: '5%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(var(--border-secondary) 1px, transparent 1px),
                          linear-gradient(90deg, var(--border-secondary) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.4,
        maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '1.5rem 2rem',
        paddingTop: '5rem',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Navigation */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          animation: 'slideDown 500ms ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)'
            }}>
              <Sparkles size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{
                fontSize: '1.375rem',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1.1
              }}>
                VibeAI
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '500',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                Platform
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                backdropFilter: 'var(--blur-md)',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)'
                e.currentTarget.style.borderColor = 'var(--border-primary)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header style={{
          textAlign: 'center',
          marginBottom: '4rem',
          animation: 'slideUp 600ms ease-out'
        }}>
        <h1 style={{
            fontSize: 'clamp(2.75rem, 7vw, 5rem)',
            fontWeight: '800',
            letterSpacing: '-0.04em',
            marginBottom: '1.25rem',
            lineHeight: '1.05'
          }}>
            <span style={{ color: 'var(--text-primary)' }}>Build Faster with</span>
            <br />
            <span className="gradient-text">VibeAI</span>
        </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            color: 'var(--text-tertiary)',
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.75',
            fontWeight: '400'
          }}>
            The complete platform for modern development. 
            From code generation to deployment — everything in one place.
        </p>

        <div style={{
          display: 'flex',
            gap: '1.5rem',
          justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            {['Multi-Model AI', 'Real-time Collaboration', 'Instant Deployment'].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={11} style={{ color: '#10b981' }} strokeWidth={3} />
        </div>
                <span style={{ fontWeight: '500' }}>{item}</span>
      </div>
            ))}
          </div>
        </header>

      {/* Modules Grid */}
        <section style={{
        display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1rem',
          marginBottom: '4rem'
        }}>
          {modules.map((module, index) => {
            const Icon = module.icon
            const isHovered = hoveredCard === module.id
            
            return (
          <Link
            key={module.id}
            href={module.href}
            onMouseEnter={() => setHoveredCard(module.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
                  display: 'block',
              textDecoration: 'none',
                  animation: `slideUp 500ms ease-out ${80 + index * 60}ms both`
                }}
              >
                <article style={{
                  position: 'relative',
                  padding: '1.5rem',
                  background: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  backdropFilter: 'var(--blur-md)',
                  border: '1px solid',
                  borderColor: isHovered ? 'var(--border-hover)' : 'var(--border-primary)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all var(--transition-base)',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '1.5rem',
                    right: '1.5rem',
                    height: '2px',
                    background: module.gradient,
                    opacity: isHovered ? 1 : 0.5,
                    transition: 'opacity var(--transition-base)',
                    borderRadius: '0 0 2px 2px'
                  }} />

                  <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '300px',
                    height: '200px',
                    background: module.gradient,
                    opacity: isHovered ? 0.08 : 0,
                    filter: 'blur(60px)',
                    transition: 'opacity var(--transition-slow)',
                    pointerEvents: 'none'
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: 'var(--radius-lg)',
                      background: module.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      transition: 'all var(--transition-base)',
                      transform: isHovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
                      boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.2)' : 'none'
                    }}>
                      <Icon size={26} color="white" strokeWidth={2} />
                    </div>

            <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.02em'
            }}>
              {module.title}
            </h2>

            <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-tertiary)',
                      lineHeight: '1.6',
                      marginBottom: '1.25rem'
            }}>
              {module.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
                      gap: '0.375rem',
                      marginBottom: '1.25rem'
            }}>
              {module.features.map((feature, idx) => (
                <span
                  key={idx}
                  style={{
                            padding: '0.3125rem 0.625rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-secondary)'
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
                      transition: 'color var(--transition-base)'
                    }}>
                      <span>Open Module</span>
                      <ArrowRight 
                        size={14} 
                        style={{
                          transition: 'transform var(--transition-base)',
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
                        }}
                      />
            </div>
      </div>
                </article>
              </Link>
            )
          })}
        </section>

        {/* Status Section */}
        <section style={{
          padding: '1.5rem',
          background: 'var(--bg-card)',
          backdropFilter: 'var(--blur-md)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-xl)',
          animation: 'slideUp 700ms ease-out'
        }}>
      <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <h3 style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              System Status
            </h3>
          </div>

        <div style={{
          display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem'
          }}>
            {stats.map((stat, index) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-secondary)'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <StatIcon size={18} style={{ color: stat.color }} />
          </div>
          <div>
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.125rem'
                    }}>
                      {stat.label}
          </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}>
                      <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: stat.color
                      }} />
                      {stat.status} {stat.detail}
          </div>
        </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '3rem',
          textAlign: 'center',
          padding: '1.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem'
        }}>
          <p style={{ fontWeight: '500' }}>Built with precision. Powered by AI.</p>
        </footer>
      </div>
    </main>
  )
}
