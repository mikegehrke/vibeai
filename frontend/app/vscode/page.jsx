'use client'

import React, { useState, useEffect, useRef } from 'react'

// ECHTES VS CODE INTERFACE - 1:1 Nachbau wie Screenshot
export default function RealVSCode() {
  const [activeTab, setActiveTab] = useState('explorer')
  const [openFiles, setOpenFiles] = useState([
    { id: 'readme', name: 'README.md', path: 'README.md', content: `# 🚀 FitConnect - Moderne Fitness App

Dies ist dein intelligentes Projekt!

## Features
- AI-powered development
- Real-time collaboration  
- Smart code generation
- Automated testing

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`

---
*Erstellt mit VibeAI Builder*`, language: 'markdown', active: true }
  ])
  const [activeFile, setActiveFile] = useState('readme')
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [panelHeight, setPanelHeight] = useState(200)
  const [chatWidth, setChatWidth] = useState(300)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '***Willkommen im Ultimate AI Builder!***\n\nIch bin dein intelligenter Auto-Coder Agent. Hier sind meine Fähigkeiten:\n\n**🤖 Was ich kann:**\n\n• **Dateien erstellen & bearbeiten**\n• **Code generieren** - Mit KI-Power\n• **Bugs fixen** - Sofortig\n• **UI/UX designen** - Modern & responsive\n• **Apps deployen** - One-click\n• **Sage "erstelle eine React App"** - Sage "fixe alle Fehler"\n• **Sage "erstelle ein Dashboard"** - Sage "optimiere den Code"\n• **Pro-Tip:** Ich arbeite vollautomatisch! Einfach beschreiben was du willst.',
      timestamp: '19:57:45',
      avatar: '🤖'
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [terminalContent, setTerminalContent] = useState('Microsoft Windows [Version 10.0.22621.2861]\n(c) Microsoft Corporation. All rights reserved.\n\nPS C:\\dev\\vibeai\\frontend> npm run dev\n\n> vibeai-frontend@1.0.0 dev\n> next dev\n\n  ▲ Next.js 14.2.33\n  - Local: http://localhost:3000\n\n ✓ Ready in 1547ms (447 modules)\n')
  const [activeBottomTab, setActiveBottomTab] = useState('TERMINAL')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [models, setModels] = useState([])
  const [files, setFiles] = useState([
    { name: 'README.md', type: 'file', icon: '📝', open: false },
    { name: 'app.py', type: 'file', icon: '🐍', open: false },
    { name: 'package.json', type: 'file', icon: '📦', open: false },
    { name: 'index.html', type: 'file', icon: '🌐', open: false }
  ])

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      setModels([
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' }
      ])
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avatar: '👤'
    }

    setChatMessages(prev => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput('')

    // Typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      type: 'typing',
      content: '🤔 AI denkt nach...',
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avatar: '🤖'
    }
    setChatMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          model: selectedModel,
          session_id: 12345
        })
      })

      const data = await response.json()
      
      setChatMessages(prev => prev.filter(m => m.type !== 'typing'))
      
      const assistantMessage = {
        id: Date.now() + 2,
        type: 'assistant',
        content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        avatar: '🤖'
      }

      setChatMessages(prev => [...prev, assistantMessage])

      // Auto-actions based on input
      if (currentInput.toLowerCase().includes('erstelle') || currentInput.toLowerCase().includes('generiere')) {
        setTimeout(() => {
          const actionMessage = {
            id: Date.now() + 3,
            type: 'system',
            content: '⚡ **Auto-Coder aktiviert** - Erstelle neuen Code...',
            timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            avatar: '⚡'
          }
          setChatMessages(prev => [...prev, actionMessage])
          
          // Add new file
          setTimeout(() => {
            createNewFile(currentInput)
          }, 2000)
        }, 1000)
      }

    } catch (error) {
      setChatMessages(prev => prev.filter(m => m.type !== 'typing'))
      const errorMessage = {
        id: Date.now() + 3,
        type: 'error',
        content: '❌ Fehler beim Senden der Nachricht.',
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        avatar: '❌'
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  const createNewFile = (description) => {
    let fileName, content, language, icon

    if (description.toLowerCase().includes('react')) {
      fileName = 'App.jsx'
      icon = '⚛️'
      language = 'jsx'
      content = `import React, { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🚀 FitConnect App
        </h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-mono text-blue-600 mb-4">
              {count}
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button 
                onClick={() => setCount(count - 1)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                -
              </button>
              
              <button 
                onClick={() => setCount(count + 1)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => setCount(0)}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Built with VibeAI Auto-Coder ✨
        </div>
      </div>
    </div>
  )
}

export default App`
    } else {
      fileName = 'component.js'
      icon = '📄'
      language = 'javascript'
      content = `// Auto-generated by VibeAI
console.log('Hello from VibeAI!')

function autoGenerated() {
  return {
    message: 'This file was created by AI',
    timestamp: new Date().toISOString(),
    features: ['Auto-generated', 'Smart code', 'AI-powered']
  }
}

export default autoGenerated`
    }

    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      path: fileName,
      content,
      language,
      active: true
    }

    setOpenFiles(prev => [...prev.map(f => ({ ...f, active: false })), newFile])
    setActiveFile(newFile.id)
    setFiles(prev => [...prev, { name: fileName, type: 'file', icon, open: true }])

    const successMessage = {
      id: Date.now() + 4,
      type: 'system',
      content: `✅ **Datei erstellt:** ${fileName} wurde erfolgreich generiert!`,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avatar: '✅'
    }
    setChatMessages(prev => [...prev, successMessage])
  }

  const openFile = (file) => {
    const existingFile = openFiles.find(f => f.name === file.name)
    
    if (existingFile) {
      setOpenFiles(prev => prev.map(f => ({ ...f, active: f.id === existingFile.id })))
      setActiveFile(existingFile.id)
    } else {
      // Create new file content
      const content = file.name.endsWith('.md') ? `# ${file.name}\n\nDokumentation für ${file.name}` : 
                     file.name.endsWith('.py') ? `# ${file.name}\nprint("Hello from ${file.name}")` :
                     file.name.endsWith('.json') ? `{\n  "name": "${file.name}",\n  "version": "1.0.0"\n}` :
                     `<!DOCTYPE html>\n<html>\n<head>\n    <title>${file.name}</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>`
      
      const language = file.name.endsWith('.py') ? 'python' :
                      file.name.endsWith('.json') ? 'json' :
                      file.name.endsWith('.md') ? 'markdown' : 'html'
      
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        path: file.name,
        content,
        language,
        active: true
      }
      
      setOpenFiles(prev => [...prev.map(f => ({ ...f, active: false })), newFile])
      setActiveFile(newFile.id)
    }
    
    setFiles(prev => prev.map(f => f.name === file.name ? { ...f, open: true } : f))
  }

  const closeFile = (fileId) => {
    const fileToClose = openFiles.find(f => f.id === fileId)
    const remainingFiles = openFiles.filter(f => f.id !== fileId)
    
    if (remainingFiles.length > 0) {
      const nextActive = fileToClose?.active ? remainingFiles[0].id : activeFile
      setOpenFiles(remainingFiles.map(f => ({ ...f, active: f.id === nextActive })))
      setActiveFile(nextActive)
    } else {
      setOpenFiles([])
      setActiveFile(null)
    }
    
    if (fileToClose) {
      setFiles(prev => prev.map(f => f.name === fileToClose.name ? { ...f, open: false } : f))
    }
  }

  const currentFile = openFiles.find(f => f.id === activeFile)

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col font-[system-ui]">
      {/* Title Bar - VS Code Style */}
      <div className="h-8 bg-[#323233] flex items-center justify-between px-2 text-xs border-b border-[#2d2d30]">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-[#ff5f57] rounded-full"></div>
            <div className="w-3 h-3 bg-[#ffbd2e] rounded-full"></div>
            <div className="w-3 h-3 bg-[#28ca42] rounded-full"></div>
          </div>
          <span className="text-[#cccccc]">VibeAI Builder - Beschreibung - FitConnect ist eine moderne Fitness App - Visual Studio Code</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-[#0078d4] hover:bg-[#106ebe] px-3 py-1 rounded text-white text-xs font-medium">Build</button>
          <button className="bg-[#2d2d30] hover:bg-[#3e3e42] px-3 py-1 rounded text-[#cccccc] text-xs">Settings</button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-7 bg-[#2d2d30] border-b border-[#2d2d30] flex items-center px-3 text-xs text-[#cccccc]">
        <div className="flex space-x-6">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">Selection</span>
          <span className="hover:text-white cursor-pointer">View</span>
          <span className="hover:text-white cursor-pointer">Go</span>
          <span className="hover:text-white cursor-pointer">Run</span>
          <span className="hover:text-white cursor-pointer">Terminal</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-[#2d2d30] border-r border-[#2d2d30] flex flex-col items-center py-2 space-y-1">
          <div 
            onClick={() => setActiveTab('explorer')}
            className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
              activeTab === 'explorer' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Explorer (Ctrl+Shift+E)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.51v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.51zM14 13H2V7h12v6z"/>
            </svg>
          </div>
          
          <div 
            onClick={() => setActiveTab('search')}
            className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
              activeTab === 'search' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Search (Ctrl+Shift+F)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>

          <div 
            onClick={() => setActiveTab('git')}
            className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
              activeTab === 'git' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Source Control (Ctrl+Shift+G)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>

          <div 
            onClick={() => setActiveTab('debug')}
            className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
              activeTab === 'debug' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Run and Debug (Ctrl+Shift+D)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M6.271 5.055a.5.5 0 0 1 .52.22L8 6.73l1.209-1.455a.5.5 0 0 1 .52-.22A.5.5 0 0 1 10 5.5v5a.5.5 0 0 1-.271.445.5.5 0 0 1-.52-.22L8 9.27l-1.209 1.455a.5.5 0 0 1-.52.22A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
            </svg>
          </div>

          <div 
            onClick={() => setActiveTab('extensions')}
            className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
              activeTab === 'extensions' ? 'bg-[#37373d] text-white' : 'text-[#858585] hover:text-white'
            }`}
            title="Extensions (Ctrl+Shift+X)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 1a.5.5 0 0 0-1 0v1.171l-.171-.171a.5.5 0 0 0-.707 0L6.5 2.122 6.378 2a.5.5 0 0 0-.707 0l-.122.122L5.427 2a.5.5 0 0 0-.707 0l-.122.122L4.476 2a.5.5 0 0 0-.707 0L3.647 2.122 3.525 2a.5.5 0 0 0-.707 0l-.122.122L2.574 2a.5.5 0 0 0-.707 0L1.745 2.122 1.623 2a.5.5 0 0 0-.707 0l-.122.122-.122-.122a.5.5 0 0 0-.707 0l-.122.122L0 2.244v11.512l.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0l.122-.122.122.122a.5.5 0 0 0 .707 0L15.878 13.756V2.244l-.122-.122a.5.5 0 0 0-.707 0l-.122.122-.122-.122a.5.5 0 0 0-.707 0L14.076 2l-.122-.122a.5.5 0 0 0-.707 0L13.125 2l-.122-.122a.5.5 0 0 0-.707 0L12.174 2l-.122-.122a.5.5 0 0 0-.707 0L11.223 2l-.122-.122a.5.5 0 0 0-.707 0L10.272 2l-.122-.122a.5.5 0 0 0-.707 0L9.321 2l-.122-.122a.5.5 0 0 0-.707 0L8.5 2.171V1z"/>
            </svg>
          </div>
        </div>

        {/* Sidebar */}
        <div 
          className="bg-[#252526] border-r border-[#2d2d30] flex flex-col"
          style={{ width: sidebarWidth }}
        >
          {/* Sidebar Header */}
          <div className="h-9 flex items-center justify-between px-3 border-b border-[#2d2d30]">
            <span className="text-xs font-medium text-[#cccccc] uppercase tracking-wide">
              {activeTab === 'explorer' ? 'Explorer' : activeTab}
            </span>
            {activeTab === 'explorer' && (
              <div className="flex space-x-1">
                <div className="w-5 h-5 flex items-center justify-center hover:bg-[#37373d] rounded cursor-pointer" title="New File">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="#cccccc">
                    <path d="M9.5 1.1l3.4 3.5.1.4v8l-.5.5h-11l-.5-.5v-11l.5-.5h7.5l.5.1zM10 2v3h3l-3-3zM3 2v11h10V6H9.5L9 5.5V2H3z"/>
                  </svg>
                </div>
                <div className="w-5 h-5 flex items-center justify-center hover:bg-[#37373d] rounded cursor-pointer" title="New Folder">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="#cccccc">
                    <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5a.5.5 0 0 0-.5.51v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.51z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* File Explorer */}
          {activeTab === 'explorer' && (
            <div className="flex-1 overflow-auto">
              <div className="px-2 py-1">
                <div className="text-xs text-[#cccccc] mb-2 font-medium">VIBEAI</div>
                <div className="space-y-0">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => openFile(file)}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-[#37373d] cursor-pointer rounded text-sm group"
                    >
                      <span className="text-sm">{file.icon}</span>
                      <span className={`text-[#cccccc] ${file.open ? 'text-white' : ''}`}>
                        {file.name}
                      </span>
                      {file.open && (
                        <div className="ml-auto w-1 h-1 bg-white rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div className="h-9 bg-[#2d2d30] border-b border-[#2d2d30] flex">
            <div className="flex">
              {openFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center px-3 py-2 border-r border-[#2d2d30] cursor-pointer group ${
                    file.active ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d30] text-[#969696] hover:text-white'
                  }`}
                  onClick={() => {
                    setOpenFiles(prev => prev.map(f => ({ ...f, active: f.id === file.id })))
                    setActiveFile(file.id)
                  }}
                >
                  <span className="text-xs mr-2">
                    {file.language === 'markdown' ? '📝' : 
                     file.language === 'jsx' ? '⚛️' : 
                     file.language === 'python' ? '🐍' : 
                     file.language === 'json' ? '📦' : '📄'}
                  </span>
                  <span className="text-xs">{file.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeFile(file.id)
                    }}
                    className="ml-2 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#37373d] rounded"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Code Editor */}
            <div className="flex-1 overflow-auto">
              {currentFile ? (
                <div className="h-full">
                  <SyntaxHighlighter
                    language={currentFile.language}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    customStyle={{
                      margin: 0,
                      padding: '16px',
                      background: '#1e1e1e',
                      fontSize: '14px',
                      fontFamily: 'Consolas, "Courier New", monospace',
                      height: '100%'
                    }}
                    lineNumberStyle={{
                      color: '#858585',
                      paddingRight: '16px',
                      minWidth: '40px'
                    }}
                  >
                    {currentFile.content}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[#858585]">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-sm">Wählen Sie eine Datei aus dem Explorer</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - AI Chat */}
            <div 
              className="bg-[#252526] border-l border-[#2d2d30] flex flex-col"
              style={{ width: chatWidth }}
            >
              {/* Chat Header */}
              <div className="h-9 flex items-center justify-between px-3 border-b border-[#2d2d30]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-[#cccccc] uppercase tracking-wide">AI Chat</span>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                </div>
                <div className="text-xs text-[#858585]">Preview</div>
              </div>

              {/* AI Agents Panel */}
              <div className="p-3 border-b border-[#2d2d30]">
                <div className="text-xs text-[#cccccc] mb-2">● All Agents Panel: Alle Agenten aktiviert</div>
                <div className="text-xs text-[#cccccc] mb-1">● 🤖 Settings: Konfiguration</div>
                
                <div className="mt-2 text-xs text-[#858585]">
                  <div className="font-medium text-[#cccccc] mb-1">Multi-Panel Layout:</div>
                  <div className="ml-2">
                    <div>• Activity Bar (links)</div>
                    <div>• Sidebar (Explorer, Search, Agents)</div>
                    <div>• Main Editor mit Tabs</div>
                    <div>• Bottom Panel (Terminal, Output, Chat, Problems)</div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-[#858585]">
                  <div className="font-medium text-[#cccccc] mb-1">Live AI Chat:</div>
                  <div className="ml-2">
                    <div>• Alle 10 AI Modelle verfügbar</div>
                    <div>• Real-time Chat mit Typing Indicators</div>
                    <div>• System Messages für Agent-Status</div>
                    <div>• Model Selection</div>
                  </div>
                </div>

                <div className="mt-2 text-xs text-[#858585]">
                  <div className="font-medium text-[#cccccc] mb-1">Automatische Features:</div>
                  <div className="ml-2">
                    <div>• Auto-Code Generation: Erstellt komplette React Components</div>
                    <div>• Auto-Debug: Findet und behebt Fehler</div>
                    <div>• Auto-Testing: Generiert und führt Tests aus</div>
                    <div>• Auto-Deploy: Deployment auf Vercel/andere Plattformen</div>
                  </div>
                </div>

                <div className="mt-3">
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#3c3c3c] text-[#cccccc] px-2 py-1 rounded text-xs border border-[#464647]"
                  >
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="flex space-x-2">
                    <div className="flex-shrink-0 text-sm">{message.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium ${
                          message.type === 'user' ? 'text-[#4fc3f7]' : 
                          message.type === 'system' ? 'text-[#ffeb3b]' : 'text-[#4caf50]'
                        }`}>
                          {message.type === 'user' ? 'You' : 
                           message.type === 'system' ? 'System' : 'AI Assistant'}
                        </span>
                        <span className="text-xs text-[#858585]">{message.timestamp}</span>
                      </div>
                      <div className={`text-xs ${
                        message.type === 'system' ? 'text-[#ffeb3b]' : 'text-[#cccccc]'
                      }`}>
                        {message.content.split('\n').map((line, index) => (
                          <div key={index}>
                            {line.startsWith('**') && line.endsWith('**') ? (
                              <strong>{line.slice(2, -2)}</strong>
                            ) : line.startsWith('***') && line.endsWith('***') ? (
                              <strong className="text-[#4caf50]">{line.slice(3, -3)}</strong>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-[#2d2d30]">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Frage den AI Assistant..."
                    className="flex-1 bg-[#3c3c3c] text-[#cccccc] px-3 py-2 rounded text-xs border border-[#464647] focus:outline-none focus:border-[#007acc]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#37373d] px-3 py-2 rounded text-xs text-white font-medium transition-colors"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div 
            className="bg-[#181818] border-t border-[#2d2d30] flex flex-col"
            style={{ height: panelHeight }}
          >
            {/* Panel Tabs */}
            <div className="h-8 bg-[#2d2d30] border-b border-[#2d2d30] flex items-center px-3">
              <div className="flex space-x-6 text-xs">
                {['PROBLEME', 'AUSGABE', 'DEBUGGING-KONSOLE', 'TERMINAL', 'PORTS', 'GITLENS', 'PLAYWRIGHT', 'SPELL CHECKER'].map(tab => (
                  <span
                    key={tab}
                    onClick={() => setActiveBottomTab(tab)}
                    className={`cursor-pointer px-2 py-1 ${
                      activeBottomTab === tab ? 'text-white border-b-2 border-[#007acc]' : 'text-[#858585] hover:text-white'
                    }`}
                  >
                    {tab}
                    {tab === 'SPELL CHECKER' && <span className="ml-1 bg-[#007acc] text-white px-1 rounded text-xs">100</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto">
              {activeBottomTab === 'TERMINAL' && (
                <div className="h-full bg-black text-[#cccccc] p-3 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{terminalContent}</pre>
                  <div className="flex items-center">
                    <span className="text-green-400">PS C:\Users\mikegehrke\dev\vibeai\frontend&gt;</span>
                    <div className="ml-2 w-2 h-4 bg-white animate-pulse"></div>
                  </div>
                </div>
              )}
              
              {activeBottomTab !== 'TERMINAL' && (
                <div className="p-3 text-xs text-[#858585]">
                  {activeBottomTab} Panel - Bereit für Entwicklung
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>⚠️</span>
            <span>0</span>
            <span>❌</span>
            <span>0</span>
          </div>
          <span>🔗 main*</span>
          <span>🔄 Launched</span>
          <span>🌐 93</span>
          <span>⚠️ 197</span>
          <span>🔍 311</span>
          <span>🔗 Connect</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Zeile 1, Spalte 1</span>
          <span>Leerzeichen: 2</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>📝 Markdown</span>
          <span>☁️ Go Live</span>
          <span>🔔 Prettier</span>
        </div>
      </div>
    </div>
  )
}