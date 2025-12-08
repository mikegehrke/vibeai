# -------------------------------------------------------------
# VIBEAI – DATABASE GENERATOR ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .db_generator import database_generator

router = APIRouter(prefix="/db-gen", tags=["Database Generator"])


class TableField(BaseModel):
    """Datenbank-Feld Definition"""

    name: str
    type: str  # uuid, string, text, int, float, boolean, timestamp, date
    primary: Optional[bool] = False
    unique: Optional[bool] = False
    required: Optional[bool] = True
    default: Optional[Any] = None
    foreign_key: Optional[str] = None


class TableSchema(BaseModel):
    """Datenbank-Tabelle Definition"""

    name: str
    fields: List[TableField]


class GenerateDatabaseRequest(BaseModel):
    """Request für Datenbank-Generierung"""

    database_type: str  # supabase, prisma, firebase, mongodb, sqlite
    project_id: str
    db_schema: Optional[Dict[str, Any]] = None


@router.post("/generate")
async def generate_database(request: Request, data: GenerateDatabaseRequest):
    """
    Generiert Datenbank-Schema und Konfiguration

    POST /db-gen/generate
    {
        "database_type": "supabase",
        "project_id": "my-app",
        "schema": {
            "tables": [
                {
                    "name": "users",
                    "fields": [
                        {"name": "id", "type": "uuid", "primary": true},
                        {"name": "email", "type": "string", "unique": true},
                        {"name": "password", "type": "string"}
                    ]
                }
            ]
        }
    }

    Returns:
    {
        "success": true,
        "database_type": "supabase",
        "files": ["/path/to/schema.sql", ...],
        "tables": ["users", "posts"],
        "features": ["PostgreSQL", "RLS", "Real-time"]
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"

        result = database_generator.generate_database(
            database_type=data.database_type, base_path=base_path, schema=data.db_schema
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Fehler bei Generierung"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.get("/databases")
async def get_supported_databases():
    """
    Gibt alle unterstützten Datenbanken zurück

    GET /db-gen/databases

    Returns:
    {
        "databases": ["supabase", "prisma", "firebase", "mongodb", "sqlite"]
    }
    """
    return {"databases": database_generator.supported_databases}


@router.get("/schema/example/{database_type}")
async def get_example_schema(database_type: str):
    """
    Gibt Beispiel-Schema für spezifische Datenbank zurück

    GET /db-gen/schema/example/supabase
    GET /db-gen/schema/example/prisma

    Returns: Example schema structure
    """
    if database_type not in database_generator.supported_databases:
        raise HTTPException(status_code=404, detail=f"Datenbank '{database_type}' nicht gefunden")

    example_schema = {
        "tables": [
            {
                "name": "users",
                "fields": [
                    {"name": "id", "type": "uuid", "primary": True},
                    {"name": "email", "type": "string", "unique": True},
                    {"name": "password", "type": "string"},
                    {"name": "created_at", "type": "timestamp"},
                ],
            },
            {
                "name": "posts",
                "fields": [
                    {"name": "id", "type": "uuid", "primary": True},
                    {"name": "user_id", "type": "uuid", "foreign_key": "users.id"},
                    {"name": "title", "type": "string"},
                    {"name": "content", "type": "text"},
                    {"name": "created_at", "type": "timestamp"},
                ],
            },
        ]
    }

    return {"database_type": database_type, "example_schema": example_schema}


@router.get("/features/{database_type}")
async def get_database_features(database_type: str):
    """
    Gibt Features für spezifische Datenbank zurück

    GET /db-gen/features/supabase

    Returns:
    {
        "database_type": "supabase",
        "features": [...],
        "description": "..."
    }
    """
    features_map = {
        "supabase": {
            "features": [
                "PostgreSQL",
                "Row Level Security",
                "Real-time Subscriptions",
                "Built-in Auth",
                "Auto-generated APIs",
                "Storage",
            ],
            "description": "Open-source Firebase alternative with PostgreSQL",
        },
        "prisma": {
            "features": [
                "Type-safe Database Client",
                "Auto-generated Types",
                "Schema Migrations",
                "Prisma Studio (GUI)",
                "Multi-database Support",
                "Query Builder",
            ],
            "description": "Next-generation ORM for Node.js and TypeScript",
        },
        "firebase": {
            "features": [
                "NoSQL Firestore",
                "Real-time Database",
                "Authentication",
                "Cloud Functions",
                "Hosting",
                "Security Rules",
            ],
            "description": "Google's app development platform",
        },
        "mongodb": {
            "features": [
                "NoSQL Document Database",
                "Mongoose ODM",
                "Flexible Schema",
                "Aggregation Pipeline",
                "Indexing",
                "Replication",
            ],
            "description": "Popular NoSQL database with JSON-like documents",
        },
        "sqlite": {
            "features": [
                "File-based Database",
                "Zero Configuration",
                "ACID Compliant",
                "Lightweight",
                "Cross-platform",
                "Embedded",
            ],
            "description": "Serverless, embedded SQL database",
        },
    }

    if database_type not in features_map:
        raise HTTPException(status_code=404, detail=f"Datenbank '{database_type}' nicht gefunden")

    return {"database_type": database_type, **features_map[database_type]}


@router.post("/validate/schema")
async def validate_schema(schema: Dict[str, Any]):
    """
    Validiert Datenbank-Schema

    POST /db-gen/validate/schema
    {
        "tables": [...]
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

    if "tables" not in schema:
        errors.append("Schema muss 'tables' Array enthalten")
        return {"valid": False, "errors": errors, "warnings": warnings}

    tables = schema["tables"]

    if not isinstance(tables, list) or len(tables) == 0:
        errors.append("Mindestens eine Tabelle erforderlich")
        return {"valid": False, "errors": errors, "warnings": warnings}

    table_names = set()

    for idx, table in enumerate(tables):
        # Tabellen-Name prüfen
        if "name" not in table:
            errors.append(f"Tabelle {idx}: 'name' fehlt")
            continue

        if table["name"] in table_names:
            errors.append(f"Doppelter Tabellen-Name: {table['name']}")
        table_names.add(table["name"])

        # Felder prüfen
        if "fields" not in table or not table["fields"]:
            errors.append(f"Tabelle '{table['name']}': Keine Felder definiert")
            continue

        has_primary = False
        field_names = set()

        for field in table["fields"]:
            # Feld-Name prüfen
            if "name" not in field:
                errors.append(f"Tabelle '{table['name']}': Feld ohne Name")
                continue

            if field["name"] in field_names:
                errors.append(f"Tabelle '{table['name']}': Doppelter Feld-Name '{field['name']}'")
            field_names.add(field["name"])

            # Typ prüfen
            if "type" not in field:
                errors.append(f"Tabelle '{table['name']}', Feld '{field['name']}': Typ fehlt")

            # Primary Key prüfen
            if field.get("primary"):
                if has_primary:
                    warnings.append(f"Tabelle '{table['name']}': Mehrere Primary Keys definiert")
                has_primary = True

        if not has_primary:
            warnings.append(f"Tabelle '{table['name']}': Kein Primary Key definiert")

    return {"valid": len(errors) == 0, "errors": errors, "warnings": warnings}


@router.get("/health")
async def health_check():
    """Health Check für Database Generator"""
    return {
        "status": "healthy",
        "service": "Database Generator",
        "version": "1.0.0",
        "features": [
            "Supabase Schema Generation",
            "Prisma Schema Generation",
            "Firebase Config Generation",
            "MongoDB Mongoose Schemas",
            "SQLite Schema Generation",
            "Schema Validation",
            "Multi-Database Support",
        ],
    }
