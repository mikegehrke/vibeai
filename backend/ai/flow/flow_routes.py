# -------------------------------------------------------------
# VIBEAI – NAVIGATION FLOW ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from .flow_generator import flow_generator

router = APIRouter(prefix="/flow", tags=["Navigation Flow"])


# ========== PYDANTIC MODELS ==========

class GenerateFlowRequest(BaseModel):
    """Request model für Flow-Generierung"""
    framework: str = Field(..., description="Framework (flutter, react, nextjs, vue, react_native)")
    flow_type: str = Field(..., description="Flow type (auth, ecommerce, onboarding, social, dashboard)")
    custom_screens: Optional[List[Dict[str, Any]]] = Field(None, description="Custom screens")
    custom_edges: Optional[List[Dict[str, Any]]] = Field(None, description="Custom navigation edges")


class AnalyzeFlowRequest(BaseModel):
    """Request model für Flow-Analyse"""
    flow_data: Dict[str, Any] = Field(..., description="Flow structure to analyze")


class FlowTypesResponse(BaseModel):
    """Response model für Flow Types"""
    flow_types: List[str]


class GenerateFlowResponse(BaseModel):
    """Response model für Flow-Generierung"""
    success: bool
    framework: str
    flow_type: str
    files: List[str]
    flow_data: Dict[str, Any]
    screens: int
    edges: int
    message: str


class AnalyzeFlowResponse(BaseModel):
    """Response model für Flow-Analyse"""
    valid: bool
    issues: List[str]
    warnings: List[str]
    metrics: Dict[str, int]


class ExportFlowResponse(BaseModel):
    """Response model für Flow-Export"""
    format: str
    content: str


# ========== ENDPOINTS ==========

@router.post("/generate", response_model=GenerateFlowResponse)
async def generate_navigation_flow(request: GenerateFlowRequest):
    """
    🔹 NAVIGATION FLOW GENERIEREN
    
    Generiert kompletten Navigation Flow:
    - Screen Definitions
    - Route Maps
    - Navigation Guards
    - Parameter Validation
    - Framework-spezifische Navigation
    """
    try:
        options = {}
        
        if request.custom_screens:
            options["custom_flow"] = {
                "type": "custom",
                "screens": request.custom_screens,
                "edges": request.custom_edges or [],
                "start_screen": request.custom_screens[0]["name"] if request.custom_screens else "HomeScreen",
                "guards": []
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
            screens=result["screens"],
            edges=result["edges"],
            message=f"Navigation Flow für {request.framework} erfolgreich generiert!"
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow-Generierung fehlgeschlagen: {str(e)}")


@router.post("/analyze", response_model=AnalyzeFlowResponse)
async def analyze_navigation_flow(request: AnalyzeFlowRequest):
    """
    🔹 NAVIGATION FLOW ANALYSIEREN
    
    Analysiert Navigation Flow auf:
    - Unreachable screens
    - Missing screens in edges
    - Auth guard issues
    - Circular navigation
    """
    try:
        result = flow_generator.analyze_flow(request.flow_data)
        
        return AnalyzeFlowResponse(
            valid=result["valid"],
            issues=result["issues"],
            warnings=result["warnings"],
            metrics=result["metrics"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow-Analyse fehlgeschlagen: {str(e)}")


@router.get("/types", response_model=FlowTypesResponse)
async def get_flow_types():
    """
    🔹 FLOW TYPES
    
    Gibt alle verfügbaren Flow Templates zurück
    """
    flow_types = list(flow_generator.flow_templates.keys())
    return FlowTypesResponse(flow_types=flow_types)


@router.get("/template/{flow_type}")
async def get_flow_template(flow_type: str):
    """
    🔹 FLOW TEMPLATE
    
    Gibt Flow Template Structure zurück
    """
    if flow_type not in flow_generator.flow_templates:
        raise HTTPException(status_code=404, detail=f"Flow type '{flow_type}' not found")
    
    template_func = flow_generator.flow_templates[flow_type]
    template_data = template_func({})
    
    return {
        "flow_type": flow_type,
        "template": template_data
    }


@router.post("/export/{format}")
async def export_flow(format: str, flow_data: Dict[str, Any]):
    """
    🔹 FLOW EXPORTIEREN
    
    Exportiert Flow in verschiedene Formate:
    - json: JSON Structure
    - mermaid: Mermaid Flowchart
    - graphviz: DOT Format
    """
    if format == "json":
        import json
        content = json.dumps(flow_data, indent=2)
    
    elif format == "mermaid":
        # Generate Mermaid flowchart
        lines = ["graph TD"]
        
        for edge in flow_data.get("edges", []):
            from_s = edge["from_screen"]
            to_s = edge["to_screen"]
            action = edge.get("action", "push")
            lines.append(f"    {from_s} -->|{action}| {to_s}")
        
        content = "\n".join(lines)
    
    elif format == "graphviz":
        # Generate GraphViz DOT
        lines = ["digraph NavigationFlow {"]
        
        for edge in flow_data.get("edges", []):
            from_s = edge["from_screen"]
            to_s = edge["to_screen"]
            action = edge.get("action", "push")
            lines.append(f'    "{from_s}" -> "{to_s}" [label="{action}"];')
        
        lines.append("}")
        content = "\n".join(lines)
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")
    
    return ExportFlowResponse(format=format, content=content)


@router.get("/health")
async def health_check():
    """
    🔹 HEALTH CHECK
    
    Prüft Flow-Generator-Status
    """
    return {
        "status": "healthy",
        "service": "Navigation Flow Generator",
        "frameworks": len(flow_generator.frameworks),
        "flow_templates": len(flow_generator.flow_templates),
        "version": "1.0.0"
    }
