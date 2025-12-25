'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSSEChat } from '@/lib/useSSEChat'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [availableModels, setAvailableModels] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)
  const messagesEndRef = useRef(null)
  
  // Kernel SSE Hook
  const { messages: kernelMessages, running, sendMessage: sendKernelMessage } = useSSEChat()
  const [chatMessages, setChatMessages] = useState([])

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
            timestamp: new Date().toISOString()
          }])
        }
      }
    }
  }, [kernelMessages])

  // Lade verfügbare Modelle vom Backend
  useEffect(() => {
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/home/models')
      const data = await response.json()

      if (data.success && data.models) {
        // Konvertiere zu flacher Liste
        const allModels = data.models.map(model => ({
          id: model.id,
          name: model.name,
          provider: model.provider,
          icon: model.icon || getProviderIcon(model.provider)
        }))

        setAvailableModels(allModels)

      // Setze erstes verfügbares Modell als default
      if (allModels.length > 0) {
        setSelectedModel(allModels[0].id)
      }
    } catch (error) {
      console.error('Error loading models:', error)
      // Fallback zu statischen Modellen
      setAvailableModels([
        { id: 'gpt-4o', name: 'GPT-4o', icon: '🧠', provider: 'OpenAI' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5', icon: '🤖', provider: 'Anthropic' },
      ])
    } finally {
      setLoadingModels(false)
    }
  }

  const getProviderIcon = (provider) => {
    const icons = {
      'OpenAI': '🧠',
      'Anthropic': '🤖',
      'Google': '✨',
      'GitHub': '💻',
      'Ollama': '🦙'
    }
    return icons[provider] || '🤖'
  }

  // Alle verfügbaren AI-Modelle
  const models = availableModels.length > 0 ? availableModels : [
    // OpenAI Models
    { id: 'gpt-4o', name: 'GPT-4o', icon: '🧠', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', icon: '⚡', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: '🚀', provider: 'OpenAI' },
    { id: 'gpt-4', name: 'GPT-4', icon: '💎', provider: 'OpenAI' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: '💨', provider: 'OpenAI' },
    { id: 'o1-preview', name: 'O1 Preview', icon: '🔮', provider: 'OpenAI' },
    { id: 'o1-mini', name: 'O1 Mini', icon: '🎯', provider: 'OpenAI' },

    // Anthropic Claude Models
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', icon: '🤖', provider: 'Anthropic' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', icon: '👑', provider: 'Anthropic' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', icon: '🎭', provider: 'Anthropic' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', icon: '🌸', provider: 'Anthropic' },

    // Google Gemini Models
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', icon: '✨', provider: 'Google' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: '⚡', provider: 'Google' },
    { id: 'gemini-pro', name: 'Gemini Pro', icon: '💫', provider: 'Google' },

    // GitHub Copilot Models
    { id: 'gpt-4o', name: 'Copilot GPT-4o', icon: '🐙', provider: 'GitHub' },
    { id: 'Phi-3.5-MoE-instruct', name: 'Phi-3.5 MoE', icon: '🧬', provider: 'GitHub' },
    { id: 'Phi-3.5-mini-instruct', name: 'Phi-3.5 Mini', icon: '🔬', provider: 'GitHub' },

    // Ollama Local Models
    { id: 'llama3.2', name: 'Llama 3.2', icon: '🦙', provider: 'Ollama' },
    { id: 'llama3.1', name: 'Llama 3.1', icon: '🦙', provider: 'Ollama' },
    { id: 'llama3', name: 'Llama 3', icon: '🦙', provider: 'Ollama' },
    { id: 'llama2', name: 'Llama 2', icon: '🦙', provider: 'Ollama' },
    { id: 'mistral', name: 'Mistral', icon: '🌪️', provider: 'Ollama' },
    { id: 'mixtral', name: 'Mixtral', icon: '🎨', provider: 'Ollama' },
    { id: 'codellama', name: 'Code Llama', icon: '💻', provider: 'Ollama' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', icon: '🔍', provider: 'Ollama' },
    { id: 'qwen2.5', name: 'Qwen 2.5', icon: '🇨🇳', provider: 'Ollama' },
    { id: 'phi3', name: 'Phi-3', icon: '🔬', provider: 'Ollama' },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Konvertiere Kernel-Events zu Chat-Nachrichten
  useEffect(() => {
    if (kernelMessages.length > 0) {
      const content = kernelMessages
        .map(event => `**[${event.type.toUpperCase()}]**\n${event.message}`)
        .join('\n\n')
      
      setChatMessages(prev => {
        const updated = [...prev]
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1] = { role: 'assistant', content }
        } else {
          updated.push({ role: 'assistant', content })
        }
        return updated
      })
    }
  }, [kernelMessages])

  const sendMessage = () => {
    if (!input.trim() || running) return

    const userMessage = { role: 'user', content: input }
    setChatMessages(prev => [...prev, userMessage])
    sendKernelMessage(input)
    setInput('')
  }

  const clearChat = () => {
    setChatMessages([])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '1.5rem'
          }}>
            ←
          </Link>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>💬 AI Chat</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer',
              maxWidth: '250px'
            }}
          >
            <optgroup label="OpenAI" style={{ background: '#1a1a2e' }}>
              {models.filter(m => m.provider === 'OpenAI').map(model => (
                <option key={model.id} value={model.id} style={{ background: '#1a1a2e' }}>
                  {model.icon} {model.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Anthropic Claude" style={{ background: '#1a1a2e' }}>
              {models.filter(m => m.provider === 'Anthropic').map(model => (
                <option key={model.id} value={model.id} style={{ background: '#1a1a2e' }}>
                  {model.icon} {model.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Google Gemini" style={{ background: '#1a1a2e' }}>
              {models.filter(m => m.provider === 'Google').map(model => (
                <option key={model.id} value={model.id} style={{ background: '#1a1a2e' }}>
                  {model.icon} {model.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="GitHub Copilot" style={{ background: '#1a1a2e' }}>
              {models.filter(m => m.provider === 'GitHub').map(model => (
                <option key={model.id} value={model.id} style={{ background: '#1a1a2e' }}>
                  {model.icon} {model.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Ollama (Local)" style={{ background: '#1a1a2e' }}>
              {models.filter(m => m.provider === 'Ollama').map(model => (
                <option key={model.id} value={model.id} style={{ background: '#1a1a2e' }}>
                  {model.icon} {model.name}
                </option>
              ))}
            </optgroup>
          </select>

          <button
            onClick={clearChat}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 100, 100, 0.2)',
              border: '2px solid rgba(255, 100, 100, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              opacity: 0.5
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h2>Start a conversation</h2>
              <p>Ask me anything! I'm powered by multiple AI models.</p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: msg.role === 'user'
                    ? 'none'
                    : '2px solid rgba(255, 255, 255, 0.15)',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {msg.role === 'user' ? '👤 You' : '🤖 AI'}
                  </div>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {running && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  opacity: 0.7',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  🤖 AI
                </div>
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '1.5rem',
          borderTop: '2px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !running && sendMessage()}
              placeholder="Type your message..."
              disabled={running}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={running || !input.trim()}
              style={{
                padding: '1rem 2rem',
                background: running || !input.trim()
                  ? 'rgba(100, 100, 100, 0.3)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: running || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {running ? '⏳' : '🚀'} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
