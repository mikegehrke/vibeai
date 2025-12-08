# -------------------------------------------------------------
# VIBEAI – API CONNECTOR GENERATOR ROUTES
# -------------------------------------------------------------
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .api_generator import api_connector_generator

router = APIRouter(prefix="/api-gen", tags=["API Generator"])


class GenerateAPIRequest(BaseModel):
    """Request für API Client Generierung"""

    framework: str  # flutter, react, nextjs, vue, nodejs
    protocol: str  # rest, graphql, websocket
    project_id: str
    options: Optional[Dict[str, Any]] = None


class SupportedAPIsResponse(BaseModel):
    """Verfügbare API Protokolle und Frameworks"""

    protocols: List[str]
    frameworks: List[str]


@router.post("/generate")
async def generate_api_client(request: Request, data: GenerateAPIRequest):
    """
    Generiert API-Client Code

    POST /api-gen/generate
    {
        "framework": "flutter",
        "protocol": "rest",
        "project_id": "my-app",
        "options": {
            "base_url": "https://api.example.com",
            "auth_type": "bearer",
            "timeout": 30000
        }
    }

    Returns:
    {
        "success": true,
        "framework": "flutter",
        "protocol": "rest",
        "files": ["/path/to/rest_client.dart", ...],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "features": ["Auth Token", "Timeout", "Error Handling"]
    }
    """
    try:
        # Bestimme Projekt-Pfad
        base_path = f"/tmp/vibeai_projects/{data.project_id}"

        result = api_connector_generator.generate_api_client(
            framework=data.framework,
            protocol=data.protocol,
            base_path=base_path,
            options=data.options,
        )

        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Fehler bei Generierung"))

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler: {str(e)}")


@router.get("/protocols", response_model=SupportedAPIsResponse)
async def get_supported_protocols():
    """
    Gibt alle unterstützten API-Protokolle zurück

    GET /api-gen/protocols

    Returns:
    {
        "protocols": ["rest", "graphql", "websocket"],
        "frameworks": ["flutter", "react", "nextjs", "vue", "nodejs"]
    }
    """
    return SupportedAPIsResponse(
        protocols=api_connector_generator.supported_protocols,
        frameworks=api_connector_generator.supported_frameworks,
    )


@router.get("/examples/{protocol}/{framework}")
async def get_api_example(protocol: str, framework: str):
    """
    Gibt Code-Beispiel für spezifisches Protokoll und Framework

    GET /api-gen/examples/rest/flutter
    GET /api-gen/examples/graphql/react

    Returns:
    {
        "protocol": "rest",
        "framework": "flutter",
        "example": "... code example ..."
    }
    """
    examples = {
        "rest": {
            "flutter": """
// REST Client Beispiel
import 'package:app/api/rest_client.dart';

final users = await RestClient.get('/users');
final user = await RestClient.post('/users', {'name': 'Max'});
""",
            "react": """
// REST Client Beispiel
import { api } from './api/client';

const users = await api.get('/users');
const user = await api.post('/users', { name: 'Max' });
""",
            "nodejs": """
// REST Client Beispiel
const api = require('./api/client');

const users = await api.get('/users');
const user = await api.post('/users', { name: 'Max' });
""",
        },
        "graphql": {
            "flutter": """
// GraphQL Client Beispiel
import 'package:app/api/graphql_client.dart';

final result = await GraphQLService.query('''
  query { users { id name } }
''');
""",
            "react": """
// GraphQL Client Beispiel (Apollo)
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql\`query { users { id name } }\`;
const { data } = useQuery(GET_USERS);
""",
        },
        "websocket": {
            "flutter": """
// WebSocket Client Beispiel
import 'package:app/api/websocket_client.dart';

WebSocketService.connect();
WebSocketService.send('Hello');
WebSocketService.stream.listen((data) => print(data));
""",
            "react": """
// WebSocket Client Beispiel
import { useWebSocket } from './api/useWebSocket';

const { connected, messages, send } = useWebSocket();
send({ type: 'message', data: 'Hello' });
""",
        },
    }

    if protocol not in examples:
        raise HTTPException(status_code=404, detail=f"Protokoll '{protocol}' nicht gefunden")

    if framework not in examples[protocol]:
        raise HTTPException(
            status_code=404,
            detail=f"Framework '{framework}' für {protocol} nicht verfügbar",
        )

    return {
        "protocol": protocol,
        "framework": framework,
        "example": examples[protocol][framework].strip(),
    }


@router.post("/validate")
async def validate_api_config(base_url: str, protocol: str, auth_required: bool = False):
    """
    Validiert API-Konfiguration

    POST /api-gen/validate?base_url=https://api.example.com&protocol=rest&auth_required=true

    Returns:
    {
        "valid": true,
        "protocol": "rest",
        "base_url": "https://api.example.com",
        "warnings": []
    }
    """
    warnings = []

    # URL validieren
    if not base_url.startswith("http://") and not base_url.startswith("https://"):
        return {
            "valid": False,
            "error": "Base URL muss mit http:// oder https:// beginnen",
        }

    # Protokoll validieren
    if protocol not in api_connector_generator.supported_protocols:
        return {"valid": False, "error": f"Protokoll '{protocol}' nicht unterstützt"}

    # WebSocket URL validieren
    if protocol == "websocket":
        if not base_url.startswith("wss://") and not base_url.startswith("ws://"):
            warnings.append("WebSocket URL sollte mit ws:// oder wss:// beginnen. " "URL wird automatisch konvertiert.")

    # GraphQL Endpoint
    if protocol == "graphql":
        if not base_url.endswith("/graphql"):
            warnings.append(
                "GraphQL URL sollte normalerweise mit /graphql enden. "
                "Stellen Sie sicher, dass der Endpoint korrekt ist."
            )

    # Auth Warnung
    if auth_required and protocol == "rest":
        warnings.append("Authentifizierung aktiviert. " "Stellen Sie sicher, dass authToken gesetzt wird.")

    return {
        "valid": True,
        "protocol": protocol,
        "base_url": base_url,
        "warnings": warnings,
    }


@router.get("/health")
async def health_check():
    """Health Check für API Generator"""
    return {
        "status": "healthy",
        "service": "API Connector Generator",
        "version": "1.0.0",
        "features": [
            "REST Client Generation",
            "GraphQL Client Generation",
            "WebSocket Client Generation",
            "Multi-Framework Support (Flutter, React, Next.js, Vue, Node.js)",
            "Auth Token Management",
            "Error Handling",
            "Timeout Configuration",
        ],
    }