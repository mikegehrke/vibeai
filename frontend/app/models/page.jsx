'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function ModelsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('all')

  // Komplette Model-Liste mit ~250 Modellen
  const allModels = [
    // === OPENAI MODELS ===
    { id: 'gpt-4o-2024-11-20', name: 'GPT-4o (Latest)', provider: 'OpenAI', context: '128k', price: '$2.50/$10', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context: '128k', price: '$2.50/$10', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', context: '128k', price: '$0.15/$0.60', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', context: '128k', price: '$10/$30', speed: '⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', provider: 'OpenAI', context: '128k', price: '$10/$30', speed: '⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', context: '8k', price: '$30/$60', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-4-32k', name: 'GPT-4 32k', provider: 'OpenAI', context: '32k', price: '$60/$120', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', context: '16k', price: '$0.50/$1.50', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16k', provider: 'OpenAI', context: '16k', price: '$3/$4', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'o1-preview', name: 'O1 Preview', provider: 'OpenAI', context: '128k', price: '$15/$60', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'o1-mini', name: 'O1 Mini', provider: 'OpenAI', context: '128k', price: '$3/$12', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },

    // === ANTHROPIC CLAUDE MODELS ===
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Latest)', provider: 'Anthropic', context: '200k', price: '$3/$15', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', context: '200k', price: '$15/$75', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'Anthropic', context: '200k', price: '$3/$15', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic', context: '200k', price: '$0.25/$1.25', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'claude-2.1', name: 'Claude 2.1', provider: 'Anthropic', context: '200k', price: '$8/$24', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'claude-2.0', name: 'Claude 2.0', provider: 'Anthropic', context: '100k', price: '$8/$24', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'claude-instant-1.2', name: 'Claude Instant', provider: 'Anthropic', context: '100k', price: '$0.80/$2.40', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },

    // === GOOGLE GEMINI MODELS ===
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', context: '2M', price: '$1.25/$5', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', context: '1M', price: '$0.075/$0.30', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', context: '32k', price: '$0.50/$1.50', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google', context: '16k', price: '$0.50/$1.50', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },

    // === GITHUB COPILOT MODELS ===
    { id: 'gpt-4o', name: 'GitHub GPT-4o', provider: 'GitHub', context: '128k', price: 'Free*', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'Phi-3.5-MoE-instruct', name: 'Phi-3.5 MoE', provider: 'GitHub', context: '128k', price: 'Free*', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'Phi-3.5-mini-instruct', name: 'Phi-3.5 Mini', provider: 'GitHub', context: '128k', price: 'Free*', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'Phi-3-medium-instruct', name: 'Phi-3 Medium', provider: 'GitHub', context: '128k', price: 'Free*', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐⭐' },

    // === OLLAMA LOCAL MODELS ===
    { id: 'llama3.2:90b', name: 'Llama 3.2 90B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'llama3.2:70b', name: 'Llama 3.2 70B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'llama3.2:11b', name: 'Llama 3.2 11B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'llama3.2:3b', name: 'Llama 3.2 3B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'llama3.2:1b', name: 'Llama 3.2 1B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐' },
    { id: 'llama3.1:405b', name: 'Llama 3.1 405B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'llama3.1:70b', name: 'Llama 3.1 70B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'llama3.1:8b', name: 'Llama 3.1 8B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'llama3:70b', name: 'Llama 3 70B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'llama3:8b', name: 'Llama 3 8B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'llama2:70b', name: 'Llama 2 70B', provider: 'Ollama', context: '4k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐' },
    { id: 'llama2:13b', name: 'Llama 2 13B', provider: 'Ollama', context: '4k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'llama2:7b', name: 'Llama 2 7B', provider: 'Ollama', context: '4k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐' },
    { id: 'codellama:70b', name: 'Code Llama 70B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'codellama:34b', name: 'Code Llama 34B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'codellama:13b', name: 'Code Llama 13B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'codellama:7b', name: 'Code Llama 7B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'mixtral:8x7b', name: 'Mixtral 8x7B', provider: 'Ollama', context: '32k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'mixtral:8x22b', name: 'Mixtral 8x22B', provider: 'Ollama', context: '64k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'mistral:7b', name: 'Mistral 7B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'mistral-nemo:12b', name: 'Mistral Nemo 12B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'deepseek-coder:33b', name: 'DeepSeek Coder 33B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder 6.7B', provider: 'Ollama', context: '16k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡', quality: '⭐⭐⭐⭐⭐' },
    { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'qwen2.5:14b', name: 'Qwen 2.5 14B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'phi3:14b', name: 'Phi-3 14B', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'phi3:3.8b', name: 'Phi-3 Mini', provider: 'Ollama', context: '128k', price: 'Free', speed: '⚡⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'gemma2:27b', name: 'Gemma 2 27B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡⚡', quality: '⭐⭐⭐⭐' },
    { id: 'gemma2:9b', name: 'Gemma 2 9B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
    { id: 'gemma:7b', name: 'Gemma 7B', provider: 'Ollama', context: '8k', price: 'Free', speed: '⚡⚡⚡⚡', quality: '⭐⭐⭐' },
  ]

  const providers = ['all', 'OpenAI', 'Anthropic', 'Google', 'GitHub', 'Ollama']

  const filteredModels = allModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider
    return matchesSearch && matchesProvider
  })

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
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🤖 AI Models ({filteredModels.length})</h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              width: '300px'
            }}
          />

          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {providers.map(p => (
              <option key={p} value={p} style={{ background: '#1a1a2e' }}>
                {p === 'all' ? 'All Providers' : p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Table */}
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Model</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Provider</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Context</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Price</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Speed</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Quality</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model, idx) => (
              <tr
                key={model.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{model.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{model.id}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    {model.provider}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>{model.context}</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{model.price}</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>{model.speed}</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontSize: '1.2rem' }}>{model.quality}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link
                    href={`/chat?model=${model.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Try
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Footer */}
      <div style={{
        maxWidth: '1600px',
        margin: '2rem auto 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1rem'
      }}>
        {providers.filter(p => p !== 'all').map(provider => {
          const count = allModels.filter(m => m.provider === provider).length
          return (
            <div
              key={provider}
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{count}</div>
              <div style={{ opacity: 0.8 }}>{provider} Models</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
