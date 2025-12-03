/**
 * Payment Panel - Automatische Payment Code Generierung
 * Unterstützt: Stripe, PayPal, Subscriptions, One-Time Payments
 */

import React, { useState, useEffect } from 'react';
import './PaymentPanel.css';

const PaymentPanel = () => {
  // State
  const [provider, setProvider] = useState('stripe');
  const [pricingModel, setPricingModel] = useState('subscription');
  const [backendFramework, setBackendFramework] = useState('fastapi');
  const [frontendFramework, setFrontendFramework] = useState('react');
  const [currency, setCurrency] = useState('usd');
  const [amount, setAmount] = useState('19.99');
  const [interval, setInterval] = useState('month');
  const [trialDays, setTrialDays] = useState(7);
  const [successUrl, setSuccessUrl] = useState('https://yourapp.com/success');
  const [cancelUrl, setCancelUrl] = useState('https://yourapp.com/cancel');
  
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('backend');
  const [providers, setProviders] = useState([]);
  const [pricingModels, setPricingModels] = useState([]);
  const [frameworks, setFrameworks] = useState(null);

  // Load data
  useEffect(() => {
    loadProviders();
    loadPricingModels();
    loadFrameworks();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await fetch('/payment-gen/providers');
      const data = await response.json();
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadPricingModels = async () => {
    try {
      const response = await fetch('/payment-gen/pricing-models');
      const data = await response.json();
      if (data.success) {
        setPricingModels(data.pricing_models);
      }
    } catch (error) {
      console.error('Failed to load pricing models:', error);
    }
  };

  const loadFrameworks = async () => {
    try {
      const response = await fetch('/payment-gen/frameworks');
      const data = await response.json();
      if (data.success) {
        setFrameworks(data);
      }
    } catch (error) {
      console.error('Failed to load frameworks:', error);
    }
  };

  const generatePaymentSystem = async () => {
    setLoading(true);
    setGeneratedCode(null);

    try {
      const response = await fetch('/payment-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          pricing_model: pricingModel,
          backend_framework: backendFramework,
          frontend_framework: frontendFramework,
          currency,
          amount: pricingModel === 'one_time' ? parseFloat(amount) : null,
          subscription_interval: interval,
          trial_days: parseInt(trialDays),
          success_url: successUrl,
          cancel_url: cancelUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data);
        setActiveTab('backend');
      } else {
        alert('Failed to generate code: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const downloadCode = () => {
    if (!generatedCode) return;

    const files = [
      {
        name: 'backend_payment.py',
        content: generatedCode.backend_code
      },
      {
        name: 'webhook_handler.py',
        content: generatedCode.webhook_code
      },
      {
        name: '.env.example',
        content: Object.entries(generatedCode.env_variables)
          .map(([key, value]) => `${key}=${value}`)
          .join('\n')
      },
      {
        name: 'SETUP.md',
        content: generatedCode.setup_instructions
      }
    ];

    if (generatedCode.frontend_code) {
      const ext = frontendFramework === 'flutter' ? 'dart' : 'jsx';
      files.push({
        name: `PaymentComponent.${ext}`,
        content: generatedCode.frontend_code
      });
    }

    // Create zip (simplified - in production use JSZip)
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const getProviderIcon = (providerType) => {
    const icons = {
      stripe: '💳',
      paypal: '💰',
      both: '🔄'
    };
    return icons[providerType] || '💳';
  };

  const getPricingIcon = (model) => {
    const icons = {
      one_time: '🛒',
      subscription: '🔁',
      usage_based: '📊',
      tiered: '📈'
    };
    return icons[model] || '💵';
  };

  return (
    <div className="payment-panel">
      <div className="payment-header">
        <h2>💳 Payment Generator</h2>
        <p className="payment-subtitle">
          Generate production-ready Stripe & PayPal integration code
        </p>
      </div>

      <div className="payment-content">
        {/* Configuration Panel */}
        <div className="payment-config">
          <div className="config-section">
            <h3>🏦 Payment Provider</h3>
            <div className="provider-grid">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className={`provider-card ${provider === p.id ? 'active' : ''}`}
                  onClick={() => setProvider(p.id)}
                >
                  <div className="provider-icon">{getProviderIcon(p.id)}</div>
                  <div className="provider-name">{p.name}</div>
                  <div className="provider-fees">{p.fees || 'Multiple providers'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3>💵 Pricing Model</h3>
            <div className="pricing-grid">
              {pricingModels.map((pm) => (
                <div
                  key={pm.id}
                  className={`pricing-card ${pricingModel === pm.id ? 'active' : ''}`}
                  onClick={() => setPricingModel(pm.id)}
                >
                  <div className="pricing-icon">{getPricingIcon(pm.id)}</div>
                  <div className="pricing-name">{pm.name}</div>
                  <div className="pricing-desc">{pm.description}</div>
                </div>
              ))}
            </div>
          </div>

          {pricingModel === 'one_time' && (
            <div className="config-section">
              <h3>💰 Amount</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="usd">USD - US Dollar</option>
                    <option value="eur">EUR - Euro</option>
                    <option value="gbp">GBP - British Pound</option>
                    <option value="jpy">JPY - Japanese Yen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    placeholder="19.99"
                  />
                </div>
              </div>
            </div>
          )}

          {pricingModel === 'subscription' && (
            <div className="config-section">
              <h3>🔁 Subscription Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Billing Interval</label>
                  <select value={interval} onChange={(e) => setInterval(e.target.value)}>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trial Days</label>
                  <input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    min="0"
                    max="90"
                    placeholder="7"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="config-section">
            <h3>⚙️ Backend Framework</h3>
            <select
              value={backendFramework}
              onChange={(e) => setBackendFramework(e.target.value)}
              className="framework-select"
            >
              {frameworks?.backend_frameworks.map((fw) => (
                <option key={fw.id} value={fw.id} disabled={fw.status !== 'fully_supported'}>
                  {fw.name} ({fw.language})
                  {fw.status === 'coming_soon' && ' - Coming Soon'}
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <h3>🎨 Frontend Framework</h3>
            <select
              value={frontendFramework}
              onChange={(e) => setFrontendFramework(e.target.value)}
              className="framework-select"
            >
              <option value="">None (Backend only)</option>
              {frameworks?.frontend_frameworks.map((fw) => (
                <option key={fw.id} value={fw.id} disabled={fw.status !== 'fully_supported'}>
                  {fw.name} ({fw.language})
                  {fw.status === 'coming_soon' && ' - Coming Soon'}
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <h3>🔗 URLs</h3>
            <div className="form-group">
              <label>Success URL</label>
              <input
                type="url"
                value={successUrl}
                onChange={(e) => setSuccessUrl(e.target.value)}
                placeholder="https://yourapp.com/success"
              />
            </div>
            <div className="form-group">
              <label>Cancel URL</label>
              <input
                type="url"
                value={cancelUrl}
                onChange={(e) => setCancelUrl(e.target.value)}
                placeholder="https://yourapp.com/cancel"
              />
            </div>
          </div>

          <button
            className="generate-btn"
            onClick={generatePaymentSystem}
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '🚀 Generate Payment System'}
          </button>
        </div>

        {/* Generated Code Panel */}
        {generatedCode && (
          <div className="payment-output">
            <div className="output-header">
              <h3>📦 Generated Code</h3>
              <div className="output-actions">
                <button onClick={() => copyToClipboard(
                  activeTab === 'backend' ? generatedCode.backend_code :
                  activeTab === 'webhook' ? generatedCode.webhook_code :
                  activeTab === 'frontend' ? generatedCode.frontend_code :
                  activeTab === 'env' ? Object.entries(generatedCode.env_variables)
                    .map(([k, v]) => `${k}=${v}`).join('\n') :
                  generatedCode.setup_instructions
                )} className="copy-btn">
                  📋 Copy
                </button>
                <button onClick={downloadCode} className="download-btn">
                  ⬇️ Download All
                </button>
              </div>
            </div>

            <div className="code-tabs">
              <button
                className={activeTab === 'backend' ? 'active' : ''}
                onClick={() => setActiveTab('backend')}
              >
                🔧 Backend ({backendFramework})
              </button>
              <button
                className={activeTab === 'webhook' ? 'active' : ''}
                onClick={() => setActiveTab('webhook')}
              >
                🔔 Webhooks
              </button>
              {generatedCode.frontend_code && (
                <button
                  className={activeTab === 'frontend' ? 'active' : ''}
                  onClick={() => setActiveTab('frontend')}
                >
                  🎨 Frontend ({frontendFramework})
                </button>
              )}
              <button
                className={activeTab === 'env' ? 'active' : ''}
                onClick={() => setActiveTab('env')}
              >
                🔐 Environment
              </button>
              <button
                className={activeTab === 'setup' ? 'active' : ''}
                onClick={() => setActiveTab('setup')}
              >
                📖 Setup Guide
              </button>
            </div>

            <div className="code-display">
              {activeTab === 'backend' && (
                <pre><code>{generatedCode.backend_code}</code></pre>
              )}
              {activeTab === 'webhook' && (
                <pre><code>{generatedCode.webhook_code}</code></pre>
              )}
              {activeTab === 'frontend' && generatedCode.frontend_code && (
                <pre><code>{generatedCode.frontend_code}</code></pre>
              )}
              {activeTab === 'env' && (
                <pre><code>
                  {Object.entries(generatedCode.env_variables)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('\n')}
                </code></pre>
              )}
              {activeTab === 'setup' && (
                <div className="setup-instructions">
                  <pre>{generatedCode.setup_instructions}</pre>
                </div>
              )}
            </div>

            <div className="installation-commands">
              <h4>📦 Installation</h4>
              <div className="command-list">
                {generatedCode.installation_commands.map((cmd, index) => (
                  <div key={index} className="command-item">
                    <code>{cmd}</code>
                    <button onClick={() => copyToClipboard(cmd)}>📋</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="payment-info">
              <div className="info-card">
                <h4>✅ Generated Features</h4>
                <ul>
                  <li>✓ {provider === 'stripe' ? 'Stripe' : provider === 'paypal' ? 'PayPal' : 'Stripe + PayPal'} integration</li>
                  <li>✓ {pricingModel === 'subscription' ? 'Subscription management' : 'One-time payment'}</li>
                  <li>✓ Webhook event handling</li>
                  <li>✓ Security best practices</li>
                  <li>✓ Test mode support</li>
                  {frontendFramework && <li>✓ Frontend payment UI</li>}
                </ul>
              </div>

              <div className="info-card">
                <h4>🔐 Security Features</h4>
                <ul>
                  <li>✓ Webhook signature verification</li>
                  <li>✓ Environment variable configuration</li>
                  <li>✓ HTTPS enforcement</li>
                  <li>✓ Error handling</li>
                  <li>✓ PCI-DSS compliant (Stripe/PayPal hosted)</li>
                </ul>
              </div>

              <div className="info-card">
                <h4>📝 Next Steps</h4>
                <ol>
                  <li>Create Stripe/PayPal account</li>
                  <li>Get API credentials</li>
                  <li>Configure webhook endpoints</li>
                  <li>Test with sandbox mode</li>
                  <li>Deploy to production</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Examples */}
      <div className="payment-examples">
        <h3>💡 Quick Examples</h3>
        <div className="examples-grid">
          <div className="example-card" onClick={() => {
            setProvider('stripe');
            setPricingModel('subscription');
            setInterval('month');
            setTrialDays(7);
            setBackendFramework('fastapi');
            setFrontendFramework('react');
          }}>
            <div className="example-icon">🎯</div>
            <div className="example-title">SaaS Subscription</div>
            <div className="example-desc">Stripe + Monthly billing + 7-day trial</div>
          </div>

          <div className="example-card" onClick={() => {
            setProvider('paypal');
            setPricingModel('one_time');
            setAmount('49.99');
            setBackendFramework('fastapi');
            setFrontendFramework('react');
          }}>
            <div className="example-icon">🛍️</div>
            <div className="example-title">E-Commerce</div>
            <div className="example-desc">PayPal + One-time payment</div>
          </div>

          <div className="example-card" onClick={() => {
            setProvider('both');
            setPricingModel('subscription');
            setInterval('year');
            setTrialDays(14);
            setBackendFramework('fastapi');
            setFrontendFramework('react');
          }}>
            <div className="example-icon">💎</div>
            <div className="example-title">Premium Plan</div>
            <div className="example-desc">Stripe + PayPal + Yearly + 14-day trial</div>
          </div>

          <div className="example-card" onClick={() => {
            setProvider('stripe');
            setPricingModel('subscription');
            setInterval('month');
            setTrialDays(0);
            setBackendFramework('fastapi');
            setFrontendFramework('flutter');
          }}>
            <div className="example-icon">📱</div>
            <div className="example-title">Mobile App</div>
            <div className="example-desc">Stripe + Flutter Payment Sheet</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
