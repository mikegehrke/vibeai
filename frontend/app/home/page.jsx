'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Home, Code, Globe, ChevronDown, 
  CheckCircle, ArrowRight, ExternalLink, FileCode,
  User, Bell, Users, Terminal, Palette, Sun, Moon, HelpCircle, LogOut, ChevronRight, Download,
  Cloud, Star, Smartphone, Sparkles, Rocket, Lock, DollarSign, ArrowUp, ArrowLeft, Eye, Zap, Shield, MessageCircle,
  Box, Pencil, Paperclip, Circle
} from 'lucide-react';
import AnimatedLogoIcon from '../components/AnimatedLogoIcon';
import AgentModeOverlay from '../components/AgentModeOverlay';

export default function HomePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('app');
  const [showAgentOverlay, setShowAgentOverlay] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isHoveringChat, setIsHoveringChat] = useState(false);
  const [hoveringTab, setHoveringTab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-5');
  const [currentAgent, setCurrentAgent] = useState('smart_agent');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [extendedModels, setExtendedModels] = useState([]); // Beta Models
  const [availableAgents, setAvailableAgents] = useState([]);
  const lastUserPromptRef = useRef('');
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const agentDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Typewriter Effect - stabil ohne Blinken
  useEffect(() => {
    const fullText = activeTab === 'app' 
      ? "Describe your idea, '/' for integrations..."
      : "Describe the idea you want to design...";
    
    let currentIndex = 0;
    let typeInterval = null;
    
    setPlaceholderText('');

    typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setPlaceholderText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Warte 3 Sekunden, dann starte neu
        setTimeout(() => {
          currentIndex = 0;
          setPlaceholderText('');
          // Neustart mit neuem Interval
          typeInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
              setPlaceholderText(fullText.substring(0, currentIndex));
              currentIndex++;
            }
          }, 300);
        }, 3000);
      }
    }, 300); // 300ms pro Buchstabe - konstant

    return () => {
      if (typeInterval) {
        clearInterval(typeInterval);
      }
    };
  }, [activeTab]);

  // Load available models and agents + Extended Models
  useEffect(() => {
    const loadModelsAndAgents = async () => {
      try {
        const [modelsRes, extendedRes, agentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/home/models'),
          fetch('http://localhost:8000/api/home/models/extended'),
          fetch('http://localhost:8000/api/home/agents')
        ]);
        
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setAvailableModels(modelsData.models || []);
        }
        
        if (extendedRes.ok) {
          const extendedData = await extendedRes.json();
          const models = extendedData.models || [];
          setExtendedModels(models);
          console.log(`✅ Loaded ${models.length} Extended Models:`, models);
        } else {
          console.error('❌ Failed to load extended models');
        }
        
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAvailableAgents(agentsData.agents || []);
        }
      } catch (error) {
        console.error('Error loading models/agents:', error);
      }
    };
    
    loadModelsAndAgents();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setShowModelDropdown(false);
      }
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target)) {
        setShowAgentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load messages from localStorage AFTER mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibeai_chat_history');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load chat history:', e);
        }
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('vibeai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // WebSocket Connection
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const wsUrl = token 
        ? `ws://localhost:8000/api/home/ws?token=${token}` 
        : 'ws://localhost:8000/api/home/ws';
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Connected to Home Chat WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message:', data);

          // Build Events
          if (data.event === 'build.started') {
            console.log('📦 Build started:', data);
            setMessages(prev => [...prev, {
              role: 'system',
              content: data.message || '🚀 Starting app generation...',
              timestamp: new Date(),
              type: 'build_event'
            }]);
          }
          else if (data.event === 'build.progress') {
            console.log('⚙️ Build progress:', data);
            setMessages(prev => [...prev, {
              role: 'system',
              content: data.message || '📝 Building...',
              timestamp: new Date(),
              type: 'build_event'
            }]);
          }
          else if (data.event === 'build.complete') {
            console.log('✅ Build complete:', data);
            setMessages(prev => [...prev, {
              role: 'system',
              content: data.message || '✅ App generation complete!',
              timestamp: new Date(),
              type: 'build_event',
              projectId: data.project_id,
              showEditorButton: true
            }]);
          }
          // Chat Events
          else if (data.event === 'chat.chunk') {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.content += data.content;
              } else {
                newMessages.push({
                  role: 'assistant',
                  content: data.content,
                  timestamp: new Date()
                });
              }
              return newMessages;
            });
          } else if (data.event === 'build.started' || data.event === 'build.progress' || data.event === 'build.complete') {
            setMessages(prev => [...prev, {
              role: 'system',
              content: data.message,
              timestamp: new Date()
            }]);
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = () => {
        // Silent - server might not be running
        console.log('⚠️  WebSocket connection failed (server might not be running)');
      };

      ws.onclose = () => {
        console.log('⚠️  WebSocket disconnected');
      };

      wsRef.current = ws;

      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (e) {
      console.log('⚠️  WebSocket not available (server might not be running)');
    }
  }, []);

  // Send Chat Message
  const sendMessage = async (forceBuild = false, overridePrompt = null) => {
    if (isLoading) return;

    // Bestimme den Prompt: Eingabe, Override oder letzter User-Prompt
    let effectivePrompt = overridePrompt ?? prompt;
    if (!effectivePrompt?.trim()) {
      effectivePrompt = lastUserPromptRef.current;
    }
    if (!effectivePrompt?.trim()) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      effectivePrompt = lastUserMessage?.content || '';
    }
    if (!effectivePrompt.trim()) return;

    const userMessage = {
      role: 'user',
      content: effectivePrompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = effectivePrompt;
    lastUserPromptRef.current = currentPrompt;
    setPrompt('');
    setIsLoading(true);

    // Add "thinking" message with animated icon
    const currentAgentName = availableAgents.find(a => a.id === currentAgent)?.name || currentAgent;
    const currentModelName = [...availableModels, ...extendedModels].find(m => m.id === currentModel)?.name || currentModel;
    
    // Rebranding: GPT → Vibe
    const displayModelName = currentModelName
      .replace(/GPT-5/gi, 'Vibe 5')
      .replace(/GPT-4/gi, 'Vibe 4')
      .replace(/O3/gi, 'Vibe Reasoning 3')
      .replace(/O1/gi, 'Vibe Reasoning 1')
      .replace(/Gemini/gi, 'Vibe Ultra')
      .replace(/Claude/gi, 'Vibe Advanced')
      .replace(/Qwen/gi, 'VibeAI Go')
      .replace(/Llama/gi, 'VibeAI Go');
    
    const thinkingMessage = {
      role: 'assistant',
      content: '',
      isThinking: true,
      agent_used: currentAgentName,
      model_used: displayModelName,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // Detect if user wants to build
    const shouldBuild = forceBuild || (activeTab === 'app' && (
      currentPrompt.toLowerCase().includes('erstell') ||
      currentPrompt.toLowerCase().includes('bau') ||
      currentPrompt.toLowerCase().includes('create') ||
      currentPrompt.toLowerCase().includes('build') ||
      currentPrompt.toLowerCase().includes('make app')
    ));

    try {
      const response = await fetch('http://localhost:8000/api/home/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentPrompt,
          model: currentModel,
          agent: currentAgent,
          conversation_history: messages.filter(m => !m.isThinking && m.role !== 'system' && m.type !== 'build_event').map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false,
          build_app: shouldBuild
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📩 Response received:', data);
      
      if (data.success) {
        const projectIdFromResponse = data.metadata?.project_id;

        // Remove thinking message and add real response
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isThinking);
          
          // Rebranding für Antwort
          const displayModel = (data.model_used || '')
            .replace(/gpt-5/gi, 'Vibe 5')
            .replace(/gpt-4/gi, 'Vibe 4')
            .replace(/o3/gi, 'Vibe Reasoning 3')
            .replace(/o1/gi, 'Vibe Reasoning 1')
            .replace(/gemini/gi, 'Vibe Ultra')
            .replace(/claude/gi, 'Vibe Advanced')
            .replace(/qwen/gi, 'VibeAI Go')
            .replace(/llama/gi, 'VibeAI Go');
          
          const newMessage = {
            role: 'assistant',
            content: data.response,
            model_used: displayModel,
            agent_used: data.agent_used,
            isThinking: false,
            timestamp: new Date()
          };
          console.log('✅ Adding new message:', newMessage);
          
          // Falls WS nicht greift, trotzdem Editor-Button anbieten
          if (projectIdFromResponse) {
            filtered.push({
              role: 'system',
              content: '✅ App generation started. Opening editor is available.',
              timestamp: new Date(),
              type: 'build_event',
              projectId: projectIdFromResponse,
              showEditorButton: true
            });
          }
          
          return [...filtered, newMessage];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove thinking message and show error
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, {
          role: 'system',
          content: `❌ ${error.message}`,
          timestamp: new Date()
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Key Press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Kein Typewriter - Nachrichten erscheinen sofort vollständig

  useEffect(() => {
    // Add CSS animations for progress bars and upgrade button
    const styleId = 'progress-bar-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes progressFill {
        0% { width: 0%; }
        50% { width: 30%; }
        100% { width: 0%; }
      }
      @keyframes progressGlow {
        0%, 100% { 
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
          opacity: 1;
        }
        50% { 
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.8);
          opacity: 0.9;
        }
      }
      @keyframes upgradeButtonColor {
        0%, 100% { 
          color: #ececec;
        }
        50% { 
          color: #60a5fa;
        }
      }
      @keyframes upgradeButtonGlow {
        0%, 100% { 
          text-shadow: 0 0 5px rgba(96, 165, 250, 0.3);
        }
        50% { 
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
        }
      }
      /* Hide scrollbars but keep scrolling */}
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      textarea::-webkit-scrollbar {
        display: none;
      }
      textarea {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      /* Custom scrollbar for chat */
      div::-webkit-scrollbar {
        width: 6px;
      }
      div::-webkit-scrollbar-track {
        background: transparent;
      }
      div::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }
      div::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.1);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ececec',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left Sidebar - Same as Teams Setup */}
      <div style={{
        width: '280px',
        background: '#1f1f1f',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        position: 'fixed',
        height: '100vh',
        overflow: 'hidden',
        left: 0,
        top: 0
      }}>
        {/* Top Content - No Scroll */}
        <div style={{
          flexShrink: 0
        }}>
        {/* Top Bar - Logo Icon only, Search-Icon rechts */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0'
        }}>
          {/* Logo Icon only - Links */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={dropdownRef}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <AnimatedLogoIcon size={16} />
            </Link>
            <ChevronDown size={16} color="#ececec" style={{ cursor: 'pointer' }} onClick={() => setShowDropdown(!showDropdown)} />

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.5rem',
              background: '#2a2a2a',
              border: '1px solid #2f2f2f',
              borderRadius: '8px',
              minWidth: '240px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}>
                  MG
                </div>
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Account</span>
              </div>

              <Link href="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Profile</span>
              </Link>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: '#333',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
              >
                <Bell size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Notifications</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Users size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Create Team</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Terminal size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>CLUI</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Palette size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Theme</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('dark');
                    }}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      background: theme === 'dark' ? '#333' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Moon size={16} color={theme === 'dark' ? '#ececec' : '#999'} />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('light');
                    }}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      background: theme === 'light' ? '#333' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Sun size={16} color={theme === 'light' ? '#ececec' : '#999'} />
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HelpCircle size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Help</span>
                </div>
                <ChevronRight size={16} color="#999" />
              </div>

              <div style={{
                borderTop: '1px solid #2f2f2f',
                marginTop: '0.5rem',
                paddingTop: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Log out</span>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Search Icon - Rechts */}
          <button style={{
            padding: '0.5rem',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Search size={18} color="#ececec" />
          </button>
        </div>

        {/* Create App Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          color: '#ececec',
          border: '1px solid #4a4a4a',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '0',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-start',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Plus size={16} />
          Create App
        </button>

        {/* Import Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          color: '#ececec',
          border: '1px solid #4a4a4a',
          borderRadius: '6px',
          fontWeight: '500',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '0',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-start',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Download size={16} color="#ececec" />
          Import code or design
        </button>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '0', marginTop: '0.5rem' }}>
          <Link href="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Home size={18} color="#ececec" />
            Home
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Code size={18} color="#ececec" />
            Apps
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Globe size={18} color="#ececec" />
            Published apps
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FileCode size={18} color="#ececec" />
            Developer Frameworks
          </Link>
        </nav>

        {/* Learn Section */}
        <div style={{ marginBottom: '0', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: 'none' }}>
          <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learn
          </div>
          <Link href="#" style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            Learn
          </Link>
          <Link href="#" style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            Documentation
          </Link>
        </div>
        </div>

        {/* Starter Plan Section - Fixed at bottom */}
        <div style={{
          background: '#1f1f1f',
          borderRadius: '0',
          padding: '1rem',
          border: 'none',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Starter Plan
          </div>
          
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Approaching plan limit for Public Apps.
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Code size={14} color="#999" />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Free Apps: 7/10 created</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '70%',
                height: '100%',
                background: '#60a5fa',
                borderRadius: '3px'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AnimatedLogoIcon size={14} />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Agent credits: 70% used</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div 
                id="agent-progress-bar"
                style={{
                  width: '70%',
                  height: '100%',
                  background: '#60a5fa',
                  borderRadius: '3px',
                  animation: 'progressFill 3s ease-in-out infinite, progressGlow 2s ease-in-out infinite',
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cloud size={14} color="#999" />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Cloud credits: 0% used</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div 
                id="cloud-progress-bar"
                style={{
                  width: '0%',
                  height: '100%',
                  background: '#60a5fa',
                  borderRadius: '3px',
                  animation: 'progressFill 3s ease-in-out infinite 0.5s, progressGlow 2s ease-in-out infinite 0.5s',
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }} 
              />
            </div>
          </div>

          <Link href="/pro-plus/setup" style={{
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            color: '#ececec',
            border: '1px solid #4a4a4a',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.75rem',
            cursor: 'pointer',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            transition: 'background 0.2s',
            textDecoration: 'none',
            animation: 'upgradeButtonColor 2s ease-in-out infinite, upgradeButtonGlow 2s ease-in-out infinite'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Sparkles size={14} color="currentColor" style={{ animation: 'upgradeButtonColor 2s ease-in-out infinite' }} />
            Upgrade to Vibe AI Pro+
          </Link>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>
                Install Vibe AI on
              </span>
              <Smartphone size={16} color="#999" />
            </div>
          </div>
        </div>
      </div>

      {/* Central Content Area - Pricing Plans */}
      <div style={{
        flex: 1,
        padding: '0',
        overflowY: 'auto',
        overflowX: 'hidden',
        marginLeft: '280px',
        height: '100vh',
        background: '#1a1a1a'
      }}
      className="hide-scrollbar"
      >
        {/* Main Content Area - Chat Interface */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh'
        }}>
          {/* Headline */}
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '400',
            color: '#ffffff',
            marginBottom: '3rem',
            textAlign: 'center',
            letterSpacing: '-0.02em'
          }}>
            Hi mike, what do you want to make?
          </h1>

          {/* Tab Navigation + Chat Container */}
          <div style={{
            width: '100%',
            maxWidth: '900px',
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
              <button
                onClick={() => setActiveTab('app')}
                onMouseEnter={() => setHoveringTab('app')}
                onMouseLeave={() => setHoveringTab(null)}
                style={{
                  flex: 1,
                  padding: '1rem 2rem',
                  background: activeTab === 'app' ? 'transparent' : '#2a2a2a',
                  border: activeTab === 'app' 
                    ? `1px solid #3b82f6` 
                    : 'none',
                  borderBottom: activeTab === 'app' ? `1px solid #1a1a1a` : `1px solid #3b82f6`,
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0',
                  color: '#9ca3af',
                  fontSize: '0.95rem',
                  fontWeight: '400',
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
              <button
                onClick={() => setActiveTab('design')}
                onMouseEnter={() => setHoveringTab('design')}
                onMouseLeave={() => setHoveringTab(null)}
                style={{
                  flex: 1,
                  padding: '1rem 2rem',
                  background: activeTab === 'design' ? 'transparent' : '#2a2a2a',
                  border: activeTab === 'design' 
                    ? `1px solid #3b82f6` 
                    : 'none',
                  borderBottom: activeTab === 'design' ? `1px solid #1a1a1a` : `1px solid #3b82f6`,
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0',
                  color: '#9ca3af',
                  fontSize: '0.95rem',
                  fontWeight: '400',
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

            {/* Chat Container - FESTE GRÖSSE */}
            <div 
              onMouseEnter={() => setIsHoveringChat(true)}
              onMouseLeave={() => setIsHoveringChat(false)}
              style={{
                background: '#1a1a1a',
                border: `1px solid #3b82f6`,
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
            >
              {/* Scrollable Chat + Input Area */}
              <div 
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.5rem',
                  paddingBottom: '80px', // Space for fixed buttons
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  scrollbarColor: 'rgba(255, 255, 255, 0.05) transparent',
                  scrollbarWidth: 'thin'
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
                      minWidth: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {msg.role === 'user' ? (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          MG
                        </div>
                      ) : (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          opacity: msg.isThinking ? 1 : 0.6
                        }}>
                          <AnimatedLogoIcon 
                            size={32} 
                            color={msg.isThinking ? undefined : '#3b82f6'}
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div style={{ 
                      flex: 1,
                      textAlign: msg.role === 'user' ? 'right' : 'left'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '0.5rem', 
                        color: '#9ca3af',
                        fontSize: '0.85rem'
                      }}>
                        {msg.role === 'user' ? 'You' : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ fontWeight: '600' }}>
                              {msg.agent_used || currentAgent || 'AI'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              using {msg.model_used || currentModel || 'AI'}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        color: msg.type === 'build_event' ? '#10b981' : '#e5e5e5',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}>
                        {msg.content}
                      </div>
                      
                      {/* Editor Button */}
                      {/* TEST: Editor Button IMMER anzeigen bei System-Messages */}
                      {msg.role === 'assistant' && msg.content?.includes('Starting app generation') && (
                        <button
                          onClick={() => {
                            const testProjectId = `test_${Date.now()}`;
                            console.log('🎯 Editor button clicked! Going to:', `/builder/${testProjectId}`);
                            window.location.href = `/builder/${testProjectId}`;
                          }}
                          style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                            <path d="M2 2l7.586 7.586"/>
                          </svg>
                          Open in Editor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Input Area - appears where user types */}
                <div style={{ position: 'relative', minHeight: '40px' }}>
                  {prompt === '' && messages.length === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      color: '#6b7280',
                      fontSize: '0.95rem',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      lineHeight: '1.6',
                      pointerEvents: 'none'
                    }}>
                      {placeholderText}
                    </div>
                  )}
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      lineHeight: '1.6',
                      overflowY: 'hidden',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    placeholder=""
                  />
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Bottom Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#1a1a1a',
                borderTop: 'none',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
              }}>
                {/* Left Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Model Dropdown */}
                  <div ref={modelDropdownRef} style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0'
                      }}>
                      {currentModel}
                      <ChevronDown size={16} />
                    </button>
                    {showModelDropdown && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        marginBottom: '0.5rem',
                        background: '#2a2a2a',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        minWidth: '250px',
                        zIndex: 1000
                      }}>
                        {/* Standard Models */}
                        <div style={{ padding: '0.75rem 1rem', background: '#1a1a1a', borderBottom: '1px solid #3a3a3a' }}>
                          <div style={{ color: '#3b82f6', fontWeight: '700', fontSize: '0.85rem' }}>
                            ✅ Standard Models ({availableModels.length})
                          </div>
                        </div>
                        {availableModels.map((model, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentModel(model.id);
                              setShowModelDropdown(false);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              color: currentModel === model.id ? '#3b82f6' : '#e5e5e5',
                              fontSize: '0.9rem',
                              borderBottom: '1px solid #3a3a3a'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#333'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: '600' }}>{model.icon} {model.name}</div>
                          </div>
                        ))}
                        
                        {/* Extended Models - Nach Provider gruppiert */}
                        {extendedModels.length > 0 && (
                          <>
                            <div style={{ padding: '0.75rem 1rem', background: '#1a1a1a', borderTop: '2px solid #3b82f6', borderBottom: '1px solid #3a3a3a' }}>
                              <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>
                                🧪 Beta Models ({extendedModels.length}) - Zum Testen
                              </div>
                            </div>
                            
                            {/* OpenAI Extended */}
                            {extendedModels.filter(m => m.provider === 'openai').length > 0 && (
                              <>
                                <div style={{ padding: '0.5rem 1rem', background: '#252525', fontSize: '0.75rem', color: '#999' }}>
                                  OpenAI ({extendedModels.filter(m => m.provider === 'openai').length})
                                </div>
                                {extendedModels.filter(m => m.provider === 'openai').map((model, idx) => (
                                  <div
                                    key={`ext-${idx}`}
                                    onClick={() => {
                                      setCurrentModel(model.id);
                                      setShowModelDropdown(false);
                                    }}
                                    style={{
                                      padding: '0.75rem 1rem',
                                      cursor: 'pointer',
                                      color: currentModel === model.id ? '#10b981' : '#e5e5e5',
                                      fontSize: '0.85rem',
                                      borderBottom: '1px solid #3a3a3a',
                                      paddingLeft: '1.5rem'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#333'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                  >
                                    {model.icon} {model.name}
                                  </div>
                                ))}
                              </>
                            )}
                            
                            {/* Gemini Extended */}
                            {extendedModels.filter(m => m.provider === 'google').length > 0 && (
                              <>
                                <div style={{ padding: '0.5rem 1rem', background: '#252525', fontSize: '0.75rem', color: '#999' }}>
                                  Gemini ({extendedModels.filter(m => m.provider === 'google').length})
                                </div>
                                {extendedModels.filter(m => m.provider === 'google').map((model, idx) => (
                                  <div
                                    key={`gem-${idx}`}
                                    onClick={() => {
                                      setCurrentModel(model.id);
                                      setShowModelDropdown(false);
                                    }}
                                    style={{
                                      padding: '0.75rem 1rem',
                                      cursor: 'pointer',
                                      color: currentModel === model.id ? '#10b981' : '#e5e5e5',
                                      fontSize: '0.85rem',
                                      borderBottom: '1px solid #3a3a3a',
                                      paddingLeft: '1.5rem'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#333'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                  >
                                    {model.icon} {model.name}
                                  </div>
                                ))}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Agent Button - Opens Overlay */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowAgentOverlay(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0'
                      }}>
                      {Array.isArray(availableAgents) ? (availableAgents.find(a => a.id === currentAgent)?.name || currentAgent) : currentAgent}
                      <ChevronDown size={16} />
                    </button>
                    {false && showAgentDropdown && Array.isArray(availableAgents) && availableAgents.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        marginBottom: '0.5rem',
                        background: '#2a2a2a',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        minWidth: '200px',
                        zIndex: 1000
                      }}>
                        {availableAgents.map((agent, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentAgent(agent.id);
                              setShowAgentDropdown(false);
                            }}
                            style={{
                              padding: '0.75rem 1rem',
                              cursor: 'pointer',
                              color: currentAgent === agent.id ? '#3b82f6' : '#e5e5e5',
                              fontSize: '0.9rem',
                              borderBottom: idx < availableAgents.length - 1 ? '1px solid #3a3a3a' : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#333'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: '600' }}>{agent.name}</div>
                            {agent.description && (
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                {agent.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeTab === 'app' && (
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0'
                    }}>
                      <Box size={18} />
                      Build
                      <ChevronDown size={16} />
                    </button>
                  )}
                  <button style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}>
                    <Paperclip size={20} />
                  </button>
                </div>

                {/* Right Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {activeTab === 'app' && (
                    <button
                      onClick={() => setShowAgentOverlay(true)}
                      style={{
                        background: '#9b8b5e',
                        borderRadius: '8px',
                        padding: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Agent Mode - Wähle deinen Agent"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                      </svg>
                    </button>
                  )}
                  <span 
                    onClick={() => {
                      console.log('🚀 START clicked!', { prompt, isLoading });
                      sendMessage(true);
                    }}
                    style={{
                      color: isLoading ? '#6b7280' : '#9ca3af',
                      fontSize: '0.95rem',
                      fontWeight: '400',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: isLoading ? 0.5 : 1
                    }}>
                    {isLoading ? 'Sending...' : 'Start'}
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Web App Dropdown */}
          <div style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Globe size={16} color="#999" />
            <span style={{ fontSize: '0.9rem', color: '#999' }}>Web app</span>
            <ChevronDown size={14} color="#999" />
          </div>

          {/* Fast Mode Info */}
          <div style={{
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#666'
          }}>
            <Circle size={12} color="#666" />
            <span>Fast mode - create a quick version of your app with key features.</span>
          </div>
        </div>
      </div>
      
      {/* Agent Mode Overlay */}
      <AgentModeOverlay
        isOpen={showAgentOverlay}
        onClose={() => setShowAgentOverlay(false)}
        onSelectAgent={(agentId) => setCurrentAgent(agentId)}
        onSelectModel={(modelId) => setCurrentModel(modelId)}
        currentAgent={currentAgent}
        currentModel={currentModel}
        extendedModels={extendedModels}
      />
    </div>
  );
}
