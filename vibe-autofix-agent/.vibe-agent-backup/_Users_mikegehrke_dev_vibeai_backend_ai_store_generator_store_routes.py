#!/usr/bin/env python3
"""
🏪 Store Generator API Routes
REST API für automatische Store Listings
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .store_generator import AppCategory, StoreConfig, StoreGenerator, StorePlatform

router = APIRouter(prefix="/store-gen", tags=["store-generator"])


# Request/Response Models
class GenerateStoreRequest(BaseModel):
    """Request for store listing generation"""

    app_name: str
    app_description: str
    category: str
    platforms: str = "both"
    keywords: List[str]
    target_audience: str
    primary_color: str = "#007AFF"
    version: str = "1.0.0"
    generate_screenshots: bool = True
    generate_icons: bool = True
    generate_privacy_policy: bool = True
    generate_terms: bool = True
    languages: Optional[List[str]] = None


class GenerateStoreResponse(BaseModel):
    """Response with generated store listing"""

    app_store_metadata: dict
    play_store_metadata: dict
    privacy_policy: str
    terms_of_service: str
    icon_exports: dict
    splash_exports: dict
    screenshot_mockups: List[str]
    manifest_files: dict
    build_commands: str
    changelog: str


class CategoryInfo(BaseModel):
    """Category information"""

    id: str
    name: str
    description: str
    features_count: int


class PlatformInfo(BaseModel):
    """Platform information"""

    id: str
    name: str
    icon_sizes: List[str]
    screenshot_sizes: List[str]


@router.post("/generate", response_model=GenerateStoreResponse)
async def generate_store_listing(request: GenerateStoreRequest):
    """
    Generate complete store listing for iOS and/or Android

    Returns all metadata, assets, legal documents, and build commands
    """
    try:
        # Parse category
        try:
            category = AppCategory[request.category.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {request.category}")

        # Parse platform
        platform_map = {
            "ios": StorePlatform.IOS_APP_STORE,
            "android": StorePlatform.GOOGLE_PLAY,
            "both": StorePlatform.BOTH,
        }
        platform = platform_map.get(request.platforms.lower())
        if not platform:
            raise HTTPException(status_code=400, detail=f"Invalid platform: {request.platforms}")

        # Create config
        config = StoreConfig(
            app_name=request.app_name,
            app_description=request.app_description,
            category=category,
            platforms=platform,
            keywords=request.keywords,
            target_audience=request.target_audience,
            primary_color=request.primary_color,
            version=request.version,
            generate_screenshots=request.generate_screenshots,
            generate_icons=request.generate_icons,
            generate_privacy_policy=request.generate_privacy_policy,
            generate_terms=request.generate_terms,
            languages=request.languages or ["en"],
        )

        # Generate
        generator = StoreGenerator()
        result = generator.generate(config)

        return GenerateStoreResponse(
            app_store_metadata=result.app_store_metadata,
            play_store_metadata=result.play_store_metadata,
            privacy_policy=result.privacy_policy,
            terms_of_service=result.terms_of_service,
            icon_exports=result.icon_exports,
            splash_exports=result.splash_exports,
            screenshot_mockups=result.screenshot_mockups,
            manifest_files=result.manifest_files,
            build_commands=result.build_commands,
            changelog=result.changelog,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-metadata-only")
async def generate_metadata_only(request: GenerateStoreRequest):
    """
    Generate only store metadata (no assets)

    Useful for quick preview or SEO optimization
    """
    try:
        category = AppCategory[request.category.upper()]
        platform = StorePlatform.BOTH

        config = StoreConfig(
            app_name=request.app_name,
            app_description=request.app_description,
            category=category,
            platforms=platform,
            keywords=request.keywords,
            target_audience=request.target_audience,
            primary_color=request.primary_color,
            version=request.version,
            generate_screenshots=False,
            generate_icons=False,
        )

        generator = StoreGenerator()
        result = generator.generate(config)

        return {
            "app_store": result.app_store_metadata,
            "play_store": result.play_store_metadata,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-assets-only")
async def generate_assets_only(request: GenerateStoreRequest):
    """
    Generate only assets (icons, splash screens, screenshots)

    Useful when you already have metadata
    """
    try:
        category = AppCategory[request.category.upper()]
        platform = StorePlatform.BOTH

        config = StoreConfig(
            app_name=request.app_name,
            app_description=request.app_description,
            category=category,
            platforms=platform,
            keywords=request.keywords,
            target_audience=request.target_audience,
            primary_color=request.primary_color,
            version=request.version,
        )

        generator = StoreGenerator()
        result = generator.generate(config)

        return {
            "icons": result.icon_exports,
            "splash": result.splash_exports,
            "screenshots": result.screenshot_mockups,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-legal")
async def generate_legal_documents(request: GenerateStoreRequest):
    """
    Generate legal documents (Privacy Policy, Terms of Service)

    Returns GDPR-compliant documents
    """
    try:
        category = AppCategory[request.category.upper()]

        config = StoreConfig(
            app_name=request.app_name,
            app_description=request.app_description,
            category=category,
            platforms=StorePlatform.BOTH,
            keywords=request.keywords,
            target_audience=request.target_audience,
        )

        generator = StoreGenerator()
        result = generator.generate(config)

        return {
            "privacy_policy": result.privacy_policy,
            "terms_of_service": result.terms_of_service,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-manifests")
async def generate_manifests(request: GenerateStoreRequest):
    """
    Generate platform manifests (Info.plist, AndroidManifest.xml)

    Returns platform-specific configuration files
    """
    try:
        category = AppCategory[request.category.upper()]
        platform_map = {
            "ios": StorePlatform.IOS_APP_STORE,
            "android": StorePlatform.GOOGLE_PLAY,
            "both": StorePlatform.BOTH,
        }
        platform = platform_map.get(request.platforms.lower(), StorePlatform.BOTH)

        config = StoreConfig(
            app_name=request.app_name,
            app_description=request.app_description,
            category=category,
            platforms=platform,
            keywords=request.keywords,
            target_audience=request.target_audience,
            version=request.version,
        )

        generator = StoreGenerator()
        result = generator.generate(config)

        return {
            "manifests": result.manifest_files,
            "build_commands": result.build_commands,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories", response_model=List[CategoryInfo])
async def get_categories():
    """
    Get all available app categories

    Returns list of categories with descriptions
    """
    categories = [
        CategoryInfo(
            id="business",
            name="Business",
            description="Project management, CRM, team collaboration",
            features_count=8,
        ),
        CategoryInfo(
            id="productivity",
            name="Productivity",
            description="Task management, notes, calendars",
            features_count=8,
        ),
        CategoryInfo(
            id="social",
            name="Social Networking",
            description="Chat, messaging, social media",
            features_count=8,
        ),
        CategoryInfo(
            id="education",
            name="Education",
            description="Learning platforms, courses, tutorials",
            features_count=8,
        ),
        CategoryInfo(
            id="entertainment",
            name="Entertainment",
            description="Streaming, media, content",
            features_count=8,
        ),
        CategoryInfo(
            id="finance",
            name="Finance",
            description="Banking, budgeting, investments",
            features_count=8,
        ),
        CategoryInfo(
            id="health",
            name="Health & Fitness",
            description="Fitness tracking, wellness, health",
            features_count=8,
        ),
        CategoryInfo(
            id="lifestyle",
            name="Lifestyle",
            description="Daily habits, inspiration, wellness",
            features_count=8,
        ),
        CategoryInfo(
            id="shopping",
            name="Shopping",
            description="E-commerce, marketplace, retail",
            features_count=8,
        ),
        CategoryInfo(
            id="travel",
            name="Travel & Local",
            description="Booking, maps, travel guides",
            features_count=8,
        ),
        CategoryInfo(
            id="utilities",
            name="Utilities",
            description="Tools, helpers, system utilities",
            features_count=8,
        ),
        CategoryInfo(
            id="games",
            name="Games",
            description="Gaming, entertainment, puzzles",
            features_count=8,
        ),
    ]

    return categories


@router.get("/platforms", response_model=List[PlatformInfo])
async def get_platforms():
    """
    Get platform-specific requirements

    Returns icon sizes, screenshot sizes, and requirements
    """
    platforms = [
        PlatformInfo(
            id="ios",
            name="iOS App Store",
            icon_sizes=[
                "1024x1024 (App Store)",
                "180x180 (iPhone 3x)",
                "120x120 (iPhone 2x)",
                "167x167 (iPad Pro)",
                "152x152 (iPad 2x)",
            ],
            screenshot_sizes=[
                "1290x2796 (iPhone 14 Pro Max)",
                "1284x2778 (iPhone 13 Pro Max)",
                "2048x2732 (iPad Pro 12.9)",
            ],
        ),
        PlatformInfo(
            id="android",
            name="Google Play Store",
            icon_sizes=[
                "512x512 (Play Store)",
                "192x192 (xxxhdpi)",
                "144x144 (xxhdpi)",
                "96x96 (xhdpi)",
                "72x72 (hdpi)",
                "48x48 (mdpi)",
            ],
            screenshot_sizes=[
                "1440x3120 (Pixel 7 Pro)",
                "1080x1920 (xxhdpi)",
                "1024x500 (Feature Graphic)",
            ],
        ),
    ]

    return platforms


@router.get("/asset-types")
async def get_asset_types():
    """
    Get all asset types

    Returns list of assets that can be generated
    """
    return {
        "icons": {
            "ios": ["App Store (1024x1024)", "App Icons (various sizes)"],
            "android": ["Play Store (512x512)", "Adaptive Icons", "Density Icons"],
        },
        "splash_screens": {
            "ios": ["Launch Screen (1x, 2x, 3x)"],
            "android": ["Splash Screen (all densities)"],
        },
        "screenshots": {
            "ios": ["iPhone", "iPad"],
            "android": ["Phone", "Tablet", "TV"],
        },
        "graphics": {"android": ["Feature Graphic (1024x500)"]},
        "videos": {"ios": ["App Preview Video"], "android": ["Promo Video"]},
    }


@router.post("/optimize-keywords")
async def optimize_keywords(app_name: str, description: str, category: str):
    """
    Generate SEO-optimized keywords

    Returns keyword suggestions based on app info
    """
    try:
        cat = AppCategory[category.upper()]

        # Base keywords from category
        category_keywords = {
            AppCategory.BUSINESS: [
                "business",
                "productivity",
                "team",
                "work",
                "collaboration",
                "project",
                "management",
            ],
            AppCategory.PRODUCTIVITY: [
                "tasks",
                "todo",
                "organize",
                "efficiency",
                "planner",
                "notes",
                "calendar",
            ],
            AppCategory.SOCIAL: [
                "chat",
                "friends",
                "share",
                "connect",
                "social",
                "messaging",
                "network",
            ],
            AppCategory.EDUCATION: [
                "learn",
                "study",
                "courses",
                "education",
                "training",
                "tutorial",
                "lessons",
            ],
            AppCategory.ENTERTAINMENT: [
                "fun",
                "video",
                "streaming",
                "watch",
                "entertainment",
                "media",
                "content",
            ],
            AppCategory.FINANCE: [
                "money",
                "budget",
                "finance",
                "banking",
                "investment",
                "savings",
                "expense",
            ],
            AppCategory.HEALTH: [
                "fitness",
                "health",
                "workout",
                "wellness",
                "exercise",
                "nutrition",
                "tracker",
            ],
            AppCategory.LIFESTYLE: [
                "lifestyle",
                "daily",
                "habits",
                "wellness",
                "routine",
                "inspiration",
                "mindful",
            ],
            AppCategory.SHOPPING: [
                "shop",
                "buy",
                "deals",
                "shopping",
                "retail",
                "store",
                "products",
            ],
            AppCategory.TRAVEL: [
                "travel",
                "trips",
                "hotels",
                "flights",
                "booking",
                "vacation",
                "destination",
            ],
            AppCategory.UTILITIES: [
                "tools",
                "utility",
                "helper",
                "assistant",
                "productivity",
                "widget",
                "quick",
            ],
            AppCategory.GAMES: [
                "game",
                "play",
                "fun",
                "arcade",
                "puzzle",
                "casual",
                "action",
            ],
        }

        keywords = category_keywords.get(cat, ["app", "mobile", "free"])

        # Add app name variants
        name_parts = app_name.lower().split()
        keywords.extend(name_parts)

        # Remove duplicates
        unique_keywords = list(dict.fromkeys(keywords))

        return {
            "recommended_keywords": unique_keywords[:15],
            "app_store_string": ", ".join(unique_keywords[:10]),  # iOS limit ~100 chars
            "play_store_tags": unique_keywords[:5],  # Android limit 5 tags
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate-metadata")
async def validate_metadata(request: GenerateStoreRequest):
    """
    Validate store metadata before submission

    Returns validation results and warnings
    """
    issues = []
    warnings = []

    # App name validation
    if len(request.app_name) > 30:
        issues.append("App name exceeds 30 characters (App Store limit)")
    if len(request.app_name) < 3:
        issues.append("App name too short (minimum 3 characters)")

    # Description validation
    if len(request.app_description) < 50:
        warnings.append("Description is short, consider adding more details")
    if len(request.app_description) > 4000:
        issues.append("Description exceeds 4000 characters")

    # Keywords validation
    if len(request.keywords) < 5:
        warnings.append("Consider adding more keywords for better SEO")
    if len(request.keywords) > 15:
        warnings.append("Too many keywords may dilute SEO effectiveness")

    # Color validation
    if not request.primary_color.startswith("#"):
        issues.append("Primary color must be in hex format (#RRGGBB)")

    # Version validation
    version_parts = request.version.split(".")
    if len(version_parts) != 3:
        issues.append("Version must be in format X.Y.Z (e.g., 1.0.0)")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "score": max(0, 100 - len(issues) * 20 - len(warnings) * 5),
    }


@router.get("/templates/{category}")
async def get_category_template(category: str):
    """
    Get pre-filled template for category

    Returns example metadata for the category
    """
    templates = {
        "productivity": {
            "app_name": "TaskMaster Pro",
            "app_description": "The ultimate productivity app to manage your tasks, projects, and goals efficiently.",
            "keywords": [
                "tasks",
                "todo",
                "productivity",
                "planner",
                "organize",
                "efficiency",
            ],
            "target_audience": "Professionals, students, and anyone looking to boost their productivity",
            "primary_color": "#007AFF",
        },
        "social": {
            "app_name": "ChatHub",
            "app_description": "Connect with friends and family through instant messaging, voice calls, and video chats.",
            "keywords": [
                "chat",
                "messaging",
                "social",
                "friends",
                "video call",
                "connect",
            ],
            "target_audience": "Social users who want to stay connected with friends and family",
            "primary_color": "#34C759",
        },
        "health": {
            "app_name": "FitTracker",
            "app_description": "Track your fitness journey with workout plans, calorie counting, and health insights.",
            "keywords": [
                "fitness",
                "health",
                "workout",
                "tracker",
                "exercise",
                "wellness",
            ],
            "target_audience": "Fitness enthusiasts and health-conscious individuals",
            "primary_color": "#FF3B30",
        },
        "finance": {
            "app_name": "MoneyWise",
            "app_description": "Take control of your finances with budget tracking, expense management, and financial insights.",
            "keywords": ["budget", "finance", "money", "expense", "savings", "banking"],
            "target_audience": "Anyone looking to manage their personal finances better",
            "primary_color": "#5856D6",
        },
    }

    template = templates.get(category.lower())
    if not template:
        raise HTTPException(status_code=404, detail=f"No template for category: {category}")

    return template


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "store-generator"}
