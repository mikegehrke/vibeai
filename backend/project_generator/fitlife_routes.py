"""
FITLIFE GENERATOR API ROUTE
Vollständige Flutter Fitness-App Generierung
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class GenerateFitLifeRequest(BaseModel):
    project_name: str = "fitlife_app"
    user_id: Optional[str] = None


class GenerateFitLifeResponse(BaseModel):
    success: bool
    message: str
    project_name: str
    files: list
    total_files: int


@router.post(
    "/api/generate-fitlife",
    response_model=GenerateFitLifeResponse,
    tags=["FitLife Generator"]
)
async def generate_fitlife_project(request: GenerateFitLifeRequest):
    """
    🔥 GENERIERT KOMPLETTES FITLIFE FLUTTER PROJEKT
    
    - 16 vollständige Dateien
    - Alle Screens (Home, Workouts, Detail, Exercise, Profile)
    - Models, Data, Widgets, Theme
    - Timer mit Countdown
    - BMI-Rechner
    - Dark/Light Mode
    - SOFORT LAUFFÄHIG!
    """
    try:
        # Import generator DIREKT
        from fitlife_generator import generate_fitlife_project as gen_fn
        
        # Generate project
        result = gen_fn(request.project_name)
        
        return GenerateFitLifeResponse(
            success=True,
            message=result['message'],
            project_name=result['project_name'],
            files=result['files'],
            total_files=result['total_files']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"FitLife Generation Failed: {str(e)}"
        )

@router.get("/api/fitlife-info", tags=["FitLife Generator"])
async def get_fitlife_info():
    """Info über den FitLife Generator"""
    return {
        "name": "FitLife Flutter Generator",
        "version": "1.0.0",
        "description": "Komplette Fitness-App mit 16 Dateien",
        "features": [
            "Home Screen mit Fortschrittsanzeige",
            "3 Workouts (Beginner, Intermediate, Advanced)",
            "Workout-Details mit Übungen",
            "Exercise Screen mit 30s Timer",
            "Profil mit BMI-Rechner",
            "Dark/Light Mode Support",
            "Vollständig kompilierbar",
            "Keine Platzhalter"
        ],
        "total_files": 16,
        "frameworks": ["Flutter 3.0+"],
        "ready": True
    }
