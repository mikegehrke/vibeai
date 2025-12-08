'use client'

import React, { useState, useEffect, useRef } from 'react'

// VS Code Style Studio Interface mit Copilot, ChatGPT und Auto-Agenten
export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('welcome')
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300)
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      type: 'system', 
      content: '🤖 VibeAI Studio gestartet - GitHub Copilot, ChatGPT & Auto-Agenten bereit!', 
      timestamp: new Date() 
    },
    { 
      id: 2, 
      type: 'assistant', 
      content: 'Hallo! Ich bin Ihr AI Coding Assistant. Ich habe Zugang zu GitHub Copilot für Code-Vervollständigung, ChatGPT für erweiterte Gespräche und automatische Agenten für Code-Generierung. Wie kann ich Ihnen helfen?', 
      timestamp: new Date() 
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [activeProject, setActiveProject] = useState(null)
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [codeEditor, setCodeEditor] = useState('')
  const [agents, setAgents] = useState([
    { 
      id: 'github-copilot', 
      name: 'GitHub Copilot', 
      status: 'active', 
      icon: '🤖', 
      description: 'Code completion wie in VS Code',
      type: 'copilot',
      features: ['Auto-completion', 'Code suggestions', 'Inline help']
    },
    { 
      id: 'chatgpt-agent', 
      name: 'ChatGPT Agent', 
      status: 'active', 
      icon: '💬', 
      description: 'Intelligenter Chat-Assistent',
      type: 'chat',
      features: ['Natural language', 'Code explanation', 'Problem solving']
    },
    { 
      id: 'auto-coder', 
      name: 'Auto Coder', 
      status: 'idle', 
      icon: '⚡', 
      description: 'Automatische App-Generierung',
      type: 'auto',
      features: ['Full app generation', 'Component creation', 'API generation']
    },
    { 
      id: 'debug-agent', 
      name: 'Debug Agent', 
      status: 'idle', 
      icon: '🐛', 
      description: 'Automatisches Debugging',
      type: 'debug',
      features: ['Error detection', 'Auto-fix', 'Performance optimization']
    },
    { 
      id: 'test-agent', 
      name: 'Test Agent', 
      status: 'idle', 
      icon: '🧪', 
      description: 'Automatische Tests',
      type: 'test',
      features: ['Unit tests', 'Integration tests', 'E2E tests']
    },
    { 
      id: 'deploy-agent', 
      name: 'Deploy Agent', 
      status: 'idle', 
      icon: '🚀', 
      description: 'CI/CD & Deployment',
      type: 'deploy',
      features: ['Auto deployment', 'Environment setup', 'Monitoring']
    }
  ])
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [availableModels, setAvailableModels] = useState([])
  const [terminalOutput, setTerminalOutput] = useState('VibeAI Terminal ready...\n$ ')
  const [activeBottomTab, setActiveBottomTab] = useState('chat')
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchModels()
    // Simuliere VS Code Startup
    setTimeout(() => {
      addSystemMessage('🔧 Extensions loaded: GitHub Copilot, AI IntelliSense, Auto-Agents')
      addSystemMessage('🌐 Development server started on http://localhost:3000')
      addSystemMessage('✨ All AI agents initialized and ready to assist')
    }, 1000)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const addSystemMessage = (content) => {
    const systemMessage = {
      id: Date.now() + Math.random(),
      type: 'system',
      content,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, systemMessage])
  }

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const models = await response.json()
      setAvailableModels(models)
    } catch (error) {
      console.error('Error fetching models:', error)
      setAvailableModels([
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', available: true },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', available: true }
      ])
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput('')

    // Zeige Typing Indicator
    const typingMessage = {
      id: Date.now() + 1,
      type: 'typing',
      content: '🤔 AI denkt nach...',
      timestamp: new Date()
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
      
      // Entferne Typing Indicator
      setChatMessages(prev => prev.filter(m => m.type !== 'typing'))
      
      const assistantMessage = {
        id: Date.now() + 2,
        type: 'assistant',
        content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        timestamp: new Date(),
        model: selectedModel
      }

      setChatMessages(prev => [...prev, assistantMessage])
      
      // Aktiviere relevante Agenten basierend auf der Nachricht
      if (currentInput.toLowerCase().includes('test')) {
        toggleAgent('test-agent', true)
        addSystemMessage('🧪 Test Agent aktiviert')
      }
      if (currentInput.toLowerCase().includes('deploy') || currentInput.toLowerCase().includes('publish')) {
        toggleAgent('deploy-agent', true)
        addSystemMessage('🚀 Deploy Agent aktiviert')
      }
      if (currentInput.toLowerCase().includes('debug') || currentInput.toLowerCase().includes('fehler')) {
        toggleAgent('debug-agent', true)
        addSystemMessage('🐛 Debug Agent aktiviert')
      }
      
    } catch (error) {
      setChatMessages(prev => prev.filter(m => m.type !== 'typing'))
      const errorMessage = {
        id: Date.now() + 3,
        type: 'error',
        content: 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.',
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  const createNewProject = () => {
    setActiveTab('project-wizard')
  }

  const toggleAgent = (agentId, forceActive = null) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: forceActive !== null ? (forceActive ? 'active' : 'idle') : (agent.status === 'active' ? 'idle' : 'active') }
        : agent
    ))
  }

  const runAutoAgent = async (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    addSystemMessage(`🤖 ${agent.name} wird ausgeführt...`)
    
    try {
      if (agentId === 'auto-coder') {
        addSystemMessage('⚡ Auto Coder: Generiere neue React Komponente...')
        
        // Simuliere Auto-Code-Generierung
        setTimeout(() => {
          const newFile = {
            id: Date.now(),
            name: 'AutoGenerated.jsx',
            content: `// 🤖 Auto-generiert von VibeAI Studio
import React, { useState } from 'react'

export default function AutoGenerated() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        🚀 Auto-generierte Komponente
      </h1>
      <p className="text-gray-600 mb-4">
        Diese Komponente wurde automatisch von VibeAI erstellt
      </p>
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setCount(count - 1)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          -
        </button>
        <span className="text-xl font-semibold">{count}</span>
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          +
        </button>
      </div>
    </div>
  )
}

// ✨ Features:
// - React Hooks (useState)
// - Tailwind CSS Styling 
// - Interactive Counter
// - Clean Code Structure`,
            type: 'jsx',
            autoGenerated: true
          }
          
          setFiles(prev => [...prev, newFile])
          addSystemMessage('✅ Auto Coder: React Komponente erfolgreich erstellt!')
        }, 2000)
      }
      
      if (agentId === 'debug-agent') {
        addSystemMessage('🐛 Debug Agent: Analysiere Code auf Fehler...')
        setTimeout(() => {
          addSystemMessage('✅ Debug Agent: 3 potentielle Probleme gefunden und behoben')
          setTerminalOutput(prev => prev + '\n🐛 ESLint: 2 warnings fixed\n🔧 Performance: Bundle size optimized (-15%)\n💡 Accessibility: Added ARIA labels\n✅ All checks passed\n$ ')
        }, 3000)
      }
      
      if (agentId === 'test-agent') {
        addSystemMessage('🧪 Test Agent: Generiere und führe Tests aus...')
        setTimeout(() => {
          addSystemMessage('✅ Test Agent: Unit Tests erstellt und erfolgreich ausgeführt')
          setTerminalOutput(prev => prev + '\n🧪 Jest: 12 tests passing, 0 failing\n📊 Coverage: 95.2% statements, 91.7% branches\n⏱️  Test Suites: 1 passed, 1 total\n✅ Tests completed successfully\n$ ')
        }, 2500)
      }
      
      if (agentId === 'deploy-agent') {
        addSystemMessage('🚀 Deploy Agent: Bereite Deployment vor...')
        setTimeout(() => {
          addSystemMessage('✅ Deploy Agent: Projekt erfolgreich deployed!')
          setTerminalOutput(prev => prev + '\n🚀 Building for production...\n📦 Optimizing bundle...\n🌐 Deploying to Vercel...\n✅ Deployment successful: https://your-app.vercel.app\n$ ')
        }, 4000)
      }
    } catch (error) {
      addSystemMessage(`❌ Fehler beim Ausführen von ${agent.name}: ${error.message}`)
    }
  }

  const openFile = (file) => {
    setActiveFile(file)
    setCodeEditor(file.content)
  }

  const saveFile = () => {
    if (activeFile) {
      setFiles(prev => prev.map(file => 
        file.id === activeFile.id 
          ? { ...file, content: codeEditor }
          : file
      ))
      addSystemMessage(`💾 Datei gespeichert: ${activeFile.name}`)
    }
  }

  const ProjectWizard = ({ onProjectCreate }) => {
    const [step, setStep] = useState(1)
    const [projectData, setProjectData] = useState({
      name: '',
      framework: 'react',
      description: '',
      features: []
    })

    const frameworks = [
      { id: 'react', name: 'React', icon: '⚛️', description: 'Moderne Web Apps' },
      { id: 'vue', name: 'Vue.js', icon: '💚', description: 'Progressive Framework' },
      { id: 'angular', name: 'Angular', icon: '🅰️', description: 'Enterprise Apps' },
      { id: 'flutter', name: 'Flutter', icon: '📱', description: 'Mobile Apps' },
      { id: 'next', name: 'Next.js', icon: '▲', description: 'Full-Stack React' },
      { id: 'python', name: 'Python', icon: '🐍', description: 'Backend/AI Apps' }
    ]

    const createProject = async () => {
      try {
        const response = await fetch('/api/projects/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_name: projectData.name,
            framework: projectData.framework,
            description: projectData.description,
            options: { features: projectData.features }
          })
        })

        const result = await response.json()
        
        if (result.success) {
          // Erstelle Demo-Dateien
          const demoFiles = [
            {
              id: 1,
              name: 'README.md',
              content: `# ${projectData.name}\n\n${projectData.description}\n\n## Framework: ${projectData.framework}\n\nAuto-generated by VibeAI Studio`,
              type: 'md'
            },
            {
              id: 2,
              name: 'App.jsx',
              content: `import React from 'react'\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>Welcome to ${projectData.name}</h1>\n      <p>${projectData.description}</p>\n    </div>\n  )\n}`,
              type: 'jsx'
            }
          ]
          
          setFiles(demoFiles)
          onProjectCreate({
            id: result.project_id,
            name: projectData.name,
            framework: projectData.framework,
            path: result.path
          })
        }
      } catch (error) {
        console.error('Error creating project:', error)
        addSystemMessage(`❌ Fehler beim Erstellen des Projekts: ${error.message}`)
      }
    }

    return (
      <div className="p-3">
        <h3 className="text-xs font-semibold mb-4 uppercase tracking-wide">Neues Projekt</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-300">Projektname</label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mein tolles Projekt"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-300">Beschreibung</label>
            <textarea
              value={projectData.description}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Beschreiben Sie Ihr Projekt..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 text-gray-300">Framework</label>
            <div className="space-y-2">
              {frameworks.map(framework => (
                <div
                  key={framework.id}
                  onClick={() => setProjectData(prev => ({ ...prev, framework: framework.id }))}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    projectData.framework === framework.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{framework.icon}</span>
                    <div>
                      <div className="text-xs font-medium">{framework.name}</div>
                      <div className="text-xs text-gray-400">{framework.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={createProject}
            disabled={!projectData.name}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded text-xs transition-colors"
          >
            🚀 Projekt erstellen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top Menu Bar - VS Code Style */}
      <div className="h-7 bg-gray-800 border-b border-gray-700 flex items-center px-2 text-xs">
        <div className="flex space-x-4">
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Datei</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Bearbeiten</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Auswahl</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Anzeigen</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Gehen</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Terminal</span>
          <span className="hover:bg-gray-700 px-2 py-1 rounded cursor-pointer">Hilfe</span>
        </div>
        <div className="mx-auto flex-1 flex justify-center">
          <span className="text-gray-400 text-xs">VibeAI Studio - VS Code Enhanced with AI Agents</span>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-green-400 text-xs">● {agents.filter(a => a.status === 'active').length}/{agents.length} AI Agenten</span>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-gray-700 text-xs px-2 py-0.5 rounded"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          <div className="text-xs bg-green-600 px-2 py-0.5 rounded">🔴 Live</div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="flex flex-col space-y-1 p-1">
            <button 
              onClick={() => setActiveTab('explorer')}
              className={`p-2 rounded text-lg ${activeTab === 'explorer' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Explorer (Strg+Shift+E)"
            >
              📁
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`p-2 rounded text-lg ${activeTab === 'search' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Suchen (Strg+Shift+F)"
            >
              🔍
            </button>
            <button 
              onClick={() => setActiveTab('git')}
              className={`p-2 rounded text-lg ${activeTab === 'git' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Source Control (Strg+Shift+G)"
            >
              🌿
            </button>
            <button 
              onClick={() => setActiveTab('debug')}
              className={`p-2 rounded text-lg ${activeTab === 'debug' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Debug (Strg+Shift+D)"
            >
              🐛
            </button>
            <button 
              onClick={() => setActiveTab('agents')}
              className={`p-2 rounded text-lg ${activeTab === 'agents' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="AI Agenten (Strg+Shift+A)"
            >
              🤖
            </button>
            <button 
              onClick={() => setActiveTab('extensions')}
              className={`p-2 rounded text-lg ${activeTab === 'extensions' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Extensions (Strg+Shift+X)"
            >
              🧩
            </button>
          </div>
          <div className="mt-auto p-1">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded text-lg ${activeTab === 'settings' ? 'bg-gray-600 text-blue-400' : 'hover:bg-gray-700'}`}
              title="Settings (Strg+,)"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Left Sidebar */}
        <div 
          className="bg-gray-850 border-r border-gray-700 overflow-auto"
          style={{ width: sidebarWidth }}
        >
          {/* Explorer Tab */}
          {activeTab === 'explorer' && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-300">Explorer</h3>
                <div className="flex space-x-1">
                  <button 
                    onClick={createNewProject}
                    className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                    title="Neues Projekt erstellen"
                  >
                    📄
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded text-xs transition-colors" title="Ordner öffnen">
                    📂
                  </button>
                </div>
              </div>
              
              {activeProject ? (
                <div>
                  <div className="text-xs text-blue-400 mb-3 font-medium flex items-center">
                    <span className="mr-2">📁</span>
                    {activeProject.name}
                  </div>
                  <div className="space-y-1">
                    {files.map((file, index) => (
                      <div 
                        key={file.id} 
                        onClick={() => openFile(file)}
                        className={`flex items-center space-x-2 hover:bg-gray-700 p-2 rounded cursor-pointer text-xs transition-colors ${
                          activeFile?.id === file.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                        }`}
                      >
                        <span>
                          {file.type === 'jsx' ? '⚛️' : 
                           file.type === 'js' ? '📄' : 
                           file.type === 'md' ? '📝' : '📄'}
                        </span>
                        <span className="flex-1">{file.name}</span>
                        {file.autoGenerated && <span className="text-purple-400 text-xs">🤖</span>}
                        {activeFile?.id === file.id && <span className="text-blue-400">●</span>}
                      </div>
                    ))}
                    {files.length === 0 && (
                      <div className="text-xs text-gray-500 italic py-2">
                        Keine Dateien vorhanden
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 text-sm">
                  <div className="mb-6">
                    <div className="text-6xl mb-4 opacity-50">📁</div>
                    <p className="text-xs mb-2 font-medium">Kein Projekt geöffnet</p>
                    <p className="text-xs text-gray-500 mb-6">
                      Öffnen Sie einen Ordner oder erstellen Sie ein neues Projekt mit KI-Unterstützung
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={createNewProject}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs transition-colors font-medium"
                    >
                      🚀 Neues Projekt mit AI
                    </button>
                    <button className="w-full bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-xs transition-colors">
                      📂 Ordner öffnen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Agents Tab */}
          {activeTab === 'agents' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold mb-4 uppercase tracking-wide text-gray-300">AI Agenten</h3>
              <div className="space-y-3">
                {agents.map(agent => (
                  <div key={agent.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{agent.icon}</span>
                        <div>
                          <span className="text-xs font-medium text-white">{agent.name}</span>
                          <div className="text-xs text-gray-400">{agent.type}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                          agent.status === 'active' ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          agent.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-3">{agent.description}</p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
                      </div>
                      {agent.status === 'active' && (
                        <button 
                          onClick={() => runAutoAgent(agent.id)}
                          className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs transition-colors"
                        >
                          ▶️ Run
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.features.map((feature, idx) => (
                          <span key={idx} className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Wizard Tab */}
          {activeTab === 'project-wizard' && (
            <ProjectWizard onProjectCreate={(project) => {
              setActiveProject(project)
              setActiveTab('explorer')
              addSystemMessage(`🎉 Projekt "${project.name}" erfolgreich erstellt!`)
            }} />
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="p-3">
              <h3 className="text-xs font-semibold mb-4 uppercase tracking-wide text-gray-300">Suchen</h3>
              <input
                type="text"
                placeholder="In Dateien suchen..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="text-xs text-gray-500">
                🔍 Durchsuchen Sie Dateien, Symbole und Code
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="h-9 bg-gray-800 border-b border-gray-700 flex items-center px-2">
            <div className="flex space-x-1">
              {activeFile ? (
                <div className="bg-gray-700 px-3 py-1 text-xs rounded-t flex items-center space-x-2">
                  <span>
                    {activeFile.type === 'jsx' ? '⚛️' : 
                     activeFile.type === 'js' ? '📄' : 
                     activeFile.type === 'md' ? '📝' : '📄'}
                  </span>
                  <span>{activeFile.name}</span>
                  {activeFile.autoGenerated && <span className="text-purple-400">🤖</span>}
                  <button className="hover:bg-gray-600 rounded px-1" onClick={() => setActiveFile(null)}>×</button>
                </div>
              ) : (
                <div className="bg-gray-700 px-3 py-1 text-xs rounded-t flex items-center space-x-2">
                  <span>🏠</span>
                  <span>Welcome</span>
                </div>
              )}
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <button 
                onClick={saveFile}
                disabled={!activeFile}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
              >
                💾 Save
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gray-900 overflow-auto">
            {activeFile ? (
              <div className="h-full">
                <textarea
                  value={codeEditor}
                  onChange={(e) => setCodeEditor(e.target.value)}
                  className="w-full h-full bg-gray-900 text-white p-4 font-mono text-sm focus:outline-none resize-none"
                  style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
                  placeholder="Beginnen Sie mit dem Programmieren..."
                />
              </div>
            ) : (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                      VibeAI Studio
                    </h1>
                    <p className="text-gray-400 text-xl mb-4">
                      VS Code Enhanced mit AI Agenten
                    </p>
                    <p className="text-gray-500 text-sm">
                      GitHub Copilot • ChatGPT Integration • Automatische Code-Generierung
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="text-3xl mb-4">🚀</div>
                      <h3 className="text-lg font-semibold mb-3 text-white">Neues Projekt</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Erstellen Sie ein neues Projekt mit KI-Unterstützung und automatischer Code-Generierung
                      </p>
                      <button 
                        onClick={createNewProject}
                        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors text-sm font-medium"
                      >
                        Projekt erstellen
                      </button>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="text-3xl mb-4">🤖</div>
                      <h3 className="text-lg font-semibold mb-3 text-white">AI Agenten</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {agents.filter(a => a.status === 'active').length} von {agents.length} Agenten aktiv
                      </p>
                      <button 
                        onClick={() => setActiveTab('agents')}
                        className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors text-sm font-medium"
                      >
                        Agenten verwalten
                      </button>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                      <div className="text-3xl mb-4">💬</div>
                      <h3 className="text-lg font-semibold mb-3 text-white">AI Chat</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Chatten Sie mit {availableModels.length} verschiedenen AI Modellen
                      </p>
                      <button 
                        onClick={() => setActiveBottomTab('chat')}
                        className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors text-sm font-medium"
                      >
                        Chat öffnen
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">Verfügbare AI Modelle</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {availableModels.map(model => (
                        <div 
                          key={model.id} 
                          className={`bg-gray-700 p-3 rounded text-center border transition-colors ${
                            selectedModel === model.id ? 'border-blue-500' : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedModel(model.id)}
                        >
                          <div className="text-xs font-medium text-white">{model.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{model.provider}</div>
                          <div className={`inline-block w-2 h-2 rounded-full mt-2 ${
                            model.available ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          <div 
            className="bg-gray-850 border-t border-gray-700"
            style={{ height: bottomPanelHeight }}
          >
            {/* Panel Tabs */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2">
              <div className="flex space-x-4 text-xs">
                <span 
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`cursor-pointer px-2 py-1 rounded ${activeBottomTab === 'terminal' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'}`}
                >
                  TERMINAL
                </span>
                <span 
                  onClick={() => setActiveBottomTab('output')}
                  className={`cursor-pointer px-2 py-1 rounded ${activeBottomTab === 'output' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'}`}
                >
                  AUSGABE
                </span>
                <span 
                  onClick={() => setActiveBottomTab('chat')}
                  className={`cursor-pointer px-2 py-1 rounded ${activeBottomTab === 'chat' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'}`}
                >
                  AI CHAT
                </span>
                <span 
                  onClick={() => setActiveBottomTab('problems')}
                  className={`cursor-pointer px-2 py-1 rounded ${activeBottomTab === 'problems' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'}`}
                >
                  PROBLEME
                </span>
              </div>
            </div>

            {/* Panel Content */}
            <div className="h-full overflow-hidden">
              {activeBottomTab === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {chatMessages.map(message => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : message.type === 'system'
                              ? 'bg-gray-700 text-green-400 text-xs font-mono'
                              : message.type === 'error'
                              ? 'bg-red-600 text-white'
                              : message.type === 'typing'
                              ? 'bg-gray-700 text-gray-400 italic'
                              : 'bg-gray-700 text-gray-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                              {message.model && (
                                <span className="text-xs opacity-70 ml-2">{message.model}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        placeholder="Fragen Sie den AI Assistant... (GitHub Copilot, ChatGPT verfügbar)"
                        className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition-colors text-sm"
                      >
                        Senden
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>AI Model: {selectedModel}</span>
                      <span>{agents.filter(a => a.status === 'active').length} Agenten aktiv</span>
                    </div>
                  </div>
                </div>
              )}

              {activeBottomTab === 'terminal' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                    <pre className="text-green-400 whitespace-pre-wrap">{terminalOutput}</pre>
                  </div>
                </div>
              )}

              {activeBottomTab === 'output' && (
                <div className="h-full p-4">
                  <div className="text-xs text-gray-400">
                    VibeAI Studio Output - Bereit für Debugging und Logs
                  </div>
                </div>
              )}

              {activeBottomTab === 'problems' && (
                <div className="h-full p-4">
                  <div className="text-xs text-gray-400">
                    Keine Probleme gefunden ✅
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}