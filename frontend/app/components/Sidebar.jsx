'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, Plus, Home, User, ChevronDown, LogOut, Download
} from 'lucide-react';
import AnimatedLogoIcon from './AnimatedLogoIcon';

export default function Sidebar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: ''
  });
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/profile/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      
      // Fallback: try localStorage
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          const name = userData.name || userData.username || userData.email?.split('@')[0] || 'User';
          const nameParts = name.split(' ');
          setProfileData({
            firstName: nameParts[0] || '',
            lastName: nameParts[1] || '',
            username: userData.username || userData.email?.split('@')[0] || 'username'
          });
        } catch (e) {
          console.log('Could not parse user data');
        }
      }
    };
    
    loadProfile();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const isActive = (path) => pathname === path;

  return (
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
      top: 0,
      zIndex: 100
    }}>
      {/* Top Content */}
      <div style={{ flexShrink: 0 }}>
        {/* Logo Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginLeft: '0.5rem' }}>
            <AnimatedLogoIcon size={32} />
          </div>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '0.5rem'
          }}>
            <Search size={20} />
          </button>
        </div>

        {/* Create App Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: '#3b82f6',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <Plus size={18} />
          Create App
        </button>

        {/* Import Button */}
        <button style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'transparent',
          border: 'none',
          color: '#ececec',
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'flex-start',
          transition: 'background 0.2s',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Download size={16} color="#ececec" />
          Import code or design
        </button>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '0', marginTop: '0.5rem' }}>
          <Link href="/home" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '8px',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0',
            background: isActive('/home') ? '#2a2a2a' : 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = isActive('/home') ? '#2a2a2a' : 'transparent'}
          >
            <Home size={18} color="#ececec" />
            Home
          </Link>
          
          <Link href="/profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: '8px',
            color: '#ececec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background 0.2s',
            marginBottom: '0',
            background: isActive('/profile') ? '#2a2a2a' : 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={(e) => e.currentTarget.style.background = isActive('/profile') ? '#2a2a2a' : 'transparent'}
          >
            <User size={18} color="#ececec" />
            Profile
          </Link>
        </nav>
      </div>

      {/* Bottom Section with User */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #2a2a2a' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => setShowDropdown(!showDropdown)}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            {profileData.firstName?.[0]?.toUpperCase() || 'U'}{profileData.lastName?.[0]?.toUpperCase() || ''}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#ffffff' }}>
              {profileData.firstName} {profileData.lastName || 'User'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              @{profileData.username || 'username'}
            </div>
          </div>
          <ChevronDown size={16} style={{ color: '#9ca3af' }} />
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div ref={dropdownRef} style={{
            position: 'absolute',
            bottom: '80px',
            left: '1rem',
            right: '1rem',
            background: '#2a2a2a',
            borderRadius: '8px',
            padding: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            zIndex: 1000
          }}>
            <button style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              color: '#e5e5e5',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '6px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => e.target.style.background = '#3a3a3a'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}>
              <LogOut size={18} />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

