'use client';

import { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaPaperPlane, FaRobot, FaStop } from 'react-icons/fa';

export default function LiveAgentChat({ projectId, onCodeUpdate, onFileCreate }) {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: '👋 Hallo! Ich bin dein Live-Coding Agent. Ich kann:\n\n✅ Code generieren und ändern\n✅ Dateien erstellen\n✅ Fehler fixen\n✅ Features hinzufügen\n\nSage mir einfach was du brauchst!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [agentStatus, setAgentStatus] = useState('idle'); // idle, thinking, coding, done
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Recognition & Voice Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE';

      // Lade beste deutsche Stimme
      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          const germanVoice = voices.find(v =>
            v.lang.startsWith('de') && (v.name.includes('Google') || v.name.includes('Anna'))
          ) || voices.find(v => v.lang.startsWith('de'));

          if (germanVoice) {
            setSelectedVoice(germanVoice);
          }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\*\*/g, '')
      .trim();

    if (cleanText.length > 0 && cleanText.length < 300) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onerror = (e) => console.error('Speech error:', e);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setAgentStatus('thinking');

    // Agent "denkt"
    const thinkingMsg = {
      role: 'agent',
      content: '🤔 Analysiere deine Anfrage...',
      timestamp: new Date(),
      isTemporary: true
    };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      // Streaming-Request an Backend
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Du bist ein Live-Coding Agent im VibeAI App Builder.
          
KONTEXT:
- Projekt: ${projectId}
- User möchte: ${input}

AUFGABE:
1. Erkläre was du tun wirst (max 2 Sätze)
2. Zeige den Code den du schreibst
3. Sage welche Datei du bearbeitest

BEISPIEL ANTWORT:
"✅ Ich erstelle jetzt einen neuen Button in home_screen.dart:

\`\`\`dart
ElevatedButton(
  onPressed: () {},
  child: Text('Klick mich')
)
\`\`\`

📝 Datei: lib/screens/home_screen.dart aktualisiert"

Antworte kurz und zeige Code!`,
          model: 'gpt-4o',
          agent: 'code-assistant'
        })
      });

      // Entferne "denkt"-Nachricht
      setMessages(prev => prev.filter(m => !m.isTemporary));
      setAgentStatus('coding');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let agentResponse = '';

      // Status-Update: "Schreibe Code..."
      const codingMsg = {
        role: 'agent',
        content: '⚙️ Schreibe Code...',
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, codingMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                agentResponse += data.content;

                // Update streaming message
                setMessages(prev =>
                  prev.map((msg, idx) =>
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, content: agentResponse }
                      : msg
                  )
                );

                // Spreche Antwort aus
                speakText(data.content);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Markiere als fertig
      setMessages(prev =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

      setAgentStatus('done');

      // Parse Code aus Antwort und update Editor
      const codeBlocks = agentResponse.match(/```(\w+)?\n([\s\S]*?)```/g);
      if (codeBlocks && onCodeUpdate) {
        codeBlocks.forEach(block => {
          const match = block.match(/```(\w+)?\n([\s\S]*?)```/);
          if (match) {
            const language = match[1] || 'text';
            const code = match[2];
            onCodeUpdate(code, language);
          }
        });
      }

      // Prüfe ob neue Datei erstellt werden soll
      const fileMatch = agentResponse.match(/Datei:\s*([\w\/\.]+)/);
      if (fileMatch && onFileCreate) {
        onFileCreate(fileMatch[1]);
      }

    } catch (error) {
      setMessages(prev => [...prev.filter(m => !m.isTemporary), {
        role: 'agent',
        content: `❌ Fehler: ${error.message}`,
        timestamp: new Date()
      }]);
      setAgentStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = () => {
    switch (agentStatus) {
      case 'thinking': return '#FFA500';
      case 'coding': return '#00FF00';
      case 'done': return '#0098ff';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (agentStatus) {
      case 'thinking': return '🤔 Denkt nach...';
      case 'coding': return '⚙️ Schreibt Code...';
      case 'done': return '✅ Fertig!';
      default: return '💤 Bereit';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1e1e1e',
      borderLeft: '1px solid #3e3e42'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaRobot style={{ color: '#0098ff', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Live Agent</div>
            <div style={{ fontSize: '11px', color: getStatusColor() }}>
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (voiceEnabled) {
              window.speechSynthesis.cancel();
            }
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: voiceEnabled ? 'rgba(0, 255, 135, 0.2)' : 'rgba(255, 107, 107, 0.2)',
            border: `1px solid ${voiceEnabled ? 'rgba(0, 255, 135, 0.5)' : 'rgba(255, 107, 107, 0.5)'}`,
            borderRadius: '8px',
            color: voiceEnabled ? '#00ff87' : '#ff6b6b',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 'bold'
          }}
          title={voiceEnabled ? 'Stimme ist AN - Klick zum Ausschalten' : 'Stimme ist AUS - Klick zum Einschalten'}
        >
          {voiceEnabled ? '🔊 ON' : '🔇 OFF'}
        </button>

        {isProcessing && (
          <div style={{
            width: '12px',
            height: '12px',
            background: '#0098ff',
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }}></div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '8px',
              alignItems: 'flex-start'
            }}
          >
            {msg.role === 'agent' && (
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #0098ff, #00d4ff)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaRobot style={{ color: 'white', fontSize: '16px' }} />
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '12px',
              borderRadius: '12px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #0098ff, #0066cc)'
                : '#2d2d30',
              color: 'white',
              fontSize: '13px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <div dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background:#1a1a1a;padding:8px;border-radius:4px;margin:8px 0;overflow-x:auto"><code>$2</code></pre>')
                  .replace(/`([^`]+)`/g, '<code style="background:#1a1a1a;padding:2px 6px;border-radius:3px">$1</code>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
              }} />
              <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                {msg.timestamp.toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        background: '#252526',
        borderTop: '1px solid #3e3e42'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Sage dem Agent was er tun soll..."
            disabled={isProcessing}
            style={{
              flex: 1,
              background: '#1e1e1e',
              border: '1px solid #3e3e42',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              fontSize: '13px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              fontFamily: 'inherit'
            }}
            rows="2"
          />
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            style={{
              padding: '12px',
              background: isListening ? '#FF4444' : '#3e3e42',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isListening ? 'Stoppen' : 'Spracheingabe'}
          >
            {isListening ? <FaStop /> : <FaMicrophone />}
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isProcessing}
            style={{
              padding: '12px 16px',
              background: input.trim() && !isProcessing
                ? 'linear-gradient(135deg, #0098ff, #0066cc)'
                : '#3e3e42',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: input.trim() && !isProcessing ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaPaperPlane />
            <span>Senden</span>
          </button>
        </div>
        <div style={{
          fontSize: '11px',
          color: '#666',
          marginTop: '8px'
        }}>
          Enter zum Senden • Shift+Enter für neue Zeile • 🎤 für Sprache
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
