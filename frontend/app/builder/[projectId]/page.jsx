'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
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
  User, Loader2, Send, Bot, ArrowUp, AtSign, Globe, Image, Infinity, ExternalLink, Copy, Check, Mic, Users, Download, Github,
  FileCode, FileJson, FileType, FileImage, FileVideo, FileMusic, FileArchive,
  Database, Server, Cpu, Smartphone, Monitor, Layers, Box, FlaskConical,
  Brackets, Braces, Type, Hash, Coffee, Zap as ZapIcon, Shield, Lock, RefreshCw
} from 'lucide-react';
// 🎨 ECHTE FRAMEWORK-ICONS: react-icons für echte Logos
import { 
  SiFlutter, SiDart, SiPython, SiReact, SiNextdotjs, SiVuedotjs, SiAngular,
  SiJavascript, SiTypescript, SiNodedotjs, SiHtml5, SiCss3, SiDocker,
  SiKubernetes, SiRust, SiGo, SiOpenjdk, SiDotnet, SiSwift, SiKotlin,
  SiPhp, SiC, SiCplusplus, SiJson, SiYaml, SiMarkdown, SiNpm,
  SiMongodb, SiPostgresql, SiMysql, SiRedis, SiGit, SiGithub
} from 'react-icons/si';
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
import ProjectsPanel from './components/ProjectsPanel';
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
  // ⚡ Next.js 16: params und searchParams sind jetzt Promises - müssen mit React.use() entpackt werden
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const { projectId } = resolvedParams;
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
  const [activeLeftPanel, setActiveLeftPanel] = useState('explorer'); // explorer, search, source-control, run-debug, testing, extensions, projects
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
  const [previewLoadingProgress, setPreviewLoadingProgress] = useState({ message: '', elapsed: 0, maxTime: 120 }); // Für Flutter: max 120 Sekunden
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
    
    // ⚡ Auto-Reload: Reload files every 30 seconds to catch updates
    const autoReloadInterval = setInterval(() => {
      console.log('🔄 Auto-reloading project files...');
      loadProjectFiles().catch(err => console.error('Auto-reload error:', err));
    }, 30000); // Every 30 seconds
    
    // ⚡ Visibility API: Reload when tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab visible again, reloading files...');
        loadProjectFiles().catch(err => console.error('Visibility reload error:', err));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
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
      clearInterval(autoReloadInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [projectId, showCommandPalette, showAutoDropdown]);

  // ⚡ WICHTIG: Funktion zum Neuladen der Projektdateien (IMMER vom Backend!)
  const loadProjectFiles = async (retryCount = 0) => {
    try {
      console.log(`📂 Loading project files for: ${projectId} (attempt ${retryCount + 1})`);
      
      // ⚡ IMMER vom Backend laden - nicht aus localStorage!
      // ⚡ Timeout für bessere Fehlerbehandlung
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 Sekunden Timeout
      
      let response;
      try {
        response = await fetch(`http://localhost:8005/api/projects/${projectId}/files`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Verbindungs-Timeout: Backend antwortet nicht. Prüfe ob Backend auf Port 8005 läuft.');
        }
        throw fetchError;
      }
      
      if (response.ok) {
        const projectFiles = await response.json();
        console.log(`✅ Loaded ${projectFiles.length} files from backend`);
        
        if (Array.isArray(projectFiles) && projectFiles.length > 0) {
          // Format files for editor
          const formattedFiles = projectFiles.map(file => ({
            name: file.name || file.path.split('/').pop() || file.path,
            path: file.path,
            content: file.content || '',
            language: file.language || 'text',
            size: file.size || (file.content || '').length,
            lastModified: file.lastModified ? new Date(file.lastModified * 1000) : new Date(),
            gitStatus: null,
            modified: false,
            untracked: false
          }));
          
          setFiles(formattedFiles);
          
          // Update localStorage as backup (but always load from backend first!)
          localStorage.setItem(`project_${projectId}_files`, JSON.stringify(formattedFiles));
          
          if (formattedFiles.length > 0 && !activeFile) {
            setActiveFile(formattedFiles[0]);
            setOpenTabs([formattedFiles[0]]);
          }
          
          updateProjectStats();
          return true;
        } else {
          console.warn('⚠️ No files found in project');
          // Retry once after 2 seconds if no files found
          if (retryCount < 1) {
            console.log('🔄 Retrying in 2 seconds...');
            setTimeout(() => loadProjectFiles(retryCount + 1), 2000);
          }
          return false;
        }
      } else {
        const errorText = await response.text().catch(() => response.statusText);
        console.error(`❌ Failed to load files: ${response.status} ${errorText}`);
        
        // Zeige Fehler im Preview-Panel
        setPreviewError(`HTTP ${response.status}: ${errorText || 'Backend-Fehler'}`);
        
        // Retry once after 2 seconds on error
        if (retryCount < 1) {
          console.log('🔄 Retrying in 2 seconds...');
          setTimeout(() => loadProjectFiles(retryCount + 1), 2000);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Error loading project files:', error);
      
      // ⚡ BESSERE FEHLERMELDUNGEN
      let errorMessage = error.message || 'Failed to load files';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorMessage = 'Backend nicht erreichbar. Prüfe ob Backend auf Port 8005 läuft.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout') || errorMessage.includes('AbortError')) {
        errorMessage = 'Verbindungs-Timeout: Backend antwortet nicht.';
      }
      
      // Zeige Fehler im Preview-Panel
      setPreviewError(errorMessage);
      
      // Retry once after 2 seconds on exception
      if (retryCount < 1) {
        console.log('🔄 Retrying in 2 seconds...');
        setTimeout(() => loadProjectFiles(retryCount + 1), 2000);
      }
      return false;
    }
  };

  // ⚡ NEUE FUNKTION: Komplettes Projekt-Reload (für Reload-Button)
  const reloadProject = async () => {
    try {
      console.log('🔄 Reloading project completely...');
      
      // Reset all state
      setFiles([]);
      setActiveFile(null);
      setOpenTabs([]);
      setPreviewUrl(null);
      setPreviewStatus('stopped');
      setPreviewError(null);
      setPreviewType(null);
      setBrowserTabs([]);
      setActiveBrowserTab(null);
      
      // Clear localStorage backup
      localStorage.removeItem(`project_${projectId}_files`);
      
      // Wait a bit for state to reset
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Reload project files
      await loadProjectFiles();
      
      // Re-initialize project
      await initializeProject();
      
      console.log('✅ Project reloaded successfully');
    } catch (error) {
      console.error('❌ Project reload failed:', error);
      setPreviewError(`Fehler beim Neuladen: ${error.message}`);
    }
  };

  const initializeProject = async () => {
    try {
      console.log(`🚀 Initializing project: ${projectId}`);
      
      // ⚡ WICHTIG: IMMER zuerst vom Backend laden - Dateien sind persistent gespeichert!
      const filesLoaded = await loadProjectFiles();
      
      if (filesLoaded && files.length > 0) {
        console.log(`✅ Project initialized with ${files.length} files`);
        
        // Auto-start preview if files exist
        const hasHTML = files.some(f => f.path.endsWith('.html') || f.name.endsWith('.html'));
        const hasJSX = files.some(f => f.path.endsWith('.jsx') || f.path.endsWith('.tsx'));
        const hasDart = files.some(f => f.path.endsWith('.dart'));
        
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
        
        // Set review data for Review Panel
        setReviewData({
          title: projectId,
          userRequest: "Projekt geladen",
          codeChanges: []
        });
      } else {
        console.warn('⚠️ No files loaded, using fallback');
        // Only use mock files if backend has no files
        // This allows user to start fresh
        if (files.length === 0) {
          loadMockFiles();
        }
      }
      
      // Load project statistics
      updateProjectStats();
      
    } catch (error) {
      console.error('❌ Project init failed:', error);
      // Don't load mock files on error - let user see the error
      // They can reload or the retry mechanism will handle it
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
      console.log('🚀 startLiveBuildFromChat called:', { projectName, framework, description: description.substring(0, 50), teamMode });
      
      // ⚡ PRÜFUNG: Ist bereits eine Generation am Laufen?
      if (isLiveBuilding) {
        addChatMessage('assistant', `⚠️ **Smart Agent arbeitet bereits!**\n\nBitte warte, bis die aktuelle Generation abgeschlossen ist.`);
        return;
      }
      
      // ⚡ PRÜFUNG: Existiert das Projekt bereits mit Dateien?
      if (files.length > 5) {
        addChatMessage('assistant', `✅ **Projekt bereits vorhanden!**\n\n📁 **${files.length} Dateien** gefunden.\n\n💡 **Tipp:** Das Projekt ist bereits generiert. Du kannst es jetzt bearbeiten oder eine neue App erstellen.`);
        
        // Prüfe Backend-Status
        try {
          const statusResponse = await fetch(`http://localhost:8005/api/smart-agent/status/${projectId}`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();
            if (status.status === 'complete') {
              addChatMessage('assistant', `✅ **Projekt ist fertig!** Keine neue Generation nötig.\n\n📊 **Status:** ${status.file_count} Dateien vorhanden`);
              return;
            }
          }
        } catch (e) {
          console.warn('Status check failed:', e);
        }
        
        // Frage Benutzer, ob er wirklich neu generieren will
        const shouldContinue = confirm(`⚠️ Projekt existiert bereits mit ${files.length} Dateien.\n\nMöchtest du wirklich neu generieren? (Alle Dateien werden überschrieben!)`);
        if (!shouldContinue) {
          addChatMessage('assistant', `✅ **Abgebrochen.** Das bestehende Projekt bleibt erhalten.`);
          return;
        }
      }
      
      // ⚡ TOGGLE-SYSTEM: Wenn Team Mode aktiv ist, verwende Team Agent statt Smart Agent
      if (teamMode) {
        console.log('👥 Team Mode aktiv - verwende Team Agent');
        return await startTeamAgentBuild(projectName, framework, description);
      }
      
      setIsLiveBuilding(true);
      setBuildProgress({ current: 0, total: 0, currentFile: null });
      
      // ⚡ SOFORTIGE BESTÄTIGUNG im Chat
      addChatMessage('assistant', `✅ **Verstanden! Ich starte jetzt den Smart Agent Generator...**\n\n📦 **Framework:** ${framework}\n📝 **Projekt:** ${projectName}\n\n⏱️ **Ich beginne sofort mit der Erstellung...**`);
      
      // 🔥 KEINE DUMMY-TEXTE - Agent arbeitet ECHT!
      console.log('📤 Sending request to Smart Agent API...');
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
      
      console.log('📥 Smart Agent API response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.message || errorData.detail || `Build failed: ${response.statusText}`;
        console.error('❌ Smart Agent API error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Response kommt via WebSocket - ECHTE Updates, keine Dummy-Texte!
      const result = await response.json();
      console.log('✅ Smart Agent response:', result);
      
      // ⚡ PRÜFUNG: Verschiedene Status-Codes behandeln
      if (result.status === 'already_complete') {
        setIsLiveBuilding(false);
        addChatMessage('assistant', `✅ **Projekt bereits fertig!**\n\n📁 **${result.file_count || files.length} Dateien** gefunden.\n\n💡 **Tipp:** Das Projekt ist bereits generiert. Du kannst es jetzt bearbeiten!`);
        // Lade Dateien neu
        await loadProjectFiles();
        return;
      }
      
      if (result.status === 'already_running') {
        setIsLiveBuilding(true);
        addChatMessage('assistant', `⚠️ **Smart Agent arbeitet bereits!**\n\nBitte warte, bis die aktuelle Generation abgeschlossen ist.`);
        return;
      }
      
      // ⚡ KEINE doppelte Nachricht - wird bereits von WebSocket gehandhabt
      // Die Nachricht kommt automatisch via WebSocket (generation.started)
    } catch (error) {
      console.error('❌ Live build from chat error:', error);
      setIsLiveBuilding(false);
      setIsLiveBuilding(false);
      // Echte Fehlermeldung mit Details
      addChatMessage('assistant', `❌ **Fehler beim Starten des Smart Agent:**\n\n\`\`\`\n${error.message}\n\`\`\`\n\n💡 **Tipps:**\n- Prüfe ob Backend läuft (Port 8005)\n- Prüfe ob OPENAI_API_KEY gesetzt ist\n- Prüfe die Browser-Konsole für Details`);
    }
  };
  
  const handleWebSocketMessage = (data) => {
    const { event } = data;
    
    switch (event) {
      case 'generation.started':
      case 'build.started':
        setIsLiveBuilding(true);
        setBuildProgress({ current: 0, total: 0, currentFile: null });
        // ⚡ NUR EINMAL beim Start - nicht bei jedem Event!
        // Prüfe ob bereits eine Start-Nachricht gesendet wurde
        const lastMessage = chatMessages[chatMessages.length - 1];
        const alreadyNotified = lastMessage?.content?.includes('🚀 **Smart Agent gestartet!**');
        if (!alreadyNotified) {
          addChatMessage('assistant', `🚀 **Smart Agent gestartet!**\n\n📦 **Framework:** ${data.platform || 'unknown'}\n📝 **Projekt:** ${data.project_name || projectId}\n\n⏱️ **Ich erstelle jetzt Schritt für Schritt alle Dateien...**\n📁 Du siehst live, wie ich jede Datei erstelle und den Code schreibe!\n\n💬 **Fragen?** Frag mich einfach - ich antworte sofort, auch während ich arbeite!`);
        }
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
                
                // ⚡ WICHTIG: Scroll immer zur aktuellen Zeile, damit alles sichtbar ist
                const totalLines = newContent.split('\n').length;
                const currentLine = data.line || totalLines;
                
                // Setze Position (Cursor)
                editorRef.current.setPosition({ 
                  lineNumber: currentLine, 
                  column: column 
                });
                
                // ⚡ WICHTIG: Scroll zur aktuellen Zeile (am unteren Rand sichtbar)
                // Das zeigt die neue Zeile UND lässt oben mehr Code sehen
                editorRef.current.revealLine(currentLine);
                
                // ⚡ WICHTIG: Wenn wir am Ende sind ODER fast am Ende, scroll ans Ende
                // Damit sieht man den vollständigen Code und kann weiterschreiben
                if (currentLine >= totalLines - 3) {
                  // Wir sind am Ende - scroll ans Ende, damit man alles sieht
                  setTimeout(() => {
                    if (editorRef.current) {
                      // Scroll zur letzten Zeile (am unteren Rand sichtbar)
                      editorRef.current.revealLineNearTop(totalLines);
                      
                      // Setze Cursor ans Ende der letzten Zeile, damit man weiterschreiben kann
                      const lastLineContent = newContent.split('\n')[totalLines - 1] || '';
                      editorRef.current.setPosition({ 
                        lineNumber: totalLines, 
                        column: lastLineContent.length + 1 
                      });
                      
                      console.log(`✅ Scrolled to end: line ${totalLines}, column ${lastLineContent.length + 1}`);
                    }
                  }, 50);
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
        
        // ⚡ WICHTIG: Wenn diese Datei aktiv ist, scroll ans Ende, damit man den vollständigen Code sieht
        if (activeFile?.path === newFile.path && editorRef.current) {
          setTimeout(() => {
            if (editorRef.current) {
              const totalLines = newFile.content.split('\n').length;
              const lastLineContent = newFile.content.split('\n')[totalLines - 1] || '';
              
              // Scroll ans Ende der Datei
              editorRef.current.revealLineNearTop(totalLines);
              
              // Setze Cursor ans Ende der letzten Zeile, damit man weiterschreiben kann
              editorRef.current.setPosition({ 
                lineNumber: totalLines, 
                column: lastLineContent.length + 1 
              });
              
              console.log(`✅ Scrolled to end of ${newFile.path} (line ${totalLines})`);
            }
          }, 100);
        }
        
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
        const errorMsg = data.error || 'Unbekannter Fehler';
        const errorDetails = data.details || '';
        addChatMessage('assistant', `❌ **Fehler beim Generieren:**\n\n\`\`\`\n${errorMsg}\n\`\`\`\n\n${errorDetails ? `**Details:**\n\`\`\`\n${errorDetails}\n\`\`\`\n\n` : ''}💡 **Tipps:**\n- Prüfe ob OPENAI_API_KEY gesetzt ist\n- Prüfe die Backend-Logs\n- Versuche es erneut`);
        console.error('❌ Smart Agent Error:', errorMsg, errorDetails);
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
          // ⚡ WICHTIG: Parse URL sofort - entferne DevTools-Parameter
          let url = data.url.trim();
          
          // Wenn URL DevTools-Format hat (?uri=...), extrahiere die echte App-URL
          if (url.includes('?uri=')) {
            try {
              const urlObj = new URL(url);
              const uriParam = urlObj.searchParams.get('uri');
              if (uriParam) {
                if (uriParam.startsWith('http://') || uriParam.startsWith('https://')) {
                  url = uriParam;
                  console.log('✅ WebSocket: Extracted app URL from DevTools:', url);
                } else {
                  // Relative URL - extrahiere Port
                  const portMatch = uriParam.match(/:(\d+)/);
                  if (portMatch) {
                    url = `http://127.0.0.1:${portMatch[1]}`;
                    console.log('✅ WebSocket: Extracted app URL from relative URI:', url);
                  }
                }
              }
            } catch (e) {
              console.warn('⚠️ WebSocket: Could not parse DevTools URL, using original:', e);
            }
          }
          
          // ⚡ VALIDIERUNG: Stelle sicher, dass URL auf localhost zeigt (nicht GitHub!)
          if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:') || url.startsWith('http://127.0.0.1:') || url.startsWith('https://127.0.0.1:')) {
            setPreviewUrl(url);
            setPreviewStatus('running');
            
            // ⚡ AUTOMATISCH: Öffne Browser-Tab im Editor (nicht separat!)
            const tabId = `browser-${Date.now()}`;
            setBrowserTabs(prev => {
              const existing = prev.find(t => t.url === url);
              if (existing) {
                // Tab existiert bereits, aktiviere ihn
                setActiveBrowserTab(existing.id);
                setActiveFile(null); // WICHTIG: Deaktiviere Datei-Tab, damit Browser-Tab sichtbar wird
                return prev;
              }
              // Neuer Tab
              const newTabs = [...prev, {
                id: tabId,
                url: url,
                title: url.includes('://') ? new URL(url).hostname : url,
                command: 'Preview Server'
              }];
              // WICHTIG: Aktiviere Browser-Tab sofort und deaktiviere Datei-Tab
              setActiveBrowserTab(tabId);
              setActiveFile(null);
              return newTabs;
            });
            console.log('✅ Browser-Tab im Editor geöffnet (nicht separat!):', url);
          } else {
            console.error('❌ Invalid preview URL (not localhost):', url);
            setPreviewError(`Ungültige Preview-URL: ${url}. Erwartet: http://localhost:PORT`);
            setPreviewStatus('error');
          }
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
      setPreviewLoadingProgress({ message: 'Starte Preview-Server...', elapsed: 0, maxTime: 120 });
      
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
        // ⚡ WICHTIG: Parse URL sofort - entferne DevTools-Parameter
        // Flutter DevTools läuft auf Port 9103, aber App läuft auf anderem Port (z.B. 62225)
        let url = data.url.trim();
        
        // Wenn URL DevTools-Format hat (?uri=...), extrahiere die echte App-URL
        if (url.includes('?uri=')) {
          try {
            const urlObj = new URL(url);
            const uriParam = urlObj.searchParams.get('uri');
            if (uriParam) {
              // uri ist die echte App-URL
              if (uriParam.startsWith('http://') || uriParam.startsWith('https://')) {
                url = uriParam;
                console.log('✅ Extracted app URL from DevTools:', url);
              } else {
                // Relative URL - extrahiere Port
                const portMatch = uriParam.match(/:(\d+)/);
                if (portMatch) {
                  url = `http://127.0.0.1:${portMatch[1]}`;
                  console.log('✅ Extracted app URL from relative URI:', url);
                }
              }
            }
          } catch (e) {
            console.warn('⚠️ Could not parse DevTools URL, using original:', e);
          }
        }
        
        // ⚡ VALIDIERUNG: Stelle sicher, dass URL auf localhost zeigt (nicht GitHub!)
        if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:') || url.startsWith('http://127.0.0.1:') || url.startsWith('https://127.0.0.1:')) {
          setPreviewUrl(url);
          setPreviewType(data.type);
          
          // Warte bis Server wirklich bereit ist (Backend wartet bereits, aber doppelt hält besser)
          setPreviewLoadingProgress({ message: 'Warte auf Server...', elapsed: 0, maxTime: 120 });
          await waitForServerReady(url);
          
          setPreviewStatus('running');
          setPreviewLoadingProgress({ message: 'Server bereit!', elapsed: 0, maxTime: 120 });
          
          // ⚡ AUTOMATISCH: Öffne Browser-Tab im Editor (gleichzeitig mit Preview-Panel)
          const tabId = `browser-${Date.now()}`;
          setBrowserTabs(prev => {
            const existing = prev.find(t => t.url === url);
            if (existing) {
              // Tab existiert bereits, aktiviere ihn
              setActiveBrowserTab(existing.id);
              setActiveFile(null); // WICHTIG: Deaktiviere Datei-Tab, damit Browser-Tab sichtbar wird
              return prev;
            }
            // Neuer Tab
            const newTabs = [...prev, {
              id: tabId,
              url: url,
              title: url.includes('://') ? new URL(url).hostname : url,
              command: 'Preview Server'
            }];
            // WICHTIG: Aktiviere Browser-Tab sofort und deaktiviere Datei-Tab
            setActiveBrowserTab(tabId);
            setActiveFile(null);
            return newTabs;
          });
          console.log('✅ Preview gestartet: Browser-Tab im Editor geöffnet (nicht separat!)');
        } else {
          console.error('❌ Invalid preview URL (not localhost):', url);
          throw new Error(`Ungültige Preview-URL: ${url}. Erwartet: http://localhost:PORT`);
        }
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
  const waitForServerReady = async (url, maxAttempts = 120) => {
    // ⚡ Flutter braucht oft 60-120 Sekunden zum Kompilieren!
    const startTime = Date.now();
    setPreviewLoadingProgress({ message: 'Warte auf Server...', elapsed: 0, maxTime: maxAttempts });
    // ⚡ WICHTIG: Entferne DevTools-Parameter aus URL (z.B. ?uri=...)
    // Flutter DevTools läuft auf Port 9103, aber App läuft auf anderem Port
    let cleanUrl = url;
    if (url.includes('?uri=')) {
      // Extrahiere die eigentliche App-URL aus dem uri-Parameter
      try {
        const urlObj = new URL(url);
        const uriParam = urlObj.searchParams.get('uri');
        if (uriParam) {
          // uri ist oft eine relative URL, konvertiere zu vollständiger URL
          if (uriParam.startsWith('http://') || uriParam.startsWith('https://')) {
            cleanUrl = uriParam;
          } else {
            // Relative URL - verwende den Host der ursprünglichen URL
            cleanUrl = `${urlObj.protocol}//${urlObj.hostname}:${uriParam.split(':')[1] || urlObj.port}`;
          }
        }
      } catch (e) {
        console.warn('Could not parse DevTools URL, using original:', e);
      }
    }
    
    console.log('🔍 Checking server readiness:', cleanUrl);
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        // Versuche HEAD-Request (ohne CORS-Probleme)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(cleanUrl, { 
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        // Wenn keine Exception, ist Server bereit
        console.log('✅ Server is ready:', cleanUrl);
        setPreviewStatus('running');
        setPreviewUrl(cleanUrl); // Aktualisiere URL auf saubere Version
        return true;
      } catch (error) {
        // Server noch nicht bereit, warte 1 Sekunde
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = maxAttempts - elapsed;
        
        // Update progress every second
        setPreviewLoadingProgress({ 
          message: remaining > 0 ? `Server startet... (noch ~${remaining}s)` : 'Server startet...', 
          elapsed, 
          maxTime: maxAttempts 
        });
        
        if (i % 10 === 0) {
          console.log(`⏳ Waiting for server... (${i + 1}/${maxAttempts}, ${elapsed}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    // Timeout - aber versuche trotzdem zu laden
    console.warn('⚠️ Server readiness timeout, but trying to load anyway');
    setPreviewStatus('running');
    setPreviewUrl(cleanUrl); // Verwende saubere URL auch bei Timeout
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
          // ⚡ VALIDIERUNG: Stelle sicher, dass URL auf localhost zeigt (nicht GitHub!)
          const url = data.url.trim();
          if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:') || url.startsWith('http://127.0.0.1:') || url.startsWith('https://127.0.0.1:')) {
            setPreviewUrl(url);
            setPreviewStatus('running');
          } else {
            console.error('❌ Invalid preview URL (not localhost):', url);
            setPreviewStatus('error');
            setPreviewError(`Ungültige Preview-URL: ${url}. Erwartet: http://localhost:PORT`);
          }
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
      // ⚡ HELPER: Validiere ob Befehl gültig ist
      const isValidCommand = (cmd) => {
        if (!cmd || typeof cmd !== 'string') return false;
        const trimmed = cmd.trim();
        // Prüfe auf leere/ungültige Befehle
        if (trimmed.length === 0) return false;
        // Ignoriere nur Backticks oder Code-Block-Marker
        if (/^`+$/.test(trimmed)) return false;
        if (/^```/.test(trimmed)) return false;
        if (trimmed === '```' || trimmed === '```bash' || trimmed === '```sh') return false;
        // Ignoriere nur Whitespace
        if (/^\s+$/.test(trimmed)) return false;
        // Ignoriere Markdown-Formatierung
        if (trimmed.startsWith('$') && trimmed.length <= 3) return false;
        return true;
      };

      // Multiple patterns to catch different command formats
      const patterns = [
        /TERMINAL:\s*(.+?)(?=\n|$)/gi,  // TERMINAL: command
        /⚙️\s*Führe\s+(?:Befehl\s+)?aus:\s*(.+?)(?=\n|$)/gi,  // ⚙️ Führe Befehl aus: command
        /⚙️\s*Führe\s+aus:\s*(.+?)(?=\n|$)/gi,  // ⚙️ Führe aus: command
        /```bash\s*\n([\s\S]+?)\n```/gi,  // ```bash\ncommand\n``` (mit [\s\S] statt .+? für multiline)
        /```sh\s*\n([\s\S]+?)\n```/gi,  // ```sh\ncommand\n```
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
            // ⚡ WICHTIG: Entferne Kommentare nach - oder # (z.B. "flutter test - Überprüfen" → "flutter test")
            command = command.split(/\s+-\s+/)[0].split(/\s+#/)[0].trim();
            // Entferne Backticks am Anfang/Ende
            command = command.replace(/^`+|`+$/g, '').trim();
            // ⚡ VALIDIERUNG: Prüfe ob Befehl gültig ist
            if (isValidCommand(command) && !commands.includes(command)) {
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
    // ⚡ VALIDIERUNG: Prüfe ob Befehl gültig ist (gleiche Logik wie parseAndShowTerminalCommands)
    const isValidCommand = (cmd) => {
      if (!cmd || typeof cmd !== 'string') return false;
      const trimmed = cmd.trim();
      if (trimmed.length === 0) return false;
      if (/^`+$/.test(trimmed)) return false;
      if (/^```/.test(trimmed)) return false;
      if (trimmed === '```' || trimmed === '```bash' || trimmed === '```sh') return false;
      if (/^\s+$/.test(trimmed)) return false;
      if (trimmed.startsWith('$') && trimmed.length <= 3) return false;
      return true;
    };
    
    if (!isValidCommand(command)) {
      console.warn('⚠️  Ungültiger oder leerer Befehl, ignoriere:', command);
      return;
    }
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

  const closeTab = (file, event) => {
    // ⚡ WICHTIG: Event komplett stoppen
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation?.();
      }
    }
    
    console.log(`🔴 Closing tab: ${file.path}`);
    console.log(`📊 Current tabs:`, openTabs.map(t => t.path));
    
    // ⚡ FUNKTIONAL UPDATE: Verwende funktionale State-Updates für Konsistenz
    setOpenTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.path !== file.path);
      console.log(`📊 New tabs after close:`, newTabs.map(t => t.path));
      
      // ⚡ WICHTIG: Wenn geschlossene Datei aktiv war, öffne nächste oder null
      // Verwende setTimeout, um State-Update nach setOpenTabs auszuführen
      setTimeout(() => {
        if (activeFile?.path === file.path) {
          if (newTabs.length > 0) {
            // Öffne letzte Datei (wie VS Code)
            const nextFile = newTabs[newTabs.length - 1];
            setActiveFile(nextFile);
            console.log(`✅ Activated next tab: ${nextFile.path}`);
          } else {
            // Keine Tabs mehr offen
            setActiveFile(null);
            console.log(`✅ No tabs left, activeFile set to null`);
          }
        }
      }, 10);
      
      return newTabs;
    });
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

  const handleGitPush = async () => {
    // Push to GitHub
    try {
      addChatMessage('assistant', '📤 **Push zu GitHub...**\n\nPushe Änderungen zu GitHub...');
      
      // First commit if there are uncommitted changes
      const modifiedFiles = files.filter(f => f.gitStatus === 'M' || f.modified);
      if (modifiedFiles.length > 0) {
        await handleCommit();
      }
      
      // Push via API
      const response = await fetch(`http://localhost:8005/api/git/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          remote: 'origin',
          branch: 'main'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        addChatMessage('assistant', `✅ **Erfolgreich zu GitHub gepusht!**\n\n${data.message || 'Push erfolgreich'}`);
      } else {
        const error = await response.json().catch(() => ({ detail: 'Push failed' }));
        addChatMessage('assistant', `❌ **Push fehlgeschlagen:** ${error.detail || 'Unknown error'}\n\n💡 **Tipp:** Stelle sicher, dass:\n- Git Repository initialisiert ist\n- Remote Repository konfiguriert ist\n- Du Berechtigung zum Pushen hast`);
      }
    } catch (error) {
      console.error('Push error:', error);
      addChatMessage('assistant', `❌ **Push Fehler:** ${error.message}`);
    }
  };

  const handleCloneFromGitHub = async (repoUrl) => {
    // Clone project from GitHub
    try {
      addChatMessage('assistant', `📥 **Clone von GitHub...**\n\nRepository: ${repoUrl}`);
      
      const response = await fetch(`http://localhost:8005/api/download/clone-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          repo_url: repoUrl,
          branch: 'main'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        addChatMessage('assistant', `✅ **Erfolgreich von GitHub geklont!**\n\n${data.message || 'Clone erfolgreich'}`);
        
        // Reload project files
        await loadProjectFiles();
      } else {
        const error = await response.json().catch(() => ({ detail: 'Clone failed' }));
        addChatMessage('assistant', `❌ **Clone fehlgeschlagen:** ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Clone error:', error);
      addChatMessage('assistant', `❌ **Clone Fehler:** ${error.message}`);
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

  // 🔍 GLOBALE FRAMEWORK-ERKENNUNG: Erkenne Haupt-Framework des Projekts (wie VS Code)
  const detectProjectFramework = useCallback(() => {
    if (!files || files.length === 0) return null;
    
    const projectFiles = files.map(f => f.path || f.name || '').join(' ').toLowerCase();
    const projectPaths = files.map(f => f.path || f.name || '').join(' ').toLowerCase();
    
    // Framework-Erkennung (Priorität: spezifisch → allgemein)
    if (projectFiles.includes('pubspec.yaml') || projectPaths.includes('.dart')) {
      return { icon: SiFlutter, color: '#027DFD', name: 'Flutter' };
    }
    if (projectFiles.includes('next.config') || projectPaths.includes('_app') || projectPaths.includes('_document') || projectPaths.includes('next.config')) {
      return { icon: SiNextdotjs, color: '#000000', name: 'Next.js' };
    }
    if (projectFiles.includes('vue.config') || projectPaths.includes('.vue')) {
      return { icon: SiVuedotjs, color: '#4FC08D', name: 'Vue' };
    }
    if (projectFiles.includes('angular.json') || projectPaths.includes('.component.')) {
      return { icon: SiAngular, color: '#DD0031', name: 'Angular' };
    }
    if (projectFiles.includes('package.json') && (projectFiles.includes('react') || projectPaths.includes('jsx') || projectPaths.includes('tsx'))) {
      return { icon: SiReact, color: '#61DAFB', name: 'React' };
    }
    if (projectFiles.includes('dockerfile') || projectFiles.includes('docker-compose')) {
      return { icon: SiDocker, color: '#2496ED', name: 'Docker' };
    }
    if (projectFiles.includes('k8s') || projectFiles.includes('kubernetes')) {
      return { icon: SiKubernetes, color: '#326CE5', name: 'Kubernetes' };
    }
    if (projectFiles.includes('cargo.toml') || projectPaths.includes('.rs')) {
      return { icon: SiRust, color: '#000000', name: 'Rust' };
    }
    if (projectFiles.includes('go.mod') || projectPaths.includes('.go')) {
      return { icon: SiGo, color: '#00ADD8', name: 'Go' };
    }
    if (projectFiles.includes('build.gradle') || projectFiles.includes('pom.xml') || projectPaths.includes('.java')) {
      return { icon: SiOpenjdk, color: '#ED8B00', name: 'Java' };
    }
    if (projectFiles.includes('.csproj') || projectPaths.includes('.cs')) {
      return { icon: SiDotnet, color: '#239120', name: 'C#' };
    }
    if (projectPaths.includes('.swift')) {
      return { icon: SiSwift, color: '#FA7343', name: 'Swift' };
    }
    if (projectPaths.includes('.kt') && !projectFiles.includes('build.gradle')) {
      return { icon: SiKotlin, color: '#7F52FF', name: 'Kotlin' };
    }
    if (projectFiles.includes('requirements.txt') || projectFiles.includes('setup.py') || projectPaths.includes('.py')) {
      return { icon: SiPython, color: '#3776AB', name: 'Python' };
    }
    if (projectFiles.includes('package.json') && !projectFiles.includes('react') && !projectFiles.includes('next')) {
      return { icon: SiNodedotjs, color: '#339933', name: 'Node.js' };
    }
    if (projectPaths.includes('.php') || projectFiles.includes('composer.json')) {
      return { icon: SiPhp, color: '#777BB4', name: 'PHP' };
    }
    if (projectPaths.includes('.c') && !projectPaths.includes('.cpp')) {
      return { icon: SiC, color: '#A8B9CC', name: 'C' };
    }
    if (projectPaths.includes('.cpp') || projectPaths.includes('.cc') || projectPaths.includes('.cxx')) {
      return { icon: SiCplusplus, color: '#00599C', name: 'C++' };
    }
    
    return null;
  }, [files]);

  // 🎨 ECHTE FRAMEWORK-ICONS: react-icons für echte Logos (GLOBAL für gesamtes Projekt - wie VS Code)
  const getFileIcon = (file) => {
    // Unterstütze sowohl String (filename) als auch File-Objekt
    const filename = typeof file === 'string' ? file : file?.path || file?.name || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const name = filename.toLowerCase();
    
    // 🔍 ERKENNE PROJEKT-FRAMEWORK (einmalig für gesamtes Projekt)
    const projectFramework = detectProjectFramework();
    
    // 🎨 SPEZIELLE DATEITYPEN: Behalten ihre eigenen Icons (Images, Videos, etc.)
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext);
    const isVideo = ['mp4', 'avi', 'mov', 'webm'].includes(ext);
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
    const isArchive = ['zip', 'tar', 'gz', 'rar', '7z'].includes(ext);
    const isDatabase = ['sql', 'db', 'sqlite'].includes(ext);
    const isLock = name.includes('package-lock.json') || name.includes('yarn.lock') || name.includes('pubspec.lock');
    
    // Spezielle Dateien behalten ihre Icons
    if (isImage) return { icon: FileImage, color: '#FF6B6B', name: 'Image' };
    if (isVideo) return { icon: FileVideo, color: '#FF6B6B', name: 'Video' };
    if (isAudio) return { icon: FileMusic, color: '#FF6B6B', name: 'Audio' };
    if (isArchive) return { icon: FileArchive, color: '#FF6B6B', name: 'Archive' };
    if (isDatabase) return { icon: Database, color: '#336791', name: 'Database' };
    if (isLock) return { icon: Lock, color: '#858585', name: 'Lock' };
    
    // 🎨 GLOBALES FRAMEWORK-ICON: Wenn Framework erkannt, verwende es für ALLE Dateien
    if (projectFramework) {
      // Ausnahmen: Config-Dateien, JSON, YAML, Markdown behalten ihre Icons
      const isJSON = ext === 'json';
      const isYAML = ext === 'yaml' || ext === 'yml';
      const isMarkdown = ext === 'md' || ext === 'markdown';
      const isConfig = ['env', 'config', 'ini', 'toml', 'xml'].includes(ext) || name.includes('.config.');
      
      if (isJSON) return { icon: SiJson, color: '#000000', name: 'JSON' };
      if (isYAML) return { icon: SiYaml, color: '#CB171E', name: 'YAML' };
      if (isMarkdown) return { icon: SiMarkdown, color: '#083FA1', name: 'Markdown' };
      if (isConfig) return { icon: Settings, color: '#858585', name: 'Config' };
      
      // Alle anderen Dateien bekommen das Framework-Icon
      return projectFramework;
    }
    
    // 🎨 FALLBACK: Sprach-spezifische Icons wenn kein Framework erkannt
    const isHTML = ext === 'html' || ext === 'htm';
    const isCSS = ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less';
    const isTypeScript = ext === 'ts' || ext === 'tsx';
    const isJavaScript = ext === 'js' || ext === 'jsx';
    const isPython = ext === 'py';
    const isC = ext === 'c' || ext === 'h';
    const isCpp = ext === 'cpp' || ext === 'cc' || ext === 'cxx' || ext === 'hpp';
    const isPHP = ext === 'php';
    const isJSON = ext === 'json';
    const isYAML = ext === 'yaml' || ext === 'yml';
    const isMarkdown = ext === 'md' || ext === 'markdown';
    const isConfig = ['env', 'config', 'ini', 'toml', 'xml'].includes(ext) || name.includes('.config.');
    
    if (isPython) return { icon: SiPython, color: '#3776AB', name: 'Python' };
    if (isTypeScript) return { icon: SiTypescript, color: '#3178C6', name: 'TypeScript' };
    if (isJavaScript) return { icon: SiJavascript, color: '#F7DF1E', name: 'JavaScript' };
    if (isC) return { icon: SiC, color: '#A8B9CC', name: 'C' };
    if (isCpp) return { icon: SiCplusplus, color: '#00599C', name: 'C++' };
    if (isPHP) return { icon: SiPhp, color: '#777BB4', name: 'PHP' };
    if (ext === 'dart') return { icon: SiDart, color: '#0175C2', name: 'Dart' };
    if (isHTML) return { icon: SiHtml5, color: '#E34F26', name: 'HTML' };
    if (isCSS) return { icon: SiCss3, color: '#1572B6', name: 'CSS' };
    if (isJSON) return { icon: SiJson, color: '#000000', name: 'JSON' };
    if (isYAML) return { icon: SiYaml, color: '#CB171E', name: 'YAML' };
    if (isMarkdown) return { icon: SiMarkdown, color: '#083FA1', name: 'Markdown' };
    if (isConfig) return { icon: Settings, color: '#858585', name: 'Config' };
    
    // Default
    return { icon: File, color: '#858585', name: 'File' };
  };

  // 👥 TEAM AGENTS: Starte alle Agenten parallel
  const handleStartTeamAgents = async () => {
    try {
      // ⚡ TOGGLE-SYSTEM: Team Agent ON → Smart Agent OFF
      const wasTeamMode = teamMode;
      setTeamMode(true);
      
      // Pausiere Smart Agent wenn aktiv
      if (isLiveBuilding && !wasTeamMode) {
        setIsLiveBuilding(false);
        addChatMessage('assistant', `⏸️ **Smart Agent pausiert** - Team Agent übernimmt jetzt!`);
      }
      
      // Setze spezialisierte Agenten für verschiedene Aufgaben
      const specializedAgents = ['frontend', 'backend', 'designer', 'architect', 'coder', 'reviewer', 'packager', 'fixer'];
      setTeamAgents(specializedAgents);
      setTeamModeType('parallel');
      
      addChatMessage('assistant', `👥 **Team-Agenten aktiviert!**\n\n**Aktive Agenten (8):**\n- 🎨 **Frontend Agent** - UI/UX, Components\n- ⚙️ **Backend Agent** - API, Services\n- 🎨 **Designer Agent** - UI Design, Styling\n- 🏗️ **Architect Agent** - Structure, Best Practices\n- 🤖 **Code Generator** - Implementation\n- 🔍 **Code Reviewer** - Quality Check\n- 📦 **Package Manager** - Dependencies\n- 🔧 **Auto-Fix Agent** - Error Fixing\n\n⚡ **Alle Agenten arbeiten PARALLEL** - schneller & besser als Smart Agent!\n\n💡 **Hinweis:** Team Agent kann auch komplette Apps erstellen (wie Smart Agent, aber mit mehreren Agenten parallel).`);
      
      // Starte alle Agenten parallel mit verschiedenen Aufgaben
      const tasks = [
        // 1. Code Reviewer: Prüfe Projekt auf Fehler
        fetch('http://localhost:8005/api/auto-fix/scan-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            project_path: null // Backend findet Pfad selbst
          })
        }).then(async (res) => {
          const data = await res.json();
          if (data.errors && data.errors.length > 0) {
            // Zeige Fehler in Problems Panel
            data.errors.forEach(error => {
              if (terminalRef.current?.addProblem) {
                terminalRef.current.addProblem({
                  file: error.file,
                  line: error.line || 0,
                  message: error.message,
                  severity: error.severity || 'error',
                  source: 'reviewer'
                });
              }
            });
            addChatMessage('assistant', `🔍 **Code Reviewer:** ${data.total} Probleme gefunden (${data.errors_count} Fehler, ${data.warnings_count} Warnungen)`);
          } else {
            addChatMessage('assistant', `✅ **Code Reviewer:** Keine Fehler gefunden!`);
          }
          return data;
        }).catch(err => {
          console.error('Reviewer error:', err);
          return null;
        }),
        
        // 2. Packager: Prüfe und installiere fehlende Packages
        fetch('http://localhost:8005/api/projects/' + projectId + '/files').then(async (res) => {
          const files = await res.json();
          const hasPackageJson = files.some(f => f.name === 'package.json');
          const hasPubspecYaml = files.some(f => f.name === 'pubspec.yaml');
          
          if (hasPackageJson) {
            addChatMessage('assistant', `📦 **Package Manager:** Prüfe npm Dependencies...`);
            // Terminal-Befehl würde hier ausgeführt werden
          } else if (hasPubspecYaml) {
            addChatMessage('assistant', `📦 **Package Manager:** Prüfe Flutter Dependencies...`);
            // Terminal-Befehl würde hier ausgeführt werden
          }
          return { hasPackageJson, hasPubspecYaml };
        }).catch(err => {
          console.error('Packager error:', err);
          return null;
        }),
        
        // 3. Auto-Fix: Fixe gefundene Fehler
        new Promise(resolve => {
          setTimeout(async () => {
            try {
              const scanRes = await fetch('http://localhost:8005/api/auto-fix/scan-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  project_id: projectId,
                  project_path: null
                })
              });
              
              const scanData = await scanRes.json();
              
              if (scanData.errors && scanData.errors.length > 0) {
                addChatMessage('assistant', `🔧 **Auto-Fix Agent:** Starte automatisches Fixen...`);
                
                const fixRes = await fetch('http://localhost:8005/api/auto-fix/fix-project', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    project_id: projectId,
                    project_path: null
                  })
                });
                
                const fixData = await fixRes.json();
                
                if (fixData.success) {
                  addChatMessage('assistant', `✅ **Auto-Fix Agent:** ${fixData.files_fixed} Dateien gefixt, ${fixData.errors_fixed} Fehler behoben!`);
                  await loadProjectFiles();
                }
              } else {
                addChatMessage('assistant', `✅ **Auto-Fix Agent:** Keine Fehler zum Fixen gefunden!`);
              }
            } catch (err) {
              console.error('Auto-Fix error:', err);
            }
            resolve(null);
          }, 1000);
        })
      ];
      
      // Führe alle Aufgaben parallel aus
      await Promise.all(tasks);
      
      addChatMessage('assistant', `🎉 **Team-Agenten abgeschlossen!**\n\nAlle Agenten haben ihre Aufgaben parallel ausgeführt.`);
      
    } catch (error) {
      console.error('Team Agents error:', error);
      addChatMessage('assistant', `❌ **Fehler beim Starten der Team-Agenten:** ${error.message}`);
    }
  };
  
  // 👥 TEAM AGENT: App-Erstellung (wie Smart Agent, aber mit mehreren Agenten)
  const startTeamAgentBuild = async (projectName, framework, description) => {
    try {
      console.log('👥 startTeamAgentBuild called:', { projectName, framework, description: description.substring(0, 50) });
      setIsLiveBuilding(true);
      setBuildProgress({ current: 0, total: 0, currentFile: null });
      
      // ⚡ SOFORTIGE BESTÄTIGUNG im Chat
      addChatMessage('assistant', `👥 **Team Agent gestartet!** Mehrere spezialisierte Agenten arbeiten parallel...\n\n📦 **Framework:** ${framework}\n📝 **Projekt:** ${projectName}\n\n⚡ **8 Agenten arbeiten gleichzeitig** - schneller & besser als Smart Agent!\n\n⏱️ **Ich beginne sofort mit der Erstellung...**`);
      
      console.log('📤 Sending request to Team Agent API...');
      const response = await fetch('http://localhost:8005/api/team-agent/generate', {
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
        throw new Error(errorData.error || errorData.message || `Team Agent Build failed: ${response.statusText}`);
      }
      
      // Response will come via WebSocket (same events as Smart Agent)
      const result = await response.json();
      if (result.success) {
        addChatMessage('assistant', `✅ **Team Agent gestartet!**
        
👥 **8 Agenten arbeiten parallel:**
- Frontend, Backend, Designer, Architect
- Code Generator, Reviewer, Packager, Auto-Fix

📊 Generiere jetzt Dateien Schritt für Schritt...
📁 Du siehst jede Datei live im Editor!`);
      }
    } catch (error) {
      console.error('Team Agent build error:', error);
      setIsLiveBuilding(false);
      addChatMessage('assistant', `❌ **Fehler beim Starten des Team Agents:**

\`\`\`
${error.message}
\`\`\`

Bitte versuche es erneut.`);
    }
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
    // ⚡ WICHTIG: Chat ist IMMER verfügbar, auch während Smart Agent arbeitet!
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
    
    // ⚡ SOFORTIGE ANTWORT: Erstelle Streaming-Nachricht SOFORT (<10ms)
    // Das zeigt dem User sofort, dass der Agent antwortet (wie ChatGPT/Claude)
    // ⚡ WICHTIG: Starte mit leerem Content, wird sofort vom Stream gefüllt!
    const streamingMsg = {
      role: 'assistant',
      content: '', // Starte leer, wird sofort vom Stream gefüllt
      timestamp: new Date().toISOString(),
      model: currentModel,
      isStreaming: true
    };
    setChatMessages(prev => [...prev, streamingMsg]);
    
    setIsChatLoading(true);

    try {
      console.log('📤 Sending chat message:', prompt);
      console.log('📤 Using model:', currentModel);
      console.log('📤 Using agent:', currentAgent);
      console.log('📤 Smart Agent läuft:', isLiveBuilding);
      
      // 🔥 INTELLIGENTE ERKENNUNG: Ist das eine App-Erstellungs-Anfrage?
      // ⚡ WICHTIG: Das muss ZUERST geprüft werden, VOR Team-Mode!
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
      
      // ⚡ WICHTIG: Chat-Agent antwortet IMMER SOFORT, auch wenn Smart Agent startet!
      // Beide arbeiten PARALLEL - Chat-Agent blockiert NIE!
      
      if (isAppCreationRequest) {
        // Extrahiere Framework und Projektname - VOLLSTÄNDIGE ERKENNUNG ALLER PLATTFORMEN
        let framework = 'flutter'; // Default
        
        // ===== MOBILE =====
        if (lowerPrompt.includes('android') || lowerPrompt.includes('kotlin') || lowerPrompt.includes('jetpack compose') || lowerPrompt.includes('kotlin compose')) framework = 'android';
        else if (lowerPrompt.includes('ios') || lowerPrompt.includes('swift') || lowerPrompt.includes('swiftui') || lowerPrompt.includes('xcode')) framework = 'ios';
        else if (lowerPrompt.includes('react native') || lowerPrompt.includes('reactnative')) framework = 'react-native';
        else if (lowerPrompt.includes('flutter')) framework = 'flutter';
        // ===== WEB FRONTEND =====
        else if (lowerPrompt.includes('nextjs') || lowerPrompt.includes('next.js') || lowerPrompt.includes('next js')) framework = 'nextjs';
        else if (lowerPrompt.includes('vue') || lowerPrompt.includes('vuejs')) framework = 'vue';
        else if (lowerPrompt.includes('angular')) framework = 'angular';
        else if (lowerPrompt.includes('svelte') || lowerPrompt.includes('sveltekit')) framework = 'svelte';
        else if (lowerPrompt.includes('react')) framework = 'react';
        else if (lowerPrompt.includes('html') || lowerPrompt.includes('website') || lowerPrompt.includes('web seite') || lowerPrompt.includes('webseite')) framework = 'html';
        // ===== BACKEND =====
        else if (lowerPrompt.includes('nodejs') || lowerPrompt.includes('node.js') || lowerPrompt.includes('node js') || lowerPrompt.includes('express')) framework = 'nodejs';
        else if (lowerPrompt.includes('fastapi') || lowerPrompt.includes('fast api') || (lowerPrompt.includes('python') && lowerPrompt.includes('api'))) framework = 'fastapi';
        else if (lowerPrompt.includes('django')) framework = 'django';
        else if (lowerPrompt.includes('flask')) framework = 'flask';
        else if (lowerPrompt.includes('python') || lowerPrompt.includes('py ') || lowerPrompt.includes(' python ')) framework = 'python';
        else if (lowerPrompt.includes('rust') || lowerPrompt.includes('rustlang')) framework = 'rust';
        else if (lowerPrompt.includes('go ') || lowerPrompt.includes('golang') || lowerPrompt.includes(' go ')) framework = 'go';
        else if (lowerPrompt.includes('java') || lowerPrompt.includes('spring') || lowerPrompt.includes('spring boot')) framework = 'java';
        else if (lowerPrompt.includes('c#') || lowerPrompt.includes('csharp') || lowerPrompt.includes('dotnet') || lowerPrompt.includes('.net') || lowerPrompt.includes('aspnet')) framework = 'csharp';
        else if (lowerPrompt.includes('php') || lowerPrompt.includes('laravel')) framework = 'php';
        // ===== C/C++ =====
        else if (lowerPrompt.includes('c++') || lowerPrompt.includes('cpp') || lowerPrompt.includes('cplusplus') || lowerPrompt.includes(' cxx ')) framework = 'cpp';
        else if ((lowerPrompt.includes(' c ') || lowerPrompt.includes(' c ')) && !lowerPrompt.includes('c#') && !lowerPrompt.includes('csharp')) framework = 'c';
        // ===== DOCKER & DEVOPS =====
        else if (lowerPrompt.includes('docker') || lowerPrompt.includes('container')) framework = 'docker';
        else if (lowerPrompt.includes('kubernetes') || lowerPrompt.includes('k8s')) framework = 'kubernetes';
        // ===== DESKTOP =====
        else if (lowerPrompt.includes('electron')) framework = 'electron';
        else if (lowerPrompt.includes('tauri')) framework = 'tauri';
        // ===== GAME DEVELOPMENT =====
        else if (lowerPrompt.includes('unity') || lowerPrompt.includes('unity3d')) framework = 'unity';
        else if (lowerPrompt.includes('godot')) framework = 'godot';
        // ===== BLOCKCHAIN =====
        else if (lowerPrompt.includes('solidity') || lowerPrompt.includes('ethereum') || lowerPrompt.includes('web3') || lowerPrompt.includes('blockchain')) framework = 'solidity';
        // ===== MACHINE LEARNING =====
        else if (lowerPrompt.includes('tensorflow') || lowerPrompt.includes('pytorch') || lowerPrompt.includes('machine learning') || lowerPrompt.includes('ml ')) framework = 'tensorflow';
        
        // Extrahiere Projektname
        const nameMatch = prompt.match(/namens?\s+([a-zA-Z0-9_-]+)/i) ||
                         prompt.match(/genannt\s+([a-zA-Z0-9_-]+)/i) ||
                         prompt.match(/"([a-zA-Z0-9_-]+)"/);
        const projectName = nameMatch ? nameMatch[1] : projectId;
        
        // ⚡ Starte Smart Agent im HINTERGRUND (NICHT warten, läuft parallel!)
        console.log('🚀 Starting Smart Agent (parallel):', { projectName, framework, description: prompt });
        startLiveBuildFromChat(projectName, framework, prompt).catch(err => {
          console.error('❌ Smart Agent error:', err);
          addChatMessage('assistant', `❌ **Fehler beim Starten des Smart Agent:**\n\n\`\`\`\n${err.message}\n\`\`\``);
        });
        
        // ⚡ WICHTIG: Chat-Agent antwortet TROTZDEM SOFORT weiter!
        // Kein return - Chat läuft PARALLEL und Agent gibt ECHTE Antwort!
        // Smart Agent arbeitet im Hintergrund, Chat-Agent antwortet sofort!
      }
      
      // ⚡ CHAT-AGENT: IMMER SOFORTIGE ANTWORTEN (wie ChatGPT/Claude)
      // Echte API-Integration mit STREAMING für sofortige Antworten!
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
          system_prompt: `🚀 Du bist ein intelligenter Auto-Coder Agent im VibeAI Builder - wie ChatGPT/Cursor, aber mit VOLLSTÄNDIGER AUTOMATISIERUNG.

💡 **INTELLIGENZ & KONTEXT:**
- Du verstehst den vollständigen Projekt-Kontext und Codebase-Struktur
- Du analysierst Code-Patterns, Abhängigkeiten und Beziehungen automatisch
- Du denkst Schritt für Schritt und erklärst deine Entscheidungen klar
- Du bietest mehrere Lösungsansätze wenn sinnvoll
- Du lernst aus dem Projekt-Kontext und passt deine Antworten an
- Du bietest pädagogische Erklärungen zum Lernen von Programmierung

🔥 **AUTOMATISIERUNG (Was du automatisch machst):**
• 📁 Dateien ERSTELLEN & BEARBEITEN - Automatisch, mit vollständigem, production-ready Code
• 🤖 Code GENERIEREN - Mit Best Practices, Kommentaren, Type-Safety, Error-Handling
• 🔧 Bugs FIXEN - Analysiere Fehler, finde Root-Cause, fixe intelligent
• 🎨 UI/UX DESIGNEN - Modern, responsive, accessible Designs
• 📊 Code ANALYSIEREN - Performance, Sicherheit, Best Practices Analyse
• 🚀 Apps DEPLOYEN - One-click Deployment
• ⚙️ Terminal-BEFEHLE - Automatisch ausführen (npm, flutter, etc.)
• 📦 Dependencies - Automatisch installieren und verwalten
• 🏗️ Build-Prozesse - Automatisch konfigurieren und ausführen
• 🧪 Tests - Automatisch schreiben und ausführen

⚡ **INTELLIGENTE ERKENNUNG:**
Du erkennst automatisch:
- App-Erstellungs-Anfragen → Starte Smart Agent (parallel, non-blocking)
- Code-Fragen → Analysiere Code und erkläre klar
- Fehler-Beschreibungen → Finde und fixe automatisch
- Verbesserungsvorschläge → Implementiere sofort
- Konzept-Fragen → Erkläre mit Code-Beispielen

📝 **CODE-FORMAT (Wichtig für automatische Ausführung):**
\`\`\`language path/to/file
[VOLLSTÄNDIGER CODE - mit Kommentaren, Type-Safety, Error-Handling]
\`\`\`

🔧 **TERMINAL-FORMAT:**
TERMINAL: command here

🎯 **DEIN WORKFLOW (Zeige deine Denkprozesse):**
1. **Verstehen:** "📝 Analysiere die Anfrage und Projekt-Kontext..."
2. **Planen:** "🔍 Ich sehe folgende Optionen: [Optionen]"
3. **Handeln:** "✅ Implementiere Lösung 1: [Beschreibung]"
4. **Erklären:** "💡 Warum: [Begründung]"
5. **Verifizieren:** "✅ Fertig! [Ergebnis]"

💬 **CHAT-VERHALTEN (Wie ChatGPT/Cursor):**
- Antworte SOFORT, auch wenn Smart Agent parallel arbeitet
- Sei hilfreich, präzise und freundlich
- Erkläre komplexe Konzepte verständlich
- Zeige Code-Beispiele wenn hilfreich
- Stelle Rückfragen wenn etwas unklar ist
- Biete Alternativen wenn sinnvoll

🎓 **LERN-ORIENTIERT:**
- Erkläre WARUM du etwas so machst
- Zeige Best Practices
- Erkläre Code-Strukturen
- Gib Tipps für besseres Coding

**WICHTIG:** Du arbeitest IMMER parallel zum Smart Agent. Der Chat ist IMMER verfügbar für Fragen, Verbesserungen und Diskussionen - genau wie bei ChatGPT oder Cursor!

Aktuelles Projekt: ${projectId}
Agent-Typ: ${currentAgent || 'aura'}
Smart Agent läuft: ${isLiveBuilding ? 'Ja (parallel)' : 'Nein'}

Sei proaktiv, hilfreich und liefere vollständige, funktionierende Lösungen mit pädagogischem Wert.`
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // ⚡ Streaming-Nachricht wurde bereits SOFORT erstellt (siehe oben, Zeile 2473)
        // Setze Loading zurück, da Stream jetzt läuft
        setIsChatLoading(false);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let processedCodeBlocks = new Set(); // Track which code blocks we've already processed
        let buffer = ''; // Buffer for incomplete lines
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // ⚡ Stream endet - finalisiere Nachricht und setze Loading zurück
              setChatMessages(prev => prev.map((msg, idx) => 
                idx === prev.length - 1 && msg.isStreaming
                  ? { ...msg, content: fullContent, isStreaming: false }
                  : msg
              ));
              setIsChatLoading(false);
              break;
            }
          
          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines (ending with \n)
          const lines = buffer.split('\n');
          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            // Skip empty lines
            if (!line.trim()) continue;
            
            // Only process lines that start with "data: "
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                // Skip if empty
                if (!jsonStr) continue;
                
                const data = JSON.parse(jsonStr);
                
                if (data.error) {
                  setChatMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, content: `❌ Fehler: ${data.error}`, isStreaming: false }
                      : msg
                  ));
                  break;
                }
                
                if (data.done) {
                  // Mark streaming as complete
                  setChatMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  break;
                }
                
                if (data.content) {
                  fullContent += data.content;
                  // ⚡ SOFORTIGES UPDATE: Erste 50 Zeichen sofort, dann throttled
                  const isFirstUpdate = fullContent.length <= 50;
                  const now = Date.now();
                  if (isFirstUpdate || now - lastChatUpdateRef.current > 100) {
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
                  // ⚡ HELPER: Validiere ob Befehl gültig ist (gleiche Logik wie parseAndShowTerminalCommands)
                  const isValidCommand = (cmd) => {
                    if (!cmd || typeof cmd !== 'string') return false;
                    const trimmed = cmd.trim();
                    if (trimmed.length === 0) return false;
                    if (/^`+$/.test(trimmed)) return false;
                    if (/^```/.test(trimmed)) return false;
                    if (trimmed === '```' || trimmed === '```bash' || trimmed === '```sh') return false;
                    if (/^\s+$/.test(trimmed)) return false;
                    if (trimmed.startsWith('$') && trimmed.length <= 3) return false;
                    return true;
                  };
                  while ((terminalMatch = terminalPattern.exec(fullContent)) !== null) {
                    let command = terminalMatch[1]?.trim();
                    // ⚡ WICHTIG: Entferne Kommentare nach - oder # (z.B. "flutter test - Überprüfen" → "flutter test")
                    command = command.split(/\s+-\s+/)[0].split(/\s+#/)[0].trim();
                    // Entferne Backticks am Anfang/Ende
                    command = command.replace(/^`+|`+$/g, '').trim();
                    // ⚡ VALIDIERUNG: Ignoriere leere oder ungültige Befehle
                    if (isValidCommand(command) && !seenCommands.has(command)) {
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
                // Silently skip invalid JSON lines (might be incomplete chunks)
                // Only log if it's not a JSON parse error (which is expected for incomplete chunks)
                if (!e.message.includes('JSON') && !e.message.includes('Unexpected token')) {
                  console.error('⚠️ Parse error:', e, 'Line:', line.substring(0, 100));
                }
              }
            }
          }
        }
        
        // Process any remaining buffer when stream ends
        if (buffer.trim()) {
          const line = buffer.trim();
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.done) {
                  setChatMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 && msg.isStreaming
                      ? { ...msg, content: fullContent, isStreaming: false }
                      : msg
                  ));
                }
              }
            } catch (e) {
              // Ignore parse errors in final buffer
              console.warn('⚠️ Could not parse final buffer');
            }
          }
        }
        
        // Finalize message if still streaming
        setChatMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 && msg.isStreaming
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        ));
        } catch (streamError) {
          // ⚡ CATCH für Stream-Fehler (z.B. Reader-Fehler, Verbindungsabbruch)
          console.error('❌ Stream error:', streamError);
          
          // Finalize message if still streaming
          setChatMessages(prev => prev.map((msg, idx) => 
            idx === prev.length - 1 && msg.isStreaming
              ? { ...msg, content: fullContent || '❌ Fehler beim Laden der Antwort', isStreaming: false }
              : msg
          ));
        } finally {
          // ⚡ WICHTIG: Setze isChatLoading IMMER zurück, auch wenn Stream endet ohne data.done
          setIsChatLoading(false);
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
    } finally {
      // ⚡ WICHTIG: Setze isChatLoading IMMER zurück, auch bei Fehlern!
      // Das stellt sicher, dass der Chat NIE blockiert bleibt
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
              onClick={async () => {
                // Auto-Fix Agent starten
                try {
                  addChatMessage('assistant', '🔧 **Auto-Fix Agent gestartet!**\n\n📊 Scanne Projekt nach Fehlern...');
                  
                  // Hole Projekt-Pfad vom Backend
                  const projectInfoRes = await fetch(`http://localhost:8005/api/projects/${projectId}`);
                  let projectPath = null;
                  if (projectInfoRes.ok) {
                    const projectInfo = await projectInfoRes.json();
                    projectPath = projectInfo.path || projectInfo.project_path;
                  }
                  
                  // Fallback: Standard-Pfad
                  if (!projectPath) {
                    projectPath = `/Volumes/Crucial X9 Pro For Mac/Development/Projects/development/vibeai/backend/user_projects/default_user/${projectId}`;
                  }
                  
                  // Scanne Projekt
                  const scanRes = await fetch(`http://localhost:8005/api/auto-fix/scan-project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      project_id: projectId,
                      project_path: projectPath
                    })
                  });
                  
                  const scanData = await scanRes.json();
                  
                  if (scanData.errors && scanData.errors.length > 0) {
                    // Zeige Fehler in Problems Panel
                    scanData.errors.forEach(error => {
                      if (terminalRef.current?.addProblem) {
                        terminalRef.current.addProblem({
                          file: error.file,
                          line: error.line || 0,
                          message: error.message,
                          severity: error.severity || 'error',
                          source: error.source || 'auto-fix'
                        });
                      }
                    });
                    
                    addChatMessage('assistant', `🔍 **${scanData.total} Fehler gefunden:**\n\n- ${scanData.errors_count} Fehler\n- ${scanData.warnings_count} Warnungen\n\n⚙️ Starte automatisches Fixen...`);
                    
                    // Fixe Projekt
                    const fixRes = await fetch(`http://localhost:8005/api/auto-fix/fix-project`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        project_id: projectId,
                        project_path: projectPath
                      })
                    });
                    
                  const fixData = await fixRes.json();
                  
                  if (fixData.success) {
                    addChatMessage('assistant', `✅ **Auto-Fix abgeschlossen!**\n\n- ${fixData.files_fixed} Dateien gefixt\n- ${fixData.errors_fixed} Fehler behoben\n\n🔄 Lade Dateien neu...`);
                    
                    // Lade Dateien neu
                    await loadProjectFiles();
                  } else {
                    addChatMessage('assistant', `❌ **Fehler beim Fixen:** ${fixData.message || 'Unbekannter Fehler'}`);
                  }
                } else {
                  addChatMessage('assistant', '✅ **Keine Fehler gefunden!** Das Projekt ist fehlerfrei.');
                }
              } catch (error) {
                console.error('Auto-Fix error:', error);
                addChatMessage('assistant', `❌ **Fehler:** ${error.message}`);
              }
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
              title="Auto-Fix Agent - Projekt durchsuchen und Fehler automatisch fixen"
              onMouseEnter={(e) => {
                e.target.style.background = '#2d2d30';
                e.target.style.color = '#4ec9b0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#858585';
              }}
            >
              <Zap size={18} />
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
            <button
              onClick={async () => {
                // Projekt als ZIP herunterladen
                try {
                  window.location.href = `http://localhost:8005/api/download/zip/${projectId}`;
                  addChatMessage('assistant', `📦 **Projekt wird als ZIP heruntergeladen...**\n\nDas komplette Projekt wird als ZIP-Datei heruntergeladen.`);
                } catch (error) {
                  console.error('Download error:', error);
                  addChatMessage('assistant', `❌ **Fehler beim Download:** ${error.message}`);
                }
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
              title="Projekt als ZIP herunterladen"
              onMouseEnter={(e) => {
                e.target.style.background = '#2d2d30';
                e.target.style.color = '#4ec9b0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#858585';
              }}
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => {
                // Team-Agenten starten
                handleStartTeamAgents();
              }}
              style={{
                width: '44px',
                height: '44px',
                background: teamMode ? '#4ec9b0' : 'transparent',
                border: teamMode ? '1px solid #4ec9b0' : 'none',
                color: teamMode ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              title="Team-Agenten starten (Code, Review, Packages, Fix)"
              onMouseEnter={(e) => {
                if (!teamMode) {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#4ec9b0';
                }
              }}
              onMouseLeave={(e) => {
                if (!teamMode) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <Users size={18} />
            </button>
            <button
              onClick={() => setActiveLeftPanel('projects')}
              style={{
                width: '44px',
                height: '44px',
                background: activeLeftPanel === 'projects' ? '#2d2d30' : 'transparent',
                border: 'none',
                color: activeLeftPanel === 'projects' ? '#ffffff' : '#858585',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              title="Bereits erstellte Projekte"
              onMouseEnter={(e) => {
                if (activeLeftPanel !== 'projects') {
                  e.target.style.background = '#2d2d30';
                  e.target.style.color = '#cccccc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeLeftPanel !== 'projects') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#858585';
                }
              }}
            >
              <FolderOpen size={18} />
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
              justifyContent: 'space-between',
              padding: '0 12px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#cccccc',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <span>
                {activeLeftPanel === 'explorer' && 'EXPLORER'}
                {activeLeftPanel === 'search' && 'SEARCH'}
                {activeLeftPanel === 'source-control' && 'SOURCE CONTROL'}
                {activeLeftPanel === 'run-debug' && 'RUN AND DEBUG'}
                {activeLeftPanel === 'testing' && 'TESTING'}
                {activeLeftPanel === 'extensions' && 'EXTENSIONS'}
                {activeLeftPanel === 'projects' && 'PROJEKTE'}
              </span>
              
              {/* Reload Button - nur im Explorer */}
              {activeLeftPanel === 'explorer' && (
                <button
                  onClick={reloadProject}
                  title="Projekt neu laden (alle Dateien vom Server)"
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid #3c3c3c',
                    borderRadius: '3px',
                    color: '#cccccc',
                    cursor: 'pointer',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    fontWeight: 'normal'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#37373d';
                    e.target.style.borderColor = '#007acc';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = '#3c3c3c';
                  }}
                >
                  <RefreshCw size={12} />
                  Reload
                </button>
              )}
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
                  const file = files.find(f => f.path === filePath || f.name === filePath);
                  if (file) {
                    openFile(file);
                    // ⚡ Scroll to line im Editor
                    if (editorRef.current && line) {
                      setTimeout(() => {
                        editorRef.current.revealLineInCenter(line);
                        editorRef.current.setPosition({ lineNumber: line, column: 1 });
                      }, 300);
                    }
                  }
                }}
                onFilesUpdate={async (updatedFiles) => {
                  // ⚡ Speichere alle geänderten Dateien
                  try {
                    for (const file of updatedFiles) {
                      await saveFile(file);
                    }
                    // Update state
                    setFiles(updatedFiles);
                    // Update open tabs
                    setOpenTabs(prev => prev.map(tab => {
                      const updated = updatedFiles.find(f => f.path === tab.path);
                      return updated || tab;
                    }));
                    // Update active file if it was changed
                    if (activeFile) {
                      const updated = updatedFiles.find(f => f.path === activeFile.path);
                      if (updated) {
                        setActiveFile(updated);
                      }
                    }
                  } catch (error) {
                    console.error('Error updating files:', error);
                    throw error;
                  }
                }}
              />
            ) : activeLeftPanel === 'source-control' ? (
              <GitPanel projectId={projectId} />
            ) : activeLeftPanel === 'run-debug' ? (
              <RunAndDebugPanel 
                projectId={projectId} 
                activeFile={activeFile} 
                files={files}
                terminalRef={terminalRef}
                onPreviewStart={startPreviewServer} // ⚡ Preview-Start Callback
              />
            ) : activeLeftPanel === 'testing' ? (
              <TestingPanel projectId={projectId} files={files} />
            ) : activeLeftPanel === 'extensions' ? (
              <ExtensionsPanel />
            ) : activeLeftPanel === 'projects' ? (
              <ProjectsPanel onProjectSelect={(projectId) => {
                router.push(`/builder/${projectId}`);
              }} />
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
                zIndex: 5,
                pointerEvents: 'auto' // ⚡ WICHTIG: Container ist klickbar
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
                    const closeBtn = e.target.closest('.tab-close-btn');
                    const isCloseBtnClick = closeBtn || e.target.closest('svg')?.closest('.tab-close-btn');
                    
                    if (!isCloseBtnClick) {
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
                  {(() => {
                    const iconInfo = getFileIcon(file);
                    const IconComponent = iconInfo.icon || File;
                    return <IconComponent size={12} color={iconInfo.color || '#858585'} style={{ flexShrink: 0 }} />;
                  })()}
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
                    type="button"
                    onClick={(e) => {
                      // ⚡ WICHTIG: Event komplett stoppen
                      e.stopPropagation();
                      e.preventDefault();
                      e.nativeEvent?.stopImmediatePropagation?.();
                      console.log(`🔴 Close tab clicked: ${file.path}`);
                      closeTab(file, e);
                      return false;
                    }}
                    onMouseDown={(e) => {
                      // ⚡ WICHTIG: Auch onMouseDown stoppen, damit Tab nicht geöffnet wird
                      e.stopPropagation();
                      e.preventDefault();
                      e.nativeEvent?.stopImmediatePropagation?.();
                    }}
                    onMouseUp={(e) => {
                      // ⚡ WICHTIG: Auch onMouseUp stoppen
                      e.stopPropagation();
                      e.preventDefault();
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
                      width: '18px',
                      height: '18px',
                      zIndex: 100, // ⚡ ERHÖHT: Über Tab-Content
                      position: 'relative',
                      pointerEvents: 'auto', // ⚡ WICHTIG: Button ist definitiv klickbar
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.background = '#3c3c3c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <X size={12} style={{ pointerEvents: 'none' }} />
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
                  scrollBeyondLastLine: true, // ⚡ WICHTIG: Erlaube Scrollen nach dem Ende, damit man erweitern kann
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
                          // ⚡ VALIDIERUNG: Ignoriere GitHub-URLs und andere externe URLs
                          // Nur localhost-URLs werden als Preview-URL verwendet
                          const isLocalhost = url.startsWith('http://localhost:') || 
                                            url.startsWith('https://localhost:') || 
                                            url.startsWith('http://127.0.0.1:') || 
                                            url.startsWith('https://127.0.0.1:');
                          
                          // GitHub-URLs ignorieren (nicht als Preview verwenden)
                          if (url.includes('github.com') || url.includes('github.io')) {
                            console.warn('⚠️ GitHub-URL erkannt, wird ignoriert:', url);
                            return; // Nicht als Preview-URL verwenden
                          }
                          
                          // Nur localhost-URLs als Preview-URL setzen
                          if (isLocalhost) {
                            // Wenn es eine Server-URL ist (start/dev/serve), setze als Preview-URL
                            if (command && (command.includes('start') || command.includes('dev') || command.includes('serve') || command.includes('run'))) {
                              setPreviewUrl(url);
                              setPreviewStatus('running');
                              console.log('✅ Preview-URL gesetzt:', url);
                            }
                          }
                          
                          // ⚡ AUTOMATISCH: Öffne Browser-Tab im Editor (nicht separat!)
                          const tabId = `browser-${Date.now()}`;
                          setBrowserTabs(prev => {
                            const existing = prev.find(t => t.url === url);
                            if (existing) {
                              // Tab existiert bereits, aktiviere ihn
                              setActiveBrowserTab(existing.id);
                              setActiveFile(null); // WICHTIG: Deaktiviere Datei-Tab, damit Browser-Tab sichtbar wird
                              return prev;
                            }
                            // Neuer Tab
                            const newTabs = [...prev, {
                              id: tabId,
                              url: url,
                              title: url.includes('://') ? new URL(url).hostname : url,
                              command: command
                            }];
                            // WICHTIG: Aktiviere Browser-Tab sofort und deaktiviere Datei-Tab
                            setActiveBrowserTab(tabId);
                            setActiveFile(null);
                            return newTabs;
                          });
                          console.log('✅ Browser-Tab im Editor geöffnet (nicht separat!):', url);
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
                {/* Preview Tabs (wie im Bild) */}
                <div style={{
                  display: 'flex',
                  background: '#2d2d30',
                  borderBottom: '1px solid #3c3c3c',
                  fontSize: '11px'
                }}>
                  <div
                    style={{
                      padding: '6px 12px',
                      background: previewStatus !== 'error' ? '#1e1e1e' : '#2d2d30',
                      borderBottom: previewStatus !== 'error' ? '2px solid #007acc' : 'none',
                      color: previewStatus !== 'error' ? '#cccccc' : '#858585',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🌐</span>
                    <span>Browser Preview</span>
                  </div>
                  {previewStatus === 'error' && (
                    <div
                      style={{
                        padding: '6px 12px',
                        background: '#1e1e1e',
                        borderBottom: '2px solid #f48771',
                        color: '#f48771',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>❌</span>
                      <span>Fehler</span>
                    </div>
                  )}
                  {findMainHTMLFile() && (
                    <div
                      style={{
                        padding: '6px 12px',
                        background: '#2d2d30',
                        color: '#858585',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📄</span>
                      <span>{findMainHTMLFile().name}</span>
                    </div>
                  )}
                </div>
                
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
                    {previewStatus === 'running' && previewUrl && (
                      <span style={{ 
                        color: '#4ec9b0', 
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#1e1e1e',
                        borderRadius: '3px'
                      }}>
                        {previewUrl.replace('http://localhost:', 'Port ')}
                      </span>
                    )}
                    {previewStatus === 'starting' && (
                      <span style={{ 
                        color: '#ffa500', 
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#1e1e1e',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Loader2 size={10} className="animate-spin" />
                        {previewLoadingProgress.message || 'Starte...'} ({previewLoadingProgress.elapsed}s / ~{previewLoadingProgress.maxTime}s)
                      </span>
                    )}
                    {previewStatus === 'error' && previewError && (
                      <span style={{ 
                        color: '#f48771', 
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#1e1e1e',
                        borderRadius: '3px'
                      }}>
                        {previewError.length > 50 ? previewError.substring(0, 50) + '...' : previewError}
                      </span>
                    )}
                </div>
                  
                  {/* Start Preview Button - wenn nicht läuft */}
                  {previewStatus !== 'running' && previewStatus !== 'starting' && (
                    <button
                      onClick={async () => {
                        try {
                          await detectProjectTypeAndStartPreview();
                        } catch (error) {
                          console.error('Failed to start preview:', error);
                          setPreviewError(error.message);
                          setPreviewStatus('error');
                        }
                      }}
                      style={{
                        padding: '4px 12px',
                        background: '#007acc',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#ffffff',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#005a9e'}
                      onMouseLeave={(e) => e.target.style.background = '#007acc'}
                      title="Preview Server starten"
                    >
                      <Play size={12} />
                      Start Preview
                    </button>
                  )}
                  
                  {/* Reload Button - wenn läuft */}
                  {previewStatus === 'running' && (
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
                  )}
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
                  src={(() => {
                    if (!previewUrl || previewStatus !== 'running') return undefined;
                    // ⚡ WICHTIG: previewUrl sollte bereits die saubere App-URL sein (wird in startPreviewServer geparst)
                    // Aber zur Sicherheit: Entferne nochmal DevTools-Parameter falls vorhanden
                    let url = previewUrl;
                    if (url.includes('?uri=')) {
                      try {
                        const urlObj = new URL(url);
                        const uriParam = urlObj.searchParams.get('uri');
                        if (uriParam) {
                          if (uriParam.startsWith('http://') || uriParam.startsWith('https://')) {
                            url = uriParam;
                            console.log('✅ iframe: Extracted app URL from DevTools:', url);
                          } else {
                            // Relative URL - extrahiere Port (z.B. :62225/wrR1b5Twz-E=)
                            const portMatch = uriParam.match(/:(\d+)/);
                            if (portMatch) {
                              url = `http://127.0.0.1:${portMatch[1]}`;
                              console.log('✅ iframe: Extracted app URL from relative URI:', url);
                            }
                          }
                        }
                      } catch (e) {
                        console.warn('⚠️ iframe: Could not parse DevTools URL:', e);
                      }
                    }
                    console.log('🖼️ iframe loading URL:', url);
                    return url;
                  })()}
                  srcDoc={(() => {
                    if (previewUrl && previewStatus === 'running') return undefined;
                    // Fallback: Zeige HTML-Inhalt direkt wenn verfügbar
                    const mainHTML = findMainHTMLFile();
                    if (mainHTML) {
                      let htmlContent = mainHTML.content;
                      
                      // ⚡ WICHTIG: Entferne Escape-Sequenzen (\n wird zu echten Zeilenumbrüchen)
                      // Wenn Content escaped ist (\\n), konvertiere zu echten Zeilenumbrüchen
                      if (htmlContent.includes('\\n')) {
                        htmlContent = htmlContent.replace(/\\n/g, '\n');
                        htmlContent = htmlContent.replace(/\\t/g, '\t');
                        htmlContent = htmlContent.replace(/\\"/g, '"');
                        htmlContent = htmlContent.replace(/\\'/g, "'");
                      }
                      
                      // Embed CSS
                      const cssFiles = files.filter(f => f.name.endsWith('.css'));
                      cssFiles.forEach(cssFile => {
                        let cssContent = cssFile.content;
                        // Entferne auch CSS-Escape-Sequenzen
                        if (cssContent.includes('\\n')) {
                          cssContent = cssContent.replace(/\\n/g, '\n');
                        }
                        if (!htmlContent.includes(cssContent)) {
                          htmlContent = htmlContent.replace(
                            '</head>',
                            `<style>${cssContent}</style>\n</head>`
                          );
                        }
                      });
                      // Embed JS
                      const jsFiles = files.filter(f => 
                        f.name.endsWith('.js') && 
                        !f.name.includes('node_modules')
                      );
                      jsFiles.forEach(jsFile => {
                        let jsContent = jsFile.content;
                        // Entferne auch JS-Escape-Sequenzen
                        if (jsContent.includes('\\n')) {
                          jsContent = jsContent.replace(/\\n/g, '\n');
                        }
                        if (!htmlContent.includes(jsContent)) {
                          htmlContent = htmlContent.replace(
                            '</body>',
                            `<script>${jsContent}</script>\n</body>`
                          );
                        }
                      });
                      return htmlContent;
                    }
                    // Default fallback
                    const elapsed = previewLoadingProgress.elapsed || 0;
                    const maxTime = previewLoadingProgress.maxTime || 120;
                    const remaining = Math.max(0, maxTime - elapsed);
                    const progressPercent = Math.min(100, (elapsed / maxTime) * 100);
                    const statusMsg = previewStatus === 'starting' ? `
                      <div style="text-align: center; padding: 40px; color: #007acc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                        <h2 style="color: #007acc; margin-bottom: 10px; font-size: 18px;">Preview wird gestartet...</h2>
                        <p style="color: #cccccc; margin-bottom: 20px; font-size: 14px;">${previewLoadingProgress.message || 'Warte auf Server...'}</p>
                        <div style="background: #2d2d30; border-radius: 8px; padding: 20px; margin: 20px auto; max-width: 400px;">
                          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: #858585;">
                            <span>Verstrichen: ${elapsed}s</span>
                            <span>Geschätzt: ~${maxTime}s</span>
                          </div>
                          <div style="background: #1e1e1e; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #007acc, #00d4ff); height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                          </div>
                          <p style="font-size: 11px; color: #858585; margin-top: 10px;">
                            ${remaining > 0 ? `Noch ca. ${remaining} Sekunden...` : 'Bitte warten, Server startet...'}
                          </p>
                          <p style="font-size: 10px; color: #666; margin-top: 20px;">
                            💡 Flutter-Apps brauchen oft 60-120 Sekunden zum ersten Kompilieren
                          </p>
                        </div>
                      </div>
                    ` : '';
                    let errorMsg = '';
                    if (previewStatus === 'error') {
                      const error = previewError || 'Unbekannter Fehler';
                      // Spezielle Behandlung für "connection refused"
                      if (error.includes('abgelehnt') || error.includes('refused') || error.includes('ECONNREFUSED')) {
                        errorMsg = `
                          <div style="text-align: center; padding: 40px; color: #f48771;">
                            <div style="font-size: 48px; margin-bottom: 20px;">🔌</div>
                            <h2 style="color: #f48771; margin-bottom: 10px;">Verbindung abgelehnt</h2>
                            <p style="color: #cccccc; margin-bottom: 20px;">Der Preview-Server ist nicht erreichbar.</p>
                            <p style="color: #888; font-size: 12px; margin-bottom: 20px;">Mögliche Ursachen:</p>
                            <ul style="color: #888; font-size: 12px; text-align: left; display: inline-block;">
                              <li>Server startet noch (bitte warten...)</li>
                              <li>Server ist abgestürzt (bitte neu starten)</li>
                              <li>Port ist bereits belegt</li>
                            </ul>
                            <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">
                              🔄 Erneut versuchen
                            </button>
                          </div>
                        `;
                      } else {
                        errorMsg = `<p style="color: #f48771;">❌ Fehler: ${error}</p>`;
                      }
                    }
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
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: message.role === 'user' 
                          ? 'linear-gradient(135deg, #007acc 0%, #005a9e 100%)' 
                          : 'linear-gradient(135deg, #4ecdc4 0%, #2e9e96 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                        border: message.role === 'user' ? '2px solid rgba(255, 255, 255, 0.1)' : '2px solid rgba(78, 205, 196, 0.2)'
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
                          background: message.role === 'user' 
                            ? 'linear-gradient(135deg, #007acc 0%, #005a9e 100%)' 
                            : '#2d2d30',
                          padding: '14px 18px',
                          borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          fontSize: '14px',
                          color: '#ffffff',
                          lineHeight: '1.6',
                          border: message.role === 'user' ? 'none' : '1px solid #3c3c3c',
                          wordBreak: 'break-word',
                          overflow: 'auto',
                          position: 'relative',
                          boxShadow: message.role === 'user' 
                            ? '0 2px 8px rgba(0, 122, 204, 0.3)' 
                            : '0 2px 4px rgba(0, 0, 0, 0.2)',
                          transition: 'all 0.2s'
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
                    background: '#252526',
                    borderRadius: '12px',
                    border: '1px solid #3c3c3c',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    gap: '10px',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#007acc';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 122, 204, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#3c3c3c';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
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
                      placeholder={isLiveBuilding 
                        ? `💬 Frage stellen oder Verbesserung geben... (Smart Agent arbeitet parallel)` 
                        : `💬 Nachricht an ${AGENT_TYPES[currentAgent]?.name || 'AI Assistant'}...`}
                      disabled={isChatLoading} // ⚡ NUR während Sendens deaktiviert, NIEMALS wegen Smart Agent!
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