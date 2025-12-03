import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        VibeAI App Builder
      </h1>
      
      <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9 }}>
        AI-Powered Development Platform
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link 
          href="/builder/demo-project"
          style={{
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          🚀 Open Builder
        </Link>
      </div>
      
      <div style={{ 
        marginTop: '3rem', 
        textAlign: 'center',
        opacity: 0.7,
        fontSize: '0.9rem'
      }}>
        <p>Features:</p>
        <p>✨ Monaco Code Editor • 🔴 Live Preview • 🤖 AI Assistant • 📁 File Explorer</p>
      </div>
    </main>
  )
}
