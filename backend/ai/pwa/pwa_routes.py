# -------------------------------------------------------------
# VIBEAI – PWA & OFFLINE ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .pwa_generator import pwa_generator

router = APIRouter(prefix="/pwa", tags=["PWA & Offline"])


# ========== PYDANTIC MODELS ==========

class GeneratePWARequest(BaseModel):
    """Request model für PWA-Generierung"""
    app_name: str = Field(..., description="App Name")
    full_name: Optional[str] = Field(None, description="Full App Name")
    short_name: Optional[str] = Field(None, description="Short Name")
    description: Optional[str] = Field(None, description="App Description")
    theme_color: str = Field("#000000", description="Theme Color (Hex)")
    background_color: str = Field("#ffffff", description="Background Color (Hex)")
    display: str = Field("standalone", description="Display Mode")
    cache_strategy: str = Field("network_first", description="Cache Strategy")
    cache_urls: List[str] = Field(default_factory=list, description="URLs to cache")
    orientation: str = Field("portrait-primary", description="Orientation")
    categories: List[str] = Field(default_factory=lambda: ["utilities"], description="Categories")
    share_target: bool = Field(False, description="Enable Share Target API")
    source_icon: Optional[str] = Field(None, description="Source icon path")


class CacheStrategiesResponse(BaseModel):
    """Response model für Cache-Strategien"""
    strategies: List[Dict[str, str]]


class ManifestTemplateResponse(BaseModel):
    """Response model für Manifest-Template"""
    template: Dict[str, Any]


class ServiceWorkerTemplateResponse(BaseModel):
    """Response model für Service Worker Template"""
    template: str
    cache_strategy: str


class ValidationResponse(BaseModel):
    """Response model für Manifest-Validation"""
    valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class GeneratePWAResponse(BaseModel):
    """Response model für PWA-Generierung"""
    success: bool
    files: List[str]
    features: List[str]
    cache_strategy: str
    icon_sizes: List[int]
    message: str


# ========== ENDPOINTS ==========

@router.post("/generate", response_model=GeneratePWAResponse)
async def generate_pwa(request: GeneratePWARequest):
    """
    🔹 PWA & OFFLINE GENERIEREN
    
    Generiert komplette PWA-Konfiguration:
    - Web App Manifest (manifest.json)
    - Service Worker (Cache-Strategien)
    - Offline-Seite
    - Install Prompt
    - Icon-Config
    """
    try:
        options = {
            "full_name": request.full_name,
            "short_name": request.short_name,
            "description": request.description,
            "theme_color": request.theme_color,
            "background_color": request.background_color,
            "display": request.display,
            "cache_strategy": request.cache_strategy,
            "cache_urls": request.cache_urls,
            "orientation": request.orientation,
            "categories": request.categories,
            "share_target": request.share_target,
            "source_icon": request.source_icon
        }
        
        result = pwa_generator.generate_pwa(
            base_path="/tmp/vibeai_pwa",
            app_name=request.app_name,
            options=options
        )
        
        return GeneratePWAResponse(
            success=result["success"],
            files=result["files"],
            features=result["features"],
            cache_strategy=result["cache_strategy"],
            icon_sizes=result["icon_sizes"],
            message=f"PWA für '{request.app_name}' erfolgreich generiert!"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PWA-Generierung fehlgeschlagen: {str(e)}")


@router.get("/strategies", response_model=CacheStrategiesResponse)
async def get_cache_strategies():
    """
    🔹 CACHE-STRATEGIEN
    
    Gibt alle verfügbaren Cache-Strategien zurück
    """
    strategies = [
        {
            "id": "cache_first",
            "name": "Cache First",
            "description": "Priorisiert Cache, fällt auf Network zurück",
            "use_case": "Static Assets (CSS, JS, Images)"
        },
        {
            "id": "network_first",
            "name": "Network First",
            "description": "Versucht Network, fällt auf Cache zurück",
            "use_case": "API Calls, Dynamic Content"
        },
        {
            "id": "stale_while_revalidate",
            "name": "Stale While Revalidate",
            "description": "Gibt Cache zurück, aktualisiert im Hintergrund",
            "use_case": "Häufig aktualisierte Inhalte"
        },
        {
            "id": "network_only",
            "name": "Network Only",
            "description": "Nur Network, kein Cache",
            "use_case": "Real-time Daten, Critical Updates"
        },
        {
            "id": "cache_only",
            "name": "Cache Only",
            "description": "Nur Cache, kein Network",
            "use_case": "Pre-cached Resources"
        }
    ]
    
    return CacheStrategiesResponse(strategies=strategies)


@router.get("/manifest-template", response_model=ManifestTemplateResponse)
async def get_manifest_template():
    """
    🔹 MANIFEST TEMPLATE
    
    Gibt ein Standard-Manifest-Template zurück
    """
    template = {
        "name": "Your App Name",
        "short_name": "App",
        "description": "Your Progressive Web Application",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "orientation": "portrait-primary",
        "scope": "/",
        "icons": [
            {
                "src": "/icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "/icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ],
        "categories": ["utilities", "productivity"],
        "screenshots": [],
        "shortcuts": [
            {
                "name": "Home",
                "short_name": "Home",
                "description": "Open home page",
                "url": "/",
                "icons": [{"src": "/icons/icon-96x96.png", "sizes": "96x96"}]
            }
        ]
    }
    
    return ManifestTemplateResponse(template=template)


@router.get("/sw-template/{strategy}", response_model=ServiceWorkerTemplateResponse)
async def get_service_worker_template(strategy: str):
    """
    🔹 SERVICE WORKER TEMPLATE
    
    Gibt Service Worker Template für spezifische Strategie zurück
    """
    if strategy not in pwa_generator.cache_strategies:
        raise HTTPException(
            status_code=400,
            detail=f"Ungültige Strategie. Verfügbar: {', '.join(pwa_generator.cache_strategies)}"
        )
    
    template = f"""// Service Worker - {strategy.replace('_', ' ').title()} Strategy
const CACHE_NAME = 'app-cache-v1';

self.addEventListener('install', (event) => {{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(['/']))
      .then(() => self.skipWaiting())
  );
}});

self.addEventListener('fetch', (event) => {{
  event.respondWith(
    {pwa_generator._get_cache_strategy_code(strategy)}
  );
}});
"""
    
    return ServiceWorkerTemplateResponse(
        template=template,
        cache_strategy=strategy
    )


@router.post("/validate/manifest", response_model=ValidationResponse)
async def validate_manifest(manifest: Dict[str, Any]):
    """
    🔹 MANIFEST VALIDATION
    
    Validiert Web App Manifest
    """
    errors = []
    warnings = []
    
    # Required fields
    required_fields = ["name", "short_name", "start_url", "display"]
    for field in required_fields:
        if field not in manifest:
            errors.append(f"Required field '{field}' missing")
    
    # Icons validation
    if "icons" not in manifest or not manifest["icons"]:
        errors.append("At least one icon required")
    else:
        has_192 = any(icon.get("sizes") == "192x192" for icon in manifest["icons"])
        has_512 = any(icon.get("sizes") == "512x512" for icon in manifest["icons"])
        
        if not has_192:
            warnings.append("Missing recommended icon size: 192x192")
        if not has_512:
            warnings.append("Missing recommended icon size: 512x512")
    
    # Display mode validation
    valid_display = ["fullscreen", "standalone", "minimal-ui", "browser"]
    if "display" in manifest and manifest["display"] not in valid_display:
        warnings.append(f"Invalid display mode. Valid: {', '.join(valid_display)}")
    
    # Orientation validation
    valid_orientation = [
        "any", "natural", "landscape", "portrait",
        "portrait-primary", "portrait-secondary",
        "landscape-primary", "landscape-secondary"
    ]
    if "orientation" in manifest and manifest["orientation"] not in valid_orientation:
        warnings.append(f"Invalid orientation. Valid: {', '.join(valid_orientation)}")
    
    # Color validation
    import re
    color_pattern = re.compile(r'^#[0-9A-Fa-f]{6}$')
    
    if "theme_color" in manifest and not color_pattern.match(manifest["theme_color"]):
        warnings.append("theme_color should be hex color (#RRGGBB)")
    
    if "background_color" in manifest and not color_pattern.match(manifest["background_color"]):
        warnings.append("background_color should be hex color (#RRGGBB)")
    
    return ValidationResponse(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings
    )


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK
    
    Prüft PWA-Generator-Status
    """
    return {
        "status": "healthy",
        "service": "PWA & Offline Generator",
        "cache_strategies": len(pwa_generator.cache_strategies),
        "icon_sizes": len(pwa_generator.icon_sizes),
        "version": "1.0.0"
    }
