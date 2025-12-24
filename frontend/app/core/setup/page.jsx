'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Home, Code, Globe, ChevronDown, 
  CheckCircle, ArrowRight, ExternalLink, FileCode,
  User, Bell, Users, Terminal, Palette, Sun, Moon, HelpCircle, LogOut, ChevronRight, Download,
  Cloud, Star, Smartphone, Sparkles, Rocket, Lock, DollarSign, ArrowUp, ArrowLeft, Eye, Zap, Shield
} from 'lucide-react';
import AnimatedLogoIcon from '../../components/AnimatedLogoIcon';

export default function CoreSetupPage() {
  const planKey = 'core';
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isYearly, setIsYearly] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Add CSS animations for progress bars and upgrade button
    const styleId = 'progress-bar-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes progressFill {
        0% { width: 0%; }
        50% { width: 30%; }
        100% { width: 0%; }
      }
      @keyframes progressGlow {
        0%, 100% { 
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
          opacity: 1;
        }
        50% { 
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.8);
          opacity: 0.9;
        }
      }
      @keyframes upgradeButtonColor {
        0%, 100% { 
          color: #ececec;
        }
        50% { 
          color: #60a5fa;
        }
      }
      @keyframes upgradeButtonGlow {
        0%, 100% { 
          text-shadow: 0 0 5px rgba(96, 165, 250, 0.3);
        }
        50% { 
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.6);
        }
      }
      /* Hide scrollbars but keep scrolling */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ececec',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left Sidebar - Same as Teams Setup */}
      <div style={{
        width: '280px',
        background: '#1f1f1f',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        position: 'fixed',
        height: '100vh',
        overflow: 'hidden',
        left: 0,
        top: 0
      }}>
        {/* Top Content - No Scroll */}
        <div style={{
          flexShrink: 0
        }}>
        {/* Top Bar - Logo Icon only, Search-Icon rechts */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0'
        }}>
          {/* Logo Icon only - Links */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={dropdownRef}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <AnimatedLogoIcon size={16} />
            </Link>
            <ChevronDown size={16} color="#ececec" style={{ cursor: 'pointer' }} onClick={() => setShowDropdown(!showDropdown)} />

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.5rem',
              background: '#2a2a2a',
              border: '1px solid #2f2f2f',
              borderRadius: '8px',
              minWidth: '240px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}>
                  MG
                </div>
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Account</span>
              </div>

              <Link href="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textDecoration: 'none',
                color: '#ececec'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Profile</span>
              </Link>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: '#333',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
              >
                <Bell size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Notifications</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Users size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Create Team</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Terminal size={18} color="#ececec" />
                <span style={{ fontSize: '0.9rem', color: '#ececec' }}>CLUI</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Palette size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Theme</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('dark');
                    }}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      background: theme === 'dark' ? '#333' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Moon size={16} color={theme === 'dark' ? '#ececec' : '#999'} />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme('light');
                    }}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      background: theme === 'light' ? '#333' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Sun size={16} color={theme === 'light' ? '#ececec' : '#999'} />
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HelpCircle size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Help</span>
                </div>
                <ChevronRight size={16} color="#999" />
              </div>

              <div style={{
                borderTop: '1px solid #2f2f2f',
                marginTop: '0.5rem',
                paddingTop: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} color="#ececec" />
                  <span style={{ fontSize: '0.9rem', color: '#ececec' }}>Log out</span>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Search Icon - Rechts */}
          <button style={{
            padding: '0.5rem',
            borderRadius: '6px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Search size={18} color="#ececec" />
          </button>
        </div>

        {/* Create App Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          color: '#ececec',
          border: '1px solid #4a4a4a',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '0',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-start',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Plus size={16} />
          Create App
        </button>

        {/* Import Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          color: '#ececec',
          border: '1px solid #4a4a4a',
          borderRadius: '6px',
          fontWeight: '500',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '0',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-start',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Download size={16} color="#ececec" />
          Import code or design
        </button>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '0', marginTop: '0.5rem' }}>
          <Link href="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Home size={18} color="#ececec" />
            Home
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Code size={18} color="#ececec" />
            Apps
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Globe size={18} color="#ececec" />
            Published apps
          </Link>
          <Link href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '0',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FileCode size={18} color="#ececec" />
            Developer Frameworks
          </Link>
        </nav>

        {/* Learn Section */}
        <div style={{ marginBottom: '0', paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: 'none' }}>
          <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learn
          </div>
          <Link href="#" style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            Learn
          </Link>
          <Link href="#" style={{
            display: 'block',
            padding: '0.5rem 0.75rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            Documentation
          </Link>
        </div>
        </div>

        {/* Starter Plan Section - Fixed at bottom */}
        <div style={{
          background: '#1f1f1f',
          borderRadius: '0',
          padding: '1rem',
          border: 'none',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Starter Plan
          </div>
          
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Approaching plan limit for Public Apps.
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Code size={14} color="#999" />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Free Apps: 7/10 created</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '70%',
                height: '100%',
                background: '#60a5fa',
                borderRadius: '3px'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AnimatedLogoIcon size={14} />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Agent credits: 70% used</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div 
                id="agent-progress-bar"
                style={{
                  width: '70%',
                  height: '100%',
                  background: '#60a5fa',
                  borderRadius: '3px',
                  animation: 'progressFill 3s ease-in-out infinite, progressGlow 2s ease-in-out infinite',
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cloud size={14} color="#999" />
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Cloud credits: 0% used</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a1a',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div 
                id="cloud-progress-bar"
                style={{
                  width: '0%',
                  height: '100%',
                  background: '#60a5fa',
                  borderRadius: '3px',
                  animation: 'progressFill 3s ease-in-out infinite 0.5s, progressGlow 2s ease-in-out infinite 0.5s',
                  boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)'
                }} 
              />
            </div>
          </div>

          <Link href="/pro-plus/setup" style={{
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            color: '#ececec',
            border: '1px solid #4a4a4a',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.75rem',
            cursor: 'pointer',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
            transition: 'background 0.2s',
            textDecoration: 'none',
            animation: 'upgradeButtonColor 2s ease-in-out infinite, upgradeButtonGlow 2s ease-in-out infinite'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Sparkles size={14} color="currentColor" style={{ animation: 'upgradeButtonColor 2s ease-in-out infinite' }} />
            Upgrade to Vibe AI Pro+
          </Link>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>
                Install Vibe AI on
              </span>
              <Smartphone size={16} color="#999" />
            </div>
          </div>
        </div>
      </div>

      {/* Central Content Area - Pricing Plans */}
      <div style={{
        flex: 1,
        padding: '0',
        overflowY: 'auto',
        overflowX: 'hidden',
        marginLeft: '280px',
        height: '100vh',
        background: '#1a1a1a'
      }}
      className="hide-scrollbar"
      >
        {/* Content will go here - Pricing Plans */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Back Button */}
          <Link href="/pricing" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            alignSelf: 'flex-start',
            marginBottom: '1.5rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            <ArrowLeft size={18} />
            Back to Pricing
          </Link>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#ececec',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Compare VibeAI plans
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: '#999',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Autonomy for all. Choose the best plan for you.
          </p>

          {/* Plan Selector Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setIsYearly(false)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: !isYearly ? '#ececec' : '#999',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: isYearly ? '#ececec' : '#999',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Yearly
            </button>
            {isYearly && (
              <span style={{
                fontSize: '0.75rem',
                color: '#3b82f6',
                fontWeight: '600'
              }}>
                Up to 20% off
              </span>
            )}
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
            marginBottom: '2rem',
            width: '100%',
            maxWidth: '900px'
          }}>
            {/* Starter Plan */}
            <div style={{
              background: '#2a2a2a',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #2f2f2f',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              height: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#ececec',
                marginBottom: '0.5rem'
              }}>
                Starter
              </h3>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#ececec',
                marginBottom: '0.5rem'
              }}>
                Free
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Limited Vibe AI Agent access</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>10 public apps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Basic AI features</span>
                </div>
              </div>
              <button style={{
                marginTop: 'auto',
                width: '100%',
                padding: '0.75rem',
                background: '#3a3a3a',
                color: '#ececec',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3a3a3a'}
              >
                Your current plan
              </button>
            </div>

            {/* Vibe AI Core Plan - Highlighted */}
            <div style={{
              background: '#1e3a5f',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '2px solid #3b82f6',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s ease',
              cursor: 'pointer',
              height: '100%'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isYearly && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  20% off
                </div>
              )}
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#ececec',
                marginBottom: '0.5rem'
              }}>
                Vibe AI Core
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.25rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#ececec'
                }}>
                  {isYearly ? '23,99' : '29,99'}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  color: '#999'
                }}>
                  €
                </span>
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#999',
                marginBottom: '0.25rem'
              }}>
                per month
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: '#999',
                marginBottom: '0.5rem'
              }}>
                {isYearly ? 'billed annually' : 'billed monthly'}
              </div>
              <p style={{
                fontSize: '0.8rem',
                color: '#999',
                marginBottom: '0.75rem'
              }}>
                Create, launch, and share your apps.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Vibe AI Agent</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Rocket size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Publish and host live apps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Unlimited private apps</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>30€ monthly credits</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUp size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Pay-as-you-go for usage</span>
                </div>
              </div>
              <Link href={`/pricing/core/checkout?yearly=${isYearly}`} style={{
                marginTop: 'auto',
                width: '100%',
                padding: '0.875rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'opacity 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Continue with Core
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Teams Plan */}
            <div style={{
              background: '#2a2a2a',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #2f2f2f',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isYearly && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  13% off
                </div>
              )}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#ececec',
                marginBottom: '0.5rem'
              }}>
                Teams
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.25rem',
                marginBottom: '0.25rem'
              }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: '#ececec'
                }}>
                  {isYearly ? '79,99' : '99,99'}
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#999'
                }}>
                  €
                </span>
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#999',
                marginBottom: '0.25rem'
              }}>
                per user
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#999',
                marginBottom: '0.75rem'
              }}>
                {isYearly ? 'billed annually' : 'billed monthly'}
              </div>
              <p style={{
                fontSize: '0.85rem',
                color: '#999',
                marginBottom: '1rem'
              }}>
                Bring Vibe AI to your entire team.
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
                flex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowLeft size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Everything in Core</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Centralized billing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Role-based access control</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>100€ monthly credits</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color="#999" />
                  <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Private deployments</span>
                </div>
              </div>
              <Link href="/teams/setup" style={{
                marginTop: 'auto',
                width: '100%',
                padding: '0.75rem',
                background: '#3a3a3a',
                color: '#ececec',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3a3a3a'}
              >
                Continue with Teams
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{
            fontSize: '0.75rem',
            color: '#999',
            lineHeight: '1.5',
            maxWidth: '750px',
            textAlign: 'center'
          }}>
            *Prices are subject to tax depending on your location. Vibe AI Agent is powered by large language models. While it can produce powerful results, its behavior is probabilistic—meaning it may occasionally make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
