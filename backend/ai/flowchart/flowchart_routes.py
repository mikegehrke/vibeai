# -------------------------------------------------------------
# VIBEAI – FLOWCHART API ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .flowchart_analyzer import (
    AuthLevel,
    FlowIssue,
    NavigationEdge,
    NavigationType,
    Screen,
    ScreenType,
    flowchart_analyzer,
)

router = APIRouter(prefix="/flowchart", tags=["AI Flowcharts"])

# ========== PYDANTIC MODELS ==========


class AnalyzeCodeRequest(BaseModel):
    """Analyze code to extract flowchart"""

    code: str = Field(..., description="Source code")
    framework: str = Field(..., description="Framework (flutter, react, etc)")


class AnalyzeFlowRequest(BaseModel):
    """Analyze existing flowchart"""

    screens: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class ApplyFixRequest(BaseModel):
    """Apply auto-fix"""

    issue: Dict[str, Any]


class ExportRequest(BaseModel):
    """Export flowchart"""

    screens: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    format: str = Field(..., description="mermaid, json, or svg")


# ========== ENDPOINTS ==========


@router.post("/analyze-code")
async def analyze_code(request: AnalyzeCodeRequest):
    """
    🔹 ANALYZE CODE → FLOWCHART

    Auto-detects:
    - Screens from code
    - Navigation paths
    - Auth requirements
    - Screen types (modal, tab, etc)
    """
    try:
        screens = flowchart_analyzer.detect_screens_from_code(request.code, request.framework)

        edges = flowchart_analyzer.detect_navigation_from_code(request.code, request.framework)

        # Analyze detected flow
        analysis = flowchart_analyzer.analyze_flow(screens, edges)

        return {
            "success": True,
            "screens": [s.to_dict() for s in screens],
            "edges": [e.to_dict() for e in edges],
            "analysis": analysis,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code analysis failed: {str(e)}")


@router.post("/analyze-flow")
async def analyze_flow(request: AnalyzeFlowRequest):
    """
    🔹 ANALYZE FLOWCHART

    Checks for:
    - Unreachable screens
    - Dead ends
    - Missing auth guards
    - Missing logout flow
    - Payment recovery
    - Error handling
    """
    try:
        # Convert dicts to objects
        screens = [
            Screen(
                name=s["name"],
                route=s["route"],
                screen_type=ScreenType(s.get("screen_type", "fullscreen")),
                auth_level=AuthLevel(s.get("auth_level", "public")),
                params=s.get("params", []),
                tabs=s.get("tabs", []),
                has_bottom_nav=s.get("has_bottom_nav", False),
                has_drawer=s.get("has_drawer", False),
                is_entry_point=s.get("is_entry_point", False),
                color=s.get("color", "#3b82f6"),
            )
            for s in request.screens
        ]

        edges = [
            NavigationEdge(
                from_screen=e["from_screen"],
                to_screen=e["to_screen"],
                navigation_type=NavigationType(e.get("navigation_type", "push")),
                condition=e.get("condition"),
                requires_auth=e.get("requires_auth", False),
                params_passed=e.get("params_passed", []),
                label=e.get("label", ""),
                color=e.get("color", "#667eea"),
            )
            for e in request.edges
        ]

        analysis = flowchart_analyzer.analyze_flow(screens, edges)

        return {"success": True, "analysis": analysis}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow analysis failed: {str(e)}")


@router.post("/auto-fix")
async def apply_auto_fix(request: ApplyFixRequest):
    """
    🔹 APPLY AUTO-FIX

    Automatically fixes:
    - Add missing screens
    - Add navigation edges
    - Add auth guards
    - Add logout flow
    - Add payment recovery
    """
    try:
        issue = FlowIssue(
            severity=request.issue["severity"],
            screen=request.issue.get("screen"),
            message=request.issue["message"],
            suggestion=request.issue.get("suggestion"),
            auto_fixable=request.issue.get("auto_fixable", False),
            fix_data=request.issue.get("fix_data"),
        )

        result = flowchart_analyzer.apply_auto_fix(issue)

        return {
            "success": result["success"],
            "message": result["message"],
            "data": result.get("screen") or result.get("edge"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-fix failed: {str(e)}")


@router.post("/export")
async def export_flowchart(request: ExportRequest):
    """
    🔹 EXPORT FLOWCHART

    Formats:
    - mermaid: Mermaid flowchart syntax
    - json: JSON structure
    - svg: SVG image (future)
    """
    try:
        # Set flowchart data
        screens = [
            Screen(
                name=s["name"],
                route=s["route"],
                screen_type=ScreenType(s.get("screen_type", "fullscreen")),
                auth_level=AuthLevel(s.get("auth_level", "public")),
                params=s.get("params", []),
                tabs=s.get("tabs", []),
                has_bottom_nav=s.get("has_bottom_nav", False),
                has_drawer=s.get("has_drawer", False),
                is_entry_point=s.get("is_entry_point", False),
                color=s.get("color", "#3b82f6"),
            )
            for s in request.screens
        ]

        edges = [
            NavigationEdge(
                from_screen=e["from_screen"],
                to_screen=e["to_screen"],
                navigation_type=NavigationType(e.get("navigation_type", "push")),
                condition=e.get("condition"),
                requires_auth=e.get("requires_auth", False),
                params_passed=e.get("params_passed", []),
                label=e.get("label", ""),
                color=e.get("color", "#667eea"),
            )
            for e in request.edges
        ]

        flowchart_analyzer.screens = {s.name: s for s in screens}
        flowchart_analyzer.edges = edges

        if request.format == "mermaid":
            content = flowchart_analyzer.export_to_mermaid()
        elif request.format == "json":
            content = flowchart_analyzer.export_to_json()
        else:
            raise ValueError(f"Unsupported format: {request.format}")

        return {"success": True, "format": request.format, "content": content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/templates")
async def get_flowchart_templates():
    """
    🔹 FLOWCHART TEMPLATES

    Pre-built flowchart templates
    """
    templates = {
        "simple_app": {
            "name": "Simple App",
            "description": "Basic app with home, settings, profile",
            "screens": [
                {
                    "name": "HomeScreen",
                    "route": "/",
                    "screen_type": "fullscreen",
                    "auth_level": "public",
                    "is_entry_point": True,
                },
                {
                    "name": "SettingsScreen",
                    "route": "/settings",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
                {
                    "name": "ProfileScreen",
                    "route": "/profile",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
            ],
            "edges": [
                {
                    "from_screen": "HomeScreen",
                    "to_screen": "SettingsScreen",
                    "navigation_type": "push",
                },
                {
                    "from_screen": "HomeScreen",
                    "to_screen": "ProfileScreen",
                    "navigation_type": "push",
                },
            ],
        },
        "ecommerce": {
            "name": "E-Commerce",
            "description": "Shop with cart and checkout",
            "screens": [
                {
                    "name": "HomeScreen",
                    "route": "/",
                    "screen_type": "fullscreen",
                    "auth_level": "public",
                    "is_entry_point": True,
                },
                {
                    "name": "ProductListScreen",
                    "route": "/products",
                    "screen_type": "fullscreen",
                    "auth_level": "public",
                },
                {
                    "name": "CartScreen",
                    "route": "/cart",
                    "screen_type": "fullscreen",
                    "auth_level": "public",
                },
                {
                    "name": "CheckoutScreen",
                    "route": "/checkout",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
                {
                    "name": "PaymentScreen",
                    "route": "/payment",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
                {
                    "name": "PaymentSuccessScreen",
                    "route": "/payment/success",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
                {
                    "name": "PaymentFailureScreen",
                    "route": "/payment/failure",
                    "screen_type": "fullscreen",
                    "auth_level": "auth_required",
                },
            ],
            "edges": [
                {
                    "from_screen": "HomeScreen",
                    "to_screen": "ProductListScreen",
                    "navigation_type": "push",
                },
                {
                    "from_screen": "ProductListScreen",
                    "to_screen": "CartScreen",
                    "navigation_type": "push",
                },
                {
                    "from_screen": "CartScreen",
                    "to_screen": "CheckoutScreen",
                    "navigation_type": "push",
                    "requires_auth": True,
                },
                {
                    "from_screen": "CheckoutScreen",
                    "to_screen": "PaymentScreen",
                    "navigation_type": "push",
                },
                {
                    "from_screen": "PaymentScreen",
                    "to_screen": "PaymentSuccessScreen",
                    "navigation_type": "replace",
                    "label": "On Success",
                },
                {
                    "from_screen": "PaymentScreen",
                    "to_screen": "PaymentFailureScreen",
                    "navigation_type": "replace",
                    "label": "On Failure",
                },
                {
                    "from_screen": "PaymentFailureScreen",
                    "to_screen": "PaymentScreen",
                    "navigation_type": "replace",
                    "label": "Retry",
                },
            ],
        },
    }

    return {"success": True, "templates": templates}


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK
    """
    return {"status": "healthy", "service": "AI Flowchart Analyzer", "version": "1.0.0"}