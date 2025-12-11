'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Search, File, Folder, GitBranch, Package, Terminal as TerminalIcon,
  Settings, X, ChevronRight, ChevronDown, Circle, CheckCircle2,
  AlertCircle, Info, Zap, Brain, Code, Palette, Eye, MessageSquare,
  Play, Save, FolderOpen, FileText, Code2, GitCommit, GitMerge,
  User, Loader2, Send, Bot, ArrowUp, AtSign, Globe, Image, Infinity, ExternalLink, Copy, Check, Mic, Users
} from 'lucide-react';
import FileTree from './components/FileTree';
import GitPanel from './components/GitPanel';
import Terminal from './components/Terminal';
import PackageManager from './components/PackageManager';
import ReviewPanel from './components/ReviewPanel';
import CommandPalette from './components/CommandPalette';
import SearchPanel from './components/SearchPanel';
import RunAndDebugPanel from './components/RunAndDebugPanel';
import TestingPanel from './components/TestingPanel';
import ExtensionsPanel from './components/ExtensionsPanel';
import TutorialGuide from './components/TutorialGuide';
import './styles/editor.css';

// Dynamic Monaco Editor import
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false 
});

// AI Models Configuration
const AI_MODELS = {
  'gpt-4': { name: 'GPT-4', provider: 'OpenAI', icon: '🧠', color: '#10B981' },
  'gpt-4-turbo': { name: 'GPT-4 Turbo', provider: 'OpenAI', icon: '⚡', color: '#3B82F6' },
  'claude-3-sonnet': { name: 'Claude 3 Sonnet', provider: 'Anthropic', icon: '🎭', color: '#8B5CF6' },
  'claude-3-opus': { name: 'Claude 3 Opus', provider: 'Anthropic', icon: '🎨', color: '#F59E0B' },
  'gemini-pro': { name: 'Gemini Pro', provider: 'Google', icon: '💎', color: '#EF4444' }
};

// Agent Types - Alle verfügbaren Agenten
const AGENT_TYPES = {
  'aura': { name: 'Aura', icon: Zap, description: 'Allgemeiner AI Assistant - Beantwortet Fragen, hilft bei allem', emoji: '✨' },
  'cora': { name: 'Cora', icon: Code, description: 'Code Expert - Programmieren, Debuggen, Code-Generierung', emoji: '💡' },
  'devra': { name: 'Devra', icon: Brain, description: 'Deep Thinker - Komplexe Analysen, Reasoning, Erklärungen', emoji: '🧠' },
  'lumi': { name: 'Lumi', icon: Palette, description: 'Creative Genius - Design, Kreativität, Ideen, Writing', emoji: '🎨' }
};

export default function BuilderPage({ params, searchParams }) {
  const { projectId } = params;
  const router = useRouter();
  
  // Live Build State
  const [isLiveBuilding, setIsLiveBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState({ current: 0, total: 0, currentFile: null });
  const wsRef = useRef(null);

  // Enhanced State Management
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeBrowserTab, setActiveBrowserTab] = useState(null); // Currently active browser tab ID
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [leftSidebarContentWidth, setLeftSidebarContentWidth] = useState(232); // 280 - 48 (icons)
  const [rightPanelWidth, setRightPanelWidth] = useState(450);
  const [activeRightPanel, setActiveRightPanel] = useState('review'); // review or chat
  const [activeLeftPanel, setActiveLeftPanel] = useState('explorer'); // explorer, search, source-control, run-debug, testing, extensions
  const [activeBottomPanel, setActiveBottomPanel] = useState('terminal');
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [reviewData, setReviewData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Chat & AI State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4o');
  const [currentAgent, setCurrentAgent] = useState('aura');
  const [teamMode, setTeamMode] = useState(false);
  const [teamAgents, setTeamAgents] = useState(['aura', 'cora']);
  const [teamModeType, setTeamModeType] = useState('parallel'); // parallel, sequential, consensus
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('default');
  
  // Advanced Features State
  const [selectedText, setSelectedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [agentActivity, setAgentActivity] = useState({
    filesModified: 0,
    filesCreated: 0,
    commandsExecuted: 0,
    agents: []
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [codeGenHistory, setCodeGenHistory] = useState([]);
  const [autoMode, setAutoMode] = useState(false);
  const [showAutoDropdown, setShowAutoDropdown] = useState(false);
  const [autoModeType, setAutoModeType] = useState('auto'); // 'auto', '1x', '2x', '3x'
  const [notifications, setNotifications] = useState([]);
  
  // Preview Server State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'web', 'flutter', 'html'
  const [previewStatus, setPreviewStatus] = useState('stopped'); // 'stopped', 'starting', 'running', 'error'
  const [previewError, setPreviewError] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('iphone15'); // 'iphone15', 'pixel8', 'ipad', 'desktop'
  const [browserTabs, setBrowserTabs] = useState([]); // Array of {id, url, title}
  
  // Project State
  const [projectStats, setProjectStats] = useState({
    linesOfCode: 0,
    filesCount: 0,
    lastBuild: null,
    errors: 0,
    warnings: 0
  });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const terminalRef = useRef(null);
  const resizeRef = useRef({ isResizing: false, type: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  
  // ⚡ PERFORMANCE: Throttling/Debouncing Refs für optimierte Updates
  const lastChatUpdateRef = useRef(0);
  const lastEditorUpdateRef = useRef(0);
  const chatUpdateQueueRef = useRef([]);
  const editorUpdateQueueRef = useRef(null);
  const chatUpdateTimeoutRef = useRef(null);
  const editorUpdateTimeoutRef = useRef(null);

  // Resize handlers
  const startResize = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      isResizing: true,
      type: type,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: type === 'left' ? leftPanelWidth : type === 'left-content' ? leftSidebarContentWidth : type === 'right' ? rightPanelWidth : bottomPanelHeight,
      startHeight: bottomPanelHeight
    };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = type === 'bottom' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleResize = (e) => {
    if (!resizeRef.current.isResizing) return;
    
    const { type, startX, startY, startWidth, startHeight } = resizeRef.current;
    
    if (type === 'left') {
      const diff = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + diff));
      setLeftPanelWidth(newWidth);
      // Update content width accordingly
      setLeftSidebarContentWidth(newWidth - 48);
    } else if (type === 'left-content') {
      const diff = e.clientX - startX;
      const newContentWidth = Math.max(150, Math.min(450, startWidth + diff));
      setLeftSidebarContentWidth(newContentWidth);
      // Update total width
      setLeftPanelWidth(newContentWidth + 48);
    } else if (type === 'right') {
      const diff = startX - e.clientX;
      const newWidth = Math.max(300, Math.min(800, startWidth + diff));
      setRightPanelWidth(newWidth);
    } else if (type === 'bottom') {
      const diff = startY - e.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeight + diff));
      setBottomPanelHeight(newHeight);
    }
  };

  const stopResize = () => {
    resizeRef.current.isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  // Enhanced Initialization
  useEffect(() => {
    initializeProject();
    loadChatSessions();
    setupRealtimeUpdates();
    
    // Command Palette (Cmd+K / Ctrl+K)
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
      if (e.key === 'Escape' && showAutoDropdown) {
        setShowAutoDropdown(false);
      }
    };
    
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (showAutoDropdown && !e.target.closest('[data-auto-dropdown]')) {
        setShowAutoDropdown(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [projectId, showCommandPalette, showAutoDropdown]);

  const initializeProject = async () => {
    try {
      // Try to load from localStorage first (from build-complete-app)
      const savedFiles = localStorage.getItem(`project_${projectId}_files`);
      if (savedFiles) {
        try {
          const parsedFiles = JSON.parse(savedFiles);
          if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
            // Convert to file format with Git status
            const formattedFiles = parsedFiles.map((file, index) => ({
              name: file.path.split('/').pop() || file.path,
              path: file.path,
              content: file.content || '',
              language: file.language || 'text',
              size: (file.content || '').length,
              lastModified: new Date(),
              // Add Git status (M for modified, U for untracked)
              gitStatus: index < 2 ? 'M' : index < 5 ? 'U' : null,
              modified: index < 2,
              untracked: index >= 2 && index < 5
            }));
            setFiles(formattedFiles);
            if (formattedFiles.length > 0) {
              setActiveFile(formattedFiles[0]);
              setOpenTabs([formattedFiles[0]]);
            }
            updateProjectStats();
            
            // Auto-start preview after project initialization
            if (formattedFiles.length > 0) {
              // Determine project type for preview
              const hasHTML = formattedFiles.some(f => f.path.endsWith('.html') || f.name.endsWith('.html'));
              const hasJSX = formattedFiles.some(f => f.path.endsWith('.jsx') || f.path.endsWith('.tsx'));
              const hasDart = formattedFiles.some(f => f.path.endsWith('.dart'));
              
              let previewType = 'html';
              if (hasDart) previewType = 'flutter';
              else if (hasJSX) previewType = 'react';
              
              // Wait a bit for files to be ready, then start preview
              setTimeout(async () => {
                try {
                  console.log('🚀 Auto-starting preview...', previewType);
                  await startPreviewServer(previewType);
                } catch (e) {
                  console.error('Preview auto-start failed:', e);
                }
              }, 2000);
            }
            
            // Set review data for Review Panel
            setReviewData({
              title: "Optimierung des AI-gesteuerten entwicklerprojekts",
              userRequest: "es muss genau so aus sehen wie diese screen chat alle icons und funktionen und editor und komplett so und mit den 4 agenten die im chat sind",
              codeChanges: [
                {
                  file: "page.jsx",
                  added: 7,
                  removed: 1,
                  diff: [
                    { type: 'context', oldLine: 280, newLine: 280, content: "      const response = await fetch('http://127.0.0.1:8001/api/chat', {" },
                    { type: 'removed', oldLine: 280, newLine: null, content: "      const response = await fetch('http://127.0.0.1:8001/api/chat', {" },
                    { type: 'added', oldLine: null, newLine: 281, content: "      const response = await fetch('http://localhost:8005/api/chat', {" }
                  ]
                }
              ]
            });
            return;
          }
        } catch (e) {
          console.log('Failed to parse saved files:', e);
        }
      }
      
      // Load project files from API
      const response = await fetch(`http://localhost:8005/api/projects/${projectId}/files`);
      if (response.ok) {
        const projectFiles = await response.json();
        setFiles(projectFiles);
        if (projectFiles.length > 0) {
          setActiveFile(projectFiles[0]);
          setOpenTabs([projectFiles[0]]);
        }
      } else {
        // Create mock files for demo
        loadMockFiles();
      }
      
      // Load project statistics
      updateProjectStats();
      
    } catch (error) {
      console.error('Project init failed:', error);
      loadMockFiles();
    }
  };

  const loadMockFiles = () => {
    const mockFiles = [
      {
        name: 'README.md',
        path: '/README.md',
        content: `# 🚀 ${projectId}\n\nDies ist dein intelligentes Projekt!\n\n## Features\n- AI-powered development\n- Real-time collaboration\n- Smart code generation\n- Automated testing\n\n## Getting Started\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n---\n*Erstellt mit VibeAI Builder*`,
        language: 'markdown',
        size: 245,
        lastModified: new Date()
      },
      {
        name: 'app.py', 
        path: '/src/app.py',
        content: `#!/usr/bin/env python3\n"""\\nAdvanced AI-Powered Application\\nGenerated by VibeAI Auto-Coder\\n"""\n\\nimport asyncio\nimport logging\nfrom fastapi import FastAPI, HTTPException\nfrom fastapi.middleware.cors import CORSMiddleware\\n\\n# Configure logging\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger(__name__)\\n\\n# Initialize FastAPI app\napp = FastAPI(\n    title="${projectId} API",\n    description="AI-generated application with advanced features",\n    version="1.0.0"\n)\\n\\n# CORS middleware\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["*"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\\n\\n@app.get("/")\nasync def root():\n    return {\n        "message": "🚀 AI-Powered App Running",\n        "status": "online",\n        "version": "1.0.0"\n    }\\n\\n@app.get("/health")\nasync def health_check():\n    return {"status": "healthy", "timestamp": "2024-12-08"}\\n\\nif __name__ == "__main__":\n    import uvicorn\n    uvicorn.run(app, host="0.0.0.0", port=8000)`,
        language: 'python',
        size: 1024,
        lastModified: new Date()
      },
      {
        name: 'package.json',
        path: '/package.json', 
        content: `{\\n  "name": "${projectId.toLowerCase()}",\\n  "version": "1.0.0",\\n  "description": "AI-generated application with modern features",\\n  "main": "index.js",\\n  "scripts": {\\n    "start": "node index.js",\\n    "dev": "nodemon index.js",\\n    "test": "jest",\\n    "build": "webpack --mode production",\\n    "lint": "eslint .",\\n    "format": "prettier --write ."\\n  },\\n  "keywords": ["ai", "automation", "webapp"],\\n  "author": "VibeAI Auto-Coder",\\n  "license": "MIT",\\n  "dependencies": {\\n    "express": "^4.18.0",\\n    "cors": "^2.8.5",\\n    "helmet": "^6.0.0",\\n    "morgan": "^1.10.0"\\n  },\\n  "devDependencies": {\\n    "nodemon": "^2.0.20",\\n    "jest": "^29.0.0",\\n    "eslint": "^8.0.0",\\n    "prettier": "^2.7.0"\\n  }\\n}`,
        language: 'json',
        size: 689,
        lastModified: new Date()
      },
      {
        name: 'index.html',
        path: '/public/index.html',
        content: `<!DOCTYPE html>\\n<html lang="de">\\n<head>\\n    <meta charset="UTF-8">\\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\\n    <title>${projectId} - AI-Powered App</title>\\n    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">\\n    <style>\\n        .gradient-bg {\\n            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\\n        }\\n        .glass {\\n            backdrop-filter: blur(10px);\\n            background: rgba(255, 255, 255, 0.1);\\n        }\\n    </style>\\n</head>\\n<body class="bg-gray-900 text-white">\\n    <div class="min-h-screen">\\n        <!-- Header -->\\n        <header class="gradient-bg p-6">\\n            <div class="container mx-auto">\\n                <h1 class="text-3xl font-bold">🚀 ${projectId}</h1>\\n                <p class="text-gray-200">AI-Generated Application</p>\\n            </div>\\n        </header>\\n        \\n        <!-- Main Content -->\\n        <main class="container mx-auto p-6">\\n            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\\n                <div class="glass rounded-lg p-6">\\n                    <h2 class="text-xl font-semibold mb-4">📊 Dashboard</h2>\\n                    <p>Real-time analytics and monitoring</p>\\n                </div>\\n                <div class="glass rounded-lg p-6">\\n                    <h2 class="text-xl font-semibold mb-4">🤖 AI Features</h2>\\n                    <p>Intelligent automation and assistance</p>\\n                </div>\\n                <div class="glass rounded-lg p-6">\\n                    <h2 class="text-xl font-semibold mb-4">⚡ Performance</h2>\\n                    <p>Optimized for speed and reliability</p>\\n                </div>\\n            </div>\\n        </main>\\n    </div>\\n</body>\\n</html>`,
        language: 'html',
        size: 1456,
        lastModified: new Date()
      }
    ];
    
    setFiles(mockFiles);
    if (mockFiles.length > 0) {
      setActiveFile(mockFiles[0]);
      setOpenTabs([mockFiles[0]]);
    }
    
    // Update stats
    setProjectStats({
      linesOfCode: mockFiles.reduce((acc, file) => acc + file.content.split('\\n').length, 0),
      filesCount: mockFiles.length,
      lastBuild: new Date(),
      errors: 0,
      warnings: 2
    });
  };

  const loadChatSessions = () => {
    const defaultSession = {
      id: 'default',
      title: '🤖 AI Assistant',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: `🚀 **Willkommen im Ultimate AI Builder!**

Ich bin dein intelligenter Auto-Coder Agent. Hier sind meine Fähigkeiten:

**🔥 Was ich kann:**
• 📁 **Dateien erstellen & bearbeiten** - Automatisch
• 🤖 **Code generieren** - Mit KI-Power
• 🔧 **Bugs fixen** - Sofort
• 🎨 **UI/UX designen** - Modern & responsive
• 📊 **Daten analysieren** - Smart insights
• 🚀 **Apps deployen** - One-click
• ⚙️ **Terminal-Befehle ausführen** - npm install, flutter pub get, etc.
• 📦 **Packages installieren** - Automatisch
• 🏗️ **Projekte bauen** - Build-Befehle ausführen
• 🧪 **Code testen** - Tests ausführen

**⚡ Quick Actions:**
• Sage "erstelle eine React App" → Ich erstelle eine komplette React-App
• Sage "fixe alle Fehler" → Ich finde und fixe alle Fehler
• Sage "optimiere den Code" → Ich optimiere den Code
• Sage "erstelle ein Dashboard" → Ich erstelle ein komplettes Dashboard
• Sage "installiere packages" → Ich installiere alle Dependencies
• Sage "starte den Server" → Ich starte den Development Server
• Sage "baue die App" → Ich baue die Anwendung

**🎯 Pro-Tip:** Ich arbeite vollautomatisch! Einfach beschreiben was du willst und ich mache es!`,
          timestamp: new Date(),
          model_used: currentModel,
          agent_type: currentAgent
        }
      ],
      model: currentModel,
      agent: currentAgent,
      created_at: new Date()
    };
    
    setChatSessions([defaultSession]);
    setChatMessages(defaultSession.messages);
  };

  const setupRealtimeUpdates = () => {
    // Check if we should start live build
    const urlParams = new URLSearchParams(window.location.search);
    const shouldLiveBuild = urlParams.get('live_build') === 'true';
    
    if (shouldLiveBuild) {
      startLiveBuild();
    }
    
    // Setup WebSocket for live updates (Smart Agent)
    const ws = new WebSocket('ws://localhost:8005/api/smart-agent/ws');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('✅ WebSocket verbunden für Live-Updates');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket geschlossen');
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          setupRealtimeUpdates();
        }
      }, 3000);
    };
    
    // Setup polling for file changes
    const interval = setInterval(() => {
      updateProjectStats();
    }, 5000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  };
  
  const startLiveBuild = async () => {
    try {
      // Load build parameters from localStorage
      const buildParams = localStorage.getItem(`build_${projectId}_params`);
      if (!buildParams) {
        console.warn('Keine Build-Parameter gefunden');
        return;
      }
      
      const params = JSON.parse(buildParams);
      setIsLiveBuilding(true);
      setBuildProgress({ current: 0, total: 0, currentFile: null });
      
      // Add welcome message to chat
      addChatMessage('assistant', `🚀 **Starte Smart Agent Generator für:** \`${params.project_name}\`
      
📦 **Framework:** ${params.project_type}
📝 **Beschreibung:** ${params.description.slice(0, 100)}${params.description.length > 100 ? '...' : ''}

⏱️ **Ich erstelle jetzt Schritt für Schritt alle Dateien...**
📁 Du siehst live, wie ich jede Datei erstelle und den Code schreibe!`);
      
      // 🔥 NEUER SMART AGENT: Nutze den neuen Smart Agent Generator
      const response = await fetch('http://localhost:8005/api/smart-agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          project_name: params.project_name,
          platform: params.project_type,
          description: params.description,
          features: params.features || []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Build failed: ${response.statusText}`);
      }
      
      // Response will come via WebSocket
      const result = await response.json();
      if (result.success) {
        addChatMessage('assistant', `✅ **Smart Agent gestartet!**
        
📊 Generiere jetzt ${result.total_files || 'viele'} Dateien Schritt für Schritt...
📁 Du siehst jede Datei live im Editor!`);
      }
    } catch (error) {
      console.error('Live build error:', error);
      setIsLiveBuilding(false);
      addChatMessage('assistant', `❌ **Fehler beim Starten des Smart Agent:**
      
\`\`\`
${error.message}
\`\`\`

Bitte versuche es erneut.`);
    }
  };
  
  // Start Live Build direkt aus dem Chat
  const startLiveBuildFromChat = async (projectName, framework, description) => {
    try {
      setIsLiveBuilding(true);
      setBuildProgress({ current: 0, total: 0, currentFile: null });
      
      // 🔥 KEINE DUMMY-TEXTE - Agent arbeitet ECHT!
      const response = await fetch('http://localhost:8005/api/smart-agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          project_name: projectName,
          platform: framework,
          description: description,
          features: []
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Build failed: ${response.statusText}`);
      }
      
      // Response kommt via WebSocket - ECHTE Updates, keine Dummy-Texte!
      await response.json();
    } catch (error) {
      console.error('Live build from chat error:', error);
      setIsLiveBuilding(false);
      // Nur bei Fehler: Echte Fehlermeldung
      addChatMessage('assistant', `❌ Fehler: ${error.message}`);
    }
  };
  
  const handleWebSocketMessage = (data) => {
    const { event } = data;
    
    switch (event) {
      case 'generation.started':
      case 'build.started':
        setIsLiveBuilding(true);
        setBuildProgress({ current: 0, total: 0, currentFile: null });
        // KEINE DUMMY-NACHRICHT - Agent arbeitet ECHT, Updates kommen via WebSocket!
        break;
      
      case 'generation.step':
        // Smart Agent Schritt-Update - NUR wenn echte Nachricht vorhanden
        if (data.message && data.message.trim() && !data.message.includes('🔄 Arbeite')) {
          addChatMessage('assistant', data.message);
        }
        break;
      
      case 'generation.progress':
        // Progress update
        setBuildProgress({
          current: data.current || 0,
          total: data.total || 0,
          currentFile: data.file || null
        });
        break;
        
      case 'file.announced':
        // ⚡ Datei wird angekündigt - zeige im Chat!
        const announcedFile = {
          name: data.path.split('/').pop() || data.path,
          path: data.path,
          content: '',  // Start with empty content
          language: data.path.split('.').pop() || 'text',
          size: 0,
          lastModified: new Date(),
          gitStatus: 'U',
          untracked: true
        };
        
        // ⚡ ZEIGE IM CHAT: "Ich erstelle jetzt: lib/main.dart"
        addChatMessage('assistant', data.message || `📝 **Erstelle jetzt:** \`${data.path}\``);
        
        // Add to files list immediately (empty)
        setFiles(prev => {
          const exists = prev.some(f => f.path === announcedFile.path);
          if (exists) {
            return prev.map(f => f.path === announcedFile.path ? announcedFile : f);
          }
          return [...prev, announcedFile];
        });
        
        // Open in editor immediately
        setOpenTabs(prev => {
          const exists = prev.find(t => t.path === announcedFile.path);
          if (!exists) {
            return [...prev, announcedFile];
          }
          return prev;
        });
        
        // ⚡ WICHTIG: ÖFFNE DATEI AUTOMATISCH IM EDITOR!
        // Damit der Code live geschrieben werden kann!
        setActiveFile(announcedFile);
        break;
      
      case 'code_section':
        // ⚡ Zeige Code-Sektionen (Imports, Struktur) im Chat mit Erklärung
        if (data.message) {
          addChatMessage('assistant', data.message);
        }
        break;
      
      case 'code_explanation':
        // ⚡ Zeige Code-Erklärungen während des Schreibens
        if (data.message) {
          addChatMessage('assistant', data.message);
        }
        break;
      
      case 'code.character_written':
      case 'code_character_written':
      case 'code_written':
        // ⚡ LIVE TYPING: Update file content ZEILE FÜR ZEILE in REAL TIME!
        // ⚡ PERFORMANCE: Optimiert mit Throttling/Debouncing
        const newContent = data.content || data.data?.content || '';
        const filePath = data.path || data.data?.path;
        
        if (!filePath) break;
        
        // ⚡ WICHTIG: ÖFFNE DATEI IM EDITOR wenn sie noch nicht aktiv ist! (Nur einmal!)
        if (!activeFile || activeFile.path !== filePath) {
          const fileToOpen = files.find(f => f.path === filePath) || {
            name: filePath.split('/').pop() || filePath,
            path: filePath,
            content: newContent,
            language: filePath.split('.').pop() || 'text',
            size: newContent.length,
            lastModified: new Date(),
            gitStatus: 'U',
            untracked: true
          };
          setActiveFile(fileToOpen);
          setOpenTabs(prev => {
            const exists = prev.find(t => t.path === filePath);
            if (!exists) {
              return [...prev, fileToOpen];
            }
            return prev;
          });
        }
        
        // ⚡ PERFORMANCE: Batch State Updates - Update files, activeFile, tabs zusammen
        const fileUpdate = {
          name: filePath.split('/').pop() || filePath,
          path: filePath,
          content: newContent,
          language: filePath.split('.').pop() || 'text',
          size: newContent.length,
          lastModified: new Date(),
          gitStatus: 'U',
          untracked: true
        };
        
        // Batch update: files, activeFile, tabs in einem React Batch
        startTransition(() => {
          setFiles(prev => prev.map(f => f.path === filePath ? fileUpdate : f));
          setActiveFile(prev => prev?.path === filePath ? fileUpdate : prev);
          setOpenTabs(prev => prev.map(t => t.path === filePath ? fileUpdate : t));
        });
        
        // ⚡ PERFORMANCE: Monaco Editor Updates DEBOUNCED (nur alle 200ms)
        const now = Date.now();
        if (now - lastEditorUpdateRef.current > 200) {
          lastEditorUpdateRef.current = now;
          
          // Clear previous timeout
          if (editorUpdateTimeoutRef.current) {
            clearTimeout(editorUpdateTimeoutRef.current);
          }
          
          // Debounce: Warte 100ms, dann update
          editorUpdateTimeoutRef.current = setTimeout(() => {
            if (editorRef.current) {
              try {
                const lineNum = data.line || newContent.split('\n').length;
                const column = data.line_content ? data.line_content.length + 1 : 1;
                
                // ⚡ PERFORMANCE: Nur setValue wenn sich Content geändert hat
                const currentValue = editorRef.current.getValue();
                if (currentValue !== newContent) {
                  editorRef.current.setValue(newContent);
                }
                
                // Position nur alle 500ms updaten (weniger häufig)
                if (now - lastEditorUpdateRef.current > 500 || !data.line) {
                  editorRef.current.setPosition({ lineNumber: lineNum, column: column });
                  editorRef.current.revealLineInCenter(lineNum);
                }
              } catch (err) {
                console.log('Editor update error:', err);
              }
            }
          }, 100);
        } else {
          // Queue für späteres Update
          editorUpdateQueueRef.current = { content: newContent, data };
        }
        
        // ⚡ PERFORMANCE: Chat Updates THROTTLED (nur alle 500ms)
        if (data.line && data.line_content) {
          const lineNum = data.line;
          const lineContent = data.line_content;
          const totalLines = data.total_lines || 0;
          
          // Zeige jede 10. Zeile oder wichtige Zeilen (weniger häufig!)
          const isImportantLine = /(class|function|def|void|Widget|const|final|import|from)\s+/.test(lineContent);
          
          if ((lineNum % 10 === 0 || isImportantLine || lineNum === totalLines) && 
              (now - lastChatUpdateRef.current > 500)) {
            lastChatUpdateRef.current = now;
            
            // Clear previous timeout
            if (chatUpdateTimeoutRef.current) {
              clearTimeout(chatUpdateTimeoutRef.current);
            }
            
            // Debounce Chat Update
            chatUpdateTimeoutRef.current = setTimeout(() => {
              const allLines = newContent.split('\n');
              const startLine = Math.max(0, lineNum - 3);
              const contextLines = allLines.slice(startLine, lineNum);
              const contextText = contextLines.join('\n');
              
              // ⚡ PERFORMANCE: Batch Chat Update mit startTransition
              startTransition(() => {
                setChatMessages(prev => {
                  const existingMsgIndex = prev.findIndex(msg => 
                    msg.role === 'assistant' && msg.path === filePath && msg.isCodeUpdate
                  );
                  
                  if (existingMsgIndex >= 0) {
                    // Update bestehende Nachricht
                    return prev.map((msg, idx) => 
                      idx === existingMsgIndex
                        ? { 
                            ...msg, 
                            content: `📝 **Schreibe:** \`${filePath}\` (Zeile ${lineNum}/${totalLines})\n\n\`\`\`${data.language || 'text'}\n${contextText}\n\`\`\``,
                            line: lineNum
                          }
                        : msg
                    );
                  } else {
                    // Neue Nachricht
                    return [...prev, {
                      role: 'assistant',
                      content: `📝 **Schreibe:** \`${filePath}\` (Zeile ${lineNum}/${totalLines})\n\n\`\`\`${data.language || 'text'}\n${contextText}\n\`\`\``,
                      timestamp: new Date().toISOString(),
                      path: filePath,
                      line: lineNum,
                      isCodeUpdate: true
                    }];
                  }
                });
              });
            }, 200);
          }
        }
        break;
      
      case 'editor.content_updated':
      case 'editor_content_updated':
        // Editor content updated - sync with file
        setFiles(prev => prev.map(f => {
          if (f.path === data.path) {
            return {
              ...f,
              content: data.content,
              size: data.length || data.content.length
            };
          }
          return f;
        }));
        
        if (activeFile?.path === data.path) {
          setActiveFile(prev => ({
            ...prev,
            content: data.content,
            size: data.length || data.content.length
          }));
        }
        
        setOpenTabs(prev => prev.map(t => {
          if (t.path === data.path) {
            return {
              ...t,
              content: data.content,
              size: data.length || data.content.length
            };
          }
          return t;
        }));
        break;
      
      case 'file.created':
        // File creation complete
        const newFile = {
          name: data.path.split('/').pop() || data.path,
          path: data.path,
          content: data.content || '',
          language: data.path.split('.').pop() || 'text',
          size: data.size || (data.content || '').length,
          lastModified: new Date(),
          gitStatus: 'U',
          untracked: true
        };
        
        console.log(`✅ File created: ${data.path} (${newFile.size} bytes)`);
        
        setFiles(prev => {
          const exists = prev.some(f => f.path === newFile.path);
          if (exists) {
            return prev.map(f => f.path === newFile.path ? newFile : f);
          }
          return [...prev, newFile];
        });
        
        // Update preview if it's an HTML file
        if (data.path.endsWith('.html') || data.path.endsWith('.htm')) {
          setTimeout(() => {
            detectProjectTypeAndStartPreview();
          }, 500);
        }
        break;
        
      case 'generation.finished':
      case 'build.finished':
        setIsLiveBuilding(false);
        setBuildProgress({ current: data.total_files || 0, total: data.total_files || 0, currentFile: null });
        addChatMessage('assistant', `✅ **Smart Agent abgeschlossen!**
        
📁 **${data.total_files || 0} Dateien** erfolgreich erstellt!

🚀 **Die App ist jetzt lauffähig!**
📱 Sieh dir die Live-Preview rechts an!

💬 **Du kannst jetzt mit mir im Chat sprechen**, um Änderungen zu wünschen oder Fragen zu stellen.`);
        
        // Auto-start preview and open browser tab
        setTimeout(() => {
          detectProjectTypeAndStartPreview();
          
          // Auto-open browser tab when preview URL is available
          setTimeout(() => {
            if (previewUrl) {
              const tabId = `browser-${Date.now()}`;
              const newTab = {
                id: tabId,
                url: previewUrl,
                title: previewUrl.includes('://') ? new URL(previewUrl).hostname : previewUrl,
                command: 'Smart Agent'
              };
              setBrowserTabs(prev => {
                const existing = prev.find(t => t.url === previewUrl);
                if (existing) {
                  setActiveBrowserTab(existing.id);
                  return prev;
                }
                return [...prev, newTab];
              });
              setActiveBrowserTab(tabId);
              setActiveFile(null);
            }
          }, 2000);
        }, 1000);
        break;
      
      case 'generation.error':
        setIsLiveBuilding(false);
        addChatMessage('assistant', `❌ **Fehler beim Generieren:**\n\n\`\`\`\n${data.error || 'Unbekannter Fehler'}\n\`\`\`\n\nBitte versuche es erneut.`);
        break;
      
      // ⚡ AUTONOMER MODUS - Fehlende Komponenten
      case 'missing_components_detected':
        addChatMessage('assistant', `🔍 **${data.count} fehlende Komponenten erkannt!**\n\nIch generiere sie automatisch...`);
        break;
      
      case 'generating_missing_components':
        addChatMessage('assistant', `⚙️ **Generiere ${data.count} fehlende Komponenten...**`);
        break;
      
      // ⚡ FEHLERANALYSE & AUTO-FIX
      case 'errors_detected':
        addChatMessage('assistant', `🔍 **${data.count} Fehler erkannt!**\n\nIch fixe sie automatisch...`);
        break;
      
      case 'error_detected':
        if (data.auto_fixable) {
          addChatMessage('assistant', `🔧 **Fehler erkannt:** \`${data.file || 'Unbekannt'}\` (Zeile ${data.line || '?'})\n\n\`\`\`\n${data.error}\n\`\`\`\n\n⚙️ Fixe automatisch...`);
        } else {
          addChatMessage('assistant', `⚠️ **Fehler:** \`${data.file || 'Unbekannt'}\`\n\n\`\`\`\n${data.error}\n\`\`\``);
        }
        break;
      
      case 'error_fix_started':
        addChatMessage('assistant', `🔧 **Fixe Fehler in:** \`${data.path}\`\n\nFehler: ${data.error.message || data.error}`);
        break;
      
      case 'error_fixed':
        addChatMessage('assistant', `✅ **Fehler behoben!** \`${data.path}\`\n\nFix: ${data.fix || 'Automatisch behoben'}`);
        break;
      
      // ⚡ DEPENDENCIES & BUILD
      case 'installing_dependencies':
        addChatMessage('assistant', `📦 **Installiere Dependencies...**\n\n${data.message || ''}`);
        break;
      
      case 'dependencies_installed':
        addChatMessage('assistant', `✅ **Dependencies installiert!**\n\n${data.message || ''}`);
        break;
      
      case 'building_project':
        addChatMessage('assistant', `🏗️ **Baue Projekt...**\n\n${data.message || ''}`);
        break;
      
      case 'build_success':
        addChatMessage('assistant', `✅ **Build erfolgreich!**\n\n${data.message || ''}`);
        break;
      
      case 'build_failed':
        addChatMessage('assistant', `❌ **Build fehlgeschlagen**\n\nAnalysiere Fehler...`);
        // Fehler werden automatisch analysiert und gefixt
        break;
      
      // ⚡ PREVIEW
      case 'starting_preview':
        addChatMessage('assistant', `🚀 **Starte Preview...**\n\n${data.message || ''}`);
        break;
      
      case 'preview_started':
        addChatMessage('assistant', `✅ **Preview gestartet!**\n\nURL: ${data.url || 'N/A'}`);
        if (data.url) {
          setPreviewUrl(data.url);
          setPreviewStatus('running');
        }
        break;
      
      // ⚡ GIT
      case 'git_auto_commit':
        addChatMessage('assistant', `📝 **Erstelle Git Commit...**\n\n${data.message || ''}`);
        break;
      
      case 'git_committed':
        addChatMessage('assistant', `✅ **Git Commit erstellt!**\n\nHash: \`${data.commit_hash || 'N/A'}\`\n\n${data.message || ''}`);
        break;
        
      case 'connected':
        console.log('WebSocket connected:', data.message);
        break;
        
      default:
        console.log('Unknown WebSocket event:', event, data);
    }
  };

  const updateProjectStats = () => {
    if (files.length > 0) {
      setProjectStats(prev => ({
        ...prev,
        linesOfCode: files.reduce((acc, file) => acc + (file.content?.split('\\n').length || 0), 0),
        filesCount: files.length,
        lastBuild: new Date()
      }));
    }
  };

  // Detect project type and start preview server
  const detectProjectTypeAndStartPreview = async () => {
    if (files.length === 0) return;
    
    // Check for Flutter project
    const hasPubspec = files.some(f => f.name === 'pubspec.yaml' || f.path?.includes('pubspec.yaml'));
    const hasDartFiles = files.some(f => f.name.endsWith('.dart') || f.path?.endsWith('.dart'));
    
    // Check for React/Next.js project
    const hasPackageJson = files.some(f => f.name === 'package.json' || f.path?.includes('package.json'));
    const hasReactFiles = files.some(f => 
      f.name.endsWith('.jsx') || f.name.endsWith('.tsx') || 
      f.path?.endsWith('.jsx') || f.path?.endsWith('.tsx')
    );
    
    // Check for HTML project
    const hasHTML = files.some(f => f.name.endsWith('.html') || f.path?.endsWith('.html'));
    
    let projectType = null;
    if (hasPubspec || hasDartFiles) {
      projectType = 'flutter';
    } else if (hasPackageJson || hasReactFiles) {
      projectType = 'web';
    } else if (hasHTML) {
      projectType = 'html';
    }
    
    if (projectType && projectType !== 'html') {
      // Start preview server for Flutter or React
      await startPreviewServer(projectType);
    } else {
      // For HTML projects, we'll use srcDoc (no server needed)
      setPreviewType('html');
      setPreviewStatus('running');
    }
  };

  // Start preview server
  const startPreviewServer = async (type) => {
    try {
      setPreviewStatus('starting');
      setPreviewError(null);
      
      // Sende auch die Dateien, damit sie auf dem Server gespeichert werden
      const response = await fetch('http://localhost:8005/api/preview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          type: type,
          files: files.map(f => ({
            path: f.path || f.name,
            content: f.content || ''
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        setPreviewUrl(data.url);
        setPreviewType(data.type);
        
        // Warte bis Server wirklich bereit ist (Backend wartet bereits, aber doppelt hält besser)
        await waitForServerReady(data.url);
        
        setPreviewStatus('running');
      } else {
        throw new Error('Failed to start preview server');
      }
    } catch (error) {
      console.error('❌ Preview server error:', error);
      setPreviewStatus('error');
      setPreviewError(error.message);
      // Fallback to HTML preview if server fails
      setPreviewType('html');
    }
  };

  // Wait for server to be ready
  const waitForServerReady = async (url, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors' // CORS umgehen für Health-Check
        });
        // Wenn keine Exception, ist Server bereit
        setPreviewStatus('running');
        return true;
      } catch (error) {
        // Server noch nicht bereit, warte 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    // Timeout - aber versuche trotzdem zu laden
    console.warn('⚠️ Server readiness timeout, but trying to load anyway');
    setPreviewStatus('running');
    return false;
  };

  // Check preview server status
  const checkPreviewStatus = async () => {
    try {
      const response = await fetch('http://localhost:8005/api/preview/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.active && data.url) {
          setPreviewUrl(data.url);
          setPreviewStatus('running');
        } else {
          setPreviewStatus('stopped');
        }
      }
    } catch (error) {
      console.error('Preview status check error:', error);
    }
  };

  // Stop preview server
  const stopPreviewServer = async () => {
    try {
      await fetch('http://localhost:8005/api/preview/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setPreviewUrl(null);
      setPreviewStatus('stopped');
    } catch (error) {
      console.error('Error stopping preview:', error);
    }
  };

  // Execute terminal command
  const executeTerminalCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:8005/api/terminal/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          command: command.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Terminal command executed: ${command}`);
        console.log(`Output: ${data.output}`);
        return data;
      } else {
        const error = await response.json();
        console.error(`❌ Terminal command failed: ${error.detail || 'Unknown error'}`);
        return { success: false, output: error.detail || 'Command failed' };
      }
    } catch (error) {
      console.error('❌ Terminal execution error:', error);
      return { success: false, output: error.message };
    }
  };

  // Parse terminal commands from AI response and ASK FOR APPROVAL (like Cursor)
  const parseAndShowTerminalCommands = (responseContent) => {
    try {
      // Multiple patterns to catch different command formats
      const patterns = [
        /TERMINAL:\s*(.+?)(?=\n|$)/gi,  // TERMINAL: command
        /⚙️\s*Führe\s+(?:Befehl\s+)?aus:\s*(.+?)(?=\n|$)/gi,  // ⚙️ Führe Befehl aus: command
        /⚙️\s*Führe\s+aus:\s*(.+?)(?=\n|$)/gi,  // ⚙️ Führe aus: command
        /```bash\s*\n(.+?)\n```/gi,  // ```bash\ncommand\n```
        /```\s*\n\$?\s*(npm|flutter|python|pip|cd|ls|cat|echo|git|yarn|pnpm)\s+(.+?)(?=\n|```)/gi,  // Code blocks with commands
      ];
      
      const commands = [];
      
      for (const pattern of patterns) {
        const matches = [...responseContent.matchAll(pattern)];
        for (const match of matches) {
          let command = match[1]?.trim() || match[2]?.trim();
          if (command && !command.includes('TERMINAL:') && !command.includes('Führe')) {
            // Clean up command
            command = command.replace(/^\$?\s*/, '').trim();
            if (command && !commands.includes(command)) {
              commands.push(command);
            }
          }
        }
      }
      
      if (commands.length === 0) {
        return null; // No terminal commands found
      }

      console.log(`🔧 Found ${commands.length} terminal command(s) in AI response:`, commands);
      return commands;
    } catch (error) {
      console.error('❌ Error parsing terminal commands:', error);
      return null;
    }
  };

  // Execute terminal command after user approval
  const executeApprovedCommand = async (command) => {
    console.log(`🔧 Executing approved terminal command: ${command}`);
    
    // ⚡ WICHTIG: Öffne Terminal-Panel automatisch, damit User sieht was passiert
    setShowBottomPanel(true);
    setActiveBottomPanel('terminal');
    
    // Update approval message to show "Running..."
    setChatMessages(prev => prev.map(msg => 
      msg.needsApproval && msg.command === command
        ? { ...msg, content: `⚙️ **Running command in terminal...**\n\n\`\`\`bash\n$ ${command}\n\`\`\``, isRunning: true }
        : msg
    ));
    
    // ⚡ WICHTIG: Führe Befehl ZUERST im Terminal aus (sichtbar für User!)
    // Warte kurz, damit Terminal-Panel geöffnet ist
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ⚡ Führe Befehl im Terminal aus (sichtbar!)
    let commandExecuted = false;
    if (terminalRef.current && typeof terminalRef.current.executeCommand === 'function') {
      console.log(`✅ Terminal ref gefunden, führe Befehl aus: ${command}`);
      try {
        // ⚡ WICHTIG: Warte auf Ausführung (async!)
        await terminalRef.current.executeCommand(command);
        commandExecuted = true;
        console.log(`✅ Befehl im Terminal erfolgreich ausgeführt: ${command}`);
      } catch (error) {
        console.error(`❌ Fehler beim Ausführen im Terminal:`, error);
        commandExecuted = false;
      }
    } else {
      console.warn(`⚠️ Terminal ref nicht verfügbar (ref:`, terminalRef.current, `), verwende API-Call`);
      commandExecuted = false;
    }
    
    // ⚡ Fallback: Wenn Terminal-Ref nicht funktioniert, verwende API-Call
    if (!commandExecuted) {
      console.log(`🔄 Fallback: Führe Befehl über API aus: ${command}`);
      const result = await executeTerminalCommand(command);
      
      // Update approval message with result
      setChatMessages(prev => prev.map(msg => 
        msg.needsApproval && msg.command === command
          ? {
              ...msg,
              needsApproval: false,
              isRunning: false,
              content: result.success 
                ? `✅ **Terminal command executed**\n\n\`\`\`bash\n$ ${command}\n${result.output}\n\`\`\``
                : `❌ **Terminal command failed**\n\n\`\`\`bash\n$ ${command}\n${result.output}\n\`\`\``
            }
          : msg
      ));
      
      // Also add result to chat as separate message
      const terminalMsg = {
        role: 'assistant',
        content: result.success 
          ? `✅ Terminal command executed:\n\`\`\`bash\n$ ${command}\n${result.output}\n\`\`\``
          : `❌ Terminal command failed:\n\`\`\`bash\n$ ${command}\n${result.output}\n\`\`\``,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, terminalMsg]);
      return;
    }
    
    // ⚡ Update approval message nach Terminal-Ausführung (wenn Terminal-Ref funktioniert hat)
    setTimeout(() => {
      setChatMessages(prev => prev.map(msg => 
        msg.needsApproval && msg.command === command
          ? {
              ...msg,
              needsApproval: false,
              isRunning: false,
              content: `✅ **Terminal command executed**\n\n\`\`\`bash\n$ ${command}\n\`\`\`\n\n📺 **Sieh dir das Terminal-Panel unten an für die Ausgabe!**`
            }
          : msg
      ));
    }, 500);
  };

  // Parse code blocks from AI response and apply to files
  const parseAndApplyCodeChanges = async (responseContent) => {
    try {
      // Pattern: ```language path/to/file
      const codeBlockPattern = /```(\w+)?\s*(.+?)\n([\s\S]*?)```/g;
      const matches = [...responseContent.matchAll(codeBlockPattern)];
      
      if (matches.length === 0) {
        return; // No code blocks found
      }

      console.log(`📝 Found ${matches.length} code block(s) in AI response`);

      for (const match of matches) {
        const language = match[1] || 'text';
        const filePath = match[2]?.trim();
        const codeContent = match[3]?.trim();

        if (!filePath || !codeContent) {
          continue;
        }

        // Clean file path (remove quotes, extra spaces)
        const cleanPath = filePath.replace(/^["']|["']$/g, '').trim();
        
        // Skip if path looks invalid
        if (cleanPath.length < 1 || cleanPath.includes('```')) {
          continue;
        }

        console.log(`📝 LIVE: Applying code to: ${cleanPath}`);

        // Find existing file or create new one
        let targetFile = files.find(f => 
          f.path === cleanPath || 
          f.path?.endsWith(cleanPath) ||
          f.name === cleanPath.split('/').pop()
        );

        if (targetFile) {
          // Update existing file - LIVE in editor!
          const updatedFile = { ...targetFile, content: codeContent };
          
          // Update state immediately so user sees it in editor
          setFiles(prev => prev.map(f => 
            f.path === targetFile.path ? updatedFile : f
          ));
          
          // Update agent activity
          setAgentActivity(prev => ({
            ...prev,
            filesModified: prev.filesModified + 1
          }));
          
          // If this file is currently open, update it live
          if (activeFile?.path === targetFile.path) {
            setActiveFile(updatedFile);
          }
          
          setOpenTabs(prev => prev.map(tab =>
            tab.path === targetFile.path ? updatedFile : tab
          ));
          
          // Save file (async, don't wait)
          saveFile(updatedFile).catch(err => console.error('Save error:', err));
          console.log(`✅ LIVE: Updated file: ${cleanPath}`);
        } else {
          // Create new file - LIVE in editor!
          const newFile = {
            name: cleanPath.split('/').pop() || 'new_file',
            path: cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`,
            content: codeContent,
            language: language || getLanguage(cleanPath),
            size: codeContent.length,
            lastModified: new Date(),
            gitStatus: 'U',
            untracked: true
          };
          
          // Add file immediately so user sees it in file tree and editor
          setFiles(prev => {
            // Check if file already exists
            const exists = prev.some(f => f.path === newFile.path);
            if (exists) {
              return prev.map(f => f.path === newFile.path ? newFile : f);
            }
            return [...prev, newFile];
          });
          
          // Auto-open first file in editor, or add to tabs
          if (files.length === 0) {
            // First file - open it immediately
            setActiveFile(newFile);
            setOpenTabs([newFile]);
          } else if (!activeFile) {
            // No file open - open this one
            setActiveFile(newFile);
            if (!openTabs.find(tab => tab.path === newFile.path)) {
              setOpenTabs(prev => [...prev, newFile]);
            }
          } else {
            // File already open - just add to tabs
            if (!openTabs.find(tab => tab.path === newFile.path)) {
              setOpenTabs(prev => [...prev, newFile]);
            }
            // Switch to new file if it's a main file (main.dart, index.html, etc.)
            const isMainFile = newFile.name.match(/^(main|index|app)\.(dart|js|jsx|ts|tsx|html)$/i);
            if (isMainFile) {
              setActiveFile(newFile);
            }
          }
          
          // Save file (async, don't wait)
          saveFile(newFile).catch(err => console.error('Save error:', err));
          console.log(`✅ LIVE: Created new file: ${cleanPath}`);
        }
      }
    } catch (error) {
      console.error('❌ Error parsing/applying code changes:', error);
    }
  };

  const openFile = (file) => {
    setActiveFile(file);
    if (!openTabs.find(tab => tab.path === file.path)) {
      setOpenTabs(prev => [...prev, file]);
    }
  };

  const closeTab = (file) => {
    console.log(`🔴 Closing tab: ${file.path}`);
    console.log(`📊 Current tabs:`, openTabs.map(t => t.path));
    
    const newTabs = openTabs.filter(tab => tab.path !== file.path);
    console.log(`📊 New tabs after close:`, newTabs.map(t => t.path));
    
    setOpenTabs(newTabs);
    
    // ⚡ WICHTIG: Wenn geschlossene Datei aktiv war, öffne nächste oder null
    if (activeFile?.path === file.path) {
      if (newTabs.length > 0) {
        // Öffne letzte Datei (wie VS Code)
        setActiveFile(newTabs[newTabs.length - 1]);
        console.log(`✅ Activated next tab: ${newTabs[newTabs.length - 1].path}`);
      } else {
        // Keine Tabs mehr offen
        setActiveFile(null);
        console.log(`✅ No tabs left, activeFile set to null`);
      }
    }
  };

  const handleEditorChange = (value) => {
    if (activeFile) {
      const updatedFile = { ...activeFile, content: value };
      setActiveFile(updatedFile);
      
      setFiles(prev => prev.map(file => 
        file.path === activeFile.path ? updatedFile : file
      ));
      
      setOpenTabs(prev => prev.map(tab =>
        tab.path === activeFile.path ? updatedFile : tab
      ));
      
      // Live Preview Update - Real-time
      if (typeof window !== 'undefined' && activeRightPanel === 'preview') {
        import('./utils/editor-bridge.js').then(module => {
          const language = getLanguage(activeFile.name);
          if (module.updatePreviewDebounced) {
            module.updatePreviewDebounced(value, language);
          }
        }).catch(err => {
          console.log('Editor bridge not available:', err);
        });
      }
      
      // Auto-save after 2 seconds of inactivity
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        saveFile(updatedFile);
      }, 2000);
    }
  };

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'dart': 'dart',
      'js': 'javascript',
      'jsx': 'javascript', 
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'json': 'json',
      'py': 'python'
    };
    return languageMap[ext] || 'text';
  };

  const onFindIssues = async () => {
    // Find issues in all project files
    console.log('🔍 Finding issues in project...');
    
    try {
      setIsChatLoading(true);
      
      // Analyze all files for issues
      const allIssues = [];
      for (const file of files) {
        if (!file.path || file.path.includes('node_modules') || file.path.includes('.git')) {
          continue;
        }
        
        try {
          const response = await fetch('http://localhost:8005/api/builder/detect-issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              file_path: file.path,
              content: file.content
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.issues && data.issues.length > 0) {
              allIssues.push({
                file: file.path,
                issues: data.issues
              });
            }
          }
        } catch (e) {
          console.error(`Error analyzing ${file.path}:`, e);
        }
      }
      
      // Use error_detector as fallback
      if (allIssues.length === 0) {
        // Try using error_detector directly via chat
        const issuePrompt = `Analysiere alle Dateien im Projekt auf Fehler:
        
Projekt-Dateien:
${files.map(f => `\n### ${f.path}\n\`\`\`\n${f.content.substring(0, 1000)}\n\`\`\``).join('\n')}

Finde:
- Syntax-Fehler
- Import-Fehler
- Unused Variables
- Type Errors
- Logic Errors
- Performance Issues

Liste alle gefundenen Issues mit Datei, Zeile und Beschreibung auf.`;

        // Send to chat for analysis
        setChatInput(issuePrompt);
        await sendChatMessage();
      } else {
        // Display issues in chat
        const issuesText = allIssues.map(({ file, issues }) => 
          `**${file}**:\n${issues.map(i => `- ${i.type}: ${i.message}${i.line ? ` (Line ${i.line})` : ''}`).join('\n')}`
        ).join('\n\n');
        
        const issuesMsg = {
          role: 'assistant',
          content: `🔍 **Gefundene Issues:**\n\n${issuesText}`,
          timestamp: new Date().toISOString(),
          model: currentModel
        };
        
        setChatMessages(prev => [...prev, issuesMsg]);
      }
      
      setIsChatLoading(false);
    } catch (error) {
      console.error('Error finding issues:', error);
      setIsChatLoading(false);
      alert('Fehler beim Finden von Issues: ' + error.message);
    }
  };

  const handleCommit = async () => {
    // Commit changes to Git - like Cursor
    try {
      // Get all modified files
      const modifiedFiles = files.filter(f => f.gitStatus === 'M' || f.modified);
      
      if (modifiedFiles.length === 0) {
        alert('No changes to commit');
        return;
      }
      
      // Save all modified files first
      for (const file of modifiedFiles) {
        await saveFile(file);
      }
      
      // Commit via API
      const response = await fetch(`http://localhost:8005/api/git/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          message: `Update: ${modifiedFiles.length} files changed`
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Changes committed:', data);
        
        // Refresh file tree to update Git status
        await initializeProject();
        
        // Show success message
        alert(`✅ Successfully committed ${modifiedFiles.length} files`);
      } else {
        const error = await response.json().catch(() => ({ detail: 'Commit failed' }));
        alert(`❌ Commit failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Commit error:', error);
      alert(`❌ Commit error: ${error.message}`);
    }
  };

  const handleCommand = (commandId) => {
    setShowCommandPalette(false);
    
    switch (commandId) {
      case 'new-file':
        // Create new file
        const newFile = {
          name: 'untitled',
          path: `/untitled-${Date.now()}`,
          content: '',
          language: 'text',
          size: 0,
          lastModified: new Date()
        };
        setFiles(prev => [...prev, newFile]);
        setActiveFile(newFile);
        setOpenTabs(prev => [...prev, newFile]);
        break;
      case 'save':
        if (activeFile) saveFile(activeFile);
        break;
      case 'format':
        // Format document (handled by Monaco)
        break;
      case 'terminal':
        setShowBottomPanel(!showBottomPanel);
        break;
      case 'git-status':
        setActiveLeftPanel('git');
        break;
      case 'git-commit':
        handleCommit();
        break;
      case 'package-install':
        setActiveLeftPanel('packages');
        break;
      case 'settings':
        // Open settings
        break;
      case 'ai-chat':
        setActiveRightPanel('chat');
        break;
      default:
        break;
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'dart': '🎯',
      'js': '🟨',
      'jsx': '⚛️',
      'ts': '🔷', 
      'tsx': '⚛️',
      'html': '🌐',
      'css': '🎨',
      'md': '📝',
      'json': '📄',
      'py': '🐍'
    };
    return iconMap[ext] || '📄';
  };

  const saveFile = async (file) => {
    if (!file) return;
    
    try {
      const response = await fetch(`http://localhost:8005/api/builder/update-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          file_path: file.path,
          content: file.content
        })
      });
      
      if (response.ok) {
        console.log('✅ File saved:', file.path);
        updateProjectStats();
      } else {
        // Try auto-fix if save fails
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errors && errorData.errors.length > 0) {
          // Auto-fix errors
          try {
            const fixResponse = await fetch('http://localhost:8005/api/builder/auto-fix', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_id: projectId,
                file_path: file.path,
                content: file.content,
                errors: errorData.errors
              })
            });
            
            if (fixResponse.ok) {
              const fixData = await fixResponse.json();
              if (fixData.fixed && fixData.content) {
                // Update file with fixed content
                const fixedFile = { ...file, content: fixData.content };
                setActiveFile(fixedFile);
                setFiles(prev => prev.map(f => 
                  f.path === file.path ? fixedFile : f
                ));
                setOpenTabs(prev => prev.map(tab =>
                  tab.path === file.path ? fixedFile : tab
                ));
                console.log('✅ Auto-fixed:', file.path);
                
                // Save fixed file
                await saveFile(fixedFile);
              }
            }
          } catch (fixError) {
            console.error('Auto-fix error:', fixError);
          }
        }
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const addChatMessage = (role, content) => {
    const message = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, message]);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMsg]);
    const prompt = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      console.log('📤 Sending chat message:', prompt);
      console.log('📤 Using model:', currentModel);
      console.log('📤 Using agent:', currentAgent);
      
      // 🔥 TEAM MODE: Multi-Agent Collaboration
      if (teamMode && teamAgents.length > 0) {
        console.log('👥 Team Mode aktiviert:', teamAgents, teamModeType);
        
        // Team Collaboration API
        const teamResponse = await fetch('http://localhost:8005/api/team/collaborate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            agents: teamAgents,
            mode: teamModeType,
            project_id: projectId
          })
        });

        if (!teamResponse.ok) {
          throw new Error(`Team collaboration failed: ${teamResponse.statusText}`);
        }

        const teamResult = await teamResponse.json();
        
        // Zeige Team-Ergebnisse im Chat
        let teamContent = `👥 **Team Collaboration** (${teamModeType} mode)\n\n`;
        teamContent += `**Agenten:** ${teamAgents.map(a => AGENT_TYPES[a]?.name || a).join(', ')}\n\n`;
        
        // Zeige Antworten von jedem Agenten
        for (const [agentKey, result] of Object.entries(teamResult.results || {})) {
          if (result.success) {
            const agentName = AGENT_TYPES[agentKey]?.name || agentKey;
            teamContent += `### ${AGENT_TYPES[agentKey]?.emoji || '🤖'} ${agentName}\n\n`;
            teamContent += `${result.response || result.content || 'Keine Antwort'}\n\n`;
            
            // Füge Agent-Nachricht zum Chat hinzu
            setChatMessages(prev => [...prev, {
              role: 'assistant',
              content: `${AGENT_TYPES[agentKey]?.emoji || '🤖'} **${agentName}:**\n\n${result.response || result.content || 'Keine Antwort'}`,
              timestamp: new Date().toISOString(),
              agent: agentKey,
              isTeamMessage: true
            }]);
          }
        }
        
        // Zusammenfassung
        if (teamResult.summary) {
          teamContent += `\n**Zusammenfassung:**\n${teamResult.summary}`;
        }
        
        setIsChatLoading(false);
        return;
      }
      
      // 🔥 INTELLIGENTE ERKENNUNG: Ist das eine App-Erstellungs-Anfrage?
      const lowerPrompt = prompt.toLowerCase();
      const isAppCreationRequest = (
        (lowerPrompt.includes('erstelle') || lowerPrompt.includes('erstell') || 
         lowerPrompt.includes('bau') || lowerPrompt.includes('generiere') ||
         lowerPrompt.includes('mach') || lowerPrompt.includes('create') ||
         lowerPrompt.includes('build')) &&
        (lowerPrompt.includes('app') || lowerPrompt.includes('projekt') || 
         lowerPrompt.includes('anwendung') || lowerPrompt.includes('flutter') ||
         lowerPrompt.includes('react') || lowerPrompt.includes('nextjs'))
      );
      
      // ⚡ WICHTIG: Chat-Agent antwortet IMMER, auch wenn Smart Agent startet!
      // Beide arbeiten parallel!
      
      if (isAppCreationRequest) {
        // Extrahiere Framework und Projektname
        let framework = 'flutter';
        if (lowerPrompt.includes('react native')) framework = 'react-native';
        else if (lowerPrompt.includes('nextjs') || lowerPrompt.includes('next.js')) framework = 'nextjs';
        else if (lowerPrompt.includes('react')) framework = 'react';
        else if (lowerPrompt.includes('vue')) framework = 'vue';
        else if (lowerPrompt.includes('flutter')) framework = 'flutter';
        
        // Extrahiere Projektname
        const nameMatch = prompt.match(/namens?\s+([a-zA-Z0-9_-]+)/i) ||
                         prompt.match(/genannt\s+([a-zA-Z0-9_-]+)/i) ||
                         prompt.match(/"([a-zA-Z0-9_-]+)"/);
        const projectName = nameMatch ? nameMatch[1] : projectId;
        
        // ⚡ Starte Smart Agent im Hintergrund (NICHT warten!)
        startLiveBuildFromChat(projectName, framework, prompt).catch(err => {
          console.error('Smart Agent error:', err);
        });
        
        // ⚡ WICHTIG: Chat-Agent antwortet TROTZDEM normal weiter!
        // Kein return - Chat läuft weiter und Agent gibt ECHTE Antwort!
      }
      
      // Echte API-Integration
      // ⚡ STREAMING AKTIVIEREN für sofortige Antworten!
      const response = await fetch('http://localhost:8005/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream' // Streaming!
        },
        // ⚡ KEIN Timeout - Streaming läuft kontinuierlich, Agent antwortet sofort!
        body: JSON.stringify({
          stream: true, // ⚡ STREAMING IMMER AKTIV!
          model: currentModel || 'gpt-4o',
          prompt: prompt,
          agent: currentAgent || 'aura',
          project_id: projectId, // Send project ID for code access
          conversation_history: chatMessages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          system_prompt: `🚀 Du bist ein intelligenter Auto-Coder Agent im VibeAI Builder mit DIREKTEM ZUGRIFF auf den Code und VOLLSTÄNDIGER AUTOMATISIERUNG.

🔥 Was du kannst (AUTOMATISCH):
• 📁 Dateien ERSTELLEN & BEARBEITEN - Automatisch
• 🤖 Code GENERIEREN - Mit KI-Power
• 🔧 Bugs FIXEN - Sofort
• 🎨 UI/UX DESIGNEN - Modern & responsive
• 📊 Daten ANALYSIEREN - Smart insights
• 🚀 Apps DEPLOYEN - One-click
• ⚙️ Terminal-BEFEHLE AUSFÜHREN - npm install, flutter pub get, etc.
• 📦 Packages INSTALLIEREN - Automatisch
• 🏗️ Projekte BAUEN - Build-Befehle ausführen
• 🧪 Code TESTEN - Tests ausführen

⚡ Quick Actions (du verstehst und führst automatisch aus):
• "erstelle eine React App" → Erstelle komplette React-App mit allen Dateien
• "fixe alle Fehler" → Finde und fixe alle Fehler im Projekt
• "optimiere den Code" → Optimiere Code für Performance und Best Practices
• "erstelle ein Dashboard" → Erstelle komplettes Dashboard UI
• "installiere packages" → Installiere alle benötigten Dependencies
• "starte den Server" → Starte Development Server
• "baue die App" → Baue die Anwendung

📝 Code-Format:
Wenn du Code erstellst/modifizierst, formatiere als:
\`\`\`language path/to/file
[VOLLSTÄNDIGER CODE HIER]
\`\`\`

🔧 Terminal-Format:
Wenn du Befehle ausführen musst, formatiere als:
TERMINAL: command here

🎯 Dein Workflow (ZEIGE DEINE SCHRITTE - SEI SPEZIFISCH):
1. Sage was du tust: "📝 Analysiere Projektstruktur..."
2. Zeige deine Arbeit: "🔍 Finde Fehler in main.dart..."
3. Führe Aktionen aus: "✅ Fixe Fehler in Zeile 45..."
4. Erstelle Dateien: "📁 Erstelle neue Datei: src/components/Button.jsx"
5. Bearbeite Dateien: "✏️ Bearbeite: lib/main.dart (Zeile 10-15)"
6. Führe Befehle aus: "⚙️ Führe aus: npm install"
7. Verifiziere: "✅ Fertig! Alle Fehler behoben."

WICHTIG: Zeige ECHTE Aktionen, nicht nur Text. Verwende Emojis für Aktions-Typen:
- 📝 = Analysiere/Planen
- 🔍 = Suche/Untersuche
- 📁 = Erstelle Datei
- ✏️ = Bearbeite Datei
- ✅ = Abgeschlossene Aktion
- ⚙️ = Führe Befehl aus
- 🔧 = Fixe
- 🚀 = Deploye/Baue

Du arbeitest VOLLSTÄNDIG AUTOMATISCH - einfach beschreiben was du willst und ich mache es!
Aktuelles Projekt: ${projectId}
Verwende den Agent-Typ: ${currentAgent || 'aura'}
Du hast vollen Kontext des Projekts. Nutze dies für präzise, hilfreiche Lösungen.
Sei proaktiv, hilfreich und liefere vollständige, funktionierende Lösungen.`
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Create streaming message
        const streamingMsg = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          model: currentModel,
          isStreaming: true
        };
        setChatMessages(prev => [...prev, streamingMsg]);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let processedCodeBlocks = new Set(); // Track which code blocks we've already processed
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  setChatMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, content: `❌ Fehler: ${data.error}`, isStreaming: false }
                      : msg
                  ));
                  break;
                }
                
                if (data.content) {
                  fullContent += data.content;
                  // ⚡ PERFORMANCE: Update streaming message THROTTLED (nur alle 100ms)
                  const now = Date.now();
                  if (now - lastChatUpdateRef.current > 100) {
                    lastChatUpdateRef.current = now;
                    startTransition(() => {
                      setChatMessages(prev => prev.map((msg, idx) => 
                        idx === prev.length - 1 && msg.isStreaming
                          ? { ...msg, content: fullContent }
                          : msg
                      ));
                    });
                  }
                  
                  // 🔥 LIVE CODE PARSING: Parse code blocks as they appear, not just at the end!
                  // Check for complete code blocks in the current content
                  const codeBlockPattern = /```(\w+)?\s*(.+?)\n([\s\S]*?)```/g;
                  let match;
                  while ((match = codeBlockPattern.exec(fullContent)) !== null) {
                    const language = match[1] || 'text';
                    const filePath = match[2]?.trim();
                    const codeContent = match[3]?.trim();
                    
                    if (filePath && codeContent) {
                      // Create unique key for this code block
                      const blockKey = `${filePath}:${codeContent.length}`;
                      
                      // Only process if we haven't seen this block before
                      if (!processedCodeBlocks.has(blockKey)) {
                        processedCodeBlocks.add(blockKey);
                        
                        console.log(`📝 LIVE: Found complete code block for: ${filePath}`);
                        
                        // Apply code change IMMEDIATELY (async, but don't wait)
                        parseAndApplyCodeChanges(`\`\`\`${language} ${filePath}\n${codeContent}\n\`\`\``).then(() => {
                          // Add notification to chat that file was created
                          addChatMessage('assistant', `✅ **Datei erstellt:** \`${filePath}\``);
                        });
                      }
                    }
                  }
                  
                  // Also check for terminal commands as they appear
                  const terminalPattern = /TERMINAL:\s*(.+?)(?:\n|$)/g;
                  let terminalMatch;
                  const seenCommands = new Set();
                  while ((terminalMatch = terminalPattern.exec(fullContent)) !== null) {
                    const command = terminalMatch[1].trim();
                    if (command && !seenCommands.has(command)) {
                      seenCommands.add(command);
                      // Show approval button immediately
                      const approvalMsg = {
                        role: 'assistant',
                        content: `⚙️ **Terminal Command Ready**\n\n\`\`\`bash\n$ ${command}\n\`\`\`\n\n**Run this command?**`,
                        command: command,
                        needsApproval: true,
                        timestamp: new Date().toISOString()
                      };
                      setChatMessages(prev => {
                        // Check if this command was already added
                        const alreadyExists = prev.some(msg => msg.command === command && msg.needsApproval);
                        if (alreadyExists) return prev;
                        return [...prev, approvalMsg];
                      });
                    }
                  }
                  
                  // ⚡ PERFORMANCE: Auto-scroll DEBOUNCED (nur alle 500ms)
                  if (chatUpdateTimeoutRef.current) {
                    clearTimeout(chatUpdateTimeoutRef.current);
                  }
                  chatUpdateTimeoutRef.current = setTimeout(() => {
                    if (chatEndRef.current) {
                      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 500);
                }
                
                if (data.done) {
                  // Finalize message
                  setChatMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, content: fullContent, isStreaming: false }
                      : msg
                  ));
                  
                  // Final parse for any remaining code blocks (in case we missed any)
                  parseAndApplyCodeChanges(fullContent);
                  
                  // Parse terminal commands and show approval buttons (like Cursor)
                  const commands = parseAndShowTerminalCommands(fullContent);
                  if (commands && commands.length > 0) {
                    // Add approval message for each command (only if not already added)
                    commands.forEach(command => {
                      setChatMessages(prev => {
                        const alreadyExists = prev.some(msg => msg.command === command && msg.needsApproval);
                        if (alreadyExists) return prev;
                        const approvalMsg = {
                          role: 'assistant',
                          content: `⚙️ **Terminal Command Ready**\n\n\`\`\`bash\n$ ${command}\n\`\`\`\n\n**Run this command?**`,
                          command: command,
                          needsApproval: true,
                          timestamp: new Date().toISOString()
                        };
                        return [...prev, approvalMsg];
                      });
                    });
                  }
                  
                  setIsChatLoading(false);
                  return;
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } else {
        // Non-streaming fallback
        const data = await response.json();
        console.log('✅ Received response:', data);
        
        const responseContent = data.response || data.error || 'Keine Antwort erhalten';
        
        const aiMsg = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          model: data.model || currentModel
        };
        
        setChatMessages(prev => [...prev, aiMsg]);
        parseAndApplyCodeChanges(responseContent);
        
        // Parse terminal commands and show approval buttons (like Cursor)
        const commands = parseAndShowTerminalCommands(responseContent);
        if (commands && commands.length > 0) {
          // Add approval message for each command
          commands.forEach(command => {
            const approvalMsg = {
              role: 'assistant',
              content: `⚙️ **Terminal Command Ready**\n\n\`\`\`bash\n$ ${command}\n\`\`\`\n\n**Run this command?**`,
              command: command,
              needsApproval: true,
              timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, approvalMsg]);
          });
        }
        setIsChatLoading(false);
      }

    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // ⚡ ECHTE ANTWORT statt "Failed to fetch"!
      // Wenn während Generierung gefragt wird, gebe echte Antwort
      if (isLiveBuilding) {
        const contextMsg = {
          role: 'assistant',
          content: `✅ **Ich arbeite gerade an der Code-Generierung!**\n\n📝 **Aktueller Status:**\n- ${buildProgress.currentFile ? `Erstelle: \`${buildProgress.currentFile}\`` : 'Generiere Projektstruktur...'}\n- Fortschritt: ${buildProgress.current}/${buildProgress.total} Dateien\n\n💬 **Deine Frage:** "${prompt}"\n\nIch kann während der Generierung weiterarbeiten. Sobald ich fertig bin, beantworte ich deine Frage gerne!\n\nOder soll ich die Generierung pausieren und deine Frage sofort beantworten?`,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, contextMsg]);
      } else {
        // Normale Fehlerbehandlung mit echten Antworten
        let errorContent = '';
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorContent = `⚠️ **Verbindungsproblem**\n\nIch konnte die Verbindung zum Backend nicht herstellen.\n\n**Mögliche Lösungen:**\n1. Prüfe ob das Backend läuft (Port 8005)\n2. Warte einen Moment und versuche es erneut\n3. Prüfe deine Internetverbindung\n\n**Deine Frage:** "${prompt}"\n\nIch kann deine Frage trotzdem beantworten, sobald die Verbindung wiederhergestellt ist.`;
        } else if (error.message.includes('timeout')) {
          errorContent = `⏱️ **Zeitüberschreitung**\n\nDie Anfrage hat zu lange gedauert.\n\n**Deine Frage:** "${prompt}"\n\nBitte versuche es erneut oder formuliere die Frage kürzer.`;
        } else {
          errorContent = `❌ **Fehler aufgetreten**\n\n\`\`\`\n${error.message}\n\`\`\`\n\n**Deine Frage:** "${prompt}"\n\nBitte versuche es erneut. Falls das Problem weiterhin besteht, prüfe die Backend-Verbindung.`;
        }
        
        const errorMsg = {
          role: 'assistant',
          content: errorContent,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, errorMsg]);
      }
      
      setIsChatLoading(false);
    }
  };

  // ⚡ PERFORMANCE: Auto-scroll DEBOUNCED (nur wenn Chat wirklich geändert)
  useEffect(() => {
    if (chatUpdateTimeoutRef.current) {
      clearTimeout(chatUpdateTimeoutRef.current);
    }
    chatUpdateTimeoutRef.current = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
    
    return () => {
      if (chatUpdateTimeoutRef.current) {
        clearTimeout(chatUpdateTimeoutRef.current);
      }
    };
  }, [chatMessages.length]); // Nur bei Längen-Änderung, nicht bei jedem Update

  // Find main HTML file for preview
  const findMainHTMLFile = useCallback(() => {
    // Try to find index.html first (in various locations)
    let htmlFile = files.find(f => 
      f.name === 'index.html' || 
      f.path?.includes('index.html') ||
      f.path?.endsWith('/index.html') ||
      f.path?.endsWith('index.html') ||
      f.path === '/index.html' ||
      f.path === 'index.html'
    );
    
    // If not found, find any HTML file (prioritize public folder)
    if (!htmlFile) {
      htmlFile = files.find(f => 
        (f.name.endsWith('.html') || f.path?.endsWith('.html')) &&
        (f.path?.includes('public') || f.path?.includes('www'))
      );
    }
    
    // If still not found, find any HTML file
    if (!htmlFile) {
      htmlFile = files.find(f => 
        f.name.endsWith('.html') || 
        f.path?.endsWith('.html')
      );
    }
    
    return htmlFile;
  }, [files]);

  // Detect project type when files change
  useEffect(() => {
    if (files.length > 0) {
      detectProjectTypeAndStartPreview();
    }
  }, [files.length]);

  // Update preview when active file changes or files change
  useEffect(() => {
    if (activeRightPanel === 'preview') {
      setTimeout(() => {
        // ALWAYS prefer HTML files for preview, regardless of active file
        const mainHTML = findMainHTMLFile();
        
        // NEVER render Dart/Flutter files directly - always use HTML
        const isDartFile = activeFile && (activeFile.name.endsWith('.dart') || getLanguage(activeFile.name) === 'dart');
        
        // If active file is HTML, use it (but combine with CSS/JS)
        if (activeFile && activeFile.name.endsWith('.html') && getLanguage(activeFile.name) === 'html' && !isDartFile) {
          import('./utils/editor-bridge.js').then(module => {
            if (module.updatePreview) {
              let htmlContent = activeFile.content;
              
              // Find and embed CSS
              const cssFiles = files.filter(f => f.name.endsWith('.css'));
              cssFiles.forEach(cssFile => {
                if (!htmlContent.includes(cssFile.content)) {
                  htmlContent = htmlContent.replace(
                    '</head>',
                    `<style>${cssFile.content}</style>\n</head>`
                  );
                }
              });
              
              // Find and embed JS
              const jsFiles = files.filter(f => 
                f.name.endsWith('.js') && 
                !f.name.includes('node_modules') &&
                !f.path?.includes('node_modules')
              );
              jsFiles.forEach(jsFile => {
                if (!htmlContent.includes(jsFile.content)) {
                  htmlContent = htmlContent.replace(
                    '</body>',
                    `<script>${jsFile.content}</script>\n</body>`
                  );
                }
              });
              
              module.updatePreview(htmlContent, 'html');
            }
          }).catch(err => {
            console.log('Preview update error:', err);
          });
        } else if (mainHTML) {
          // Always render main HTML file, even if active file is Dart/Flutter/other
          console.log('📱 Rendering HTML file for preview:', mainHTML.name);
          import('./utils/editor-bridge.js').then(module => {
            if (module.updatePreview) {
              // Combine HTML with CSS and JS
              let htmlContent = mainHTML.content;
              
              // Find and embed CSS
              const cssFiles = files.filter(f => f.name.endsWith('.css'));
              cssFiles.forEach(cssFile => {
                if (!htmlContent.includes(cssFile.content)) {
                  htmlContent = htmlContent.replace(
                    '</head>',
                    `<style>${cssFile.content}</style>\n</head>`
                  );
                }
              });
              
              // Find and embed JS
              const jsFiles = files.filter(f => 
                f.name.endsWith('.js') && 
                !f.name.includes('node_modules') &&
                !f.path?.includes('node_modules')
              );
              jsFiles.forEach(jsFile => {
                if (!htmlContent.includes(jsFile.content)) {
                  htmlContent = htmlContent.replace(
                    '</body>',
                    `<script>${jsFile.content}</script>\n</body>`
                  );
                }
              });
              
              module.updatePreview(htmlContent, 'html');
            }
          }).catch(err => {
            console.log('Preview update error:', err);
          });
        } else {
          // No HTML file found - show message for Flutter/Dart projects
          const hasFlutter = files.some(f => f.name.endsWith('.dart') || f.name === 'pubspec.yaml');
          const hasReact = files.some(f => f.name.endsWith('.jsx') || f.name.endsWith('.tsx'));
          
          if (hasFlutter) {
            // Show Flutter info message
            import('./utils/editor-bridge.js').then(module => {
              if (module.updatePreview) {
                const flutterInfo = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 600px;
    }
    h1 { font-size: 48px; margin-bottom: 20px; }
    p { font-size: 18px; line-height: 1.6; margin-bottom: 30px; opacity: 0.9; }
    .info-box {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 30px;
      margin-top: 20px;
    }
    .code { 
      background: rgba(0, 0, 0, 0.3);
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      margin-top: 15px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 Flutter App</h1>
    <p>Diese Flutter-App kann nicht direkt im Browser gerendert werden.</p>
    <div class="info-box">
      <p><strong>Um die App zu sehen:</strong></p>
      <div class="code">flutter run -d chrome</div>
      <p style="margin-top: 15px; font-size: 14px;">Oder öffne das Projekt in Android Studio / VS Code und starte es dort.</p>
    </div>
  </div>
</body>
</html>`;
                module.updatePreview(flutterInfo, 'html');
              }
            }).catch(err => {
              console.log('Preview update error:', err);
            });
          } else if (hasReact) {
            // Show React info
            const reactInfo = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #1e1e1e;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    h1 { font-size: 32px; margin-bottom: 20px; }
    .code {
      background: #2d2d2d;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div>
    <h1>⚛️ React App</h1>
    <p>Starte den Development Server:</p>
    <div class="code">npm start</div>
  </div>
</body>
</html>`;
            import('./utils/editor-bridge.js').then(module => {
              if (module.updatePreview) {
                module.updatePreview(reactInfo, 'html');
              }
            });
          }
        }
      }, 100);
    }
  }, [activeFile, activeRightPanel, files, findMainHTMLFile]);

  return (
    <div className="editor-container" style={{
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />
      
      {/* Overlay when Command Palette is open */}
      {showCommandPalette && (
        <div
          onClick={() => setShowCommandPalette(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999
          }}
        />
      )}
      {/* Top Bar - Exactly like Cursor Screenshot */}
      <div style={{
        height: '35px',
        background: '#252526',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        padding: '0',
            fontSize: '12px'
          }}>
        {/* Left: Agents/Editor Tabs */}
        <div style={{
          display: 'flex',
          height: '100%',
          borderRight: '1px solid #3c3c3c'
        }}>
          <button
            onClick={() => setActiveRightPanel('chat')}
            style={{
              padding: '0 16px',
              background: activeRightPanel === 'chat' ? '#1e1e1e' : 'transparent',
              border: 'none',
              color: activeRightPanel === 'chat' ? '#cccccc' : '#858585',
              fontSize: '12px',
              cursor: 'pointer',
              height: '100%',
              borderBottom: activeRightPanel === 'chat' ? '2px solid #007acc' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeRightPanel !== 'chat') {
                e.target.style.color = '#cccccc';
              }
            }}
            onMouseLeave={(e) => {
              if (activeRightPanel !== 'chat') {
                e.target.style.color = '#858585';
              }
            }}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveRightPanel('preview')}
            style={{
              padding: '0 16px',
              background: activeRightPanel === 'preview' ? '#1e1e1e' : 'transparent',
              border: 'none',
              color: activeRightPanel === 'preview' ? '#cccccc' : '#858585',
              fontSize: '12px',
            cursor: 'pointer',
              height: '100%',
              borderBottom: activeRightPanel === 'preview' ? '2px solid #007acc' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (activeRightPanel !== 'preview') {
                e.target.style.color = '#cccccc';
              }
            }}
            onMouseLeave={(e) => {
              if (activeRightPanel !== 'preview') {
                e.target.style.color = '#858585';
              }
            }}
          >
            Editor
          </button>
        </div>

        {/* Center: Search */}
        <div style={{
          flex: 1,
          maxWidth: '400px',
          margin: '0 auto',
          position: 'relative',
          padding: '0 12px'
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vibeai"
            style={{
              width: '100%',
              padding: '4px 24px 4px 8px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px',
              outline: 'none'
            }}
          />
          <Search 
            size={12} 
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#858585'
            }}
          />
      </div>

        {/* Right: Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginLeft: 'auto',
          height: '100%'
        }}>
          {reviewData && (
            <div style={{
              padding: '0 16px',
              background: '#1e1e1e',
          borderRight: '1px solid #3c3c3c',
              height: '100%',
          display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: '#cccccc'
        }}>
              Review: {reviewData.title}
            </div>
          )}
          {activeFile && (
          <div style={{
              padding: '0 16px',
              background: '#1e1e1e',
              borderRight: '1px solid #3c3c3c',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#cccccc'
            }}>
              <File size={12} />
              {activeFile.name}
              {activeFile.gitStatus === 'M' && (
                <span style={{ color: '#ffa500', fontSize: '10px', marginLeft: '4px' }}>M</span>
              )}
            </div>
          )}
        </div>
      </div>
          
      {/* Main Content */}
      <div className="editor-main" style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel - Files & Git - CURSOR STYLE */}
        <div className="editor-sidebar" style={{
          width: `${leftPanelWidth}px`,
          minWidth: '200px',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'row'
        }}>
          {/* Sidebar Icons - VERTICAL like Cursor/VS Code */}
          <div style={{
            width: '48px',
            background: '#252526',
            borderRight: '1px solid #3c3c3c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '8px',
            gap: '4px',
            flexShrink: 0
          }}>
            <button
              onClick={() => setActiveLeftPanel('explorer')}
                style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'explorer' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'explorer' ? '#ffffff' : '#858585',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Explorer"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'explorer') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'explorer') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Folder size={20} />
            </button>
            <button
              onClick={() => setActiveLeftPanel('search')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'search' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'search' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Search"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'search') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'search') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setActiveLeftPanel('source-control')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'source-control' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'source-control' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title="Source Control"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'source-control') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'source-control') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <GitBranch size={20} />
              {/* Git badge if there are changes */}
              {files.some(f => f.gitStatus === 'M' || f.gitStatus === 'U') && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  background: '#f48771',
                  borderRadius: '50%',
                  border: '2px solid #252526'
                }} />
              )}
            </button>
            <button
              onClick={() => setActiveLeftPanel('run-debug')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'run-debug' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'run-debug' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Run and Debug"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'run-debug') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'run-debug') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Play size={20} />
            </button>
            <button
              onClick={() => setActiveLeftPanel('testing')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'testing' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'testing' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Testing"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'testing') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'testing') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Code size={20} />
            </button>
            <button
              onClick={() => setActiveLeftPanel('extensions')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'extensions' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'extensions' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Extensions"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'extensions') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'extensions') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Package size={20} />
            </button>
            <button
              onClick={() => {
                // Tutorial starten
                setShowTutorial(true);
              }}
              style={{
                width: '44px',
                height: '44px',
                background: 'transparent',
                border: 'none',
                color: '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title="Tutorial starten"
              onMouseEnter={(e) => {
                e.target.style.background = '#2d2d30';
                e.target.style.color = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#858585';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>?</span>
            </button>
              </div>
          
          {/* Resizer between Icons and Content */}
          <div
            onMouseDown={(e) => startResize(e, 'left-content')}
            style={{
              width: '4px',
              background: '#3c3c3c',
              cursor: 'col-resize',
              flexShrink: 0,
              transition: 'background 0.2s, width 0.2s',
              position: 'relative',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#007acc';
              e.currentTarget.style.width = '6px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3c3c3c';
              e.currentTarget.style.width = '4px';
            }}
          />
          
          {/* Sidebar Content Area */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0,
            width: `${leftSidebarContentWidth}px`,
            flexShrink: 0
          }}>
            {/* Sidebar Header */}
            <div style={{
              height: '35px',
              background: '#2d2d30',
              borderBottom: '1px solid #3c3c3c',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#cccccc',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {activeLeftPanel === 'explorer' && 'EXPLORER'}
              {activeLeftPanel === 'search' && 'SEARCH'}
              {activeLeftPanel === 'source-control' && 'SOURCE CONTROL'}
              {activeLeftPanel === 'run-debug' && 'RUN AND DEBUG'}
              {activeLeftPanel === 'testing' && 'TESTING'}
              {activeLeftPanel === 'extensions' && 'EXTENSIONS'}
            </div>
            
            {/* Content */}
            <div className="sidebar-content" style={{ flex: 1, overflow: 'auto' }}>
            {activeLeftPanel === 'explorer' ? (
              files.length > 0 ? (
                <FileTree 
                  files={files} 
                  activeFile={activeFile}
                  onFileClick={openFile}
                  getFileIcon={getFileIcon}
                />
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px'
                }}>
                  <Folder size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <div>Keine Dateien</div>
                  <div style={{ fontSize: '10px', marginTop: '10px', opacity: 0.7 }}>
                    Erstelle ein Projekt im App Builder
                  </div>
                </div>
              )
            ) : activeLeftPanel === 'search' ? (
              <SearchPanel 
                files={files}
                onFileSelect={(filePath, line) => {
                  const file = files.find(f => f.path === filePath);
                  if (file) {
                    openFile(file);
                    // Scroll to line (would need editor ref)
                  }
                }}
              />
            ) : activeLeftPanel === 'source-control' ? (
              <GitPanel projectId={projectId} />
            ) : activeLeftPanel === 'run-debug' ? (
              <RunAndDebugPanel projectId={projectId} activeFile={activeFile} />
            ) : activeLeftPanel === 'testing' ? (
              <TestingPanel projectId={projectId} files={files} />
            ) : activeLeftPanel === 'extensions' ? (
              <ExtensionsPanel />
            ) : (
              <PackageManager projectId={projectId} />
            )}
            </div>
          </div>
        </div>

        {/* Center - Editor */}
        <div className="editor-area" style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minWidth: 0, // WICHTIG: Verhindert Overflow
          overflow: 'hidden' // WICHTIG: Verhindert Verschiebung
        }}>
          {/* Preview oben im Editor (wie im Bild) */}
          {activeRightPanel === 'preview' && previewStatus === 'running' && previewUrl && (
            <div style={{
              height: '200px',
              background: '#1e1e1e',
              borderBottom: '1px solid #3c3c3c',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '4px 8px',
              background: '#2d2d30',
              borderBottom: '1px solid #3c3c3c',
                fontSize: '10px',
                color: '#858585',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>🌐 Browser Preview</span>
                <button
                  onClick={() => {
                    const frame = document.getElementById('preview-frame-top');
                    if (!frame) {
                      console.warn('Preview frame top not found');
                      return;
                    }
                    
                    // Force reload by setting src to empty and back
                    if (frame.src) {
                      const currentSrc = frame.src;
                      frame.src = '';
                      setTimeout(() => {
                        frame.src = currentSrc;
                      }, 10);
                    } else if (frame.contentWindow) {
                      try {
                        frame.contentWindow.location.reload();
                      } catch (e) {
                        console.error('Error reloading frame:', e);
                      }
                    }
                  }}
                  style={{
                    padding: '2px 6px',
                    background: 'transparent',
                    border: '1px solid #3c3c3c',
                    borderRadius: '3px',
                    color: '#cccccc',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  Reload
                </button>
              </div>
              <iframe
                id="preview-frame-top"
                src={previewUrl}
                style={{
                  flex: 1,
                  border: 'none',
                  background: '#ffffff'
                }}
              />
            </div>
          )}

          {/* Tabs - Scrollable when many tabs (Files + Browser Tabs) - FIXED HEIGHT */}
          {(openTabs.length > 0 || browserTabs.length > 0) && (
            <div 
              className="editor-tabs-container"
              style={{
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '35px',
                minHeight: '35px',
                maxHeight: '35px',
                width: '100%', // WICHTIG: Volle Breite
                background: '#1e1e1e',
                borderBottom: '1px solid #3c3c3c',
                scrollbarWidth: 'thin',
                scrollbarColor: '#3c3c3c #1e1e1e',
                WebkitOverflowScrolling: 'touch',
                flexShrink: 0, // WICHTIG: Verhindert, dass Tabs den Editor verschieben
                flexGrow: 0, // WICHTIG: Nie wachsen
                position: 'relative',
                zIndex: 5
              }}
              onWheel={(e) => {
                // Horizontal scroll with mouse wheel (Shift + Wheel = horizontal)
                if (e.shiftKey || e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY || e.deltaX;
                  e.preventDefault();
                }
              }}
            >
              {/* File Tabs */}
              {openTabs.map(file => (
                <div
                  key={file.path}
                  onClick={(e) => {
                    // ⚡ WICHTIG: Nur Tab öffnen, wenn nicht auf Close-Button geklickt wurde
                    if (!e.target.closest('.tab-close-btn')) {
                      setActiveFile(file);
                      setActiveBrowserTab(null);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const closeBtn = e.currentTarget.querySelector('.tab-close-btn');
                    if (closeBtn) closeBtn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const closeBtn = e.currentTarget.querySelector('.tab-close-btn');
                    if (closeBtn) closeBtn.style.opacity = '0.6';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px 6px 12px',
                    background: activeFile?.path === file.path && !activeBrowserTab ? '#1e1e1e' : '#2d2d30',
                    borderRight: '1px solid #3c3c3c',
                    borderTop: activeFile?.path === file.path && !activeBrowserTab ? '2px solid #007acc' : '2px solid transparent',
                    color: activeFile?.path === file.path && !activeBrowserTab ? '#cccccc' : '#858585',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minWidth: '120px',
                    maxWidth: '200px',
                    flexShrink: 0, // WICHTIG: Tabs werden nicht komprimiert
                    position: 'relative',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                >
                  <File size={12} style={{ flexShrink: 0 }} />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>{file.name}</span>
                  {file.gitStatus === 'M' && (
                    <span style={{ 
                      color: '#ffa500', 
                      fontSize: '10px', 
                      flexShrink: 0 
                    }}>M</span>
                  )}
                  <button
                    className="tab-close-btn"
                    onClick={(e) => {
                      // ⚡ WICHTIG: stopPropagation + preventDefault verhindert Tab-Öffnung!
                      e.stopPropagation();
                      e.preventDefault();
                      console.log(`🔴 Close tab clicked: ${file.path}`);
                      closeTab(file);
                    }}
                    onMouseDown={(e) => {
                      // ⚡ WICHTIG: Auch onMouseDown stoppen, damit Tab nicht geöffnet wird
                      e.stopPropagation();
                    }}
                    style={{
                      marginLeft: '4px',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      opacity: '0.6',
                      transition: 'opacity 0.2s, background 0.2s',
                      background: 'transparent',
                      border: 'none',
                      color: '#cccccc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '16px',
                      height: '16px',
                      zIndex: 10, // WICHTIG: Über Tab-Content
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.background = '#3c3c3c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '0.6';
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* Browser Tabs Separator */}
              {openTabs.length > 0 && browserTabs.length > 0 && (
                <div style={{
                  width: '1px',
                  height: '20px',
                  background: '#3c3c3c',
                  margin: '0 4px',
                  alignSelf: 'center'
                }} />
              )}
              
              {/* Browser Tabs */}
              {browserTabs.map(tab => (
                <div
                  key={tab.id}
                  onClick={(e) => {
                    // ⚡ WICHTIG: Nur Tab öffnen, wenn nicht auf Close-Button geklickt wurde
                    if (!e.target.closest('.tab-close-btn')) {
                      setActiveBrowserTab(tab.id);
                      setActiveFile(null);
                      setPreviewUrl(tab.url);
                      setPreviewStatus('running');
                    }
                  }}
                  onMouseEnter={(e) => {
                    const closeBtn = e.currentTarget.querySelector('.tab-close-btn');
                    if (closeBtn) closeBtn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const closeBtn = e.currentTarget.querySelector('.tab-close-btn');
                    if (closeBtn) closeBtn.style.opacity = '0.6';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px 6px 12px',
                    background: activeBrowserTab === tab.id ? '#1e1e1e' : '#2d2d30',
                    borderRight: '1px solid #3c3c3c',
                    borderTop: activeBrowserTab === tab.id ? '2px solid #4ec9b0' : '2px solid transparent',
                    color: activeBrowserTab === tab.id ? '#cccccc' : '#858585',
                    fontSize: '12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minWidth: '120px',
                    maxWidth: '200px',
                    flexShrink: 0, // WICHTIG: Tabs werden nicht komprimiert
                    position: 'relative',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                >
                  <Globe size={12} style={{ flexShrink: 0, color: '#4ec9b0' }} />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>{tab.title}</span>
                  <button
                    className="tab-close-btn"
                    onClick={(e) => {
                      // ⚡ WICHTIG: stopPropagation + preventDefault verhindert Tab-Öffnung!
                      e.stopPropagation();
                      e.preventDefault();
                      console.log(`🔴 Close browser tab clicked: ${tab.id}`);
                      
                      // Wenn geschlossener Tab aktiv war, setze activeBrowserTab auf null oder nächsten
                      if (activeBrowserTab === tab.id) {
                        const remainingTabs = browserTabs.filter(t => t.id !== tab.id);
                        if (remainingTabs.length > 0) {
                          setActiveBrowserTab(remainingTabs[remainingTabs.length - 1].id);
                        } else {
                          setActiveBrowserTab(null);
                          setActiveFile(null);
                          setPreviewUrl(null);
                          setPreviewStatus('stopped');
                        }
                      }
                      
                      setBrowserTabs(prev => prev.filter(t => t.id !== tab.id));
                    }}
                    onMouseDown={(e) => {
                      // ⚡ WICHTIG: Auch onMouseDown stoppen
                      e.stopPropagation();
                    }}
                    style={{
                      marginLeft: '4px',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      opacity: '0.6',
                      transition: 'opacity 0.2s, background 0.2s',
                      background: 'transparent',
                      border: 'none',
                      color: '#cccccc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      width: '16px',
                      height: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.background = '#3c3c3c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '0.6';
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor or Browser */}
          <div className="editor-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0 }}>
            {activeBrowserTab ? (
              // Browser Tab Content
              (() => {
                const activeTab = browserTabs.find(t => t.id === activeBrowserTab);
                return activeTab ? (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    background: '#1e1e1e'
                  }}>
                    {/* Browser Toolbar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: '#252526',
                      borderBottom: '1px solid #3c3c3c',
                      fontSize: '12px'
                    }}>
                      <button
                        onClick={() => {
                          const iframe = document.getElementById('browser-iframe');
                          if (iframe) iframe.src = iframe.src;
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#2d2d30',
                          border: '1px solid #3c3c3c',
                          borderRadius: '3px',
                          color: '#cccccc',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        🔄 Reload
                      </button>
                      <div style={{ flex: 1, padding: '4px 8px', background: '#1e1e1e', borderRadius: '3px', color: '#858585' }}>
                        {activeTab.url}
                      </div>
                      <button
                        onClick={() => window.open(activeTab.url, '_blank')}
                        style={{
                          padding: '4px 8px',
                          background: '#2d2d30',
                          border: '1px solid #3c3c3c',
                          borderRadius: '3px',
                          color: '#cccccc',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ExternalLink size={12} />
                        Open in Browser
                      </button>
                    </div>
                    {/* Browser iframe */}
                    <iframe
                      id="browser-iframe"
                      src={activeTab.url}
                      style={{
                        flex: 1,
                        width: '100%',
                        border: 'none',
                        background: '#ffffff'
                      }}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    />
                  </div>
                ) : null;
              })()
            ) : activeFile ? (
              <MonacoEditor
                height="100%"
                language={getLanguage(activeFile.name)}
                theme="vs-dark" 
                value={activeFile.content}
                onChange={handleEditorChange}
                options={{
                  // VS Code Features
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'off',
                  automaticLayout: true,
                  
                  // IntelliSense & Auto-Complete
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnCommitCharacter: true,
                  tabCompletion: 'on',
                  wordBasedSuggestions: 'allDocuments',
                  
                  // Code Features
                  codeLens: true,
                  colorDecorators: true,
                  bracketPairColorization: { enabled: true },
                  folding: true,
                  foldingStrategy: 'auto',
                  showFoldingControls: 'always',
                  
                  // Multi-Cursor
                  multiCursorModifier: 'ctrlCmd',
                  multiCursorMergeOverlapping: true,
                  
                  // Formatting
                  formatOnPaste: true,
                  formatOnType: true,
                  formatOnSave: true,
                  
                  // Navigation
                  gotoLocation: { multiple: 'gotoAndPeek' },
                  peekWidgetDefaultFocus: 'tree',
                  
                  // Error Detection
                  renderValidationDecorations: 'on',
                  renderWhitespace: 'selection',
                  
                  // Performance
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  
                  // Accessibility
                  accessibilitySupport: 'auto',
                  lineNumbers: 'on',
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  
                  // Advanced
                  contextmenu: true,
                  mouseWheelZoom: true,
                  links: true,
                  detectIndentation: true,
                  trimAutoWhitespace: true,
                  dragAndDrop: true,
                  
                  // Language Specific
                  [getLanguage(activeFile.name)]: {
                    suggest: {
                      snippetsPreventQuickSuggestions: false
                    }
                  }
                }}
                onMount={(editor, monaco) => {
                  // ⚡ WICHTIG: Editor Ref setzen für Live-Updates!
                  editorRef.current = editor;
                  console.log('✅ Monaco Editor mounted, ref set for:', activeFile?.path);
                  
                  // Register additional language features
                  monaco.languages.registerCompletionItemProvider(getLanguage(activeFile.name), {
                    provideCompletionItems: () => {
                      return {
                        suggestions: [
                          {
                            label: 'console.log',
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: 'console.log(${1:value});',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: 'Log a value to the console'
                          }
                        ]
                      };
                    }
                  });
                  
                  // Auto-save on Cmd/Ctrl+S
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                    console.log('Auto-save triggered');
                    // Save logic here
                  });
                  
                  // Format document
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
                    editor.getAction('editor.action.formatDocument').run();
                  });
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{ fontSize: '48px' }}>📝</div>
                <div>Wähle eine Datei zum Bearbeiten</div>
              </div>
            )}
            </div>
            
            {/* Terminal direkt unter dem Editor */}
            {showBottomPanel && (
              <>
                {/* Terminal Resizer */}
                <div
                  onMouseDown={(e) => startResize(e, 'bottom')}
                  style={{
                    height: '4px',
                    background: '#3c3c3c',
                    cursor: 'row-resize',
                    flexShrink: 0,
                    transition: 'background 0.2s, height 0.2s',
                    position: 'relative',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#007acc';
                    e.currentTarget.style.height = '6px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3c3c3c';
                    e.currentTarget.style.height = '4px';
                  }}
                />
                
                {/* Terminal Panel */}
                <div className="editor-terminal-panel" style={{ 
                  height: `${bottomPanelHeight}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#1e1e1e',
                  borderTop: '1px solid #3c3c3c'
                }}>
                  {activeBottomPanel === 'terminal' ? (
                    <Terminal 
                      ref={terminalRef} 
                      projectId={projectId}
                      onUrlDetected={(url, command) => {
                        // Auto-open browser tab when URL is detected
                        console.log('🌐 URL detected in terminal:', url);
                        try {
                          // Add to browser tabs
                          const tabId = `browser-${Date.now()}`;
                          setBrowserTabs(prev => [...prev, {
                            id: tabId,
                            url: url,
                            title: url.includes('://') ? new URL(url).hostname : url,
                            command: command
                          }]);
                          // Auto-open in new tab
                          window.open(url, '_blank');
                        } catch (error) {
                          console.error('Error opening browser tab:', error);
                        }
                      }}
                      onProblemDetected={(problem) => {
                        // Handle problem detection
                        console.log('⚠️ Problem detected:', problem);
                        // Could open file if problem.file is set
                        if (problem.file) {
                          const file = files.find(f => f.path === problem.file || f.name === problem.file);
                          if (file) {
                            setActiveFile(file);
                            setOpenTabs(prev => {
                              if (!prev.find(t => t.path === file.path)) {
                                return [...prev, file];
                              }
                              return prev;
                            });
                          }
                        }
                      }}
                    />
                  ) : activeBottomPanel === 'output' ? (
                    <div style={{ padding: '12px', color: '#cccccc', fontSize: '12px', height: '100%' }}>
                      <div>Build output will appear here...</div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px', color: '#cccccc', fontSize: '12px', height: '100%' }}>
                      <div>Errors and warnings will appear here...</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resizer - Right Panel */}
        <div
          onMouseDown={(e) => startResize(e, 'right')}
          style={{
            width: '4px',
            background: '#3c3c3c',
            cursor: 'col-resize',
            flexShrink: 0,
            transition: 'background 0.2s, width 0.2s',
            position: 'relative',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#007acc';
            e.currentTarget.style.width = '6px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#3c3c3c';
            e.currentTarget.style.width = '4px';
          }}
        />

        {/* Right Panel - Chat (volle Höhe) */}
        <div className="editor-right-panel" style={{
          width: `${rightPanelWidth}px`,
          minWidth: '300px',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
          {/* Panel Tabs */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeRightPanel === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveRightPanel('preview')}
            >
              📱 PREVIEW
            </button>
            <button
              className={`panel-tab ${activeRightPanel === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveRightPanel('chat')}
            >
              🤖 AI CHAT
            </button>
          </div>

          {/* Panel Content */}
          <div className="panel-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeRightPanel === 'review' && (
              <ReviewPanel
                reviewTitle={reviewData?.title || "Optimierung des AI-gesteuerten entwicklerprojekts"}
                userRequest={reviewData?.userRequest || "es muss genau so aus sehen wie diese screen chat alle icons und funktionen und editor und komplett so und mit den 4 agenten die im chat sind"}
                codeChanges={reviewData?.codeChanges || []}
                onCommit={handleCommit}
                onFindIssues={onFindIssues}
                selectedAgent={currentAgent}
              />
            )}
            {activeRightPanel === 'preview' && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#1e1e1e',
                position: 'relative'
              }}>
                {/* Preview Header with Controls */}
                <div style={{
                  padding: '8px 12px',
                  background: '#2d2d30',
                  borderBottom: '1px solid #3c3c3c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ color: '#858585' }}>🌐 Browser Preview</span>
                    {findMainHTMLFile() && (
                      <span style={{ 
                        color: '#4ec9b0', 
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#1e1e1e',
                        borderRadius: '3px'
                      }}>
                        {findMainHTMLFile().name}
                      </span>
                    )}
                </div>
                  
                  <button
                    onClick={() => {
                      const frame = document.getElementById('preview-frame');
                      
                      if (!frame) {
                        console.warn('Preview frame not found');
                        return;
                      }

                      // If previewUrl is set, reload the URL
                      if (previewUrl && previewStatus === 'running') {
                        console.log('🔄 Reloading preview URL:', previewUrl);
                        // Force reload by setting src to empty and back
                        const currentSrc = frame.src;
                        frame.src = '';
                        setTimeout(() => {
                          frame.src = currentSrc;
                        }, 10);
                        return;
                      }

                      // Otherwise, reload HTML content
                      const mainHTML = findMainHTMLFile();
                      
                      if (mainHTML) {
                        console.log('🔄 Reloading preview with:', mainHTML.name);
                        
                        // Combine HTML with CSS and JS
                        let htmlContent = mainHTML.content;
                        
                        // Find and embed CSS
                        const cssFiles = files.filter(f => f.name.endsWith('.css'));
                        cssFiles.forEach(cssFile => {
                          if (!htmlContent.includes(cssFile.content)) {
                            htmlContent = htmlContent.replace(
                              '</head>',
                              `<style>${cssFile.content}</style>\n</head>`
                            );
                          }
                        });
                        
                        // Find and embed JS
                        const jsFiles = files.filter(f => 
                          f.name.endsWith('.js') && 
                          !f.name.includes('node_modules')
                        );
                        jsFiles.forEach(jsFile => {
                          if (!htmlContent.includes(jsFile.content)) {
                            htmlContent = htmlContent.replace(
                              '</body>',
                              `<script>${jsFile.content}</script>\n</body>`
                            );
                          }
                        });
                        
                        // Update preview by updating srcDoc
                        try {
                          // Force reload by clearing and setting srcDoc
                          frame.srcDoc = '';
                          setTimeout(() => {
                            frame.srcDoc = htmlContent;
                          }, 10);
                        } catch (e) {
                          console.error('Error reloading preview:', e);
                          // Fallback: try to update via contentWindow
                          try {
                            const iframeDoc = frame.contentDocument || frame.contentWindow.document;
                            if (iframeDoc) {
                              iframeDoc.open();
                              iframeDoc.write(htmlContent);
                              iframeDoc.close();
                            }
                          } catch (err) {
                            console.error('Fallback error:', err);
                          }
                        }
                      } else {
                        // No HTML file found - reload iframe
                        try {
                          if (frame.contentWindow) {
                            frame.contentWindow.location.reload();
                          } else if (frame.srcDoc) {
                            // Force reload srcDoc
                            const currentSrcDoc = frame.srcDoc;
                            frame.srcDoc = '';
                            setTimeout(() => {
                              frame.srcDoc = currentSrcDoc;
                            }, 10);
                          }
                        } catch (e) {
                          console.error('Error reloading iframe:', e);
                        }
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#37373d',
                      border: '1px solid #3c3c3c',
                      borderRadius: '4px',
                      color: '#cccccc',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#3c3c3c'}
                    onMouseLeave={(e) => e.target.style.background = '#37373d'}
                    title="Preview neu laden"
                  >
                    🔄 Reload
                  </button>
                </div>
                
                <iframe
                  id="preview-frame"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: '#fff'
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  title="Live Preview"
                  src={previewUrl && previewStatus === 'running' ? previewUrl : undefined}
                  srcDoc={(() => {
                    if (previewUrl && previewStatus === 'running') return undefined;
                    // Fallback: Zeige HTML-Inhalt direkt wenn verfügbar
                    const mainHTML = findMainHTMLFile();
                    if (mainHTML) {
                      let htmlContent = mainHTML.content;
                      // Embed CSS
                      const cssFiles = files.filter(f => f.name.endsWith('.css'));
                      cssFiles.forEach(cssFile => {
                        if (!htmlContent.includes(cssFile.content)) {
                          htmlContent = htmlContent.replace(
                            '</head>',
                            `<style>${cssFile.content}</style>\n</head>`
                          );
                        }
                      });
                      // Embed JS
                      const jsFiles = files.filter(f => 
                        f.name.endsWith('.js') && 
                        !f.name.includes('node_modules')
                      );
                      jsFiles.forEach(jsFile => {
                        if (!htmlContent.includes(jsFile.content)) {
                          htmlContent = htmlContent.replace(
                            '</body>',
                            `<script>${jsFile.content}</script>\n</body>`
                          );
                        }
                      });
                      return htmlContent;
                    }
                    // Default fallback
                    const statusMsg = previewStatus === 'starting' ? '<p style="color: #007acc;">⏳ Preview wird gestartet...</p>' : '';
                    const errorMsg = previewStatus === 'error' ? `<p style="color: #f48771;">❌ Fehler: ${previewError || 'Unbekannter Fehler'}</p>` : '';
                    return `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
                      </style>
                    </head>
                    <body>
                      <div id="preview-content" style="display: flex; align-items: center; justify-content: center; height: 100vh; color: #666;">
                        <div style="text-align: center;">
                          <h2>📱 Preview</h2>
                          <p>Wähle eine Datei aus, um die Vorschau zu sehen</p>
                          ${statusMsg}
                          ${errorMsg}
                        </div>
                      </div>
                      <script type="module">
                        // Preview Bridge - Message Listener
                        window.addEventListener("message", (event) => {
                          if (!event.data || typeof event.data !== "object") return;
                          const { type, payload, language } = event.data;
                          
                          if (type === "RENDER_CODE") {
                            const content = document.getElementById("preview-content");
                            if (content) {
                              if (language === "dart" || language === "flutter") {
                                content.innerHTML = '<h3>📱 Flutter Preview</h3><pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto;">' + 
                                  escapeHtml(payload) + '</pre>';
                              } else {
                                // HTML/CSS/JS
                                try {
                                  const doc = document;
                                  doc.open();
                                  doc.write(payload);
                                  doc.close();
                                } catch (err) {
                                  content.innerHTML = '<h3>❌ Render Fehler</h3><pre>' + escapeHtml(err.message) + '</pre>';
                                }
                              }
                            }
                          }
                        });
                        
                        function escapeHtml(text) {
                          const div = document.createElement('div');
                          div.textContent = text;
                          return div.innerHTML;
                        }
                      </script>
                    </body>
                    </html>
                  `;
                  })()}
                  onLoad={() => {
                    // Initialize preview with active file
                    if (activeFile) {
                      setTimeout(() => {
                        import('./utils/editor-bridge.js').then(module => {
                          if (module.updatePreview) {
                            module.updatePreview(activeFile.content, getLanguage(activeFile.name));
                          }
                        }).catch(err => {
                          console.log('Preview bridge:', err);
                        });
                      }, 100);
                    }
                  }}
                />
              </div>
            )}
            {activeRightPanel === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
                {/* Chat Messages Area */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {chatMessages.length === 0 ? (
                    <div style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#858585',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.6 }}>💬</div>
                      <div style={{ marginBottom: '8px', fontWeight: '500', color: '#cccccc' }}>
                        Starte eine Unterhaltung mit {AGENT_TYPES[currentAgent]?.name || 'dem AI Assistant'}
                    </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        Wähle einen Agent oder beginne direkt mit deiner Frage
                      </div>
                    </div>
                  ) : null}

                  {chatMessages.map((message, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 0',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: message.role === 'user' ? '#007acc' : '#4ecdc4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {message.role === 'user' ? (
                          <User size={18} color="#ffffff" />
                        ) : (
                          <Bot size={18} color="#ffffff" />
                        )}
                      </div>
                        <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}>
                        <div style={{
                          background: message.role === 'user' ? '#007acc' : '#2d2d30',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#ffffff',
                          lineHeight: '1.5',
                          border: message.role === 'user' ? 'none' : '1px solid #3c3c3c',
                          wordBreak: 'break-word',
                          overflow: 'auto',
                          position: 'relative'
                        }}>
                          {message.isStreaming && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#4ec9b0',
                              animation: 'pulse 1.5s ease-in-out infinite'
                            }} />
                          )}
                          {message.role === 'user' ? (
                            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                          ) : message.needsApproval && message.command ? (
                            // Terminal command approval UI (like Cursor)
                            <div>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const language = match ? match[1] : '';
                                    return !inline && match ? (
                                      <div style={{ position: 'relative', marginTop: '8px', marginBottom: '8px' }}>
                                        <SyntaxHighlighter
                                          style={vscDarkPlus}
                                          language={language}
                                          PreTag="div"
                                          {...props}
                                        >
                                          {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                      </div>
                                    ) : (
                                      <code className={className} {...props} style={{
                                        background: '#1e1e1e',
                                        padding: '2px 6px',
                                        borderRadius: '3px',
                          fontSize: '12px',
                                        fontFamily: 'monospace'
                        }}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  p: ({ children }) => <p style={{ marginBottom: '8px' }}>{children}</p>
                                }}
                              >
                          {message.content}
                              </ReactMarkdown>
                              <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid #3c3c3c'
                              }}>
                                <button
                                  onClick={() => executeApprovedCommand(message.command)}
                                  style={{
                                    padding: '6px 16px',
                                    background: '#007acc',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                  onMouseEnter={(e) => e.target.style.background = '#005a9e'}
                                  onMouseLeave={(e) => e.target.style.background = '#007acc'}
                                >
                                  <Play size={14} />
                                  Run
                                </button>
                                <button
                                  onClick={() => {
                                    // Remove approval message
                                    setChatMessages(prev => prev.filter((_, i) => {
                                      const msgIndex = prev.findIndex(m => m === message);
                                      return i !== msgIndex;
                                    }));
                                  }}
                                  style={{
                                    padding: '6px 16px',
                                    background: 'transparent',
                                    color: '#858585',
                                    border: '1px solid #3c3c3c',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = '#2d2d30';
                                    e.target.style.color = '#cccccc';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = '#858585';
                                  }}
                                >
                                  Skip
                                </button>
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : '';
                                  return !inline && match ? (
                                    <div style={{ position: 'relative', marginTop: '8px', marginBottom: '8px' }}>
                                      <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={language}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code className={className} {...props} style={{
                                      background: '#1e1e1e',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      fontSize: '12px',
                                      fontFamily: 'monospace'
                                    }}>
                                      {children}
                                    </code>
                                  );
                                },
                                p: ({ children }) => <p style={{ marginBottom: '8px' }}>{children}</p>,
                                h1: ({ children }) => <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', marginTop: '16px' }}>{children}</h1>,
                                h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', marginTop: '14px' }}>{children}</h2>,
                                h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', marginTop: '12px' }}>{children}</h3>,
                                ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ul>,
                                ol: ({ children }) => <ol style={{ marginLeft: '20px', marginBottom: '8px' }}>{children}</ol>,
                                li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                                blockquote: ({ children }) => (
                                  <blockquote style={{
                                    borderLeft: '3px solid #007acc',
                                    paddingLeft: '12px',
                                    marginLeft: '0',
                                    marginBottom: '8px',
                                    color: '#cccccc',
                                    fontStyle: 'italic'
                                  }}>
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#4ec9b0', textDecoration: 'underline' }}>
                                    {children}
                                  </a>
                                )
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#858585',
                          marginTop: '4px',
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {message.agent && (
                            <span style={{ 
                              padding: '2px 6px',
                              background: '#2d2d30',
                              borderRadius: '3px',
                              fontSize: '10px'
                            }}>
                              {AGENT_TYPES[message.agent]?.emoji} {AGENT_TYPES[message.agent]?.name || message.agent}
                            </span>
                          )}
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString('de-DE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      padding: '12px 0'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#4ecdc4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Bot size={18} color="#ffffff" />
                      </div>
                      <div style={{
                        background: '#2d2d30',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#858585',
                        border: '1px solid #3c3c3c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Tippt...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input - EXACT Cursor Layout (Textarea TOP, Buttons BOTTOM) */}
                <div style={{
                  padding: '12px',
                  background: '#1e1e1e',
                  borderTop: '1px solid #3c3c3c'
                }}>
                  {/* TOP: Textarea with Icons and Send Button - EXACT like image */}
                  <div style={{
                    position: 'relative',
                    background: '#1e1e1e',
                    borderRadius: '8px',
                    border: '1px solid #3c3c3c',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder={`Nachricht an ${AGENT_TYPES[currentAgent]?.name || 'AI Assistant'}...`}
                      disabled={isChatLoading}
                      rows={1}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#cccccc',
                        fontSize: '13px',
                        padding: '0',
                        resize: 'none',
                        maxHeight: '200px',
                        fontFamily: 'inherit',
                        lineHeight: '1.5',
                        minHeight: '24px'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                      }}
                    />
                    
                    {/* Icons: @, Globe, Image */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0
                    }}>
                      <button
                        onClick={() => {
                          setChatInput(prev => prev + '@');
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2d2d30'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        title="Mention (@)"
                      >
                        <AtSign size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setChatInput(prev => prev + ' [Web Search aktiviert]');
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2d2d30'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        title="Web Search aktivieren"
                      >
                        <Globe size={16} />
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        style={{
                          padding: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                      }}
                        onMouseEnter={(e) => e.target.style.background = '#2d2d30'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        title="Bild anhängen"
                      >
                        <Image size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (isRecording) {
                            // Stop recording
                            setIsRecording(false);
                            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                              mediaRecorderRef.current.stop();
                            }
                          } else {
                            // Start recording
                            try {
                              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                              const mediaRecorder = new MediaRecorder(stream);
                              const chunks = [];
                              
                              mediaRecorder.ondataavailable = (e) => {
                                if (e.data.size > 0) chunks.push(e.data);
                              };
                              
                              mediaRecorder.onstop = async () => {
                                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                                
                                // Send to backend for transcription
                                const formData = new FormData();
                                formData.append('file', audioBlob, 'audio.webm');
                                
                                try {
                                  const response = await fetch('http://localhost:8005/api/transcribe', {
                                    method: 'POST',
                                    body: formData
                                  });
                                  
                                  if (response.ok) {
                                    const data = await response.json();
                                    setChatInput(prev => prev + (prev ? ' ' : '') + data.text);
                                  }
                                } catch (error) {
                                  console.error('Transcription error:', error);
                                }
                                
                                // Stop all tracks
                                stream.getTracks().forEach(track => track.stop());
                              };
                              
                              mediaRecorder.start();
                              setIsRecording(true);
                              mediaRecorderRef.current = mediaRecorder;
                            } catch (error) {
                              console.error('Microphone access error:', error);
                              alert('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.');
                            }
                          }
                        }}
                        style={{
                          padding: '4px',
                          background: isRecording ? '#f85149' : 'transparent',
                          border: 'none',
                          color: isRecording ? '#ffffff' : '#858585',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isRecording) e.target.style.background = '#2d2d30';
                        }}
                        onMouseLeave={(e) => {
                          if (!isRecording) e.target.style.background = 'transparent';
                        }}
                        title={isRecording ? "Aufnahme stoppen" : "Sprach-Eingabe (Mikrofon)"}
                      >
                        <Mic size={16} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log('Image selected:', file.name);
                            setChatInput(prev => prev + ` [Bild: ${file.name}]`);
                          }
                        }}
                      />
                    </div>
                    
                    {/* Send Button - Top Right */}
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: chatInput.trim() && !isChatLoading 
                          ? '#007acc' 
                          : '#3c3c3c',
                        border: 'none',
                        color: '#ffffff',
                        cursor: chatInput.trim() && !isChatLoading ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        flexShrink: 0
                      }}
                      title="Nachricht senden (Enter)"
                      onMouseEnter={(e) => {
                        if (chatInput.trim() && !isChatLoading) {
                          e.target.style.background = '#005a9e';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (chatInput.trim() && !isChatLoading) {
                          e.target.style.background = '#007acc';
                        }
                      }}
                    >
                      {isChatLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ArrowUp size={16} />
                      )}
                    </button>
                  </div>
                  
                  {/* BOTTOM: Agent, Auto, Status - EXACT Cursor Style */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#858585'
                  }}>
                    {/* Left: Agent & Auto */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {/* Agent Button - mit Team Mode Toggle */}
                      <button
                        onClick={(e) => {
                          if (e.shiftKey) {
                            // Shift+Click = Team Mode toggle
                            setTeamMode(!teamMode);
                          } else {
                            // Normal Click = Agent wechseln
                            const agentIds = Object.keys(AGENT_TYPES);
                            const currentIndex = agentIds.indexOf(currentAgent);
                            const nextIndex = (currentIndex + 1) % agentIds.length;
                            setCurrentAgent(agentIds[nextIndex]);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          background: teamMode ? '#4ec9b0' : 'transparent',
                          border: teamMode ? '1px solid #4ec9b0' : 'none',
                          color: teamMode ? '#ffffff' : '#cccccc',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!teamMode) e.target.style.background = '#2d2d30';
                        }}
                        onMouseLeave={(e) => {
                          if (!teamMode) e.target.style.background = 'transparent';
                        }}
                        title={teamMode ? "Team Mode aktiv (Shift+Click zum Deaktivieren)" : "Agent wechseln (Shift+Click für Team Mode)"}
                      >
                        {teamMode ? (
                          <>
                            <span style={{ fontSize: '12px' }}>👥</span>
                            <span>Team ({teamAgents.length})</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '12px' }}>{AGENT_TYPES[currentAgent]?.emoji || '✨'}</span>
                            <span>{AGENT_TYPES[currentAgent]?.name || 'Agent'}</span>
                          </>
                        )}
                        <ChevronDown size={12} />
                      </button>
                      
                      {/* Team Mode Settings */}
                      {teamMode && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          marginBottom: '8px',
                          background: '#252526',
                          border: '1px solid #3c3c3c',
                          borderRadius: '8px',
                          padding: '12px',
                          minWidth: '280px',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                          <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: '#cccccc' }}>
                            👥 Team Collaboration
                          </div>
                          
                          {/* Agent Auswahl */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#858585', marginBottom: '6px' }}>
                              Agenten auswählen:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {Object.keys(AGENT_TYPES).map(agentId => (
                                <button
                                  key={agentId}
                                  onClick={() => {
                                    if (teamAgents.includes(agentId)) {
                                      setTeamAgents(prev => prev.filter(a => a !== agentId));
                                    } else {
                                      setTeamAgents(prev => [...prev, agentId]);
                                    }
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    background: teamAgents.includes(agentId) ? '#007acc' : '#2d2d30',
                                    border: teamAgents.includes(agentId) ? '1px solid #007acc' : '1px solid #3c3c3c',
                                    color: teamAgents.includes(agentId) ? '#ffffff' : '#cccccc',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {AGENT_TYPES[agentId]?.emoji} {AGENT_TYPES[agentId]?.name}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Collaboration Mode */}
                          <div>
                            <div style={{ fontSize: '11px', color: '#858585', marginBottom: '6px' }}>
                              Modus:
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {['parallel', 'sequential', 'consensus'].map(mode => (
                                <button
                                  key={mode}
                                  onClick={() => setTeamModeType(mode)}
                                  style={{
                                    padding: '4px 8px',
                                    background: teamModeType === mode ? '#007acc' : '#2d2d30',
                                    border: teamModeType === mode ? '1px solid #007acc' : '1px solid #3c3c3c',
                                    color: teamModeType === mode ? '#ffffff' : '#cccccc',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                  }}
                                >
                                  {mode === 'parallel' ? '⚡ Parallel' : mode === 'sequential' ? '➡️ Sequential' : '🤝 Consensus'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Auto Button - Toggle */}
                      <button
                        onClick={() => {
                          setAutoMode(!autoMode);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: autoMode ? '#007acc' : 'transparent',
                          border: autoMode ? '1px solid #007acc' : 'none',
                          color: autoMode ? '#ffffff' : '#cccccc',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '4px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!autoMode) e.target.style.background = '#2d2d30';
                        }}
                        onMouseLeave={(e) => {
                          if (!autoMode) e.target.style.background = 'transparent';
                        }}
                        title={autoMode ? "Auto Mode deaktivieren" : "Auto Mode aktivieren"}
                      >
                        <span>Auto</span>
                      </button>
                      
                      {/* Auto Dropdown - nur wenn aktiv */}
                      {autoMode && (
                      <div style={{ position: 'relative' }} data-auto-dropdown>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAutoDropdown(!showAutoDropdown);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#cccccc',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            borderRadius: '4px',
                            transition: 'background 0.2s',
                            fontWeight: autoMode ? '500' : 'normal'
                          }}
                          onMouseEnter={(e) => {
                            if (!autoMode) e.target.style.background = '#2d2d30';
                          }}
                          onMouseLeave={(e) => {
                            if (!autoMode) e.target.style.background = 'transparent';
                          }}
                          title="Auto-Modus (mit Unter-Optionen)"
                        >
                          <span>{autoModeType === 'auto' ? 'Auto' : autoModeType.toUpperCase()}</span>
                          {autoMode && <span style={{ fontSize: '10px' }}>✓</span>}
                          <ChevronDown size={12} />
                        </button>
                        
                        {/* Dropdown Menu - Auto, 1x, 2x, 3x */}
                        {showAutoDropdown && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              marginTop: '4px',
                              background: '#252526',
                              border: '1px solid #3c3c3c',
                              borderRadius: '4px',
                              minWidth: '120px',
                              zIndex: 1000,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                            }}>
                            {['auto', '1x', '2x', '3x'].map((mode) => (
                              <button
                                key={mode}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAutoModeType(mode);
                                  setAutoMode(true);
                                  setShowAutoDropdown(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px 12px',
                                  background: autoModeType === mode ? '#007acc' : 'transparent',
                                  border: 'none',
                                  color: autoModeType === mode ? '#ffffff' : '#cccccc',
                                  fontSize: '11px',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => {
                                  if (autoModeType !== mode) {
                                    e.target.style.background = '#2d2d30';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (autoModeType !== mode) {
                                    e.target.style.background = 'transparent';
                                  }
                                }}
                              >
                                <span>{mode === 'auto' ? 'Auto' : mode.toUpperCase()}</span>
                                {autoModeType === mode && <span>✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Right: Status Bar - Stop, Review, Commit, VibeAI Tab */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <button
                        onClick={() => {
                          setIsChatLoading(false);
                          console.log('⏹️ Stopped');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          fontSize: '11px',
                          padding: '2px 4px',
                          borderRadius: '2px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2d2d30';
                          e.target.style.color = '#cccccc';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#858585';
                        }}
                        title="Stop (Ctrl+C)"
                      >
                        Stop ^c
                      </button>
                      <button
                        onClick={onFindIssues}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          fontSize: '11px',
                          padding: '2px 4px',
                          borderRadius: '2px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2d2d30';
                          e.target.style.color = '#cccccc';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#858585';
                        }}
                        title="Find Issues"
                      >
                        Review
                      </button>
                      <button
                        onClick={handleCommit}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#858585',
                          cursor: 'pointer',
                          fontSize: '11px',
                          padding: '2px 4px',
                          borderRadius: '2px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#2d2d30';
                          e.target.style.color = '#cccccc';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#858585';
                        }}
                        title="Commit Changes"
                      >
                        Commit
                      </button>
                      <span style={{ 
                        color: '#007acc',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        VibeAI Tab
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
        </div>
      
      
  

      {/* Bottom Status Bar */}
      <div style={{
        height: '22px',
        background: '#007acc',
        borderTop: '1px solid #3c3c3c',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        fontSize: '11px',
        color: '#ffffff',
        justifyContent: 'flex-end'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>main*</span>
          <span>{projectId}</span>
          <span>{projectStats.errors || 0} {projectStats.warnings || 0} {projectStats.filesCount || 0} files to analyze</span>
        </div>
      </div>
      
      {/* Tutorial Guide System */}
      {showTutorial && (
        <TutorialGuide 
          projectId={projectId} 
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
}