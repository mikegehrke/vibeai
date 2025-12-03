# -------------------------------------------------------------
# VIBEAI – NAVIGATION FLOW ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .flow_generator import flow_generator

router = APIRouter(prefix="/navigation-flow", tags=["Navigation Flow Builder"])


# ========== PYDANTIC MODELS ==========

class GenerateFlowRequest(BaseModel):
    """Request model für Flow-Generierung"""
    framework: str = Field(..., description="Framework (flutter, react, nextjs, react_native, vue)")
    flow_type: str = Field(..., description="Flow Type (checkout, onboarding, auth, profile, custom)")
    screens: Optional[List[Dict[str, Any]]] = Field(None, description="Custom screens")
    edges: Optional[List[Dict[str, Any]]] = Field(None, description="Custom edges")
    entry_point: Optional[str] = Field(None, description="Entry point screen")


class FlowTypesResponse(BaseModel):
    """Response model für Flow Types"""
    flow_types: List[Dict[str, str]]


class FrameworksResponse(BaseModel):
    """Response model für Frameworks"""
    frameworks: List[str]


class GenerateFlowResponse(BaseModel):
    """Response model für Flow-Generierung"""
    success: bool
    framework: str
    flow_type: str
    files: List[str]
    flow_data: Dict[str, Any]
    mermaid_chart: str
    message: str


# ========== ENDPOINTS ==========

@router.post("/generate", response_model=GenerateFlowResponse)
async def generate_flow(request: GenerateFlowRequest):
    """
    🔹 NAVIGATION FLOW GENERIEREN
    
    Generiert kompletten Navigation Flow:
    - Screen Definitions
    - Navigation Edges
    - Framework-spezifische Routes
    - Navigation Guards
    - Flow Chart (Mermaid)
    """
    try:
        if request.framework not in flow_generator.frameworks:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported framework. Available: {', '.join(flow_generator.frameworks)}"
            )
        
        if request.flow_type not in flow_generator.flow_types and request.flow_type != "custom":
            raise HTTPException(
                status_code=400,
                detail=f"Invalid flow type. Available: {', '.join(flow_generator.flow_types)}"
            )
        
        options = {}
        if request.flow_type == "custom":
            if not request.screens or not request.edges:
                raise HTTPException(
                    status_code=400,
                    detail="Custom flow requires 'screens' and 'edges'"
                )
            options = {
                "screens": request.screens,
                "edges": request.edges,
                "entry_point": request.entry_point
            }
        
        result = flow_generator.generate_navigation_flow(
            base_path="/tmp/vibeai_flow",
            framework=request.framework,
            flow_type=request.flow_type,
            options=options
        )
        
        return GenerateFlowResponse(
            success=result["success"],
            framework=result["framework"],
            flow_type=result["flow_type"],
            files=result["files"],
            flow_data=result["flow_data"],
            mermaid_chart=result["mermaid_chart"],
            message=f"Navigation Flow für {request.framework} erfolgreich generiert!"
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow-Generierung fehlgeschlagen: {str(e)}")


@router.get("/frameworks", response_model=FrameworksResponse)
async def get_frameworks():
    """
    🔹 FRAMEWORKS
    
    Gibt alle unterstützten Frameworks zurück
    """
    return FrameworksResponse(frameworks=flow_generator.frameworks)


@router.get("/flow-types", response_model=FlowTypesResponse)
async def get_flow_types():
    """
    🔹 FLOW TYPES
    
    Gibt alle verfügbaren Flow Types zurück
    """
    flow_types = [
        {
            "id": "checkout",
            "name": "Checkout Flow",
            "description": "E-Commerce Checkout Prozess (Cart → Address → Payment → Success)",
            "screens": 5
        },
        {
            "id": "onboarding",
            "name": "Onboarding Flow",
            "description": "User Onboarding (Welcome → Features → Permissions → Start)",
            "screens": 4
        },
        {
            "id": "auth",
            "name": "Authentication Flow",
            "description": "Login, Register, Password Reset, Email Verification",
            "screens": 5
        },
        {
            "id": "profile",
            "name": "Profile Flow",
            "description": "User Profile, Settings, Notifications, Security",
            "screens": 5
        },
        {
            "id": "custom",
            "name": "Custom Flow",
            "description": "Eigene Screens und Transitions definieren",
            "screens": 0
        }
    ]
    
    return FlowTypesResponse(flow_types=flow_types)


@router.post("/validate-flow")
async def validate_flow(flow_data: Dict[str, Any]):
    """
    🔹 FLOW VALIDATION
    
    Validiert Flow Structure
    """
    errors = []
    warnings = []
    
    # Check screens
    screens = flow_data.get("screens", [])
    if not screens:
        errors.append("At least one screen required")
    
    # Check entry point
    entry_point = flow_data.get("entry_point")
    if not entry_point:
        errors.append("Entry point required")
    elif not any(s.get("name") == entry_point for s in screens):
        errors.append(f"Entry point '{entry_point}' not found in screens")
    
    # Check edges
    edges = flow_data.get("edges", [])
    screen_names = [s.get("name") for s in screens]
    
    for edge in edges:
        from_screen = edge.get("from")
        to_screen = edge.get("to")
        
        if from_screen not in screen_names:
            errors.append(f"Edge references unknown screen: {from_screen}")
        
        if to_screen not in screen_names:
            errors.append(f"Edge references unknown screen: {to_screen}")
    
    # Check for unreachable screens
    reachable = {entry_point}
    changed = True
    while changed:
        changed = False
        for edge in edges:
            if edge.get("from") in reachable and edge.get("to") not in reachable:
                reachable.add(edge.get("to"))
                changed = True
    
    unreachable = set(screen_names) - reachable
    if unreachable:
        warnings.append(f"Unreachable screens: {', '.join(unreachable)}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }


@router.get("/example/{flow_type}")
async def get_flow_example(flow_type: str):
    """
    🔹 FLOW EXAMPLE
    
    Gibt Beispiel-Flow-Structure zurück
    """
    if flow_type not in flow_generator.flow_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid flow type. Available: {', '.join(flow_generator.flow_types)}"
        )
    
    # Generate example flow
    from .flow_generator import NavigationFlowGenerator
    gen = NavigationFlowGenerator()
    flow_data = gen._generate_flow_structure(flow_type, {})
    
    return {
        "flow_type": flow_type,
        "screens": [
            {
                "name": s.name,
                "path": s.path,
                "requires_auth": s.requires_auth,
                "params": s.params,
                "type": s.type,
                "title": s.title,
                "icon": s.icon
            }
            for s in flow_data["screens"]
        ],
        "edges": [
            {
                "from": e.from_screen,
                "to": e.to_screen,
                "action": e.action,
                "condition": e.condition,
                "params": e.params
            }
            for e in flow_data["edges"]
        ],
        "entry_point": flow_data["entry_point"]
    }


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK
    
    Prüft Navigation Flow Generator Status
    """
    return {
        "status": "healthy",
        "service": "Navigation Flow Builder",
        "frameworks": len(flow_generator.frameworks),
        "flow_types": len(flow_generator.flow_types),
        "version": "1.0.0"
    }
