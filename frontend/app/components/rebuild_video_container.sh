#!/bin/bash

# Backup original
cp VideoEditor.jsx VideoEditor.jsx.old

# Extract header (lines 1-830)
sed -n '1,830p' VideoEditor.jsx.old > VideoEditor_part1.txt

# Extract tools panel and rest (lines 1298-end)
sed -n '1298,$p' VideoEditor.jsx.old > VideoEditor_part3.txt

# Create new clean video container
cat > VideoEditor_part2.txt << 'NEWCONTAINER'
        {/* NEW CLEAN VIDEO CONTAINER - iPhone Pro Max Size */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '20px',
          gap: '15px',
          flex: 1,
          minWidth: 0
        }}>
          {/* iPhone Video Preview */}
          <div
            style={{
              position: 'relative',
              width: '390px',
              height: '844px',
              backgroundColor: '#000',
              borderRadius: '40px',
              border: '12px solid #1a1a1a',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {uploadedVideo ? (
              <>
                <video
                  ref={videoRef}
                  src={uploadedVideo}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                      setEndTime(videoRef.current.duration);
                      setTextEndTime(videoRef.current.duration);
                    }
                  }}
                />
                
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: '3px solid white',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  {isPlaying ? <Pause size={40} /> : <Play size={40} />}
                </button>

                {/* Text Overlays */}
                {textOverlays
                  .filter(overlay => {
                    const startTime = overlay.startTime || 0;
                    const endTime = overlay.endTime || duration;
                    return currentTime >= startTime && currentTime <= endTime;
                  })
                  .map(overlay => {
                    let bgStyle = {};
                    
                    if (overlay.background && overlay.background !== 'none') {
                      if (overlay.background === 'custom') {
                        bgStyle = overlay.customBgStyle || {};
                      } else {
                        bgStyle = textBackgrounds.find(bg => bg.id === overlay.background)?.style || {};
                      }
                    }

                    const stylePreset = stylePresets.find(s => s.id === overlay.style) || stylePresets[0];
                    const rotation = overlay.rotation || 0;
                    const skewX = overlay.skewX || 0;
                    const skewY = overlay.skewY || 0;
                    const innerTransform = `rotate(${rotation}deg) skewX(${skewX}deg) skewY(${skewY}deg)`;
                    const animationClass = overlay.animation || 'none';
                    const isSelected = selectedTextId === overlay.id;
                    
                    return (
                      <div
                        key={overlay.id}
                        draggable
                        onDrag={(e) => {
                          if (e.clientX === 0 && e.clientY === 0) return;
                          handleTextDrag(e, overlay);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextId(overlay.id);
                          setShowTextMenu(true);
                          setTextMenuPosition({ x: e.clientX, y: e.clientY });
                        }}
                        className={`text-overlay-${animationClass}`}
                        style={{
                          position: 'absolute',
                          left: `${overlay.x}%`,
                          top: `${overlay.y}%`,
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'auto',
                          cursor: 'move',
                          userSelect: 'none',
                          zIndex: 100,
                          ...(overlay.background === 'none' || !overlay.background ? {
                            border: isSelected ? '2px solid #3b82f6' : '2px dashed rgba(59, 130, 246, 0.3)'
                          } : {
                            border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)'
                          })
                        }}
                      >
                        <span style={{
                          display: 'inline-block',
                          transform: innerTransform,
                          color: overlay.color,
                          fontSize: `${overlay.fontSize}px`,
                          fontFamily: stylePreset.fontFamily,
                          fontWeight: stylePreset.fontWeight,
                          fontStyle: stylePreset.fontStyle,
                          textTransform: stylePreset.textTransform,
                          letterSpacing: stylePreset.letterSpacing,
                          ...bgStyle
                        }}>
                          {overlay.text}
                        </span>
                      </div>
                    );
                  })}
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                gap: '20px'
              }}>
                <VideoIcon size={64} />
                <p style={{ fontSize: '18px', margin: 0 }}>No video loaded</p>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📹 Upload Video
                  </button>
                  <span style={{ color: '#999', fontSize: '14px' }}>or</span>
                  <button
                    onClick={() => {
                      setUploadedVideo(demoVideoUrl);
                      if (videoRef.current) {
                        videoRef.current.src = demoVideoUrl;
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🎬 Load Demo Video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline - Under Video */}
          {uploadedVideo && (
            <div style={{
              width: '390px',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              padding: '15px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                color: '#fff'
              }}>
                <span style={{ fontSize: '14px' }}>
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  setCurrentTime(time);
                  if (videoRef.current) {
                    videoRef.current.currentTime = time;
                  }
                }}
                style={{
                  width: '100%',
                  height: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}
        </div>

NEWCONTAINER

# Combine all parts
cat VideoEditor_part1.txt VideoEditor_part2.txt VideoEditor_part3.txt > VideoEditor.jsx

# Cleanup
rm VideoEditor_part*.txt

echo "✅ Video Container neu erstellt!"
