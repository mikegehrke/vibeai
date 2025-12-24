'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Pencil, ArrowUp, ArrowRight, Paperclip, Menu, Plus, Globe, Search, Grid3x3, Mic, Circle, CheckCircle, RefreshCw, MessageCircle, CheckSquare, ArrowDown, Play, Sun, Moon, Sparkles, Send, X, ChevronDown, Loader2, Image as ImageIcon, File, Trash2, Copy, User, Check } from 'lucide-react';
import { useCallback } from 'react';

// ========== UNUSED FULL CHAT - REMOVED ==========
// Der Chat ist jetzt direkt in die Seite eingebettet (wie in /home)
function _UnusedFullChat({ colors, theme }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('vibeai-4-mini')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const models = [
    { id: 'vibeai-4-mini', name: 'VibeAI 4.0 Mini', description: 'Fast & Efficient', icon: '⚡', apiModel: 'gpt-4o-mini' },
    { id: 'vibeai-4', name: 'VibeAI 4.0', description: 'Most Capable', icon: '🧠', apiModel: 'gpt-4o' },
    { id: 'vibeai-4-turbo', name: 'VibeAI 4.0 Turbo', description: 'Enhanced Speed', icon: '🚀', apiModel: 'gpt-4-turbo' },
    { id: 'vibeai-pro', name: 'VibeAI Pro', description: 'Premium Quality', icon: '👑', apiModel: 'claude-3-5-sonnet-20241022' },
  ]

  const agents = [
    { id: 'aura', name: 'Aura', description: 'General AI Assistant', icon: '✨', color: '#8b5cf6' },
    { id: 'cora', name: 'Cora', description: 'Code Expert', icon: '💻', color: '#3b82f6' },
    { id: 'lumi', name: 'Lumi', description: 'Research Specialist', icon: '🔍', color: '#10b981' },
    { id: 'devra', name: 'Devra', description: 'DevOps Expert', icon: '🚀', color: '#f97316' }
  ]

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const currentModel = models.find(m => m.id === selectedModel)
    const currentAgentData = selectedAgent || agents[0]
    
    const userMessage = {
      id: Date.now(), role: 'user', content: input, timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    const currentPrompt = input
    setInput('')
    setIsLoading(true)

    // Add thinking message
    const thinkingMessage = {
      id: Date.now() + 1, role: 'assistant', content: '', isThinking: true,
      agent_used: currentAgentData.name, model_used: currentModel?.name, timestamp: new Date()
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          model: currentModel?.apiModel || 'gpt-4o-mini',
          agent: currentAgentData.id,
          stream: false,
          conversation_history: messages.filter(m => !m.isThinking).slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      })
      if (!response.ok) throw new Error('Request failed')
      const data = await response.json()
      
      // Remove thinking message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking)
        if (data.success && data.response) {
          return [...filtered, {
            id: Date.now() + 2, role: 'assistant', content: data.response,
            model_used: currentModel?.name, agent_used: currentAgentData.name,
            isThinking: false, timestamp: new Date()
          }]
        }
        return [...filtered, {
          id: Date.now() + 2, role: 'assistant',
          content: `⚠️ ${data.error || 'Unknown error'}`, timestamp: new Date()
        }]
      })
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking)
        return [...filtered, {
          id: Date.now() + 2, role: 'assistant',
          content: `❌ ${error.message}`, timestamp: new Date()
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => setMessages([])
  const currentModel = models.find(m => m.id === selectedModel)
  const currentAgentData = selectedAgent || agents[0]

  return (
    <>
      {/* Chat Trigger - Top Center */}
      <div onClick={() => setIsOpen(true)} style={{
        position: 'fixed', top: '90px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1100, cursor: 'pointer'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1.25rem', background: colors.bgSecondary,
          border: `1px solid ${colors.accent}`, borderRadius: '100px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontSize: '0.875rem', color: colors.textSecondary, fontWeight: '500' }}>
            Ask VibeAI anything...
          </span>
          <div style={{
            padding: '0.25rem 0.5rem', background: colors.bgTertiary,
            borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '600', color: colors.textMuted
          }}>⌘K</div>
        </div>
      </div>

      {/* Chat Modal - Replit Style */}
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)', zIndex: 1001
          }} />
          
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '700px',
            background: '#1a1a1a', border: '1px solid #3b82f6',
            borderRadius: '12px', boxShadow: '0 32px 80px rgba(0, 0, 0, 0.6)',
            display: 'flex', flexDirection: 'column',
            height: '400px', minHeight: '400px', maxHeight: '400px',
            overflow: 'hidden', zIndex: 1002
          }}>
            
            {/* Scrollable Chat + Input Area */}
            <div 
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                paddingBottom: '80px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Messages */}
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  {/* Avatar */}
                  <div style={{
                    minWidth: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {msg.role === 'user' ? (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#3b82f6', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '600', fontSize: '0.85rem'
                      }}>U</div>
                    ) : (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: msg.isThinking ? 1 : 0.9
                      }}>
                        <Sparkles size={16} color="white" style={{
                          animation: msg.isThinking ? 'spin 1s linear infinite' : 'none'
                        }} />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    <div style={{ 
                      fontWeight: '600', marginBottom: '0.5rem', 
                      color: '#9ca3af', fontSize: '0.85rem'
                    }}>
                      {msg.role === 'user' ? 'You' : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ fontWeight: '600' }}>{msg.agent_used || currentAgentData.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            using {msg.model_used || currentModel?.name}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      whiteSpace: 'pre-wrap', color: '#e5e5e5',
                      fontSize: '0.95rem', lineHeight: '1.6'
                    }}>
                      {msg.isThinking ? (
                        <span style={{ color: '#9ca3af' }}>Thinking...</span>
                      ) : msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Input Area - inline like /home */}
              <div style={{ position: 'relative', minHeight: '40px' }}>
                {input === '' && messages.length === 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    color: '#6b7280', fontSize: '0.95rem',
                    lineHeight: '1.6', pointerEvents: 'none'
                  }}>
                    Describe your idea or ask a question...
                  </div>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '40px',
                    background: 'transparent', border: 'none',
                    color: '#ffffff', fontSize: '0.95rem',
                    outline: 'none', resize: 'none', lineHeight: '1.6'
                  }}
                  placeholder=""
                />
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Fixed Bottom Bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#1a1a1a', padding: '1rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              zIndex: 10, borderTop: '1px solid #2a2a2a'
            }}>
              {/* Left Side - Model & Agent */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Model Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    style={{
                      background: 'transparent', border: 'none', color: '#9ca3af',
                      fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0'
                    }}>
                    {currentModel?.icon} {currentModel?.name}
                    <ChevronDown size={16} />
                  </button>
                  {showModelDropdown && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: 0, marginBottom: '0.5rem',
                      background: '#2a2a2a', border: '1px solid #3b82f6',
                      borderRadius: '8px', minWidth: '200px', zIndex: 1000
                    }}>
                      {models.map((model, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setSelectedModel(model.id); setShowModelDropdown(false) }}
                          style={{
                            padding: '0.75rem 1rem', cursor: 'pointer',
                            color: selectedModel === model.id ? '#3b82f6' : '#e5e5e5',
                            fontSize: '0.9rem', borderBottom: idx < models.length - 1 ? '1px solid #3a3a3a' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#333'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {model.icon} {model.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Agent Display */}
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  {currentAgentData.icon} {currentAgentData.name}
                </span>

                {/* Attachment */}
                <button style={{
                  background: 'transparent', border: 'none', color: '#9ca3af',
                  cursor: 'pointer', padding: '0.5rem'
                }}>
                  <Paperclip size={18} />
                </button>
              </div>

              {/* Right Side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {messages.length > 0 && (
                  <button onClick={clearChat} style={{
                    background: 'transparent', border: 'none', color: '#9ca3af',
                    cursor: 'pointer', fontSize: '0.85rem', display: 'flex',
                    alignItems: 'center', gap: '0.25rem'
                  }}>
                    <Trash2 size={14} /> Clear
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} style={{
                  background: 'transparent', border: 'none', color: '#9ca3af',
                  cursor: 'pointer', fontSize: '0.85rem'
                }}>
                  <X size={18} />
                </button>
                <span 
                  onClick={handleSend}
                  style={{
                    color: isLoading ? '#6b7280' : '#9ca3af',
                    fontSize: '0.95rem', fontWeight: '400',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    opacity: isLoading ? 0.5 : 1
                  }}>
                  {isLoading ? 'Sending...' : 'Start'}
                  <ArrowRight size={16} />
                </span>
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

// Animiertes Logo-Icon Komponente - Striche bewegen sich rechts/links, orange/schwarz leuchten
function AnimatedLogoIcon() {
  useEffect(() => {
    const styleId = 'animated-logo-icon-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes logoLineMoveLeft {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-3px); }
      }
      @keyframes logoLineMoveRight {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(3px); }
      }
      @keyframes logoGlow {
        0%, 100% { 
          filter: drop-shadow(0 0 6px rgba(255, 140, 66, 0.9));
        }
        50% { 
          filter: drop-shadow(0 0 10px rgba(255, 140, 66, 1)) drop-shadow(0 0 5px rgba(0, 0, 0, 0.6));
        }
      }
      @keyframes logoColorChange {
        0%, 100% { fill: #ff8c42; }
        50% { fill: #000000; }
      }
      .logo-line-1 { 
        animation: logoLineMoveLeft 1.5s ease-in-out infinite, logoColorChange 3s ease-in-out infinite; 
      }
      .logo-line-2 { 
        animation: logoLineMoveRight 1.5s ease-in-out infinite 0.2s, logoColorChange 3s ease-in-out infinite 0.1s; 
      }
      .logo-line-3 { 
        animation: logoLineMoveLeft 1.5s ease-in-out infinite 0.4s, logoColorChange 3s ease-in-out infinite 0.2s; 
      }
      .logo-icon-container {
        animation: logoGlow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  return (
    <div 
      className="logo-icon-container"
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {/* Erste Linie - bewegt sich links, orange/schwarz leuchtend */}
        <rect 
          x="2" y="5" width="16" height="2" rx="1" 
          className="logo-line-1"
        />
        {/* Zweite Linie - bewegt sich rechts, orange/schwarz leuchtend */}
        <rect 
          x="2" y="9" width="16" height="2" rx="1" 
          className="logo-line-2"
        />
        {/* Dritte Linie - bewegt sich links, orange/schwarz leuchtend */}
        <rect 
          x="2" y="13" width="16" height="2" rx="1" 
          className="logo-line-3"
        />
      </svg>
    </div>
  );
}

// Animiertes Agent-Icon Komponente - Striche bewegen sich immer, orange leuchten wenn aktiv
function AnimatedAgentIcon({ isActive }) {
  useEffect(() => {
    // Erstelle dynamische Keyframes (nur einmal)
    const styleId = 'animated-agent-icon-styles';
    if (document.getElementById(styleId)) return; // Bereits vorhanden
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes agentMoveLeft {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-3px); }
      }
      @keyframes agentMoveRight {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(3px); }
      }
      .agent-line-1 { animation: agentMoveLeft 1.5s ease-in-out infinite; }
      .agent-line-2 { animation: agentMoveRight 1.5s ease-in-out infinite 0.2s; }
      .agent-line-3 { animation: agentMoveLeft 1.5s ease-in-out infinite 0.4s; }
      .agent-line-4 { animation: agentMoveRight 1.5s ease-in-out infinite 0.6s; }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      filter: isActive ? 'drop-shadow(0 0 12px rgba(255, 140, 66, 1)) drop-shadow(0 0 6px rgba(255, 140, 66, 0.8))' : 'none',
      transition: 'filter 0.3s'
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect 
          x="2" y="4" width="16" height="2" rx="1" 
          fill={isActive ? '#ff8c42' : '#000000'} 
          className="agent-line-1"
          style={{ transition: 'fill 0.3s' }}
        />
        <rect 
          x="2" y="8" width="16" height="2" rx="1" 
          fill={isActive ? '#ff8c42' : '#000000'} 
          className="agent-line-2"
          style={{ transition: 'fill 0.3s' }}
        />
        <rect 
          x="2" y="12" width="16" height="2" rx="1" 
          fill={isActive ? '#ff8c42' : '#000000'} 
          className="agent-line-3"
          style={{ transition: 'fill 0.3s' }}
        />
        <rect 
          x="2" y="16" width="16" height="2" rx="1" 
          fill={isActive ? '#ff8c42' : '#000000'} 
          className="agent-line-4"
          style={{ transition: 'fill 0.3s' }}
        />
      </svg>
    </div>
  );
}

export default function CopilotPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('app');
  const [prompt, setPrompt] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Theme Colors
  const colors = theme === 'dark' ? {
    bg: '#09090b',
    bgSecondary: '#18181b',
    bgTertiary: '#27272a',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    border: '#27272a',
    accent: '#60a5fa',
    accentHover: '#3b82f6',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  } : {
    bg: '#ffffff',
    bgSecondary: '#f4f4f5',
    bgTertiary: '#e4e4e7',
    text: '#09090b',
    textSecondary: '#52525b',
    textMuted: '#71717a',
    border: '#e4e4e7',
    accent: '#60a5fa',
    accentHover: '#3b82f6',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  };

  // Theme initialization
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('vibeai-theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('vibeai-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Check auth before allowing chat input
  const handleChatFocus = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  // Handler für "Start building" Button
  const handleStartBuilding = () => {
    // Prüfe ob User eingeloggt ist
    const token = localStorage.getItem('token');
    if (token) {
      // User ist eingeloggt, direkt zu /home
      router.push('/home');
    } else {
      // User ist nicht eingeloggt, zu /login mit redirect
      router.push('/login?redirect=/home');
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(''); // Aktuelle Streaming-Antwort
  const [typewriterText, setTypewriterText] = useState(''); // Text der angezeigt wird (Typewriter-Effekt)
  const [attachedFiles, setAttachedFiles] = useState([]); // Hochgeladene Dateien (Bilder, Videos, etc.)
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // Generiertes Bild URL
  const [isDragging, setIsDragging] = useState(false); // Drag & Drop State
  const [showPlusMenu, setShowPlusMenu] = useState(false); // Plus-Menü anzeigen
  const [showScreenshotSubmenu, setShowScreenshotSubmenu] = useState(false); // Screenshot-Untermenü
  const [selectedCategory, setSelectedCategory] = useState('Landing Pages'); // Ausgewählte Kategorie
  const [isYearly, setIsYearly] = useState(false); // Monthly/Yearly Toggle
  const categories = ['Landing Pages', 'AI App', 'Dashboard', 'E-Commerce', 'Portfolio', 'Interactive Experience'];
  const selectedCategoryIndex = categories.indexOf(selectedCategory);
  const plusMenuRef = useRef(null); // Ref für Plus-Menü
  const typingTimeoutRef = useRef(null);
  const typewriterTimeoutRef = useRef(null); // Separater Ref für Typewriter-Effekt
  const chatHistoryRef = useRef(null);
  const messagesEndRef = useRef(null);
  const responseBufferRef = useRef(''); // Buffer für Streaming-Daten
  const typewriterIndexRef = useRef(0); // Aktueller Index für Typewriter
  const isTypewriterRunningRef = useRef(false); // Flag ob Typewriter läuft
  const fileInputRef = useRef(null); // Ref für File-Input

  // Placeholder texts based on tab
  const placeholderTexts = {
    app: 'Make a software application that...',
    design: 'Design me a website, slide deck, interactive prototype...'
  };

  // Typewriter effect for placeholder
  useEffect(() => {
    if (prompt || isSubmitted) return;
    
    const currentPlaceholder = placeholderTexts[activeTab];
    let currentIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    const typeNextChar = () => {
      if (currentIndex < currentPlaceholder.length) {
        setDisplayedText(currentPlaceholder.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeNextChar, 50);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          if (!prompt && !isSubmitted) {
            setDisplayedText('');
            currentIndex = 0;
            typeNextChar();
          }
        }, 2000);
      }
    };

    typeNextChar();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeTab, prompt, isSubmitted]);

  // Handle submit - Streaming API call
  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    const userMessage = prompt.trim();
    setIsSubmitted(true);
    setIsLoading(true);
    setDisplayedText('');
    setCurrentResponse('');
    setTypewriterText('');

    // Add user message to conversation history
    const userMsg = { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    };
    const updatedHistory = [...conversationHistory, userMsg];
    setConversationHistory(updatedHistory);
    
    // Clear input
    setPrompt('');
    setAttachedFiles([]);
    
    try {
      // Streaming request
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          model: 'gpt-4o-mini',
          agent: 'aura',
          stream: true,
          conversation_history: conversationHistory.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      // Handle streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullResponse += data.content;
                  setCurrentResponse(fullResponse);
                  // Auto-scroll
                      if (chatHistoryRef.current) {
                        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                      }
                }
                if (data.done) break;
              } catch (e) {
                if (!(e instanceof SyntaxError)) throw e;
              }
            }
          }
        }
      }

      // Add final response to history
      if (fullResponse) {
            setConversationHistory([...updatedHistory, { 
              role: 'assistant', 
              content: fullResponse,
          timestamp: new Date()
            }]);
        setCurrentResponse('');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setConversationHistory([...updatedHistory, {
        role: 'assistant',
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
      setCurrentResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  // Typewriter-Effekt für Streaming-Antworten
  useEffect(() => {
    if (!isLoading && !currentResponse) {
      // Reset wenn nicht mehr am Laden
      setTypewriterText('');
      typewriterIndexRef.current = 0;
      responseBufferRef.current = '';
      isTypewriterRunningRef.current = false;
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      return;
    }

    // Typewriter-Funktion
    const typeNextChar = () => {
      if (typewriterIndexRef.current < responseBufferRef.current.length) {
        // Zeichen für Zeichen anzeigen
        const nextChar = responseBufferRef.current[typewriterIndexRef.current];
        setTypewriterText(responseBufferRef.current.substring(0, typewriterIndexRef.current + 1));
        typewriterIndexRef.current++;
        
        // Variable Geschwindigkeit: Wörter schneller, Leerzeichen/Punktuation langsamer
        const delay = nextChar === ' ' ? 30 : nextChar === '.' || nextChar === '!' || nextChar === '?' ? 100 : 20;
        
        typewriterTimeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        isTypewriterRunningRef.current = false;
        // Prüfe ob neuer Text im Buffer ist
        if (responseBufferRef.current.length > typewriterIndexRef.current) {
          isTypewriterRunningRef.current = true;
          typeNextChar();
        }
      }
    };

    // Starte Typewriter wenn neuer Text im Buffer ist und noch nicht läuft
    if (responseBufferRef.current.length > typewriterIndexRef.current && !isTypewriterRunningRef.current) {
      isTypewriterRunningRef.current = true;
      typeNextChar();
    }

    return () => {
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
    };
  }, [currentResponse, isLoading]);

  // Auto-scroll to bottom when messages change - nur innerhalb des Chat-Containers
  useEffect(() => {
    if (chatHistoryRef.current) {
      // Scroll nur innerhalb des Chat-Containers, nicht die ganze Seite
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversationHistory, typewriterText, currentResponse]);

  // Schließe Plus-Menü wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
        setShowScreenshotSubmenu(false);
      }
    };

    if (showPlusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlusMenu]);

  // Screenshot-Funktion (Mac/Windows)
  const captureScreenshot = async () => {
    // Prüfe ob getDisplayMedia verfügbar ist
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('Screenshot-Funktion nicht verfügbar. Bitte nutze:\n• Mac: Cmd+Shift+4\n• Windows: Win+Shift+S\n\nDann füge das Bild per Drag & Drop oder Upload ein.');
      return;
    }

    try {
      // Versuche Screen Capture (benötigt Benutzererlaubnis)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Warte bis Video geladen ist
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.currentTime = 0;
        };
        video.onseeked = resolve;
      });
      
      // Erstelle Canvas und zeichne Video
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Stoppe Stream sofort
      stream.getTracks().forEach(track => track.stop());
      
      // Konvertiere zu Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setAttachedFiles(prev => [...prev, {
              name: `screenshot-${Date.now()}.png`,
              type: 'image/png',
              size: blob.size,
              data: e.target.result,
              url: URL.createObjectURL(blob)
            }]);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Screenshot error:', error);
      
      // Wenn Benutzer die Erlaubnis verweigert hat
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        // Versuche Clipboard als Fallback
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
              const imageType = item.types.find(t => t.startsWith('image/'));
              const blob = await item.getType(imageType);
              const reader = new FileReader();
              reader.onload = (e) => {
                setAttachedFiles(prev => [...prev, {
                  name: `screenshot-${Date.now()}.png`,
                  type: imageType,
                  size: blob.size,
                  data: e.target.result,
                  url: URL.createObjectURL(blob)
                }]);
              };
              reader.readAsDataURL(blob);
              return; // Erfolgreich aus Clipboard geladen
            }
          }
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
        
        // Zeige hilfreiche Nachricht
        alert('Screenshot-Berechtigung verweigert.\n\nBitte:\n1. Nutze Cmd+Shift+4 (Mac) oder Win+Shift+S (Windows)\n2. Kopiere das Bild (Cmd+C / Ctrl+C)\n3. Klicke auf den Screenshot-Button erneut\n\nOder nutze Drag & Drop / Upload für Screenshots.');
      } else {
        // Anderer Fehler
        alert('Screenshot konnte nicht erstellt werden.\n\nBitte nutze:\n• Mac: Cmd+Shift+4\n• Windows: Win+Shift+S\n\nDann füge das Bild per Drag & Drop oder Upload ein.');
      }
    }
  };

  // File Handler (für Upload und Drag & Drop)
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result, // Base64
            url: URL.createObjectURL(file) // Preview URL
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Reset when tab changes
  useEffect(() => {
    setIsSubmitted(false);
    setPrompt('');
    setDisplayedText('');
    setIsLoading(false);
    setCurrentResponse('');
    setTypewriterText('');
    responseBufferRef.current = '';
    typewriterIndexRef.current = 0;
    isTypewriterRunningRef.current = false;
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    // Keep conversation history when switching tabs
  }, [activeTab]);
  
  // Reset displayed text when user starts typing
  useEffect(() => {
    if (prompt && isSubmitted) {
      setIsSubmitted(false);
      setDisplayedText('');
    }
  }, [prompt]);

  if (!mounted) return null;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: colors.text,
      transition: 'background 0.3s, color 0.3s'
    }}>
      {/* Header - Theme aware */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: theme === 'dark' ? 'rgba(9, 9, 11, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: 'none',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Left Side - Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* VibeAI Logo mit Sparkles */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Sparkles size={24} style={{ color: '#ff8c42' }} />
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700',
              color: colors.text,
              letterSpacing: '-0.02em'
          }}>
              VibeAI
            </span>
          </Link>
          
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '2rem' }}>
            <Link href="/" style={{ 
              color: colors.textSecondary, 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}>Products</Link>
            <Link href="/builder" style={{ 
              color: colors.textSecondary, 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}>For Work</Link>
            <Link href="/chatgpt" style={{ 
              color: colors.textSecondary, 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}>Resources</Link>
            <Link href="/pricing" style={{ 
              color: colors.textSecondary, 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}>Pricing</Link>
            <Link href="/studio" style={{ 
              color: colors.textSecondary, 
              textDecoration: 'none', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}>Careers</Link>
          </nav>
        </div>

        {/* Right Side - Theme Toggle + Log in & Start building */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textSecondary,
              transition: 'all 0.2s'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <Link href="/login" style={{ 
            color: colors.textSecondary, 
            textDecoration: 'none', 
            fontSize: '0.875rem', 
            fontWeight: '500'
          }}>Log in</Link>
          <button 
            onClick={() => router.push('/home')}
            style={{
              background: '#ff8c42',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Start building
          </button>
        </div>
      </header>

      {/* Main Content - Theme aware Background */}
      <main style={{
        minHeight: 'calc(100vh - 80px)',
        background: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        paddingTop: 'calc(3rem + 80px)',
        transition: 'background 0.3s'
      }}>
        {/* Title - Replit Style */}
        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: '700',
          color: colors.text,
          marginBottom: '2.5rem',
          textAlign: 'center',
          letterSpacing: '-0.03em'
        }}>
          What will you build?
        </h1>

        {/* Main Area with Mockups + Chat */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: '3rem',
          width: '100%',
          maxWidth: '1400px'
        }}>
          
          {/* LEFT MOCKUPS - Theme-aware */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            position: 'relative',
            width: '260px',
            flexShrink: 0
          }}>
            {/* Dashboard Screen */}
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(-6deg) translateX(15px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 3
            }}>
              <div style={{ padding: '8px 12px', background: colors.bgTertiary, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', marginBottom: '8px' }}>
                  {[35, 55, 40, 70, 50, 85, 60, 45].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? '#60a5fa' : colors.bgTertiary, borderRadius: '2px' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1, height: '24px', background: colors.bgTertiary, borderRadius: '4px' }} />
                  <div style={{ flex: 1, height: '24px', background: colors.bgTertiary, borderRadius: '4px' }} />
                </div>
              </div>
            </div>
            
            {/* Code Editor Screen */}
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(4deg) translateY(-25px) translateX(-10px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ padding: '8px 12px', background: colors.bgTertiary, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '9px', lineHeight: '1.5' }}>
                <div><span style={{ color: '#c084fc' }}>const</span> <span style={{ color: '#60a5fa' }}>app</span> <span style={{ color: colors.textMuted }}>=</span> <span style={{ color: '#fbbf24' }}>create</span><span style={{ color: colors.textMuted }}>()</span></div>
                <div><span style={{ color: '#60a5fa' }}>app</span><span style={{ color: colors.textMuted }}>.</span><span style={{ color: '#4ade80' }}>use</span><span style={{ color: colors.textMuted }}>(</span><span style={{ color: '#f472b6' }}>router</span><span style={{ color: colors.textMuted }}>)</span></div>
                <div><span style={{ color: '#60a5fa' }}>app</span><span style={{ color: colors.textMuted }}>.</span><span style={{ color: '#4ade80' }}>listen</span><span style={{ color: colors.textMuted }}>(</span><span style={{ color: '#fb923c' }}>3000</span><span style={{ color: colors.textMuted }}>)</span></div>
              </div>
            </div>
            
            {/* Mobile Screen */}
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '20px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(-4deg) translateY(-45px) translateX(25px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1,
              width: '100px',
              marginLeft: 'auto'
            }}>
              <div style={{ padding: '6px 0', background: colors.bgTertiary, borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '30px', height: '3px', background: colors.border, borderRadius: '2px', margin: '0 auto' }} />
              </div>
              <div style={{ padding: '8px' }}>
                <div style={{ width: '100%', height: '40px', background: colors.bgTertiary, borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <div style={{ height: '25px', background: colors.bgTertiary, borderRadius: '4px' }} />
                  <div style={{ height: '25px', background: colors.bgTertiary, borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation + Chat Container */}
        <div style={{
          width: '100%',
          maxWidth: '700px',
            display: 'flex',
            flexDirection: 'column'
          }}>
          {/* Tabs - mit Abstand links UND rechts */}
          <div style={{
          display: 'flex',
          gap: '0',
            marginBottom: '-1px',
            paddingLeft: '30px',
            paddingRight: '30px'
        }}>
            {/* App Tab */}
          <button
            onClick={() => setActiveTab('app')}
            style={{
                flex: 1,
                padding: '1rem 2rem',
                background: activeTab === 'app' ? 'transparent' : colors.bgTertiary,
                border: activeTab === 'app' ? '1px solid #60a5fa' : 'none',
                borderBottom: activeTab === 'app' ? `1px solid ${colors.bgSecondary}` : '1px solid #60a5fa',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                color: activeTab === 'app' ? colors.text : colors.textSecondary,
                fontSize: '0.95rem',
                fontWeight: activeTab === 'app' ? '600' : '400',
                cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
          justifyContent: 'center',
                gap: '0.5rem',
              transition: 'all 0.2s',
                position: 'relative',
                zIndex: activeTab === 'app' ? 2 : 1
            }}
          >
            <Box size={18} />
              App
          </button>
          
            {/* Design Tab */}
          <button
            onClick={() => setActiveTab('design')}
            style={{
                flex: 1,
                padding: '1rem 2rem',
                background: activeTab === 'design' ? 'transparent' : colors.bgTertiary,
                border: activeTab === 'design' ? '1px solid #60a5fa' : 'none',
                borderBottom: activeTab === 'design' ? `1px solid ${colors.bgSecondary}` : '1px solid #60a5fa',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                borderBottomLeftRadius: '0',
                borderBottomRightRadius: '0',
                color: activeTab === 'design' ? colors.text : colors.textSecondary,
                fontSize: '0.95rem',
                fontWeight: activeTab === 'design' ? '600' : '400',
                cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                gap: '0.5rem',
              transition: 'all 0.2s',
                position: 'relative',
                zIndex: activeTab === 'design' ? 2 : 1
            }}
          >
            <Pencil size={18} />
              Design
          </button>
        </div>

          {/* Chat-Feld - FESTE GRÖSSE wie /home */}
        <div 
          style={{
              background: colors.bgSecondary,
              border: isDragging ? '2px dashed #60a5fa' : '1px solid #60a5fa',
            borderRadius: '12px',
              height: '300px',
              minHeight: '300px',
              maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
              transition: 'border-color 0.2s',
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = colors.accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.1)'}`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFiles(files);
            }
          }}
        >
          {/* Auth Overlay - wenn nicht eingeloggt */}
          {!isLoggedIn && (
            <div 
              onClick={() => setShowAuthModal(true)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                cursor: 'pointer',
                zIndex: 100,
                borderRadius: '12px'
              }}
            >
              <Sparkles size={32} style={{ color: '#ff8c42' }} />
              <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>
                Sign in to start building
              </span>
              <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>
                Click here to create an account or log in
              </span>
            </div>
          )}

          {/* Drag & Drop Hinweis */}
          {isDragging && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              zIndex: 1000,
              fontSize: '1.2rem',
              fontWeight: '600',
              pointerEvents: 'none'
            }}>
              📎 Dateien hier ablegen
        </div>
          )}

          {/* Angehängte Dateien Preview */}
          {attachedFiles.length > 0 && (
      <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#f8f8f8',
              borderRadius: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {attachedFiles.map((file, index) => (
                <div key={index} style={{
                  position: 'relative',
                  maxWidth: '200px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e5e5e5'
                }}>
                  {file.type?.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
            style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                    />
                  ) : file.type?.startsWith('video/') ? (
                    <video 
                      src={file.url}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                      controls
                    />
                  ) : null}
                  <div style={{
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(0,0,0,0.7)',
              color: 'white',
                    fontSize: '0.7rem',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.name}
                  </div>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                    style={{
                      position: 'absolute',
                      top: '0.25rem',
                      right: '0.25rem',
                      background: 'rgba(255, 0, 0, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Chat History - FESTE GRÖSSE, scrolling */}
            <div 
              ref={chatHistoryRef}
              style={{
              flex: 1,
                overflowY: 'auto',
              padding: '1rem',
              paddingBottom: '70px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
              }}
            >
            {/* Messages */}
            {conversationHistory.length > 0 && (
              <>
              {conversationHistory.map((message, index) => (
                message.role === 'user' ? (
                  /* USER MESSAGE - Vertikal: Avatar oben, Name, dann Text (rechts) */
                <div
                  key={index}
                  style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.35rem',
                      marginBottom: '1rem'
                  }}
                >
                    {/* Avatar */}
                  <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={18} color="white" />
                    </div>
                    
                    {/* Name */}
                    <div style={{
                    fontWeight: '600',
                      fontSize: '0.85rem',
                      color: colors.textSecondary
                    }}>
                      You
                    </div>
                    
                    {/* Message Content */}
                    <div style={{
                      color: colors.text,
                      textAlign: 'right',
                      maxWidth: '80%',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      lineHeight: '1.5'
                    }}>
                      {message.content}
                    </div>
                  </div>
                ) : (
                  /* AGENT MESSAGE - Horizontal: Avatar links, Content rechts */
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #f97316 100%)',
                    display: 'flex',
                    alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                  }}>
                      <Sparkles size={18} color="white" />
                  </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1, maxWidth: '80%' }}>
                      {/* Name */}
                      <div style={{
                        fontWeight: '600',
                        fontSize: '0.85rem',
color: colors.textSecondary,
                          marginBottom: '0.35rem'
                        }}>
                          VibeAI Assistant
                      </div>
                      
                  {/* Angehängte Dateien anzeigen */}
                  {message.files && message.files.length > 0 && (
                    <div style={{
                      marginBottom: '0.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {message.files.map((file, fileIndex) => (
                        <div key={fileIndex} style={{
                              maxWidth: '200px',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          {file.type?.startsWith('image/') ? (
                            <img 
                              src={file.data || file.url} 
                              alt={file.name}
                                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                          ) : file.type?.startsWith('video/') ? (
                            <video 
                              src={file.data || file.url}
                              controls
                                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                          ) : (
                            <div style={{
                              padding: '0.5rem',
                                  background: colors.bgSecondary,
                              borderRadius: '8px',
                                  fontSize: '0.8rem'
                            }}>
                              📎 {file.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                      
                      {/* Generiertes Bild */}
                  {message.imageUrl && (
                        <div style={{ marginBottom: '0.5rem' }}>
                      <img 
                        src={message.imageUrl} 
                        alt="Generated"
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                      
                      {/* Text */}
                  <div style={{
                        color: colors.text,
                        fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    lineHeight: '1.5'
                  }}>
                    {message.content}
                  </div>
                </div>
                  </div>
                )
              ))}
              
              </>
            )}
            
            {/* Streaming Response - IMMER sichtbar wenn loading/streaming */}
              {(currentResponse || isLoading) && (
                  <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '0.75rem',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                {/* Animated Avatar */}
                <div style={{
                  minWidth: '36px',
                  height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                  justifyContent: 'center'
                  }}>
                    <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isLoading && !currentResponse 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #f97316 100%)' 
                      : 'linear-gradient(135deg, #60a5fa 0%, #ffffff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isLoading ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    boxShadow: isLoading ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                    }}>
                    <Sparkles 
                      size={18} 
                      color={isLoading && !currentResponse ? 'white' : '#3b82f6'}
                        style={{
                        animation: isLoading ? 'spin 2s linear infinite' : 'none'
                        }}
                      />
                    </div>
                </div>
                
                {/* Content */}
                <div style={{ flex: 1, maxWidth: '80%' }}>
                  {/* Name */}
                    <div style={{
                    fontWeight: '600',
                    fontSize: '0.85rem',
color: colors.textSecondary,
                          marginBottom: '0.35rem'
                        }}>
                          VibeAI Assistant
                    </div>
                  
                  {/* Message Content - No Bubble */}
                    <div style={{
                    color: colors.text
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      lineHeight: '1.5'
                    }}>
                      {currentResponse || (
                        <span style={{ color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #3b82f6 0%, #f97316 100%)',
                            animation: 'pulse 1s infinite'
                          }} />
                      Thinking...
                        </span>
                      )}
                      {isLoading && currentResponse && (
                        <span style={{ 
                          display: 'inline-block',
                          width: '6px',
                          height: '14px',
                          background: colors.accent,
                          marginLeft: '2px',
                          animation: 'blink 0.8s infinite'
                        }} />
                  )}
                </div>
                  </div>
                </div>
            </div>
          )}

            {/* Input Feld - IMMER sichtbar, rutscht nach unten */}
            <div style={{ position: 'relative', minHeight: '40px' }}>
              {prompt === '' && conversationHistory.length === 0 && !currentResponse && (
            <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: colors.textMuted,
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {displayedText}
                  {isTyping && (
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1.1em',
                      background: '#60a5fa',
                      marginLeft: '2px',
                      animation: 'blink 0.8s infinite'
                    }} />
                  )}
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={(e) => {
                  if (!isLoggedIn) {
                    e.target.blur();
                    setShowAuthModal(true);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoggedIn) {
                      setShowAuthModal(true);
                      return;
                    }
                    handleSubmit();
                  }
                }}
                autoFocus={isLoggedIn}
                style={{
                  width: '100%',
                  minHeight: '40px',
                  background: 'transparent',
                  border: 'none',
                  color: colors.text,
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.6',
                  overflowY: 'hidden'
                }}
                placeholder=""
              />
            </div>

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Fixed Bottom Bar - wie /home */}
            <div style={{
              position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: colors.bgSecondary,
            padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            borderTop: `1px solid ${colors.bgTertiary}`
            }}>
            {/* Left Side - Attachment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                onClick={() => fileInputRef.current?.click()}
                  style={{
                  background: 'transparent',
                      border: 'none',
                  color: colors.textSecondary,
                      cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <Paperclip size={18} />
                  </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.txt,.md,.js,.jsx,.ts,.tsx,.py,.json"
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
              />
                      </div>
                      
            {/* Right Side - Start Button */}
            <span 
                        onClick={() => {
                if (!isLoading && prompt.trim()) {
                  handleSubmit();
                }
                        }}
                        style={{
                color: isLoading ? colors.textMuted : colors.textSecondary,
                fontSize: '0.95rem',
                fontWeight: '400',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                gap: '0.5rem',
                opacity: isLoading ? 0.5 : 1
                        }}
                      >
              {isLoading ? 'Sending...' : 'Start'}
              <ArrowRight size={16} />
                </span>
                            </div>
        </div>
            </div>

          {/* RIGHT MOCKUPS - Theme-aware */}
            <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            position: 'relative',
            width: '260px',
            flexShrink: 0
          }}>
            {/* Browser Screen */}
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(6deg) translateX(-15px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 3
            }}>
              <div style={{ padding: '8px 12px', background: colors.bgTertiary, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ flex: 1, height: '14px', background: colors.border, borderRadius: '4px', marginLeft: '8px' }} />
                            </div>
              <div style={{ padding: '12px' }}>
                <div style={{ width: '60%', height: '8px', background: colors.bgTertiary, borderRadius: '2px', marginBottom: '8px' }} />
                <div style={{ width: '100%', height: '50px', background: colors.bgTertiary, borderRadius: '6px', marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1, height: '30px', background: colors.bgTertiary, borderRadius: '4px' }} />
                  <div style={{ flex: 1, height: '30px', background: colors.bgTertiary, borderRadius: '4px' }} />
                  <div style={{ flex: 1, height: '30px', background: colors.bgTertiary, borderRadius: '4px' }} />
                            </div>
                          </div>
                      </div>
                      
            {/* Terminal Screen */}
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(-4deg) translateY(-20px) translateX(10px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ padding: '8px 12px', background: colors.bgTertiary, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ color: colors.textMuted, fontSize: '9px', marginLeft: '8px' }}>terminal</span>
                      </div>
              <div style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '9px', lineHeight: '1.6' }}>
                <div style={{ color: '#4ade80' }}>$ npm run build</div>
                <div style={{ color: colors.textMuted }}>✓ Compiled successfully</div>
                <div style={{ color: colors.textMuted }}>✓ 12 pages generated</div>
                <div style={{ color: '#60a5fa' }}>$ _</div>
                    </div>
                </div>
                
            {/* Chat Screen */}
              <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              transform: 'rotate(3deg) translateY(-40px) translateX(-20px)',
              boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 15px 30px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ padding: '8px 12px', background: colors.bgTertiary, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
            </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.bgTertiary }} />
                  <div style={{ flex: 1, height: '20px', background: colors.bgTertiary, borderRadius: '10px' }} />
              </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', justifyContent: 'flex-end' }}>
                  <div style={{ width: '60%', height: '20px', background: '#60a5fa', borderRadius: '10px', opacity: 0.3 }} />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: colors.bgTertiary }} />
                  <div style={{ width: '50%', height: '20px', background: colors.bgTertiary, borderRadius: '10px' }} />
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* START WITH AN IDEA - Carousel Section */}
      <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '4rem auto',
          padding: '0 2rem'
        }}>
          {/* Title */}
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            Start with an idea
          </h2>

          {/* Category Tabs - Pill Style wie Replit */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '25px',
                  border: 'none',
                  background: selectedCategory === category ? colors.text : colors.bgTertiary,
                  color: selectedCategory === category ? colors.bg : colors.textSecondary,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Template Cards - Continuous Carousel */}
          <div style={{
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {(() => {
              // Alle Karten in einem Array
              const allCards = [
                { title: 'AI Chat', type: 'AI Apps', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop' },
                { title: 'Brainstorming buddy', type: 'AI Apps', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' },
                { title: 'Recipe generator', type: 'AI Apps', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop' },
                { title: 'Code Assistant', type: 'AI Apps', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop' },
                { title: 'Image Generator', type: 'AI Apps', image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&h=400&fit=crop' },
                { title: 'Analytics Dashboard', type: 'Web App', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
                { title: 'Online Store', type: 'E-Commerce', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop' },
                { title: 'Developer Portfolio', type: 'Website', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop' }
              ];
              
              // Berechne die Verschiebung basierend auf dem Tab-Index
              const cardWidth = 100 / 3; // Jede Karte nimmt 1/3 der Breite ein
              const translateX = selectedCategoryIndex * cardWidth;
                
                return (
                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  transform: `translateX(-${translateX}%)`,
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {allCards.map((card, cardIndex) => (
                  <div
                      key={cardIndex}
                    style={{
                        flex: '0 0 calc(33.333% - 1rem)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = theme === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* VibeAI Logo */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Sparkles size={14} color="#60a5fa" />
                          <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '600' }}>VibeAI</span>
                        </div>
                          </div>
                          
                      {/* Footer */}
                      <div style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.text, margin: 0 }}>{card.title}</h3>
                          <span style={{ background: colors.bgTertiary, color: colors.textSecondary, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem' }}>{card.type}</span>
                          </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textMuted, fontSize: '0.85rem' }}>
                          <Sparkles size={14} color="#f97316" />
                          <span>VibeAI</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                );
            })()}
            </div>
          </div>

        {/* Company Logos Karussell + Logo Icon */}
          <div style={{
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginTop: '6rem',
          background: '#1a1a1a',
            paddingBottom: '4rem'
          }}>
            {/* Logos Karussell */}
            <div style={{
              width: '100%',
              padding: '4rem 0',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <style>{`
                @keyframes scrollLogos {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                .logos-container {
                  animation: scrollLogos 30s linear infinite;
                }
              `}</style>
              <div className="logos-container" style={{
                display: 'flex',
                gap: '5rem',
                alignItems: 'center',
                width: 'fit-content',
                minWidth: '200%'
              }}>
                {/* Doppelte Logos für endloses Loop */}
                {[...Array(2)].map((_, loopIndex) => (
                  <div key={loopIndex} style={{ display: 'flex', gap: '5rem', alignItems: 'center' }}>
                    {[
                      { name: 'PLAID', style: { fontWeight: '800', letterSpacing: '0.15em', fontSize: '1.3rem' } },
                      { name: 'Adobe', style: { fontWeight: '700', fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontStyle: 'normal' } },
                      { name: 'ATLASSIAN', style: { fontWeight: '500', letterSpacing: '0.08em', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }, prefix: '◢' },
                      { name: 'BOEING', style: { fontWeight: '400', fontStyle: 'italic', fontSize: '1.4rem', letterSpacing: '0.05em' }, prefix: '✈' },
                      { name: 'ClickUp', style: { fontWeight: '700', fontSize: '1.5rem' }, prefix: '◆' },
                      { name: 'coinbase', style: { fontWeight: '500', fontSize: '1.4rem', letterSpacing: '-0.02em' } },
                      { name: 'duolingo', style: { fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.01em' } },
                      { name: 'Google', style: { fontWeight: '500', fontSize: '1.5rem', fontFamily: '"Product Sans", -apple-system, sans-serif' } },
                      { name: 'Microsoft', style: { fontWeight: '600', fontSize: '1.4rem', fontFamily: '"Segoe UI", sans-serif' } },
                      { name: 'Stripe', style: { fontWeight: '700', fontSize: '1.5rem', letterSpacing: '-0.02em' } }
                    ].map((company, index) => (
                      <div
                        key={`${loopIndex}-${index}`}
                        style={{
                          color: '#888888',
                          whiteSpace: 'nowrap',
                          opacity: 0.8,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          ...company.style
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                      >
                        {company.prefix && <span>{company.prefix}</span>}
                        {company.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section - Enterprise Controls, Workflow Automation, Agent Chat */}
            <div style={{
              width: '100%',
              maxWidth: '1200px',
              margin: '6rem auto 0',
              padding: '4rem 2rem',
              background: '#1f1f1f',
              borderRadius: '16px',
              border: '1px solid #333333'
            }}>
              {/* Titel oben */}
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '4rem'
              }}>
                Build smarter, ship faster
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem'
              }}>
                {/* Enterprise Controls */}
                <div style={{
                  background: colors.bgSecondary,
                  borderRadius: '12px',
                  padding: '2rem',
                  border: `1px solid ${colors.border}`,
                  boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Visuelle Elemente oben */}
                  <div style={{ 
                    marginBottom: '2rem',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '1.5rem'
                  }}>
                    {/* Checkboxen Liste */}
                    <div style={{ 
                      marginBottom: '1.5rem',
                      background: colors.bgSecondary,
                      borderRadius: '6px',
                      padding: '1rem'
                    }}>
                      {[
                        'Role-based access controls (RBAC)',
                        'SOC 2 compliant',
                        'SAML / Identity Provider support',
                        'Single Sign-On (SSO)',
                        'Centralized admin controls'
                      ].map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.75rem'
                        }}>
                          <CheckSquare size={18} color="#10b981" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem', color: '#666666' }}>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bars */}
                    <div style={{
                      background: 'white',
                      borderRadius: '6px',
                      padding: '1rem'
                    }}>
                      {[
                        { label: 'SOC 2', value: 84 },
                        { label: 'SAST 2', value: 62 },
                        { label: 'Pre-Deploy Evaluation', value: 35 }
                      ].map((item, index) => (
                        <div key={index} style={{ marginBottom: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '600' }}>{item.label}</span>
                            <span style={{ fontSize: '0.85rem', color: '#666666', fontWeight: '600' }}>{item.value}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e5e5e5',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${item.value}%`,
                              height: '100%',
                              background: '#10b981',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text unten */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <CheckCircle size={20} color="#1976d2" />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#000000',
                        margin: 0
                      }}>
                        Enterprise Controls
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#666666',
                      marginBottom: '0.5rem'
                    }}>
                      Security & controls that scale to enterprise.
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#666666',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      SSO/SAML, SOC2 & all the standard Enterprise admin controls. Plus, pre deployment security screening, secure in-built services and better defaults to ensure the apps you build remain secure too.
                    </p>
                  </div>
                </div>

                {/* Workflow Automation */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Flowchart oben - Graue Box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    padding: '1.5rem'
                  }}>
                    {[
                      { title: 'Trigger', desc: 'Start automation sequence' },
                      { title: 'Agent 1', desc: 'Intake target information' },
                      { title: 'Agent 2', desc: 'Create an action plan' },
                      { title: 'Agent 3', desc: 'Publish action plan to app' }
                    ].map((step, index) => (
                      <div key={index} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '100%',
                          background: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          padding: '1rem',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>
                            {step.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                            {step.desc}
                          </div>
                        </div>
                        {index < 3 && (
                          <div style={{
                            width: '2px',
                            height: '1rem',
                            background: '#d0d0d0',
                            margin: '0.25rem 0',
                            borderStyle: 'dashed',
                            borderWidth: '0 0 2px 0',
                            borderColor: '#d0d0d0'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Text unten */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <RefreshCw size={20} color="#1976d2" />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#000000',
                        margin: 0
                      }}>
                        Workflow Automation
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#666666',
                      marginBottom: '0.5rem'
                    }}>
                      Automate the routine, focus on what matters.
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#666666',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      Create agents and automations to handle repetitive or operational work. Plug them into tools & data you already use, and build bots or automations that save you time to focus on what truly matters.
                    </p>
                  </div>
                </div>

                {/* Agent Chat */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Build → Text Box → Publish Flow oben - Graue Box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    background: '#f8f8f8',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    padding: '1.5rem'
                  }}>
                    {/* Build Button */}
                    <button style={{
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      width: '100%',
                      justifyContent: 'center'
                    }}>
                      <Box size={18} />
                      Build
                    </button>
                    
                    <div style={{
                      width: '2px',
                      height: '0.75rem',
                      background: '#d0d0d0',
                      borderStyle: 'dashed',
                      borderWidth: '0 0 2px 0',
                      borderColor: '#d0d0d0'
                    }} />
                    
                    {/* Text Box */}
                    <div style={{
                      width: '100%',
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      padding: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#666666',
                      lineHeight: '1.6',
                      minHeight: '120px'
                    }}>
                      Design an AI fitness app that opens with a live AI coach in the hero. Users can ask for workouts, training plans, or recovery advice, and see results appear instantly in a bold, athletic interface.
                    </div>
                    
                    <div style={{
                      width: '2px',
                      height: '0.75rem',
                      background: '#d0d0d0',
                      borderStyle: 'dashed',
                      borderWidth: '0 0 2px 0',
                      borderColor: '#d0d0d0'
                    }} />
                    
                    {/* Publish App Button */}
                    <button style={{
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      width: '100%',
                      justifyContent: 'center'
                    }}>
                      <Globe size={18} />
                      Publish App
                    </button>
                  </div>

                  {/* Text unten */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <MessageCircle size={20} color="#1976d2" />
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#000000',
                        margin: 0
                      }}>
                        Agent Chat
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#666666',
                      marginBottom: '0.5rem'
                    }}>
                      Describe it. Publish It. Improve it.
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#666666',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      Tell the Agent what you're building — it writes real production-ready code, evolves it as you iterate, and stays out of your way while you build.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials + Plans & Pricing */}
            <div style={{
              width: '100%',
              background: colors.bg,
              marginTop: '6rem',
              padding: '0'
            }}>
              {/* Testimonials Section */}
              <div style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                paddingTop: '4rem',
                paddingBottom: '4rem',
                paddingLeft: '2rem',
                paddingRight: '2rem',
                background: colors.bg
              }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                rowGap: '0.5rem'
              }}>
                {[
                  {
                    headline: 'Our collaboration democratizes application development',
                    text: 'Our collaboration democratizes application development enabling business teams across enterprises to innovate and solve problems without traditional technical barriers. Our relationship exemplifies our commitment to making powerful development tools accessible to everyone.',
                    name: 'Deb Cupp',
                    position: 'President',
                    company: 'Microsoft Americas',
                    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
                  },
                  {
                    headline: 'I asked to clone LinkedIn',
                    text: 'just to see how far it would get with a single prompt. The result? A surprisingly functional prototype. It\'s a powerful reminder: with the right framing, today\'s AI tools can turn a single idea into working software.',
                    name: 'Reid Hoffman',
                    position: 'Co-founder',
                    company: 'LinkedIn',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
                  },
                  {
                    headline: 'Ok, I\'m addicted',
                    text: 'For my entire design career, I\'ve always had to hire developers to do even the most basic stuff for me. Having an absolute blast having a free AI programmer at my behest.',
                    name: 'Andrew Wilkinson',
                    position: 'Co-founder',
                    company: 'Tiny',
                    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces'
                  },
                  {
                    headline: 'Gets you from 0→1 in breakneck speed',
                    text: 'If I went to my developer and said, make this, it would probably take him a week of his time. I did it in an hour or two',
                    name: 'Preston Zeller',
                    position: 'Chief Growth Officer',
                    company: 'Batchdata',
                    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'
                  },
                  {
                    headline: 'I can honestly say that if it weren\'t for this',
                    text: 'and that prototype that I was able to build in two weeks, it just wouldn\'t have happened. The opportunity would have perished. Someone else would have done it first... This was the way to actually do it. And it actually completely and utterly changed the trajectory of our company in a massive way.',
                    name: 'Scott Stevenson',
                    position: 'Co-founder & CEO',
                    company: 'Spellbook',
                    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces'
                  },
                  {
                    headline: 'The ability to go from idea to working application in minutes',
                    text: 'has opened new possibilities for innovation across our portfolio. We\'re seeing apps built in 45 minutes that saves our team hours every week.',
                    name: 'Key Vaidya',
                    position: 'Portfolio CTO',
                    company: 'HG Capital',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
                  }
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    style={{
                      background: colors.bgSecondary,
      padding: '2rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <style>{`
                      @keyframes fadeInUp {
                        from {
                          opacity: 0;
                          transform: translateY(20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }
                    `}</style>
                    
                    {/* Headline */}
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: colors.text,
          marginBottom: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {testimonial.headline}
                    </h3>
                    
                    {/* Text */}
                    <p style={{
                      fontSize: '0.95rem',
                      color: colors.textSecondary,
                      lineHeight: '1.6',
                      marginBottom: '1.5rem'
                    }}>
                      {testimonial.text}
                    </p>
                    
                    {/* Author Info */}
        <div style={{
          display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      {/* Avatar */}
                      <div style={{
                        padding: '4px',
                        background: colors.bgTertiary,
                        borderRadius: '50%',
                        display: 'inline-block',
                        marginRight: '0.5rem'
                      }}>
                        <img 
                          src={testimonial.image}
                          alt={testimonial.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            display: 'block'
                          }}
                        />
                      </div>
                      
                      {/* Name, Position, Company */}
                      <div>
                        <div style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: colors.text,
                          marginBottom: '0.25rem'
                        }}>
                          {testimonial.name}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: colors.textMuted
                        }}>
                          {testimonial.position}, {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      </div>

            {/* Plans & Pricing Section */}
      <div style={{
              width: '100%',
        maxWidth: '1400px',
              margin: '0 auto',
              padding: '4rem 2rem'
            }}>
              {/* Header mit Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: colors.text,
                  margin: 0
                }}>
                  Plans & Pricing
                </h2>
                
                {/* Monthly/Yearly Toggle */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{
                    fontSize: '0.95rem',
                    color: !isYearly ? '#1976d2' : '#666666',
                    fontWeight: !isYearly ? '600' : '400',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsYearly(false)}
                  >
                    Monthly
                  </span>
                  <div 
            style={{
                      width: '48px',
                      height: '24px',
                      background: '#e0e0e0',
                      borderRadius: '12px',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsYearly(!isYearly)}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      background: '#1976d2',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: isYearly ? '26px' : '2px',
                      transition: 'left 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span 
                      style={{
                        fontSize: '0.95rem',
                        color: isYearly ? '#1976d2' : '#666666',
                        fontWeight: isYearly ? '600' : '400',
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsYearly(true)}
                    >
                      Yearly
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      background: '#ff8c42',
              color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Save up to 20%
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                rowGap: '2rem'
              }}>
                {[
                  {
                    name: 'Starter',
                    price: 'Free',
                    description: 'Explore the possibilities of making apps.',
                    buttonText: 'Sign up',
                    buttonStyle: 'light',
                    route: '/register?plan=starter',
                    features: [
                      'Vibe AI Agent trial included',
                      '10 development apps',
                      'Public apps only',
                      'Limited build time',
                      'Basic Editor access',
                      'Basic Chat Generator'
                    ]
                  },
                  {
                    name: 'Vibe AI Core',
                    price: '24,99',
                    priceCurrency: '€',
                    pricePeriod: 'pro Monat',
                    yearlyPrice: '239,88',
                    yearlyPriceMonthly: '19,99',
                    yearlyDiscount: '20%',
                    description: 'Make, launch, and scale your apps.',
                    buttonText: 'Join Vibe AI Core',
                    buttonStyle: 'primary',
                    route: '/register?plan=core',
                    features: [
                      'Full Vibe AI Agent access',
                      'Editor access with syntax highlighting',
                      'Chat Generator & Prompt Generator',
                      'Private and public apps',
                      'GitHub integration & Commit',
                      'ZIP export functionality',
                      'Access to latest AI models',
                      'Publish and host live apps',
                      'Autonomous long builds'
                    ]
                  },
                  {
                    name: 'Vibe AI Pro+',
                    price: '39,99',
                    priceCurrency: '€',
                    pricePeriod: 'pro Monat',
                    yearlyPrice: '383,90',
                    yearlyPriceMonthly: '31,99',
                    yearlyDiscount: '20%',
                    description: 'Advanced features for professional developers.',
                    buttonText: 'Join Vibe AI Pro+',
                    buttonStyle: 'primary',
                    route: '/register?plan=pro',
                    features: [
                      'Everything in Vibe AI Core',
                      'Advanced Editor with AI assistance',
                      'Enhanced Chat & Prompt Generator',
                      'Unlimited GitHub commits',
                      'Priority AI model access',
                      'Advanced ZIP export options',
                      'Project templates library',
                      'Extended build time',
                      'Priority support'
                    ]
                  },
                  {
                    name: 'Vibe AI Ultra',
                    price: '54,99',
                    priceCurrency: '€',
                    pricePeriod: 'pro Monat',
                    yearlyPrice: '527,90',
                    yearlyPriceMonthly: '43,99',
                    yearlyDiscount: '20%',
                    description: 'Maximum power for serious development.',
                    buttonText: 'Join Vibe AI Ultra',
                    buttonStyle: 'primary',
                    route: '/register?plan=ultra',
                    features: [
                      'Everything in Vibe AI Pro+',
                      'Premium Editor with live collaboration',
                      'Advanced Chat & Prompt features',
                      'Unlimited projects & apps',
                      'Premium AI models access',
                      'Advanced GitHub workflows',
                      'Custom project templates',
                      'Extended autonomous builds',
                      '24/7 priority support'
                    ]
                  },
                  {
                    name: 'Vibe AI Ultra+',
                    price: '79,99',
                    priceCurrency: '€',
                    pricePeriod: 'pro Monat',
                    yearlyPrice: '767,90',
                    yearlyPriceMonthly: '63,99',
                    yearlyDiscount: '20%',
                    description: 'Complete development suite with app store publishing.',
                    buttonText: 'Join Vibe AI Ultra+',
                    buttonStyle: 'primary',
                    route: '/register?plan=ultraplus',
                    features: [
                      'Everything in Vibe AI Ultra',
                      'Unlimited APK generation',
                      'App Store preparation & setup',
                      'Automatic app store publishing',
                      'Advanced project management',
                      'Custom domain integration',
                      'White-label options',
                      'Advanced analytics',
                      'Dedicated account manager'
                    ]
                  },
                  {
                    name: 'Teams',
                    price: '99,99',
                    priceCurrency: '€',
                    pricePeriod: 'pro Nutzer pro Monat',
                    yearlyPrice: '959,90',
                    yearlyPriceMonthly: '79,99',
                    yearlyDiscount: '20%',
                    description: 'Collaborate with your entire team in real-time.',
                    buttonText: 'Join Vibe AI Teams',
                    buttonStyle: 'light',
                    route: '/register?plan=teams',
                    features: [
                      'Everything in Vibe AI Ultra+',
                      'Real-time team collaboration',
                      'Simultaneous Editor access',
                      'Shared Chat & Prompt workspace',
                      'Team project management',
                      'Project extension & completion',
                      'Team-wide GitHub integration',
                      'Centralized billing',
                      'Role-based access control',
                      '50 Viewer seats included'
                    ]
                  },
                  {
                    name: 'On Demand',
                    price: 'Pay-as-you-go',
                    description: 'Pay only for what you use.',
                    buttonText: 'Get Started',
                    buttonStyle: 'light',
                    route: '/register?plan=ondemand',
                    features: [
                      'Flexible pricing model',
                      'Pay per API call',
                      'Pay per build minute',
                      'Pay per storage GB',
                      'No monthly commitment',
                      'Scale as you grow',
                      'Usage-based billing',
                      'Real-time usage tracking'
                    ]
                  },
                  {
                    name: 'Enterprise',
                    price: 'Custom pricing',
                    description: 'Enterprise-grade solutions with dedicated support.',
                    buttonText: 'Contact us',
                    buttonStyle: 'light',
                    route: '/register?plan=enterprise',
                    features: [
                      'Everything in Teams',
                      'Custom database creation',
                      'PostgreSQL, MySQL, MongoDB',
                      'Redis, SQLite, DynamoDB',
                      'Custom database configurations',
                      'SSO/SAML integration',
                      'SCIM provisioning',
                      'Advanced security controls',
                      'Dedicated infrastructure',
                      'Custom SLA & support',
                      'On-premise deployment options'
                    ]
                  }
                ].map((plan, index) => (
                  <div
                    key={index}
                    style={{
                      background: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
              padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                    onClick={() => {
                      // Weiterleitung zu Setup-Seiten oder Pricing-Detail-Seiten
                      if (plan.name === 'Starter' || plan.name === 'Enterprise' || plan.name === 'Teams') {
                        const planSlugMap = {
                          'Starter': 'starter',
                          'Enterprise': 'enterprise',
                          'Teams': 'teams'
                        };
                        const planSlug = planSlugMap[plan.name] || plan.name.toLowerCase().replace(/\s+/g, '-');
                        window.location.href = `/pricing/${planSlug}`;
                      } else {
                        // Zu Setup-Seiten
                        const setupSlugMap = {
                          'Vibe AI Core': '/core/setup',
                          'Vibe AI Pro+': '/pro-plus/setup',
                          'Vibe AI Ultra': '/ultra/setup',
                          'Vibe AI Ultra+': '/ultra-plus/setup',
                          'On Demand': '/on-demand/setup'
                        };
                        const setupPath = setupSlugMap[plan.name] || '/core/setup';
                        window.location.href = setupPath;
                      }
                    }}
                  >
                    {/* Plan Name */}
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: '0.5rem'
                    }}>
                      {plan.name}
                    </h3>
                    
                    {/* Price */}
                    <div style={{
                      marginBottom: '0.5rem'
                    }}>
                      {plan.price === 'Free' ? (
                        <span style={{
              fontSize: '2rem',
                          fontWeight: '700',
                          color: colors.text
                        }}>
                          {plan.price}
                        </span>
                      ) : plan.price === 'Custom pricing' ? (
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: colors.text
                        }}>
                          {plan.price}
                        </span>
                      ) : plan.price === 'Pay-as-you-go' ? (
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: colors.text
                        }}>
                          {plan.price}
                        </span>
                      ) : (
                        <>
                          {isYearly && plan.yearlyPrice ? (
                            <>
                              <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.5rem',
                                marginBottom: '0.25rem'
                              }}>
                                <span style={{
                                  fontSize: '1.25rem',
                                  fontWeight: '400',
                                  color: '#999999',
                                  textDecoration: 'line-through'
                                }}>
                                  {(parseFloat(plan.price.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}{plan.priceCurrency}
                                </span>
                                <span style={{
                                  fontSize: '2rem',
                                  fontWeight: '700',
                                  color: colors.text
                                }}>
                                  {plan.yearlyPrice}
                                </span>
                                {plan.priceCurrency && (
                                  <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: colors.text
                                  }}>
                                    {plan.priceCurrency}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: '0.95rem',
                                color: colors.textSecondary
                              }}>
                                pro Jahr
                              </div>
                              {plan.yearlyDiscount && (
                                <div style={{
                                  fontSize: '0.85rem',
                                  color: '#ff8c42',
                                  marginTop: '0.25rem',
                                  fontWeight: '600'
                                }}>
                                  {plan.yearlyDiscount} Rabatt
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.25rem'
                              }}>
                                <span style={{
                                  fontSize: '2rem',
                                  fontWeight: '700',
                                  color: colors.text
                                }}>
                                  {plan.price}
                                </span>
                                {plan.priceCurrency && (
                                  <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    color: colors.text
                                  }}>
                                    {plan.priceCurrency}
                                  </span>
                                )}
                                <span style={{
                                  fontSize: '0.95rem',
                                  color: colors.textSecondary,
                                  marginLeft: '0.25rem'
                                }}>
                                  {plan.pricePeriod}
                                </span>
                              </div>
                              {plan.yearlyPrice && (
                                <div style={{
                                  fontSize: '0.85rem',
                                  color: colors.textSecondary,
                                  marginTop: '0.25rem'
                                }}>
                                  {plan.yearlyPrice}{plan.priceCurrency} pro Jahr
                                  {plan.yearlyDiscount && (
                                    <span style={{
                                      color: '#ff8c42',
                                      fontWeight: '600',
                                      marginLeft: '0.5rem'
                                    }}>
                                      ({plan.yearlyDiscount} Rabatt)
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Description */}
            <p style={{
                      fontSize: '0.9rem',
                      color: colors.textSecondary,
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
                      {plan.description}
                    </p>
                    
                    {/* Button */}
                    <button
                      onClick={() => router.push(plan.route)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        background: plan.buttonStyle === 'primary' ? '#ff8c42' : colors.bgTertiary,
                        color: plan.buttonStyle === 'primary' ? 'white' : colors.text,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (plan.buttonStyle === 'primary') {
                          e.currentTarget.style.background = '#e67a2e';
                        } else {
                          e.currentTarget.style.background = colors.accent;
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (plan.buttonStyle === 'primary') {
                          e.currentTarget.style.background = '#ff8c42';
                        } else {
                          e.currentTarget.style.background = colors.bgTertiary;
                          e.currentTarget.style.color = colors.text;
                        }
                      }}
                    >
                      {plan.buttonText}
                    </button>
                    
                    {/* Features */}
            <div style={{
              display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
            }}>
                      {plan.features.map((feature, idx) => (
                        <div
                  key={idx}
                  style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}
                        >
                          <CheckCircle
                            size={18}
                            style={{
                              color: '#ff8c42',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          />
                          <span style={{
                            fontSize: '0.9rem',
                            color: colors.textSecondary,
                            lineHeight: '1.5'
                          }}>
                  {feature}
                </span>
                        </div>
              ))}
            </div>
            </div>
        ))}
              </div>
            </div>
      </div>

        {/* Footer Links Section */}
        <footer style={{
          width: '100%',
          background: colors.bg,
          borderTop: `1px solid ${colors.border}`,
          marginTop: '4rem',
          padding: '4rem 2rem 2rem'
        }}>
      <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4rem',
            marginBottom: '4rem'
          }}>
            {/* HANDY LINKS */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: colors.textMuted,
                letterSpacing: '0.05em',
                marginBottom: '1.5rem'
              }}>
                HANDY LINKS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['About us', 'Vibe Coding 101', 'Help', 'How to guides', 'Import from GitHub', 'Status', 'Additional resources', 'Brand kit', 'Partnerships'].map((link) => (
                  <a key={link} href="#" style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* LEGAL */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: colors.textMuted,
                letterSpacing: '0.05em',
                marginBottom: '1.5rem'
              }}>
                LEGAL
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Terms of service', 'Commercial agreement', 'Privacy', 'Subprocessors', 'DPA', 'Report abuse'].map((link) => (
                  <a key={link} href="#" style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* CONNECT */}
            <div>
              <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: colors.textMuted,
                letterSpacing: '0.05em',
                marginBottom: '1.5rem'
              }}>
                CONNECT
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['X / Twitter', 'Tiktok', 'Facebook', 'Instagram', 'Linkedin'].map((link) => (
                  <a key={link} href="#" style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
              display: 'flex',
            justifyContent: 'space-between',
              alignItems: 'center',
            paddingTop: '2rem',
            borderTop: `1px solid ${colors.border}`
          }}>
            {/* Scroll to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                color: colors.textSecondary,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.textSecondary;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              Scroll to top
            </button>

            {/* Copyright */}
        <div style={{
              fontSize: '0.8rem',
              fontWeight: '500',
              letterSpacing: '0.05em',
              color: colors.textMuted
            }}>
              ALL RIGHTS RESERVED. COPYRIGHT © 2025 VIBEAI, INC.
            </div>
          </div>
        </footer>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
            }}>
              <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '3rem',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            border: '1px solid #333'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem'
            }}>
              <Sparkles size={32} style={{ color: '#ff8c42' }} />
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0
              }}>
                Create a VibeAI account
              </h2>
          </div>

            {/* Auth Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Google Button */}
              <button
                onClick={() => router.push('/login?provider=google&redirect=/app-builder')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3f3f46'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#27272a'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Email Button */}
              <button
                onClick={() => router.push('/register?redirect=/app-builder')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1rem 1.5rem',
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3f3f46'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#27272a'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Continue with Email
              </button>
          </div>

            {/* View more options */}
            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={() => router.push('/register?redirect=/app-builder')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a1a1aa',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
              >
                View more options
              </button>
          </div>

            {/* Already have account */}
            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem'
            }}>
              <span style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
                Already have an account?{' '}
              </span>
              <button
                onClick={() => router.push('/login?redirect=/app-builder')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Log in
              </button>
        </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: '#3f3f46',
              margin: '2rem 0 1.5rem'
            }} />

            {/* reCAPTCHA Notice */}
            <p style={{
              fontSize: '0.8rem',
              color: '#71717a',
              textAlign: 'center',
              lineHeight: '1.5',
              margin: 0
            }}>
              This site is protected by reCAPTCHA Enterprise and<br />
              the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#a1a1aa', textDecoration: 'underline' }}>
                Terms of Service
              </a>
              {' '}apply.
            </p>
      </div>
        </div>
      )}
      </div>
  );
}