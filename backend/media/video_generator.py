"""
Video Generator - Creates demo videos from apps
"""
import os
import base64
from io import BytesIO
from typing import Optional, Dict, Any
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json

class VideoGenerator:
    """Generates demo videos from app screenshots"""
    
    def __init__(self):
        self.output_dir = "generated_videos"
        os.makedirs(self.output_dir, exist_ok=True)
    
    async def create_demo_video(
        self,
        app_name: str,
        app_id: str,
        duration: int = 30,
        quality: str = "HD",
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a demo video for an app
        
        Args:
            app_name: Name of the app
            app_id: Unique app identifier
            duration: Video duration in seconds
            quality: Video quality (HD, FHD, 4K)
            user_id: Optional user ID
            
        Returns:
            Dict with video info and file path
        """
        try:
            # TODO: Implement actual video generation
            # For now, create a placeholder image sequence
            
            # Create placeholder frames
            frames = []
            width, height = self._get_resolution(quality)
            
            for i in range(duration):
                frame = self._create_placeholder_frame(
                    app_name, 
                    i, 
                    width, 
                    height
                )
                frames.append(frame)
            
            # Generate video file path
            video_filename = f"{app_id}_{user_id or 'demo'}.mp4"
            video_path = os.path.join(self.output_dir, video_filename)
            
            # TODO: Use ffmpeg or moviepy to create actual video
            # For now, save first frame as preview
            if frames:
                preview_path = video_path.replace('.mp4', '_preview.jpg')
                frames[0].save(preview_path, quality=95)
            
            return {
                "success": True,
                "video_path": video_path,
                "preview_path": preview_path if frames else None,
                "duration": duration,
                "quality": quality,
                "app_name": app_name,
                "frames_count": len(frames)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_resolution(self, quality: str) -> tuple:
        """Get video resolution based on quality"""
        resolutions = {
            "HD": (1280, 720),
            "FHD": (1920, 1080),
            "4K": (3840, 2160)
        }
        return resolutions.get(quality, (1280, 720))
    
    def _create_placeholder_frame(
        self, 
        app_name: str, 
        frame_number: int,
        width: int,
        height: int
    ) -> Image.Image:
        """Create a placeholder video frame"""
        # Create gradient background
        img = Image.new('RGB', (width, height), color='#1a1a1a')
        draw = ImageDraw.Draw(img)
        
        # Add app name
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
        except:
            font = ImageFont.load_default()
        
        text = f"{app_name} - Demo"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, fill='#3b82f6', font=font)
        
        # Add frame counter
        frame_text = f"Frame {frame_number + 1}"
        draw.text((20, height - 40), frame_text, fill='#999999')
        
        return img


class ImageEditor:
    """Professional image editor for profile pictures and media"""
    
    @staticmethod
    def apply_filters(
        image_data: str,
        brightness: float = 1.0,
        contrast: float = 1.0,
        saturation: float = 1.0,
        blur: int = 0,
        filter_name: Optional[str] = None
    ) -> str:
        """
        Apply filters to an image
        
        Args:
            image_data: Base64 encoded image
            brightness: Brightness multiplier (0.5 - 2.0)
            contrast: Contrast multiplier (0.5 - 2.0)
            saturation: Saturation multiplier (0.0 - 2.0)
            blur: Blur radius (0-10)
            filter_name: Preset filter name
            
        Returns:
            Base64 encoded processed image
        """
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            img_bytes = base64.b64decode(image_data)
            img = Image.open(BytesIO(img_bytes))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Apply preset filter
            if filter_name:
                img = ImageEditor._apply_preset_filter(img, filter_name)
            
            # Apply brightness
            if brightness != 1.0:
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(brightness)
            
            # Apply contrast
            if contrast != 1.0:
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(contrast)
            
            # Apply saturation
            if saturation != 1.0:
                from PIL import ImageEnhance
                enhancer = ImageEnhance.Color(img)
                img = enhancer.enhance(saturation)
            
            # Apply blur
            if blur > 0:
                img = img.filter(ImageFilter.GaussianBlur(radius=blur))
            
            # Convert back to base64
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=95)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/jpeg;base64,{img_str}"
            
        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")
    
    @staticmethod
    def _apply_preset_filter(img: Image.Image, filter_name: str) -> Image.Image:
        """Apply preset Instagram-like filters"""
        from PIL import ImageEnhance
        
        filters = {
            "vintage": lambda im: ImageEnhance.Color(im).enhance(0.7),
            "blackwhite": lambda im: im.convert('L').convert('RGB'),
            "warm": lambda im: ImageEnhance.Color(
                ImageEnhance.Brightness(im).enhance(1.1)
            ).enhance(1.2),
            "cool": lambda im: ImageEnhance.Color(im).enhance(0.9),
            "dramatic": lambda im: ImageEnhance.Contrast(im).enhance(1.5),
        }
        
        if filter_name in filters:
            return filters[filter_name](img)
        
        return img
    
    @staticmethod
    def add_text_overlay(
        image_data: str,
        text: str,
        position: tuple = (50, 50),
        color: str = "#ffffff",
        font_size: int = 40
    ) -> str:
        """Add text overlay to image"""
        try:
            # Decode image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            img_bytes = base64.b64decode(image_data)
            img = Image.open(BytesIO(img_bytes))
            
            # Add text
            draw = ImageDraw.Draw(img)
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                font = ImageFont.load_default()
            
            draw.text(position, text, fill=color, font=font)
            
            # Convert back to base64
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            raise Exception(f"Text overlay failed: {str(e)}")


# Global instances
video_generator = VideoGenerator()
image_editor = ImageEditor()

