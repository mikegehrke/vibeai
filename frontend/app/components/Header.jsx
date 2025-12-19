'use client';

import Link from 'next/link';
import { useEffect } from 'react';

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
    
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  
  return (
    <div 
      className="logo-icon-container"
      style={{ 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect 
          x="2" y="5" width="16" height="2" rx="1" 
          className="logo-line-1"
        />
        <rect 
          x="2" y="9" width="16" height="2" rx="1" 
          className="logo-line-2"
        />
        <rect 
          x="2" y="13" width="16" height="2" rx="1" 
          className="logo-line-3"
        />
      </svg>
    </div>
  );
}

export default function Header({ showProducts = true, showStartBuilding = true, currentPage = null }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'white',
      color: '#000000',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%'
      // Fixed damit immer sichtbar, unabhängig vom Scrollen, kein Unterstrich
    }}>
      {/* Left Side - Logo + Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <AnimatedLogoIcon />
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.01em',
            color: '#000000'
          }}>
            Vibe AI go
          </div>
        </Link>
        
        {/* Navigation */}
        {showProducts && (
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginLeft: '3rem' }}>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Products</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Module</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Framework</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Resources</Link>
            <Link href="/pricing" style={{ 
              color: '#000000', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: currentPage === 'pricing' ? '600' : '400'
            }}>Pricing</Link>
            <Link href="#" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Careers</Link>
          </nav>
        )}
      </div>

      {/* Right Side - Log in & Start building */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/login" style={{ color: '#000000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '400' }}>Log in</Link>
        {showStartBuilding && (
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#ff8c42',
              color: 'white',
              padding: '0.625rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Start building
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}

