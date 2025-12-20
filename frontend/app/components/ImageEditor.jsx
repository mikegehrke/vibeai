'use client';

import { useState, useRef } from 'react';
import { 
  X, Check, RotateCcw, Image as ImageIcon, Type, Smile, 
  Sun, Moon, Contrast, Droplet, Sparkles, Palette 
} from 'lucide-react';

export default function ImageEditor({ 
  imageUrl, 
  onSave, 
  onCancel 
}) {
  const [editedImage, setEditedImage] = useState(imageUrl);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [blur, setBlur] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [activeTab, setActiveTab] = useState('crop'); // crop, filters, adjust, emojis
  const [isProcessing, setIsProcessing] = useState(false);

  // Crop & Position states
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState('circle'); // circle or square

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Available filters
  const filters = [
    { id: 'none', name: 'Original', icon: '🎨' },
    { id: 'vintage', name: 'Vintage', icon: '📸' },
    { id: 'blackwhite', name: 'B&W', icon: '⚫' },
    { id: 'warm', name: 'Warm', icon: '🔥' },
    { id: 'cool', name: 'Cool', icon: '❄️' },
    { id: 'dramatic', name: 'Dramatic', icon: '⚡' }
  ];

  // Emoji stickers
  const emojis = ['😀', '😍', '🔥', '✨', '⭐', '❤️', '👍', '🎉', '💯', '🚀', '💪', '🌟'];

  // Handle image drag for positioning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Apply crop and save
  const applyCropAndSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const size = 400; // Final size
      canvas.width = size;
      canvas.height = size;
      
      // Calculate cropped area
      const scale = zoom;
      const sourceSize = size / scale;
      const sourceX = (img.width / 2) - (sourceSize / 2) - (position.x / scale);
      const sourceY = (img.height / 2) - (sourceSize / 2) - (position.y / scale);
      
      // Draw cropped image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        size,
        size
      );
      
      // Convert to base64
      const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
      setEditedImage(croppedImage);
    };
    
    img.src = editedImage || imageUrl;
  };

  // Reset crop
  const resetCrop = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setEditedImage(imageUrl);
  };

  // Apply filter
  const applyFilter = async (filterName) => {
    setSelectedFilter(filterName);
    await processImage(filterName);
  };

  // Process image with backend
  const processImage = async (filterName = selectedFilter) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:8000/api/media/image/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: imageUrl,
          brightness,
          contrast,
          saturation,
          blur,
          filterName: filterName === 'none' ? null : filterName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEditedImage(data.imageData);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset all adjustments
  const resetAdjustments = () => {
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setBlur(0);
    setSelectedFilter('none');
    setEditedImage(imageUrl);
  };

  // Add emoji to image
  const addEmoji = async (emoji) => {
    try {
      const response = await fetch('http://localhost:8000/api/media/image/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData: editedImage || imageUrl,
          text: emoji,
          positionX: Math.random() * 200 + 50,
          positionY: Math.random() * 200 + 50,
          fontSize: 60
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEditedImage(data.imageData);
      }
    } catch (error) {
      console.error('Error adding emoji:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#ffffff',
          margin: 0
        }}>
          Edit Photo
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#ececec',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={() => onSave(editedImage || imageUrl)}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Image Preview */}
        <div 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#000',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseMove={activeTab === 'crop' ? handleMouseMove : undefined}
          onMouseUp={activeTab === 'crop' ? handleMouseUp : undefined}
          onMouseLeave={activeTab === 'crop' ? handleMouseUp : undefined}
        >
          {activeTab === 'crop' ? (
            /* Crop Mode with Draggable Image */
            <div style={{
              position: 'relative',
              width: '400px',
              height: '400px',
              borderRadius: cropShape === 'circle' ? '50%' : '12px',
              overflow: 'hidden',
              border: '3px solid #3b82f6',
              background: '#000',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}>
              <img
                ref={imageRef}
                src={editedImage || imageUrl}
                alt="Crop preview"
                draggable={false}
                onMouseDown={handleMouseDown}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  userSelect: 'none',
                  pointerEvents: 'auto'
                }}
              />
            </div>
          ) : (
            /* Normal Preview Mode */
            <img
              src={editedImage || imageUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}
            />
          )}
          {isProcessing && (
            <div style={{
              position: 'absolute',
              background: 'rgba(0,0,0,0.7)',
              padding: '1rem 2rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              Processing...
            </div>
          )}
        </div>

        {/* Tools Panel */}
        <div style={{
          width: '320px',
          background: '#1f1f1f',
          borderLeft: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #2a2a2a'
          }}>
            {[
              { id: 'crop', label: 'Crop', icon: ImageIcon },
              { id: 'filters', label: 'Filters', icon: Palette },
              { id: 'adjust', label: 'Adjust', icon: Sun },
              { id: 'emojis', label: 'Stickers', icon: Smile }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: activeTab === tab.id ? '#2a2a2a' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'none',
                  color: activeTab === tab.id ? '#3b82f6' : '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem'
                }}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tool Content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem'
          }}>
            {activeTab === 'crop' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{
                  color: '#999',
                  fontSize: '0.85rem',
                  margin: 0
                }}>
                  Drag image to reposition, use zoom to resize
                </p>

                {/* Crop Shape Toggle */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Crop Shape
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => setCropShape('circle')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: cropShape === 'circle' ? '#3b82f6' : '#2a2a2a',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ececec',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      ⭕ Circle
                    </button>
                    <button
                      onClick={() => setCropShape('square')}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: cropShape === 'square' ? '#3b82f6' : '#2a2a2a',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ececec',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      ⬜ Square
                    </button>
                  </div>
                </div>

                {/* Zoom Slider */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{ color: '#ececec', fontSize: '0.9rem', fontWeight: '500' }}>
                      Zoom
                    </label>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Quick Position Buttons */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#ececec',
                    fontSize: '0.9rem',
                    marginBottom: '0.75rem',
                    fontWeight: '500'
                  }}>
                    Quick Position
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {[
                      { label: '↖', pos: { x: -50, y: -50 } },
                      { label: '↑', pos: { x: 0, y: -50 } },
                      { label: '↗', pos: { x: 50, y: -50 } },
                      { label: '←', pos: { x: -50, y: 0 } },
                      { label: '●', pos: { x: 0, y: 0 } },
                      { label: '→', pos: { x: 50, y: 0 } },
                      { label: '↙', pos: { x: -50, y: 50 } },
                      { label: '↓', pos: { x: 0, y: 50 } },
                      { label: '↘', pos: { x: 50, y: 50 } }
                    ].map((btn, index) => (
                      <button
                        key={index}
                        onClick={() => setPosition(btn.pos)}
                        style={{
                          padding: '0.75rem',
                          background: '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ececec',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply & Reset Buttons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <button
                    onClick={applyCropAndSave}
                    style={{
                      padding: '0.75rem',
                      background: '#3b82f6',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Apply Crop
                  </button>
                  <button
                    onClick={resetCrop}
                    style={{
                      padding: '0.75rem',
                      background: '#2a2a2a',
                      border: '1px solid #4a4a4a',
                      borderRadius: '6px',
                      color: '#ececec',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'filters' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {filters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => applyFilter(filter.id)}
                      style={{
                        padding: '1rem',
                        background: selectedFilter === filter.id ? '#3b82f6' : '#2a2a2a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ececec',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{filter.icon}</span>
                      <span style={{ fontSize: '0.85rem' }}>{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Brightness */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{ color: '#ececec', fontSize: '0.9rem' }}>
                      <Sun size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      Brightness
                    </label>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                      {Math.round(brightness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    onMouseUp={() => processImage()}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{ color: '#ececec', fontSize: '0.9rem' }}>
                      <Contrast size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      Contrast
                    </label>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                      {Math.round(contrast * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    onMouseUp={() => processImage()}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{ color: '#ececec', fontSize: '0.9rem' }}>
                      <Droplet size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      Saturation
                    </label>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                      {Math.round(saturation * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={saturation}
                    onChange={(e) => setSaturation(parseFloat(e.target.value))}
                    onMouseUp={() => processImage()}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Blur */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <label style={{ color: '#ececec', fontSize: '0.9rem' }}>
                      <Sparkles size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      Blur
                    </label>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                      {blur}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value))}
                    onMouseUp={() => processImage()}
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  onClick={resetAdjustments}
                  style={{
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    border: '1px solid #4a4a4a',
                    borderRadius: '6px',
                    color: '#ececec',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem'
                  }}
                >
                  <RotateCcw size={16} />
                  Reset All
                </button>
              </div>
            )}

            {activeTab === 'emojis' && (
              <div>
                <p style={{
                  color: '#999',
                  fontSize: '0.85rem',
                  marginBottom: '1rem'
                }}>
                  Click to add stickers to your photo
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem'
                }}>
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmoji(emoji)}
                      style={{
                        padding: '1rem',
                        background: '#2a2a2a',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

