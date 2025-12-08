'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function GeneratorPage() {
  const [projectType, setProjectType] = useState('react')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const projectTypes = [
    { id: 'react', name: 'React App', icon: '⚛️' },
    { id: 'nextjs', name: 'Next.js', icon: '▲' },
    { id: 'python', name: 'Python Backend', icon: '🐍' },
    { id: 'flutter', name: 'Flutter App', icon: '📱' },
    { id: 'api', name: 'REST API', icon: '🔌' },
  ]

  const featureOptions = ['Auth', 'Database', 'API', 'UI Components', 'Tests', 'Docker']

  const toggleFeature = (feature) => {
    setFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const generateProject = async () => {
    if (!projectName) {
      alert('Please enter a project name')
      return
    }

    setIsGenerating(true)
    setGeneratedCode('⚡ Generating your project...')

    try {
      const prompt = `Generate a complete ${projectType} project called "${projectName}".
Description: ${description || 'No description provided'}
Features: ${features.join(', ') || 'Basic setup'}

Provide the complete project structure with all necessary files and code.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          prompt,
          stream: false
        })
      })

      const data = await response.json()
      setGeneratedCode(data.response || 'Generation failed')
    } catch (error) {
      setGeneratedCode(`❌ Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

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
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>⚡ Project Generator</h1>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '1rem',
        height: 'calc(100vh - 150px)'
      }}>
        {/* Configuration Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Project Configuration</h2>

          {/* Project Type */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
              Project Type
            </label>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {projectTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setProjectType(type.id)}
                  style={{
                    padding: '0.75rem',
                    background: projectType === type.id
                      ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textAlign: 'left'
                  }}
                >
                  {type.icon} {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-project"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Features */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
              Features
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {featureOptions.map(feature => (
                <button
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  style={{
                    padding: '0.5rem',
                    background: features.includes(feature)
                      ? 'rgba(67, 233, 123, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid ' + (features.includes(feature)
                      ? 'rgba(67, 233, 123, 0.5)'
                      : 'rgba(255, 255, 255, 0.2)'),
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {features.includes(feature) ? '✓ ' : ''}{feature}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateProject}
            disabled={isGenerating}
            style={{
              width: '100%',
              padding: '1rem',
              background: isGenerating
                ? 'rgba(100, 100, 100, 0.3)'
                : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? '⚡ Generating...' : '🚀 Generate Project'}
          </button>
        </div>

        {/* Generated Code */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📦 Generated Project
          </div>
          <div style={{
            flex: 1,
            background: '#1a1a2e',
            borderRadius: '8px',
            padding: '1.5rem',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#00f2fe'
          }}>
            {generatedCode || 'Configure your project and click "Generate Project" to start.'}
          </div>
        </div>
      </div>
    </div>
  )
}
