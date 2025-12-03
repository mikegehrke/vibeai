# -------------------------------------------------------------
# VIBEAI – BACKEND MODEL GENERATOR ROUTES
# -------------------------------------------------------------
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from .model_generator import model_generator

router = APIRouter(prefix="/backend-gen", tags=["Backend Generator"])


class ModelField(BaseModel):
    """Definition eines Model-Felds"""
    name: str
    type: str  # string, int, float, boolean, date, datetime, email, url, etc.
    required: Optional[bool] = True
    unique: Optional[bool] = False
    default: Optional[Any] = None
    min: Optional[float] = None
    max: Optional[float] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    email: Optional[bool] = False
    url: Optional[bool] = False
    example: Optional[str] = None
    auto: Optional[bool] = False  # Auto-generated field (e.g., id, created_at)


class ModelDefinition(BaseModel):
    """Definition eines Backend Models"""
    name: str
    fields: List[ModelField]
    relations: Optional[List[Dict[str, Any]]] = []
    validators: Optional[Dict[str, Any]] = {}


class GenerateBackendRequest(BaseModel):
    """Request für Backend-Generierung"""
    framework: str = Field(..., description="fastapi, flask, django, express")
    project_id: str
    models: List[ModelDefinition]
    options: Optional[Dict[str, Any]] = {}


@router.post("/generate")
async def generate_backend(request: Request, data: GenerateBackendRequest):
    """
    Generiert komplettes Backend mit Models, Controllers, CRUD, Routes
    
    POST /backend-gen/generate
    {
        "framework": "fastapi",
        "project_id": "my-app",
        "models": [
            {
                "name": "User",
                "fields": [
                    {"name": "id", "type": "int", "auto": true},
                    {"name": "email", "type": "string", "email": true, "unique": true},
                    {"name": "name", "type": "string", "max_length": 100},
                    {"name": "age", "type": "int", "min": 0, "max": 150}
                ]
            }
        ],
        "options": {"database": "postgresql", "auth": true}
    }
    
    Returns:
    {
        "success": true,
        "framework": "fastapi",
        "files": ["/path/to/models/user.py", ...],
        "endpoints": ["POST /user/", "GET /user/", ...],
        "models": ["User", "Post"],
        "features": [...]
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"
        
        # Konvertiere Pydantic Models zu Dicts
        models_data = [model.model_dump() for model in data.models]
        
        result = model_generator.generate_backend(
            framework=data.framework,
            base_path=base_path,
            models=models_data,
            options=data.options
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Fehler bei Generierung")
            )
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.get("/frameworks")
async def get_supported_frameworks():
    """
    Gibt alle unterstützten Backend-Frameworks zurück
    
    GET /backend-gen/frameworks
    
    Returns:
    {
        "frameworks": ["fastapi", "flask", "django", "express"]
    }
    """
    return {
        "frameworks": model_generator.supported_frameworks
    }


@router.get("/field-types")
async def get_field_types():
    """
    Gibt alle unterstützten Feld-Typen zurück
    
    GET /backend-gen/field-types
    
    Returns:
    {
        "types": ["string", "int", "float", "boolean", "date", ...]
    }
    """
    return {
        "types": list(model_generator.py_type_map.keys()),
        "special_types": {
            "email": "Email validation",
            "url": "URL validation",
            "uuid": "UUID field",
            "json": "JSON field",
            "array": "Array/List field"
        }
    }


@router.post("/validate/model")
async def validate_model(model: ModelDefinition):
    """
    Validiert Model-Definition
    
    POST /backend-gen/validate/model
    {
        "name": "User",
        "fields": [...]
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
    
    # Name validation
    if not model.name:
        errors.append("Model name is required")
    elif not model.name[0].isupper():
        warnings.append(
            f"Model name '{model.name}' should start with uppercase letter"
        )
    
    # Fields validation
    if not model.fields or len(model.fields) == 0:
        errors.append("Model must have at least one field")
    
    field_names = set()
    has_id = False
    
    for field in model.fields:
        # Duplicate field names
        if field.name in field_names:
            errors.append(f"Duplicate field name: '{field.name}'")
        field_names.add(field.name)
        
        # Check for ID field
        if field.name.lower() == "id":
            has_id = True
        
        # Type validation
        if field.type not in model_generator.py_type_map:
            errors.append(
                f"Invalid field type '{field.type}' for field '{field.name}'"
            )
        
        # Min/Max validation
        if field.min is not None and field.max is not None:
            if field.min > field.max:
                errors.append(
                    f"Field '{field.name}': min ({field.min}) cannot be greater than max ({field.max})"
                )
    
    if not has_id:
        warnings.append(
            "Model does not have an 'id' field. Consider adding one for CRUD operations."
        )
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }


@router.get("/example/{framework}")
async def get_example_model(framework: str):
    """
    Gibt Beispiel-Model für spezifisches Framework zurück
    
    GET /backend-gen/example/fastapi
    
    Returns: Example model definition
    """
    if framework not in model_generator.supported_frameworks:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework}' nicht gefunden"
        )
    
    example = {
        "framework": framework,
        "models": [
            {
                "name": "User",
                "fields": [
                    {
                        "name": "id",
                        "type": "int",
                        "auto": True,
                        "example": "1"
                    },
                    {
                        "name": "email",
                        "type": "string",
                        "email": True,
                        "unique": True,
                        "example": "user@example.com"
                    },
                    {
                        "name": "username",
                        "type": "string",
                        "min_length": 3,
                        "max_length": 50,
                        "unique": True,
                        "example": "johndoe"
                    },
                    {
                        "name": "age",
                        "type": "int",
                        "min": 0,
                        "max": 150,
                        "required": False,
                        "example": "25"
                    },
                    {
                        "name": "is_active",
                        "type": "boolean",
                        "default": True,
                        "example": "true"
                    },
                    {
                        "name": "created_at",
                        "type": "datetime",
                        "auto": True,
                        "example": "2024-01-01T00:00:00Z"
                    }
                ],
                "relations": [],
                "validators": {}
            },
            {
                "name": "Post",
                "fields": [
                    {
                        "name": "id",
                        "type": "int",
                        "auto": True
                    },
                    {
                        "name": "title",
                        "type": "string",
                        "min_length": 5,
                        "max_length": 200
                    },
                    {
                        "name": "content",
                        "type": "text"
                    },
                    {
                        "name": "user_id",
                        "type": "int"
                    },
                    {
                        "name": "published",
                        "type": "boolean",
                        "default": False
                    },
                    {
                        "name": "created_at",
                        "type": "datetime",
                        "auto": True
                    }
                ],
                "relations": [
                    {
                        "type": "many_to_one",
                        "model": "User",
                        "foreign_key": "user_id"
                    }
                ],
                "validators": {}
            }
        ],
        "options": {
            "database": "postgresql",
            "auth": True
        }
    }
    
    return example


@router.get("/health")
async def health_check():
    """Health Check für Backend Generator"""
    return {
        "status": "healthy",
        "service": "Backend Model Generator",
        "version": "1.0.0",
        "features": [
            "Model Generation",
            "Controller Generation",
            "CRUD Operations",
            "Route Generation",
            "Type Validation",
            "Multiple Frameworks",
            "Auto Documentation"
        ]
    }
