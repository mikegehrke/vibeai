'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Box, Pencil, ArrowUp, Paperclip, Menu, Plus, Globe, Search, Grid3x3, Mic, Circle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('app');
  const [prompt, setPrompt] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  // Handle submit - Connect to backend chat API
  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    const userMessage = prompt.trim();
    setIsSubmitted(true);
    setIsLoading(true);
    setDisplayedText('');
    
    // Prepare files for upload
    const filesData = attachedFiles.map(file => ({
      name: file.name,
      type: file.type,
      data: file.data || file.url // Base64 data or URL
    }));

    // Add user message to conversation history (with files)
    const updatedHistory = [...conversationHistory, { 
      role: 'user', 
      content: userMessage,
      files: filesData.length > 0 ? filesData : undefined
    }];
    setConversationHistory(updatedHistory);
    setCurrentResponse(''); // Clear current response
    setTypewriterText(''); // Clear typewriter text
    responseBufferRef.current = ''; // Clear buffer
    typewriterIndexRef.current = 0; // Reset index
    isTypewriterRunningRef.current = false; // Reset flag
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    
    // Clear input and files
    const currentPrompt = prompt;
    const currentFiles = [...attachedFiles];
    setPrompt('');
    setAttachedFiles([]);
    
    try {
      // Determine system prompt based on tab
      const systemPrompt = activeTab === 'app' 
        ? 'You are an intelligent AI assistant that helps users build software applications. Be helpful, concise, and action-oriented.'
        : 'You are a creative design assistant that helps users create websites, slide decks, and interactive prototypes. Be creative and visual in your responses.';
      
      // Prepare request body with files
      const imageFiles = currentFiles.filter(f => f.type?.startsWith('image/') && (f.data || f.url));
      const videoFiles = currentFiles.filter(f => f.type?.startsWith('video/') && (f.data || f.url));
      
      const requestBody = {
        model: 'gpt-4o', // Default model (supports vision)
        prompt: currentPrompt,
        agent: 'aura', // Default agent
        stream: true, // Use streaming for real-time responses
        system_prompt: systemPrompt,
        conversation_history: updatedHistory.slice(0, -1), // Exclude current message
      };
      
      // Only add images/videos if they exist
      if (imageFiles.length > 0) {
        requestBody.images = imageFiles.map(f => {
          // Ensure we have base64 data, not just URL
          if (f.data && f.data.startsWith('data:')) {
            return f.data;
          }
          return f.data || f.url;
        });
      }
      
      if (videoFiles.length > 0) {
        requestBody.videos = videoFiles.map(f => {
          // Ensure we have base64 data, not just URL
          if (f.data && f.data.startsWith('data:')) {
            return f.data;
          }
          return f.data || f.url;
        });
      }

      // Call backend chat API with streaming
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
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
                
                if (data.error) {
                  throw new Error(data.error);
                }
                
                if (data.content) {
                  fullResponse += data.content;
                  responseBufferRef.current = fullResponse; // Update buffer
                  setCurrentResponse(fullResponse); // Update current response in chat history
                }
                
                // Handle generated images
                if (data.image_url) {
                  setCurrentImageUrl(data.image_url);
                }
                
                if (data.done) {
                  break;
                }
              } catch (e) {
                // Skip invalid JSON lines
                if (e instanceof SyntaxError) continue;
                throw e;
              }
            }
          }
        }
      }

      // Add assistant response to conversation history
      if (fullResponse) {
        // Warte bis Typewriter fertig ist
        const waitForTypewriter = () => {
          if (typewriterIndexRef.current < fullResponse.length || isTypewriterRunningRef.current) {
            setTimeout(waitForTypewriter, 50);
          } else {
            setConversationHistory([...updatedHistory, { 
              role: 'assistant', 
              content: fullResponse,
              imageUrl: currentImageUrl // Add generated image URL
            }]);
            setCurrentResponse(''); // Clear current response after adding to history
            setTypewriterText(''); // Clear typewriter text
            setCurrentImageUrl(null); // Clear image URL
            responseBufferRef.current = '';
            typewriterIndexRef.current = 0;
            isTypewriterRunningRef.current = false;
          }
        };
        waitForTypewriter();
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = `❌ Error: ${error.message}`;
      setCurrentResponse('');
      setTypewriterText('');
      responseBufferRef.current = '';
      typewriterIndexRef.current = 0;
      isTypewriterRunningRef.current = false;
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      setConversationHistory([...updatedHistory, { role: 'assistant', content: errorMessage }]);
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, typewriterText]);

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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header - WHITE, kein Border, immer sichtbar beim Scrollen */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'white',
        color: '#000000',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
        // Fixed damit immer sichtbar, unabhängig vom Scrollen
      }}>
        {/* Left Side - Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Animiertes Hamburger Menu Icon */}
          <AnimatedLogoIcon />
          
          {/* Logo Text - schmale Schrift */}
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em'
          }}>
            Logo
          </div>
          
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginLeft: '3rem' }}>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Products</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Module</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Framework</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Resources</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Pricing</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Careers</Link>
          </nav>
        </div>

        {/* Right Side - Log in & Start building */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Log in</Link>
          <button style={{
            background: '#ff8c42',
            color: 'white',
            padding: '0.625rem 1.25rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9rem',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Start building
          </button>
        </div>
      </header>

      {/* Main Content - White Background */}
      <main style={{
        minHeight: 'calc(100vh - 80px)',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        paddingTop: 'calc(3rem + 80px)'
        // Padding-Top damit Content nicht unter fixed Header verschwindet
      }}>
        {/* Title - klein, nicht so dick aber fett */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#000000',
          marginBottom: '2.5rem',
          textAlign: 'center',
          letterSpacing: '-0.02em',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          What will you build?
        </h1>

        {/* Tabs oben - Außerhalb des Chat-Felds */}
        <div style={{
          width: '100%',
          maxWidth: '700px',
          display: 'flex',
          gap: '0',
          marginBottom: '0',
          paddingLeft: '2rem',
          paddingRight: '2rem'
        }}>
          {/* App Tab - Links - BREIT */}
          <button
            onClick={() => setActiveTab('app')}
            style={{
              display: 'flex',
              alignItems: 'center',
          justifyContent: 'center',
              gap: '0.4rem',
              padding: activeTab === 'app' ? '0.75rem 2.5rem' : '0.5rem 2.5rem',
              background: activeTab === 'app' ? '#f8f8f8' : 'transparent',
              border: '1px solid #e5e5e5',
              borderBottom: 'none',
              borderRight: activeTab === 'app' ? 'none' : '1px solid #e5e5e5',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'app' ? '600' : '400',
          fontSize: '0.9rem',
              color: activeTab === 'app' ? '#000000' : '#666666',
              transition: 'all 0.2s',
              flex: 1
            }}
          >
            <Box size={18} />
            <span>App</span>
          </button>
          
          {/* Design Tab - Rechts - BREIT */}
          <button
            onClick={() => setActiveTab('design')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: activeTab === 'design' ? '0.75rem 2.5rem' : '0.5rem 2.5rem',
              background: activeTab === 'design' ? '#f8f8f8' : 'transparent',
              border: '1px solid #e5e5e5',
              borderBottom: 'none',
              borderLeft: activeTab === 'design' ? 'none' : '1px solid #e5e5e5',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              cursor: 'pointer',
              fontWeight: activeTab === 'design' ? '600' : '400',
              fontSize: '0.9rem',
              color: activeTab === 'design' ? '#000000' : '#666666',
              transition: 'all 0.2s',
              flex: 1
            }}
          >
            <Pencil size={18} />
            <span>Design</span>
          </button>
        </div>

        {/* Chat-Feld - Nur Input-Bereich mit hellgrauem Border, Hover: sattes helles Blau */}
        <div 
          style={{
            width: '100%',
            maxWidth: '700px',
            background: 'white',
            borderRadius: '12px',
            border: isDragging ? '2px dashed #3b82f6' : '1px solid #e5e5e5', // Drag & Drop Border
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingTop: '1.25rem',
            paddingBottom: '1.25rem',
            transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '600px',
            backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'white'
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = '#3b82f6'; // Sattes helles Blau
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = '#e5e5e5'; // Zurück zu hellem Grau
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

          {/* Chat History - Alle Nachrichten */}
          {(conversationHistory.length > 0 || currentResponse) && (
            <div 
              ref={chatHistoryRef}
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
              marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e5e5e5'
              }}
            >
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: message.role === 'user' ? '#f8f8f8' : 'transparent',
                    borderLeft: message.role === 'assistant' ? '3px solid #3b82f6' : 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666666',
                    marginBottom: '0.25rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {message.role === 'assistant' && <AnimatedAgentIcon isActive={false} />}
                    {message.role === 'user' ? 'You' : 'Assistant'}
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
                          maxWidth: '300px',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          {file.type?.startsWith('image/') ? (
                            <img 
                              src={file.data || file.url} 
                              alt={file.name}
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px'
                              }}
                            />
                          ) : file.type?.startsWith('video/') ? (
                            <video 
                              src={file.data || file.url}
                              controls
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <div style={{
                              padding: '0.5rem',
                              background: '#f0f0f0',
                              borderRadius: '8px',
                              fontSize: '0.85rem'
                            }}>
                              📎 {file.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Generiertes Bild anzeigen */}
                  {message.imageUrl && (
                    <div style={{
                      marginBottom: '0.5rem'
                    }}>
                      <img 
                        src={message.imageUrl} 
                        alt="Generated"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          border: '1px solid #e5e5e5'
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#000000',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    lineHeight: '1.5'
                  }}>
                    {message.content}
                  </div>
                </div>
              ))}
              
              {/* Aktuelle Streaming-Antwort oder Loading-Status */}
              {(currentResponse || isLoading) && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    borderLeft: '3px solid #3b82f6'
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666666',
                    marginBottom: '0.25rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AnimatedAgentIcon isActive={isLoading} />
                    Assistant
                  </div>
                  {/* Generiertes Bild während Streaming anzeigen */}
                  {currentImageUrl && (
                    <div style={{
                      marginBottom: '0.5rem'
                    }}>
                      <img 
                        src={currentImageUrl} 
                        alt="Generated"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          borderRadius: '8px',
                          border: '1px solid #e5e5e5'
                        }}
                      />
                    </div>
                  )}
                  {typewriterText || isLoading ? (
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#000000',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
              lineHeight: '1.5'
            }}>
                      {typewriterText}
                      {isLoading && <span style={{ opacity: 0.5, marginLeft: '2px' }}>|</span>}
                    </div>
                  ) : (
                    <div style={{
                      fontSize: '0.95rem',
                      color: '#666666',
                      fontStyle: 'italic'
                    }}>
                      Thinking...
                    </div>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Field - Keine Linien, Buttons unten */}
          <div 
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '0.875rem 1rem',
              background: 'white',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Input - Volle Breite */}
            <div style={{ position: 'relative', flex: 1, width: '100%', paddingBottom: '2.5rem' }}>
              {/* Placeholder nur wenn kein Text eingegeben wird */}
              {!prompt && !isLoading && (
            <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: '0.95rem',
                  color: '#666666',
                  pointerEvents: 'none',
                  width: '100%',
                  paddingTop: '0.25rem'
                }}>
                  {displayedText}
                  {isTyping && <span style={{ opacity: 0.5, marginLeft: '2px' }}>|</span>}
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setIsSubmitted(false);
                }}
                onFocus={() => setIsSubmitted(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: prompt ? '#000000' : 'transparent',
                  background: 'transparent',
                  padding: 0,
                  resize: 'none',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Fine Toolbar - Links: Icons, Rechts: Actions */}
            <div style={{
              position: 'absolute',
              bottom: '0.25rem',
              left: '0',
              right: '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              paddingTop: '0',
              paddingBottom: '0'
            }}>
              {/* Left Side - Icons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {/* Plus Icon mit Dropdown-Menü */}
                <div style={{ position: 'relative' }} ref={plusMenuRef}>
                  <button
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                  style={{
                      background: showPlusMenu ? '#f0f0f0' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.375rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      transition: 'all 0.15s',
                      color: '#666666'
                    }}
                    onMouseEnter={(e) => {
                      if (!showPlusMenu) {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.color = '#000000';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showPlusMenu) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#666666';
                      }
                    }}
                    title="Mehr Optionen"
                  >
                    <Plus size={16} />
                  </button>
                  
                  {/* Dropdown-Menü */}
                  {showPlusMenu && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '0',
                      marginBottom: '0.5rem',
                      background: '#1a1a1a',
                      borderRadius: '8px',
                      padding: '0.5rem 0',
                      minWidth: '220px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      zIndex: 1000
                    }}>
                      {/* Datei hochladen */}
                      <div
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPlusMenu(false);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        📄 Datei hochladen
                      </div>
                      
                      {/* Foto hochladen */}
                      <div
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPlusMenu(false);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        📷 Foto hochladen
                      </div>
                      
                      {/* Screenshot machen - mit Untermenü */}
                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          color: showScreenshotSubmenu ? '#3b82f6' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: showScreenshotSubmenu ? '#2a2a2a' : 'transparent',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2a2a2a';
                          setShowScreenshotSubmenu(true);
                        }}
                        onMouseLeave={(e) => {
                          // Nicht schließen wenn über Untermenü
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          📸 Screenshot machen
                </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>→</span>
                        
                        {/* Screenshot-Untermenü */}
                        {showScreenshotSubmenu && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '100%',
                              top: '0',
                              marginLeft: '0.5rem',
                              background: '#1a1a1a',
                              borderRadius: '8px',
                              padding: '0.5rem 0',
                              minWidth: '280px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              border: '1px solid #2a2a2a'
                            }}
                            onMouseEnter={() => setShowScreenshotSubmenu(true)}
                            onMouseLeave={() => setShowScreenshotSubmenu(false)}
                          >
                            {/* Bildschirme Sektion */}
                            <div style={{
                              padding: '0.25rem 1rem',
                              fontSize: '0.75rem',
                              color: '#888888',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                              marginTop: '0.25rem'
                            }}>
                              Bildschirme
                            </div>
                            <div
                              onClick={async () => {
                                await captureScreenshot();
                                setShowPlusMenu(false);
                                setShowScreenshotSubmenu(false);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2a2a2a';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span>🖥️</span>
                              <span style={{ flex: 1 }}>Integriertes Retina-Display</span>
            </div>

                            {/* Fenster Sektion */}
            <div style={{
                              padding: '0.25rem 1rem',
                              fontSize: '0.75rem',
                              color: '#888888',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                              marginTop: '0.5rem',
                              borderTop: '1px solid #2a2a2a',
                              paddingTop: '0.5rem'
                            }}>
                              Fenster
                            </div>
                            <div
                              onClick={async () => {
                                await captureScreenshot();
                                setShowPlusMenu(false);
                                setShowScreenshotSubmenu(false);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                color: '#ffffff',
                                cursor: 'pointer',
              fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2a2a2a';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span>🪟</span>
                              <span style={{ flex: 1 }}>Aktuelles Fenster</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Foto aufnehmen */}
                      <div
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPlusMenu(false);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        📹 Foto aufnehmen
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Globe Icon */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Web-Suche"
                >
                  <Globe size={16} />
                </button>
                
                {/* Search/Telescope Icon */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Suchen"
                >
                  <Search size={16} />
                </button>
                
                {/* Grid Icon */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Optionen"
                >
                  <Grid3x3 size={16} />
                </button>
                
                {/* Paperclip Icon */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Datei anhängen"
                >
                  <Paperclip size={16} />
                </button>
              </div>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files) {
                    handleFiles(e.target.files);
                  }
                  if (e.target) {
                    e.target.value = '';
                  }
                }}
              />
              
              {/* Right Side - Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {/* Circle Icon */}
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Einstellungen"
                >
                  <Circle size={16} />
                </button>
                
                {/* Microphone Icon */}
                <button
                  onClick={captureScreenshot}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    color: '#666666'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#666666';
                  }}
                  title="Voice Input"
                >
                  <Mic size={16} />
                </button>
                
                {/* Screen Share & Realtime Chat Button - Green with waveform style */}
                <button
                  onClick={() => {
                    // TODO: Implementiere Bildschirm teilen und Echtzeit-Sprechen
                    console.log('Bildschirm teilen und Echtzeit-Sprechen');
                  }}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '36px',
                    height: '32px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Bildschirm teilen & Echtzeit-Sprechen"
                >
                  {/* Waveform-style bars */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    height: '16px'
                  }}>
                    <div style={{
                      width: '2px',
                      height: '8px',
                      background: 'white',
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '2px',
                      height: '12px',
                      background: 'white',
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '2px',
                      height: '16px',
                      background: 'white',
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '2px',
                      height: '10px',
                      background: 'white',
                      borderRadius: '1px'
                    }} />
                    <div style={{
                      width: '2px',
                      height: '14px',
                      background: 'white',
                      borderRadius: '1px'
                    }} />
            </div>
                </button>
                
                {/* ArrowUp Button - Für Text senden, ganz rechts außen */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !prompt.trim()}
                  style={{
                    background: isLoading || !prompt.trim() ? '#e5e5e5' : '#666666',
                    border: 'none',
                    cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                    padding: '0.375rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'all 0.15s',
                    opacity: isLoading || !prompt.trim() ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.currentTarget.style.background = '#000000';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.currentTarget.style.background = '#666666';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.currentTarget.style.background = '#333333';
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!isLoading && prompt.trim()) {
                      e.currentTarget.style.background = '#000000';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }
                  }}
                  title="Text senden"
                >
                  <ArrowUp size={16} style={{ color: 'white' }} />
                </button>
              </div>
            </div>
          </div>
      </div>

        {/* Template Selection Area - Unter dem Chat */}
      <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '6rem auto',
          padding: '0 2rem'
        }}>
          {/* Title */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            Start with a template
          </h2>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === category ? '#f0f0f0' : 'white',
                  color: '#000000',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '400'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = '#f8f8f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Template Slider - Ein Bild pro Tab, verschiebt sich nach links */}
          <style>{`
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: '100%',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              transform: `translateX(-${selectedCategoryIndex * (100 / categories.length)}%)`,
              transition: 'transform 0.5s ease-in-out',
              width: `${categories.length * 100}%`
            }}>
              {categories.map((category, categoryIndex) => {
                // Ein Bild pro Kategorie
                const templatesByCategory = {
                  'Landing Pages': { image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop', title: 'Landing page', gradient: 'rgba(255, 140, 66, 0.1)', animation: '20s' },
                  'AI App': { image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', title: 'AI App', gradient: 'rgba(59, 130, 246, 0.1)', animation: '20s' },
                  'Dashboard': { image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', title: 'Dashboard', gradient: 'rgba(16, 185, 129, 0.1)', animation: '20s' },
                  'E-Commerce': { image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop', title: 'E-Commerce', gradient: 'rgba(236, 72, 153, 0.1)', animation: '20s' },
                  'Portfolio': { image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop', title: 'Portfolio', gradient: 'rgba(139, 92, 246, 0.1)', animation: '20s' },
                  'Interactive Experience': { image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop', title: 'Interactive Experience', gradient: 'rgba(236, 72, 153, 0.1)', animation: '20s' }
                };
                
                const template = templatesByCategory[category];
                
                return (
                  <div
                    key={category}
                    style={{
                      width: `${100 / categories.length}%`,
                      flexShrink: 0,
                      paddingRight: categoryIndex < categories.length - 1 ? '1.5rem' : '0'
                    }}
                  >
                    <div
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e5e5',
                        padding: '0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      }}
                    >
                      {/* Animierter runder Hintergrund */}
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-50%',
                        width: '200%',
                        height: '200%',
                        background: `radial-gradient(circle, ${template.gradient} 0%, transparent 70%)`,
                        borderRadius: '50%',
                        animation: `rotate ${template.animation} linear infinite`,
                        pointerEvents: 'none',
                        zIndex: 1
                      }} />
                      
                      {/* Bild */}
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <img
                          src={template.image}
                          alt={template.title}
                          style={{
                            width: '100%',
                            height: '400px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        
                        {/* Titel und Icon/Logo unten */}
                        <div style={{
                          padding: '1rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'white'
                        }}>
                          <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#000000'
                          }}>
                            {template.title}
                          </div>
                          
                          {/* Icon und Logo */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <AnimatedLogoIcon />
                            <span style={{
                              fontSize: '0.85rem',
                              color: '#666666',
                              fontWeight: '400'
                            }}>
                              Logo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logo Icon unten */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '3rem',
            paddingBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AnimatedLogoIcon />
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                color: '#000000'
              }}>
                Logo
              </div>
          </div>
        </div>
      </div>
    </main>
      </div>
  );
} 