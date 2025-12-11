'use client';

import { useState } from 'react';
import { Package, Search, Download, Settings } from 'lucide-react';

export default function ExtensionsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [installedExtensions, setInstalledExtensions] = useState([
    { id: 'vscode-eslint', name: 'ESLint', publisher: 'Microsoft', version: '2.4.0', description: 'Integrates ESLint into VS Code' },
    { id: 'prettier', name: 'Prettier', publisher: 'Prettier', version: '9.0.0', description: 'Code formatter' },
    { id: 'gitlens', name: 'GitLens', publisher: 'GitKraken', version: '14.0.0', description: 'Supercharge Git capabilities' }
  ]);
  const [availableExtensions, setAvailableExtensions] = useState([
    { id: 'python', name: 'Python', publisher: 'Microsoft', downloads: 50000000, rating: 4.8 },
    { id: 'javascript', name: 'JavaScript', publisher: 'Microsoft', downloads: 30000000, rating: 4.7 },
    { id: 'typescript', name: 'TypeScript', publisher: 'Microsoft', downloads: 20000000, rating: 4.9 }
  ]);

  const installExtension = (ext) => {
    setInstalledExtensions(prev => [...prev, { ...ext, version: '1.0.0' }]);
    setAvailableExtensions(prev => prev.filter(e => e.id !== ext.id));
    alert(`✅ ${ext.name} installed successfully!`);
  };

  const uninstallExtension = (ext) => {
    setInstalledExtensions(prev => prev.filter(e => e.id !== ext.id));
    setAvailableExtensions(prev => [...prev, { ...ext, downloads: 0, rating: 0 }]);
    alert(`✅ ${ext.name} uninstalled`);
  };

  const filteredAvailable = availableExtensions.filter(ext =>
    ext.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      color: '#cccccc'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <Package size={16} color="#858585" />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>Extensions</span>
        </div>
        <div style={{
          position: 'relative'
        }}>
          <Search size={14} style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#858585'
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Extensions..."
            style={{
              width: '100%',
              padding: '6px 8px 6px 28px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #3c3c3c',
        background: '#252526'
      }}>
        <button
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            color: '#cccccc',
            fontSize: '11px',
            cursor: 'pointer',
            borderBottom: '2px solid #007acc'
          }}
        >
          Installed ({installedExtensions.length})
        </button>
        <button
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: 'none',
            color: '#858585',
            fontSize: '11px',
            cursor: 'pointer',
            borderBottom: '2px solid transparent'
          }}
        >
          Marketplace
        </button>
      </div>

      {/* Installed Extensions */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px'
      }}>
        {installedExtensions.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#858585',
            fontSize: '12px'
          }}>
            No extensions installed
          </div>
        ) : (
          installedExtensions.map((ext) => (
            <div
              key={ext.id}
              style={{
                padding: '12px',
                borderBottom: '1px solid #2d2d30',
                fontSize: '11px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#cccccc' }}>
                    {ext.name}
                  </div>
                  <div style={{ color: '#858585', fontSize: '10px' }}>
                    {ext.publisher} • v{ext.version}
                  </div>
                </div>
                <button
                  onClick={() => uninstallExtension(ext)}
                  style={{
                    padding: '4px 8px',
                    background: '#2d2d30',
                    border: '1px solid #3c3c3c',
                    borderRadius: '4px',
                    color: '#cccccc',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Uninstall
                </button>
              </div>
              <div style={{ color: '#858585', fontSize: '10px' }}>
                {ext.description}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Marketplace */}
      {filteredAvailable.length > 0 && (
        <div style={{
          borderTop: '1px solid #3c3c3c',
          padding: '8px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#858585',
            marginBottom: '8px'
          }}>
            Recommended
          </div>
          {filteredAvailable.map((ext) => (
            <div
              key={ext.id}
              style={{
                padding: '8px',
                borderBottom: '1px solid #2d2d30',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: '500', color: '#cccccc' }}>
                  {ext.name}
                </div>
                <div style={{ color: '#858585', fontSize: '10px' }}>
                  {ext.publisher} • ⭐ {ext.rating} • {ext.downloads.toLocaleString()} downloads
                </div>
              </div>
              <button
                onClick={() => installExtension(ext)}
                style={{
                  padding: '4px 8px',
                  background: '#007acc',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Download size={12} />
                Install
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






