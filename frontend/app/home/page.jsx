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

export default function HomePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('app');
  const [prompt, setPrompt] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isHoveringChat, setIsHoveringChat] = useState(false);
  const [hoveringTab, setHoveringTab] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4');
  const [currentAgent, setCurrentAgent] = useState('smart_agent');
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const [displayedText, setDisplayedText] = useState('');
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);
  const typingIntervalRef = useRef(null);

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

  // WebSocket Connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️  No token found - skipping WebSocket connection');
      return;
    }

    try {
      const ws = new WebSocket(`ws://localhost:8000/api/home/ws?token=${token}`);
      
      ws.onopen = () => {
        console.log('✅ Connected to Home Chat WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message:', data);

          if (data.event === 'chat.chunk') {
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
  const sendMessage = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);

    // Add "thinking" message with animated icon
    const thinkingMessage = {
      role: 'assistant',
      content: '',
      isThinking: true,
      agent_used: currentAgent === 'smart_agent' ? 'Smart Agent' : 'AI Assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

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
          conversation_history: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: true,
          build_app: activeTab === 'app' && (
            currentPrompt.toLowerCase().includes('build') ||
            currentPrompt.toLowerCase().includes('create') ||
            currentPrompt.toLowerCase().includes('make')
          )
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove thinking message and add real response
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isThinking);
          return [...filtered, {
            role: 'assistant',
            content: data.response,
            model_used: data.model_used,
            agent_used: data.agent_used,
            isThinking: false,
            timestamp: new Date()
          }];
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

  // Typewriter Effect for Agent Messages
  useEffect(() => {
    // Find the last assistant message that needs typing
    const lastAssistantIdx = messages.findLastIndex(m => m.role === 'assistant' && !m.isThinking && !m.typingComplete);
    
    if (lastAssistantIdx !== -1 && lastAssistantIdx !== typingMessageIndex) {
      const message = messages[lastAssistantIdx];
      
      // Clear previous interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      setTypingMessageIndex(lastAssistantIdx);
      setDisplayedText('');
      
      let charIndex = 0;
      const fullText = message.content;
      
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingIntervalRef.current);
          // Mark message as typing complete
          setMessages(prev => {
            const updated = [...prev];
            if (updated[lastAssistantIdx]) {
              updated[lastAssistantIdx].typingComplete = true;
            }
            return updated;
          });
          setTypingMessageIndex(null);
        }
      }, 15); // 15ms per character = schnellere, natürliche Geschwindigkeit
      
      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      };
    }
  }, [messages, typingMessageIndex]);

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
      /* Hide scrollbars but keep scrolling */
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
                <User size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Profile</span>
              </div>

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

            {/* Chat Container - ALLE 4 Ecken gerundet */}
            <div 
              onMouseEnter={() => setIsHoveringChat(true)}
              onMouseLeave={() => setIsHoveringChat(false)}
              style={{
                background: '#1a1a1a',
                border: `1px solid #3b82f6`,
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                padding: '2rem',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s',
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Messages Display */}
              {messages.length > 0 && (
                <div style={{
                  marginBottom: '1.5rem',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  paddingRight: '0.5rem'
                }}
                className="hide-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start'
                    }}>
                      {/* Icon */}
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
                            opacity: (msg.isThinking || idx === typingMessageIndex) ? 1 : 0.6
                          }}>
                            <AnimatedLogoIcon 
                              size={32} 
                              color={(msg.isThinking || idx === typingMessageIndex) ? undefined : '#3b82f6'}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          marginBottom: '0.5rem', 
                          color: '#9ca3af',
                          fontSize: '0.85rem'
                        }}>
                          {msg.role === 'user' ? 'You' : (msg.agent_used || 'Smart Agent')}
                        </div>
                        <div style={{ 
                          whiteSpace: 'pre-wrap',
                          color: '#e5e5e5',
                          fontSize: '0.95rem',
                          lineHeight: '1.6'
                        }}>
                          {msg.role === 'assistant' && idx === typingMessageIndex && !msg.typingComplete
                            ? displayedText + '▋' 
                            : msg.content
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div style={{
                marginBottom: '2rem',
                position: 'relative'
              }}>
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
                  disabled={isLoading}
                  autoFocus
                  style={{
                    width: '100%',
                    height: messages.length > 0 ? '60px' : '100px',
                    maxHeight: messages.length > 0 ? '60px' : '100px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    lineHeight: '1.6',
                    opacity: isLoading ? 0.5 : 1,
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  placeholder={messages.length > 0 ? "Type your message..." : ""}
                />
              </div>

              {/* Bottom Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Left Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                    <div style={{
                      background: '#9b8b5e',
                      borderRadius: '8px',
                      padding: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
                      </svg>
                    </div>
                  )}
                  <span 
                    onClick={sendMessage}
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
    </div>
  );
}
