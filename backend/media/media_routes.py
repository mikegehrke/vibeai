"""
Media API Routes - Video & Image Processing
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import os

from .video_generator import video_generator, image_editor
from .music_downloader import music_downloader, text_animations

router = APIRouter()


# Request Models
class VideoCreateRequest(BaseModel):
    appName: str
    appId: str
    duration: int = 30
    quality: str = "HD"


class ImageFilterRequest(BaseModel):
    imageData: str
    brightness: float = 1.0
    contrast: float = 1.0
    saturation: float = 1.0
    blur: int = 0
    filterName: Optional[str] = None


class TextOverlayRequest(BaseModel):
    imageData: str
    text: str
    positionX: int = 50
    positionY: int = 50
    color: str = "#ffffff"
    fontSize: int = 40


# Video Routes
@router.post("/create-video")
async def create_video(request: VideoCreateRequest):
    """
    Create a demo video for an app
    
    POST /api/media/create-video
    {
        "appName": "My App",
        "appId": "my-app",
        "duration": 30,
        "quality": "HD"
    }
    """
    try:
        result = await video_generator.create_demo_video(
            app_name=request.appName,
            app_id=request.appId,
            duration=request.duration,
            quality=request.quality
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Video creation failed"))
        
        return {
            "success": True,
            "message": f"Video created for {request.appName}",
            "video_info": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{app_id}")
async def get_video(app_id: str):
    """Download generated video"""
    video_path = os.path.join(video_generator.output_dir, f"{app_id}_demo.mp4")
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"{app_id}_demo.mp4"
    )


# Image Editor Routes
@router.post("/image/filter")
async def apply_image_filter(request: ImageFilterRequest):
    """
    Apply filters to an image
    
    POST /api/media/image/filter
    {
        "imageData": "data:image/jpeg;base64,...",
        "brightness": 1.2,
        "contrast": 1.1,
        "saturation": 1.0,
        "blur": 0,
        "filterName": "vintage"
    }
    """
    try:
        processed_image = image_editor.apply_filters(
            image_data=request.imageData,
            brightness=request.brightness,
            contrast=request.contrast,
            saturation=request.saturation,
            blur=request.blur,
            filter_name=request.filterName
        )
        
        return {
            "success": True,
            "imageData": processed_image
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image/text")
async def add_text_to_image(request: TextOverlayRequest):
    """
    Add text overlay to image
    
    POST /api/media/image/text
    {
        "imageData": "data:image/jpeg;base64,...",
        "text": "Hello World",
        "positionX": 50,
        "positionY": 50,
        "color": "#ffffff",
        "fontSize": 40
    }
    """
    try:
        processed_image = image_editor.add_text_overlay(
            image_data=request.imageData,
            text=request.text,
            position=(request.positionX, request.positionY),
            color=request.color,
            font_size=request.fontSize
        )
        
        return {
            "success": True,
            "imageData": processed_image
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters")
async def get_available_filters():
    """Get list of available preset filters"""
    return {
        "success": True,
        "filters": [
            {"id": "none", "name": "Original", "icon": "🎨"},
            {"id": "vintage", "name": "Vintage", "icon": "📸"},
            {"id": "blackwhite", "name": "B&W", "icon": "⚫"},
            {"id": "warm", "name": "Warm", "icon": "🔥"},
            {"id": "cool", "name": "Cool", "icon": "❄️"},
            {"id": "dramatic", "name": "Dramatic", "icon": "⚡"}
        ]
    }


# Music & Audio Routes
@router.get("/music/search/youtube")
async def search_youtube_music(query: str, limit: int = 10):
    """
    Search for music on YouTube
    
    GET /api/media/music/search/youtube?query=relaxing&limit=10
    """
    try:
        results = await music_downloader.search_youtube_music(query, limit)
        return {
            "success": True,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/music/search/tiktok")
async def search_tiktok_sounds(query: str, limit: int = 10):
    """
    Search for sounds on TikTok
    
    GET /api/media/music/search/tiktok?query=trending&limit=10
    """
    try:
        results = await music_downloader.search_tiktok_sounds(query, limit)
        return {
            "success": True,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class MusicDownloadRequest(BaseModel):
    url: str
    source: str
    title: str


@router.post("/music/download")
async def download_music(request: MusicDownloadRequest):
    """
    Download music from URL
    
    POST /api/media/music/download
    {
        "url": "https://youtube.com/watch?v=...",
        "source": "youtube",
        "title": "Song Name"
    }
    """
    try:
        result = await music_downloader.download_audio(
            url=request.url,
            source=request.source,
            title=request.title
        )
        
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "Download failed"))
        
        return {
            "success": True,
            "music": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/music/library")
async def get_music_library():
    """Get all downloaded/saved music"""
    try:
        music_files = music_downloader.get_saved_music()
        return {
            "success": True,
            "music": music_files,
            "count": len(music_files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/music/audio/{filename}")
async def serve_audio_file(filename: str):
    """
    Serve downloaded audio files
    
    GET /api/media/music/audio/youtube_song_123.mp3
    """
    try:
        filepath = os.path.join(music_downloader.music_dir, filename)
        
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            filepath,
            media_type="audio/mpeg",
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Text Styles & Animations
@router.get("/text/styles")
async def get_text_styles():
    """Get available text styles for video editing"""
    return {
        "success": True,
        "styles": text_animations.get_text_styles()
    }


@router.get("/text/animations")
async def get_text_animations():
    """Get available text animations"""
    return {
        "success": True,
        "animations": text_animations.get_text_animations()
    }

