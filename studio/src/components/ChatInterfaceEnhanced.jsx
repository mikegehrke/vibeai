import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSend, FiPaperclip, FiSettings, FiTrash2, FiDownload, 
  FiCopy, FiEdit2, FiRefreshCw, FiThumbsUp, FiThumbsDown,
  FiMic, FiVolume2, FiStopCircle, FiCheck, FiPlus, FiSearch
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatInterfaceEnhanced.css';

// Einfache Code-Highlighter Komponente
const CodeBlock = ({ language, children }) => {
  return (
    <div style={{ 
      background: '#1e1e1e', 
      padding: '1rem', 
      borderRadius: '8px', 
      overflow: 'auto',
      marginTop: '0.5rem',
      marginBottom: '0.5rem'
    }}>
      <div style={{ 
        color: '#858585', 
        fontSize: '0.75rem', 
        marginBottom: '0.5rem',
        textTransform: 'uppercase'
      }}>
        {language || 'code'}
      </div>
      <pre style={{ margin: 0 }}>
        <code style={{ 
          color: '#d4d4d4',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const ChatInterfaceEnhanced = () => {
  // State Management
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamController, setStreamController] = useState(null);  // AbortController für Stop-Button
  const [showSettings, setShowSettings] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 4000,
    agentMode: false, // Normal-Modus = false, Agent-Modus = true
    systemPrompt: `Du bist ein hilfreicher AI Assistent und Agent.

WICHTIGE REGELN für Code-Projekte:

1. SCHRITT-FÜR-SCHRITT Modus (Standard):
   - Zeige EINE Datei mit komplettem Code
   - Am Ende schreibe: "✅ Datei [Name] fertig. Soll ich mit der nächsten Datei weitermachen? (ja/weiter/nein)"
   - Warte auf Bestätigung
   - Dann die nächste Datei

2. AGENT Modus (alle auf einmal):
   - Erstelle ALLE Dateien nacheinander ohne zu fragen
   - Jede Datei klar markieren: "📄 Datei: path/filename.ext" am Anfang
   - Am Ende jeder Datei: "✅ Ende Datei: filename.ext"
   - Dann sofort nächste Datei

3. QUALITÄT:
   - Jede Datei KOMPLETT mit allem Code
   - Keine Platzhalter wie "... rest of code ..."
   - Production-ready Code
   - Klare Trennung zwischen Dateien

Beispiel Schritt-für-Schritt:
📄 Datei: lib/main.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Datei main.dart fertig. Soll ich mit der nächsten Datei weitermachen?

Beispiel Agent-Modus:
📄 Datei: lib/main.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Ende: main.dart

📄 Datei: lib/models/todo.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Ende: todo.dart

[... alle weiteren Dateien ...]`,
    voice: 'alloy',
    streamResponses: true,
  });

  // All AI Models including GitHub, Claude, Gemini
  const models = {
    'GitHub Models (10 models)': [
      'gpt-4o',
      'gpt-4o-mini',
      'o1-preview',
      'o1-mini',
      'phi-4',
      'Mistral-large',
      'Mistral-large-2411',
      'Mistral-Nemo',
      'Mistral-small',
      'AI21-Jamba-1.5-Large'
    ],
    'Claude - Anthropic (8 models)': [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0'
    ],
    'Gemini - Google (12 models)': [
      'models/gemini-2.5-pro',
      'models/gemini-2.5-flash',
      'models/gemini-2.0-flash-thinking-exp-1219',
      'models/gemini-2.0-flash-exp',
      'models/gemini-2.0-flash',
      'models/gemini-2.0-flash-lite',
      'models/gemini-2.0-pro-exp',
      'models/gemini-exp-1206',
      'models/gemini-flash-latest',
      'models/gemini-pro-latest',
      'models/learnlm-2.0-flash-experimental',
      'models/gemma-3-12b-it'
    ],
    'Ollama - Local (15 models)': [
      'llama3.2',
      'llama3.1',
      'llama3',
      'mistral',
      'mixtral',
      'codellama',
      'deepseek-coder',
      'qwen2.5',
      'phi3',
      'gemma2',
      'neural-chat',
      'starling-lm',
      'vicuna',
      'orca-mini',
      'dolphin-mistral'
    ],
    'GPT-5 (10 models)': [
      'gpt-5',
      'gpt-5-pro',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5-codex',
      'gpt-5-chat-latest',
      'gpt-5-search-api',
      'gpt-5-2025-08-07',
      'gpt-5-pro-2025-10-06',
      'gpt-5-mini-2025-08-07'
    ],
    'GPT-4.1 (6 models)': [
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4.1-2025-04-14',
      'gpt-4.1-mini-2025-04-14',
      'gpt-4.1-nano-2025-04-14'
    ],
    'GPT-4o (12 models)': [
      'gpt-4o',
      'gpt-4o-mini',
      'chatgpt-4o-latest',
      'gpt-4o-2024-11-20',
      'gpt-4o-2024-08-06',
      'gpt-4o-mini-2024-07-18',
      'gpt-4o-search-preview',
      'gpt-4o-mini-search-preview',
      'gpt-4o-audio-preview',
      'gpt-4o-mini-audio-preview',
      'gpt-4o-realtime-preview',
      'gpt-4o-mini-realtime-preview'
    ],
    'O-Series (10 models)': [
      'o1',
      'o1-pro',
      'o1-2024-12-17',
      'o1-pro-2025-03-19',
      'o3',
      'o3-mini',
      'o3-pro',
      'o3-deep-research',
      'o3-2025-04-16',
      'o3-mini-2025-01-31'
    ],
    'GPT-4 (13 models)': [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4o-2024-08-06',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-4-0613',
      'gpt-4-32k',
      'gpt-4-1106-preview',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-preview',
      'gpt-4-vision-preview'
    ],
    'O-Series (18 models)': [
      'o1',
      'o1-preview',
      'o1-mini',
      'o1-2024-12-17',
      'o3',
      'o3-mini',
      'o3-preview',
      'o4-mini',
      'chatgpt-4o-latest',
      'o1-pro',
      'o1-pro-mini',
      'o2-preview',
      'o2-mini',
      'o1-turbo',
      'o1-reasoning',
      'o1-code',
      'o1-analysis',
      'o1-creative'
    ],
    'Image Models (4 models)': [
      'dall-e-3',
      'dall-e-2',
      'dall-e-3-hd',
      'dall-e-mini'
    ],
    'Video Models (2 models)': [
      'sora-1.0',
      'sora-turbo'
    ],
    'Audio Models (14 models)': [
      'whisper-1',
      'whisper-large',
      'whisper-large-v3',
      'tts-1',
      'tts-1-hd',
      'tts-1-1106',
      'audio-preview',
      'gpt-4o-audio-preview',
      'gpt-4o-audio-preview-2024-10-01',
      'gpt-4o-audio-preview-2024-12-17',
      'whisper-large-v2',
      'tts-nova',
      'tts-shimmer',
      'audio-transcription'
    ],
    'Realtime Models (10 models)': [
      'gpt-4o-realtime-preview',
      'gpt-4o-realtime-preview-2024-10-01',
      'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4-realtime',
      'realtime-audio',
      'realtime-vision',
      'gpt-4-audio-realtime',
      'o1-realtime',
      'chatgpt-realtime',
      'multimodal-realtime'
    ],
    'Specialized (15 models)': [
      'text-embedding-3-large',
      'text-embedding-3-small',
      'text-embedding-ada-002',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-instruct',
      'babbage-002',
      'davinci-002',
      'text-moderation-latest',
      'text-moderation-stable',
      'omni-moderation-latest',
      'gpt-4-search',
      'gpt-4-browse',
      'code-interpreter'
    ]
  };

  const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem('vibeai_conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    if (conversations.length > 0) {
      localStorage.setItem('vibeai_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Get dynamic system prompt based on agent mode
  const getSystemPrompt = () => {
    const basePrompt = `Du bist ein hilfreicher AI Assistent und Agent.

QUALITÄT:
- Jede Datei KOMPLETT mit allem Code
- Keine Platzhalter wie "... rest of code ..."
- Production-ready Code
- Klare Trennung zwischen Dateien`;

    if (settings.agentMode) {
      // Agent Modus: Alle Dateien auf einmal
      return `${basePrompt}

🤖 AGENT MODUS AKTIVIERT 🤖

WICHTIG - Erstelle ALLE Dateien nacheinander OHNE zu warten:
- Jede Datei klar markieren: "📄 Datei: path/filename.ext" am Anfang
- Am Ende jeder Datei: "✅ Ende Datei: filename.ext"
- Dann sofort die nächste Datei
- KEINE Fragen stellen
- NICHT auf Bestätigung warten

Beispiel:
📄 Datei: lib/main.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Ende: main.dart

📄 Datei: lib/models/todo.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Ende: todo.dart

[... alle weiteren Dateien direkt hintereinander ...]`;
    } else {
      // Normal Modus: Schritt-für-Schritt
      return `${basePrompt}

👤 NORMAL MODUS (Schritt-für-Schritt)

WICHTIG - Eine Datei nach der anderen:
- Zeige EINE Datei mit komplettem Code
- Datei klar markieren: "📄 Datei: path/filename.ext"
- Am Ende schreibe: "✅ Datei [Name] fertig. Soll ich mit der nächsten Datei weitermachen? (ja/weiter/nein)"
- WARTE auf Bestätigung vom User
- Dann erst die nächste Datei

Beispiel:
📄 Datei: lib/main.dart
\`\`\`dart
[kompletter Code]
\`\`\`
✅ Datei main.dart fertig. Soll ich mit der nächsten Datei weitermachen? (ja/weiter/nein)`;
    }
  };

  // Helper Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateConversationTitle = (firstMessage) => {
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  // Conversation Management
  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      model: selectedModel,
      created: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setMessages([]);
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id) {
      setActiveConversation(null);
      setMessages([]);
    }
  };

  const renameConversation = (id, newTitle) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, title: newTitle } : c
    ));
  };

  const loadConversation = (conv) => {
    setActiveConversation(conv.id);
    setMessages(conv.messages);
    setSelectedModel(conv.model);
  };

  const saveCurrentConversation = () => {
    if (activeConversation && messages.length > 0) {
      setConversations(prev => prev.map(c => 
        c.id === activeConversation 
          ? { ...c, messages, model: selectedModel, updated: new Date().toISOString() }
          : c
      ));
    }
  };

  // Message Actions
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const deleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const editMessage = (index, newContent) => {
    const updatedMessages = [...messages];
    updatedMessages[index] = { ...updatedMessages[index], content: newContent, edited: true };
    setMessages(updatedMessages);
  };

  const regenerateResponse = async (index) => {
    const userMessage = messages[index - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // Remove the old response
    setMessages(prev => prev.slice(0, index));
    
    // Regenerate
    await sendMessage(userMessage.content, userMessage.files || []);
  };

  const likeMessage = (index) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], liked: !updated[index].liked, disliked: false };
    setMessages(updated);
  };

  const dislikeMessage = (index) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], disliked: !updated[index].disliked, liked: false };
    setMessages(updated);
  };

  // Voice Features
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');

    try {
      const response = await fetch('http://127.0.0.1:8005/api/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setInput(prev => prev + ' ' + data.text);
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('http://127.0.0.1:8005/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: settings.voice,
          model: 'tts-1'
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  // File Handling
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...fileData]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            url: e.target.result,
            isImage: true
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Main Send Function
  const sendMessage = async (messageText = input, files = attachedFiles) => {
    if (!messageText.trim() && files.length === 0) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      files: files,
      timestamp: new Date().toLocaleTimeString(),
      id: `user-${Date.now()}-${Math.random()}`
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    // Create conversation if needed
    if (!activeConversation) {
      const newConv = {
        id: Date.now(),
        title: generateConversationTitle(messageText),
        messages: [userMessage],
        model: selectedModel,
        created: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv.id);
    }

    try {
      // GPT-5, O1, O3 don't support streaming well - use normal response
      const isReasoningModel = selectedModel.includes('gpt-5') || 
                               selectedModel.includes('o1') || 
                               selectedModel.includes('o3');
      
      if (settings.streamResponses && !isReasoningModel) {
        await handleStreamingResponse(messageText);
      } else {
        await handleNormalResponse(messageText);
      }
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        id: `error-${Date.now()}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
    saveCurrentConversation();
  };

  const handleNormalResponse = async (messageText) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout
      
      // Build conversation history (last 10 messages to keep context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: messageText,
          agent: 'aura',
          system_prompt: getSystemPrompt(),
          conversation_history: conversationHistory
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔍 Backend Response:', data);

      const assistantMessage = {
        role: 'assistant',
        content: data.response || data.error || 'Keine Antwort erhalten',
        model: selectedModel,
        timestamp: new Date().toLocaleTimeString(),
        imageUrl: data.imageUrl,
        audioUrl: data.audioUrl,
        id: `assistant-${Date.now()}-${Math.random()}`
      };
      console.log('📨 Assistant Message:', assistantMessage);

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Error in handleNormalResponse:', error);
      const errorMessage = {
        role: 'error',
        content: `❌ Fehler: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        id: `error-${Date.now()}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleStreamingResponse = async (messageText) => {
    console.log('🚀 Starting streaming response for:', messageText);
    setIsStreaming(true);
    
    // Create AbortController for cancellation
    const controller = new AbortController();
    setStreamController(controller);
    
    const messageId = `assistant-${Date.now()}-${Math.random()}`;
    const assistantMessage = {
      role: 'assistant',
      content: '',
      model: selectedModel,
      timestamp: new Date().toLocaleTimeString(),
      id: messageId,
      streaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);
    console.log('📝 Created streaming message with ID:', messageId);

    try {
      console.log('📡 Fetching from backend with stream=true...');
      
      // Build conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: messageText,
          agent: 'aura',
          stream: true,
          system_prompt: getSystemPrompt(),
          conversation_history: conversationHistory
        }),
        signal: controller.signal
      });

      console.log('✅ Got response, starting to read stream...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ Stream finished. Total chunks:', chunkCount);
          break;
        }

        const chunk = decoder.decode(value);
        chunkCount++;
        console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100));
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedContent += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ));
              }
              if (data.done) {
                console.log('🏁 Received done signal');
                break;
              }
            } catch (e) {
              console.error('❌ Parse error:', e, 'Line:', line);
            }
          }
        }
      }

      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, streaming: false }
          : msg
      ));
      console.log('✅ Streaming complete! Final content length:', accumulatedContent.length);

    } catch (error) {
      console.error('❌ Streaming error:', error);
      if (error.name === 'AbortError') {
        // User stopped the stream
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: msg.content + '\n\n⏹️ Gestoppt vom User', streaming: false }
            : msg
        ));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: `❌ Fehler: ${error.message}`, streaming: false }
            : msg
        ));
      }
    } finally {
      setIsStreaming(false);
      setStreamController(null);
    }
  };

  const stopStreaming = () => {
    console.log('⏹️ User clicked STOP - aborting stream...');
    if (streamController) {
      streamController.abort();
    }
    setIsStreaming(false);
  };

  // Export Functions
  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.json`;
    a.click();
  };

  const exportAsMarkdown = () => {
    let markdown = `# Chat Export\\n\\n`;
    markdown += `**Model**: ${selectedModel}\\n`;
    markdown += `**Date**: ${new Date().toLocaleString()}\\n\\n`;
    markdown += `---\\n\\n`;

    messages.forEach(msg => {
      markdown += `### ${msg.role === 'user' ? 'You' : 'Assistant'} (${msg.timestamp})\\n\\n`;
      markdown += `${msg.content}\\n\\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${Date.now()}.md`;
    a.click();
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chat-enhanced">
      {/* Sidebar with Conversations */}
      <div className="chat-sidebar-enhanced">
        <div className="sidebar-header-enhanced">
          <button onClick={createNewConversation} className="new-chat-btn">
            <FiPlus /> New Chat
          </button>
        </div>

        <div className="search-conversations">
          <FiSearch />
          <input 
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => loadConversation(conv)}
            >
              <div className="conv-title">{conv.title}</div>
              <div className="conv-actions">
                <button onClick={(e) => {
                  e.stopPropagation();
                  const newTitle = prompt('Rename conversation:', conv.title);
                  if (newTitle) renameConversation(conv.id, newTitle);
                }}>
                  <FiEdit2 />
                </button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Model Selector in Sidebar */}
        <div className="sidebar-model-selector">
          <label>🤖 Model</label>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {Object.entries(models).map(([category, modelList]) => (
              <optgroup key={category} label={category}>
                {modelList.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="sidebar-footer-actions">
          <button onClick={() => setShowSettings(!showSettings)}>
            <FiSettings /> Settings
          </button>
          <button onClick={exportChat}>
            <FiDownload /> Export JSON
          </button>
          <button onClick={exportAsMarkdown}>
            <FiDownload /> Export MD
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main-enhanced">
        {showSettings && (
          <div className="settings-overlay">
            <div className="settings-modal">
              <div className="settings-header">
                <h2>⚙️ Settings</h2>
                <button onClick={() => setShowSettings(false)}>✕</button>
              </div>

              <div className="settings-body">
                <div className="setting-item">
                  <label>
                    🤖 Agent Modus {settings.agentMode ? '(Alle Dateien auf einmal)' : '(Schritt-für-Schritt)'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: settings.agentMode ? '#888' : '#4CAF50', fontWeight: settings.agentMode ? 'normal' : 'bold' }}>
                      👤 Normal
                    </span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={settings.agentMode}
                        onChange={(e) => setSettings({...settings, agentMode: e.target.checked})}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '14px', color: settings.agentMode ? '#4CAF50' : '#888', fontWeight: settings.agentMode ? 'bold' : 'normal' }}>
                      🤖 Agent
                    </span>
                  </div>
                  <small style={{ color: '#888', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {settings.agentMode 
                      ? '✅ Erstellt alle Dateien automatisch ohne zu fragen (Premium Feature)'
                      : '✅ Wartet nach jeder Datei auf deine Bestätigung'
                    }
                  </small>
                </div>

                <div className="setting-item">
                  <label>Temperature: {settings.temperature}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.1" 
                    value={settings.temperature}
                    onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="setting-item">
                  <label>Max Tokens: {settings.maxTokens}</label>
                  <input 
                    type="range" 
                    min="100" 
                    max="8000" 
                    step="100" 
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                  />
                </div>

                <div className="setting-item">
                  <label>System Prompt</label>
                  <textarea 
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({...settings, systemPrompt: e.target.value})}
                    rows="4"
                  />
                </div>

                <div className="setting-item">
                  <label>TTS Voice</label>
                  <select 
                    value={settings.voice}
                    onChange={(e) => setSettings({...settings, voice: e.target.value})}
                  >
                    {voices.map(voice => (
                      <option key={voice} value={voice}>{voice}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={settings.streamResponses}
                      onChange={(e) => setSettings({...settings, streamResponses: e.target.checked})}
                    />
                    Stream Responses
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages-enhanced">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <h1>👋 Welcome to VibeAI</h1>
              <p>Start a conversation with any AI model</p>
              <div className="quick-prompts">
                <button onClick={() => setInput("Explain quantum computing in simple terms")}>
                  🔬 Explain Quantum Computing
                </button>
                <button onClick={() => setInput("Write a Python function for sorting")}>
                  💻 Code Example
                </button>
                <button onClick={() => setInput("Tell me a creative story")}>
                  🎨 Creative Story
                </button>
                <button onClick={() => setInput("Analyze pros and cons of AI")}>
                  📊 Analysis Task
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={msg.id || index} className={`message-enhanced message-${msg.role}`}>
              <div className="message-avatar-enhanced">
                {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚠️'}
              </div>
              <div className="message-content-enhanced">
                <div className="message-header-enhanced">
                  <span className="message-sender-enhanced">
                    {msg.role === 'user' ? 'You' : msg.model || 'Assistant'}
                  </span>
                  <span className="message-time-enhanced">
                    {msg.timestamp}
                    {msg.edited && <span className="edited-badge">edited</span>}
                  </span>
                </div>
                
                {msg.content && (
                  <div className="message-text-enhanced">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          
                          return !inline ? (
                            <CodeBlock language={language}>
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          ) : (
                            <code style={{
                              background: '#f4f4f4',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.9em',
                              fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                            }} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}

                {msg.streaming && (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                {msg.imageUrl && (
                  <div className="message-image">
                    <img src={msg.imageUrl} alt="Generated" />
                    <a href={msg.imageUrl} download className="download-btn">
                      <FiDownload /> Download
                    </a>
                  </div>
                )}

                {msg.files && msg.files.length > 0 && (
                  <div className="message-files">
                    {msg.files.map((file, i) => (
                      <div key={i} className="file-chip">
                        {file.isImage ? (
                          <img src={file.url} alt={file.name} className="file-thumbnail" />
                        ) : (
                          '📎'
                        )}
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Actions */}
                {msg.role === 'assistant' && !msg.streaming && (
                  <div className="message-actions">
                    <button onClick={() => copyMessage(msg.content)} title="Copy">
                      <FiCopy />
                    </button>
                    <button onClick={() => speakText(msg.content)} title="Read aloud">
                      <FiVolume2 />
                    </button>
                    <button onClick={() => likeMessage(index)} title="Like" className={msg.liked ? 'active' : ''}>
                      <FiThumbsUp />
                    </button>
                    <button onClick={() => dislikeMessage(index)} title="Dislike" className={msg.disliked ? 'active' : ''}>
                      <FiThumbsDown />
                    </button>
                    <button onClick={() => regenerateResponse(index)} title="Regenerate">
                      <FiRefreshCw />
                    </button>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="message-actions">
                    <button onClick={() => copyMessage(msg.content)} title="Copy">
                      <FiCopy />
                    </button>
                    <button onClick={() => deleteMessage(index)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && !isStreaming && (
            <div className="message-enhanced message-assistant">
              <div className="message-avatar-enhanced">🤖</div>
              <div className="message-content-enhanced">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-enhanced">
          {attachedFiles.length > 0 && (
            <div className="attached-files-enhanced">
              {attachedFiles.map((file, index) => (
                <div key={index} className="file-preview-enhanced">
                  {file.isImage ? (
                    <img src={file.url} alt={file.name} />
                  ) : (
                    <div className="file-icon">📄</div>
                  )}
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="input-box-enhanced">
            <button 
              className="input-action-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <FiPaperclip />
            </button>

            <button 
              className="input-action-btn" 
              onClick={() => imageInputRef.current?.click()}
              title="Upload image"
            >
              📷
            </button>

            <button 
              className={`input-action-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <FiStopCircle /> : <FiMic />}
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
            />

            <input 
              type="file" 
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />

            {(selectedModel.includes('gpt-5') || selectedModel.includes('o1') || selectedModel.includes('o3')) && (
              <div style={{
                backgroundColor: '#2a2a3e',
                color: '#ffa726',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⏳ <strong>Reasoning Model:</strong> Antwort kann 30-60 Sekunden dauern
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message VibeAI..."
              rows="1"
            />

            {isStreaming ? (
              <button 
                className="stop-btn" 
                onClick={stopStreaming}
              >
                <FiStopCircle /> Stop
              </button>
            ) : (
              <button 
                className="send-btn-enhanced" 
                onClick={() => sendMessage()}
                disabled={!input.trim() && attachedFiles.length === 0}
              >
                {isLoading ? '⏳' : <FiSend />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfaceEnhanced;
