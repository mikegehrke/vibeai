// VIBEAI - Device Frame Component
// iPhone 15 Pro, Pixel 8, iPad Pro Frames

'use client';

import './DeviceFrame.css';

const DEVICES = {
  iphone15: {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    borderRadius: 55,
    borderWidth: 12,
    borderColor: '#1c1c1e',
    notch: true,
    dynamicIsland: true
  },
  pixel8: {
    name: 'Pixel 8',
    width: 412,
    height: 915,
    borderRadius: 32,
    borderWidth: 10,
    borderColor: '#2d2d2d',
    notch: false,
    punchHole: true
  },
  ipad: {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    borderRadius: 18,
    borderWidth: 14,
    borderColor: '#1c1c1e',
    notch: false
  },
  desktop: {
    name: 'Desktop',
    width: 1280,
    height: 720,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    notch: false
  }
};

export default function DeviceFrame({ device = 'iphone15', url, children }) {
  const config = DEVICES[device] || DEVICES.iphone15;

  return (
    <div className="device-frame-container">
      <div className="device-label">{config.name}</div>
      
      <div className="device-wrapper">
        <div
          className={`device-frame ${device}`}
          style={{
            width: config.width,
            height: config.height,
            borderRadius: config.borderRadius,
            border: `${config.borderWidth}px solid ${config.borderColor}`,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Dynamic Island (iPhone 15 Pro) */}
          {config.dynamicIsland && (
            <div className="dynamic-island" />
          )}

          {/* Notch (older iPhones) */}
          {config.notch && !config.dynamicIsland && (
            <div className="notch" />
          )}

          {/* Punch Hole (Pixel 8) */}
          {config.punchHole && (
            <div className="punch-hole" />
          )}

          {/* Screen Content */}
          <div className="device-screen">
            {url ? (
              <iframe
                src={url}
                className="device-iframe"
                title="Device Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              children
            )}
          </div>
        </div>

        {/* Power Button */}
        {(device === 'iphone15' || device === 'pixel8') && (
          <div className="power-button" />
        )}

        {/* Volume Buttons */}
        {device === 'iphone15' && (
          <>
            <div className="volume-button volume-up" />
            <div className="volume-button volume-down" />
          </>
        )}
      </div>
    </div>
  );
}

// Device Selector Component
export function DeviceSelector({ currentDevice, onDeviceChange }) {
  return (
    <div className="device-selector">
      {Object.keys(DEVICES).map((key) => (
        <button
          key={key}
          className={`device-btn ${currentDevice === key ? 'active' : ''}`}
          onClick={() => onDeviceChange(key)}
          title={DEVICES[key].name}
        >
          {key === 'iphone15' && '📱'}
          {key === 'pixel8' && '🤖'}
          {key === 'ipad' && '📱'}
          {key === 'desktop' && '🖥️'}
          <span>{DEVICES[key].name}</span>
        </button>
      ))}
    </div>
  );
}

export { DEVICES };
