import { useState } from 'react'
import ModelDashboard from './components/ModelDashboard'
import ModelTester from './components/ModelTester'
import ModelComparison from './components/ModelComparison'
import ChatInterfaceEnhanced from './components/ChatInterfaceEnhanced'
import AppStudioUltra from './components/AppStudioUltra'
import CodeStudio from './components/CodeStudio'
import AppBuilder from './components/AppBuilder'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('chat')

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterfaceEnhanced />
      case 'studio':
        return <AppStudioUltra />
      case 'codestudio':
        return <CodeStudio />
      case 'appbuilder':
        return <AppBuilder />
      case 'dashboard':
        return <ModelDashboard />
      case 'tester':
        return <ModelTester />
      case 'comparison':
        return <ModelComparison />
      default:
        return <ChatInterfaceEnhanced />
    }
  }

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>🚀 VibeAI 2.0</h1>
          <span className="subtitle">Ultimate AI Model Testing Platform</span>
        </div>
        
        <div className="nav-tabs">
          <button 
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            💬 AI Chat
          </button>
          <button 
            className={activeTab === 'appbuilder' ? 'active' : ''}
            onClick={() => setActiveTab('appbuilder')}
          >
            🚀 App Builder
          </button>
          <button 
            className={activeTab === 'studio' ? 'active' : ''}
            onClick={() => setActiveTab('studio')}
          >
            🎨 App Studio
          </button>
          <button 
            className={activeTab === 'codestudio' ? 'active' : ''}
            onClick={() => setActiveTab('codestudio')}
          >
            💻 Code Studio
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            🌟 Model Dashboard
          </button>
          <button 
            className={activeTab === 'tester' ? 'active' : ''}
            onClick={() => setActiveTab('tester')}
          >
            🧪 Interactive Tester
          </button>
          <button 
            className={activeTab === 'comparison' ? 'active' : ''}
            onClick={() => setActiveTab('comparison')}
          >
            ⚔️ Model Battle
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
