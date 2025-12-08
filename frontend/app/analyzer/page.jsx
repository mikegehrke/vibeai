'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function AnalyzerPage() {
  const [code, setCode] = useState(`function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price
  }
  return total
}

// Unused variable
let unusedVar = "test";

console.log(calculateTotal([{price: 10}, {price: 20}]))
`)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCode = async () => {
    setIsAnalyzing(true)
    setAnalysis({ status: '🔍 Analyzing code...' })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          prompt: `Analyze this code in detail and provide:
1. ❌ Errors and bugs
2. ⚠️ Warnings and code smells
3. 💡 Performance improvements
4. 🔒 Security issues
5. ✨ Best practices recommendations

Code:
\`\`\`
${code}
\`\`\`

Format as clear sections with specific line numbers.`,
          stream: false
        })
      })

      const data = await response.json()
      setAnalysis({
        status: '✅ Analysis Complete',
        result: data.response
      })
    } catch (error) {
      setAnalysis({
        status: '❌ Analysis Failed',
        result: error.message
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const quickScans = [
    { name: 'Security Scan', icon: '🔒', description: 'Check for vulnerabilities' },
    { name: 'Performance', icon: '⚡', description: 'Optimize speed' },
    { name: 'Code Quality', icon: '✨', description: 'Best practices' },
    { name: 'Type Safety', icon: '🛡️', description: 'Type checking' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1600px',
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
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🔍 Code Analyzer</h1>
        </div>

        <button
          onClick={analyzeCode}
          disabled={isAnalyzing}
          style={{
            padding: '0.75rem 2rem',
            background: isAnalyzing
              ? 'rgba(100, 100, 100, 0.3)'
              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: isAnalyzing ? 'not-allowed' : 'pointer'
          }}
        >
          {isAnalyzing ? '🔍 Analyzing...' : '🚀 Deep Analyze'}
        </button>
      </div>

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        height: 'calc(100vh - 150px)'
      }}>
        {/* Left: Code Input */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Quick Scans */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Quick Scans</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {quickScans.map(scan => (
                <button
                  key={scan.name}
                  style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{scan.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{scan.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{scan.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>📝 Code to Analyze</div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                background: '#1a1a2e',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fee140',
                padding: '1rem',
                fontSize: '1rem',
                fontFamily: 'Monaco, Courier, monospace',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.6'
              }}
            />
          </div>
        </div>

        {/* Right: Analysis Results */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📊 Analysis Results
          </div>

          {!analysis ? (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.5,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>No analysis yet</h3>
              <p>Paste your code and click "Deep Analyze"</p>
            </div>
          ) : (
            <div style={{
              flex: 1,
              overflowY: 'auto'
            }}>
              <div style={{
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                {analysis.status}
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '1.5rem',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8',
                fontSize: '0.95rem'
              }}>
                {analysis.result || 'Analyzing...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
