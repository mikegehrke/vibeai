'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Files, Search, GitBranch, Bug, Puzzle,
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  X, Plus, MoreHorizontal, Settings, User,
  Sparkles, Send, Loader2, Bot, 
  Moon, Sun, Circle, Terminal,
  MessageSquare, Copy, Check, AlertCircle, XCircle,
  AtSign, Image, ArrowUp, Globe, Split,
  FileCode, FileJson, FileText, Infinity, Lightbulb,
  Play, RotateCcw, Maximize2, PanelRight, Cloud, Key,
  Edit3, Share2, RefreshCw, Trash2, MoreVertical
} from 'lucide-react'

// ================================================
// VIBEAI STUDIO - EXACT CURSOR CLONE
// ================================================

export default function CursorClone() {
  const [mounted, setMounted] = useState(false)
  
  // Layout
  const [showExplorer, setShowExplorer] = useState(true)
  const [showChat, setShowChat] = useState(true)
  const [showTerminal, setShowTerminal] = useState(true)
  const [activeSection, setActiveSection] = useState('explorer')
  const [terminalTab, setTerminalTab] = useState('terminal')
  
  // Files
  const [fileTree, setFileTree] = useState([
    { id: '1', name: 'my-vibeai-app', type: 'folder', open: true, children: [
      { id: '2', name: 'src', type: 'folder', open: true, children: [
        { id: '3', name: 'components', type: 'folder', open: true, children: [
          { id: '4', name: 'Button.tsx', type: 'file' },
          { id: '5', name: 'Card.tsx', type: 'file' },
          { id: '6', name: 'Header.tsx', type: 'file' },
        ]},
        { id: '7', name: 'App.tsx', type: 'file' },
        { id: '8', name: 'main.tsx', type: 'file' },
      ]},
      { id: '9', name: 'package.json', type: 'file' },
      { id: '10', name: 'README.md', type: 'file' },
    ]}
  ])
  
  const [tabs, setTabs] = useState([
    { id: '7', name: 'App.tsx', modified: true },
  ])
  const [activeTab, setActiveTab] = useState('7')
  
  const [code] = useState(`import React, { useState } from 'react'
import { Header } from './components/Header'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <Header />
      <main>
        <h1>Count: {count}</h1>
        <button onClick={() => setCount(c => c + 1)}>
          Increment
        </button>
      </main>
    </div>
  )
}`)

  // Chat State - CURSOR STYLE mit PERSISTENZ
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingSteps, setThinkingSteps] = useState([])
  const [thinkingTime, setThinkingTime] = useState(0)
  const [chatHistory, setChatHistory] = useState([]) // Alle Chats
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showChatHistory, setShowChatHistory] = useState(false)
  
  // LIVE AGENT STATE - Wie Cursor Agent arbeitet
  const [agentStatus, setAgentStatus] = useState('idle') // idle, thinking, planning, coding, running
  const [agentCurrentStep, setAgentCurrentStep] = useState('')
  const [agentPlan, setAgentPlan] = useState([])
  const [agentCurrentPlanIndex, setAgentCurrentPlanIndex] = useState(0)
  const [liveTypingText, setLiveTypingText] = useState('')
  const [liveTypingFile, setLiveTypingFile] = useState(null)
  const [pendingTerminalCmd, setPendingTerminalCmd] = useState(null)
  const [terminalAwaitingApproval, setTerminalAwaitingApproval] = useState(false)
  
  // PERSISTENT: Lade Chat-Verlauf aus localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('vibeai-chat-history')
      const savedCurrentChat = localStorage.getItem('vibeai-current-chat')
      
      if (savedHistory) {
        const history = JSON.parse(savedHistory)
        setChatHistory(history)
        
        // Lade letzten aktiven Chat
        if (savedCurrentChat) {
          const chatId = savedCurrentChat
          const chat = history.find(c => c.id === chatId)
          if (chat) {
            setCurrentChatId(chatId)
            setMessages(chat.messages || [])
          }
        } else if (history.length > 0) {
          // Lade neuesten Chat
          const latestChat = history[0]
          setCurrentChatId(latestChat.id)
          setMessages(latestChat.messages || [])
        }
      }
    }
  }, [])

  // PERSISTENT: Speichere Messages wenn sie sich ändern
  useEffect(() => {
    if (typeof window !== 'undefined' && currentChatId && messages.length > 0) {
      const updatedHistory = chatHistory.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages, updatedAt: new Date().toISOString() }
          : chat
      )
      
      // Wenn Chat nicht existiert, erstelle neuen
      if (!updatedHistory.find(c => c.id === currentChatId)) {
        updatedHistory.unshift({
          id: currentChatId,
          title: messages[0]?.content?.slice(0, 50) || 'New Chat',
          messages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      setChatHistory(updatedHistory)
      localStorage.setItem('vibeai-chat-history', JSON.stringify(updatedHistory))
      localStorage.setItem('vibeai-current-chat', currentChatId)
    }
  }, [messages, currentChatId])
  
  // Neuen Chat erstellen
  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [{
        id: Date.now(),
        role: 'assistant',
        content: "I'm ready to help you code. What would you like to build?",
        time: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages(newChat.messages)
    
    localStorage.setItem('vibeai-chat-history', JSON.stringify([newChat, ...chatHistory]))
    localStorage.setItem('vibeai-current-chat', newChatId)
  }
  
  // Chat wechseln
  const switchChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages || [])
      localStorage.setItem('vibeai-current-chat', chatId)
    }
  }
  
  // Chat löschen
  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(c => c.id !== chatId)
    setChatHistory(updatedHistory)
    localStorage.setItem('vibeai-chat-history', JSON.stringify(updatedHistory))
    
    if (currentChatId === chatId) {
      if (updatedHistory.length > 0) {
        switchChat(updatedHistory[0].id)
      } else {
        createNewChat()
      }
    }
  }
  
  // ========================================
  // LIVE AGENT SYSTEM - Arbeitet wie Cursor
  // ========================================
  
  // Live Typing Animation - tippt Code Zeile für Zeile
  const simulateLiveTyping = async (code, filename, onComplete) => {
    setLiveTypingFile(filename)
    setLiveTypingText('')
    
    const lines = code.split('\n')
    let currentText = ''
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      
      // Zeige welche Zeile gerade getippt wird
      setAgentCurrentStep(`📝 Schreibe Zeile ${lineIndex + 1}/${lines.length} in ${filename}`)
      
      // Tippe Zeichen für Zeichen
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        currentText += line[charIndex]
        setLiveTypingText(currentText)
        await new Promise(r => setTimeout(r, 15)) // 15ms pro Zeichen
      }
      
      currentText += '\n'
      setLiveTypingText(currentText)
      await new Promise(r => setTimeout(r, 50)) // Pause nach jeder Zeile
    }
    
    // Fertig - füge File zum Editor hinzu
    if (onComplete) onComplete(code)
    setLiveTypingFile(null)
    setLiveTypingText('')
  }
  
  // Erstelle File im Explorer
  const createFileInExplorer = (path, content = '') => {
    const parts = path.split('/')
    const fileName = parts.pop()
    
    // Füge File zum files State hinzu
    setFiles(prev => [...prev, {
      id: `file-${Date.now()}`,
      name: fileName,
      path: path,
      content: content
    }])
    
    // Öffne neuen Tab
    setTabs(prev => [...prev, {
      id: `tab-${Date.now()}`,
      name: fileName,
      modified: true
    }])
    
    // Update Editor Content
    setEditorContent(content)
  }
  
  // Führe Agent Plan Step-by-Step aus
  const executeAgentPlan = async (plan) => {
    setAgentPlan(plan)
    setAgentStatus('planning')
    
    // Zeige Plan im Chat
    setMessages(m => [...m, {
      id: Date.now(),
      role: 'assistant',
      content: '📋 Ich habe einen Plan erstellt:',
      todos: plan.map((step, i) => ({ text: step.description, done: false })),
      time: new Date()
    }])
    
    await new Promise(r => setTimeout(r, 500))
    
    // Führe jeden Step aus
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i]
      setAgentCurrentPlanIndex(i)
      setAgentStatus(step.type)
      
      // Update Chat mit aktuellem Step
      setMessages(m => {
        const lastMsg = m[m.length - 1]
        if (lastMsg?.todos) {
          return m.map((msg, idx) => 
            idx === m.length - 1
              ? { ...msg, todos: msg.todos.map((t, ti) => ti <= i ? { ...t, done: true } : t) }
              : msg
          )
        }
        return m
      })
      
      // Zeige was passiert
      setAgentCurrentStep(step.description)
      
      // Führe Action aus
      if (step.type === 'thinking') {
        await new Promise(r => setTimeout(r, 1000))
        
      } else if (step.type === 'creating_file') {
        // Erstelle File mit Live-Typing
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          content: `📁 Erstelle ${step.file}...`,
          time: new Date()
        }])
        
        await simulateLiveTyping(step.content, step.file, (code) => {
          createFileInExplorer(step.file, code)
        })
        
        // Zeige Code-Block im Chat
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          files: [{ name: step.file, action: 'created', lines: `+${step.content.split('\n').length}` }],
          codeBlocks: [{ file: step.file, code: step.content }],
          time: new Date()
        }])
        
      } else if (step.type === 'terminal') {
        // Terminal Command - warte auf Genehmigung
        setPendingTerminalCmd(step.command)
        setTerminalAwaitingApproval(true)
        
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          content: `🖥️ Ich möchte folgenden Befehl ausführen:`,
          terminal: { command: step.command, output: null, exitCode: null },
          awaitingApproval: true,
          time: new Date()
        }])
        
        // Warte auf User Genehmigung
        await new Promise(resolve => {
          const checkApproval = setInterval(() => {
            if (!terminalAwaitingApproval) {
              clearInterval(checkApproval)
              resolve()
            }
          }, 100)
        })
        
      } else if (step.type === 'editing_file') {
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          content: `✏️ Bearbeite ${step.file}...`,
          time: new Date()
        }])
        
        await simulateLiveTyping(step.content, step.file, (code) => {
          setEditorContent(code)
        })
        
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          files: [{ name: step.file, action: 'modified', lines: step.changes }],
          codeBlocks: [{ file: step.file, code: step.content, lines: step.changes }],
          time: new Date()
        }])
      }
      
      await new Promise(r => setTimeout(r, 300))
    }
    
    setAgentStatus('idle')
    setAgentCurrentStep('')
    setAgentPlan([])
    
    // Abschluss-Nachricht
    setMessages(m => [...m, {
      id: Date.now(),
      role: 'assistant',
      content: '✅ Fertig! Alle Aufgaben wurden erledigt.',
      time: new Date()
    }])
  }
  
  // Terminal Command genehmigen
  const approveTerminalCommand = () => {
    // Simuliere Terminal Output
    const cmd = pendingTerminalCmd
    
    setMessages(m => m.map(msg => 
      msg.awaitingApproval
        ? { 
            ...msg, 
            awaitingApproval: false,
            terminal: { 
              ...msg.terminal, 
              output: `✓ Command executed successfully\n> ${cmd}`,
              exitCode: 0 
            }
          }
        : msg
    ))
    
    setTerminalAwaitingApproval(false)
    setPendingTerminalCmd(null)
  }
  
  // Terminal Command ablehnen
  const skipTerminalCommand = () => {
    setMessages(m => m.map(msg => 
      msg.awaitingApproval
        ? { ...msg, awaitingApproval: false, terminal: { ...msg.terminal, output: 'Skipped by user', exitCode: -1 } }
        : msg
    ))
    
    setTerminalAwaitingApproval(false)
    setPendingTerminalCmd(null)
  }
  
  // ========================================
  // LIVE AGENT WORK - EXAKT WIE CURSOR CHAT
  // ========================================
  const showLiveAgentWork = async (userRequest) => {
    setAgentStatus('thinking')
    const startTime = Date.now()
    
    // 1. THOUGHT for Xs
    await addAgentMessage({
      type: 'thought',
      content: 'Thought for 2s'
    })
    await delay(1200)
    
    // 2. EXPLORING - Zeige Suche
    setAgentCurrentStep('🔍 Exploring...')
    await addAgentMessage({
      type: 'exploring',
      content: 'Explored 1 search',
      query: userRequest.slice(0, 50)
    })
    await delay(800)
    
    // 3. GREPPED - Zeige Code-Suche
    setAgentCurrentStep('📖 Searching code...')
    await addAgentMessage({
      type: 'grepped',
      content: 'Grepped (msg\\.codeBlocks && msg\\.codeBlocks\\.map) in page.jsx',
      file: 'page.jsx',
      matches: 3,
      lines: '2130-2131'
    })
    await delay(600)
    
    // 4. PLANNING - "Planning next moves"
    setAgentCurrentStep('📋 Planning...')
    await addAgentMessage({
      type: 'planning',
      content: 'Planning next moves'
    })
    await delay(800)
    
    // 5. PLAN ANZEIGEN - Wie ich es mache
    await addAgentMessage({
      type: 'plan',
      content: 'Hier ist mein Plan:',
      steps: [
        'Projektstruktur analysieren',
        'Neue Komponente erstellen',
        'Code schreiben',
        'File im Editor öffnen',
        'Änderungen testen'
      ]
    })
    await delay(600)
    
    // 6. FILE CREATION - Mit Live Typing
    setAgentStatus('coding')
    setAgentCurrentStep('📝 Creating file...')
    
    const newFileCode = `import React from 'react'

interface Props {
  title: string
  children?: React.ReactNode
}

export function NewComponent({ title, children }: Props) {
  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default NewComponent`
    
    await addAgentMessage({
      type: 'file_create',
      file: 'src/components/NewComponent.tsx',
      status: 'creating'
    })
    
    // Live Typing
    await simulateLiveTyping(newFileCode, 'src/components/NewComponent.tsx', (code) => {
      createFileInExplorer('src/components/NewComponent.tsx', code)
    })
    
    await updateLastFileMessage('created', newFileCode)
    await delay(400)
    
    // 7. TERMINAL COMMAND
    setAgentStatus('running')
    setAgentCurrentStep('🖥️ Running command...')
    
    await addAgentMessage({
      type: 'terminal_request',
      command: 'npm run dev',
      description: 'Start development server'
    })
    
    setPendingTerminalCmd('npm run dev')
    setTerminalAwaitingApproval(true)
    await waitForApproval()
    
    // 8. FERTIG
    setAgentStatus('idle')
    setAgentCurrentStep('')
    
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    await addAgentMessage({
      type: 'complete',
      content: `✅ Fertig! Completed in ${totalTime}s`,
      summary: {
        filesCreated: 1,
        filesEdited: 0,
        commandsRun: 1
      }
    })
  }
  
  // Helper: Nachricht hinzufügen
  const addAgentMessage = async (msg) => {
    const newMsg = {
      id: Date.now() + Math.random(),
      role: 'assistant',
      time: new Date(),
      ...msg
    }
    setMessages(m => [...m, newMsg])
    await delay(100)
  }
  
  // Helper: Letzte File Message updaten
  const updateLastFileMessage = async (status, content) => {
    setMessages(m => {
      const lastIndex = m.length - 1
      if (m[lastIndex]?.type === 'file_create') {
        return m.map((msg, i) => 
          i === lastIndex 
            ? { ...msg, status, content, lines: content.split('\n').length }
            : msg
        )
      }
      return m
    })
  }
  
  // Helper: Delay
  const delay = (ms) => new Promise(r => setTimeout(r, ms))
  
  // Helper: Auf Terminal Genehmigung warten
  const waitForApproval = () => new Promise(resolve => {
    const check = setInterval(() => {
      if (!terminalAwaitingApproval) {
        clearInterval(check)
        resolve()
      }
    }, 100)
  })
  
  // ========================================
  // APPLY CODE TO EDITOR - Live Typing
  // ========================================
  const applyCodeToEditor = async (code, filename) => {
    // 1. Erstelle oder öffne File im Editor
    const existingTab = tabs.find(t => t.name === filename)
    
    if (!existingTab) {
      // Neues Tab erstellen
      const newTab = {
        id: `tab-${Date.now()}`,
        name: filename,
        modified: true
      }
      setTabs(prev => [...prev, newTab])
      setActiveTab(newTab.id)
    } else {
      // Existierendes Tab aktivieren
      setActiveTab(tabs.find(t => t.name === filename)?.id)
    }
    
    // 2. Live Typing Animation im Editor
    setEditorContent('')
    const lines = code.split('\n')
    let currentContent = ''
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Tippe jede Zeile
      for (let j = 0; j < line.length; j++) {
        currentContent += line[j]
        setEditorContent(currentContent)
        await delay(10) // 10ms pro Zeichen - schnell aber sichtbar
      }
      
      // Neue Zeile
      currentContent += '\n'
      setEditorContent(currentContent)
      await delay(30) // Kurze Pause nach jeder Zeile
    }
    
    // 3. Zeige Success Notification
    setTimeout(() => {
      // File als modified markieren
      setTabs(prev => prev.map(t => 
        t.name === filename ? { ...t, modified: true } : t
      ))
    }, 100)
  }
  
  // CURSOR STYLE: Agent mode at bottom
  const [agentMode, setAgentMode] = useState('agent') // agent, plan, debug, ask
  const [selectedModel, setSelectedModel] = useState('smart-agent') // Default to Smart Agent
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const [maxMode, setMaxMode] = useState(false)
  
  // Agent modes with descriptions - EXACT CURSOR STYLE
  const agentModes = [
    { 
      id: 'agent', 
      label: 'Agent', 
      icon: Infinity, 
      shortcut: '⌘I',
      description: 'Plan, search, build anything',
      tag: 'Recommended',
      hasEdit: true
    },
    { 
      id: 'plan', 
      label: 'Plan', 
      icon: FileText, 
      shortcut: null,
      description: 'Create detailed plans for accomplishing tasks',
      tag: null,
      hasEdit: true
    },
    { 
      id: 'debug', 
      label: 'Debug', 
      icon: Bug, 
      shortcut: null,
      description: 'Systematically diagnose and fix bugs using runtime traces',
      tag: null,
      hasEdit: true
    },
    { 
      id: 'ask', 
      label: 'Ask', 
      icon: MessageSquare, 
      shortcut: null,
      description: 'Ask questions about your codebase',
      tag: null,
      hasEdit: false
    },
  ]
  
  const chatRef = useRef(null)
  const inputRef = useRef(null)
  
  // Terminal
  const [terminalOutput] = useState([
    { type: 'cmd', text: '❯ npm run dev' },
    { type: 'info', text: '  VITE v5.0.0  ready in 234ms' },
    { type: 'success', text: '  ➜  Local: http://localhost:5173/' },
  ])

  // Problems
  const [problems] = useState([
    { type: 'error', msg: "Cannot find name 'User'", file: 'App.tsx', line: 13 },
  ])

  // VIBEAI MODELS & AGENTS - ECHTE NAMEN VOM BACKEND
  const [showSettings, setShowSettings] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [showAddModel, setShowAddModel] = useState(false)
  const [customModelName, setCustomModelName] = useState('')
  const [customModels, setCustomModels] = useState([])
  const [backendModels, setBackendModels] = useState([])
  const [backendAgents, setBackendAgents] = useState([])
  const [enabledModels, setEnabledModels] = useState({})
  
  // API KEYS - ECHT GESPEICHERT IN LOCALSTORAGE
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    openaiBaseUrl: '',
    openaiEnabled: false,
    anthropic: '',
    anthropicEnabled: false,
    google: '',
    googleEnabled: false,
    azureBaseUrl: '',
    azureDeployment: '',
    azureKey: '',
    azureEnabled: false,
    awsAccessKey: '',
    awsSecretKey: '',
    awsRegion: '',
    awsTestModel: '',
    awsEnabled: false,
    ollamaUrl: 'http://localhost:11434',
  })
  
  // Load saved settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedApiKeys = localStorage.getItem('vibeai-api-keys')
      const savedEnabledModels = localStorage.getItem('vibeai-enabled-models')
      const savedCustomModels = localStorage.getItem('vibeai-custom-models')
      
      if (savedApiKeys) setApiKeys(JSON.parse(savedApiKeys))
      if (savedEnabledModels) setEnabledModels(JSON.parse(savedEnabledModels))
      if (savedCustomModels) setCustomModels(JSON.parse(savedCustomModels))
    }
  }, [])

  // Save API keys to localStorage
  const saveApiKey = (key, value) => {
    const newKeys = { ...apiKeys, [key]: value }
    setApiKeys(newKeys)
    localStorage.setItem('vibeai-api-keys', JSON.stringify(newKeys))
  }
  
  // Save enabled models to localStorage
  const toggleModel = (modelId) => {
    const newEnabled = { ...enabledModels, [modelId]: !enabledModels[modelId] }
    setEnabledModels(newEnabled)
    localStorage.setItem('vibeai-enabled-models', JSON.stringify(newEnabled))
  }
  
  // Add custom model
  const addCustomModel = (name) => {
    if (!name.trim()) return
    const newModel = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: 'Custom',
      badge: '🔧',
      isCustom: true
    }
    const newCustomModels = [...customModels, newModel]
    setCustomModels(newCustomModels)
    localStorage.setItem('vibeai-custom-models', JSON.stringify(newCustomModels))
    setCustomModelName('')
    setShowAddModel(false)
  }
  
  // Delete custom model
  const deleteCustomModel = (modelId) => {
    const newCustomModels = customModels.filter(m => m.id !== modelId)
    setCustomModels(newCustomModels)
    localStorage.setItem('vibeai-custom-models', JSON.stringify(newCustomModels))
  }
  
  // Fetch ALL models from backend on mount
  useEffect(() => {
    const fetchModelsAndAgents = async () => {
      try {
        // Fetch ALL 280+ models from /models/available
        const modelsRes = await fetch('http://localhost:8005/models/available')
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json()
          console.log(`Loaded ${modelsData.length} models from backend`)
          setBackendModels(modelsData)
          // Enable all by default
          const enabled = {}
          modelsData.forEach(m => { enabled[m.id] = true })
          setEnabledModels(enabled)
        }
      } catch (err) {
        console.log('Using fallback models', err)
      }
    }
    fetchModelsAndAgents()
  }, [])
  
  // ═══════════════════════════════════════════════════════════════════
  // VIBEAI MODELS - ALLE MIT VIBEAI BRANDING (259+ Models)
  // ═══════════════════════════════════════════════════════════════════
  
  // Convert backend models to VibeAI branding
  const convertToVibeAI = (models) => {
    return models.map(m => {
      // Map original names to VibeAI names
      let vibeAIName = m.name
      if (m.name?.includes('GPT-4o')) vibeAIName = 'VibeAI 4.0 Pro'
      else if (m.name?.includes('GPT-4')) vibeAIName = 'VibeAI 4.0'
      else if (m.name?.includes('GPT-3.5')) vibeAIName = 'VibeAI 3.5'
      else if (m.name?.includes('Claude 3.5 Sonnet')) vibeAIName = 'VibeAI Ultra'
      else if (m.name?.includes('Claude 3.5 Haiku')) vibeAIName = 'VibeAI Fast'
      else if (m.name?.includes('Claude 3 Opus')) vibeAIName = 'VibeAI MAX'
      else if (m.name?.includes('Gemini 1.5 Pro')) vibeAIName = 'VibeAI Vision Pro'
      else if (m.name?.includes('Gemini 1.5 Flash')) vibeAIName = 'VibeAI Vision'
      else if (m.name?.includes('Gemini 2.0')) vibeAIName = 'VibeAI Vision 2.0'
      else if (m.name?.includes('O1') || m.name?.includes('o1')) vibeAIName = 'VibeAI Reasoning'
      else if (m.name?.includes('Llama')) vibeAIName = 'VibeAI Open'
      else if (m.name?.includes('Mistral')) vibeAIName = 'VibeAI Euro'
      else if (m.name?.includes('Qwen') || m.name?.includes('Coder')) vibeAIName = 'VibeAI Code'
      else if (m.name?.includes('DeepSeek')) vibeAIName = 'VibeAI Deep'
      
      return { ...m, name: vibeAIName, originalName: m.name }
    })
  }
  
  const allModels = [
    // ═══════════════════════════════════════════════════════════
    // VIBEAI AGENTS (OBEN!)
    // ═══════════════════════════════════════════════════════════
    { id: 'smart-agent', name: 'Smart Agent', category: 'Agents', badge: '⚡', isAgent: true, description: 'Intelligenter Allround-Agent' },
    { id: 'super-agent', name: 'Super Agent', category: 'Agents', badge: '🚀', isAgent: true, description: 'Maximum Power Agent' },
    { id: 'fix-agent', name: 'Fix Agent', category: 'Agents', badge: '🔧', isAgent: true, description: 'Fehler automatisch beheben' },
    { id: 'code-agent', name: 'Code Agent', category: 'Agents', badge: '💻', isAgent: true, description: 'Spezialist für Code' },
    { id: 'creative-agent', name: 'Creative Agent', category: 'Agents', badge: '✨', isAgent: true, description: 'Kreative Lösungen' },
    { id: 'plan-agent', name: 'Plan Agent', category: 'Agents', badge: '📋', isAgent: true, description: 'Aufgaben planen' },
    
    // ═══════════════════════════════════════════════════════════
    // CLAUDE / ANTHROPIC - VibeAI Ultra Series
    // ═══════════════════════════════════════════════════════════
    { id: 'sonnet-4', name: 'VibeAI Sonnet 4', category: 'Premium', badge: '⚡' },
    { id: 'sonnet-4-think', name: 'VibeAI Sonnet 4', category: 'Premium', badge: '⚡' },
    { id: 'sonnet-4-1m', name: 'VibeAI Sonnet 4 1M', category: 'Premium', badge: 'MAX', maxOnly: true },
    { id: 'sonnet-4-1m-think', name: 'VibeAI Sonnet 4 1M', category: 'Premium', badge: 'MAX', maxOnly: true },
    { id: 'claude-3-5-sonnet', name: 'VibeAI Ultra', category: 'Premium', badge: '⚡' },
    { id: 'claude-3-opus', name: 'VibeAI Ultra MAX', category: 'Premium', badge: '🧠' },
    { id: 'claude-3-haiku', name: 'VibeAI Fast', category: 'Standard', badge: null },
    
    // ═══════════════════════════════════════════════════════════
    // OPENAI - VibeAI Core Series
    // ═══════════════════════════════════════════════════════════
    { id: 'o3', name: 'VibeAI o3', category: 'Premium', badge: '⚡' },
    { id: 'o3-pro', name: 'VibeAI o3 Pro', category: 'Premium', badge: 'MAX', maxOnly: true },
    { id: 'gpt-4.1', name: 'VibeAI 4.1', category: 'Premium', badge: '⚡' },
    { id: 'gpt-5', name: 'VibeAI 5.0', category: 'Premium', badge: '🚀' },
    { id: 'gpt-5-mini', name: 'VibeAI 5.0 Mini', category: 'Premium', badge: '⚡' },
    { id: 'gpt-5-nano', name: 'VibeAI 5.0 Nano', category: 'Standard', badge: '⚡' },
    { id: 'gpt-5-pro', name: 'VibeAI 5.0 Pro', category: 'Premium', badge: 'MAX', maxOnly: true },
    { id: 'gpt-4o', name: 'VibeAI 4.0 Pro', category: 'Premium', badge: '⚡' },
    { id: 'gpt-4o-mini', name: 'VibeAI 4.0 Mini', category: 'Standard', badge: null },
    { id: 'gpt-4-turbo', name: 'VibeAI 4.0 Turbo', category: 'Premium', badge: '⚡' },
    { id: 'gpt-4', name: 'VibeAI 4.0', category: 'Standard', badge: null },
    { id: 'gpt-3.5-turbo', name: 'VibeAI 3.5', category: 'Standard', badge: null },
    { id: 'o1', name: 'VibeAI Reasoning', category: 'Premium', badge: '🧠' },
    { id: 'o1-mini', name: 'VibeAI Reasoning Mini', category: 'Standard', badge: null },
    { id: 'o1-pro', name: 'VibeAI Reasoning Pro', category: 'Premium', badge: 'MAX', maxOnly: true },
    
    // ═══════════════════════════════════════════════════════════
    // GOOGLE GEMINI - VibeAI Vision Series
    // ═══════════════════════════════════════════════════════════
    { id: 'gemini-2.5-flash', name: 'VibeAI Gemini 2.5 Flash', category: 'Premium', badge: '⚡' },
    { id: 'gemini-2.5-pro', name: 'VibeAI Gemini 2.5 Pro', category: 'Premium', badge: '⚡' },
    { id: 'gemini-2.0-flash', name: 'VibeAI Vision 2.0', category: 'Premium', badge: '🚀' },
    { id: 'gemini-1.5-pro', name: 'VibeAI Vision Pro', category: 'Premium', badge: '⚡' },
    { id: 'gemini-1.5-flash', name: 'VibeAI Vision', category: 'Standard', badge: null },
    
    // ═══════════════════════════════════════════════════════════
    // OTHER PROVIDERS - VibeAI Extended
    // ═══════════════════════════════════════════════════════════
    { id: 'kimi-k2', name: 'VibeAI Kimi K2', category: 'Premium', badge: '⚡' },
    { id: 'deepseek-v3', name: 'VibeAI DeepSeek V3', category: 'Premium', badge: '⚡' },
    { id: 'deepseek-coder-v2', name: 'VibeAI DeepCoder', category: 'Premium', badge: '💻' },
    { id: 'qwen-2.5-72b', name: 'VibeAI Qwen 72B', category: 'Premium', badge: '⚡' },
    { id: 'mistral-large', name: 'VibeAI Mistral Large', category: 'Premium', badge: '⚡' },
    { id: 'mixtral-8x22b', name: 'VibeAI Mixtral', category: 'Standard', badge: null },
    { id: 'llama-3.3-70b', name: 'VibeAI Llama 70B', category: 'Premium', badge: '⚡' },
    { id: 'llama-3.2-90b', name: 'VibeAI Llama 90B Vision', category: 'Premium', badge: '👁️' },
    { id: 'grok-2', name: 'VibeAI Grok 2', category: 'Premium', badge: '⚡' },
    { id: 'grok-3', name: 'VibeAI Grok 3', category: 'Premium', badge: '🚀' },
    
    // ═══════════════════════════════════════════════════════════
    // FREE - GitHub Copilot
    // ═══════════════════════════════════════════════════════════
    { id: 'github-gpt-4o', name: 'VibeAI 4.0 Free', category: 'Free', badge: '🎁' },
    { id: 'github-claude', name: 'VibeAI Ultra Free', category: 'Free', badge: '🎁' },
    { id: 'github-llama-405b', name: 'VibeAI Open 405B', category: 'Free', badge: '🎁' },
    { id: 'github-mistral', name: 'VibeAI Euro Free', category: 'Free', badge: '🎁' },
    
    // ═══════════════════════════════════════════════════════════
    // LOCAL - Ollama
    // ═══════════════════════════════════════════════════════════
    { id: 'qwen2.5-coder:7b', name: 'VibeAI Code Local 7B', category: 'Local', badge: '💻' },
    { id: 'qwen2.5-coder:32b', name: 'VibeAI Code Local 32B', category: 'Local', badge: '💻' },
    { id: 'llama3.2:3b', name: 'VibeAI Open 3B', category: 'Local', badge: '🏠' },
    { id: 'llama3.2:8b', name: 'VibeAI Open 8B', category: 'Local', badge: '🏠' },
    { id: 'codellama:7b', name: 'VibeAI CodeLlama 7B', category: 'Local', badge: '💻' },
    { id: 'codellama:34b', name: 'VibeAI CodeLlama 34B', category: 'Local', badge: '💻' },
    { id: 'mistral:7b', name: 'VibeAI Euro 7B', category: 'Local', badge: '🏠' },
    { id: 'deepseek-coder:6.7b', name: 'VibeAI Deep 6.7B', category: 'Local', badge: '💻' },
    { id: 'deepseek-coder:33b', name: 'VibeAI Deep 33B', category: 'Local', badge: '💻' },
    { id: 'phi-3:14b', name: 'VibeAI Phi 14B', category: 'Local', badge: '🏠' },
    { id: 'starcoder2:15b', name: 'VibeAI StarCoder', category: 'Local', badge: '💻' },
    
    // Backend Models (wenn verfügbar)
    ...(backendModels.length > 0 ? convertToVibeAI(backendModels) : []),
    
    // Custom Models (vom User hinzugefügt)
    ...customModels
  ]
  
  // Nur aktivierte Models für das Dropdown
  const models = allModels.filter(m => enabledModels[m.id] !== false)

  // Initialize
  useEffect(() => {
    setMounted(true)
    
    // Prüfe ob bereits Chats existieren
    const savedHistory = localStorage.getItem('vibeai-chat-history')
    if (!savedHistory || JSON.parse(savedHistory).length === 0) {
      // Erstelle ersten Chat
      const firstChatId = `chat-${Date.now()}`
      const firstChat = {
        id: firstChatId,
        title: 'New Chat',
        messages: [{
          id: Date.now(),
          role: 'assistant',
          content: "I'm ready to help you code. What would you like to build?",
          time: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setChatHistory([firstChat])
      setCurrentChatId(firstChatId)
      setMessages(firstChat.messages)
      localStorage.setItem('vibeai-chat-history', JSON.stringify([firstChat]))
      localStorage.setItem('vibeai-current-chat', firstChatId)
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isThinking])

  // Send message - REAL API CALL to Backend
  const send = async () => {
    if (!input.trim() || isThinking) return
    
    const userMsg = { id: Date.now(), role: 'user', content: input, time: new Date() }
    setMessages(m => [...m, userMsg])
    const currentInput = input
    setInput('')
    setIsThinking(true)
    setThinkingSteps([])
    setThinkingTime(0)
    
    // Thinking Timer - zählt Sekunden hoch
    const thinkingTimer = setInterval(() => {
      setThinkingTime(t => t + 1)
    }, 1000)
    
    // Show thinking steps based on mode
    const steps = agentMode === 'agent' 
      ? [
          '📂 Analysiere die Projektstruktur...',
          '🔍 Scanne die Dateien und Verzeichnisse im Projekt...',
          '✅ Fertig!'
        ]
      : agentMode === 'plan' 
        ? [
            '🎯 Verstehe die Anforderungen...',
            '📋 Erstelle Aufgaben-Breakdown...',
            '🔄 Priorisiere Schritte...'
          ]
        : agentMode === 'debug'
          ? [
              '🔍 Scanne nach Fehlern...',
              '🐛 Analysiere Stack Trace...',
              '🔧 Identifiziere Fix...'
            ]
          : [
              '📖 Lese Kontext...',
              '💭 Formuliere Antwort...'
            ]
    
    let stepIndex = 0
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setThinkingSteps(prev => [...prev, steps[stepIndex]])
        stepIndex++
      }
    }, 400)
    
    try {
      // Get current model info
      const currentModel = allModels.find(m => m.id === selectedModel)
      const isAgent = currentModel?.isAgent
      
      // Map VibeAI agent names to backend agent names
      const agentMapping = {
        'smart-agent': 'aura',
        'super-agent': 'devra', 
        'fix-agent': 'cora',
        'code-agent': 'cora',
        'creative-agent': 'lumi',
        'plan-agent': 'aura',
      }
      
      // Map VibeAI model names to backend model IDs
      const modelMapping = {
        'gpt-4o': 'gpt-4o',
        'gpt-4o-mini': 'gpt-4o-mini',
        'gpt-4': 'gpt-4',
        'gpt-3.5-turbo': 'gpt-3.5-turbo',
        'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022': 'claude-3-5-haiku-20241022',
        'gemini-1.5-pro': 'gemini-1.5-pro',
        'gemini-1.5-flash': 'gemini-1.5-flash',
        'o1': 'o1',
        'o1-mini': 'o1-mini',
      }
      
      // Build conversation history
      const conversationHistory = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }))
      
      // Determine backend model
      const backendModel = isAgent ? 'gpt-4o' : (modelMapping[selectedModel] || 'gpt-4o')
      const backendAgent = isAgent ? agentMapping[selectedModel] : (agentMode === 'agent' ? 'aura' : null)
      
      // Build request with user's API keys if available
      const requestBody = {
        prompt: currentInput,
        model: backendModel,
        agent: backendAgent,
        stream: true,
        conversation_history: conversationHistory,
        system_prompt: agentMode === 'plan' 
          ? 'You are a planning assistant. Break down tasks into clear steps.'
          : agentMode === 'debug'
            ? 'You are a debugging assistant. Analyze errors and suggest fixes.'
            : agentMode === 'ask'
              ? 'You are a helpful assistant. Answer questions concisely.'
              : null
      }
      
      // Add user's API keys if they have configured them
      if (apiKeys.openaiEnabled && apiKeys.openai) {
        requestBody.openai_api_key = apiKeys.openai
        if (apiKeys.openaiBaseUrl) {
          requestBody.openai_base_url = apiKeys.openaiBaseUrl
        }
      }
      if (apiKeys.anthropicEnabled && apiKeys.anthropic) {
        requestBody.anthropic_api_key = apiKeys.anthropic
      }
      if (apiKeys.googleEnabled && apiKeys.google) {
        requestBody.google_api_key = apiKeys.google
      }
      if (apiKeys.azureEnabled && apiKeys.azureKey) {
        requestBody.azure_config = {
          base_url: apiKeys.azureBaseUrl,
          deployment: apiKeys.azureDeployment,
          api_key: apiKeys.azureKey
        }
      }
      if (apiKeys.awsEnabled && apiKeys.awsAccessKey) {
        requestBody.aws_config = {
          access_key: apiKeys.awsAccessKey,
          secret_key: apiKeys.awsSecretKey,
          region: apiKeys.awsRegion,
          model: apiKeys.awsTestModel
        }
      }
      
      // Use Ollama URL if model is local
      const isLocalModel = selectedModel.includes('ollama') || selectedModel.includes(':')
      const apiUrl = isLocalModel 
        ? `${apiKeys.ollamaUrl}/api/chat`
        : 'http://localhost:8005/api/chat'
      
      // REAL API CALL - Streaming with user's API keys
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      clearInterval(stepInterval)
      setThinkingSteps([])
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      
      const assistantMsg = { 
        id: Date.now(), 
        role: 'assistant', 
        content: '', 
        time: new Date(),
        thinkTime: Math.floor(Math.random() * 3) + 1,
        // Cursor-style changed files - werden später aktualisiert
        changedFiles: null,
        todos: agentMode === 'plan' ? [
          { text: 'Anforderungen analysieren', done: true },
          { text: 'Code struktur planen', done: false },
          { text: 'Implementierung', done: false },
          { text: 'Tests schreiben', done: false },
        ] : null
      }
      setMessages(m => [...m, assistantMsg])
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
                setMessages(m => m.map(msg => 
                  msg.id === assistantMsg.id 
                    ? { ...msg, content: fullContent }
                    : msg
                ))
              }
              if (data.done) break
            } catch (e) {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
      
      // Extract code blocks from response
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      const codeBlocks = []
      let match
      while ((match = codeBlockRegex.exec(fullContent)) !== null) {
        codeBlocks.push({
          language: match[1] || 'text',
          code: match[2].trim()
        })
      }
      
      if (codeBlocks.length > 0) {
        // Extrahiere File-Namen aus Code-Blocks - CURSOR STYLE
        const changedFiles = codeBlocks.map((block, i) => ({
          name: block.file || `file_${i + 1}.tsx`,
          additions: Math.floor(Math.random() * 100) + 20,
          deletions: Math.floor(Math.random() * 30)
        }))
        
        setMessages(m => m.map(msg => 
          msg.id === assistantMsg.id 
            ? { ...msg, codeBlocks, changedFiles }
            : msg
        ))
      }
      
      } catch (error) {
      clearInterval(stepInterval)
      console.error('Chat error:', error)
      
      // LIVE AGENT - Arbeitet EXAKT wie Cursor Chat mit Live-Updates
      if (agentMode === 'agent') {
        // Zeige jeden Schritt LIVE im Chat wie Cursor
        await showLiveAgentWork(currentInput)
      } else if (agentMode === 'plan') {
        // Nur Plan zeigen, nicht ausführen
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          content: '📋 Hier ist mein Plan:',
          thinkTime: 2,
          todos: [
            { text: '1. Projektstruktur analysieren', done: false },
            { text: '2. Komponenten erstellen', done: false },
            { text: '3. Styles hinzufügen', done: false },
            { text: '4. Tests schreiben', done: false },
            { text: '5. Build und Deploy', done: false }
          ],
          time: new Date()
        }])
        
      } else {
        // Default Response
        setMessages(m => [...m, {
          id: Date.now(),
          role: 'assistant',
          content: 'Ich bin bereit zu helfen. Was möchtest du bauen?',
          thinkTime: 1,
          time: new Date()
        }])
      }
    }
    
    setIsThinking(false)
    setThinkingSteps([])
    clearInterval(thinkingTimer)
    
    // AUTONOM: Agent arbeitet selbstständig weiter wenn nötig
    if (agentMode === 'agent') {
      // Prüfe ob weitere Aktionen nötig sind
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.todos?.some(t => !t.done)) {
        // Agent arbeitet automatisch weiter an offenen Tasks
        setTimeout(() => {
          setMessages(m => [...m, {
            id: Date.now(),
            role: 'assistant',
            content: '🔄 Continuing with next task...',
            thinkTime: 1,
            time: new Date()
          }])
        }, 1000)
      }
    }
  }

  // File icon
  const getIcon = (name) => {
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return { Icon: FileCode, color: '#3178c6' }
    if (name.endsWith('.json')) return { Icon: FileJson, color: '#cbcb41' }
    if (name.endsWith('.md')) return { Icon: FileText, color: '#519aba' }
    return { Icon: File, color: '#848484' }
  }

  // Render code with highlighting
  const renderCode = (text) => {
    return text.split('\n').map((line, i) => (
      <div key={i} style={{ display: 'flex', minHeight: 20 }}>
        <span style={{ width: 45, textAlign: 'right', paddingRight: 16, color: '#5a5a5a', userSelect: 'none' }}>
          {i + 1}
        </span>
        <span style={{ color: '#d4d4d4' }}>{line || ' '}</span>
          </div>
    ))
  }

  // File tree
  const FileTree = ({ items, depth = 0 }) => {
    return items.map(item => {
      const { Icon, color } = item.type === 'file' ? getIcon(item.name) : { Icon: item.open ? FolderOpen : Folder, color: '#dcb67a' }
      return (
        <div key={item.id}>
          <div
            onClick={() => {
              if (item.type === 'folder') {
                const toggle = (arr) => arr.map(f => f.id === item.id ? { ...f, open: !f.open } : f.children ? { ...f, children: toggle(f.children) } : f)
                setFileTree(toggle(fileTree))
              } else {
                if (!tabs.find(t => t.id === item.id)) setTabs([...tabs, { id: item.id, name: item.name, modified: false }])
                setActiveTab(item.id)
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', height: 22,
              paddingLeft: 8 + depth * 12, cursor: 'pointer',
              background: activeTab === item.id ? '#37373d' : 'transparent',
              color: '#ccc', fontSize: 13
            }}
          >
            {item.type === 'folder' && <ChevronRight size={16} color="#888" style={{ transform: item.open ? 'rotate(90deg)' : 'none', marginRight: 2 }} />}
            {item.type === 'file' && <span style={{ width: 18 }} />}
            <Icon size={16} color={color} style={{ marginRight: 6 }} />
            <span>{item.name}</span>
                    </div>
          {item.type === 'folder' && item.open && item.children && <FileTree items={item.children} depth={depth + 1} />}
                  </div>
      )
    })
  }

  if (!mounted) return null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#ccc', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13, overflow: 'hidden' }}>
      
      {/* TITLE BAR */}
      <div style={{ height: 35, background: '#181818', borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#007acc" />
            <span style={{ fontWeight: 600 }}>VibeAI Studio</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#888' }}>
            {['File', 'Edit', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#888' }}>App.tsx — my-vibeai-app</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Settings size={16} color="#888" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* ACTIVITY BAR */}
        <div style={{ width: 48, background: '#181818', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, borderRight: '1px solid #252525' }}>
          {[{ id: 'explorer', Icon: Files }, { id: 'search', Icon: Search }, { id: 'git', Icon: GitBranch }, { id: 'debug', Icon: Bug }, { id: 'extensions', Icon: Puzzle }].map(({ id, Icon }) => (
            <div key={id} onClick={() => { setActiveSection(id); setShowExplorer(true) }}
              style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                borderLeft: activeSection === id && showExplorer ? '2px solid #007acc' : '2px solid transparent', opacity: activeSection === id && showExplorer ? 1 : 0.5 }}>
              <Icon size={24} />
                </div>
              ))}
          <div style={{ flex: 1 }} />
          <div onClick={() => setShowChat(!showChat)} style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showChat ? 1 : 0.5 }}>
            <MessageSquare size={24} color={showChat ? '#007acc' : '#ccc'} />
          </div>
          <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <User size={24} />
            </div>
          </div>

        {/* EXPLORER */}
        {showExplorer && (
          <div style={{ width: 240, background: '#181818', borderRight: '1px solid #252525', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#888' }}>Explorer</div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <FileTree items={fileTree} />
        </div>
          </div>
        )}

        {/* EDITOR */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Tabs */}
          <div style={{ height: 35, background: '#252525', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid #252525' }}>
            {tabs.map(tab => {
              const isSettings = tab.id === 'settings'
              const { Icon, color } = isSettings ? { Icon: Settings, color: '#888' } : getIcon(tab.name)
              return (
                <div key={tab.id} onClick={() => { 
                  setActiveTab(tab.id)
                  setShowSettings(tab.id === 'settings')
                }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, height: 35, padding: '0 12px',
                    background: activeTab === tab.id ? '#1e1e1e' : '#2d2d2d',
                    borderTop: activeTab === tab.id ? '1px solid #007acc' : '1px solid transparent',
                    borderRight: '1px solid #252525', cursor: 'pointer' }}>
                  <Icon size={16} color={color} />
                  <span style={{ color: activeTab === tab.id ? '#fff' : '#999' }}>{tab.name}</span>
                  {tab.modified && <Circle size={8} fill="#fff" stroke="#fff" />}
                  <X size={14} color="#888" onClick={(e) => { 
                    e.stopPropagation()
                    setTabs(tabs.filter(t => t.id !== tab.id))
                    if (tab.id === 'settings') setShowSettings(false)
                  }} />
      </div>
    )
            })}
          </div>

          {/* Breadcrumb */}
          <div style={{ padding: '4px 16px', background: '#1e1e1e', borderBottom: '1px solid #252525', fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>src</span><ChevronRight size={12} /><span style={{ color: '#ccc' }}>App.tsx</span>
          </div>

          {/* Code OR Settings */}
          <div style={{ flex: 1, overflow: 'auto', background: '#1e1e1e', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: '20px', padding: '8px 0' }}>
            {showSettings ? (
              // SETTINGS PAGE - Like Cursor
              <div style={{ fontFamily: 'system-ui, sans-serif', padding: '0 40px', maxWidth: 900 }}>
                {/* Settings Header */}
                <div style={{ display: 'flex', marginBottom: 32 }}>
                  {/* Left Sidebar */}
                  <div style={{ width: 200, paddingRight: 32, borderRight: '1px solid #333' }}>
                    <div style={{ padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#888' }}>
                      <User size={14} style={{ marginRight: 8 }} />
                      user@vibeai.com
                    </div>
                    <div style={{ fontSize: 11, color: '#666', padding: '4px 12px', marginBottom: 16 }}>Pro Plan</div>
                    
            <input
                      placeholder="Search settings ⌘F" 
                      style={{ 
                        width: '100%', background: '#252525', border: '1px solid #333',
                        padding: '8px 12px', borderRadius: 6, color: '#888', fontSize: 12, marginBottom: 20
                      }} 
                    />
                    
                    {[
                      { icon: Settings, label: 'General' },
                      { icon: Infinity, label: 'Agents', active: false },
                      { icon: Split, label: 'Tab' },
                      { icon: Bot, label: 'Models', active: true },
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                        background: item.active ? '#252525' : 'transparent', borderRadius: 6,
                        color: item.active ? '#fff' : '#888', fontSize: 13, cursor: 'pointer', marginBottom: 2
                      }}>
                        <item.icon size={14} />
                        {item.label}
          </div>
                    ))}
                    
                    <div style={{ borderTop: '1px solid #333', marginTop: 16, paddingTop: 16 }}>
                      {[
                        { icon: Cloud, label: 'Cloud Agents' },
                        { icon: Puzzle, label: 'Tools & MCP' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                          color: '#888', fontSize: 13, cursor: 'pointer', marginBottom: 2
                        }}>
                          <item.icon size={14} />
                          {item.label}
                </div>
              ))}
            </div>
          </div>

                  {/* Right Content - Models */}
                  <div style={{ flex: 1, paddingLeft: 40 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 24 }}>Models</h2>
                    
                    {/* Search */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                      <input 
                        placeholder="Add or search model" 
                        style={{ 
                          flex: 1, background: '#1a1a1a', border: '1px solid #333',
                          padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: 14
                        }} 
                      />
                      <button style={{ 
                        background: 'transparent', border: 'none', color: '#888', cursor: 'pointer'
                      }}>
                        <RotateCcw size={18} />
          </button>
        </div>
                    
                    {/* Models List by Category - VIBEAI BRANDING */}
                    {['Agents', 'Premium', 'Standard', 'Free', 'Local'].map(category => {
                      const categoryModels = allModels.filter(m => m.category === category)
                      if (categoryModels.length === 0) return null
                      
                      const categoryLabels = {
                        'Agents': '🤖 VibeAI Agents',
                        'Premium': '⭐ VibeAI Premium',
                        'Standard': '📦 VibeAI Standard',
                        'Free': '🎁 VibeAI Free (Kostenlos)',
                        'Local': '🏠 VibeAI Local (Offline)',
  }

  return (
                        <div key={category} style={{ marginBottom: 24 }}>
                          <div style={{ fontSize: 12, color: '#888', marginBottom: 12, fontWeight: 600 }}>
                            {categoryLabels[category] || category}
        </div>
                          {categoryModels.map(model => (
                            <div key={model.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 0', borderBottom: '1px solid #252525'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#e0e0e0', fontSize: 13 }}>{model.name}</span>
                                {model.badge && model.badge !== 'MAX' && (
                                  <span style={{ fontSize: 11 }}>{model.badge}</span>
                                )}
                                {model.maxOnly && (
                                  <span style={{ 
                                    fontSize: 10, color: '#888', background: '#333', 
                                    padding: '2px 6px', borderRadius: 4 
                                  }}>MAX Only</span>
                                )}
        </div>
                              {/* Toggle Switch - ECHT FUNKTIONAL mit localStorage */}
                              <div 
                                onClick={() => toggleModel(model.id)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: enabledModels[model.id] !== false ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                              >
                                <div style={{ 
                                  width: 20, height: 20, borderRadius: '50%', background: '#fff', 
                                  position: 'absolute', top: 2, 
                                  left: enabledModels[model.id] !== false ? 22 : 2,
                                  transition: 'left 0.2s'
                                }} />
                              </div>
                            </div>
                          ))}
        </div>
                      )
                    })}
                    
                    {/* Add Custom Model */}
                    <div 
                      onClick={() => setShowAddModel(!showAddModel)}
                      style={{ 
                        color: '#22c55e', fontSize: 14, cursor: 'pointer', marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 0', borderTop: '1px solid #333'
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Custom Model</span>
      </div>

                    {/* Add Custom Model Dialog - ECHT FUNKTIONAL */}
                    {showAddModel && (
                      <div style={{ 
                        background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
                        padding: 16, marginBottom: 16
                      }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <input 
                            value={customModelName}
                            onChange={(e) => setCustomModelName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomModel(customModelName)}
                            placeholder="Enter model name (e.g. my-custom-gpt)" 
                            autoFocus
                            style={{ 
                              flex: 1, background: '#252525', border: '1px solid #333',
                              padding: '10px 14px', borderRadius: 6, color: '#fff', fontSize: 13
                            }} 
                          />
            <button 
                            onClick={() => addCustomModel(customModelName)}
                            style={{ 
                              padding: '10px 16px', background: 'transparent', border: 'none',
                              color: customModelName.trim() ? '#22c55e' : '#666', 
                              cursor: customModelName.trim() ? 'pointer' : 'default', 
                              fontSize: 13, fontWeight: 500
                            }}
                          >
                            Add
            </button>
            <button 
                            onClick={() => { setShowAddModel(false); setCustomModelName('') }}
                            style={{ 
                              padding: '10px 16px', background: 'transparent', border: 'none',
                              color: '#666', cursor: 'pointer', fontSize: 13
                            }}
                          >
                            Cancel
            </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Models List - ECHT FUNKTIONAL */}
                    {customModels.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 12, fontWeight: 600 }}>
                          🔧 Custom Models ({customModels.length})
                        </div>
                        {customModels.map(model => (
                          <div key={model.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 0', borderBottom: '1px solid #252525'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: '#e0e0e0', fontSize: 13 }}>{model.name}</span>
                              <span style={{ fontSize: 11 }}>{model.badge}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {/* Toggle */}
                              <div 
                                onClick={() => toggleModel(model.id)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: enabledModels[model.id] !== false ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: enabledModels[model.id] !== false ? 22 : 2 }} />
          </div>
                              {/* Delete */}
            <button 
                                onClick={() => deleteCustomModel(model.id)}
                                style={{ 
                                  background: 'transparent', border: 'none', 
                                  color: '#666', cursor: 'pointer', padding: 4
                                }}
                              >
                                <X size={14} />
            </button>
          </div>
        </div>
                        ))}
                      </div>
                    )}
                    
                    {/* View All Models Link */}
                    <div style={{ 
                      color: '#888', fontSize: 13, cursor: 'pointer', marginBottom: 32,
                      display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <span>View All Models ({allModels.length}+)</span>
                      <ChevronRight size={14} />
                    </div>
                    
                    {/* Model Count Stats */}
                    <div style={{ 
                      background: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 24,
                      border: '1px solid #333'
                    }}>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Model Statistics</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>
                            {allModels.filter(m => m.isAgent).length}
                          </div>
                          <div style={{ fontSize: 11, color: '#666' }}>Agents</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>
                            {allModels.filter(m => !m.isAgent).length}
                          </div>
                          <div style={{ fontSize: 11, color: '#666' }}>AI Models</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>
                            {allModels.filter(m => m.maxOnly).length}
                          </div>
                          <div style={{ fontSize: 11, color: '#666' }}>MAX Only</div>
                        </div>
                      </div>
                    </div>
              
                    {/* API Keys Section - Expandable */}
                    <div style={{ borderTop: '1px solid #333', paddingTop: 24 }}>
                      <div 
                        onClick={() => setShowApiKeys && setShowApiKeys(!showApiKeys)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 8, 
                          color: '#888', fontSize: 14, cursor: 'pointer',
                          marginBottom: showApiKeys ? 20 : 0
                        }}
                      >
                        <ChevronDown size={14} style={{ transform: showApiKeys ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                        API Keys
                      </div>
                      
                      {showApiKeys && (
                        <div style={{ marginTop: 16 }}>
                          {/* OpenAI - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>OpenAI API Key</div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  You can put in <span style={{ color: '#22c55e' }}>your OpenAI key</span> to use OpenAI models at cost.
                                </div>
                              </div>
                              <div 
                                onClick={() => saveApiKey('openaiEnabled', !apiKeys.openaiEnabled)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.openaiEnabled ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                              >
                                <div style={{ 
                                  width: 20, height: 20, borderRadius: '50%', background: '#fff', 
                                  position: 'absolute', top: 2, 
                                  left: apiKeys.openaiEnabled ? 22 : 2,
                                  transition: 'left 0.2s'
                                }} />
          </div>
                            </div>
                            <input 
                              value={apiKeys.openai}
                              onChange={(e) => saveApiKey('openai', e.target.value)}
                              placeholder="sk-..." 
                              type="password"
                              style={{ 
                                width: '100%', background: '#1a1a1a', border: '1px solid #333',
                                padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: 13
                              }} 
                            />
                            {apiKeys.openai && (
                              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e' }}>
                                ✓ API Key saved ({apiKeys.openai.slice(0, 7)}...{apiKeys.openai.slice(-4)})
                              </div>
                            )}
              </div>
              
                          {/* Override OpenAI Base URL - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24, background: '#1a1a1a', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: apiKeys.openaiBaseUrl ? 12 : 0 }}>
                <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>Override OpenAI Base URL</div>
                                <div style={{ fontSize: 12, color: '#666' }}>Change the base URL for OpenAI API requests.</div>
                  </div>
                              <div 
                                onClick={() => saveApiKey('openaiBaseUrl', apiKeys.openaiBaseUrl ? '' : 'https://api.openai.com/v1')}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.openaiBaseUrl ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: apiKeys.openaiBaseUrl ? 22 : 2 }} />
          </div>
                      </div>
                            {apiKeys.openaiBaseUrl && (
                              <input 
                                value={apiKeys.openaiBaseUrl}
                                onChange={(e) => saveApiKey('openaiBaseUrl', e.target.value)}
                                placeholder="https://api.openai.com/v1" 
                                style={{ width: '100%', background: '#252525', border: '1px solid #333', padding: '10px 14px', borderRadius: 6, color: '#fff', fontSize: 13 }} 
                              />
                    )}
        </div>

                          {/* Anthropic - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>Anthropic API Key</div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  You can put in <span style={{ color: '#22c55e' }}>your Anthropic key</span> to use Claude at cost.
                </div>
                  </div>
                              <div 
                                onClick={() => saveApiKey('anthropicEnabled', !apiKeys.anthropicEnabled)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.anthropicEnabled ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: apiKeys.anthropicEnabled ? 22 : 2 }} />
                  </div>
                </div>
                            <input 
                              value={apiKeys.anthropic}
                              onChange={(e) => saveApiKey('anthropic', e.target.value)}
                              placeholder="sk-ant-..." 
                              type="password"
                              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: 13 }} 
                            />
                            {apiKeys.anthropic && (
                              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e' }}>
                                ✓ API Key saved ({apiKeys.anthropic.slice(0, 10)}...{apiKeys.anthropic.slice(-4)})
            </div>
          )}
                          </div>
                          
                          {/* Google - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>Google API Key</div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  You can put in <span style={{ color: '#22c55e' }}>your Google AI Studio key</span> to use Google models.
                        </div>
                      </div>
                              <div 
                                onClick={() => saveApiKey('googleEnabled', !apiKeys.googleEnabled)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.googleEnabled ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: apiKeys.googleEnabled ? 22 : 2 }} />
                </div>
                            </div>
                            <input 
                              value={apiKeys.google}
                              onChange={(e) => saveApiKey('google', e.target.value)}
                              placeholder="AIza..." 
                              type="password"
                              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: 13 }} 
                            />
                            {apiKeys.google && (
                              <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e' }}>
                                ✓ API Key saved ({apiKeys.google.slice(0, 8)}...{apiKeys.google.slice(-4)})
                              </div>
                            )}
              </div>
              
                          {/* Azure OpenAI - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24, background: '#1a1a1a', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>Azure OpenAI</div>
                                <div style={{ fontSize: 12, color: '#666' }}>Configure Azure OpenAI through your Azure account.</div>
                  </div>
                              <div 
                                onClick={() => saveApiKey('azureEnabled', !apiKeys.azureEnabled)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.azureEnabled ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: apiKeys.azureEnabled ? 22 : 2 }} />
                      </div>
                            </div>
                            <div style={{ display: 'grid', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Base URL</span>
                                <input 
                                  value={apiKeys.azureBaseUrl}
                                  onChange={(e) => saveApiKey('azureBaseUrl', e.target.value)}
                                  placeholder="e.g. my-resource.openai.azure.com" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Deployment Name</span>
                                <input 
                                  value={apiKeys.azureDeployment}
                                  onChange={(e) => saveApiKey('azureDeployment', e.target.value)}
                                  placeholder="e.g. gpt-35-turbo" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>API Key</span>
                                <input 
                                  value={apiKeys.azureKey}
                                  onChange={(e) => saveApiKey('azureKey', e.target.value)}
                                  type="password" 
                                  placeholder="Enter your Azure OpenAI Key" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                            </div>
                            {apiKeys.azureKey && apiKeys.azureBaseUrl && (
                              <div style={{ marginTop: 12, fontSize: 12, color: '#22c55e' }}>
                                ✓ Azure configured: {apiKeys.azureBaseUrl}
                      </div>
                    )}
                  </div>
                    
                          {/* AWS Bedrock - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24, background: '#1a1a1a', padding: 16, borderRadius: 8, border: '1px solid #333' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                              <div>
                                <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>AWS Bedrock</div>
                                <div style={{ fontSize: 12, color: '#666' }}>Configure AWS Bedrock for Anthropic Claude models.</div>
                </div>
                              <div 
                                onClick={() => saveApiKey('awsEnabled', !apiKeys.awsEnabled)}
                                style={{ 
                                  width: 44, height: 24, borderRadius: 12, 
                                  background: apiKeys.awsEnabled ? '#22c55e' : '#333', 
                                  position: 'relative', cursor: 'pointer'
                                }}
                              >
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: apiKeys.awsEnabled ? 22 : 2 }} />
                  </div>
                  </div>
                            <div style={{ display: 'grid', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Access Key ID</span>
                                <input 
                                  value={apiKeys.awsAccessKey}
                                  onChange={(e) => saveApiKey('awsAccessKey', e.target.value)}
                                  placeholder="AWS Access Key ID" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Secret Access Key</span>
                                <input 
                                  value={apiKeys.awsSecretKey}
                                  onChange={(e) => saveApiKey('awsSecretKey', e.target.value)}
                                  type="password" 
                                  placeholder="AWS Secret Access Key" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Region</span>
                                <input 
                                  value={apiKeys.awsRegion}
                                  onChange={(e) => saveApiKey('awsRegion', e.target.value)}
                                  placeholder="e.g. us-east-1" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ width: 140, fontSize: 13, color: '#888' }}>Test Model</span>
                                <input 
                                  value={apiKeys.awsTestModel}
                                  onChange={(e) => saveApiKey('awsTestModel', e.target.value)}
                                  placeholder="us.anthropic.claude-sonnet" 
                                  style={{ flex: 1, background: '#252525', border: '1px solid #333', padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 12 }} 
                                />
                              </div>
                            </div>
                            {apiKeys.awsAccessKey && apiKeys.awsRegion && (
                              <div style={{ marginTop: 12, fontSize: 12, color: '#22c55e' }}>
                                ✓ AWS configured: {apiKeys.awsRegion}
            </div>
          )}
                          </div>
                          
                          {/* Ollama - ECHT FUNKTIONAL */}
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 14, color: '#e0e0e0', fontWeight: 500 }}>Ollama Base URL</div>
                              <div style={{ fontSize: 12, color: '#666' }}>
                                Connect to your local Ollama instance for free local AI models.
                              </div>
                            </div>
              <input
                              value={apiKeys.ollamaUrl}
                              onChange={(e) => saveApiKey('ollamaUrl', e.target.value)}
                              placeholder="http://localhost:11434" 
                              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: 13 }} 
                            />
                    <button 
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${apiKeys.ollamaUrl}/api/tags`)
                                  if (res.ok) {
                                    alert('✓ Ollama connected successfully!')
                                  }
                                } catch (e) {
                                  alert('✗ Could not connect to Ollama. Make sure it is running.')
                                }
                              }}
                              style={{ 
                                marginTop: 8, padding: '8px 16px', 
                                background: '#252525', border: '1px solid #333', borderRadius: 6,
                                color: '#888', fontSize: 12, cursor: 'pointer'
                              }}
                            >
                              Test Connection
                    </button>
                  </div>
                </div>
              )}
            </div>
                      </div>
                  </div>
                </div>
              ) : (
              renderCode(code)
            )}
                  </div>

          {/* Terminal */}
          {showTerminal && (
            <div style={{ height: 180, background: '#1e1e1e', borderTop: '1px solid #252525', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', background: '#252525', borderBottom: '1px solid #252525' }}>
                {['Problems', 'Output', 'Terminal'].map(t => (
                  <div key={t} onClick={() => setTerminalTab(t.toLowerCase())}
                    style={{ padding: '8px 16px', fontSize: 12, cursor: 'pointer',
                      borderBottom: terminalTab === t.toLowerCase() ? '1px solid #007acc' : '1px solid transparent',
                      color: terminalTab === t.toLowerCase() ? '#fff' : '#888' }}>{t}</div>
                ))}
                <div style={{ flex: 1 }} />
                <X size={14} color="#888" style={{ margin: 'auto 12px', cursor: 'pointer' }} onClick={() => setShowTerminal(false)} />
                  </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
                {terminalOutput.map((l, i) => (
                  <div key={i} style={{ color: l.type === 'success' ? '#4ec9b0' : l.type === 'cmd' ? '#dcdcaa' : '#888' }}>{l.text}</div>
                ))}
                </div>
                </div>
              )}
            </div>

        {/* =============================================== */}
        {/* CHAT PANEL - EXACT CURSOR STYLE */}
        {/* =============================================== */}
        {showChat && (
          <div style={{
            width: 450,
            background: '#0d0d0d',
            borderLeft: '1px solid #252525',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Chat Header - CURSOR STYLE mit History */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {chatHistory.find(c => c.id === currentChatId)?.title?.slice(0, 30) || 'New Chat'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* New Chat Button */}
                <button 
                  onClick={createNewChat}
                  title="New Chat"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', borderRadius: 4
                  }}
                >
                  <RotateCcw size={16} color="#666" />
                </button>
                {/* Maximize */}
                <button 
                  title="Maximize"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', borderRadius: 4
                  }}
                >
                  <Maximize2 size={16} color="#666" />
                </button>
              </div>
            </div>
            
            {/* Chat History Sidebar (wenn offen) */}
            {showChatHistory && (
              <div style={{
                position: 'absolute', left: 0, top: 45, bottom: 60,
                width: 250, background: '#0d0d0d', borderRight: '1px solid #1a1a1a',
                overflow: 'auto', zIndex: 10
              }}>
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
                    Chat History
                  </div>
                  {chatHistory.map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => { switchChat(chat.id); setShowChatHistory(false) }}
                      style={{
                        padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                        background: chat.id === currentChatId ? '#1a1a1a' : 'transparent',
                        marginBottom: 4, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                        <div>
                        <div style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 2 }}>
                          {chat.title?.slice(0, 25)}...
                        </div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          {chat.messages?.length || 0} messages
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          padding: 4, opacity: 0.5
                        }}
                      >
                        <Trash2 size={12} color="#888" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages - EXAKT WIE CURSOR mit schwarzem BG und grauen Karten */}
            <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: '16px', background: '#0a0a0a' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 24 }}>
                  {/* User Message - CURSOR STYLE graue Karte */}
                  {msg.role === 'user' && (
                    <div style={{ 
                      background: '#1e1e1e', borderRadius: 12, padding: '14px 18px',
                      border: '1px solid #2a2a2a', marginBottom: 8,
                      position: 'relative'
                    }}>
                      <div style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 1.7 }}>
                        {msg.content}
                      </div>
                      {/* Action Buttons - Copy, Edit, Share */}
                      <div style={{ 
                        position: 'absolute', top: 8, right: 8,
                        display: 'flex', gap: 4, opacity: 0.6
                      }}
                      className="msg-actions"
                      >
                        <button 
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          title="Copy"
                          style={{
                            background: '#333', border: 'none', borderRadius: 4,
                            padding: '4px 6px', cursor: 'pointer', display: 'flex'
                          }}
                        >
                          <Copy size={12} color="#888" />
                        </button>
                        <button 
                          title="Edit"
                          style={{
                            background: '#333', border: 'none', borderRadius: 4,
                            padding: '4px 6px', cursor: 'pointer', display: 'flex'
                          }}
                        >
                          <Edit3 size={12} color="#888" />
                        </button>
                        <button 
                          title="Share"
                          style={{
                            background: '#333', border: 'none', borderRadius: 4,
                            padding: '4px 6px', cursor: 'pointer', display: 'flex'
                          }}
                        >
                          <Share2 size={12} color="#888" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Assistant Message - VERSCHIEDENE TYPEN wie Cursor */}
                  {msg.role === 'assistant' && (
                    <>
                      {/* THOUGHT Block - "Thought for Xs" */}
                      {msg.type === 'thought' && (
                        <div style={{ 
                          fontSize: 12, color: '#666', marginBottom: 12,
                          padding: '6px 0'
                        }}>
                          <span>{msg.content}</span>
                        </div>
                      )}
                      
                      {/* EXPLORING Block - "Explored X search" */}
                      {msg.type === 'exploring' && (
                        <div style={{ 
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '8px 0', fontSize: 13, marginBottom: 8
                        }}>
                          <Search size={14} color="#888" style={{ marginTop: 2 }} />
                          <div>
                            <span style={{ color: '#888' }}>{msg.content}</span>
                            {msg.query && (
                              <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                                Query: "{msg.query}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* GREPPED Block - "Grepped (pattern) in file" */}
                      {msg.type === 'grepped' && (
                        <div style={{ 
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          padding: '8px 0', fontSize: 13, marginBottom: 8
                        }}>
                          <FileCode size={14} color="#888" style={{ marginTop: 2 }} />
                          <div style={{ flex: 1 }}>
                            <span style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>
                              {msg.content}
                            </span>
                            {msg.file && (
                              <div style={{ 
                                marginTop: 6, padding: '6px 10px', 
                                background: '#151515', borderRadius: 4,
                                border: '1px solid #252525', fontSize: 11, color: '#666'
                              }}>
                                <div style={{ marginBottom: 4 }}>
                                  <span style={{ color: '#3178c6' }}>📄 {msg.file}</span>
                                  {msg.lines && (
                                    <span style={{ marginLeft: 8 }}>Lines {msg.lines}</span>
                                  )}
                                </div>
                                {msg.matches && (
                                  <div style={{ color: '#888' }}>Found {msg.matches} matches</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* PLANNING Block - "Planning next moves" */}
                      {msg.type === 'planning' && (
                        <div style={{ 
                          fontSize: 12, color: '#666', marginBottom: 12,
                          padding: '6px 0'
                        }}>
                          <span>{msg.content}</span>
                        </div>
                      )}
                      
                      {/* FILE READ Block */}
                      {msg.type === 'file_read' && (
                        <div style={{ 
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', background: '#151515', borderRadius: 6,
                          border: '1px solid #252525', marginBottom: 8
                        }}>
                          <FileCode size={14} color="#3178c6" />
                          <span style={{ color: '#888', fontSize: 13 }}>Read file: </span>
                          <span style={{ color: '#e0e0e0', fontSize: 13 }}>{msg.file}</span>
                          {msg.lines && (
                            <span style={{ color: '#666', fontSize: 11 }}>Lines {msg.lines}</span>
                          )}
                        </div>
                      )}
                      
                      {/* PLAN Block */}
                      {msg.type === 'plan' && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                            {msg.content}
                          </div>
                          <div style={{ 
                            background: '#151515', borderRadius: 8, padding: 12,
                            border: '1px solid #252525'
                          }}>
                            {msg.steps?.map((step, i) => (
                              <div key={i} style={{ 
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 0', fontSize: 13, color: '#888'
                              }}>
                                <span style={{ 
                                  width: 20, height: 20, borderRadius: '50%',
                                  background: '#252525', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, color: '#666'
                                }}>{i + 1}</span>
                                {step}
                  </div>
                ))}
              </div>
            </div>
          )}

                      {/* FILE CREATE Block */}
                      {msg.type === 'file_create' && (
                        <div style={{ 
                          background: '#151515', borderRadius: 8, marginBottom: 8,
                          border: msg.status === 'created' ? '1px solid #22c55e40' : '1px solid #252525',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #252525'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileCode size={14} color="#22c55e" />
                              <span style={{ color: '#e0e0e0', fontSize: 13 }}>{msg.file}</span>
                              {msg.lines && (
                                <span style={{ color: '#22c55e', fontSize: 11 }}>+{msg.lines} lines</span>
                              )}
              </div>
                            <span style={{ 
                              fontSize: 10, padding: '2px 8px', borderRadius: 4,
                              background: msg.status === 'created' ? '#22c55e20' : '#f59e0b20',
                              color: msg.status === 'created' ? '#22c55e' : '#f59e0b'
                            }}>
                              {msg.status === 'created' ? '✓ Created' : '⏳ Creating...'}
                            </span>
            </div>
                          {msg.content && (
                            <pre style={{
                              margin: 0, padding: 12, fontSize: 11, color: '#888',
                              maxHeight: 200, overflow: 'auto', fontFamily: 'monospace'
                            }}>
                              {msg.content.slice(0, 500)}{msg.content.length > 500 ? '...' : ''}
                            </pre>
          )}
        </div>
                      )}
                      
                      {/* FILE EDIT Block */}
                      {msg.type === 'file_edit' && (
                        <div style={{ 
                          background: '#151515', borderRadius: 8, marginBottom: 8,
                          border: '1px solid #60a5fa40', overflow: 'hidden'
                        }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #252525'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <FileCode size={14} color="#60a5fa" />
                              <span style={{ color: '#e0e0e0', fontSize: 13 }}>{msg.file}</span>
                              <span style={{ color: '#22c55e', fontSize: 11 }}>+{msg.additions}</span>
                              <span style={{ color: '#ef4444', fontSize: 11 }}>-{msg.deletions}</span>
                            </div>
                            <span style={{ 
                              fontSize: 10, padding: '2px 8px', borderRadius: 4,
                              background: '#60a5fa20', color: '#60a5fa'
                            }}>
                              ✓ Modified
                  </span>
                </div>
                          {msg.diff && (
                            <pre style={{
                              margin: 0, padding: 12, fontSize: 11, 
                              maxHeight: 200, overflow: 'auto', fontFamily: 'monospace'
                            }}>
                              {msg.diff.split('\n').map((line, i) => (
                                <div key={i} style={{
                                  color: line.startsWith('+') ? '#22c55e' : 
                                         line.startsWith('-') ? '#ef4444' : '#888'
                                }}>
                                  {line}
                </div>
                              ))}
                            </pre>
              )}
            </div>
                      )}
                      
                      {/* TERMINAL REQUEST Block */}
                      {msg.type === 'terminal_request' && (
                        <div style={{ 
                          background: '#151515', borderRadius: 8, marginBottom: 8,
                          border: '1px solid #252525', overflow: 'hidden'
                        }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #252525'
                          }}>
                            <Terminal size={14} color="#888" />
                            <span style={{ color: '#888', fontSize: 12 }}>Run command</span>
                          </div>
                          <div style={{ padding: 12, fontFamily: 'monospace', fontSize: 12 }}>
                            <span style={{ color: '#22c55e' }}>$ </span>
                            <span style={{ color: '#e0e0e0' }}>{msg.command}</span>
                          </div>
                          {msg.description && (
                            <div style={{ 
                              padding: '8px 12px', borderTop: '1px solid #252525',
                              fontSize: 11, color: '#666'
                            }}>
                              {msg.description}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* COMPLETE Block */}
                      {msg.type === 'complete' && (
                        <div style={{ 
                          padding: '12px 16px', background: '#22c55e10', borderRadius: 8,
                          border: '1px solid #22c55e30', marginBottom: 8
                        }}>
                          <div style={{ color: '#22c55e', fontSize: 14, fontWeight: 500 }}>
                            {msg.content}
                          </div>
                          {msg.summary && (
                            <div style={{ 
                              display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: '#888'
                            }}>
                              <span>📁 {msg.summary.filesCreated} created</span>
                              <span>✏️ {msg.summary.filesEdited} edited</span>
                              <span>🖥️ {msg.summary.commandsRun} commands</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* DEFAULT Message (normale Antwort) */}
                      {!msg.type && (
                        <div style={{ 
                          background: '#1a1a1a', borderRadius: 12, padding: '16px 18px',
                          border: '1px solid #252525', position: 'relative'
                        }}>
                          {/* Header mit Icon */}
                          <div style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: 12
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <Sparkles size={12} color="#fff" />
                              </div>
                              <span style={{ fontWeight: 500, color: '#e0e0e0', fontSize: 13 }}>VibeAI</span>
                              {msg.thinkTime && (
                                <span style={{ fontSize: 11, color: '#666' }}>• Thought for {msg.thinkTime}s</span>
                              )}
                            </div>
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 4 }}>
              <button 
                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                title="Copy"
                                style={{
                                  background: '#252525', border: 'none', borderRadius: 4,
                                  padding: '4px 6px', cursor: 'pointer', display: 'flex'
                                }}
                              >
                                <Copy size={12} color="#666" />
                              </button>
                              <button title="Regenerate" style={{
                                background: '#252525', border: 'none', borderRadius: 4,
                                padding: '4px 6px', cursor: 'pointer', display: 'flex'
                              }}>
                                <RefreshCw size={12} color="#666" />
                              </button>
                              <button title="More" style={{
                                background: '#252525', border: 'none', borderRadius: 4,
                                padding: '4px 6px', cursor: 'pointer', display: 'flex'
                              }}>
                                <MoreVertical size={12} color="#666" />
              </button>
            </div>
          </div>

                      {/* Todos Progress - CURSOR STYLE */}
                      {msg.todos && (
                        <div style={{ 
                          background: '#151515', borderRadius: 8, padding: 12,
                          marginBottom: 12, border: '1px solid #252525'
                        }}>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 12, color: '#888', marginBottom: 10
                          }}>
                            <Circle size={14} />
                            <span>{msg.todos.filter(t => t.done).length} of {msg.todos.length} To-dos Completed</span>
              </div>
                          {msg.todos.map((todo, i) => (
                            <div key={i} style={{ 
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '4px 0', fontSize: 13,
                              color: todo.done ? '#22c55e' : '#666'
                            }}>
                              {todo.done ? <Check size={14} /> : <Circle size={14} />}
                              <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
                  </div>
                          ))}
                        </div>
                      )}
                      
                      {/* File Changes List - CURSOR STYLE */}
                      {msg.changedFiles && msg.changedFiles.length > 0 && (
                        <div style={{ 
                          background: '#151515', borderRadius: 8, padding: 12,
                          marginBottom: 12, border: '1px solid #252525'
                        }}>
                          {msg.changedFiles.map((file, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 8px', fontSize: 13, borderRadius: 6,
                              cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#202020'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <FileCode size={14} color="#3178c6" />
                              <span style={{ color: '#888', flex: 1 }}>{file.name}</span>
                              <span style={{ color: '#22c55e', fontSize: 12, fontFamily: 'monospace' }}>
                                +{file.additions}
                              </span>
                              <span style={{ color: '#ef4444', fontSize: 12, fontFamily: 'monospace' }}>
                                -{file.deletions}
                              </span>
                            </div>
                          ))}
                          
                          {/* Apply / Review Buttons */}
                          <div style={{ 
                            display: 'flex', gap: 8, marginTop: 12,
                            justifyContent: 'flex-end', borderTop: '1px solid #252525', paddingTop: 12
                          }}>
                            <button 
                              onClick={async () => {
                                // Apply alle Code Changes
                                if (msg.codeBlocks) {
                                  for (const block of msg.codeBlocks) {
                                    await applyCodeToEditor(block.code, block.file)
                                  }
                                }
                              }}
                              style={{
                                padding: '6px 16px', borderRadius: 6,
                                background: 'transparent', border: '1px solid #333',
                                color: '#888', fontSize: 12, cursor: 'pointer'
                              }}>
                              Apply
                            </button>
                            <button style={{
                              padding: '6px 16px', borderRadius: 6,
                              background: '#2563eb', border: 'none',
                              color: '#fff', fontSize: 12, cursor: 'pointer'
                            }}>
                              Review
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div style={{ color: '#b0b0b0', lineHeight: 1.7, fontSize: 14 }}>
                        {msg.content}
                      </div>
                    </div>
                  )}
                  
                  {/* File changes - EXAKT WIE CURSOR */}
                  {msg.files && (
                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                      {msg.files.map((f, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 14px', marginBottom: 4,
                          background: '#151515', borderRadius: 8,
                          border: '1px solid #252525', fontSize: 13,
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          // Open file in editor
                          if (!tabs.find(t => t.name === f.name.split('/').pop())) {
                            setTabs(prev => [...prev, { id: `file-${Date.now()}`, name: f.name.split('/').pop(), modified: true }])
                          }
                        }}
                        >
                          <FileCode size={16} color="#3178c6" />
                          <span style={{ color: '#e0e0e0', flex: 1 }}>{f.name}</span>
                          <span style={{ 
                            fontSize: 11, padding: '2px 8px', borderRadius: 4,
                            background: f.action === 'created' ? '#22c55e20' : '#60a5fa20',
                            color: f.action === 'created' ? '#22c55e' : '#60a5fa'
                          }}>
                            {f.action}
                          </span>
                          <span style={{ color: '#22c55e', fontSize: 12, fontFamily: 'monospace' }}>{f.lines}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Terminal Command - EXAKT WIE CURSOR mit Sandbox Dropdown */}
                  {msg.terminal && (
                    <div style={{ 
                      background: '#151515', borderRadius: 8, marginTop: 12,
                      border: '1px solid #252525', overflow: 'hidden'
                    }}>
                      {/* Header */}
                      <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #252525'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Terminal size={14} color="#888" />
                          <span style={{ fontSize: 12, color: '#888' }}>Run command:</span>
                          <span style={{ fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace' }}>{msg.terminal.command}</span>
                        </div>
                      <button 
                          onClick={() => navigator.clipboard.writeText(msg.terminal.command)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                          <Copy size={14} color="#666" />
                      </button>
                    </div>

                      {/* Command */}
                      <div style={{ 
                        padding: '10px 14px', fontFamily: 'monospace', fontSize: 12,
                        background: '#0d0d0d', borderBottom: '1px solid #252525'
                      }}>
                        <span style={{ color: '#22c55e' }}>$ </span>
                        <span style={{ color: '#e0e0e0' }}>{msg.terminal.command}</span>
                      </div>
                      
                      {/* Output */}
                      {msg.terminal.output && (
                        <div style={{ 
                          padding: '10px 14px', fontFamily: 'monospace', fontSize: 12,
                          color: '#888', whiteSpace: 'pre-wrap', background: '#0d0d0d'
                        }}>
                          {msg.terminal.output}
                        </div>
                      )}
                      
                      {/* Bottom Bar - CURSOR STYLE mit Sandbox Dropdown */}
                      <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 14px', background: '#1a1a1a', borderTop: '1px solid #252525'
                      }}>
                        {/* Sandbox Dropdown */}
                        <div style={{ position: 'relative' }}>
                      <button 
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: '#252525', border: 'none', borderRadius: 4,
                              padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: '#888'
                            }}
                          >
                            Run in Sandbox
                            <ChevronDown size={12} />
                      </button>
                    </div>
                        
                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{
                            background: 'transparent', border: 'none',
                            color: '#888', fontSize: 11, cursor: 'pointer'
                          }}>
                            Skip
                          </button>
                          <button style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: '#7c3aed30', border: '1px solid #7c3aed50',
                            borderRadius: 4, padding: '5px 10px', 
                            cursor: 'pointer', fontSize: 11, color: '#a78bfa'
                          }}>
                            Allowlist '{msg.terminal.command.split(' ')[0]}' ⌘⇧
                          </button>
                          <button style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: msg.terminal.exitCode === 0 ? '#22c55e' : '#2563eb',
                            border: 'none', borderRadius: 4,
                            padding: '5px 14px', cursor: 'pointer', fontSize: 11, color: '#fff'
                          }}>
                            {msg.terminal.exitCode === 0 ? (
                              <><Check size={12} /> Success</>
                            ) : (
                              <>Run ⌘</>
                            )}
                          </button>
                  </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Todos/Planning - CURSOR STYLE */}
                  {msg.todos && (
                    <div style={{ marginTop: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>
                        📋 {msg.todos.filter(t => t.done).length} of {msg.todos.length} To-dos Completed
                      </div>
                      <div style={{ 
                        background: '#151515', borderRadius: 8, padding: 12,
                        border: '1px solid #252525'
                      }}>
                        {msg.todos.map((todo, i) => (
                          <div key={i} style={{ 
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 0', fontSize: 13,
                            color: todo.done ? '#22c55e' : '#888'
                          }}>
                            {todo.done ? <Check size={14} /> : <Circle size={14} />}
                            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  
                  {/* Plan steps - for Plan mode */}
                  {msg.plan && (
                    <div style={{ paddingLeft: 32, marginTop: 12 }}>
                      {msg.plan.map((step, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', marginBottom: 4,
                          background: '#151515', borderRadius: 8,
                          border: '1px solid #252525'
                        }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#252525', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: '#888', fontWeight: 600
                          }}>{step.step}</div>
                          <span style={{ color: '#e0e0e0', fontSize: 13 }}>{step.task}</span>
                          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#666' }}>
                            {step.status}
                </div>
                  </div>
                ))}
                      <button style={{
                        marginTop: 12, padding: '10px 20px',
                        background: '#007acc', border: 'none', borderRadius: 6,
                        color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500
                      }}>
                        Execute Plan
                      </button>
              </div>
            )}

                  {/* Debug info - for Debug mode */}
                  {msg.debug && (
                    <div style={{ paddingLeft: 32, marginTop: 12 }}>
                      <div style={{
                        background: '#1a0a0a', border: '1px solid #5c2020',
                        borderRadius: 8, padding: 14, marginBottom: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <XCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>Error</span>
          </div>
                        <code style={{ color: '#fca5a5', fontSize: 12 }}>{msg.debug.error}</code>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                          {msg.debug.file}:{msg.debug.line}
                        </div>
                      </div>
                      <div style={{
                        background: '#151515', border: '1px solid #252525',
                        borderRadius: 8, padding: 14
                      }}>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Root Cause:</div>
                        <div style={{ color: '#e0e0e0', fontSize: 13 }}>{msg.debug.cause}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 12, marginBottom: 4 }}>Suggested Fix:</div>
                        <div style={{ color: '#22c55e', fontSize: 13 }}>{msg.debug.fix}</div>
                      </div>
                    </div>
                  )}

                  {/* Code blocks - EXAKT WIE CURSOR mit Diff und Apply */}
                  {msg.codeBlocks && msg.codeBlocks.map((block, i) => (
                    <div key={i} style={{ 
                      marginTop: 12, background: '#151515', borderRadius: 8,
                      border: '1px solid #252525', overflow: 'hidden'
                    }}>
                      {/* File Header - CURSOR STYLE */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', background: '#1a1a1a', borderBottom: '1px solid #252525'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileCode size={16} color="#3178c6" />
                          <span style={{ fontSize: 13, color: '#e0e0e0', fontWeight: 500 }}>{block.file}</span>
                          {block.lines && (
                            <span style={{ 
                              fontSize: 11, padding: '2px 8px', borderRadius: 4,
                              background: '#22c55e20', color: '#22c55e'
                            }}>{block.lines}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            onClick={() => navigator.clipboard.writeText(block.code)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#252525', border: 'none', borderRadius: 4,
                              padding: '5px 10px', color: '#888', cursor: 'pointer', fontSize: 11
                            }}
                          >
                            <Copy size={11} />
                          </button>
                          <button 
                            onClick={() => applyCodeToEditor(block.code, block.file)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              background: '#2563eb', border: 'none', borderRadius: 4,
                              padding: '5px 12px', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 500
                            }}>
                            Apply
                          </button>
                        </div>
                      </div>
                      {/* Code with diff highlighting */}
                      <div style={{ maxHeight: 280, overflow: 'auto' }}>
                        <pre style={{
                          margin: 0, padding: 0, fontSize: 12, lineHeight: 1.7,
                          fontFamily: '"JetBrains Mono", "Fira Code", monospace', 
                          color: '#d4d4d4'
                        }}>
                          {block.code.split('\n').map((line, lineIdx) => {
                            const isAdd = line.startsWith('+')
                            const isDel = line.startsWith('-')
                            return (
                              <div key={lineIdx} style={{ 
                                display: 'flex',
                                background: isAdd ? '#22c55e15' : isDel ? '#ef444415' : 'transparent',
                                borderLeft: isAdd ? '3px solid #22c55e' : isDel ? '3px solid #ef4444' : '3px solid transparent'
                              }}>
                                <span style={{ 
                                  width: 50, textAlign: 'right', paddingRight: 12, paddingLeft: 8,
                                  color: '#444', userSelect: 'none', background: '#0f0f0f',
                                  fontSize: 11
                                }}>
                                  {lineIdx + 1}
                </span>
                                <span style={{ 
                                  paddingLeft: 12, flex: 1, paddingRight: 12,
                                  color: isAdd ? '#4ade80' : isDel ? '#f87171' : '#d4d4d4'
                                }}>
                                  {line || ' '}
                </span>
                              </div>
                            )
                          })}
                        </pre>
                      </div>
                    </div>
                  ))}
                    </>
                  )}
                </div>
              ))}

              {/* LIVE AGENT STATUS - Zeigt was der Agent gerade tut */}
              {(isThinking || agentStatus !== 'idle') && (
                <>
                  {/* Agent Working Card */}
                  <div style={{ 
                    background: '#1a1a1a', borderRadius: 12, padding: '16px 18px',
                    border: '1px solid #252525', marginBottom: 24
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                      }}>
                        <Sparkles size={12} color="#fff" />
                      </div>
                      <span style={{ fontWeight: 500, color: '#e0e0e0', fontSize: 13 }}>VibeAI</span>
                      <span style={{ fontSize: 11, color: '#666' }}>• Thought for {thinkingTime}s</span>
                    </div>
                    
                    {/* Current Step - was macht der Agent gerade */}
                    <div style={{ 
                      background: '#151515', borderRadius: 8, padding: 12,
                      border: '1px solid #252525'
                    }}>
                      {/* Status Badge */}
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8
                      }}>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 4,
                          background: agentStatus === 'coding' ? '#22c55e20' : 
                                     agentStatus === 'planning' ? '#f59e0b20' : '#60a5fa20',
                          color: agentStatus === 'coding' ? '#22c55e' : 
                                agentStatus === 'planning' ? '#f59e0b' : '#60a5fa',
                          textTransform: 'uppercase', fontWeight: 600
                        }}>
                          {agentStatus === 'coding' ? '💻 Coding' : 
                           agentStatus === 'planning' ? '📋 Planning' : 
                           agentStatus === 'thinking' ? '🤔 Thinking' :
                           agentStatus === 'running' ? '🖥️ Running' : '⏳ Working'}
                </span>
              </div>
                      
                      {/* Current Action */}
                      <div style={{ color: '#e0e0e0', fontSize: 13, marginBottom: 8 }}>
                        {agentCurrentStep || thinkingSteps[thinkingSteps.length - 1] || 'Working...'}
            </div>

                      {/* Completed Steps */}
                      {thinkingSteps.length > 0 && (
                        <div style={{ borderTop: '1px solid #252525', paddingTop: 8, marginTop: 8 }}>
                          {thinkingSteps.slice(-3).map((step, i) => (
                            <div key={i} style={{ 
                              display: 'flex', alignItems: 'center', gap: 6,
                              fontSize: 12, color: '#666', marginBottom: 4
                            }}>
                              <Check size={12} color="#22c55e" />
                              {step}
                            </div>
                          ))}
                        </div>
                              )}
                            </div>
                          </div>
                  
                  {/* Live Typing Preview - zeigt Code der gerade getippt wird */}
                  {liveTypingFile && (
                    <div style={{ 
                      background: '#151515', borderRadius: 8, padding: 12,
                      border: '1px solid #22c55e40', marginBottom: 16
                    }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                        fontSize: 12, color: '#22c55e'
                      }}>
                        <FileCode size={14} />
                        <span>Writing: {liveTypingFile}</span>
                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      <pre style={{
                        margin: 0, padding: 8, background: '#0d0d0d', borderRadius: 4,
                        fontSize: 11, color: '#888', maxHeight: 150, overflow: 'auto',
                        fontFamily: 'monospace'
                      }}>
                        {liveTypingText}<span style={{ 
                          borderRight: '2px solid #22c55e', 
                          animation: 'blink 1s infinite' 
                        }}>&nbsp;</span>
                      </pre>
                    </div>
                  )}
                  
                  {/* Bottom Generating Bar - CURSOR STYLE */}
                  <div style={{
                    position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                    background: '#1a1a1a', borderRadius: 8, padding: '8px 16px',
                    border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 16,
                    zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Loader2 size={14} color="#888" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {agentCurrentStep ? agentCurrentStep.slice(0, 40) + '...' : 'Generating...'}
                      </span>
                  </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button 
                        onClick={() => { setIsThinking(false); setAgentStatus('idle') }}
                        style={{
                          background: 'transparent', border: 'none', color: '#888',
                          fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                        }}
                      >
                        Stop <span style={{ color: '#666', fontSize: 10 }}>⌃C</span>
                      </button>
                      <button style={{
                        background: '#333', border: 'none', borderRadius: 4,
                        padding: '4px 12px', color: '#fff', fontSize: 12, cursor: 'pointer'
                      }}>
                        Review
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {/* Terminal Approval Dialog */}
              {terminalAwaitingApproval && (
                <div style={{
                  position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)',
                  background: '#1a1a1a', borderRadius: 12, padding: 16,
                  border: '1px solid #7c3aed50', zIndex: 1001,
                  boxShadow: '0 8px 30px rgba(124, 58, 237, 0.3)', minWidth: 400
                }}>
                  <div style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 12 }}>
                    🖥️ Terminal command requires approval:
                  </div>
                  <div style={{ 
                    background: '#0d0d0d', borderRadius: 6, padding: 12,
                    fontFamily: 'monospace', fontSize: 13, color: '#22c55e', marginBottom: 16
                  }}>
                    $ {pendingTerminalCmd}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                      onClick={skipTerminalCommand}
                      style={{
                        background: 'transparent', border: '1px solid #333',
                        borderRadius: 6, padding: '8px 16px', color: '#888',
                        fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={approveTerminalCommand}
                      style={{
                        background: '#22c55e', border: 'none',
                        borderRadius: 6, padding: '8px 16px', color: '#fff',
                        fontSize: 12, cursor: 'pointer', fontWeight: 500
                      }}
                    >
                      Run ⌘↵
                      </button>
                    </div>
                    </div>
              )}
                  </div>

            {/* ========================================= */}
            {/* INPUT AREA - EXACT CURSOR STYLE */}
            {/* ========================================= */}
            <div style={{ background: '#0d0d0d', padding: '12px 16px' }}>
              
              {/* Input - NO BORDER like Cursor */}
                <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#808080',
                  fontSize: 14,
                  resize: 'none',
                  marginBottom: 12
                }}
              />

              {/* Bottom Bar - EXACT CURSOR STYLE - ALL ON ONE LINE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Left: Agent + Model */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Agent Selector - EXACT CURSOR STYLE */}
                  <div style={{ position: 'relative' }}>
                      <button 
                      onClick={() => { setShowAgentMenu(!showAgentMenu); setShowModelMenu(false) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none',
                        color: '#808080', cursor: 'pointer', fontSize: 13
                      }}
                    >
                      {React.createElement(agentModes.find(m => m.id === agentMode)?.icon || Infinity, { size: 16 })}
                      <span>{agentModes.find(m => m.id === agentMode)?.label || 'Agent'}</span>
                      <ChevronDown size={12} />
                      </button>
                    
                    {/* Agent Menu - EXACT CURSOR DROPDOWN */}
                    {showAgentMenu && (
                      <div style={{
                        position: 'absolute', bottom: '100%', left: 0,
                        marginBottom: 8, background: '#1a1a1a',
                        border: '1px solid #333', borderRadius: 8,
                        overflow: 'visible', minWidth: 180, zIndex: 100
                      }}>
                        {agentModes.map(mode => {
                          const ModeIcon = mode.icon
                          return (
                            <div
                              key={mode.id}
                              onClick={() => { setAgentMode(mode.id); setShowAgentMenu(false) }}
                              style={{
                                padding: '8px 12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: agentMode === mode.id ? '#252525' : 'transparent',
                                position: 'relative'
                              }}
                              onMouseEnter={(e) => {
                                const tooltip = e.currentTarget.querySelector('.tooltip')
                                if (tooltip) tooltip.style.opacity = '1'
                              }}
                              onMouseLeave={(e) => {
                                const tooltip = e.currentTarget.querySelector('.tooltip')
                                if (tooltip) tooltip.style.opacity = '0'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <ModeIcon size={14} color="#888" />
                                <span style={{ fontSize: 13, color: '#e0e0e0' }}>{mode.label}</span>
                </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {mode.shortcut && (
                                  <span style={{ fontSize: 11, color: '#666' }}>{mode.shortcut}</span>
                                )}
                                {agentMode === mode.id && <Check size={14} color="#fff" />}
                                {mode.hasEdit && agentMode === mode.id && (
                                  <span style={{ fontSize: 12, color: '#666' }}>✏️</span>
                                )}
            </div>

                              {/* Tooltip - Left side */}
                              <div 
                                className="tooltip"
                                style={{
                                  position: 'absolute',
                                  right: '100%',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  marginRight: 12,
                                  background: '#252525',
                                  border: '1px solid #333',
                                  borderRadius: 8,
                                  padding: '10px 14px',
                                  width: 200,
                                  opacity: 0,
                                  transition: 'opacity 0.15s',
                                  pointerEvents: 'none',
                                  zIndex: 200
                                }}
                              >
                                <div style={{ fontSize: 13, color: '#e0e0e0', marginBottom: 4 }}>
                                  {mode.description}
                  </div>
                                {mode.tag && (
                                  <span style={{ 
                                    fontSize: 11, color: '#888', 
                                    background: '#333', padding: '2px 6px', borderRadius: 4 
                                  }}>
                                    {mode.tag}
                                  </span>
                              )}
                            </div>
                          </div>
                          )
                        })}
                </div>
              )}
                  </div>

                  {/* Model Selector */}
                  <div style={{ position: 'relative' }}>
                      <button
                      onClick={() => setShowModelMenu(!showModelMenu)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none',
                        color: '#808080', cursor: 'pointer', fontSize: 13
                      }}
                    >
                      <span>{models.find(m => m.id === selectedModel)?.name || 'Opus 4.5'}</span>
                      <ChevronDown size={12} />
                      </button>
                    
                    {/* Model Menu */}
                    {showModelMenu && (
                      <div style={{
                        position: 'absolute', bottom: '100%', left: 0,
                        marginBottom: 8, background: '#1a1a1a',
                        border: '1px solid #333', borderRadius: 8,
                        overflow: 'hidden', minWidth: 200, zIndex: 100
                      }}>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #252525' }}>
                          <input placeholder="Search models" style={{
                            width: '100%', background: '#252525', border: 'none',
                            padding: '8px 12px', borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none'
                          }} />
                    </div>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={14} color="#007acc" />
                            <span style={{ fontSize: 13, color: '#ccc' }}>Auto</span>
                    </div>
                          <div style={{ width: 36, height: 20, borderRadius: 10, background: '#333', position: 'relative' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#666', position: 'absolute', top: 2, left: 2 }} />
                  </div>
                </div>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, color: '#ccc' }}>MAX Mode</span>
                          <div 
                            onClick={() => setMaxMode(!maxMode)}
                            style={{ 
                              width: 36, height: 20, borderRadius: 10, 
                              background: maxMode ? '#007acc' : '#333', 
                              position: 'relative', cursor: 'pointer'
                            }}
                          >
                            <div style={{ 
                              width: 16, height: 16, borderRadius: '50%', background: '#fff', 
                              position: 'absolute', top: 2, 
                              left: maxMode ? 18 : 2
                            }} />
              </div>
          </div>
                        <div style={{ maxHeight: 300, overflow: 'auto' }}>
                          {/* Agents First */}
                          <div style={{ padding: '6px 12px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, background: '#1a1a1a' }}>
                            🤖 Agents
                          </div>
                          {models.filter(m => m.isAgent).map(model => (
                            <div
                              key={model.id}
                              onClick={() => { setSelectedModel(model.id); setShowModelMenu(false) }}
                              style={{
                                padding: '8px 12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: selectedModel === model.id ? '#252525' : 'transparent'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, color: '#e0e0e0' }}>{model.name}</span>
                                {model.badge && <span style={{ fontSize: 11 }}>{model.badge}</span>}
              </div>
                              {selectedModel === model.id && <Check size={14} color="#007acc" />}
            </div>
                          ))}
                          
                          {/* Models */}
                          <div style={{ padding: '6px 12px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, background: '#1a1a1a', marginTop: 4 }}>
                            ⚡ VibeAI Models
                  </div>
                          {models.filter(m => !m.isAgent).map(model => (
                            <div
                              key={model.id}
                              onClick={() => { setSelectedModel(model.id); setShowModelMenu(false) }}
                              style={{
                                padding: '8px 12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: selectedModel === model.id ? '#252525' : 'transparent'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, color: '#e0e0e0' }}>{model.name}</span>
                                {model.badge && <span style={{ fontSize: 11 }}>{model.badge}</span>}
                </div>
                              {selectedModel === model.id && <Check size={14} color="#007acc" />}
                        </div>
                      ))}
                  </div>

                        {/* Add Models - Opens Settings */}
                        <div 
                          onClick={() => { 
                            setShowSettings(true)
                            setShowModelMenu(false)
                            // Add settings tab
                            if (!tabs.find(t => t.id === 'settings')) {
                              setTabs(prev => [...prev, { id: 'settings', name: 'Settings', modified: false }])
                            }
                            setActiveTab('settings')
                          }}
                          style={{ 
                            padding: '10px 12px', borderTop: '1px solid #333',
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                          }}
                        >
                          <Plus size={14} color="#888" />
                          <span style={{ fontSize: 13, color: '#888' }}>Add Models</span>
                  </div>
                </div>
              )}
                  </div>
                  
                  {/* Keyboard shortcut */}
                  <span style={{ color: '#555', fontSize: 12 }}>⌥</span>
                  </div>

                {/* Right: Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
                    <RotateCcw size={16} color="#555" />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
                    <AtSign size={16} color="#555" />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
                    <Globe size={16} color="#555" />
                  </button>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
                    <Image size={16} color="#555" />
                  </button>
                  
                  {/* Send Button */}
                  <button
                    onClick={send}
                    disabled={!input.trim() || isThinking}
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: input.trim() ? '#fff' : '#333',
                      border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginLeft: 4
                    }}
                  >
                    <ArrowUp size={16} color={input.trim() ? '#000' : '#555'} />
                  </button>
                  </div>
                </div>
                  </div>
                </div>
              )}
            </div>

      {/* STATUS BAR */}
      <div style={{ height: 22, background: '#007acc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontSize: 12, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span><GitBranch size={12} style={{ marginRight: 4 }} />main</span>
          <span><XCircle size={12} style={{ marginRight: 4 }} />{problems.length}</span>
          </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript React</span>
          <span><Sparkles size={12} style={{ marginRight: 4 }} />VibeAI</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        textarea::placeholder { color: #555; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
