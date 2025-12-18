'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const plans = {
  'starter': {
    name: 'Starter',
    price: 'Free',
    description: 'Explore the possibilities of making apps.',
    features: [
      'Vibe AI Agent trial included',
      '10 development apps',
      'Public apps only',
      'Limited build time',
      'Basic Editor access',
      'Basic Chat Generator'
    ]
  },
  'vibe-ai-core': {
    name: 'Vibe AI Core',
    priceMonthly: '24,99',
    priceYearly: '19,99',
    priceCurrency: '€',
    description: 'Make, launch, and scale your apps.',
    features: [
      'Full Vibe AI Agent access',
      'Editor access with syntax highlighting',
      'Chat Generator & Prompt Generator',
      'Private and public apps',
      'GitHub integration & Commit',
      'ZIP export functionality',
      'Access to latest AI models',
      'Publish and host live apps',
      'Autonomous long builds'
    ]
  },
  'vibe-ai-pro-plus': {
    name: 'Vibe AI Pro+',
    priceMonthly: '39,99',
    priceYearly: '31,99',
    priceCurrency: '€',
    description: 'Advanced features for professional developers.',
    features: [
      'Everything in Vibe AI Core',
      'Advanced Editor with AI assistance',
      'Enhanced Chat & Prompt Generator',
      'Unlimited GitHub commits',
      'Priority AI model access',
      'Advanced ZIP export options',
      'Project templates library',
      'Extended build time',
      'Priority support'
    ]
  },
  'vibe-ai-ultra': {
    name: 'Vibe AI Ultra',
    priceMonthly: '54,99',
    priceYearly: '43,99',
    priceCurrency: '€',
    description: 'Maximum power for serious development.',
    features: [
      'Everything in Vibe AI Pro+',
      'Premium Editor with live collaboration',
      'Advanced Chat & Prompt features',
      'Unlimited projects & apps',
      'Premium AI models access',
      'Advanced GitHub workflows',
      'Custom project templates',
      'Extended autonomous builds',
      '24/7 priority support'
    ]
  },
  'vibe-ai-ultra-plus': {
    name: 'Vibe AI Ultra+',
    priceMonthly: '79,99',
    priceYearly: '63,99',
    priceCurrency: '€',
    description: 'Complete development suite with app store publishing.',
    features: [
      'Everything in Vibe AI Ultra',
      'Unlimited APK generation',
      'App Store preparation & setup',
      'Automatic app store publishing',
      'Advanced project management',
      'Custom domain integration',
      'White-label options',
      'Advanced analytics',
      'Dedicated account manager'
    ]
  },
  'teams': {
    name: 'Teams',
    priceMonthly: '99,99',
    priceYearly: '79,99',
    priceCurrency: '€',
    description: 'Collaborate with your entire team in real-time.',
    features: [
      'Everything in Vibe AI Ultra+',
      'Real-time team collaboration',
      'Simultaneous Editor access',
      'Shared Chat & Prompt workspace',
      'Team project management',
      'Project extension & completion',
      'Team-wide GitHub integration',
      'Centralized billing',
      'Role-based access control',
      '50 Viewer seats included'
    ]
  },
  'on-demand': {
    name: 'On Demand',
    price: 'Pay-as-you-go',
    description: 'Pay only for what you use.',
    features: [
      'Flexible pricing model',
      'Pay per API call',
      'Pay per build minute',
      'Pay per storage GB',
      'No monthly commitment',
      'Scale as you grow',
      'Usage-based billing',
      'Real-time usage tracking'
    ]
  },
  'enterprise': {
    name: 'Enterprise',
    price: 'Custom pricing',
    description: 'Enterprise-grade solutions with dedicated support.',
    features: [
      'Everything in Teams',
      'Custom database creation',
      'PostgreSQL, MySQL, MongoDB',
      'Redis, SQLite, DynamoDB',
      'Custom database configurations',
      'SSO/SAML integration',
      'SCIM provisioning',
      'Advanced security controls',
      'Dedicated infrastructure',
      'Custom SLA & support',
      'On-premise deployment options'
    ]
  }
};

export default function PricingPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planKey = params?.plan || 'starter';
  const plan = plans[planKey] || plans['starter'];
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/pricing/${planKey}`);
      return;
    }

    setLoading(true);
    // Hier würde die echte Stripe/Payment-Integration sein
    // Für jetzt: Mock
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Subscription to ${plan.name} would be processed here.`);
      // router.push('/dashboard');
    } catch (err) {
      alert('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Back Button */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#1976d2',
          textDecoration: 'none',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          <ArrowLeft size={18} />
          Back to pricing
        </Link>

        {/* Plan Card */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '0.5rem'
          }}>
            {plan.name}
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#666666',
            marginBottom: '2rem'
          }}>
            {plan.description}
          </p>

          {/* Price Toggle */}
          {plan.priceMonthly && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.95rem',
                color: !isYearly ? '#1976d2' : '#666666',
                fontWeight: !isYearly ? '600' : '400',
                cursor: 'pointer'
              }}
              onClick={() => setIsYearly(false)}
              >
                Monthly
              </span>
              <div 
                style={{
                  width: '48px',
                  height: '24px',
                  background: '#e0e0e0',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => setIsYearly(!isYearly)}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#1976d2',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: isYearly ? '26px' : '2px',
                  transition: 'left 0.3s ease'
                }} />
              </div>
              <span 
                style={{
                  fontSize: '0.95rem',
                  color: isYearly ? '#1976d2' : '#666666',
                  fontWeight: isYearly ? '600' : '400',
                  cursor: 'pointer'
                }}
                onClick={() => setIsYearly(true)}
              >
                Yearly
              </span>
              {isYearly && (
                <span style={{
                  fontSize: '0.75rem',
                  background: '#ff8c42',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  20% discount
                </span>
              )}
            </div>
          )}

          {/* Price Display */}
          <div style={{
            marginBottom: '2rem'
          }}>
            {plan.price === 'Free' ? (
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                {plan.price}
              </div>
            ) : plan.price === 'Custom pricing' || plan.price === 'Pay-as-you-go' ? (
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                {plan.price}
              </div>
            ) : (
              <div>
                {isYearly ? (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        color: '#999999',
                        textDecoration: 'line-through'
                      }}>
                        {(parseFloat(plan.priceMonthly.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}{plan.priceCurrency}
                      </span>
                      <span style={{
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: '#000000'
                      }}>
                        {(parseFloat(plan.priceYearly.replace(',', '.')) * 12).toFixed(2).replace('.', ',')}
                      </span>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#000000'
                      }}>
                        {plan.priceCurrency}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      color: '#666666'
                    }}>
                      per year
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: '#000000'
                      }}>
                        {plan.priceMonthly}
                      </span>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#000000'
                      }}>
                        {plan.priceCurrency}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        color: '#666666',
                        marginLeft: '0.5rem'
                      }}>
                        per month
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              background: loading ? '#ccc' : '#ff8c42',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '2rem',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#e67a2e';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#ff8c42';
            }}
          >
            {loading ? 'Processing...' : plan.price === 'Free' ? 'Get Started' : plan.price === 'Custom pricing' ? 'Contact Sales' : 'Subscribe Now'}
          </button>

          {/* Features */}
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '1.5rem'
            }}>
              What's included
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {plan.features.map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <CheckCircle size={20} color="#4caf50" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#666666',
                    lineHeight: '1.5'
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

