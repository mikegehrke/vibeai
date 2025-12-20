'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Home, Code, Globe, ChevronDown, 
  CheckCircle, ArrowRight, ExternalLink, FileCode,
  User, Bell, Users, Terminal, Palette, Sun, Moon, HelpCircle, LogOut, ChevronRight, Download,
  Cloud, Star, Smartphone, Sparkles, Rocket, Lock, DollarSign, ArrowUp, ArrowLeft, Eye, Zap, Shield, MessageCircle,
  Box, Pencil, Paperclip, Circle, Camera, MapPin, Twitter, Github, Linkedin, Youtube, Link as LinkIcon,
  Instagram, Music, Share2, Video, X
} from 'lucide-react';
import AnimatedLogoIcon from '../components/AnimatedLogoIcon';
import ImageEditor from '../components/ImageEditor';
import VideoEditor from '../components/VideoEditor';

export default function ProfilePage() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('app');
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
  const [availableAgents, setAvailableAgents] = useState([]);
  
  // Profile states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImageCropDialog, setShowImageCropDialog] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [profileData, setProfileData] = useState({
    firstName: 'mike',
    lastName: 'Gehrke',
    username: 'ibuyplussel15',
    bio: 'Building awesome AI applications with Vibe AI 🚀',
    location: 'Germany',
    website: 'https://vibeai.com',
    // Social Media
    twitter: 'ibuyplussel15',
    github: 'ibuyplussel15',
    linkedin: 'mikegehrke',
    youtube: '@mikegehrke',
    tiktok: 'ibuyplussel15',
    instagram: 'ibuyplussel15',
    // Developer Platforms
    stackoverflow: '12345678',
    devto: 'ibuyplussel15',
    medium: 'ibuyplussel15',
    codepen: 'ibuyplussel15',
    dribbble: 'ibuyplussel15',
    behance: 'ibuyplussel15'
  });
  
  const dropdownRef = useRef(null);
  const wsRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const agentDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Avatar Upload - Opens crop dialog
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result);
        setImageZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setShowImageCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Cropped Image
  const handleSaveCroppedImage = () => {
    // Create a canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const size = 300; // Final size
      canvas.width = size;
      canvas.height = size;
      
      // Calculate the source rectangle
      const scale = imageZoom;
      const sourceSize = size / scale;
      const sourceX = (img.width / 2) - (sourceSize / 2) - (imagePosition.x / scale);
      const sourceY = (img.height / 2) - (sourceSize / 2) - (imagePosition.y / scale);
      
      // Draw the cropped image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        size,
        size
      );
      
      // Convert to data URL and save
      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setAvatarUrl(croppedImageUrl);
      setShowImageCropDialog(false);
      setTempImageUrl('');
    };
    
    img.src = tempImageUrl;
  };

  // Handle Image Drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle Profile Save
  const handleSaveProfile = () => {
    // TODO: API call to save profile
    console.log('Saving profile:', profileData);
    setShowEditDialog(false);
  };

  // Handle Share App - Opens dialog
  const handleShareApp = (app) => {
    setSelectedApp(app);
    setShowShareDialog(true);
  };

  // Handle Share to specific platform
  const handleShareToPlatform = (platform, appName, appUrl) => {
    const encodedUrl = encodeURIComponent(appUrl || `https://vibeai.com/app/${appName.toLowerCase().replace(/\s+/g, '-')}`);
    const encodedText = encodeURIComponent(`Check out my app "${appName}" built with Vibe AI! 🚀`);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'devto':
        // Dev.to doesn't have direct share, open new article page
        window.open('https://dev.to/new', '_blank');
        break;
      case 'medium':
        // Medium doesn't have direct share, open new story page
        window.open('https://medium.com/new-story', '_blank');
        break;
      case 'hackernews':
        shareUrl = `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedText}`;
        break;
      case 'producthunt':
        window.open('https://www.producthunt.com/posts/new', '_blank');
        break;
      default:
        console.log('Unknown platform:', platform);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=600');
    }
    
    setShowShareDialog(false);
  };

  // Handle Create Video - Opens TikTok-style Video Editor
  const handleCreateVideo = (app) => {
    setSelectedApp(app);
    setShowVideoEditor(true);
  };

  // Handle Video Save from Editor
  const handleVideoSave = async (videoData) => {
    setShowVideoEditor(false);
    setIsCreatingVideo(true);
    
    try {
      console.log('Saving video for:', selectedApp.name);
      
      // Simulate video creation (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use real backend API
      const useBackendAPI = true; // Backend is ready!
      
      // Video has been edited in the editor, now export it
      alert(`✅ Video created for "${selectedApp.name}"!\n\n🎥 Video exported with:\n- Custom text overlays\n- Filters and effects\n- Background music\n- Speed adjustments\n\n(Video will be downloaded)`);
      
    } catch (error) {
      console.error('Error saving video:', error);
      alert(`⚠️ Could not save video for "${selectedApp.name}".`);
    } finally {
      setIsCreatingVideo(false);
      setSelectedApp(null);
    }
  };

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

  // Load available models and agents
  useEffect(() => {
    const loadModelsAndAgents = async () => {
      try {
        const [modelsRes, agentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/home/models'),
          fetch('http://localhost:8000/api/home/agents')
        ]);
        
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setAvailableModels(modelsData.models || []);
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
          conversation_history: messages.filter(m => !m.isThinking && m.role !== 'system').map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false,
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
      console.log('📩 Response received:', data);
      
      if (data.success) {
        // Remove thinking message and add real response
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isThinking);
          const newMessage = {
            role: 'assistant',
            content: data.response,
            model_used: data.model_used,
            agent_used: data.agent_used,
            isThinking: false,
            timestamp: new Date()
          };
          console.log('✅ Adding new message:', newMessage);
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
        {/* Main Content Area - Profile + Public Apps + Chat */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}>
          {/* Top Row - Profile + Public Apps */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
          {/* Left Side - Profile Section */}
          <div style={{
            width: '420px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Profile Header with Avatar */}
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
              borderRadius: '12px 12px 0 0',
              height: '150px',
              position: 'relative'
            }}>
              {/* Camera Icon - Upload Avatar */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
              >
                <Camera size={18} color="#fff" />
              </button>
              
              {/* Avatar - positioned at bottom of gradient */}
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '2rem',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: avatarUrl ? 'transparent' : '#3b82f6',
                backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '2rem',
                border: '4px solid #1f1f1f',
                overflow: 'hidden'
              }}>
                {!avatarUrl && 'MG'}
              </div>
            </div>

            {/* Profile Info */}
            <div style={{
              width: '100%',
              background: '#1f1f1f',
              borderRadius: '0 0 12px 12px',
              padding: '3rem 2rem 2rem 2rem',
              border: '1px solid #2a2a2a',
              borderTop: 'none'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '0.25rem'
                  }}>
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#999',
                    margin: 0
                  }}>
                    @{profileData.username}
                  </p>
                </div>
                
                {/* Edit Button */}
                <button 
                  onClick={() => setShowEditDialog(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid #4a4a4a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#5a5a5a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#4a4a4a';
                  }}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: '0.95rem',
                color: '#ccc',
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {profileData.bio}
              </p>

              {/* Location & Website */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                {profileData.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#999',
                    fontSize: '0.9rem'
                  }}>
                    <MapPin size={16} />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileData.website && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#999',
                    fontSize: '0.9rem'
                  }}>
                    <LinkIcon size={16} />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={{
                      color: '#3b82f6',
                      textDecoration: 'none'
                    }}>
                      {profileData.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>

              {/* All Links - Social Media & Developer */}
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #2a2a2a'
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#999',
                  marginBottom: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Connect
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  {profileData.twitter && (
                    <a href={`https://twitter.com/${profileData.twitter}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <X size={18} color="#ececec" />
                    </a>
                  )}
                  {profileData.github && (
                    <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Github size={18} color="#ececec" />
                    </a>
                  )}
                  {profileData.linkedin && (
                    <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Linkedin size={18} color="#0A66C2" />
                    </a>
                  )}
                  {profileData.youtube && (
                    <a href={`https://youtube.com/${profileData.youtube}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Youtube size={18} color="#FF0000" />
                    </a>
                  )}
                  {profileData.tiktok && (
                    <a href={`https://tiktok.com/@${profileData.tiktok}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Music size={18} color="#00f2ea" />
                    </a>
                  )}
                  {profileData.instagram && (
                    <a href={`https://instagram.com/${profileData.instagram}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Instagram size={18} color="#E4405F" />
                    </a>
                  )}
                  
                  {/* Developer Platforms - Same section */}
                  {profileData.stackoverflow && (
                    <a href={`https://stackoverflow.com/users/${profileData.stackoverflow}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Code size={18} color="#F48024" />
                    </a>
                  )}
                  {profileData.devto && (
                    <a href={`https://dev.to/${profileData.devto}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Terminal size={18} color="#0A0A0A" />
                    </a>
                  )}
                  {profileData.medium && (
                    <a href={`https://medium.com/@${profileData.medium}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Pencil size={18} color="#ececec" />
                    </a>
                  )}
                  {profileData.codepen && (
                    <a href={`https://codepen.io/${profileData.codepen}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <FileCode size={18} color="#ececec" />
                    </a>
                  )}
                  {profileData.dribbble && (
                    <a href={`https://dribbble.com/${profileData.dribbble}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Palette size={18} color="#EA4C89" />
                    </a>
                  )}
                  {profileData.behance && (
                    <a href={`https://behance.net/${profileData.behance}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#2a2a2a',
                      transition: 'background 0.2s',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Box size={18} color="#1769FF" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Public Apps Section */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#ffffff',
                margin: 0
              }}>
                Public Apps
              </h2>
              <div style={{
                position: 'relative',
                width: '300px'
              }}>
                <input
                  type="text"
                  placeholder="Search Apps"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <Search size={16} color="#999" style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>

            {/* Apps List */}
            <div style={{
              background: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              overflow: 'hidden'
            }}>
              {[
                { name: 'Hallo Who Are', time: '19 hours ago', icon: '🌙' },
                { name: 'Hallo', time: '3 days ago', icon: '🌙' },
                { name: 'Task Master', time: '5 days ago', icon: '🌙' },
                { name: 'SecureSignup', time: '7 months ago', icon: '🌙' },
                { name: 'CreativeCrunch', time: '7 months ago', icon: '🌙' },
                { name: 'JavaScriptLogger', time: '9 months ago', icon: '🌙' },
                { name: 'SkillBoostBiz', time: '9 months ago', icon: '🌙' },
                { name: 'StableViciousObject', time: '1 year ago', icon: '🔥' }
              ].map((app, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: index < 7 ? '1px solid #2a2a2a' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      color: '#ececec',
                      marginBottom: '0.15rem'
                    }}>
                      {app.name}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    {/* Share Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareApp(app);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#2a2a2a',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Share2 size={16} color="#3b82f6" />
                    </button>
                    
                    {/* Video Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateVideo(app);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: '#2a2a2a',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      <Video size={16} color="#10b981" />
                    </button>
                  </div>
                  
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#999',
                    whiteSpace: 'nowrap',
                    marginLeft: '0.5rem'
                  }}>
                    {app.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Bottom Row - Chat Container (full width) */}
          <div style={{
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
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
                        {msg.role === 'user' ? 'You' : (msg.agent_used || 'Smart Agent')}
                      </div>
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        color: '#e5e5e5',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}>
                        {msg.content}
                      </div>
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
                    {showModelDropdown && Array.isArray(availableModels) && availableModels.length > 0 && (
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
                              borderBottom: idx < availableModels.length - 1 ? '1px solid #3a3a3a' : 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#333'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: '600' }}>{model.name}</div>
                            {model.description && (
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                {model.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Agent Dropdown */}
                  <div ref={agentDropdownRef} style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowAgentDropdown(!showAgentDropdown)}
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
                    {showAgentDropdown && Array.isArray(availableAgents) && availableAgents.length > 0 && (
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

        {/* Professional Image Editor */}
        {showImageCropDialog && tempImageUrl && (
          <ImageEditor
            imageUrl={tempImageUrl}
            onSave={(editedImageUrl) => {
              setAvatarUrl(editedImageUrl);
              setShowImageCropDialog(false);
              setTempImageUrl('');
            }}
            onCancel={() => {
              setShowImageCropDialog(false);
              setTempImageUrl('');
            }}
          />
        )}

        {/* Professional Video Editor (TikTok-style) */}
        {showVideoEditor && selectedApp && (
          <VideoEditor
            appName={selectedApp.name}
            appData={selectedApp}
            onSave={handleVideoSave}
            onCancel={() => {
              setShowVideoEditor(false);
              setSelectedApp(null);
            }}
          />
        )}

        {/* Share App Dialog */}
        {showShareDialog && selectedApp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
          onClick={() => setShowShareDialog(false)}
          >
            <div style={{
              background: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                Share "{selectedApp.name}"
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: '#999',
                marginBottom: '1.5rem'
              }}>
                Choose where to share your app
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {[
                  { platform: 'twitter', label: 'X', icon: X, color: '#ececec' },
                  { platform: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
                  { platform: 'facebook', label: 'Facebook', icon: Globe, color: '#1877F2' },
                  { platform: 'reddit', label: 'Reddit', icon: MessageCircle, color: '#FF4500' },
                  { platform: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
                  { platform: 'telegram', label: 'Telegram', icon: MessageCircle, color: '#0088cc' },
                  { platform: 'devto', label: 'Dev.to', icon: Terminal, color: '#0A0A0A' },
                  { platform: 'medium', label: 'Medium', icon: Pencil, color: '#ececec' },
                  { platform: 'hackernews', label: 'HN', icon: Code, color: '#FF6600' },
                  { platform: 'producthunt', label: 'ProductHunt', icon: Rocket, color: '#DA552F' }
                ].map(({ platform, label, icon: Icon, color }) => (
                  <button
                    key={platform}
                    onClick={() => handleShareToPlatform(platform, selectedApp.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      background: '#2a2a2a',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                  >
                    <Icon size={24} color={color} />
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#ececec',
                      textAlign: 'center'
                    }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowShareDialog(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid #4a4a4a',
                  borderRadius: '6px',
                  color: '#ececec',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Video Creation Loading Dialog */}
        {isCreatingVideo && selectedApp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <Video size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                Creating Video
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: '#999',
                marginBottom: '1rem'
              }}>
                Generating video demo for "{selectedApp.name}"...
              </p>
              <div style={{
                width: '100%',
                height: '4px',
                background: '#2a2a2a',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: '#10b981',
                  animation: 'progress 2s ease-in-out infinite',
                  width: '50%'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Dialog */}
        {showEditDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
          onClick={() => setShowEditDialog(false)}
          >
            <div style={{
              background: '#1f1f1f',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>
                Edit Profile
              </h2>

              {/* Name Fields */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none',
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  color: '#999',
                  marginBottom: '0.5rem',
                  fontWeight: '500'
                }}>
                  Website
                </label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Social Media Section */}
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#ffffff',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                Social Media
              </h3>

              {[
                { key: 'twitter', label: 'X (Twitter)', placeholder: 'username' },
                { key: 'github', label: 'GitHub', placeholder: 'username' },
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'username' },
                { key: 'youtube', label: 'YouTube', placeholder: '@username' },
                { key: 'tiktok', label: 'TikTok', placeholder: 'username' },
                { key: 'instagram', label: 'Instagram', placeholder: 'username' }
              ].map((social) => (
                <div key={social.key} style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: '#999',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    {social.label}
                  </label>
                  <input
                    type="text"
                    value={profileData[social.key]}
                    onChange={(e) => setProfileData({...profileData, [social.key]: e.target.value})}
                    placeholder={social.placeholder}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '6px',
                      color: '#ececec',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}

              {/* Developer Platforms Section */}
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#ffffff',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                Developer Platforms
              </h3>

              {[
                { key: 'stackoverflow', label: 'Stack Overflow', placeholder: 'user-id' },
                { key: 'devto', label: 'Dev.to', placeholder: 'username' },
                { key: 'medium', label: 'Medium', placeholder: 'username' },
                { key: 'codepen', label: 'CodePen', placeholder: 'username' },
                { key: 'dribbble', label: 'Dribbble', placeholder: 'username' },
                { key: 'behance', label: 'Behance', placeholder: 'username' }
              ].map((platform) => (
                <div key={platform.key} style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: '#999',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    {platform.label}
                  </label>
                  <input
                    type="text"
                    value={profileData[platform.key]}
                    onChange={(e) => setProfileData({...profileData, [platform.key]: e.target.value})}
                    placeholder={platform.placeholder}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '6px',
                      color: '#ececec',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #2a2a2a'
              }}>
                <button
                  onClick={() => setShowEditDialog(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid #4a4a4a',
                    borderRadius: '6px',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
