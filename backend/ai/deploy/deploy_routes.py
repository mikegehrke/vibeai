# -------------------------------------------------------------
# VIBEAI – DEPLOYMENT ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from .deploy_generator import deploy_generator

router = APIRouter(prefix="/deploy", tags=["Deployment"])


class DeployRequest(BaseModel):
    """Request für Deployment-Generierung"""

    platform: str = Field(
        ...,
        description="vercel, netlify, cloudflare, railway, render, flyio, docker, github_actions, fastlane",
    )
    project_type: str = Field(..., description="web, backend, mobile")
    project_id: str
    options: Optional[Dict[str, Any]] = None


@router.post("/generate")
async def generate_deployment(request: Request, data: DeployRequest):
    """
    Generiert Deployment-Konfiguration für spezifische Plattform

    POST /deploy/generate
    {
        "platform": "vercel",
        "project_type": "web",
        "project_id": "my-app",
        "options": {"framework": "nextjs", "env_vars": {...}}
    }

    Returns:
    {
        "success": true,
        "platform": "vercel",
        "files": ["/path/to/vercel.json", ...],
        "features": [...],
        "deploy_command": "vercel --prod"
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"

        result = deploy_generator.generate_deployment(
            platform=data.platform,
            project_type=data.project_type,
            base_path=base_path,
            options=data.options or {},
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Fehler bei Deployment-Generierung"),
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.get("/platforms")
async def get_supported_platforms():
    """
    Gibt alle unterstützten Deployment-Plattformen zurück

    GET /deploy/platforms

    Returns:
    {
        "web": ["vercel", "netlify", "cloudflare"],
        "backend": ["railway", "render", "flyio", "docker"],
        "mobile": ["github_actions", "fastlane"]
    }
    """
    return {"platforms": deploy_generator.supported_platforms}


@router.get("/platform/{platform}/features")
async def get_platform_features(platform: str):
    """
    Gibt Features für spezifische Plattform zurück

    GET /deploy/platform/vercel/features

    Returns:
    {
        "platform": "vercel",
        "features": [...],
        "description": "..."
    }
    """
    features_map = {
        "vercel": {
            "features": [
                "Next.js Optimized",
                "Edge Functions",
                "Auto SSL",
                "Global CDN",
                "Preview Deployments",
                "Analytics",
            ],
            "description": "Optimized for Next.js and React applications",
            "pricing": "Free tier available",
            "deploy_time": "~30 seconds",
        },
        "netlify": {
            "features": [
                "Continuous Deployment",
                "Serverless Functions",
                "Form Handling",
                "Split Testing",
                "Identity Management",
            ],
            "description": "All-in-one platform for modern web projects",
            "pricing": "Free tier available",
            "deploy_time": "~1 minute",
        },
        "cloudflare": {
            "features": [
                "Edge Computing",
                "Workers",
                "DDoS Protection",
                "Global Network",
                "KV Storage",
            ],
            "description": "Edge computing platform with global network",
            "pricing": "Free tier available",
            "deploy_time": "~15 seconds",
        },
        "railway": {
            "features": [
                "Instant Deploy",
                "Auto Scaling",
                "Database Support",
                "Monitoring",
                "Logs",
            ],
            "description": "Modern platform for backend deployment",
            "pricing": "$5/month per service",
            "deploy_time": "~2 minutes",
        },
        "render": {
            "features": [
                "Free SSL",
                "Auto Deploy",
                "Database Included",
                "DDoS Protection",
                "Cron Jobs",
            ],
            "description": "Unified cloud to build and run all your apps",
            "pricing": "Free tier available",
            "deploy_time": "~3 minutes",
        },
        "flyio": {
            "features": [
                "Edge Locations",
                "Auto Scaling",
                "Fast Boot",
                "Global Network",
                "Persistent Volumes",
            ],
            "description": "Run apps globally with edge computing",
            "pricing": "Pay as you go",
            "deploy_time": "~1 minute",
        },
        "docker": {
            "features": [
                "Containerization",
                "Health Checks",
                "Multi-stage Build",
                "Docker Compose",
                "Portable",
            ],
            "description": "Container platform for any deployment",
            "pricing": "Free (self-hosted)",
            "deploy_time": "~5 minutes",
        },
        "github_actions": {
            "features": [
                "iOS TestFlight",
                "Android Play Store",
                "Automated CI/CD",
                "Version Tagging",
                "Workflow Automation",
            ],
            "description": "Automated mobile app deployment",
            "pricing": "Free for public repos",
            "deploy_time": "~10-15 minutes",
        },
        "fastlane": {
            "features": [
                "iOS Automation",
                "Android Automation",
                "Screenshot Generation",
                "Metadata Management",
                "Beta Distribution",
            ],
            "description": "Mobile deployment automation tool",
            "pricing": "Free (open source)",
            "deploy_time": "~5-10 minutes",
        },
    }

    if platform not in features_map:
        raise HTTPException(status_code=404, detail=f"Plattform '{platform}' nicht gefunden")

    return {"platform": platform, **features_map[platform]}


@router.get("/templates/{platform}")
async def get_deployment_template(platform: str):
    """
    Gibt Deployment-Template für spezifische Plattform zurück

    GET /deploy/templates/vercel

    Returns: Configuration template
    """
    templates = {
        "vercel": {
            "vercel.json": {
                "version": 2,
                "builds": [{"src": "package.json", "use": "@vercel/next"}],
                "routes": [
                    {"src": "/api/(.*)", "dest": "/api/$1"},
                    {"src": "/(.*)", "dest": "/$1"},
                ],
            }
        },
        "docker": {
            "Dockerfile": """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]""",
            "docker-compose.yml": """version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}""",
        },
        "railway": {
            "railway.json": {
                "build": {"builder": "NIXPACKS"},
                "deploy": {
                    "restartPolicyType": "ON_FAILURE",
                    "restartPolicyMaxRetries": 10,
                },
            },
            "Procfile": "web: uvicorn main:app --host 0.0.0.0 --port $PORT",
        },
    }

    if platform not in templates:
        raise HTTPException(status_code=404, detail=f"Template für '{platform}' nicht gefunden")

    return {"platform": platform, "templates": templates[platform]}


@router.post("/validate/config")
async def validate_deployment_config(platform: str, config: Dict[str, Any]):
    """
    Validiert Deployment-Konfiguration

    POST /deploy/validate/config?platform=vercel
    {
        "version": 2,
        "builds": [...]
    }

    Returns:
    {
        "valid": true,
        "errors": [],
        "warnings": []
    }
    """
    errors = []
    warnings = []

    if platform == "vercel":
        if "version" not in config:
            errors.append("'version' field is required")
        elif config["version"] != 2:
            warnings.append("Version should be 2 for latest features")

        if "builds" not in config:
            errors.append("'builds' field is required")

    elif platform == "docker":
        # Validate Dockerfile existence or content
        if "FROM" not in str(config):
            errors.append("Dockerfile must start with 'FROM' instruction")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "platform": platform,
    }


@router.get("/health")
async def health_check():
    """Health Check für Deployment Generator"""
    return {
        "status": "healthy",
        "service": "Deployment Generator",
        "version": "1.0.0",
        "features": [
            "Multi-Platform Support",
            "Web Deployment",
            "Backend Deployment",
            "Mobile CI/CD",
            "Docker Containers",
            "Auto Configuration",
        ],
    }