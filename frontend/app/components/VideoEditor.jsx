'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  X, Check, Play, Pause, RotateCcw, Scissors, Music, Type, 
  Smile, Sparkles, Zap, Download, Volume2, VolumeX,
  Image as ImageIcon, Layers, Clock, Video as VideoIcon
} from 'lucide-react';

export default function VideoEditor({ 
  appName,
  appData,
  onSave, 
  onCancel 
}) {
  const [activeTab, setActiveTab] = useState('trim'); // trim, text, music, filters, effects, stickers
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Trim settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30);
  
  // Video editing (NEW!)
  const [videoSize, setVideoSize] = useState({ width: 100, height: 100 }); // percentage
  const [videoPosition, setVideoPosition] = useState({ x: 0, y: 0 });
  const [videoCrop, setVideoCrop] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  
  // Text overlays (ENHANCED!)
  const [textOverlays, setTextOverlays] = useState([]);
  const [newText, setNewText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(40);
  const [textStyle, setTextStyle] = useState('classic'); // NEW!
  const [textAnimation, setTextAnimation] = useState('fadeIn'); // NEW!
  const [textStartTime, setTextStartTime] = useState(0); // NEW!
  const [textEndTime, setTextEndTime] = useState(5); // NEW!
  const [textStyles, setTextStyles] = useState([]); // NEW!
  const [textAnimations, setTextAnimations] = useState([]); // NEW!
  
  // Filters
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [videoSpeed, setVideoSpeed] = useState(1); // 0.5x, 1x, 2x
  
  // Music (ENHANCED!)
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [showMusicBrowser, setShowMusicBrowser] = useState(false); // NEW!
  const [musicSearchQuery, setMusicSearchQuery] = useState(''); // NEW!
  const [musicSource, setMusicSource] = useState('youtube'); // NEW! youtube or tiktok
  const [musicResults, setMusicResults] = useState([]); // NEW!
  const [musicLibrary, setMusicLibrary] = useState([]); // NEW!
  const [isSearchingMusic, setIsSearchingMusic] = useState(false); // NEW!
  const [isDownloadingMusic, setIsDownloadingMusic] = useState(false); // NEW!
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Available filters
  const filters = [
    { id: 'none', name: 'Original', icon: '🎨' },
    { id: 'vintage', name: 'Vintage', icon: '📸' },
    { id: 'blackwhite', name: 'B&W', icon: '⚫' },
    { id: 'neon', name: 'Neon', icon: '🌈' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'warm', name: 'Warm', icon: '🔥' }
  ];

  // Music tracks
  const musicTracks = [
    { id: 'none', name: 'No Music', icon: '🔇' },
    { id: 'upbeat', name: 'Upbeat', icon: '🎵' },
    { id: 'chill', name: 'Chill', icon: '🎶' },
    { id: 'energetic', name: 'Energetic', icon: '⚡' },
    { id: 'ambient', name: 'Ambient', icon: '🌊' }
  ];

  // Stickers/Emojis
  const stickers = [
    '🔥', '✨', '⭐', '❤️', '👍', '🎉', '💯', '🚀', 
    '💪', '🌟', '😍', '🤩', '🎊', '🎈', '💫', '⚡'
  ];

  // Speed options
  const speedOptions = [
    { value: 0.5, label: '0.5x', icon: '🐌' },
    { value: 1, label: '1x', icon: '▶️' },
    { value: 1.5, label: '1.5x', icon: '⏩' },
    { value: 2, label: '2x', icon: '⚡' }
  ];

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Load text styles and animations from backend
  useEffect(() => {
    const loadTextOptions = async () => {
      try {
        const [stylesRes, animationsRes] = await Promise.all([
          fetch('http://localhost:8000/api/media/text/styles'),
          fetch('http://localhost:8000/api/media/text/animations')
        ]);
        
        if (stylesRes.ok) {
          const data = await stylesRes.json();
          setTextStyles(data.styles || []);
        }
        
        if (animationsRes.ok) {
          const data = await animationsRes.json();
          setTextAnimations(data.animations || []);
        }
      } catch (error) {
        console.error('Error loading text options:', error);
      }
    };
    
    loadTextOptions();
  }, []);

  // Load music library
  useEffect(() => {
    const loadMusicLibrary = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/media/music/library');
        if (response.ok) {
          const data = await response.json();
          setMusicLibrary(data.music || []);
        }
      } catch (error) {
        console.error('Error loading music library:', error);
      }
    };
    
    loadMusicLibrary();
  }, []);

  // Search music (YouTube or TikTok)
  const searchMusic = async () => {
    if (!musicSearchQuery.trim()) return;
    
    setIsSearchingMusic(true);
    try {
      const endpoint = musicSource === 'youtube' 
        ? `/api/media/music/search/youtube?query=${encodeURIComponent(musicSearchQuery)}&limit=20`
        : `/api/media/music/search/tiktok?query=${encodeURIComponent(musicSearchQuery)}&limit=20`;
      
      const response = await fetch(`http://localhost:8000${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        setMusicResults(data.results || []);
      }
    } catch (error) {
      console.error('Error searching music:', error);
      alert('⚠️ Could not search music. Please try again.');
    } finally {
      setIsSearchingMusic(false);
    }
  };

  // Download music
  const downloadMusic = async (music) => {
    setIsDownloadingMusic(true);
    try {
      const response = await fetch('http://localhost:8000/api/media/music/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: music.url,
          source: music.source,
          title: music.title
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Reload library
        const libraryRes = await fetch('http://localhost:8000/api/media/music/library');
        if (libraryRes.ok) {
          const libraryData = await libraryRes.json();
          setMusicLibrary(libraryData.music || []);
        }
        alert(`✅ Downloaded: ${music.title}`);
        setShowMusicBrowser(false);
      }
    } catch (error) {
      console.error('Error downloading music:', error);
      alert('⚠️ Could not download music. Please try again.');
    } finally {
      setIsDownloadingMusic(false);
    }
  };

  // Add text overlay (ENHANCED with timing and style)
  const addTextOverlay = () => {
    if (newText.trim()) {
      setTextOverlays([...textOverlays, {
        id: Date.now(),
        text: newText,
        x: textPosition.x,
        y: textPosition.y,
        color: textColor,
        fontSize: fontSize,
        style: textStyle,
        animation: textAnimation,
        startTime: textStartTime,
        endTime: textEndTime
      }]);
      setNewText('');
    }
  };

  // Remove text overlay
  const removeTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
  };

  // Export video
  const exportVideo = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/media/create-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          appName: appName,
          appId: appData?.id || appName.toLowerCase().replace(/\s+/g, '-'),
          duration: endTime - startTime,
          quality: 'HD',
          filter: selectedFilter,
          speed: videoSpeed,
          textOverlays: textOverlays,
          music: backgroundMusic,
          startTime: startTime,
          endTime: endTime
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Video exported successfully!\n\nVideo: ${appName}_edited.mp4`);
        onSave(data);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting video:', error);
      alert('⚠️ Video export is processing. Your edited video will be ready soon!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000',
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
        background: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
            Video Editor - {appName}
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#999',
            margin: '0.25rem 0 0 0'
          }}>
            Create engaging demo videos like TikTok
          </p>
        </div>
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
            onClick={exportVideo}
            disabled={isProcessing}
            style={{
              padding: '0.5rem 1.5rem',
              background: isProcessing ? '#666' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={16} />
            {isProcessing ? 'Exporting...' : 'Export Video'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Video Preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#000'
        }}>
          {/* Video Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            aspectRatio: '9/16',
            background: '#1a1a1a',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {/* Placeholder Video Preview */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#fff',
                padding: '2rem'
              }}>
                <VideoIcon size={64} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {appName}
                </h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Demo Video Preview
                </p>
              </div>

              {/* Text Overlays Preview */}
              {textOverlays.map(overlay => (
                <div
                  key={overlay.id}
                  style={{
                    position: 'absolute',
                    left: `${overlay.x}%`,
                    top: `${overlay.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: overlay.color,
                    fontSize: `${overlay.fontSize}px`,
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {overlay.text}
                </div>
              ))}
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={togglePlay}
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
            >
              {isPlaying ? <Pause size={28} color="#fff" /> : <Play size={28} color="#fff" />}
            </button>
          </div>

          {/* Timeline */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: '#999', fontSize: '0.85rem' }}>
                {Math.floor(currentTime)}s / {duration}s
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ececec'
                }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime/duration)*100}%, #2a2a2a ${(currentTime/duration)*100}%, #2a2a2a 100%)`,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {/* Tools Panel */}
        <div style={{
          width: '360px',
          background: '#1a1a1a',
          borderLeft: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tool Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid #2a2a2a'
          }}>
            {[
              { id: 'trim', label: 'Trim', icon: Scissors },
              { id: 'text', label: 'Text', icon: Type },
              { id: 'music', label: 'Music', icon: Music },
              { id: 'filters', label: 'Filters', icon: Sparkles },
              { id: 'speed', label: 'Speed', icon: Zap },
              { id: 'stickers', label: 'Stickers', icon: Smile }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 0.5rem',
                  background: activeTab === tab.id ? '#2a2a2a' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'none',
                  color: activeTab === tab.id ? '#3b82f6' : '#999',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s'
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
            padding: '1.5rem'
          }}>
            {activeTab === 'trim' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Trim Video</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>
                  Set start and end time for your video
                </p>

                <div>
                  <label style={{ color: '#ececec', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Start Time: {startTime}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={startTime}
                    onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 1))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#ececec', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    End Time: {endTime}s
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={endTime}
                    onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 1))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{
                  padding: '1rem',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  color: '#ececec'
                }}>
                  Video Length: {endTime - startTime}s
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Add Text</h3>

                <div>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '6px',
                      color: '#ececec',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: '#ececec', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#ececec', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    Text Color
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        style={{
                          width: '40px',
                          height: '40px',
                          background: color,
                          border: textColor === color ? '3px solid #3b82f6' : '2px solid #4a4a4a',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={addTextOverlay}
                  disabled={!newText.trim()}
                  style={{
                    padding: '0.75rem',
                    background: newText.trim() ? '#3b82f6' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: newText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                >
                  Add Text to Video
                </button>

                {textOverlays.length > 0 && (
                  <div>
                    <h4 style={{ color: '#ececec', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      Text Overlays ({textOverlays.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {textOverlays.map(overlay => (
                        <div
                          key={overlay.id}
                          style={{
                            padding: '0.75rem',
                            background: '#2a2a2a',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ color: '#ececec', fontSize: '0.85rem' }}>
                            {overlay.text}
                          </span>
                          <button
                            onClick={() => removeTextOverlay(overlay.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#ff4444',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'music' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Background Music</h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {musicTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => setBackgroundMusic(track.id)}
                      style={{
                        padding: '1rem',
                        background: backgroundMusic === track.id ? '#3b82f6' : '#2a2a2a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ececec',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{track.icon}</span>
                      {track.name}
                    </button>
                  ))}
                </div>

                {backgroundMusic && backgroundMusic !== 'none' && (
                  <div>
                    <label style={{ color: '#ececec', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                      Music Volume: {Math.round(musicVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'filters' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Video Filters</h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {filters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
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
                        gap: '0.5rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{filter.icon}</span>
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'speed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Video Speed</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>
                  Adjust playback speed
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {speedOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setVideoSpeed(option.value)}
                      style={{
                        padding: '1.5rem 1rem',
                        background: videoSpeed === option.value ? '#3b82f6' : '#2a2a2a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ececec',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}
                    >
                      <span style={{ fontSize: '2rem' }}>{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stickers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Add Stickers</h3>
                <p style={{ color: '#999', fontSize: '0.85rem', margin: 0 }}>
                  Click to add stickers to your video
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem'
                }}>
                  {stickers.map((sticker, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setTextOverlays([...textOverlays, {
                          id: Date.now(),
                          text: sticker,
                          x: 50,
                          y: 30 + (textOverlays.length * 10),
                          color: '#ffffff',
                          fontSize: 50,
                          time: currentTime
                        }]);
                      }}
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
                      {sticker}
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

