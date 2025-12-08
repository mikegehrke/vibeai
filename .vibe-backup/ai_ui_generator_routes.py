# -------------------------------------------------------------
# VIBEAI – AI UI GENERATOR ROUTES
# -------------------------------------------------------------
"""
API Endpoints für KI UI Generator

Endpoints:
- POST /ai/generate_ui - UI aus Prompt generieren
- POST /ai/suggest_components - Component-Vorschläge
- POST /ai/improve_ui - Bestehendes UI verbessern
- POST /ai/generate_app - Komplette App generieren

Full Cycle:
    Prompt → AI → UI Structure → HTML Preview → Code → Build → APK
"""

from typing import Dict

from ai.ui_generator import ai_ui_generator
from auth import get_current_user
from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/ai", tags=["AI UI Generator"])


# -------------------------------------------------------------
# GENERATE UI FROM PROMPT
# -------------------------------------------------------------
@router.post("/generate_ui")
async def generate_ui(request: Request) -> Dict:
    """
    Generiert UI aus Natural Language Prompt.

    🎯 FULL CYCLE:
    1. User Prompt → AI Model
    2. AI → UI Structure (JSON)
    3. UI Structure → HTML Preview
    4. Code Generation (Flutter/React/Vue)
    5. Ready for Build System

    Request Body:
        {
            "prompt": "Create a login screen with email and password",
            "framework": "flutter",
            "style": "material"
        }

    Response:
        {
            "success": True,
            "screen": {
                "name": "LoginScreen",
                "components": [
                    {"type": "heading", "text": "Login"},
                    {"type": "input", "props": {"placeholder": "Email"}},
                    {"type": "input", "props": {"placeholder": "Password"}},
                    {"type": "button", "text": "Login"}
                ]
            },
            "html_preview": "<html>...</html>",
            "code": "class LoginScreen extends StatelessWidget...",
            "framework": "flutter"
        }

    Usage:
        # Frontend
        const res = await fetch("/ai/generate_ui", {
            method: "POST",
            body: JSON.stringify({
                prompt: "Login screen",
                framework: "flutter"
            })
        });
        const { screen, html_preview, code } = await res.json();

        # Preview im IFRAME
        <iframe srcDoc={html_preview} />

        # Code im Editor
        <CodeEditor value={code} language="dart" />

        # Build starten
        await fetch("/build/start", {
            method: "POST",
            body: JSON.stringify({ code_files: {...} })
        });
    """

    try:
        await get_current_user(request)
        body = await request.json()

        prompt = body.get("prompt")
        framework = body.get("framework", "flutter")
        style = body.get("style", "material")

        if not prompt:
            raise HTTPException(400, "Missing 'prompt'")

        # Generate UI
        result = await ai_ui_generator.generate_ui_from_prompt(prompt=prompt, framework=framework, style=style)

        return result

    except Exception as e:
        print(f"Error generating UI: {e}")
        raise HTTPException(500, f"Failed to generate UI: {str(e)}")


# -------------------------------------------------------------
# SUGGEST COMPONENTS
# -------------------------------------------------------------
@router.post("/suggest_components")
async def suggest_components(request: Request) -> Dict:
    """
    Schlägt passende Components vor.

    Request Body:
        {
            "description": "I need a user profile form",
            "existing_components": [...]
        }

    Response:
        {
            "success": True,
            "components": [
                {"type": "heading", "text": "Profile"},
                {"type": "input", "props": {"placeholder": "Name"}},
                {"type": "input", "props": {"placeholder": "Email"}},
                {"type": "button", "text": "Save"}
            ]
        }
    """

    try:
        await get_current_user(request)
        body = await request.json()

        description = body.get("description")
        existing_components = body.get("existing_components", [])

        if not description:
            raise HTTPException(400, "Missing 'description'")

        components = await ai_ui_generator.suggest_components(
            description=description, existing_components=existing_components
        )

        return {"success": True, "components": components}

    except Exception as e:
        print(f"Error suggesting components: {e}")
        raise HTTPException(500, f"Failed to suggest components: {str(e)}")


# -------------------------------------------------------------
# IMPROVE UI
# -------------------------------------------------------------
@router.post("/improve_ui")
async def improve_ui(request: Request) -> Dict:
    """
    Verbessert bestehendes UI.

    Request Body:
        {
            "screen": { ... },
            "improvement_request": "Make it more modern and add icons"
        }

    Response:
        {
            "success": True,
            "screen": { ... improved ... },
            "html_preview": "<html>...</html>"
        }
    """

    try:
        await get_current_user(request)
        body = await request.json()

        screen = body.get("screen")
        improvement_request = body.get("improvement_request")

        if not screen or not improvement_request:
            raise HTTPException(400, "Missing 'screen' or 'improvement_request'")

        improved_screen = await ai_ui_generator.improve_ui(screen=screen, improvement_request=improvement_request)

        # HTML Preview generieren
        from preview.preview_renderer import PreviewRenderer

        renderer = PreviewRenderer()
        html_preview = renderer.render_screen_html(improved_screen, "tailwind")

        return {
            "success": True,
            "screen": improved_screen,
            "html_preview": html_preview,
        }

    except Exception as e:
        print(f"Error improving UI: {e}")
        raise HTTPException(500, f"Failed to improve UI: {str(e)}")


# -------------------------------------------------------------
# GENERATE COMPLETE APP
# -------------------------------------------------------------
@router.post("/generate_app")
async def generate_app(request: Request) -> Dict:
    """
    Generiert komplette Multi-Screen App.

    Request Body:
        {
            "app_description": "E-commerce app with products, cart, and checkout",
            "framework": "flutter"
        }

    Response:
        {
            "success": True,
            "app_name": "MyEcommerceApp",
            "screens": [
                {"name": "HomeScreen", "components": [...]},
                {"name": "ProductScreen", "components": [...]},
                {"name": "CartScreen", "components": [...]}
            ],
            "navigation": {...},
            "theme": {...},
            "code_files": {
                "HomeScreen.dart": "...",
                "ProductScreen.dart": "...",
                "CartScreen.dart": "..."
            }
        }

    Next Steps:
        1. Save code_files to project
        2. Start build via /build/start
        3. Get APK via /build/{id}/download
    """

    try:
        await get_current_user(request)
        body = await request.json()

        app_description = body.get("app_description")
        framework = body.get("framework", "flutter")

        if not app_description:
            raise HTTPException(400, "Missing 'app_description'")

        app_structure = await ai_ui_generator.generate_complete_app(
            app_description=app_description, framework=framework
        )

        return {"success": True, **app_structure}

    except Exception as e:
        print(f"Error generating app: {e}")
        raise HTTPException(500, f"Failed to generate app: {str(e)}")


# -------------------------------------------------------------
# VALIDATE UI STRUCTURE
# -------------------------------------------------------------
@router.post("/validate_ui")
async def validate_ui(request: Request) -> Dict:
    """
    Validiert UI Structure.

    Request Body:
        {
            "screen": { ... }
        }

    Response:
        {
            "valid": True,
            "errors": [],
            "warnings": ["Missing text in component 2"]
        }
    """

    try:
        body = await request.json()
        screen = body.get("screen")

        if not screen:
            raise HTTPException(400, "Missing 'screen'")

        errors = []
        warnings = []

        # Check required fields
        if not screen.get("name"):
            errors.append("Missing 'name' field")

        if not screen.get("components"):
            warnings.append("No components defined")

        # Validate components
        for i, comp in enumerate(screen.get("components", [])):
            if not comp.get("type"):
                errors.append(f"Component {i}: Missing 'type'")

            if comp.get("type") in ["button", "text", "heading"] and not comp.get("text"):
                warnings.append(f"Component {i}: Missing text content")

        return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}

    except Exception as e:
        print(f"Error validating UI: {e}")
        raise HTTPException(500, f"Failed to validate UI: {str(e)}")
