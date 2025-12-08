# -------------------------------------------------------------
# VIBEAI – THEME ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .theme_generator import theme_generator

router = APIRouter(prefix="/theme", tags=["Theme Generator"])

# ========== PYDANTIC MODELS ==========


class GenerateThemeRequest(BaseModel):
    """Request model für Theme-Generierung"""

    framework: str = Field(..., description="Framework (flutter, react, css, tailwind, vuejs, angular)")
    colors: Optional[Dict[str, str]] = Field(None, description="Custom color palette")
    include_dark_mode: bool = Field(True, description="Include dark mode")


class ThemeColorsResponse(BaseModel):
    """Response model für Default Colors"""

    colors: Dict[str, str]


class FrameworksResponse(BaseModel):
    """Response model für Frameworks"""

    frameworks: List[str]


class GenerateThemeResponse(BaseModel):
    """Response model für Theme-Generierung"""

    success: bool
    framework: str
    files: List[str]
    theme_data: Dict[str, Any]
    message: str


class ColorPaletteRequest(BaseModel):
    """Request model für Custom Palette"""

    name: str = Field(..., description="Palette Name")
    primary: str = Field(..., description="Primary Color (Hex)")
    secondary: str = Field(..., description="Secondary Color (Hex)")
    success: Optional[str] = Field(None, description="Success Color (Hex)")
    warning: Optional[str] = Field(None, description="Warning Color (Hex)")
    error: Optional[str] = Field(None, description="Error Color (Hex)")
    info: Optional[str] = Field(None, description="Info Color (Hex)")


class ColorPaletteResponse(BaseModel):
    """Response model für Palette"""

    name: str
    colors: Dict[str, str]


# ========== ENDPOINTS ==========


@router.post("/generate", response_model=GenerateThemeResponse)
async def generate_theme(request: GenerateThemeRequest):
    """
    🔹 THEME GENERIEREN

    Generiert Theme-Konfiguration für Framework:
    - Flutter: ThemeData, Colors, Provider
    - React: Theme Config, Context, Hook
    - CSS: Variables, Switcher
    - Tailwind: Config
    - Vue: Composable
    - Angular: Material Theme
    """
    try:
        if request.framework not in theme_generator.frameworks:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported framework. Available: {', '.join(theme_generator.frameworks)}",
            )

        options = {
            "colors": request.colors or {},
            "include_dark_mode": request.include_dark_mode,
        }

        result = theme_generator.generate_theme(
            base_path="/tmp/vibeai_theme", framework=request.framework, options=options
        )

        return GenerateThemeResponse(
            success=result["success"],
            framework=result["framework"],
            files=result["files"],
            theme_data=result["theme_data"],
            message=f"Theme für {request.framework} erfolgreich generiert!",
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Theme-Generierung fehlgeschlagen: {str(e)}")


@router.get("/frameworks", response_model=FrameworksResponse)
async def get_frameworks():
    """
    🔹 FRAMEWORKS

    Gibt alle unterstützten Frameworks zurück
    """
    return FrameworksResponse(frameworks=theme_generator.frameworks)


@router.get("/colors", response_model=ThemeColorsResponse)
async def get_default_colors():
    """
    🔹 DEFAULT COLORS

    Gibt Default Color Palette zurück
    """
    return ThemeColorsResponse(colors=theme_generator.default_colors)


@router.post("/palette/create", response_model=ColorPaletteResponse)
async def create_color_palette(request: ColorPaletteRequest):
    """
    🔹 CUSTOM PALETTE ERSTELLEN

    Erstellt eine Custom Color Palette
    """
    colors = {
        "primary": request.primary,
        "secondary": request.secondary,
    }

    if request.success:
        colors["success"] = request.success
    if request.warning:
        colors["warning"] = request.warning
    if request.error:
        colors["error"] = request.error
    if request.info:
        colors["info"] = request.info

    return ColorPaletteResponse(name=request.name, colors=colors)


@router.get("/palette/presets")
async def get_palette_presets():
    """
    🔹 PALETTE PRESETS

    Gibt vordefinierte Color Palettes zurück
    """
    presets = [
        {
            "name": "Purple Gradient",
            "colors": {
                "primary": "#667eea",
                "secondary": "#764ba2",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
        {
            "name": "Ocean Blue",
            "colors": {
                "primary": "#0ea5e9",
                "secondary": "#06b6d4",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
        {
            "name": "Forest Green",
            "colors": {
                "primary": "#059669",
                "secondary": "#10b981",
                "success": "#22c55e",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
        {
            "name": "Sunset Orange",
            "colors": {
                "primary": "#f97316",
                "secondary": "#fb923c",
                "success": "#10b981",
                "warning": "#eab308",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
        {
            "name": "Rose Pink",
            "colors": {
                "primary": "#ec4899",
                "secondary": "#f472b6",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
        {
            "name": "Midnight Dark",
            "colors": {
                "primary": "#6366f1",
                "secondary": "#8b5cf6",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
        },
    ]

    return {"presets": presets}


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK

    Prüft Theme-Generator-Status
    """
    return {
        "status": "healthy",
        "service": "Theme Generator",
        "frameworks": len(theme_generator.frameworks),
        "default_colors": len(theme_generator.default_colors),
        "version": "1.0.0",
    }
