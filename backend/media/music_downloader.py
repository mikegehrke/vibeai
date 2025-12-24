"""
Music Downloader - Download music from YouTube, TikTok, etc.
Uses yt-dlp for REAL audio extraction!
"""
import os
import re
import json
import asyncio
from typing import Optional, Dict, Any, List

try:
    import yt_dlp
    YT_DLP_AVAILABLE = True
except ImportError:
    YT_DLP_AVAILABLE = False
    print("⚠️  yt-dlp not installed. Run: pip install yt-dlp")

class MusicDownloader:
    """Download and manage music from various sources"""
    
    def __init__(self):
        self.music_dir = "downloaded_music"
        os.makedirs(self.music_dir, exist_ok=True)
        self.yt_dlp_available = YT_DLP_AVAILABLE
    
    async def search_youtube_music(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for music on YouTube using yt-dlp
        
        Args:
            query: Search query
            limit: Number of results
            
        Returns:
            List of music results with real YouTube data
        """
        try:
            if not self.yt_dlp_available:
                print("⚠️  yt-dlp not available, returning mock data")
                return self._mock_youtube_results(query, limit)
            
            # ✅ REAL YOUTUBE SEARCH with yt-dlp!
            search_query = f"ytsearch{limit}:{query}"
            
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,  # Don't download, just get info
                'skip_download': True,
            }
            
            print(f"🔍 Searching YouTube for: {query}")
            
            loop = asyncio.get_event_loop()
            search_results = await loop.run_in_executor(
                None,
                lambda: self._search_with_ytdlp(search_query, ydl_opts)
            )
            
            if search_results and 'entries' in search_results:
                results = []
                for entry in search_results['entries'][:limit]:
                    if entry:
                        results.append({
                            "id": entry.get('id', ''),
                            "title": entry.get('title', 'Unknown'),
                            "artist": entry.get('uploader', 'Unknown Artist'),
                            "duration": entry.get('duration', 0),
                            "thumbnail": entry.get('thumbnail', ''),
                            "url": f"https://youtube.com/watch?v={entry.get('id', '')}",
                            "source": "youtube",
                            "views": entry.get('view_count', 0)
                        })
                print(f"✅ Found {len(results)} results")
                return results
            
            return []
            
        except Exception as e:
            print(f"❌ Error searching YouTube: {e}")
            return self._mock_youtube_results(query, limit)
    
    def _search_with_ytdlp(self, query: str, opts: dict) -> Optional[dict]:
        """Helper to search with yt-dlp (runs in executor)"""
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                return ydl.extract_info(query, download=False)
        except Exception as e:
            print(f"❌ yt-dlp search error: {e}")
            return None
    
    def _mock_youtube_results(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Fallback mock results if yt-dlp not available"""
        return [
            {
                "id": f"yt_{i}",
                "title": f"{query} - Result {i+1}",
                "artist": f"Artist {i+1}",
                "duration": 180 + (i * 10),
                "thumbnail": f"https://img.youtube.com/vi/mock{i}/maxresdefault.jpg",
                "url": f"https://youtube.com/watch?v=mock{i}",
                "source": "youtube"
            }
            for i in range(min(limit, 10))
        ]
    
    async def search_tiktok_sounds(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for sounds on TikTok
        
        Args:
            query: Search query
            limit: Number of results
            
        Returns:
            List of sound results
        """
        try:
            # TODO: Integrate with TikTok API for real sound search
            # For now, return mock data structure
            
            results = [
                {
                    "id": f"tt_{i}",
                    "title": f"{query} Sound {i+1}",
                    "artist": f"Creator {i+1}",
                    "duration": 15 + (i * 5),
                    "thumbnail": f"https://p16-sign-va.tiktokcdn.com/mock{i}.jpg",
                    "url": f"https://tiktok.com/sound/mock{i}",
                    "source": "tiktok",
                    "usageCount": 10000 + (i * 1000)
                }
                for i in range(min(limit, 10))
            ]
            
            return results
            
        except Exception as e:
            print(f"Error searching TikTok: {e}")
            return []
    
    async def download_audio(
        self,
        url: str,
        source: str,
        title: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Download audio from URL using yt-dlp
        
        Args:
            url: Source URL (YouTube, TikTok, etc.)
            source: Source platform
            title: Audio title (optional, will be extracted if not provided)
            
        Returns:
            Download info with file path
        """
        try:
            if not self.yt_dlp_available:
                return {
                    "success": False,
                    "error": "yt-dlp not installed. Run: pip install yt-dlp"
                }
            
            # Sanitize filename
            if title:
                safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')[:50]
            else:
                safe_title = "audio"
            
            timestamp = int(asyncio.get_event_loop().time() * 1000)
            filename = f"{source}_{safe_title}_{timestamp}.mp3"
            filepath = os.path.join(self.music_dir, filename)
            
            # ✅ REAL YT-DLP DOWNLOAD!
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': os.path.join(self.music_dir, f"{source}_{safe_title}_{timestamp}.%(ext)s"),
                'quiet': False,
                'no_warnings': False,
                'extract_flat': False,
            }
            
            print(f"🎵 Downloading audio from {url}...")
            
            # Run yt-dlp in executor to avoid blocking
            loop = asyncio.get_event_loop()
            
            # ✅ Define prefix BEFORE using it (outside if block!)
            prefix = f"{source}_{safe_title}_{timestamp}"
            
            info = await loop.run_in_executor(
                None,
                lambda: self._download_with_ytdlp(url, ydl_opts)
            )
            
            if info:
                # ✅ FIX: Search for ANY file with our prefix (FFmpeg may change extension)
                print(f"🔍 Looking for files with prefix: {prefix}")
                
                # List all files in music directory
                if os.path.exists(self.music_dir):
                    all_files = os.listdir(self.music_dir)
                    print(f"📂 Files in directory: {all_files}")
                    
                    # Find files that start with our prefix
                    matching_files = [f for f in all_files if f.startswith(prefix)]
                    print(f"✅ Matching files: {matching_files}")
                    
                    if matching_files:
                        # Use the first matching file (should be the MP3)
                        actual_filename = matching_files[0]
                        actual_filepath = os.path.join(self.music_dir, actual_filename)
                        
                        print(f"✅ Downloaded: {actual_filename}")
                        print(f"📁 Full path: {actual_filepath}")
                        print(f"📊 File size: {os.path.getsize(actual_filepath)} bytes")
                        
                        return {
                            "success": True,
                            "title": info.get('title', title or 'Unknown'),
                            "artist": info.get('uploader', 'Unknown Artist'),
                            "duration": info.get('duration', 0),
                            "filename": actual_filename,
                            "filepath": actual_filepath,
                            "source": source,
                            "url": url,
                            "size": os.path.getsize(actual_filepath),
                            "thumbnail": info.get('thumbnail', '')
                        }
            
            print(f"❌ No files found with prefix: {prefix}")
            print(f"📂 Music directory: {self.music_dir}")
            print(f"📂 Directory exists: {os.path.exists(self.music_dir)}")
            if os.path.exists(self.music_dir):
                print(f"📂 All files: {os.listdir(self.music_dir)}")
            
            return {
                "success": False,
                "error": "Download completed but file not found"
            }
            
        except Exception as e:
            print(f"❌ Download error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _download_with_ytdlp(self, url: str, opts: dict) -> Optional[dict]:
        """Helper to download with yt-dlp (runs in executor)"""
        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=True)
                return info
        except Exception as e:
            print(f"❌ yt-dlp error: {e}")
            return None
    
    def get_saved_music(self) -> List[Dict[str, Any]]:
        """Get list of all downloaded music"""
        try:
            music_files = []
            
            if os.path.exists(self.music_dir):
                for filename in os.listdir(self.music_dir):
                    if filename.endswith(('.mp3', '.wav', '.m4a')):
                        filepath = os.path.join(self.music_dir, filename)
                        music_files.append({
                            "filename": filename,
                            "filepath": filepath,
                            "size": os.path.getsize(filepath),
                            "title": filename.rsplit('.', 1)[0]
                        })
            
            return music_files
            
        except Exception as e:
            print(f"Error getting saved music: {e}")
            return []


class TextAnimations:
    """Professional text animations and styles"""
    
    @staticmethod
    def get_text_styles() -> List[Dict[str, Any]]:
        """Get available text styles"""
        return [
            {
                "id": "classic",
                "name": "Classic",
                "fontFamily": "Arial, sans-serif",
                "fontWeight": "bold",
                "animation": "none"
            },
            {
                "id": "modern",
                "name": "Modern",
                "fontFamily": "Helvetica, sans-serif",
                "fontWeight": "600",
                "animation": "fadeIn"
            },
            {
                "id": "retro",
                "name": "Retro",
                "fontFamily": "Courier, monospace",
                "fontWeight": "bold",
                "animation": "slideIn"
            },
            {
                "id": "elegant",
                "name": "Elegant",
                "fontFamily": "Georgia, serif",
                "fontWeight": "normal",
                "animation": "fadeIn"
            },
            {
                "id": "bold",
                "name": "Bold",
                "fontFamily": "Impact, sans-serif",
                "fontWeight": "900",
                "animation": "popIn"
            },
            {
                "id": "neon",
                "name": "Neon",
                "fontFamily": "Arial, sans-serif",
                "fontWeight": "bold",
                "animation": "glow",
                "textShadow": "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #3b82f6"
            }
        ]
    
    @staticmethod
    def get_text_animations() -> List[Dict[str, Any]]:
        """Get available text animations"""
        return [
            {"id": "none", "name": "None"},
            {"id": "fadeIn", "name": "Fade In"},
            {"id": "slideIn", "name": "Slide In"},
            {"id": "popIn", "name": "Pop In"},
            {"id": "typewriter", "name": "Typewriter"},
            {"id": "bounce", "name": "Bounce"},
            {"id": "rotate", "name": "Rotate"},
            {"id": "glow", "name": "Glow"}
        ]


# Global instances
music_downloader = MusicDownloader()
text_animations = TextAnimations()

