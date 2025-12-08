'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function DeployerPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('vercel')
  const [deployStatus, setDeployStatus] = useState(null)

  const platforms = [
    {
      id: 'vercel',
      name: 'Vercel',
      icon: '▲',
      description: 'Deploy Next.js apps instantly',
      color: '#000'
    },
    {
      id: 'aws',
      name: 'AWS',
      icon: '☁️',
      description: 'Amazon Web Services',
      color: '#FF9900'
    },
    {
      id: 'docker',
      name: 'Docker',
      icon: '🐳',
      description: 'Containerize your app',
      color: '#2496ED'
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      icon: '⎈',
      description: 'Container orchestration',
      color: '#326CE5'
    },
  ]

  const deployConfigs = {
    vercel: {
      env: ['NEXT_PUBLIC_API_URL', 'DATABASE_URL'],
      regions: ['Frankfurt', 'San Francisco', 'Singapore'],
      framework: 'Next.js'
    },
    aws: {
      env: ['AWS_REGION', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY'],
      regions: ['eu-central-1', 'us-east-1', 'ap-southeast-1'],
      framework: 'Any'
    },
    docker: {
      env: ['NODE_ENV', 'PORT'],
      regions: ['Local', 'Any Registry'],
      framework: 'Any'
    },
    kubernetes: {
      env: ['NAMESPACE', 'REPLICAS'],
      regions: ['Any Cluster'],
      framework: 'Any'
    }
  }

  const handleDeploy = () => {
    setDeployStatus('🚀 Starting deployment...')

    setTimeout(() => {
      setDeployStatus('📦 Building application...')
    }, 1000)

    setTimeout(() => {
      setDeployStatus('⬆️ Uploading to ' + platforms.find(p => p.id === selectedPlatform).name + '...')
    }, 2000)

    setTimeout(() => {
      setDeployStatus('✅ Deployment successful!\n\n🔗 Your app is live at:\nhttps://vibeai-' + selectedPlatform + '.app')
    }, 3500)
  }

  const config = deployConfigs[selectedPlatform]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem' }}>←</Link>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🚢 Deployer</h1>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        {/* Left: Platform Selection */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Select Platform</h2>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                style={{
                  padding: '1.5rem',
                  background: selectedPlatform === platform.id
                    ? 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{platform.icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {platform.name}
                </div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                  {platform.description}
                </div>
              </button>
            ))}
          </div>

          {/* Configuration */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Configuration</h3>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Framework
              </div>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}>
                {config.framework}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Region
              </div>
              <select style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}>
                {config.regions.map(region => (
                  <option key={region} value={region} style={{ background: '#1a1a2e' }}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Environment Variables
              </div>
              {config.env.map(envVar => (
                <input
                  key={envVar}
                  type="text"
                  placeholder={envVar}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    outline: 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            style={{
              width: '100%',
              padding: '1.25rem',
              background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚀 Deploy Now
          </button>
        </div>

        {/* Right: Deployment Status */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Deployment Log</h2>

          {!deployStatus ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚢</div>
              <h3>Ready to deploy</h3>
              <p>Select a platform and click "Deploy Now"</p>
            </div>
          ) : (
            <div style={{
              flex: 1,
              background: '#1a1a2e',
              borderRadius: '8px',
              padding: '1.5rem',
              fontFamily: 'Monaco, Courier, monospace',
              fontSize: '1rem',
              color: '#30cfd0',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8'
            }}>
              {deployStatus}
            </div>
          )}

          {/* Recent Deployments */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '0.5rem', opacity: 0.7, fontSize: '0.9rem' }}>
              Recent Deployments
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.5 }}>
              No previous deployments
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
