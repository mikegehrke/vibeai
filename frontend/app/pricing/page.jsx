'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Info, ArrowRight } from 'lucide-react';

// Globaler Cache für Tooltips (außerhalb der Komponente)
const tooltipCache = new Map();

// Tooltip Komponente mit Backend-Integration
function Tooltip({ text, children, position = 'right', featureName, planName }) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Initialisiere mit text prop, wenn keine featureName/planName vorhanden
  // Wenn featureName/planName vorhanden, starte mit null (wird beim Hover geladen)
  const [tooltipText, setTooltipText] = useState(
    (!featureName || !planName) ? (text || 'Additional information available') : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  // Lade Tooltip vom Backend beim Hover
  const loadTooltipFromBackend = async () => {
    // Wenn keine featureName/planName vorhanden, verwende nur den text prop
    if (!featureName || !planName) {
      if (text) {
        setTooltipText(text);
      }
      return;
    }

    // Prüfe Cache ZUERST - wenn vorhanden, sofort anzeigen
    const cacheKey = `${featureName}|${planName}`;
    if (tooltipCache.has(cacheKey)) {
      const cachedText = tooltipCache.get(cacheKey);
      setTooltipText(cachedText);
      setIsLoading(false);
      return;
    }

    // Wenn bereits am Laden, nicht erneut laden
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    setTooltipText(null); // Setze auf null, um Loading-Status zu zeigen

    try {
      // Verwende relative URL, da Next.js Proxy auf Port 8000 zeigt
      const url = `/api/pricing/tooltip?plan=${encodeURIComponent(planName)}&feature=${encodeURIComponent(featureName)}`;
      console.log('🔍 [Tooltip] Loading from:', url);
      const response = await fetch(url);
      console.log('📡 [Tooltip] Response status:', response.status, response.statusText);
      
      // WICHTIG: response.text() verwenden, damit wir auch bei 500-Fehlern die Antwort lesen können
      // Der Backend gibt auch bei Fehlern JSON zurück
      const responseText = await response.text();
      console.log('📄 [Tooltip] Response text (first 200 chars):', responseText.substring(0, 200));
      
      // Prüfe, ob die Antwort mit "Internal" oder anderen HTML-Fehlermeldungen beginnt
      if (responseText.trim().startsWith('Internal') || 
          responseText.trim().startsWith('<') || 
          responseText.trim().startsWith('<!DOCTYPE')) {
        console.error('❌ [Tooltip] Backend returned HTML error instead of JSON:', responseText.substring(0, 100));
        // Backend hat HTML-Fehlermeldung zurückgegeben - verwende Fallback
        if (text) {
          setTooltipText(text);
        } else {
          setTooltipText('Additional information available');
        }
        return;
      }
      
      let data = null;
      try {
        data = JSON.parse(responseText);
        console.log('✅ [Tooltip] Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ [Tooltip] Failed to parse response as JSON:', parseError, 'Response:', responseText.substring(0, 100));
        // Wenn Parsing fehlschlägt, verwende Fallback
        if (text) {
          setTooltipText(text);
        } else {
          setTooltipText('Additional information available');
        }
        return;
      }
      
      // Wenn wir JSON haben, prüfe ob es ein tooltip-Feld gibt
      if (data && data.tooltip) {
        console.log('✅ [Tooltip] Setting tooltip text:', data.tooltip.substring(0, 50) + '...');
        setTooltipText(data.tooltip);
        tooltipCache.set(cacheKey, data.tooltip);
      } else {
        console.warn('⚠️ [Tooltip] No tooltip in response:', data);
        if (text) {
          setTooltipText(text);
        } else {
          setTooltipText('Additional information available');
        }
      }
      
      // Wenn response nicht OK war, logge es, aber verwende trotzdem die Daten falls vorhanden
      if (!response.ok) {
        console.warn('⚠️ [Tooltip] Response status was', response.status, 'but got valid data');
      }
    } catch (error) {
      console.error('❌ Error loading tooltip:', error);
      // Fallback: text bleibt wie übergeben
      if (text) {
        setTooltipText(text);
      } else {
        setTooltipText('Additional information available');
      }
    } finally {
      console.log('🏁 Loading finished, setting isLoading to false');
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const handleMouseEnter = () => {
    console.log('🖱️ [Tooltip] Mouse enter - featureName:', featureName, 'planName:', planName);
    setShowTooltip(true);
    // Lade Tooltip sofort beim Hover - rufe die Funktion direkt auf
    if (featureName && planName) {
      const cacheKey = `${featureName}|${planName}`;
      console.log('🔑 [Tooltip] Cache key:', cacheKey);
      if (tooltipCache.has(cacheKey)) {
        // Cache hit - sofort anzeigen
        const cached = tooltipCache.get(cacheKey);
        console.log('💾 [Tooltip] Cache hit:', cached.substring(0, 50) + '...');
        setTooltipText(cached);
        setIsLoading(false);
      } else if (!loadingRef.current) {
        // Cache miss - lade vom Backend
        console.log('📥 [Tooltip] Cache miss, loading from backend...');
        loadTooltipFromBackend();
      } else {
        console.log('⏳ [Tooltip] Already loading, skipping...');
      }
    } else if (text) {
      // Keine Backend-Daten - verwende text prop
      console.log('📝 [Tooltip] Using text prop');
      setTooltipText(text);
    } else {
      console.log('⚠️ [Tooltip] No featureName/planName and no text');
    }
  };

  const getTooltipStyle = () => {
    if (position === 'left') {
      return {
        position: 'absolute',
        top: '50%',
        right: '100%',
        transform: 'translateY(-50%)',
        marginRight: '8px',
        padding: '8px 12px',
        background: '#f5f5f5',
        color: '#333333',
        borderRadius: '6px',
        fontSize: '0.85rem',
        lineHeight: '1.4',
        whiteSpace: 'normal',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '250px',
        minWidth: '150px'
      };
    } else {
      return {
        position: 'absolute',
        top: '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
        padding: '8px 12px',
        background: '#f5f5f5',
        color: '#333333',
        borderRadius: '6px',
        fontSize: '0.85rem',
        lineHeight: '1.4',
        whiteSpace: 'normal',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        maxWidth: '250px',
        minWidth: '150px'
      };
    }
  };

  const getArrowStyle = () => {
    if (position === 'left') {
      return {
        position: 'absolute',
        top: '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid #f5f5f5'
      };
    } else {
      return {
        position: 'absolute',
        top: '50%',
        right: '100%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: '6px solid #f5f5f5'
      };
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
      >
        {children}
      </div>
      {showTooltip && (
        <div style={getTooltipStyle()}>
          {(isLoading && tooltipText === null) ? 'Loading pricing information...' : (tooltipText || text || 'Additional information available')}
          <div style={getArrowStyle()} />
        </div>
      )}
    </div>
  );
}

// Animiertes Logo-Icon Komponente
function AnimatedLogoIcon() {
  return (
    <div style={{ display: 'inline-block' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8 L12 4 L20 8" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12 L12 8 L20 12" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 16 L12 12 L20 16" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [tooltipCache, setTooltipCache] = useState({});

  // Helper function to get plan name by index for table cells
  const getPlanNameByIndex = (index) => {
    const planNames = ['Starter', 'Vibe AI Core', 'Vibe AI Pro+', 'Vibe AI Ultra', 'Vibe AI Ultra+', 'Teams', 'On Demand', 'Enterprise'];
    return planNames[index] || 'default';
  };

  // Helper function to check if a column is Vibe AI Core (index 1)
  const isVibeAICoreColumn = (columnIndex) => {
    return columnIndex === 1; // Vibe AI Core is at index 1 (second column after Starter)
  };

  // Helper function to get cell style with orange background for Vibe AI Core column
  const getTableCellStyle = (columnIndex, additionalStyles = {}) => {
    const baseStyle = {
      padding: '1rem',
      textAlign: 'center',
      ...additionalStyles
    };
    if (isVibeAICoreColumn(columnIndex)) {
      return {
        ...baseStyle,
        background: '#fff5f0'
      };
    }
    return baseStyle;
  };

  // Helper function to create Tooltip with Backend integration
  const createTooltip = (featureName, planName, position = 'right') => {
    const plan = getPlanNameByIndex(typeof planName === 'number' ? planName : planName);
    return (
      <Tooltip 
        text={getTooltipText(featureName, plan)} 
        featureName={featureName} 
        planName={plan}
        position={position}
      >
        <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
      </Tooltip>
    );
  };

  // Fallback Tooltip-Text (nur wenn Backend nicht verfügbar)
  // Die echten Tooltips werden vom Backend geladen
  const getTooltipText = (featureName, planName, value) => {
    // Generischer Fallback-Text - echte Texte kommen vom Backend
    return 'Loading pricing information...';
  };

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Explore the possibilities of making apps on Vibe AI go.',
      buttonText: 'Sign up',
      buttonStyle: 'light',
      isCurrent: false,
      features: [
        { text: 'Vibe AI Agent trial included', hasInfo: true, tooltipText: 'Limited access to the Vibe AI Agent for testing purposes' },
        { text: '10 development apps (with temporary links)' },
        { text: 'Public apps only' },
        { text: 'Limited build time, without long full autonomy' }
      ]
    },
    {
      name: 'Vibe AI Core',
      priceMonthly: '24,99',
      priceYearly: '239,88', // 24,99 * 12 * 0.8 (20% Rabatt)
      priceYearlyMonthly: '19,99', // Monatlich bei jährlicher Zahlung
      priceCurrency: '€',
      pricePeriod: 'pro Monat',
      description: 'Make, launch, and scale your apps.',
      buttonText: 'Join Vibe AI Core',
      buttonStyle: 'primary',
      features: [
        { text: 'Full Vibe AI Agent access', hasInfo: true, tooltipText: 'Checkpoints represent file changes the Agent makes while working toward your requests.' },
        { text: '€25 of monthly credits' },
        { text: 'Private and public apps' },
        { text: 'Access to latest models' },
        { text: 'Publish and host live apps' },
        { text: 'Pay-as-you-go for additional usage' },
        { text: 'Autonomous long builds' }
      ]
    },
    {
      name: 'Vibe AI Pro+',
      priceMonthly: '39,99',
      priceYearly: '383,90', // 39,99 * 12 * 0.8 (20% Rabatt)
      priceYearlyMonthly: '31,99', // Monatlich bei jährlicher Zahlung
      priceCurrency: '€',
      pricePeriod: 'pro Monat',
      description: 'Advanced features for professional developers.',
      buttonText: 'Join Vibe AI Pro+',
      buttonStyle: 'primary',
      features: [
        { text: 'Everything in Vibe AI Core', isInherited: true },
        { text: 'Advanced Editor with AI assistance' },
        { text: 'Enhanced Chat & Prompt Generator' },
        { text: 'Unlimited GitHub commits' },
        { text: 'Priority AI model access' },
        { text: 'Advanced ZIP export options' },
        { text: 'Project templates library' },
        { text: 'Extended build time' },
        { text: 'Priority support' }
      ]
    },
    {
      name: 'Vibe AI Ultra',
      priceMonthly: '54,99',
      priceYearly: '527,90', // 54,99 * 12 * 0.8 (20% Rabatt)
      priceYearlyMonthly: '43,99', // Monatlich bei jährlicher Zahlung
      priceCurrency: '€',
      pricePeriod: 'pro Monat',
      description: 'Maximum power for serious development.',
      buttonText: 'Join Vibe AI Ultra',
      buttonStyle: 'primary',
      features: [
        { text: 'Everything in Vibe AI Pro+', isInherited: true },
        { text: 'Premium Editor with live collaboration' },
        { text: 'Advanced Chat & Prompt features' },
        { text: 'Unlimited projects & apps' },
        { text: 'Premium AI models access' },
        { text: 'Advanced GitHub workflows' },
        { text: 'Custom project templates' },
        { text: 'Extended autonomous builds' },
        { text: '24/7 priority support' }
      ]
    },
    {
      name: 'Vibe AI Ultra+',
      priceMonthly: '79,99',
      priceYearly: '767,90', // 79,99 * 12 * 0.8 (20% Rabatt)
      priceYearlyMonthly: '63,99', // Monatlich bei jährlicher Zahlung
      priceCurrency: '€',
      pricePeriod: 'pro Monat',
      description: 'Complete development suite with app store publishing.',
      buttonText: 'Join Vibe AI Ultra+',
      buttonStyle: 'primary',
      features: [
        { text: 'Everything in Vibe AI Ultra', isInherited: true },
        { text: 'Unlimited APK generation' },
        { text: 'App Store preparation & setup' },
        { text: 'Automatic app store publishing' },
        { text: 'Advanced project management' },
        { text: 'Custom domain integration' },
        { text: 'White-label options' },
        { text: 'Advanced analytics' },
        { text: 'Dedicated account manager' }
      ]
    },
    {
      name: 'Teams',
      priceMonthly: '99,99',
      priceYearly: '959,90', // 99,99 * 12 * 0.8 (20% Rabatt)
      priceYearlyMonthly: '79,99', // Monatlich bei jährlicher Zahlung
      priceCurrency: '€',
      pricePeriod: 'pro Nutzer pro Monat',
      description: 'Bring the power of Vibe AI go to your entire team.',
      buttonText: 'Join Vibe AI Teams',
      buttonStyle: 'light',
      features: [
        { text: '← Everything included with Vibe AI Ultra+', isInherited: true },
        { text: '€40/mo in usage credits included' },
        { text: 'Credits granted upfront on annual plan' },
        { text: '50 Viewer seats' },
        { text: 'Centralized billing' },
        { text: 'Role-based access control' },
        { text: 'Private deployments' },
        { text: 'Pay-as-you-go for additional usage' }
      ]
    },
    {
      name: 'On Demand',
      price: 'Pay-as-you-go',
      description: 'Pay only for what you use.',
      buttonText: 'Get Started',
      buttonStyle: 'light',
      features: [
        { text: 'Flexible pricing model' },
        { text: 'Pay per API call' },
        { text: 'Pay per build minute' },
        { text: 'Pay per storage GB' },
        { text: 'No monthly commitment' },
        { text: 'Scale as you grow' },
        { text: 'Usage-based billing' },
        { text: 'Real-time usage tracking' }
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom pricing',
      description: 'Meet your security and performance needs.',
      buttonText: 'Contact us',
      buttonStyle: 'light',
      features: [
        { text: '← Everything in Teams', isInherited: true },
        { text: 'Custom Viewer Seats' },
        { text: 'SSO/SAML' },
        { text: 'SCIM' },
        { text: 'Advanced privacy controls' },
        { text: 'Custom pricing' },
        { text: 'Dedicated support' }
      ]
    }
  ];

  const handlePlanClick = (plan) => {
    // Zu Setup-Seiten für bezahlte Pläne, zu Pricing-Detail für Starter/Enterprise/Teams
    if (plan.name === 'Starter' || plan.name === 'Enterprise' || plan.name === 'Teams') {
      const planSlugMap = {
        'Starter': 'starter',
        'Enterprise': 'enterprise',
        'Teams': 'teams'
      };
      const planSlug = planSlugMap[plan.name] || plan.name.toLowerCase().replace(/\s+/g, '-');
      router.push(`/pricing/${planSlug}`);
    } else {
      // Zu Setup-Seiten
      const setupPathMap = {
        'Vibe AI Core': '/core/setup',
        'Vibe AI Pro+': '/pro-plus/setup',
        'Vibe AI Ultra': '/ultra/setup',
        'Vibe AI Ultra+': '/ultra-plus/setup',
        'On Demand': '/on-demand/setup'
      };
      const setupPath = setupPathMap[plan.name] || '/core/setup';
      router.push(setupPath);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header - Fixed, kein Unterstrich */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <AnimatedLogoIcon />
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#000000',
              letterSpacing: '-0.01em'
            }}>
              Vibe AI go
            </div>
          </Link>
          
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/products" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem' }}>
              Products
            </Link>
            <Link href="/modules" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem' }}>
              Modules
            </Link>
            <Link href="/framework" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem' }}>
              Framework
            </Link>
            <Link href="/pricing" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
              Pricing
            </Link>
            <Link href="/resources" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem' }}>
              Resources
            </Link>
            <Link href="/careers" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem' }}>
              Careers
            </Link>
          </nav>
        </div>

        <button 
          onClick={() => {
            const token = localStorage.getItem('token');
            if (token) {
              router.push('/home');
            } else {
              router.push('/login?redirect=/home');
            }
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#000000',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Go to account <ArrowRight size={16} />
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '4rem 2rem',
        paddingTop: 'calc(4rem + 80px)',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: '#000000',
          textAlign: 'center',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Pricing
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#666666',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Autonomy for all. Choose the best plan for you.
        </p>

        {/* Monthly/Yearly Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '3rem'
        }}>
          <span style={{
            fontSize: '0.95rem',
            color: !isYearly ? '#000000' : '#666666',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span 
              style={{
                fontSize: '0.95rem',
                color: isYearly ? '#000000' : '#666666',
                fontWeight: isYearly ? '600' : '400',
                cursor: 'pointer'
              }}
              onClick={() => setIsYearly(true)}
            >
              Yearly
            </span>
            <span style={{
              fontSize: '0.75rem',
              background: '#ff8c42',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              🔥 20% sparen
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid - 8 Pläne in 2 Zeilen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          rowGap: '2rem',
          marginBottom: '6rem'
        }}>
          {plans.map((plan, index) => {
            const isHighlighted = plan.name === 'Vibe AI Core';
            return (
            <div
              key={index}
              style={{
                background: isHighlighted ? '#fff5f0' : 'white',
                border: isHighlighted ? '2px solid #ff8c42' : '1px solid #e5e5e5',
                borderRadius: '12px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isHighlighted) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isHighlighted) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              onClick={() => handlePlanClick(plan)}
            >
              {/* Plan Name */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#000000',
                marginBottom: '0.5rem'
              }}>
                {plan.name}
              </h3>

              {/* Price */}
              <div style={{ marginBottom: '0.5rem' }}>
                {plan.price === 'Free' ? (
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#000000'
                  }}>
                    {plan.price}
                  </span>
                ) : plan.price === 'Custom pricing' ? (
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#000000'
                  }}>
                    {plan.price}
                  </span>
                ) : (
                  <>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#000000'
                      }}>
                        {isYearly ? plan.priceYearly : plan.priceMonthly}
                      </span>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#000000'
                      }}>
                        {plan.priceCurrency}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666666',
                      marginTop: '0.25rem'
                    }}>
                      {isYearly ? (plan.name === 'Teams' ? 'pro Jahr (pro Nutzer)' : 'pro Jahr') : plan.pricePeriod}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.9rem',
                color: '#666666',
                marginBottom: '1.5rem',
                lineHeight: '1.5'
              }}>
                {plan.description}
              </p>

              {/* Button */}
              {plan.name === 'Starter' || plan.name === 'Enterprise' || plan.name === 'On Demand' ? (
                <button
                  onClick={() => handlePlanClick(plan)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    background: plan.buttonStyle === 'primary' ? '#ff8c42' : '#f5f5f5',
                    color: plan.buttonStyle === 'primary' ? 'white' : '#000000',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (plan.buttonStyle === 'primary') {
                      e.currentTarget.style.background = '#e67a2e';
                    } else {
                      e.currentTarget.style.background = '#e0e0e0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.buttonStyle === 'primary') {
                      e.currentTarget.style.background = '#ff8c42';
                    } else {
                      e.currentTarget.style.background = '#f5f5f5';
                    }
                  }}
                >
                  {plan.isCurrent ? 'Current plan' : plan.buttonText}
                </button>
              ) : (
                <Link
                  href={`${plan.name === 'Vibe AI Core' ? '/core/setup' : plan.name === 'Vibe AI Pro+' ? '/pro-plus/setup' : plan.name === 'Vibe AI Ultra+' ? '/ultra-plus/setup' : plan.name === 'Vibe AI Ultra' ? '/ultra/setup' : plan.name === 'Teams' ? '/pricing/teams' : plan.name === 'On Demand' ? '/on-demand/setup' : plan.name === 'Starter' ? '/pricing/starter' : plan.name === 'Enterprise' ? '/pricing/enterprise' : `/pricing/${plan.name.toLowerCase().replace(/\s+/g, '-')}/checkout?yearly=${isYearly}`}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    background: plan.buttonStyle === 'primary' ? '#ff8c42' : '#f5f5f5',
                    color: plan.buttonStyle === 'primary' ? 'white' : '#000000',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (plan.buttonStyle === 'primary') {
                      e.currentTarget.style.background = '#e67a2e';
                    } else {
                      e.currentTarget.style.background = '#e0e0e0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.buttonStyle === 'primary') {
                      e.currentTarget.style.background = '#ff8c42';
                    } else {
                      e.currentTarget.style.background = '#f5f5f5';
                    }
                  }}
                >
                  {plan.isCurrent ? 'Current plan' : plan.buttonText}
                </Link>
              )}

              {/* Features */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {plan.features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      color: feature.isInherited ? '#666666' : '#000000',
                      fontStyle: feature.isInherited ? 'italic' : 'normal'
                    }}
                  >
                    {!feature.isInherited && (
                      <CheckCircle size={18} color="#4caf50" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    {feature.isInherited && (
                      <span style={{ marginRight: '0.25rem' }}>←</span>
                    )}
                    <span style={{ lineHeight: '1.5' }}>
                      {feature.text}
                    </span>
                    {feature.hasInfo && (
                      <Tooltip text={feature.tooltipText || 'Additional information available'}>
                        <Info size={14} color="#999999" style={{ flexShrink: 0, marginTop: '2px', marginLeft: '0.25rem' }} />
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
          })}
        </div>

        {/* Compare Plans Section */}
        <div style={{
          marginTop: '6rem',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#000000',
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            Compare plans
          </h2>

          {/* Compare Table - Full version with all features */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            overflowX: 'auto',
            overflowY: 'hidden'
          }}>
            <table style={{
              width: '100%',
              minWidth: '1200px',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: '#f5f5f5',
                  borderBottom: '2px solid #e5e5e5'
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#000000',
                    fontSize: '0.9rem',
                    width: '200px'
                  }}>
                    Feature
                  </th>
                  {plans.map((plan, idx) => {
                    const isHighlighted = plan.name === 'Vibe AI Core';
                    return (
                    <th
                      key={idx}
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#000000',
                        fontSize: '0.9rem',
                        background: isHighlighted ? '#fff5f0' : 'transparent',
                        minWidth: '120px'
                      }}
                    >
                      {plan.name}
                    </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Vibe AI Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Vibe AI
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Agent
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Limited
                  </td>
                  <td style={getTableCellStyle(1)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={getTableCellStyle(2)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(2))} featureName="Agent" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={getTableCellStyle(3)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(3))} featureName="Agent" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={getTableCellStyle(4)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(4))} featureName="Agent" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={getTableCellStyle(5)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(5))} featureName="Agent" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={getTableCellStyle(6, { color: '#666666' })}>
                    —
                  </td>
                  <td style={getTableCellStyle(7)}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(7))} featureName="Agent" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Autonomy
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Basic
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Code Completion
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Code Generation
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Basic
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(1))} featureName="Code Generation" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(2))} featureName="Code Generation" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(3))} featureName="Code Generation" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(4))} featureName="Code Generation" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(5))} featureName="Code Generation" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(6))} featureName="Code Generation" planName={getPlanNameByIndex(6)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Code Generation', getPlanNameByIndex(7))} featureName="Code Generation" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Debugger
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Basic
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(1))} featureName="Debugger" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(2))} featureName="Debugger" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(3))} featureName="Debugger" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(4))} featureName="Debugger" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(5))} featureName="Debugger" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(6))} featureName="Debugger" planName={getPlanNameByIndex(6)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Advanced
                    <Tooltip text={getTooltipText('Debugger', getPlanNameByIndex(7))} featureName="Debugger" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>

                {/* Development Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Development
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    vCPUs
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>1</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>4</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>8</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>8</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>8</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>8</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Up to 64</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Memory (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>2</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>8</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>16</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>16</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>16</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>16</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Up to 128</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Outbound data transfer (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    100
                    <Tooltip text={getTooltipText('Outbound data transfer (GiB)', getPlanNameByIndex(1))} featureName="Outbound data transfer (GiB)" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Outbound data transfer (GiB)', getPlanNameByIndex(2))} featureName="Outbound data transfer (GiB)" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Outbound data transfer (GiB)', getPlanNameByIndex(3))} featureName="Outbound data transfer (GiB)" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Outbound data transfer (GiB)', getPlanNameByIndex(4))} featureName="Outbound data transfer (GiB)" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Outbound data transfer (GiB)', getPlanNameByIndex(5))} featureName="Outbound data transfer (GiB)" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Custom
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    SSH access
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Public Apps
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>10</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Private Apps
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Collaborators
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>1</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>3</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    All team members
                    <Tooltip text={getTooltipText('Collaborators', getPlanNameByIndex(2))} featureName="Collaborators" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    All team members
                    <Tooltip text={getTooltipText('Collaborators', getPlanNameByIndex(3))} featureName="Collaborators" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    All team members
                    <Tooltip text={getTooltipText('Collaborators', getPlanNameByIndex(4))} featureName="Collaborators" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    All team members
                    <Tooltip text={getTooltipText('Collaborators', getPlanNameByIndex(5))} featureName="Collaborators" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    All team members
                    <Tooltip text={getTooltipText('Collaborators', getPlanNameByIndex(6))} featureName="Collaborators" planName={getPlanNameByIndex(6)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Development Time (minutes)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>1200</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Unlimited
                    <Tooltip text={getTooltipText('Development Time (minutes)', getPlanNameByIndex(1))} featureName="Development Time (minutes)" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Unlimited
                    <Tooltip text={getTooltipText('Development Time (minutes)', getPlanNameByIndex(2))} featureName="Development Time (minutes)" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Unlimited
                    <Tooltip text={getTooltipText('Development Time (minutes)', getPlanNameByIndex(3))} featureName="Development Time (minutes)" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Unlimited
                    <Tooltip text={getTooltipText('Development Time (minutes)', getPlanNameByIndex(4))} featureName="Development Time (minutes)" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Unlimited
                    <Tooltip text={getTooltipText('Development Time (minutes)', getPlanNameByIndex(5))} featureName="Development Time (minutes)" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Unlimited</td>
                </tr>

                {/* Storage Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Storage
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Storage per app (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>2</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>50</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>256</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>256</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>256</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>256</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>Custom</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Vibe AI Database
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    PostgreSQL storage (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(0))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(1))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(2))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(3))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(4))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL storage (GiB)', getPlanNameByIndex(5))} featureName="PostgreSQL storage (GiB)" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Custom
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    PostgreSQL compute (hours)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(0))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(1))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(2))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(3))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(4))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('PostgreSQL compute (hours)', getPlanNameByIndex(5))} featureName="PostgreSQL compute (hours)" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Custom
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    App Storage
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(0))} featureName="App Storage" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(1))} featureName="App Storage" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(2))} featureName="App Storage" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(3))} featureName="App Storage" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(4))} featureName="App Storage" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(5))} featureName="App Storage" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage', getPlanNameByIndex(7))} featureName="App Storage" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    App Storage data transfer (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(0))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(1))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(2))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(3))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(4))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(5))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage data transfer (GiB)', getPlanNameByIndex(7))} featureName="App Storage data transfer (GiB)" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    App Storage basic operations
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(0))} featureName="App Storage basic operations" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(1))} featureName="App Storage basic operations" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(2))} featureName="App Storage basic operations" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(3))} featureName="App Storage basic operations" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(4))} featureName="App Storage basic operations" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(5))} featureName="App Storage basic operations" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage basic operations', getPlanNameByIndex(7))} featureName="App Storage basic operations" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    App Storage advanced operations
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(0))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(0)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(1))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(2))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(2)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(3))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(3)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(4))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(4)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(5))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(5)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('App Storage advanced operations', getPlanNameByIndex(7))} featureName="App Storage advanced operations" planName={getPlanNameByIndex(7)} position="left">
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>

                {/* Deployments Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Deployments
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Outbound data transfer (GiB)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    10
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    100
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    1,000
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>
                    Custom
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Reserved VM deployments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Autoscale deployments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Autoscale compute units
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Autoscale requests
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Scheduled deployments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Scheduled compute units
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    —
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                    <Tooltip text={getTooltipText('Agent', getPlanNameByIndex(1))} featureName="Agent" planName={getPlanNameByIndex(1)}>
                      <Info size={14} color="#999999" style={{ marginLeft: '0.25rem', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Static deployments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666' }}>1</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Private deployments
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>

                {/* Security & Compliance Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Security & Compliance
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Role-based access control
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    SSO
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Single-tenant with VPC
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#666666', fontStyle: 'italic' }}>
                    Coming soon
                  </td>
                </tr>
                <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Custom invoicing
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>

                {/* Member Support Section */}
                <tr style={{ borderBottom: '2px solid #e5e5e5', background: '#fafafa' }}>
                  <td colSpan={8} style={{ padding: '1rem', fontWeight: '700', color: '#000000', fontSize: '1rem' }}>
                    Member Support
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Member Support
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Member-only events
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Early access to new features
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Member community
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', paddingLeft: '2rem', color: '#000000' }}>
                    Onboarding support
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <CheckCircle size={18} color="#4caf50" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Get Started Section */}
        <div style={{
          marginTop: '6rem',
          marginBottom: '4rem',
          padding: '4rem 2rem',
          background: '#f5f5f5',
          marginLeft: '-2rem',
          marginRight: '-2rem'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            background: '#f5f5f5',
            borderRadius: '24px',
            padding: '4rem',
            display: 'flex',
            gap: '4rem',
            alignItems: 'center'
          }}>
            {/* Left Side */}
            <div style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#000000',
                margin: 0,
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                Get started with Vibe AI Teams
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#666666',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Get enhanced security and compute for professional developers and teams shipping to production.
              </p>
              <Link href="/teams/setup" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#ff8c42',
                  color: 'white',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  width: 'fit-content',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Get started
                </button>
              </Link>
            </div>

            {/* Right Side - Quote */}
            <div style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <blockquote style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#333333',
                margin: 0,
                lineHeight: '1.4',
                fontStyle: 'normal',
                padding: 0,
                border: 'none'
              }}>
                "The rapid prototypes we build on Vibe AI shift the dialog from 'Should we?' to 'How should we?' and that's a world of difference when driving substantive change."
              </blockquote>
              <cite style={{
                fontSize: '1rem',
                color: '#666666',
                fontStyle: 'normal',
                fontWeight: '400'
              }}>
                Chris Stevens, CMO of Spot Hero
              </cite>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'white',
        padding: '3rem 2rem 1rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '3rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              HANDY LINKS
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {['About us', 'Help', 'How to guides', 'Import from GitHub', 'Status', 'Additional resources', 'Brand kit', 'Partnerships'].map((link, idx) => (
                <Link key={idx} href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} style={{
                  color: '#666666',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              LEGAL
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {['Terms of service', 'Commercial agreement', 'Privacy', 'Subprocessors', 'DPA', 'Report abuse'].map((link, idx) => (
                <Link key={idx} href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} style={{
                  color: '#666666',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              CONNECT
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {['X / Twitter', 'TikTok', 'Facebook', 'Instagram', 'LinkedIn'].map((link, idx) => (
                <Link key={idx} href="#" style={{
                  color: '#666666',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
          fontSize: '0.85rem',
          color: '#999999'
        }}>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ 
              color: '#999999', 
              textDecoration: 'none',
              background: '#f5f5f5',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginRight: '4rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e5e5e5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
          >
            Scroll to top
          </button>
          <span>
            ALL RIGHTS RESERVED. COPYRIGHT © 2025 VIBE AI GO
          </span>
        </div>
      </footer>
    </div>
  );
}

