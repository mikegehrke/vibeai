'use client';

import { useState, useEffect } from 'react';

export default function PackageManager({ projectId }) {
  const [packages, setPackages] = useState([]);
  const [packageManager, setPackageManager] = useState('npm');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [newPackage, setNewPackage] = useState('');

  useEffect(() => {
    loadPackages();
  }, [projectId, packageManager]);

  const loadPackages = async () => {
    try {
      const res = await fetch('http://localhost:8005/api/packages/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          package_manager: packageManager
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Load packages error:', error);
    }
  };

  const handleInstall = async () => {
    if (!newPackage.trim()) return;
    
    setIsInstalling(true);
    try {
      const res = await fetch('http://localhost:8005/api/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          package_name: newPackage,
          package_manager: packageManager
        })
      });
      
      if (res.ok) {
        setNewPackage('');
        loadPackages();
        alert('✅ Package installed!');
      } else {
        const error = await res.json();
        alert(`❌ Installation failed: ${error.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstall = async (packageName) => {
    if (!confirm(`Uninstall ${packageName}?`)) return;
    
    try {
      const res = await fetch('http://localhost:8005/api/packages/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          package_name: packageName,
          package_manager: packageManager
        })
      });
      
      if (res.ok) {
        loadPackages();
        alert('✅ Package uninstalled!');
      } else {
        const error = await res.json();
        alert(`❌ Uninstall failed: ${error.detail}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:8005/api/packages/search?query=${searchQuery}&package_manager=${packageManager}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div style={{ padding: '12px', color: '#cccccc', fontSize: '12px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
          📦 Package Manager
        </div>
        <select
          value={packageManager}
          onChange={(e) => setPackageManager(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: '#1e1e1e',
            border: '1px solid #3c3c3c',
            borderRadius: '4px',
            color: '#cccccc',
            fontSize: '11px'
          }}
        >
          <option value="npm">npm (Node.js)</option>
          <option value="pip">pip (Python)</option>
          <option value="pub">pub (Flutter/Dart)</option>
          <option value="cargo">cargo (Rust)</option>
          <option value="go">go mod (Go)</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#858585' }}>
          Install Package
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newPackage}
            onChange={(e) => setNewPackage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInstall();
            }}
            placeholder="package-name"
            style={{
              flex: 1,
              padding: '6px 8px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleInstall}
            disabled={!newPackage.trim() || isInstalling}
            style={{
              padding: '6px 12px',
              background: !newPackage.trim() || isInstalling ? '#3c3c3c' : '#007acc',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '11px',
              cursor: !newPackage.trim() || isInstalling ? 'not-allowed' : 'pointer'
            }}
          >
            {isInstalling ? '⏳' : '📥 Install'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '11px', color: '#858585' }}>
          Search Packages
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="Search..."
            style={{
              flex: 1,
              padding: '6px 8px',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '6px 12px',
              background: '#2d2d30',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              color: '#cccccc',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            🔍
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '12px' }}>
          Installed Packages ({packages.length})
        </div>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {packages.length > 0 ? (
            packages.map((pkg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  background: '#2d2d30',
                  border: '1px solid #3c3c3c',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', color: '#cccccc' }}>
                    {pkg.name || pkg}
                  </div>
                  {pkg.version && (
                    <div style={{ fontSize: '10px', color: '#858585' }}>
                      {pkg.version}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleUninstall(pkg.name || pkg)}
                  style={{
                    padding: '4px 8px',
                    background: '#f48771',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '11px' }}>
              No packages installed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}













