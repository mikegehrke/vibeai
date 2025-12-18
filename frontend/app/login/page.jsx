'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// Animiertes Logo-Icon Komponente
function AnimatedLogoIcon() {
  useEffect(() => {
    const styleId = 'animated-logo-icon-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes logoLineMoveLeft {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-3px); }
      }
      @keyframes logoLineMoveRight {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(3px); }
      }
      @keyframes logoGlow {
        0%, 100% { 
          filter: drop-shadow(0 0 6px rgba(255, 140, 66, 0.9));
        }
        50% { 
          filter: drop-shadow(0 0 10px rgba(255, 140, 66, 1)) drop-shadow(0 0 5px rgba(0, 0, 0, 0.6));
        }
      }
      @keyframes logoColorChange {
        0%, 100% { fill: #ff8c42; }
        50% { fill: #000000; }
      }
      .logo-line-1 { 
        animation: logoLineMoveLeft 1.5s ease-in-out infinite, logoColorChange 3s ease-in-out infinite; 
      }
      .logo-line-2 { 
        animation: logoLineMoveRight 1.5s ease-in-out infinite 0.2s, logoColorChange 3s ease-in-out infinite 0.1s; 
      }
      .logo-line-3 { 
        animation: logoLineMoveLeft 1.5s ease-in-out infinite 0.4s, logoColorChange 3s ease-in-out infinite 0.2s; 
      }
      .logo-icon-container {
        animation: logoGlow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="logo-icon-container" style={{ display: 'inline-block' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path className="logo-line-1" d="M4 8 L12 4 L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path className="logo-line-2" d="M4 12 L12 8 L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path className="logo-line-3" d="M4 16 L12 12 L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push(redirect);
    }
  }, [router, redirect]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login fehlgeschlagen');
      }

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        router.push(redirect);
      } else {
        throw new Error('Kein Token erhalten');
      }
    } catch (err) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError('');
    
    // Mock-Implementierung für Social Login
    try {
      // Simuliere API-Call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock-Token für Testing
      const mockToken = `mock_${provider}_token_${Date.now()}`;
      const mockUser = {
        id: 1,
        email: `user@${provider}.com`,
        username: `${provider}_user`,
        plan: 'free'
      };
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // In Production: Hier würde die echte OAuth-Integration sein
      console.log(`${provider} login - Mock implementation`);
      
      router.push(redirect);
    } catch (err) {
      setError(`${provider} login fehlgeschlagen`);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Side - Login Form */}
      <div style={{
        width: '50%',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        padding: '3rem',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '3rem'
        }}>
          <AnimatedLogoIcon />
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#000000',
            letterSpacing: '-0.01em'
          }}>
            Vibe AI go
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#000000',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Log in
        </h1>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => handleSocialLogin('x')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with X
          </button>

          <button
            onClick={() => handleSocialLogin('sso')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Use SSO login
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
          <span style={{ fontSize: '0.85rem', color: '#666666' }}>Or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#000000',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: loading ? '#ccc' : '#ff8c42',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              marginBottom: '1.5rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#e67a2e';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#ff8c42';
            }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* Terms */}
        <p style={{
          fontSize: '0.85rem',
          color: '#666666',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          By continuing, you agree to Vibe AI go's{' '}
          <Link href="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          .
        </p>

        {/* Links */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#666666'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            Don't have an account?{' '}
            <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} style={{
              color: '#1976d2',
              fontWeight: '600',
              textDecoration: 'none'
            }}>
              Sign up
            </Link>
          </div>
          <Link href="/help" style={{
            color: '#1976d2',
            textDecoration: 'none'
          }}>
            Get help
          </Link>
        </div>

        {/* reCAPTCHA */}
        <p style={{
          fontSize: '0.75rem',
          color: '#999999',
          textAlign: 'center',
          marginTop: '2rem',
          lineHeight: '1.5'
        }}>
          This site is protected by reCAPTCHA Enterprise and the{' '}
          <Link href="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Google Privacy Policy
          </Link>
          {' '}and{' '}
          <Link href="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>
            Terms of Service
          </Link>
          {' '}apply.
        </p>
      </div>

      {/* Right Side - Promotional */}
      <div style={{
        width: '50%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Image - Earth */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }} />
        
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          zIndex: 1
        }}>
          <AnimatedLogoIcon />
        </div>

        {/* Slogan */}
        <h2 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          margin: 0,
          zIndex: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          Idea to app, fast
        </h2>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
