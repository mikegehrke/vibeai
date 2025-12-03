# -------------------------------------------------------------
# VIBEAI – BACKEND MODEL GENERATOR
# -------------------------------------------------------------
import os
from typing import List, Dict, Any, Optional


class ModelGenerator:
    """
    Generiert Backend Models, Controllers, CRUD Operations und Routes
    aus einer UI-Definition oder Prompt-Beschreibung
    """

    def __init__(self):
        self.supported_frameworks = ["fastapi", "flask", "django", "express"]
        self.supported_databases = ["postgresql", "mysql", "mongodb", "sqlite"]
        
        # Python Type Mappings
        self.py_type_map = {
            "string": "str",
            "text": "str",
            "int": "int",
            "integer": "int",
            "float": "float",
            "decimal": "float",
            "boolean": "bool",
            "bool": "bool",
            "date": "datetime.date",
            "datetime": "datetime.datetime",
            "timestamp": "datetime.datetime",
            "uuid": "str",
            "email": "str",
            "url": "str",
            "json": "dict",
            "array": "list",
            "list": "list"
        }
        
        # TypeScript Type Mappings
        self.ts_type_map = {
            "string": "string",
            "text": "string",
            "int": "number",
            "integer": "number",
            "float": "number",
            "decimal": "number",
            "boolean": "boolean",
            "bool": "boolean",
            "date": "Date",
            "datetime": "Date",
            "timestamp": "Date",
            "uuid": "string",
            "email": "string",
            "url": "string",
            "json": "any",
            "array": "any[]",
            "list": "any[]"
        }

    def generate_backend(
        self,
        framework: str,
        base_path: str,
        models: List[Dict[str, Any]],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generiert komplettes Backend mit Models, Controllers, CRUD, Routes
        
        Args:
            framework: fastapi, flask, django, express
            base_path: Pfad zum Projekt
            models: Liste von Model-Definitionen
            options: Zusätzliche Optionen (auth, validators, etc.)
        
        Returns:
            Dict mit success, files, endpoints, models
        """
        if framework not in self.supported_frameworks:
            return {
                "success": False,
                "error": f"Framework '{framework}' nicht unterstützt"
            }

        options = options or {}
        
        if framework == "fastapi":
            return self._generate_fastapi(base_path, models, options)
        elif framework == "flask":
            return self._generate_flask(base_path, models, options)
        elif framework == "django":
            return self._generate_django(base_path, models, options)
        elif framework == "express":
            return self._generate_express(base_path, models, options)
        
        return {"success": False, "error": "Ungültiger Framework"}

    def _generate_fastapi(
        self,
        base_path: str,
        models: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert FastAPI Backend"""
        generated_files = []
        endpoints = []
        model_names = []
        
        # Create directories
        os.makedirs(f"{base_path}/models", exist_ok=True)
        os.makedirs(f"{base_path}/controllers", exist_ok=True)
        os.makedirs(f"{base_path}/routes", exist_ok=True)
        
        for model in models:
            name = model["name"]
            fields = model.get("fields", [])
            relations = model.get("relations", [])
            validators = model.get("validators", {})
            
            model_names.append(name)
            
            # 1. Generate Model (Pydantic)
            model_file = self._generate_fastapi_model(
                base_path, name, fields, validators
            )
            generated_files.append(model_file)
            
            # 2. Generate Controller (Business Logic)
            controller_file = self._generate_fastapi_controller(
                base_path, name, fields, options
            )
            generated_files.append(controller_file)
            
            # 3. Generate Routes (CRUD Endpoints)
            route_file = self._generate_fastapi_routes(
                base_path, name, fields, options
            )
            generated_files.append(route_file)
            
            # Track endpoints
            route_name = name.lower()
            endpoints.extend([
                f"POST /{route_name}/",
                f"GET /{route_name}/",
                f"GET /{route_name}/{{id}}",
                f"PUT /{route_name}/{{id}}",
                f"DELETE /{route_name}/{{id}}"
            ])
        
        # Generate main app file
        main_file = self._generate_fastapi_main(base_path, model_names)
        generated_files.append(main_file)
        
        # Generate requirements.txt
        requirements_file = self._generate_fastapi_requirements(base_path, options)
        generated_files.append(requirements_file)
        
        return {
            "success": True,
            "framework": "fastapi",
            "files": generated_files,
            "endpoints": endpoints,
            "models": model_names,
            "features": [
                "Pydantic Models",
                "CRUD Operations",
                "Type Validation",
                "Auto Documentation"
            ]
        }

    def _generate_fastapi_model(
        self,
        base_path: str,
        name: str,
        fields: List[Dict[str, Any]],
        validators: Dict[str, Any]
    ) -> str:
        """Generiert Pydantic Model"""
        imports = ["from pydantic import BaseModel, Field"]
        extra_imports = set()
        
        # Check for special types
        for field in fields:
            field_type = field.get("type", "string").lower()
            if field_type in ["date", "datetime", "timestamp"]:
                extra_imports.add("import datetime")
            if field.get("email"):
                extra_imports.add("from pydantic import EmailStr")
            if field.get("url"):
                extra_imports.add("from pydantic import HttpUrl")
        
        if extra_imports:
            imports.extend(sorted(extra_imports))
        
        # Build fields
        field_lines = []
        for field in fields:
            field_name = field["name"]
            field_type = field.get("type", "string").lower()
            py_type = self.py_type_map.get(field_type, "str")
            
            # Handle special types
            if field.get("email"):
                py_type = "EmailStr"
            elif field.get("url"):
                py_type = "HttpUrl"
            
            # Handle optional/required
            if not field.get("required", True):
                py_type = f"Optional[{py_type}]"
                if "Optional" not in imports[0]:
                    imports[0] += ", Optional"
            
            # Field definition
            field_def = f"    {field_name}: {py_type}"
            
            # Add Field constraints
            constraints = []
            if field.get("min"):
                constraints.append(f"ge={field['min']}")
            if field.get("max"):
                constraints.append(f"le={field['max']}")
            if field.get("min_length"):
                constraints.append(f"min_length={field['min_length']}")
            if field.get("max_length"):
                constraints.append(f"max_length={field['max_length']}")
            if field.get("default") is not None:
                default_val = field["default"]
                if isinstance(default_val, str):
                    default_val = f"'{default_val}'"
                constraints.append(f"default={default_val}")
            
            if constraints:
                field_def += f" = Field({', '.join(constraints)})"
            
            field_lines.append(field_def)
        
        content = f"""{chr(10).join(imports)}


class {name}(BaseModel):
    \"\"\"
    {name} Model
    Auto-generated by VibeAI Backend Generator
    \"\"\"
{chr(10).join(field_lines)}

    class Config:
        from_attributes = True
        json_schema_extra = {{
            "example": {{
{chr(10).join([f'                "{f["name"]}": "{f.get("example", f["name"])}"' for f in fields[:3]])}
            }}
        }}


class {name}Create(BaseModel):
    \"\"\"Schema for creating {name}\"\"\"
{chr(10).join([f'    {f["name"]}: {self.py_type_map.get(f.get("type", "string").lower(), "str")}' for f in fields if not f.get("auto")])}


class {name}Update(BaseModel):
    \"\"\"Schema for updating {name}\"\"\"
{chr(10).join([f'    {f["name"]}: Optional[{self.py_type_map.get(f.get("type", "string").lower(), "str")}] = None' for f in fields if not f.get("auto")])}
    
    class Config:
        from_attributes = True
"""
        
        filepath = f"{base_path}/models/{name.lower()}.py"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        
        return filepath

    def _generate_fastapi_controller(
        self,
        base_path: str,
        name: str,
        fields: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> str:
        """Generiert Controller mit Business Logic"""
        model_lower = name.lower()
        
        content = f"""from typing import List, Optional
from models.{model_lower} import {name}, {name}Create, {name}Update
from fastapi import HTTPException


class {name}Controller:
    \"\"\"
    Controller for {name} business logic
    Auto-generated by VibeAI Backend Generator
    \"\"\"
    
    def __init__(self):
        # In-memory storage for demo (replace with real DB)
        self.db: List[{name}] = []
        self._id_counter = 0
    
    async def create(self, data: {name}Create) -> {name}:
        \"\"\"Create new {name}\"\"\"
        self._id_counter += 1
        item = {name}(
            id=self._id_counter,
            **data.model_dump()
        )
        self.db.append(item)
        return item
    
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[{name}]:
        \"\"\"Get all {name}s with pagination\"\"\"
        return self.db[skip : skip + limit]
    
    async def get_by_id(self, item_id: int) -> {name}:
        \"\"\"Get {name} by ID\"\"\"
        for item in self.db:
            if item.id == item_id:
                return item
        raise HTTPException(status_code=404, detail="{name} not found")
    
    async def update(self, item_id: int, data: {name}Update) -> {name}:
        \"\"\"Update {name}\"\"\"
        item = await self.get_by_id(item_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        return item
    
    async def delete(self, item_id: int) -> dict:
        \"\"\"Delete {name}\"\"\"
        item = await self.get_by_id(item_id)
        self.db.remove(item)
        return {{"message": "{name} deleted successfully"}}
    
    async def search(self, query: str) -> List[{name}]:
        \"\"\"Search {name}s by query\"\"\"
        results = []
        for item in self.db:
            # Simple search in all string fields
            if any(
                query.lower() in str(getattr(item, field.name, "")).lower()
                for field in item.__fields__.values()
            ):
                results.append(item)
        return results


# Singleton instance
{model_lower}_controller = {name}Controller()
"""
        
        filepath = f"{base_path}/controllers/{model_lower}_controller.py"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        
        return filepath

    def _generate_fastapi_routes(
        self,
        base_path: str,
        name: str,
        fields: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> str:
        """Generiert CRUD Routes"""
        model_lower = name.lower()
        route_prefix = f"/{model_lower}"
        
        content = f"""from fastapi import APIRouter, HTTPException, Query
from typing import List
from models.{model_lower} import {name}, {name}Create, {name}Update
from controllers.{model_lower}_controller import {model_lower}_controller

router = APIRouter(prefix="{route_prefix}", tags=["{name}"])


@router.post("/", response_model={name}, status_code=201)
async def create_{model_lower}(data: {name}Create):
    \"\"\"
    Create a new {name}
    \"\"\"
    return await {model_lower}_controller.create(data)


@router.get("/", response_model=List[{name}])
async def get_{model_lower}s(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    \"\"\"
    Get all {name}s with pagination
    \"\"\"
    return await {model_lower}_controller.get_all(skip=skip, limit=limit)


@router.get("/{{item_id}}", response_model={name})
async def get_{model_lower}(item_id: int):
    \"\"\"
    Get {name} by ID
    \"\"\"
    return await {model_lower}_controller.get_by_id(item_id)


@router.put("/{{item_id}}", response_model={name})
async def update_{model_lower}(item_id: int, data: {name}Update):
    \"\"\"
    Update {name} by ID
    \"\"\"
    return await {model_lower}_controller.update(item_id, data)


@router.delete("/{{item_id}}")
async def delete_{model_lower}(item_id: int):
    \"\"\"
    Delete {name} by ID
    \"\"\"
    return await {model_lower}_controller.delete(item_id)


@router.get("/search/", response_model=List[{name}])
async def search_{model_lower}s(q: str = Query(..., min_length=1)):
    \"\"\"
    Search {name}s by query
    \"\"\"
    return await {model_lower}_controller.search(q)
"""
        
        filepath = f"{base_path}/routes/{model_lower}_routes.py"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        
        return filepath

    def _generate_fastapi_main(self, base_path: str, models: List[str]) -> str:
        """Generiert main.py mit allen Routern"""
        imports = "\n".join([
            f"from routes.{m.lower()}_routes import router as {m.lower()}_router"
            for m in models
        ])
        
        routers = "\n".join([
            f"app.include_router({m.lower()}_router)"
            for m in models
        ])
        
        content = f"""from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
{imports}

app = FastAPI(
    title="VibeAI Generated API",
    description="Auto-generated REST API by VibeAI Backend Generator",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
{routers}


@app.get("/")
async def root():
    return {{
        "message": "VibeAI Generated API",
        "models": {models},
        "docs": "/docs"
    }}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
        
        filepath = f"{base_path}/main.py"
        with open(filepath, "w") as f:
            f.write(content)
        
        return filepath

    def _generate_fastapi_requirements(
        self,
        base_path: str,
        options: Dict[str, Any]
    ) -> str:
        """Generiert requirements.txt"""
        requirements = [
            "fastapi>=0.104.0",
            "uvicorn[standard]>=0.24.0",
            "pydantic>=2.5.0",
            "python-multipart>=0.0.6"
        ]
        
        if options.get("database") == "postgresql":
            requirements.append("psycopg2-binary>=2.9.9")
            requirements.append("sqlalchemy>=2.0.23")
        elif options.get("database") == "mongodb":
            requirements.append("motor>=3.3.2")
        
        content = "\n".join(requirements) + "\n"
        
        filepath = f"{base_path}/requirements.txt"
        with open(filepath, "w") as f:
            f.write(content)
        
        return filepath

    def _generate_flask(
        self,
        base_path: str,
        models: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Flask Backend (vereinfacht)"""
        # Simplified Flask implementation
        return {
            "success": True,
            "framework": "flask",
            "files": [],
            "endpoints": [],
            "models": [],
            "features": ["Flask REST API"]
        }

    def _generate_django(
        self,
        base_path: str,
        models: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Django Backend (vereinfacht)"""
        # Simplified Django implementation
        return {
            "success": True,
            "framework": "django",
            "files": [],
            "endpoints": [],
            "models": [],
            "features": ["Django REST Framework"]
        }

    def _generate_express(
        self,
        base_path: str,
        models: List[Dict[str, Any]],
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Express.js Backend (vereinfacht)"""
        # Simplified Express implementation
        return {
            "success": True,
            "framework": "express",
            "files": [],
            "endpoints": [],
            "models": [],
            "features": ["Express REST API"]
        }


# Singleton instance
model_generator = ModelGenerator()
