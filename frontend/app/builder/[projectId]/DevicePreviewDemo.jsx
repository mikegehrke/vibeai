// VIBEAI - Enhanced Live Preview Demo
// Demonstration der Device Frame Integration

'use client';

import { useState } from 'react';
import DeviceFrame, { DeviceSelector, DEVICES } from './DeviceFrame';

export default function DevicePreviewDemo() {
  const [device, setDevice] = useState('iphone15');
  const [url, setUrl] = useState('');

  // Demo URLs
  const demoUrls = {
    react: 'https://react.dev',
    nextjs: 'https://nextjs.org',
    flutter: 'https://flutter.dev',
    custom: ''
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', marginBottom: '16px' }}>
          📱 Device Preview Demo
        </h2>

        {/* URL Input */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Enter URL or use demo buttons..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              flex: '1',
              minWidth: '300px',
              padding: '10px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          
          <button
            onClick={() => setUrl(demoUrls.react)}
            style={{
              padding: '10px 16px',
              background: '#61dafb',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⚛️ React
          </button>
          
          <button
            onClick={() => setUrl(demoUrls.nextjs)}
            style={{
              padding: '10px 16px',
              background: '#fff',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ▲ Next.js
          </button>
          
          <button
            onClick={() => setUrl(demoUrls.flutter)}
            style={{
              padding: '10px 16px',
              background: '#02569B',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📱 Flutter
          </button>
        </div>

        {/* Device Selector */}
        <DeviceSelector currentDevice={device} onDeviceChange={setDevice} />

        {/* Device Info */}
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          color: '#aaa',
          fontSize: '12px'
        }}>
          <strong style={{ color: '#fff' }}>Current Device:</strong> {DEVICES[device].name} 
          {' • '}
          <strong>Size:</strong> {DEVICES[device].width} × {DEVICES[device].height}px
        </div>
      </div>

      {/* Device Frame */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <DeviceFrame device={device} url={url || 'https://example.com'} />
      </div>
    </div>
  );
}
