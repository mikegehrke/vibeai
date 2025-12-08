# -------------------------------------------------------------
# VIBEAI – CODE GENERATOR ROUTES
# -------------------------------------------------------------
"""
REST API für Code-Generierung

Endpoints:
- POST /ai/generate/flutter - Generiert Flutter/Dart Code
- POST /ai/generate/react - Generiert React/JSX Code
- POST /ai/generate/vue - Generiert Vue Code
- POST /ai/generate/html - Generiert statisches HTML
- POST /ai/generate/app - Generiert komplette Multi-Screen App

Integration mit:
- AI UI Generator (für AI → UI → Code Flow)
- Preview System (für Live Preview)
- Build System (für Build → APK Flow)
"""

from typing import Dict

from fastapi import APIRouter, HTTPException, Request

from ai.code_generator.code_formatter import formatter
from ai.code_generator.flutter_generator import flutter_generator
from ai.code_generator.react_generator import react_generator
from preview.preview_renderer import preview_renderer

router = APIRouter(prefix="/ai/generate", tags=["AI Code Generator"])


# -------------------------------------------------------------
# FLUTTER CODE GENERATION
# -------------------------------------------------------------
@router.post("/flutter")
async def generate_flutter_code(request: Request) -> Dict:
    """
    Generiert Flutter/Dart Code aus UI Structure.

    Request Body:
    {
        "screen": {
            "name": "LoginScreen",
            "title": "Login",
            "components": [
                {
                    "type": "text",
                    "text": "Welcome",
                    "props": { "size": "large", "color": "#333333" }
                },
                {
                    "type": "input",
                    "props": { "placeholder": "Email" }
                },
                {
                    "type": "button",
                    "text": "Login",
                    "props": { "color": "#2196f3" }
                }
            ]
        }
    }

    Response:
    {
        "success": true,
        "flutter": "import 'package:flutter/material.dart'; ...",
        "html": "<html>...</html>",
        "language": "flutter",
        "screen_name": "LoginScreen"
    }
    """
    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(status_code=400, detail="Missing 'screen' in request body")

        # Generate Flutter code
        code = flutter_generator.render_screen(screen)
        code = formatter.format_flutter(code)
        code = formatter.ensure_trailing_newline(code)

        # Generate HTML preview
        html = preview_renderer.render_screen_html(screen)

        return {
            "success": True,
            "flutter": code,
            "html": html,
            "language": "flutter",
            "screen_name": screen.get("name", "Screen"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flutter generation failed: {str(e)}")


# -------------------------------------------------------------
# REACT CODE GENERATION
# -------------------------------------------------------------
@router.post("/react")
async def generate_react_code(request: Request) -> Dict:
    """
    Generiert React/JSX Code aus UI Structure.

    Request Body:
    {
        "screen": {
            "name": "LoginScreen",
            "title": "Login",
            "components": [...]
        }
    }

    Response:
    {
        "success": true,
        "react": "import React from 'react'; ...",
        "html": "<html>...</html>",
        "language": "react",
        "screen_name": "LoginScreen"
    }
    """
    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(status_code=400, detail="Missing 'screen' in request body")

        # Generate React code
        code = react_generator.render_screen(screen)
        code = formatter.format_js(code)
        code = formatter.ensure_trailing_newline(code)

        # Generate HTML preview
        html = preview_renderer.render_screen_html(screen)

        return {
            "success": True,
            "react": code,
            "html": html,
            "language": "react",
            "screen_name": screen.get("name", "Screen"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"React generation failed: {str(e)}")


# -------------------------------------------------------------
# VUE CODE GENERATION
# -------------------------------------------------------------
@router.post("/vue")
async def generate_vue_code(request: Request) -> Dict:
    """
    Generiert Vue Code aus UI Structure.

    Request Body:
    {
        "screen": {
            "name": "LoginScreen",
            "title": "Login",
            "components": [...]
        }
    }

    Response:
    {
        "success": true,
        "vue": "<template>...</template>...",
        "html": "<html>...</html>",
        "language": "vue",
        "screen_name": "LoginScreen"
    }
    """
    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(status_code=400, detail="Missing 'screen' in request body")

        # Generate Vue code (using React generator as placeholder for now)
        # TODO: Implement dedicated VueGenerator
        code = react_generator.render_screen(screen)
        code = formatter.format_code(code, "vue")
        code = formatter.ensure_trailing_newline(code)

        # Generate HTML preview
        html = preview_renderer.render_screen_html(screen)

        return {
            "success": True,
            "vue": code,
            "html": html,
            "language": "vue",
            "screen_name": screen.get("name", "Screen"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vue generation failed: {str(e)}")


# -------------------------------------------------------------
# HTML CODE GENERATION
# -------------------------------------------------------------
@router.post("/html")
async def generate_html_code(request: Request) -> Dict:
    """
    Generiert statisches HTML/CSS aus UI Structure.

    Request Body:
    {
        "screen": {
            "name": "LoginScreen",
            "title": "Login",
            "components": [...]
        }
    }

    Response:
    {
        "success": true,
        "html": "<!DOCTYPE html>...",
        "language": "html",
        "screen_name": "LoginScreen"
    }
    """
    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(status_code=400, detail="Missing 'screen' in request body")

        # Generate HTML code (already done by preview_renderer)
        html = preview_renderer.render_screen_html(screen)
        html = formatter.format_html(html)
        html = formatter.ensure_trailing_newline(html)

        return {
            "success": True,
            "html": html,
            "language": "html",
            "screen_name": screen.get("name", "Screen"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HTML generation failed: {str(e)}")


# -------------------------------------------------------------
# COMPLETE APP GENERATION
# -------------------------------------------------------------
@router.post("/app")
async def generate_complete_app(request: Request) -> Dict:
    """
    Generiert komplette Multi-Screen App.

    Request Body:
    {
        "app_structure": {
            "app_name": "MyApp",
            "framework": "flutter",  // oder "react"
            "screens": [
                {
                    "name": "HomeScreen",
                    "title": "Home",
                    "components": [...]
                },
                {
                    "name": "ProfileScreen",
                    "title": "Profile",
                    "components": [...]
                }
            ],
            "navigation": {
                "initial": "HomeScreen",
                "routes": ["HomeScreen", "ProfileScreen"]
            },
            "theme": {
                "primaryColor": "#2196f3",
                "backgroundColor": "#ffffff"
            }
        }
    }

    Response:
    {
        "success": true,
        "files": {
            "lib/main.dart": "...",
            "lib/screens/home_screen.dart": "...",
            "lib/screens/profile_screen.dart": "..."
        },
        "framework": "flutter",
        "app_name": "MyApp"
    }
    """
    try:
        body = await request.json()
        app_structure = body.get("app_structure")

        if not app_structure:
            raise HTTPException(status_code=400, detail="Missing 'app_structure' in request body")

        framework = app_structure.get("framework", "flutter").lower()

        # Generate files based on framework
        if framework == "flutter":
            files = flutter_generator.render_app(app_structure)
        elif framework == "react":
            files = react_generator.render_app(app_structure)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported framework: {framework}")

        # Format all files
        formatted_files = {}
        for filename, code in files.items():
            if filename.endswith(".dart"):
                formatted_code = formatter.format_flutter(code)
            elif filename.endswith(".jsx") or filename.endswith(".js"):
                formatted_code = formatter.format_js(code)
            else:
                formatted_code = code

            formatted_files[filename] = formatter.ensure_trailing_newline(formatted_code)

        return {
            "success": True,
            "files": formatted_files,
            "framework": framework,
            "app_name": app_structure.get("app_name", "MyApp"),
            "file_count": len(formatted_files),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"App generation failed: {str(e)}")


# -------------------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------------------
@router.get("/health")
async def health_check() -> Dict:
    """
    Health Check für Code Generator.

    Response:
    {
        "status": "healthy",
        "generators": ["flutter", "react", "vue", "html"],
        "formatters": ["dart", "js", "python", "html", "css"]
    }
    """
    return {
        "status": "healthy",
        "generators": ["flutter", "react", "vue", "html"],
        "formatters": ["dart", "js", "python", "html", "css"],
    }
