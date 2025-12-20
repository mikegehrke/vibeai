'use client';

import { useEffect } from 'react';

// Animiertes Logo-Icon Komponente - Striche bewegen sich rechts/links, orange/schwarz leuchten
export default function AnimatedLogoIcon({ size = 20 }) {
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
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
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






