'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null)

  const modules = [
    {
      id: 'builder',
      title: '🏗️ App Builder',
      description: 'Erstelle komplette Apps in Flutter, React, Next.js & mehr',
      href: '/builder',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      features: ['8 Plattformen', 'AI Prompt Generator', 'Full-Stack', 'Mobile + Web']
    },
    {
      id: 'chatgpt',
      title: '💬 VibeAI Chat',
      description: 'Multi-Model AI Chat mit Agenten & Web-Suche',
      href: '/chatgpt',
      color: 'linear-gradient(135deg, #10a37f 0%, #1a7f64 100%)',
      features: ['250+ Modelle', 'Agenten-Modus', 'Web-Suche', 'Deep Research']
    },
    {
      id: 'studio',
      title: '🎨 Code Studio',
      description: 'Advanced code editor with AI assistance',
      href: '/studio',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      features: ['AI Autocomplete', 'Refactoring', 'Bug Detection']
    },
    {
      id: 'generator',
      title: '⚡ Project Generator',
      description: 'Generate full-stack projects with AI',
      href: '/generator',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      features: ['React', 'Next.js', 'Python', 'Flutter']
    },
    {
      id: 'analyzer',
      title: '🔍 Code Analyzer',
      description: 'Deep code analysis and optimization',
      href: '/analyzer',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      features: ['Error Detection', 'Performance', 'Security']
    },
    {
      id: 'deployer',
      title: '🚢 Deployer',
      description: 'One-click deployment to cloud platforms',
      href: '/deployer',
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      features: ['Vercel', 'AWS', 'Docker', 'Kubernetes']
    }
  ]

  return (
    <main style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
          background: 'linear-gradient(to right, #667eea, #764ba2, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          VibeAI Platform
        </h1>

        <p style={{ fontSize: '1.5rem', opacity: 0.9, marginBottom: '1rem' }}>
          Complete AI-Powered Development Suite
        </p>

        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          fontSize: '0.9rem',
          opacity: 0.7
        }}>
          <span>🤖 Multi-Model AI</span>
          <span>⚡ Real-time Collaboration</span>
          <span>🚀 Instant Deployment</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {modules.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            onMouseEnter={() => setHoveredCard(module.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              textDecoration: 'none',
              color: 'white',
              background: hoveredCard === module.id ? module.color : 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              transform: hoveredCard === module.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
              boxShadow: hoveredCard === module.id
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer'
            }}
          >
            <h2 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {module.title}
            </h2>

            <p style={{
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              opacity: 0.9,
              lineHeight: '1.5'
            }}>
              {module.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              {module.features.map((feature, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div style={{
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              opacity: 0.8,
              fontWeight: 'bold'
            }}>
              {hoveredCard === module.id ? '→ Open Module' : 'Click to open'}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        maxWidth: '800px',
        margin: '4rem auto 0',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>System Status</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          fontSize: '0.9rem'
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div>Backend API</div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>:8000</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
            <div>Auto-Fix Running</div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>21/237 files</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
            <div>Frontend</div>
            <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>:3000</div>
          </div>
        </div>
      </div>
    </main>
  )
}
