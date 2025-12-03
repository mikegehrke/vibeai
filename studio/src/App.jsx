import { useState } from 'react'
import ModelDashboard from './components/ModelDashboard'
import ModelTester from './components/ModelTester'
import ModelComparison from './components/ModelComparison'
import ChatInterfaceEnhanced from './components/ChatInterfaceEnhanced'
import AppStudioUltra from './components/AppStudioUltra'
import CodeStudio from './components/CodeStudio';
import AppBuilder from './components/AppBuilder'
import FlowPanel from './components/FlowPanel'
import FlowchartPanel from './components/FlowchartPanel'
import TestPanel from './components/TestPanel'
import ErrorPanel from './components/ErrorPanel'
import PaymentPanel from './components/PaymentPanel'
import RealtimePanel from './components/RealtimePanel'
import StorePanel from './components/StorePanel'
import AIIntelligencePanel from './components/AIIntelligencePanel'
import AutopilotPanel from './components/AutopilotPanel'
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
        return <CodeStudio />;
      case 'appbuilder':
        return <AppBuilder />
      case 'flow':
        return <FlowPanel />
      case 'flowchart':
        return <FlowchartPanel />
      case 'testgen':
        return <TestPanel />
      case 'errorfixer':
        return <ErrorPanel />
      case 'payment':
        return <PaymentPanel />
      case 'realtime':
        return <RealtimePanel />
      case 'store':
        return <StorePanel />
      case 'ai-intelligence':
        return <AIIntelligencePanel />
      case 'autopilot':
        return <AutopilotPanel />
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
            className={activeTab === 'flow' ? 'active' : ''}
            onClick={() => setActiveTab('flow')}
          >
            🗺️ Flow Builder
          </button>
          <button 
            className={activeTab === 'flowchart' ? 'active' : ''}
            onClick={() => setActiveTab('flowchart')}
          >
            🎨 AI Flowchart
          </button>
          <button 
            className={activeTab === 'testgen' ? 'active' : ''}
            onClick={() => setActiveTab('testgen')}
          >
            🧪 Test Generator
          </button>
          <button 
            className={activeTab === 'errorfixer' ? 'active' : ''}
            onClick={() => setActiveTab('errorfixer')}
          >
            🔧 Error Fixer
          </button>
          <button 
            className={activeTab === 'payment' ? 'active' : ''}
            onClick={() => setActiveTab('payment')}
          >
            💳 Payment Generator
          </button>
          <button 
            className={activeTab === 'realtime' ? 'active' : ''}
            onClick={() => setActiveTab('realtime')}
          >
            🔴 Realtime Generator
          </button>
          <button 
            className={activeTab === 'store' ? 'active' : ''}
            onClick={() => setActiveTab('store')}
          >
            🏪 Store Generator
          </button>
          <button 
            className={activeTab === 'ai-intelligence' ? 'active' : ''}
            onClick={() => setActiveTab('ai-intelligence')}
          >
            🤖 AI Intelligence
          </button>
          <button 
            className={activeTab === 'autopilot' ? 'active' : ''}
            onClick={() => setActiveTab('autopilot')}
          >
            🚀 Autopilot
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
