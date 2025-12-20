'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Home, Code, Globe, ChevronDown, 
  CheckCircle, ArrowRight, ExternalLink, FileCode,
  User, Bell, Users, Terminal, Palette, Sun, Moon, HelpCircle, LogOut, ChevronRight, Download,
  Lock, Users2, Building2, Shield, ArrowUp, ArrowLeft, Cloud, DollarSign, Star, Smartphone, Sparkles
} from 'lucide-react';
import AnimatedLogoIcon from '../../components/AnimatedLogoIcon';

export default function TeamsSetupPage() {
  const [orgName, setOrgName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [description, setDescription] = useState('My team wants to use Vibe AI to build...');
  const [billingEmail, setBillingEmail] = useState('ibuyplussell15@gmail.com');
  const [teamMembers, setTeamMembers] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [submitMessage, setSubmitMessage] = useState('');
  const [showUseCaseDropdown, setShowUseCaseDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const useCaseDropdownRef = useRef(null);

  useEffect(() => {
    // Add CSS animations for progress bars
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
          color: white;
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
      /* Dropdown option hover - blue like Continue button */
      select option:hover {
        background: #3b82f6 !important;
        color: white !important;
      }
      select option:checked,
      select option:focus {
        background: #3b82f6 !important;
        color: white !important;
      }
      /* For better browser support */
      select option {
        background: #1a1a1a;
        color: #ececec;
      }
      select option:hover {
        background: #3b82f6;
        color: white;
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
      if (useCaseDropdownRef.current && !useCaseDropdownRef.current.contains(event.target)) {
        setShowUseCaseDropdown(false);
      }
    };

    if (showDropdown || showUseCaseDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showUseCaseDropdown]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#ececec',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left Sidebar - EXAKT wie Bild */}
      <div style={{
        width: '280px',
        background: '#1f1f1f',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        left: 0,
        top: 0
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

        {/* Starter Plan Section */}
        <div style={{
          background: '#1f1f1f',
          borderRadius: '0',
          padding: '1rem',
          border: 'none'
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
              <span style={{ fontSize: '0.85rem', color: '#ececec' }}>Agent credits: 0% used</span>
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
                  width: '0%',
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

          <Link href="/pricing/enterprise" style={{
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            color: '#ececec',
            border: '1px solid #4a4a4a',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
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
            <Sparkles size={16} color="currentColor" style={{ animation: 'upgradeButtonColor 2s ease-in-out infinite' }} />
            Upgrade to Enterprise
          </Link>
        </div>

        {/* Install Vibe AI */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: 'none',
          fontSize: '0.85rem',
          color: '#999',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <input type="checkbox" style={{ cursor: 'pointer', accentColor: '#ff8c42' }} />
          <span>Install Vibe AI on</span>
          <Smartphone size={16} color="#999" style={{ marginLeft: '0.25rem' }} />
        </div>
      </div>

      {/* Central Content Area */}
      <div 
        className="hide-scrollbar"
        style={{
          flex: 1,
          background: '#1a1a1a',
          padding: '0',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderLeft: 'none',
          borderRight: 'none',
          marginLeft: '280px',
          marginRight: '380px',
          height: '100vh'
        }}>
        {/* Back Button */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '2rem 2rem 0 2rem'
        }}>
          <Link href="/pricing" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#999',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
            marginBottom: '1rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ececec'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
          >
            <ArrowLeft size={18} />
            Back to Pricing
          </Link>
        </div>
        {/* Breadcrumbs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#999',
          width: '100%',
          maxWidth: '400px',
          paddingLeft: '2rem',
          paddingRight: '2rem'
        }}>
          <span style={{ color: '#ff8c42' }}>1. Setup</span>
          <span>›</span>
          <span>2. Select a plan</span>
          <span>›</span>
          <span>3. Payment</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: '700',
          color: '#ececec',
          marginBottom: '0.5rem',
          lineHeight: '1.2',
          width: '100%',
          maxWidth: '400px',
          paddingLeft: '2rem',
          paddingRight: '2rem'
        }}>
          Set up your organization
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#999',
          marginBottom: '1.25rem',
          lineHeight: '1.5',
          width: '100%',
          maxWidth: '400px',
          paddingLeft: '2rem',
          paddingRight: '2rem'
        }}>
          Start by telling us a bit about your organization.
        </p>

        {/* Form */}
        <form 
          style={{ maxWidth: '400px', width: '100%', paddingLeft: '2rem', paddingRight: '2rem' }}
          onSubmit={async (e) => {
            e.preventDefault();
            
            // Validate required fields
            if (!orgName.trim() || !useCase || !billingEmail.trim()) {
              setSubmitStatus('error');
              setSubmitMessage('Please fill in all required fields.');
              return;
            }
            
            setIsSubmitting(true);
            setSubmitStatus(null);
            setSubmitMessage('');
            
            try {
              const response = await fetch('/api/teams/setup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  org_name: orgName.trim(),
                  use_case: useCase,
                  description: description.trim() || null,
                  billing_email: billingEmail.trim(),
                  team_members: teamMembers.trim() || null,
                }),
              });
              
              const data = await response.json();
              
              if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage('Team setup request submitted successfully! We will contact you soon.');
                // Reset form
                setOrgName('');
                setUseCase('');
                setDescription('My team wants to use Vibe AI to build...');
                setTeamMembers('');
              } else {
                setSubmitStatus('error');
                setSubmitMessage(data.detail || 'An error occurred. Please try again.');
              }
            } catch (error) {
              console.error('Error submitting form:', error);
              setSubmitStatus('error');
              setSubmitMessage('Failed to submit form. Please check your connection and try again.');
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {/* Status Message */}
          {submitStatus && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '6px',
              background: submitStatus === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '0.9rem'
            }}>
              {submitMessage}
            </div>
          )}
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#ececec',
              marginBottom: '0.4rem'
            }}>
              Organization name <span style={{ color: '#ff8c42' }}>*</span>
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                color: '#ececec',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#ececec',
              marginBottom: '0.4rem'
            }}>
              What do you plan to use Vibe AI for? <span style={{ color: '#ff8c42' }}>*</span>
            </label>
            <div style={{ position: 'relative' }} ref={useCaseDropdownRef}>
              <button
                type="button"
                onClick={() => setShowUseCaseDropdown(!showUseCaseDropdown)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#1a1a1a',
                  border: '1px solid #4a4a4a',
                  borderRadius: '6px',
                  color: useCase ? '#ececec' : '#999',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
              >
                <span>
                  {useCase === 'prototyping-web-apps' ? 'Prototyping web applications' :
                   useCase === 'internal-tools' ? 'Internal tools at work' :
                   useCase === 'building-demos' ? 'Building demos for customers or clients' :
                   useCase === 'data-workflows' ? 'Data workflows' :
                   useCase === 'interviewing' ? 'Interviewing' :
                   useCase === 'building-startup' ? 'Building a startup' :
                   useCase === 'other' ? 'Other' :
                   'Select a use case'}
                </span>
                <ChevronDown size={18} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
              </button>
              
              {showUseCaseDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.25rem',
                  background: '#1a1a1a',
                  border: '1px solid #4a4a4a',
                  borderRadius: '6px',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                }}>
                  {[
                    { value: 'prototyping-web-apps', label: 'Prototyping web applications' },
                    { value: 'internal-tools', label: 'Internal tools at work' },
                    { value: 'building-demos', label: 'Building demos for customers or clients' },
                    { value: 'data-workflows', label: 'Data workflows' },
                    { value: 'interviewing', label: 'Interviewing' },
                    { value: 'building-startup', label: 'Building a startup' },
                    { value: 'other', label: 'Other' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setUseCase(option.value);
                        setShowUseCaseDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: useCase === option.value ? '#3b82f6' : 'transparent',
                        color: useCase === option.value ? 'white' : '#ececec',
                        border: 'none',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.2s, color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (useCase !== option.value) {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (useCase !== option.value) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ececec';
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#ececec',
              marginBottom: '0.4rem'
            }}>
              Care to share more about what you'll build? <span style={{ color: '#999', fontWeight: '400' }}>(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                color: '#ececec',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#ececec',
              marginBottom: '0.4rem'
            }}>
              Billing email <span style={{ color: '#ff8c42' }}>*</span>
            </label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                color: '#ececec',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#ececec',
              marginBottom: '0.4rem'
            }}>
              Invite team members
            </label>
            <p style={{
              fontSize: '0.85rem',
              color: '#999',
              marginBottom: '0.5rem'
            }}>
              Comma-separated list of emails
            </p>
            <textarea
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              rows={3}
              placeholder="email@example.com, email2@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a1a',
                border: '1px solid #4a4a4a',
                borderRadius: '6px',
                color: '#ececec',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#4a4a4a'}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? '#6b7280' : '#3b82f6',
              color: 'white',
              padding: '0.875rem 2rem',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
              marginTop: '0',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = '1')}
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      {/* Right Info Panel */}
      <div 
        className="hide-scrollbar"
        style={{
          width: '380px',
          background: '#1a1a1a',
          borderLeft: '1px solid #2f2f2f',
          padding: '1.25rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AnimatedLogoIcon size={24} />
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#ececec',
            margin: 0
          }}>
            Vibe AI Teams
          </h2>
        </div>

        <p style={{
          fontSize: '0.85rem',
          color: '#999',
          lineHeight: '1.5',
          marginBottom: '1rem'
        }}>
          The launchpad for your team's most important work. Purpose-built to help your team move faster and ship higher quality software.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <Link href="/pricing/teams/checkout?yearly=false" style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginRight: '0.75rem',
            transition: 'opacity 0.2s',
            textDecoration: 'none',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Starts at 99,99€/user per month
          </Link>
          <Link href="#" style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Learn more
            <ExternalLink size={14} />
          </Link>
        </div>

        <div style={{
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid #2f2f2f',
          marginBottom: '1.25rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <FileCode size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#ececec', fontWeight: '500', marginBottom: '0.4rem' }}>
                  Unlimited creations in a more powerful workspace
                </div>
                <ul style={{ fontSize: '0.75rem', color: '#999', marginLeft: '1rem', lineHeight: '1.5', margin: 0, padding: 0 }}>
                  <li>Create unlimited Apps with unlimited editors</li>
                  <li>5x more storage, 10x more power</li>
                  <li>Access to Claude Sonnet 4 & OpenAI GPT-4o</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Users size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#ececec', fontWeight: '500' }}>
                Collaborate seamlessly with Projects.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Building2 size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#ececec', fontWeight: '500' }}>
                Publish a Company Profile to share your work.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Shield size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#ececec', fontWeight: '500' }}>
                Role-based permissions for Apps and Deployments.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <DollarSign size={16} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#ececec', fontWeight: '500', marginBottom: '0.4rem' }}>
                  100€/mo in usage credits included
                </div>
                <ul style={{ fontSize: '0.75rem', color: '#999', marginLeft: '1rem', lineHeight: '1.5', margin: 0, padding: 0 }}>
                  <li>Credits granted upfront with annual plan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: '#2a2a2a',
          borderRadius: '8px',
          padding: '1.25rem',
          border: '1px solid #2f2f2f'
        }}>
          <blockquote style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: '#ececec',
            lineHeight: '1.6',
            margin: 0,
            marginBottom: '0.75rem',
            fontStyle: 'normal',
            border: 'none',
            padding: 0
          }}>
            "We use Vibe AI internally to prototype new types of Assistants before pushing them to production. It allows us to rapidly deploy our environment and try out new features, making sure they work in production and in our SDKs."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <img 
                src="/mike-gehrke.jpg" 
                alt="Mike Gehrke"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  flexShrink: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  const fallback = document.getElementById('mike-fallback');
                  if (fallback) fallback.style.display = 'none';
                }}
              />
              <div 
                id="mike-fallback"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: 'none',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0
                }}
              >
                MG
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#ececec', fontWeight: '500' }}>
                Mike Gehrke
              </div>
              <div style={{ fontSize: '0.85rem', color: '#999' }}>
                Co-founder, SUPERAGENT.SH
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
