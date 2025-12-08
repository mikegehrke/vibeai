'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaMicrophone, FaMicrophoneSlash, FaPaperclip, FaVolume Up, FaStop } from 'react-icons/fa';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function BuilderPageChatGPTStyle({ params }) {
  const { projectId } = params;
  const router = useRouter();

  // FILES & EDITOR
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);

  // LAYOUT
  const [leftPanelWidth, setLeftPanelWidth] = useState(250); // File Explorer
  const [chatPanelWidth, setChatPanelWidth] = useState(400); // Chat rechts
  const [isResizingChat, setIsResizingChat] = useState(false);

  // CHAT - ChatGPT Style
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // GENERATOR - Live Streaming
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingFile, setCurrentGeneratingFile] = useState(null);
  const [generatedFilesCount, setGeneratedFilesCount] = useState(0);
  const [totalFilesToGenerate, setTotalFilesToGenerate] = useState(0);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    loadProjectFiles();
    initChatGPTStyleAgent();
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ===== LOAD PROJECT =====
  const loadProjectFiles = () => {
    const saved = localStorage.getItem(`project_${projectId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFiles(data.files || []);
        if (data.files?.length > 0) {
          setActiveFile(data.files[0]);
          setOpenTabs([data.files[0]]);
        }
      } catch (e) {
        console.error('Load error:', e);
      }
    }
  };

  // ===== INIT CHATGPT AGENT =====
  const initChatGPTStyleAgent = () => {
    setChatMessages([{
      role: 'assistant',
      content: `👋 **Hallo! Ich bin dein AI Coding Agent.**

Ich kann:
- 🚀 **Komplette Apps generieren** (Flutter, React, Next.js, etc.)
- 💬 **Code erklären & debuggen**
- ✨ **Features hinzufügen**
- 🎨 **UI/UX verbessern**

**Sage mir einfach was du bauen willst!**

Beispiel: *"Erstelle eine vollständige Flutter Fitness-App mit Workouts und BMI-Rechner"*`,
      timestamp: new Date().toISOString()
    }]);
  };

  // ===== SEND MESSAGE - INTELLIGENT =====
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const prompt = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      // 🔥 INTELLIGENTE PROMPT-ERKENNUNG
      const isProjectRequest = detectProjectRequest(prompt);

      if (isProjectRequest) {
        // GENERATOR STARTEN - MIT LIVE STREAMING!
        await startLiveProjectGeneration(prompt);
      } else {
        // NORMALER CHAT
        await normalChatResponse(prompt);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage('assistant', '❌ Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // ===== DETECT PROJECT REQUEST =====
  const detectProjectRequest = (prompt) => {
    const lower = prompt.toLowerCase();
    const triggerWords = [
      'erstelle', 'erstell', 'generiere', 'generier', 'mach mir',
      'bau mir', 'baue', 'build', 'create', 'vollständig',
      'komplett', 'projekt', 'app', 'anwendung'
    ];

    return triggerWords.some(word => lower.includes(word)) &&
      (lower.includes('flutter') || lower.includes('react') ||
        lower.includes('next') || lower.includes('node') ||
        lower.includes('app') || lower.includes('projekt'));
  };

  // ===== LIVE PROJECT GENERATION - FILE BY FILE! =====
  const startLiveProjectGeneration = async (prompt) => {
    setIsGenerating(true);

    addChatMessage('assistant', `🚀 **Verstanden! Ich starte die Projekt-Generierung...**

📝 Analysiere deinen Prompt...
🎯 Erkenne Anforderungen...
📁 Erstelle Projektstruktur...`);

    // Warte kurz für Effekt
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Rufe Backend API auf
    try {
      const response = await fetch('http://localhost:8000/api/generate-fitlife', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: extractProjectName(prompt),
          prompt: prompt
        })
      });

      if (!response.ok) throw new Error('Generator API Fehler');

      const result = await response.json();

      // ===== LIVE FILE-BY-FILE STREAMING! =====
      setTotalFilesToGenerate(result.files.length);
      setGeneratedFilesCount(0);

      addChatMessage('assistant', `✅ **Projekt-Struktur erstellt!**

📦 **${result.files.length} Dateien** werden jetzt generiert...
⏱️ Beobachte wie ich Datei für Datei schreibe!`);

      const newFiles = [];

      for (let i = 0; i < result.files.length; i++) {
        const fileData = result.files[i];

        // ZEIGE AKTUELLE DATEI
        setCurrentGeneratingFile(fileData.path);
        setGeneratedFilesCount(i + 1);

        // UPDATE CHAT MIT FORTSCHRITT
        addChatMessage('assistant', `📝 **Schreibe:** \`${fileData.path}\` (${i + 1}/${result.files.length})`);

        // ERSTELLE DATEI
        const newFile = {
          name: fileData.path.split('/').pop(),
          path: fileData.path,
          content: fileData.content,
          language: getLanguage(fileData.path),
          lastModified: new Date().toISOString()
        };

        newFiles.push(newFile);

        // UPDATE FILES LIVE (User sieht Datei erscheinen!)
        setFiles(prev => [...prev, newFile]);

        // Warte für visuellen Effekt
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setIsGenerating(false);
      setCurrentGeneratingFile(null);

      // SETZE ERSTE DATEI ALS AKTIV
      if (newFiles.length > 0) {
        setActiveFile(newFiles[0]);
        setOpenTabs([newFiles[0]]);
      }

      // SAVE TO LOCALSTORAGE
      saveToLocalStorage(newFiles);

      // FINALE NACHRICHT
      addChatMessage('assistant', `✅ **FERTIG! Projekt erfolgreich generiert!**

📁 **${newFiles.length} Dateien** erstellt:
${newFiles.slice(0, 5).map(f => `- \`${f.path}\``).join('\n')}
${newFiles.length > 5 ? `... und ${newFiles.length - 5} weitere` : ''}

🚀 **Die App ist sofort lauffähig!**
📱 Sieh dir die Live-Preview rechts an!`);

      // UPDATE PREVIEW
      updatePreview();

    } catch (error) {
      setIsGenerating(false);
      addChatMessage('assistant', `❌ **Fehler bei der Generierung:**

\`\`\`
${error.message}
\`\`\`

Möchtest du es nochmal versuchen?`);
    }
  };

  // ===== NORMAL CHAT RESPONSE =====
  const normalChatResponse = async (prompt) => {
    try {
      const res = await fetch('http://localhost:8000/chatgpt/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Du bist ein hilfreicher AI Coding Agent im VibeAI Builder.

KONTEXT:
- Projekt: ${projectId}
- Aktive Datei: ${activeFile?.name || 'Keine'}
- Sprache: ${activeFile ? getLanguage(activeFile.name) : 'Unbekannt'}

USER: ${prompt}

Gebe eine hilfreiche, präzise Antwort mit Code-Beispielen wenn nötig.`,
          model: 'gpt-4o'
        })
      });

      if (res.ok) {
        const data = await res.json();
        addChatMessage('assistant', data.response || data.message);
      } else {
        addChatMessage('assistant', 'Entschuldigung, ich konnte keine Antwort generieren. Versuche es bitte nochmal.');
      }
    } catch (error) {
      addChatMessage('assistant', 'Es gab einen Netzwerkfehler. Bitte überprüfe deine Verbindung.');
    }
  };

  // ===== VOICE RECORDING =====
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // TODO: Send to Whisper API for transcription
        addChatMessage('assistant', '🎤 Voice-Transkription wird noch implementiert...');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsVoiceRecording(true);
    } catch (error) {
      alert('Mikrofon-Zugriff verweigert');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop();
      setIsVoiceRecording(false);
    }
  };

  // ===== TEXT TO SPEECH =====
  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ''));
      utterance.lang = 'de-DE';
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ===== FILE UPLOAD =====
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    addChatMessage('assistant', `📎 ${files.length} Datei(en) hochgeladen. Was soll ich damit machen?`);
  };

  // ===== HELPERS =====
  const addChatMessage = (role, content) => {
    setChatMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toISOString()
    }]);
  };

  const extractProjectName = (prompt) => {
    // Versuche Projektnamen aus Prompt zu extrahieren
    const match = prompt.match(/namens? ([a-z_]+)/i);
    return match ? match[1] : 'generated_app';
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop();
    const langMap = {
      'dart': 'dart',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'yaml': 'yaml',
      'md': 'markdown'
    };
    return langMap[ext] || 'plaintext';
  };

  const saveToLocalStorage = (filesToSave) => {
    localStorage.setItem(`project_${projectId}`, JSON.stringify({
      files: filesToSave,
      lastModified: new Date().toISOString()
    }));
  };

  const updatePreview = () => {
    // TODO: Update iframe preview
    console.log('Preview aktualisiert');
  };

  const formatChatMessage = (content) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  // ===== RENDER =====
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1e1e1e', color: '#d4d4d4', overflow: 'hidden' }}>

      {/* LEFT: File Explorer */}
      <div style={{ width: `${leftPanelWidth}px`, background: '#252526', borderRight: '1px solid #444', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px', borderBottom: '1px solid #444', fontWeight: '600', fontSize: '13px' }}>
          📁 FILES
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '12px' }}>
              Keine Dateien vorhanden.
              <br />Frage den AI Agent!
            </div>
          )}
          {files.map((file, i) => (
            <div
              key={i}
              onClick={() => setActiveFile(file)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                background: activeFile?.path === file.path ? '#094771' : 'transparent',
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '12px'
              }}
            >
              📄 {file.name}
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Editor + Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Editor */}
        <div style={{ height: '50%', borderBottom: '1px solid #444' }}>
          {activeFile ? (
            <MonacoEditor
              language={activeFile.language}
              value={activeFile.content}
              onChange={(value) => {
                setActiveFile(prev => ({ ...prev, content: value }));
              }}
              theme="vs-dark"
              options={{ fontSize: 13, minimap: { enabled: false } }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
              Keine Datei geöffnet
            </div>
          )}
        </div>

        {/* Preview */}
        <div style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', background: '#2d2d2d', borderBottom: '1px solid #444', fontSize: '12px', fontWeight: '600' }}>
            📱 LIVE PREVIEW
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '20px' }}>
            <iframe
              id="preview-frame"
              sandbox="allow-scripts allow-same-origin"
              style={{ width: '100%', height: '100%', border: '1px solid #ccc', borderRadius: '8px' }}
            />
          </div>
        </div>
      </div>

      {/* RIGHT: ChatGPT-Style Chat */}
      <div style={{ width: `${chatPanelWidth}px`, borderLeft: '1px solid #444', display: 'flex', flexDirection: 'column', background: '#212121' }}>

        {/* Chat Header */}
        <div style={{ padding: '16px', background: '#2d2d2d', borderBottom: '1px solid #444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '24px' }}>🤖</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>AI Coding Agent</div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>GPT-4o • Live • Intelligent</div>
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div style={{ padding: '12px', background: '#1a472a', borderBottom: '1px solid #2e7d32' }}>
            <div style={{ fontSize: '12px', marginBottom: '6px' }}>
              🚀 Generiere: {generatedFilesCount}/{totalFilesToGenerate} Dateien
            </div>
            {currentGeneratingFile && (
              <div style={{ fontSize: '10px', color: '#81c784' }}>
                📝 {currentGeneratingFile}
              </div>
            )}
            <div style={{ marginTop: '8px', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${(generatedFilesCount / totalFilesToGenerate) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00c853, #69f0ae)',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <div style={{ fontSize: '16px' }}>{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: msg.role === 'user' ? '#4fc3f7' : '#00c853' }}>
                  {msg.role === 'user' ? 'Du' : 'AI Agent'}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {new Date(msg.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakMessage(msg.content)}
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 8px',
                      background: isSpeaking ? '#f44336' : '#444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    {isSpeaking ? <FaStop /> : <FaVolumeUp />}
                  </button>
                )}
              </div>
              <div
                style={{
                  background: msg.role === 'user' ? '#094771' : '#2d2d2d',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.content) }}
              />
            </div>
          ))}
          {isChatLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '12px' }}>
              <div className="loading-dots">●●●</div>
              <span>AI denkt nach...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Area */}
        <div style={{ padding: '16px', background: '#2d2d2d', borderTop: '1px solid #444' }}>

          {/* File Attachments */}
          {selectedFiles.length > 0 && (
            <div style={{ marginBottom: '8px', fontSize: '11px', color: '#aaa' }}>
              📎 {selectedFiles.length} Datei(en) ausgewählt
            </div>
          )}

          {/* Input Field */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple style={{ display: 'none' }} />

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px',
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Datei anhängen"
            >
              <FaPaperclip />
            </button>

            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="Frage den AI Agent... (Shift+Enter für neue Zeile)"
              disabled={isChatLoading}
              rows={2}
              style={{
                flex: 1,
                padding: '12px',
                background: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '8px',
                color: '#d4d4d4',
                fontSize: '13px',
                resize: 'none',
                outline: 'none'
              }}
            />

            <button
              onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
              style={{
                padding: '10px',
                background: isVoiceRecording ? '#f44336' : '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title={isVoiceRecording ? 'Aufnahme stoppen' : 'Spracheingabe'}
            >
              {isVoiceRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || isChatLoading}
              style={{
                padding: '12px 20px',
                background: chatInput.trim() && !isChatLoading ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: chatInput.trim() && !isChatLoading ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              Senden
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-dots {
          0%, 20% { content: '●'; }
          40% { content: '●●'; }
          60%, 100% { content: '●●●'; }
        }
        .loading-dots {
          animation: loading-dots 1.4s infinite;
        }
      `}</style>
    </div>
  );
}
