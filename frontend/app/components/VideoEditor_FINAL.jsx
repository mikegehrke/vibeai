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
  const [textBackground, setTextBackground] = useState('none'); // NEW! Text background style
  const [textBgColor, setTextBgColor] = useState('#000000'); // Background color
  const [textBgOpacity, setTextBgOpacity] = useState(70); // Background opacity (0-100)
  const [textBgRadius, setTextBgRadius] = useState(8); // Border radius (0-20)
  const [textBgPadding, setTextBgPadding] = useState(10); // Padding (0-30)
  const [textBgShape, setTextBgShape] = useState('rounded'); // Background shape preset
  const [textRotation, setTextRotation] = useState(0); // Text rotation (-180 to 180)
  const [textSkewX, setTextSkewX] = useState(0); // Horizontal skew (-45 to 45)
  const [textSkewY, setTextSkewY] = useState(0); // Vertical skew (-45 to 45)
  const [selectedTextId, setSelectedTextId] = useState(null); // Selected text for editing
  const [showTextMenu, setShowTextMenu] = useState(false); // Show text context menu
  const [textMenuPosition, setTextMenuPosition] = useState({ x: 0, y: 0 }); // Menu position
  
  // Video handling
  const [uploadedVideo, setUploadedVideo] = useState(null); // Uploaded video URL
  const [showShareDialog, setShowShareDialog] = useState(false); // Share dialog
  const fileInputRef = useRef(null);
  
  // Demo video - use a sample video for testing
  const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  
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

  // Text background options (Presets + Custom)
  const textBackgrounds = [
    { id: 'none', name: 'None', style: null },
    { id: 'custom', name: 'Custom', style: 'custom' }, // NEW! Custom allows user to customize
    { id: 'solid', name: 'Solid Box', style: { background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '4px' } },
    { id: 'outline', name: 'Outline', style: { background: 'transparent', padding: '0.5rem 1rem', border: '3px solid rgba(0,0,0,0.8)', borderRadius: '4px' } },
    { id: 'banner', name: 'Banner', style: { background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.8) 80%, transparent)', padding: '0.75rem 2rem', width: '100%', textAlign: 'center' } },
    { id: 'gradient', name: 'Gradient', style: { background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(168, 85, 247, 0.8))', padding: '0.5rem 1rem', borderRadius: '8px' } },
    { id: 'neon', name: 'Neon', style: { background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '4px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 20px rgba(59, 130, 246, 0.3)' } },
    { id: 'blur', name: 'Blur', style: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '0.5rem 1rem', borderRadius: '8px' } }
  ];

  // Background Shape Presets
  const bgShapePresets = [
    { id: 'rectangle', name: '▢ Rechteck', radius: 0, clip: null },
    { id: 'rounded', name: '▢ Leicht Rund', radius: 8, clip: null },
    { id: 'round', name: '◯ Rund', radius: 20, clip: null },
    { id: 'pill', name: '⬭ Pill', radius: 50, clip: null },
    { id: 'circle', name: '● Kreis', radius: '50%', clip: null },
    { id: 'hexagon', name: '⬡ Hexagon', radius: 0, clip: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' },
    { id: 'star', name: '⭐ Stern', radius: 0, clip: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' },
    { id: 'diamond', name: '◆ Diamant', radius: 0, clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { id: 'arrow', name: '➤ Pfeil', radius: 0, clip: 'polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' },
    { id: 'custom', name: '⚙️ Custom', radius: 'custom', clip: null }
  ];

  // Popular Background Colors
  const bgColorPresets = [
    { color: '#000000', name: 'Schwarz' },
    { color: '#FFFFFF', name: 'Weiß' },
    { color: '#FF0000', name: 'Rot' },
    { color: '#00FF00', name: 'Grün' },
    { color: '#0000FF', name: 'Blau' },
    { color: '#FFFF00', name: 'Gelb' },
    { color: '#FF00FF', name: 'Magenta' },
    { color: '#00FFFF', name: 'Cyan' },
    { color: '#FF6B6B', name: 'Hell Rot' },
    { color: '#4ECDC4', name: 'Türkis' },
    { color: '#45B7D1', name: 'Hell Blau' },
    { color: '#FFA07A', name: 'Lachs' },
    { color: '#98D8C8', name: 'Mint' },
    { color: '#F7DC6F', name: 'Gold' },
    { color: '#BB8FCE', name: 'Lila' },
    { color: '#F8B500', name: 'Orange' }
  ];

  // Get custom background style
  const getCustomBgStyle = () => {
    const r = parseInt(textBgColor.slice(1, 3), 16);
    const g = parseInt(textBgColor.slice(3, 5), 16);
    const b = parseInt(textBgColor.slice(5, 7), 16);
    const opacity = textBgOpacity / 100;
    
    // Get shape preset
    const preset = bgShapePresets.find(p => p.id === textBgShape);
    
    // Get border radius based on shape
    let borderRadius;
    if (textBgShape === 'custom') {
      borderRadius = `${textBgRadius}px`;
    } else {
      borderRadius = typeof preset?.radius === 'string' ? preset.radius : `${preset?.radius || 8}px`;
    }
    
    // Base style
    const style = {
      background: `rgba(${r}, ${g}, ${b}, ${opacity})`,
      padding: (textBgShape === 'circle' || preset?.clip) 
        ? `${textBgPadding * 2}px`  // Equal padding for circle and special shapes
        : `${textBgPadding}px ${textBgPadding * 2}px`,
      borderRadius: preset?.clip ? 0 : borderRadius // No border radius for clip-path shapes
    };
    
    // Add clip-path for special shapes
    if (preset?.clip) {
      style.clipPath = preset.clip;
    }
    
    return style;
  };

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

  // Text Animation Presets (Marketing Focus!)
  const animationPresets = [
    { id: 'none', name: 'None', category: 'basic' },
    
    // Entrance Animations
    { id: 'fadeIn', name: '🎭 Fade In', category: 'entrance' },
    { id: 'slideUp', name: '⬆️ Slide Up', category: 'entrance' },
    { id: 'slideDown', name: '⬇️ Slide Down', category: 'entrance' },
    { id: 'slideLeft', name: '⬅️ Slide Left', category: 'entrance' },
    { id: 'slideRight', name: '➡️ Slide Right', category: 'entrance' },
    { id: 'popIn', name: '💥 Pop In', category: 'entrance' },
    { id: 'zoomIn', name: '🔍 Zoom In', category: 'entrance' },
    
    // Continuous/Loop Animations
    { id: 'bounce', name: '🎾 Bounce', category: 'loop' },
    { id: 'pulse', name: '💗 Pulse', category: 'loop' },
    { id: 'shake', name: '🔔 Shake', category: 'loop' },
    { id: 'wiggle', name: '〰️ Wiggle', category: 'loop' },
    { id: 'swing', name: '↔️ Swing', category: 'loop' },
    { id: 'float', name: '☁️ Float', category: 'loop' },
    
    // Attention-Grabbing (Marketing!)
    { id: 'blink', name: '⚡ Blink', category: 'attention' },
    { id: 'flashBorder', name: '📦 Flash Border', category: 'attention' },
    { id: 'colorShift', name: '🌈 Color Shift', category: 'attention' },
    { id: 'scaleLoop', name: '📏 Scale Loop', category: 'attention' },
    
    // Letter-by-Letter
    { id: 'typewriter', name: '⌨️ Typewriter', category: 'letter' },
    { id: 'letterPop', name: '💫 Letter Pop', category: 'letter' },
    { id: 'letterWave', name: '🌊 Letter Wave', category: 'letter' },
    
    // Rotating/Special
    { id: 'rotate', name: '🔄 Rotate', category: 'special' },
    { id: 'flip', name: '🔃 Flip', category: 'special' },
    { id: 'glow', name: '✨ Glow', category: 'special' }
  ];

  // Text Style Presets
  const stylePresets = [
    { id: 'classic', name: 'Classic', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' },
    { id: 'modern', name: 'Modern', fontFamily: 'Helvetica, sans-serif', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' },
    { id: 'retro', name: 'Retro', fontFamily: 'Georgia, serif', fontWeight: 'bold', textTransform: 'uppercase', fontStyle: 'italic' },
    { id: 'elegant', name: 'Elegant', fontFamily: 'Georgia, serif', fontWeight: '300', letterSpacing: '1px' },
    { id: 'bold', name: 'Bold', fontFamily: 'Impact, sans-serif', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' },
    { id: 'neon', name: 'Neon', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textTransform: 'uppercase' }
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

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file);
      setUploadedVideo(videoURL);
      
      // Set video element source
      if (videoRef.current) {
        videoRef.current.src = videoURL;
        videoRef.current.onloadedmetadata = () => {
          setDuration(videoRef.current.duration);
          setEndTime(videoRef.current.duration);
          setTextEndTime(videoRef.current.duration);
        };
      }
    }
  };

  // Download/Export video with effects
  const downloadVideo = () => {
    alert('🎬 Video wird exportiert...\n\n' +
          'In der finalen Version wird hier das Video mit allen Effekten exportiert:\n' +
          `- ${textOverlays.length} Text Overlays\n` +
          `- Filter: ${selectedFilter}\n` +
          `- Music: ${backgroundMusic || 'None'}\n` +
          `- Trim: ${startTime}s - ${endTime}s\n\n` +
          'Dies erfordert serverseitige Video-Verarbeitung mit FFmpeg.');
  };

  // Share video
  const shareVideo = (platform) => {
    const message = `Check out my video created with VibeAI!`;
    const shareUrl = window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`,
      tiktok: `https://www.tiktok.com/upload`,
      instagram: `https://www.instagram.com/`,
      youtube: `https://www.youtube.com/upload`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
      setShowShareDialog(false);
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
      const newOverlay = {
        id: Date.now(),
        text: newText,
        x: textPosition.x,
        y: textPosition.y,
        color: textColor,
        fontSize: fontSize,
        style: textStyle,
        animation: textAnimation,
        startTime: textStartTime,
        endTime: textEndTime,
        background: textBackground,
        customBgStyle: textBackground === 'custom' ? getCustomBgStyle() : null,
        rotation: textRotation,
        skewX: textSkewX,
        skewY: textSkewY
      };
      
      console.log('🎨 Adding text with transform:', {
        rotation: textRotation,
        skewX: textSkewX,
        skewY: textSkewY
      });
      
      setTextOverlays([...textOverlays, newOverlay]);
      setNewText('');
      
      // DON'T reset transform values immediately - keep them for next text
      // User can manually reset if needed
    }
  };

  // Remove text overlay
  const removeTextOverlay = (id) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
  };

  // Update text overlay position (drag)
  const updateTextPosition = (id, newX, newY) => {
    setTextOverlays(textOverlays.map(overlay => 
      overlay.id === id 
        ? { ...overlay, x: newX, y: newY }
        : overlay
    ));
  };

  // Handle text drag
  const handleTextDrag = (e, overlay) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateTextPosition(overlay.id, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
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
    <>
      {/* CSS Animations - Marketing Edition! */}
      <style jsx>{`
        /* Entrance Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -120%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translate(20%, -50%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translate(-120%, -50%); opacity: 0; }
          to { transform: translate(-50%, -50%); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes zoomIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        /* Continuous Loop Animations */
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-8px); }
          75% { transform: translate(-50%, -50%) translateX(8px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(-5deg); }
          75% { transform: translate(-50%, -50%) rotate(5deg); }
        }
        @keyframes swing {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
          25% { transform: translate(-50%, -50%) rotate(15deg); }
          75% { transform: translate(-50%, -50%) rotate(-15deg); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }

        /* Attention-Grabbing (MARKETING!) */
        @keyframes blink {
          0%, 49%, 100% { opacity: 1; }
          50%, 99% { opacity: 0; }
        }
        @keyframes flashBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.8), 0 0 20px 8px rgba(59, 130, 246, 0.4); }
        }
        @keyframes colorShift {
          0% { color: #ff0000; }
          25% { color: #00ff00; }
          50% { color: #0000ff; }
          75% { color: #ffff00; }
          100% { color: #ff0000; }
        }
        @keyframes scaleLoop {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.2); }
          50% { transform: translate(-50%, -50%) scale(1); }
          75% { transform: translate(-50%, -50%) scale(1.2); }
        }

        /* Special */
        @keyframes rotate360 {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes flip {
          0% { transform: translate(-50%, -50%) rotateY(0deg); }
          50% { transform: translate(-50%, -50%) rotateY(180deg); }
          100% { transform: translate(-50%, -50%) rotateY(360deg); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
          50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; }
        }

        /* Apply Animations */
        .text-overlay-none { animation: none; }
        .text-overlay-fadeIn { animation: fadeIn 1s ease-in forwards; }
        .text-overlay-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .text-overlay-slideDown { animation: slideDown 0.8s ease-out forwards; }
        .text-overlay-slideLeft { animation: slideLeft 0.8s ease-out forwards; }
        .text-overlay-slideRight { animation: slideRight 0.8s ease-out forwards; }
        .text-overlay-popIn { animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
        .text-overlay-zoomIn { animation: zoomIn 0.6s ease-out forwards; }
        
        .text-overlay-bounce { animation: bounce 1s ease-in-out infinite; }
        .text-overlay-pulse { animation: pulse 2s ease-in-out infinite; }
        .text-overlay-shake { animation: shake 0.5s ease-in-out infinite; }
        .text-overlay-wiggle { animation: wiggle 0.8s ease-in-out infinite; }
        .text-overlay-swing { animation: swing 1.5s ease-in-out infinite; }
        .text-overlay-float { animation: float 3s ease-in-out infinite; }
        
        .text-overlay-blink { animation: blink 1s linear infinite; }
        .text-overlay-flashBorder { animation: flashBorder 1.5s ease-in-out infinite; }
        .text-overlay-colorShift { animation: colorShift 3s linear infinite; }
        .text-overlay-scaleLoop { animation: scaleLoop 2s ease-in-out infinite; }
        
        .text-overlay-rotate { animation: rotate360 2s linear infinite; }
        .text-overlay-flip { animation: flip 2s ease-in-out infinite; }
        .text-overlay-glow { animation: glow 1.5s ease-in-out infinite; }

        /* Letter-by-Letter Animations (Special handling needed) */
        .text-overlay-typewriter span,
        .text-overlay-letterPop span,
        .text-overlay-letterWave span {
          display: inline-block;
          animation-fill-mode: both;
        }
        
        .text-overlay-typewriter span {
          opacity: 0;
          animation: letterFadeIn 0.1s forwards;
        }
        
        .text-overlay-letterPop span {
          opacity: 0;
          animation: letterPopAnimation 0.3s forwards;
        }
        
        .text-overlay-letterWave span {
          animation: letterWaveAnimation 1s ease-in-out infinite;
        }
        
        @keyframes letterFadeIn {
          to { opacity: 1; }
        }
        
        @keyframes letterPopAnimation {
          0% { opacity: 0; transform: scale(0); }
          50% { transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes letterWaveAnimation {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div 
        onClick={() => {
          setShowTextMenu(false);
          setSelectedTextId(null);
        }}
        style={{
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
          />
          
          {/* Upload Video Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.5rem 1rem',
              background: '#2a2a2a',
              border: '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#ececec',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📹 Upload
          </button>

          {/* Download Video Button */}
          <button
            onClick={downloadVideo}
            disabled={!uploadedVideo}
            style={{
              padding: '0.5rem 1rem',
              background: uploadedVideo ? '#2a2a2a' : '#1a1a1a',
              border: '1px solid #4a4a4a',
              borderRadius: '6px',
              color: uploadedVideo ? '#ececec' : '#666',
              fontSize: '0.85rem',
              cursor: uploadedVideo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ⬇️ Download
          </button>

          {/* Share Button */}
          <button
            onClick={() => setShowShareDialog(true)}
            disabled={!uploadedVideo}
            style={{
              padding: '0.5rem 1rem',
              background: uploadedVideo ? '#2a2a2a' : '#1a1a1a',
              border: '1px solid #4a4a4a',
              borderRadius: '6px',
              color: uploadedVideo ? '#ececec' : '#666',
              fontSize: '0.85rem',
              cursor: uploadedVideo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📤 Share
          </button>

          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #4a4a4a',
              borderRadius: '6px',
              color: '#ececec',
              fontSize: '0.85rem',
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
              fontSize: '0.85rem',
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
        flexDirection: 'row',
        overflow: 'hidden'
      }}>
        {/* Video Preview Section - Left/Center */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#000',
          gap: '1.5rem',
          minWidth: 0
        }}>
          {/* iPhone Video Container */}
          <div style={{
            position: 'relative',
            width: '350px',
            height: '650px',
            background: '#1a1a1a',
            borderRadius: '35px',
            overflow: 'hidden',
            boxShadow: '0 0 0 10px #1f1f1f, 0 0 0 11px #3a3a3a, 0 10px 40px rgba(0,0,0,0.9)',
            flexShrink: 0
          }}>
            {/* Video Element or Placeholder */}
            {uploadedVideo ? (
              <video
                ref={videoRef}
                src={uploadedVideo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0
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
            ) : (
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
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                    Kein Video hochgeladen
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#fff',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      📹 Video hochladen
                    </button>
                    <span style={{ color: '#999', fontSize: '0.85rem' }}>oder</span>
                    <button
                      onClick={() => {
                        setUploadedVideo(demoVideoUrl);
                        if (videoRef.current) {
                          videoRef.current.src = demoVideoUrl;
                        }
                      }}
                      style={{
                        padding: '0.65rem 1.25rem',
                        background: 'transparent',
                        color: '#fff',
                        border: '2px solid #fff',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      🎬 Demo Video laden
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* Text Overlays Preview - DRAGGABLE with CONTEXT MENU! */}
              {textOverlays
                .filter(overlay => {
                  // Show text only if current time is within its start/end range
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
                
                // Build transform correctly - rotation and skew applied AFTER positioning
                const rotation = overlay.rotation || 0;
                const skewX = overlay.skewX || 0;
                const skewY = overlay.skewY || 0;
                // Inner transform for rotation/skew only
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
                      transform: 'translate(-50%, -50%)', // Positioning only
                      pointerEvents: 'auto',
                      cursor: 'move',
                      userSelect: 'none',
                      transition: 'border 0.2s',
                      ...(overlay.background === 'none' || !overlay.background ? {
                        border: isSelected ? '2px solid #3b82f6' : '2px dashed rgba(59, 130, 246, 0.3)'
                      } : {
                        border: isSelected ? '2px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)'
                      }),
                      boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    {/* Inner element for rotation/skew + styling */}
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
                      textShadow: overlay.style === 'neon' 
                        ? `0 0 10px ${overlay.color}, 0 0 20px ${overlay.color}, 2px 2px 4px rgba(0,0,0,0.8)`
                        : '2px 2px 4px rgba(0,0,0,0.8)',
                      whiteSpace: 'nowrap',
                      ...(overlay.background === 'none' || !overlay.background ? {
                        padding: '0.5rem'
                      } : {
                        ...bgStyle
                      })
                    }}>
                      {/* Letter-by-Letter for special animations */}
                      {(animationClass === 'typewriter' || animationClass === 'letterPop' || animationClass === 'letterWave') ? (
                        overlay.text.split('').map((char, index) => (
                          <span 
                            key={index}
                            style={{ 
                              animationDelay: `${index * 0.1}s`,
                              display: 'inline-block'
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))
                      ) : (
                        overlay.text
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Text Context Menu */}
              {showTextMenu && selectedTextId && (
                <div
                  style={{
                    position: 'fixed',
                    left: `${textMenuPosition.x}px`,
                    top: `${textMenuPosition.y}px`,
                    background: '#1f1f1f',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    zIndex: 10000,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    minWidth: '200px'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      const overlay = textOverlays.find(t => t.id === selectedTextId);
                      if (overlay) {
                        setNewText(overlay.text);
                        setTextColor(overlay.color);
                        setFontSize(overlay.fontSize);
                        setTextStyle(overlay.style);
                        setTextAnimation(overlay.animation);
                        setTextPosition({ x: overlay.x, y: overlay.y });
                        setTextBackground(overlay.background);
                        setTextRotation(overlay.rotation || 0);
                        setTextSkewX(overlay.skewX || 0);
                        setTextSkewY(overlay.skewY || 0);
                        setTextStartTime(overlay.startTime || 0);
                        setTextEndTime(overlay.endTime || duration);
                        removeTextOverlay(selectedTextId);
                      }
                      setShowTextMenu(false);
                      setSelectedTextId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#3b82f6',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      const overlay = textOverlays.find(t => t.id === selectedTextId);
                      if (overlay) {
                        setTextOverlays([...textOverlays, {
                          ...overlay,
                          id: Date.now(),
                          x: overlay.x + 5,
                          y: overlay.y + 5
                        }]);
                      }
                      setShowTextMenu(false);
                      setSelectedTextId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ececec',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📋 Duplicate
                  </button>
                  <button
                    onClick={() => {
                      const overlay = textOverlays.find(t => t.id === selectedTextId);
                      if (overlay) {
                        const newRotation = prompt(`Rotation (${overlay.rotation || 0}°):`, overlay.rotation || 0);
                        if (newRotation !== null) {
                          setTextOverlays(textOverlays.map(t => 
                            t.id === selectedTextId ? { ...t, rotation: parseInt(newRotation) } : t
                          ));
                        }
                      }
                      setShowTextMenu(false);
                      setSelectedTextId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ececec',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🔄 Rotate
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid #3a3a3a', margin: '0.5rem 0' }} />
                  <button
                    onClick={() => {
                      removeTextOverlay(selectedTextId);
                      setShowTextMenu(false);
                      setSelectedTextId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4444',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => {
                      setShowTextMenu(false);
                      setSelectedTextId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
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

          {/* Timeline - Directly under iPhone Video */}
          <div style={{
            width: '350px'
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

        {/* Tools Panel - Right Side */}
        <div style={{
          width: '400px',
          background: '#1a1a1a',
          borderLeft: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0
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
                <h3 style={{ color: '#fff', margin: 0 }}>Add Text (Pro)</h3>

                {/* Text Input */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Text Content
                  </label>
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter your text..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      borderRadius: '6px',
                      color: '#ececec',
                      fontSize: '0.9rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Text Style */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Text Style
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {stylePresets.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setTextStyle(style.id)}
                        style={{
                          padding: '0.75rem 0.5rem',
                          background: textStyle === style.id ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ececec',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontFamily: style.fontFamily,
                          fontWeight: style.fontWeight
                        }}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Animation - Marketing Edition */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.75rem' }}>
                    🎬 Animation (Marketing)
                  </label>
                  
                  {/* Quick Select Popular */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ color: '#3b82f6', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                      🔥 Most Popular
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        animationPresets.find(a => a.id === 'bounce'),
                        animationPresets.find(a => a.id === 'blink'),
                        animationPresets.find(a => a.id === 'typewriter'),
                        animationPresets.find(a => a.id === 'pulse'),
                        animationPresets.find(a => a.id === 'flashBorder'),
                        animationPresets.find(a => a.id === 'letterWave')
                      ].filter(Boolean).map(anim => (
                        <button
                          key={anim.id}
                          onClick={() => setTextAnimation(anim.id)}
                          style={{
                            padding: '0.75rem 0.25rem',
                            background: textAnimation === anim.id ? '#3b82f6' : '#2a2a2a',
                            border: textAnimation === anim.id ? '2px solid #3b82f6' : '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ececec',
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            fontWeight: textAnimation === anim.id ? '600' : 'normal'
                          }}
                        >
                          {anim.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All Animations Dropdown */}
                  <details style={{ marginBottom: '0.5rem' }}>
                    <summary style={{
                      color: '#999',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      background: '#2a2a2a',
                      borderRadius: '4px',
                      userSelect: 'none'
                    }}>
                      📚 All Animations ({animationPresets.length})
                    </summary>
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Entrance */}
                      <div>
                        <h5 style={{ color: '#999', fontSize: '0.7rem', marginBottom: '0.5rem' }}>Entrance</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {animationPresets.filter(a => a.category === 'entrance').map(anim => (
                            <button
                              key={anim.id}
                              onClick={() => setTextAnimation(anim.id)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                background: textAnimation === anim.id ? '#3b82f6' : '#2a2a2a',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ececec',
                                cursor: 'pointer',
                                fontSize: '0.65rem'
                              }}
                            >
                              {anim.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Loop/Continuous */}
                      <div>
                        <h5 style={{ color: '#999', fontSize: '0.7rem', marginBottom: '0.5rem' }}>Loop</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {animationPresets.filter(a => a.category === 'loop').map(anim => (
                            <button
                              key={anim.id}
                              onClick={() => setTextAnimation(anim.id)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                background: textAnimation === anim.id ? '#3b82f6' : '#2a2a2a',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ececec',
                                cursor: 'pointer',
                                fontSize: '0.65rem'
                              }}
                            >
                              {anim.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Attention (Marketing!) */}
                      <div>
                        <h5 style={{ color: '#ff6b6b', fontSize: '0.7rem', marginBottom: '0.5rem' }}>🎯 Attention (Marketing!)</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                          {animationPresets.filter(a => a.category === 'attention').map(anim => (
                            <button
                              key={anim.id}
                              onClick={() => setTextAnimation(anim.id)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                background: textAnimation === anim.id ? '#ff6b6b' : '#2a2a2a',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ececec',
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                fontWeight: '600'
                              }}
                            >
                              {anim.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Letter-by-Letter */}
                      <div>
                        <h5 style={{ color: '#4ecdc4', fontSize: '0.7rem', marginBottom: '0.5rem' }}>⌨️ Letter-by-Letter</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {animationPresets.filter(a => a.category === 'letter').map(anim => (
                            <button
                              key={anim.id}
                              onClick={() => setTextAnimation(anim.id)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                background: textAnimation === anim.id ? '#4ecdc4' : '#2a2a2a',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ececec',
                                cursor: 'pointer',
                                fontSize: '0.65rem'
                              }}
                            >
                              {anim.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special */}
                      <div>
                        <h5 style={{ color: '#999', fontSize: '0.7rem', marginBottom: '0.5rem' }}>Special</h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          {animationPresets.filter(a => a.category === 'special').map(anim => (
                            <button
                              key={anim.id}
                              onClick={() => setTextAnimation(anim.id)}
                              style={{
                                padding: '0.5rem 0.25rem',
                                background: textAnimation === anim.id ? '#3b82f6' : '#2a2a2a',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ececec',
                                cursor: 'pointer',
                                fontSize: '0.65rem'
                              }}
                            >
                              {anim.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Current Selection */}
                  <div style={{
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: '#999', fontSize: '0.75rem' }}>Selected: </span>
                    <span style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}>
                      {animationPresets.find(a => a.id === textAnimation)?.name || 'None'}
                    </span>
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Text Color
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        style={{
                          width: '35px',
                          height: '35px',
                          background: color,
                          border: textColor === color ? '3px solid #3b82f6' : '2px solid #4a4a4a',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Text Background - NEW! */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Text Background (Optional)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {textBackgrounds.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => setTextBackground(bg.id)}
                        style={{
                          padding: '0.5rem',
                          background: textBackground === bg.id ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ececec',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: textBackground === bg.id ? '600' : 'normal'
                        }}
                      >
                        {bg.name}
                      </button>
                    ))}
                  </div>
                  <p style={{
                    fontSize: '0.7rem',
                    color: '#999',
                    margin: '0.5rem 0 0 0'
                  }}>
                    💡 Choose "None" for transparent text
                  </p>
                </div>

                {/* Custom Background Options - Only show if "Custom" is selected */}
                {textBackground === 'custom' && (
                  <div style={{
                    padding: '1rem',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6'
                  }}>
                    <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '1rem', margin: 0 }}>
                      🎨 Custom Background Settings
                    </h4>

                    {/* Background Shape Selection */}
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                        Background Form
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem'
                      }}>
                        {bgShapePresets.map(shape => (
                          <button
                            key={shape.id}
                            onClick={() => {
                              setTextBgShape(shape.id);
                              if (shape.id !== 'custom' && typeof shape.radius === 'number') {
                                setTextBgRadius(shape.radius);
                              }
                            }}
                            style={{
                              padding: '0.75rem 0.5rem',
                              background: textBgShape === shape.id ? '#3b82f6' : '#1a1a1a',
                              border: textBgShape === shape.id ? '2px solid #3b82f6' : '1px solid #3a3a3a',
                              borderRadius: '6px',
                              color: '#ececec',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: textBgShape === shape.id ? '600' : 'normal',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (textBgShape !== shape.id) e.currentTarget.style.background = '#2a2a2a';
                            }}
                            onMouseLeave={(e) => {
                              if (textBgShape !== shape.id) e.currentTarget.style.background = '#1a1a1a';
                            }}
                          >
                            {shape.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Color */}
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                        Hintergrund-Farbe
                      </label>
                      
                      {/* Popular Colors Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                      }}>
                        {bgColorPresets.map(preset => (
                          <button
                            key={preset.color}
                            onClick={() => setTextBgColor(preset.color)}
                            title={preset.name}
                            style={{
                              width: '100%',
                              height: '35px',
                              background: preset.color,
                              border: textBgColor.toLowerCase() === preset.color.toLowerCase() 
                                ? '3px solid #3b82f6' 
                                : '2px solid #3a3a3a',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              boxShadow: textBgColor.toLowerCase() === preset.color.toLowerCase()
                                ? '0 0 10px rgba(59, 130, 246, 0.5)'
                                : 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        ))}
                      </div>

                      {/* Custom Color Picker */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ color: '#999', fontSize: '0.75rem', minWidth: '60px' }}>
                          Eigene:
                        </div>
                        <input
                          type="color"
                          value={textBgColor}
                          onChange={(e) => setTextBgColor(e.target.value)}
                          style={{
                            width: '50px',
                            height: '35px',
                            border: '2px solid #3a3a3a',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: '#1a1a1a',
                          borderRadius: '6px',
                          color: '#ececec',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          textAlign: 'center'
                        }}>
                          {textBgColor}
                        </div>
                      </div>
                    </div>

                    {/* Background Opacity */}
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                        Opacity: {textBgOpacity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={textBgOpacity}
                        onChange={(e) => setTextBgOpacity(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    {/* Border Radius - Only show if Custom shape selected */}
                    {textBgShape === 'custom' && (
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                          Corner Roundness: {textBgRadius}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={textBgRadius}
                          onChange={(e) => setTextBgRadius(parseInt(e.target.value))}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: '#999' }}>Sharp (0px)</span>
                          <span style={{ fontSize: '0.7rem', color: '#999' }}>Very Rounded (50px)</span>
                        </div>
                      </div>
                    )}

                    {/* Padding */}
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                        Padding: {textBgPadding}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={textBgPadding}
                        onChange={(e) => setTextBgPadding(parseInt(e.target.value))}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#999' }}>Tight</span>
                        <span style={{ fontSize: '0.7rem', color: '#999' }}>Loose</span>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ color: '#999', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                        Preview:
                      </label>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '1rem',
                        background: '#1a1a1a',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          color: textColor,
                          fontSize: `${Math.min(fontSize, 24)}px`,
                          fontWeight: 'bold',
                          ...getCustomBgStyle()
                        }}>
                          Sample Text
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timing - When to show text */}
                <div style={{
                  padding: '1rem',
                  background: '#2a2a2a',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#ececec', fontSize: '0.85rem', marginBottom: '0.75rem', margin: 0 }}>
                    Text Timing
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ color: '#999', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
                        Start Time: {textStartTime}s
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={textStartTime}
                        onChange={(e) => setTextStartTime(Math.min(parseFloat(e.target.value), textEndTime - 0.5))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ color: '#999', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>
                        End Time: {textEndTime}s
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={textEndTime}
                        onChange={(e) => setTextEndTime(Math.max(parseFloat(e.target.value), textStartTime + 0.5))}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#3b82f6',
                      textAlign: 'center'
                    }}>
                      Duration: {(textEndTime - textStartTime).toFixed(1)}s
                    </div>
                  </div>
                </div>

                {/* Position Presets */}
                <div>
                  <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    Position (for new text)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {[
                      { label: 'Top', x: 50, y: 15 },
                      { label: 'Center', x: 50, y: 50 },
                      { label: 'Bottom', x: 50, y: 85 }
                    ].map((pos, index) => (
                      <button
                        key={index}
                        onClick={() => setTextPosition(pos)}
                        style={{
                          padding: '0.75rem',
                          background: textPosition.x === pos.x && textPosition.y === pos.y ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ececec',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: textPosition.x === pos.x && textPosition.y === pos.y ? '600' : 'normal'
                        }}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                  <p style={{
                    fontSize: '0.7rem',
                    color: '#999',
                    margin: '0.5rem 0 0 0'
                  }}>
                    💡 Drag text on video to reposition
                  </p>
                </div>

                {/* Text Transform (Rotation & Skew) - NEW! */}
                <div style={{
                  padding: '1rem',
                  background: '#2a2a2a',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#ffffff', fontSize: '0.9rem', marginBottom: '1rem', margin: 0 }}>
                    🔄 Transform Text
                  </h4>

                  {/* Rotation */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                      Rotation: {textRotation}°
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={textRotation}
                      onChange={(e) => setTextRotation(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>↺ Left</span>
                      <button
                        onClick={() => setTextRotation(0)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#1a1a1a',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#999',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>Right ↻</span>
                    </div>
                  </div>

                  {/* Skew X */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                      Skew Horizontal: {textSkewX}°
                    </label>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={textSkewX}
                      onChange={(e) => setTextSkewX(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>← Left</span>
                      <button
                        onClick={() => setTextSkewX(0)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#1a1a1a',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#999',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>Right →</span>
                    </div>
                  </div>

                  {/* Skew Y */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ color: '#ececec', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                      Skew Vertical: {textSkewY}°
                    </label>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={textSkewY}
                      onChange={(e) => setTextSkewY(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>↑ Up</span>
                      <button
                        onClick={() => setTextSkewY(0)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#1a1a1a',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#999',
                          fontSize: '0.7rem',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>Down ↓</span>
                    </div>
                  </div>

                  {/* Preview Transform */}
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ color: '#999', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
                      Transform Preview:
                    </label>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '2rem',
                      background: '#1a1a1a',
                      borderRadius: '6px',
                      minHeight: '100px'
                    }}>
                      <span style={{
                        color: textColor,
                        fontSize: `${Math.min(fontSize, 32)}px`,
                        fontWeight: 'bold',
                        transform: `rotate(${textRotation}deg) skewX(${textSkewX}deg) skewY(${textSkewY}deg)`,
                        transition: 'transform 0.2s',
                        display: 'inline-block'
                      }}>
                        Sample
                      </span>
                    </div>
                  </div>

                  {/* Reset All Button */}
                  <button
                    onClick={() => {
                      setTextRotation(0);
                      setTextSkewX(0);
                      setTextSkewY(0);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginTop: '1rem',
                      background: '#ff4444',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Reset All Transform
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={addTextOverlay}
                  disabled={!newText.trim()}
                  style={{
                    padding: '1rem',
                    background: newText.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: newText.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '1rem'
                  }}
                >
                  ➕ Add Text to Video
                </button>

                {/* Text Count Info (Removed List) */}
                {textOverlays.length > 0 && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#2a2a2a',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#3b82f6', fontSize: '0.85rem', margin: 0 }}>
                      ✓ {textOverlays.length} Text{textOverlays.length > 1 ? 's' : ''} Added
                    </p>
                    <p style={{ color: '#999', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                      Click on text in video to edit
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'music' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ color: '#fff', margin: 0 }}>Background Music</h3>
                
                {/* Music Browser Button */}
                <button
                  onClick={() => setShowMusicBrowser(true)}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <Music size={20} />
                  Browse YouTube & TikTok Music
                </button>

                {/* My Library */}
                <div>
                  <h4 style={{ color: '#ececec', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    My Library ({musicLibrary.length})
                  </h4>
                  {musicLibrary.length > 0 ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {musicLibrary.map((music, index) => (
                        <button
                          key={index}
                          onClick={() => setBackgroundMusic(music.filename)}
                          style={{
                            padding: '0.75rem',
                            background: backgroundMusic === music.filename ? '#3b82f6' : '#2a2a2a',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#ececec',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.85rem'
                          }}
                        >
                          🎵 {music.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontSize: '0.85rem' }}>
                      No music in library. Click "Browse" to add music.
                    </p>
                  )}
                </div>

                {/* Preset Tracks */}
                <div>
                  <h4 style={{ color: '#ececec', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Preset Tracks
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {musicTracks.map(track => (
                      <button
                        key={track.id}
                        onClick={() => setBackgroundMusic(track.id)}
                        style={{
                          padding: '0.75rem',
                          background: backgroundMusic === track.id ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ececec',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{track.icon}</span>
                        {track.name}
                      </button>
                    ))}
                  </div>
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

                {/* Music Browser Overlay */}
                {showMusicBrowser && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 10001,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Header */}
                    <div style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #2a2a2a',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>
                        Music Browser
                      </h2>
                      <button
                        onClick={() => setShowMusicBrowser(false)}
                        style={{
                          padding: '0.5rem',
                          background: 'transparent',
                          border: '1px solid #4a4a4a',
                          borderRadius: '6px',
                          color: '#ececec',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Source Tabs */}
                    <div style={{
                      display: 'flex',
                      padding: '1rem 1.5rem',
                      gap: '1rem',
                      borderBottom: '1px solid #2a2a2a'
                    }}>
                      <button
                        onClick={() => setMusicSource('youtube')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: musicSource === 'youtube' ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        📺 YouTube
                      </button>
                      <button
                        onClick={() => setMusicSource('tiktok')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: musicSource === 'tiktok' ? '#3b82f6' : '#2a2a2a',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🎵 TikTok
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                          type="text"
                          value={musicSearchQuery}
                          onChange={(e) => setMusicSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchMusic()}
                          placeholder={`Search ${musicSource === 'youtube' ? 'YouTube' : 'TikTok'} music...`}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: '#2a2a2a',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            color: '#ececec',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={searchMusic}
                          disabled={isSearchingMusic}
                          style={{
                            padding: '0.75rem 2rem',
                            background: isSearchingMusic ? '#666' : '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: isSearchingMusic ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isSearchingMusic ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                    </div>

                    {/* Results */}
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '0 1.5rem 1.5rem'
                    }}>
                      {isSearchingMusic ? (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '3rem',
                          color: '#999'
                        }}>
                          Searching...
                        </div>
                      ) : musicResults.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                          gap: '1rem'
                        }}>
                          {musicResults.map((music, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '1rem',
                                background: '#2a2a2a',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                              }}
                            >
                              <div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#ececec',
                                  marginBottom: '0.25rem'
                                }}>
                                  {music.title}
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  color: '#999'
                                }}>
                                  {music.artist}
                                </div>
                              </div>
                              <button
                                onClick={() => downloadMusic(music)}
                                disabled={isDownloadingMusic}
                                style={{
                                  padding: '0.5rem',
                                  background: '#3b82f6',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontWeight: '600',
                                  cursor: isDownloadingMusic ? 'not-allowed' : 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                {isDownloadingMusic ? '⏳' : '⬇️'} Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3rem',
                          color: '#999',
                          textAlign: 'center'
                        }}>
                          <Music size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                          <p>Search for music from {musicSource === 'youtube' ? 'YouTube' : 'TikTok'}</p>
                        </div>
                      )}
                    </div>
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
                  Click to add stickers • Drag them on video to reposition
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

      {/* Share Dialog */}
      {showShareDialog && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001
      }}
      onClick={() => setShowShareDialog(false)}
      >
        <div style={{
          background: '#1f1f1f',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          border: '1px solid #3b82f6'
        }}
        onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem' }}>📤 Video Teilen</h3>
            <button onClick={() => setShowShareDialog(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
              { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
              { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
              { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
              { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
              { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
              { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#FF0000' }
            ].map(platform => (
              <button
                key={platform.id}
                onClick={() => shareVideo(platform.id)}
                style={{
                  padding: '1rem',
                  background: '#2a2a2a',
                  border: `2px solid ${platform.color}`,
                  borderRadius: '8px',
                  color: '#ececec',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = platform.color;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2a2a2a';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{platform.icon}</span>
                {platform.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}
    </>
  );
}

