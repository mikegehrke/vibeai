# -------------------------------------------------------------
# VIBEAI – DEPLOYMENT GENERATOR
# -------------------------------------------------------------
import os
from typing import Dict, Any, Optional, List


class DeployGenerator:
    """
    Generiert Deployment-Konfigurationen für verschiedene Plattformen:
    - Web: Vercel, Netlify, Cloudflare Pages
    - Backend: Railway, Render, Fly.io, Docker
    - Mobile: GitHub Actions für App Store & Play Store
    """

    def __init__(self):
        self.supported_platforms = {
            "web": ["vercel", "netlify", "cloudflare"],
            "backend": ["railway", "render", "flyio", "docker"],
            "mobile": ["github_actions", "fastlane"]
        }

    def generate_deployment(
        self,
        platform: str,
        project_type: str,
        base_path: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generiert Deployment-Konfiguration für spezifische Plattform
        
        Args:
            platform: vercel, netlify, railway, render, docker, etc.
            project_type: web, backend, mobile
            base_path: Projekt-Pfad
            options: Zusätzliche Optionen
        
        Returns:
            Dict mit success, files, platform, features
        """
        options = options or {}
        
        # Web Deployments
        if platform == "vercel":
            return self._generate_vercel(base_path, options)
        elif platform == "netlify":
            return self._generate_netlify(base_path, options)
        elif platform == "cloudflare":
            return self._generate_cloudflare(base_path, options)
        
        # Backend Deployments
        elif platform == "railway":
            return self._generate_railway(base_path, options)
        elif platform == "render":
            return self._generate_render(base_path, options)
        elif platform == "flyio":
            return self._generate_flyio(base_path, options)
        elif platform == "docker":
            return self._generate_docker(base_path, options)
        
        # Mobile Deployments
        elif platform == "github_actions":
            return self._generate_github_actions(base_path, options)
        elif platform == "fastlane":
            return self._generate_fastlane(base_path, options)
        
        return {
            "success": False,
            "error": f"Plattform '{platform}' nicht unterstützt"
        }

    # ===== WEB DEPLOYMENTS =====

    def _generate_vercel(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Vercel-Konfiguration für Next.js"""
        files = []
        
        # vercel.json
        vercel_config = {
            "version": 2,
            "builds": [
                {"src": "package.json", "use": "@vercel/next"}
            ],
            "routes": [
                {"src": "/api/(.*)", "dest": "/api/$1"},
                {"src": "/(.*)", "dest": "/$1"}
            ]
        }
        
        if options.get("env_vars"):
            vercel_config["env"] = options["env_vars"]
        
        vercel_path = f"{base_path}/vercel.json"
        os.makedirs(os.path.dirname(vercel_path), exist_ok=True)
        with open(vercel_path, "w") as f:
            import json
            json.dump(vercel_config, f, indent=2)
        files.append(vercel_path)
        
        # .vercelignore
        vercelignore_content = """node_modules
.next
.env.local
.DS_Store
*.log
"""
        vercelignore_path = f"{base_path}/.vercelignore"
        with open(vercelignore_path, "w") as f:
            f.write(vercelignore_content)
        files.append(vercelignore_path)
        
        # Deploy script
        deploy_script = """#!/bin/bash
# Vercel Deployment Script
echo "🚀 Deploying to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    npm install -g vercel
fi

# Deploy
vercel --prod

echo "✅ Deployment complete!"
"""
        deploy_path = f"{base_path}/deploy-vercel.sh"
        with open(deploy_path, "w") as f:
            f.write(deploy_script)
        os.chmod(deploy_path, 0o755)
        files.append(deploy_path)
        
        return {
            "success": True,
            "platform": "vercel",
            "files": files,
            "features": [
                "Next.js Optimized",
                "Edge Functions",
                "Auto SSL",
                "Global CDN",
                "Preview Deployments"
            ],
            "deploy_command": "vercel --prod"
        }

    def _generate_netlify(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Netlify-Konfiguration"""
        files = []
        
        # netlify.toml
        netlify_config = """[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"""
        netlify_path = f"{base_path}/netlify.toml"
        os.makedirs(os.path.dirname(netlify_path), exist_ok=True)
        with open(netlify_path, "w") as f:
            f.write(netlify_config)
        files.append(netlify_path)
        
        # _headers for security
        headers_content = """/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
"""
        headers_path = f"{base_path}/public/_headers"
        os.makedirs(os.path.dirname(headers_path), exist_ok=True)
        with open(headers_path, "w") as f:
            f.write(headers_content)
        files.append(headers_path)
        
        return {
            "success": True,
            "platform": "netlify",
            "files": files,
            "features": [
                "Continuous Deployment",
                "Serverless Functions",
                "Form Handling",
                "Split Testing"
            ],
            "deploy_command": "netlify deploy --prod"
        }

    def _generate_cloudflare(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Cloudflare Pages Konfiguration"""
        files = []
        
        # wrangler.toml
        wrangler_config = """name = "vibeai-app"
type = "webpack"

[site]
bucket = "./out"

[build]
command = "npm run build"
[build.upload]
format = "service-worker"
"""
        wrangler_path = f"{base_path}/wrangler.toml"
        os.makedirs(os.path.dirname(wrangler_path), exist_ok=True)
        with open(wrangler_path, "w") as f:
            f.write(wrangler_config)
        files.append(wrangler_path)
        
        return {
            "success": True,
            "platform": "cloudflare",
            "files": files,
            "features": [
                "Edge Computing",
                "Workers",
                "DDoS Protection",
                "Global Network"
            ],
            "deploy_command": "wrangler publish"
        }

    # ===== BACKEND DEPLOYMENTS =====

    def _generate_docker(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Docker-Konfiguration"""
        files = []
        framework = options.get("framework", "fastapi")
        
        # Dockerfile
        if framework == "fastapi":
            dockerfile_content = """FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
        elif framework == "express":
            dockerfile_content = """FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health')"

# Run application
CMD ["node", "index.js"]
"""
        else:
            dockerfile_content = """FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
"""
        
        dockerfile_path = f"{base_path}/Dockerfile"
        os.makedirs(os.path.dirname(dockerfile_path), exist_ok=True)
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_content)
        files.append(dockerfile_path)
        
        # .dockerignore
        dockerignore_content = """__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
.git
.gitignore
README.md
.DS_Store
node_modules
npm-debug.log
"""
        dockerignore_path = f"{base_path}/.dockerignore"
        with open(dockerignore_path, "w") as f:
            f.write(dockerignore_content)
        files.append(dockerignore_path)
        
        # docker-compose.yml
        compose_content = """version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
    restart: unless-stopped
    
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=vibeai
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
"""
        compose_path = f"{base_path}/docker-compose.yml"
        with open(compose_path, "w") as f:
            f.write(compose_content)
        files.append(compose_path)
        
        return {
            "success": True,
            "platform": "docker",
            "files": files,
            "features": [
                "Containerization",
                "Health Checks",
                "Multi-stage Build",
                "Docker Compose"
            ],
            "deploy_command": "docker-compose up -d"
        }

    def _generate_railway(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Railway-Konfiguration"""
        files = []
        
        # railway.json
        railway_config = {
            "build": {
                "builder": "NIXPACKS"
            },
            "deploy": {
                "restartPolicyType": "ON_FAILURE",
                "restartPolicyMaxRetries": 10
            }
        }
        
        railway_path = f"{base_path}/railway.json"
        os.makedirs(os.path.dirname(railway_path), exist_ok=True)
        with open(railway_path, "w") as f:
            import json
            json.dump(railway_config, f, indent=2)
        files.append(railway_path)
        
        # Procfile
        procfile_content = "web: uvicorn main:app --host 0.0.0.0 --port $PORT\n"
        procfile_path = f"{base_path}/Procfile"
        with open(procfile_path, "w") as f:
            f.write(procfile_content)
        files.append(procfile_path)
        
        return {
            "success": True,
            "platform": "railway",
            "files": files,
            "features": [
                "Instant Deploy",
                "Auto Scaling",
                "Database Support",
                "Monitoring"
            ],
            "deploy_command": "railway up"
        }

    def _generate_render(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Render-Konfiguration"""
        files = []
        
        # render.yaml
        render_config = """services:
  - type: web
    name: vibeai-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: vibeai-db
          property: connectionString
    
databases:
  - name: vibeai-db
    databaseName: vibeai
    user: admin
"""
        render_path = f"{base_path}/render.yaml"
        os.makedirs(os.path.dirname(render_path), exist_ok=True)
        with open(render_path, "w") as f:
            f.write(render_config)
        files.append(render_path)
        
        return {
            "success": True,
            "platform": "render",
            "files": files,
            "features": [
                "Free SSL",
                "Auto Deploy",
                "Database Included",
                "DDoS Protection"
            ],
            "deploy_command": "render deploy"
        }

    def _generate_flyio(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Fly.io Konfiguration"""
        files = []
        
        # fly.toml
        fly_config = """app = "vibeai-api"
primary_region = "ams"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[services]]
  http_checks = []
  internal_port = 8000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
"""
        fly_path = f"{base_path}/fly.toml"
        os.makedirs(os.path.dirname(fly_path), exist_ok=True)
        with open(fly_path, "w") as f:
            f.write(fly_config)
        files.append(fly_path)
        
        return {
            "success": True,
            "platform": "flyio",
            "files": files,
            "features": [
                "Edge Locations",
                "Auto Scaling",
                "Fast Boot",
                "Global Network"
            ],
            "deploy_command": "fly deploy"
        }

    # ===== MOBILE DEPLOYMENTS =====

    def _generate_github_actions(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert GitHub Actions für Mobile Deployment"""
        files = []
        
        # iOS Workflow
        ios_workflow = """name: iOS Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: macos-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Build iOS
        run: flutter build ios --release --no-codesign
      
      - name: Upload to TestFlight
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: build/ios/ipa/*.ipa
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_PRIVATE_KEY }}
"""
        ios_path = f"{base_path}/.github/workflows/ios-deploy.yml"
        os.makedirs(os.path.dirname(ios_path), exist_ok=True)
        with open(ios_path, "w") as f:
            f.write(ios_workflow)
        files.append(ios_path)
        
        # Android Workflow
        android_workflow = """name: Android Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Build APK
        run: flutter build apk --release
      
      - name: Build App Bundle
        run: flutter build appbundle --release
      
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_CONFIG_JSON }}
          packageName: com.vibeai.app
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: production
"""
        android_path = f"{base_path}/.github/workflows/android-deploy.yml"
        with open(android_path, "w") as f:
            f.write(android_workflow)
        files.append(android_path)
        
        return {
            "success": True,
            "platform": "github_actions",
            "files": files,
            "features": [
                "iOS TestFlight",
                "Android Play Store",
                "Automated CI/CD",
                "Version Tagging"
            ],
            "deploy_command": "git push --tags"
        }

    def _generate_fastlane(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Fastlane-Konfiguration"""
        files = []
        
        # Fastfile
        fastfile_content = """default_platform(:ios)

platform :ios do
  desc "Push a new beta build to TestFlight"
  lane :beta do
    increment_build_number(xcodeproj: "ios/Runner.xcodeproj")
    build_app(workspace: "ios/Runner.xcworkspace", scheme: "Runner")
    upload_to_testflight
  end

  desc "Deploy to App Store"
  lane :release do
    increment_build_number(xcodeproj: "ios/Runner.xcodeproj")
    build_app(workspace: "ios/Runner.xcworkspace", scheme: "Runner")
    upload_to_app_store
  end
end

platform :android do
  desc "Deploy to Play Store"
  lane :beta do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(track: "beta")
  end

  desc "Deploy to Production"
  lane :release do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(track: "production")
  end
end
"""
        fastfile_path = f"{base_path}/fastlane/Fastfile"
        os.makedirs(os.path.dirname(fastfile_path), exist_ok=True)
        with open(fastfile_path, "w") as f:
            f.write(fastfile_content)
        files.append(fastfile_path)
        
        return {
            "success": True,
            "platform": "fastlane",
            "files": files,
            "features": [
                "iOS Automation",
                "Android Automation",
                "Screenshot Generation",
                "Metadata Management"
            ],
            "deploy_command": "fastlane ios beta"
        }


# Singleton instance
deploy_generator = DeployGenerator()
