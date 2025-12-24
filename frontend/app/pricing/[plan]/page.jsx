'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';

// Animated Logo Icon Component
const AnimatedLogoIcon = ({ size = 24 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Sparkles 
        size={size} 
        style={{
          color: '#60a5fa',
          animation: 'logoGlow 2s ease-in-out infinite'
        }}
      />
      <style jsx global>{`
        @keyframes logoGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.6)); }
          50% { filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.9)); }
        }
      `}</style>
    </div>
  );
};

// Plan data
const planData = {
  'starter': {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started with VibeAI',
    features: [
      'Limited Vibe AI Agent access',
      '10 public apps',
      'Basic AI features',
      'Community support'
    ]
  },
  'core': {
    name: 'Vibe AI Core',
    price: '$20',
    description: 'For developers who need more power',
    features: [
      'Full Vibe AI Agent access',
      'Unlimited public apps',
      'Advanced AI features',
      'Priority support',
      '10GB storage'
    ]
  },
  'vibe-ai-core': {
    name: 'Vibe AI Core',
    price: '$20',
    description: 'For developers who need more power',
    features: [
      'Full Vibe AI Agent access',
      'Unlimited public apps',
      'Advanced AI features',
      'Priority support',
      '10GB storage'
    ]
  },
  'pro-plus': {
    name: 'Vibe AI Pro+',
    price: '$40',
    description: 'For professional developers',
    features: [
      'Everything in Core',
      'Private apps',
      'Team collaboration',
      'Custom domains',
      '50GB storage',
      'API access'
    ]
  },
  'vibe-ai-pro-plus': {
    name: 'Vibe AI Pro+',
    price: '$40',
    description: 'For professional developers',
    features: [
      'Everything in Core',
      'Private apps',
      'Team collaboration',
      'Custom domains',
      '50GB storage',
      'API access'
    ]
  },
  'ultra': {
    name: 'Vibe AI Ultra',
    price: '$80',
    description: 'For power users',
    features: [
      'Everything in Pro+',
      'Unlimited storage',
      'Priority API access',
      'Advanced analytics',
      'Custom integrations'
    ]
  },
  'vibe-ai-ultra': {
    name: 'Vibe AI Ultra',
    price: '$80',
    description: 'For power users',
    features: [
      'Everything in Pro+',
      'Unlimited storage',
      'Priority API access',
      'Advanced analytics',
      'Custom integrations'
    ]
  },
  'ultra-plus': {
    name: 'Vibe AI Ultra+',
    price: '$150',
    description: 'For enterprise-grade projects',
    features: [
      'Everything in Ultra',
      'Dedicated support',
      'SLA guarantee',
      'Custom training',
      'White-label options'
    ]
  },
  'vibe-ai-ultra-plus': {
    name: 'Vibe AI Ultra+',
    price: '$150',
    description: 'For enterprise-grade projects',
    features: [
      'Everything in Ultra',
      'Dedicated support',
      'SLA guarantee',
      'Custom training',
      'White-label options'
    ]
  },
  'teams': {
    name: 'Teams',
    price: '$25',
    priceNote: 'per user/month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro+',
      'Team management',
      'Shared workspaces',
      'Admin controls',
      'Usage analytics',
      'SSO support'
    ]
  },
  'enterprise': {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Teams',
      'Unlimited users',
      'Custom contracts',
      'Dedicated account manager',
      'On-premise options',
      'Custom SLA'
    ]
  },
  'on-demand': {
    name: 'On Demand',
    price: 'Pay as you go',
    description: 'Pay only for what you use',
    features: [
      'No monthly commitment',
      'Usage-based billing',
      'All features available',
      'Flexible scaling'
    ]
  }
};

export default function PricingPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planKey = params.plan;
  const plan = planData[planKey] || planData['starter'];
  
  const [theme, setTheme] = useState('dark');
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const colors = theme === 'dark' ? {
    bg: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#333333',
    accent: '#60a5fa'
  } : {
    bg: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#e5e5e5',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#3b82f6'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: `1px solid ${colors.border}`,
        background: colors.bgSecondary
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/app-builder" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
            color: colors.textSecondary,
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            <ArrowLeft size={18} />
            Back to Pricing
          </Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none'
          }}>
            <AnimatedLogoIcon size={24} />
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: colors.text }}>VibeAI</span>
          </Link>

          <button
            onClick={toggleTheme}
                style={{
                background: 'transparent',
              border: 'none',
                cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'dark' ? (
              <Sun size={20} color={colors.textSecondary} />
            ) : (
              <Moon size={20} color={colors.textSecondary} />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '800px',
          margin: '0 auto',
        padding: '3rem 2rem'
        }}>
        {/* Plan Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            {plan.name}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: colors.textSecondary,
            marginBottom: '1.5rem'
          }}>
            {plan.description}
          </p>

          {/* Price */}
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: colors.accent
            }}>
              {plan.price}
            </span>
            {plan.priceNote && (
              <span style={{
                fontSize: '1rem',
                color: colors.textSecondary,
                marginLeft: '0.5rem'
              }}>
                {plan.priceNote}
              </span>
            )}
            {plan.price !== 'Free' && plan.price !== 'Custom' && plan.price !== 'Pay as you go' && (
              <span style={{
                fontSize: '1rem',
                color: colors.textSecondary,
                marginLeft: '0.5rem'
              }}>
                /month
              </span>
            )}
          </div>

          {/* Billing Toggle */}
          {plan.price !== 'Free' && plan.price !== 'Custom' && plan.price !== 'Pay as you go' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '2rem'
              }}>
              <span style={{ color: !isYearly ? colors.text : colors.textSecondary }}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                style={{
                  width: '48px',
                  height: '24px',
                  borderRadius: '12px',
                  background: isYearly ? colors.accent : colors.bgTertiary,
                border: 'none',
                cursor: 'pointer',
                  position: 'relative',
                transition: 'background 0.2s'
              }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: isYearly ? '26px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
              <span style={{ color: isYearly ? colors.text : colors.textSecondary }}>
                Yearly
                <span style={{
                  background: '#22c55e',
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  marginLeft: '0.5rem'
              }}>
                  Save 20%
                </span>
                </span>
            </div>
          )}

          {/* CTA Button */}
          <Link href={`/register?plan=${planKey}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: colors.accent,
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'opacity 0.2s'
              }}>
            <Sparkles size={18} />
            {plan.price === 'Free' ? 'Get Started Free' : plan.price === 'Custom' ? 'Contact Sales' : 'Subscribe Now'}
              </Link>
        </div>

        {/* Features */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '12px',
          padding: '2rem',
          border: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            What's included
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {plan.features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: colors.accent,
                display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={12} color="white" />
                </div>
                <span style={{ color: colors.text }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <Link href="/app-builder" style={{
            color: colors.textSecondary,
            textDecoration: 'none',
            fontSize: '0.9rem'
          }}>
            ← View all plans
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: `1px solid ${colors.border}`,
        color: colors.textSecondary,
        fontSize: '0.85rem'
      }}>
        <p>© 2025 VibeAI, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
