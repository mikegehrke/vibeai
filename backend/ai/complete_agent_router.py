"""
COMPLETE AGENT ROUTER
Alle 16+ VibeAI Agents in einer einzigen API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List, Any
import asyncio

router = APIRouter()


class AgentRequest(BaseModel):
    """Universal Agent Request"""
    agent_type: str  # ui, code, build, deploy, preview, test, autofix, api, auth, db, flutter, react, payment, pwa, theme, store
    action: str  # generate, fix, analyze, build, deploy
    prompt: str
    project_name: Optional[str] = "my_app"
    project_type: Optional[str] = "flutter"
    context: Optional[Dict] = {}
    include_tests: bool = False
    auto_fix: bool = True


class AgentResponse(BaseModel):
    """Universal Agent Response"""
    success: bool
    agent_used: str
    files: List[Dict] = []
    message: str
    metadata: Dict = {}
    errors: List[str] = []


@router.post("/api/agents/execute", response_model=AgentResponse)
async def execute_agent(request: AgentRequest):
    """
    🤖 UNIVERSAL AGENT EXECUTOR
    
    Führt jeden der 16+ Agents aus basierend auf agent_type
    
    Agents:
    - ui_agent: UI/Screens generieren
    - code_agent: Business Logic
    - build_agent: Build Config
    - deploy_agent: Deployment
    - preview_agent: Preview/Testing
    - test_generator: Unit/Integration Tests
    - autofix_agent: Code Fixing
    - api_generator: REST/GraphQL APIs
    - auth_generator: Authentication
    - db_generator: Database Schema
    - flutter_generator: Flutter Apps
    - react_generator: React Apps
    - payment_generator: Stripe/PayPal
    - pwa_generator: PWA Features
    - theme_generator: Theming/Styling
    - store_generator: State Management
    """
    
    try:
        # Route to correct agent
        if request.agent_type == "ui":
            return await execute_ui_agent(request)
        elif request.agent_type == "code":
            return await execute_code_agent(request)
        elif request.agent_type == "build":
            return await execute_build_agent(request)
        elif request.agent_type == "deploy":
            return await execute_deploy_agent(request)
        elif request.agent_type == "preview":
            return await execute_preview_agent(request)
        elif request.agent_type == "test":
            return await execute_test_generator(request)
        elif request.agent_type == "autofix":
            return await execute_autofix_agent(request)
        elif request.agent_type == "api":
            return await execute_api_generator(request)
        elif request.agent_type == "auth":
            return await execute_auth_generator(request)
        elif request.agent_type == "db":
            return await execute_db_generator(request)
        elif request.agent_type == "flutter":
            return await execute_flutter_generator(request)
        elif request.agent_type == "react":
            return await execute_react_generator(request)
        elif request.agent_type == "payment":
            return await execute_payment_generator(request)
        elif request.agent_type == "pwa":
            return await execute_pwa_generator(request)
        elif request.agent_type == "theme":
            return await execute_theme_generator(request)
        elif request.agent_type == "store":
            return await execute_store_generator(request)
        else:
            raise HTTPException(400, f"Unknown agent: {request.agent_type}")
            
    except Exception as e:
        return AgentResponse(
            success=False,
            agent_used=request.agent_type,
            message=f"Agent execution failed: {str(e)}",
            errors=[str(e)]
        )


# ============================================
# ORCHESTRATOR AGENTS
# ============================================

async def execute_ui_agent(req: AgentRequest) -> AgentResponse:
    """UI Agent - Generiert Screens & Components"""
    try:
        from ai.orchestrator.agents.ui_agent import ui_agent
        
        result = await ui_agent.generate(
            prompt=req.prompt,
            project_type=req.project_type,
            context=req.context
        )
        
        return AgentResponse(
            success=True,
            agent_used="ui_agent",
            files=result.get("files", []),
            message=f"✅ {len(result.get('files', []))} UI files generated",
            metadata=result
        )
    except Exception as e:
        return AgentResponse(
            success=False,
            agent_used="ui_agent",
            message=f"UI Agent error: {str(e)}",
            errors=[str(e)]
        )


async def execute_code_agent(req: AgentRequest) -> AgentResponse:
    """Code Agent - Business Logic"""
    from ai.orchestrator.agents.code_agent import code_agent
    
    result = await code_agent.generate(
        prompt=req.prompt,
        project_type=req.project_type,
        context=req.context
    )
    
    return AgentResponse(
        success=True,
        agent_used="code_agent",
        files=result.get("files", []),
        message=f"✅ {len(result.get('files', []))} code files generated"
    )


async def execute_build_agent(req: AgentRequest) -> AgentResponse:
    """Build Agent - Build Configuration"""
    from ai.orchestrator.agents.build_agent import build_agent
    
    result = await build_agent.generate_config(
        project_name=req.project_name,
        project_type=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="build_agent",
        files=result.get("files", []),
        message="✅ Build config generated"
    )


async def execute_deploy_agent(req: AgentRequest) -> AgentResponse:
    """Deploy Agent - Deployment Config"""
    from ai.orchestrator.agents.deploy_agent import deploy_agent
    
    result = await deploy_agent.generate_config(
        project_name=req.project_name,
        project_type=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="deploy_agent",
        files=result.get("files", []),
        message="✅ Deploy config generated"
    )


async def execute_preview_agent(req: AgentRequest) -> AgentResponse:
    """Preview Agent - Testing & Preview"""
    from ai.orchestrator.agents.preview_agent import preview_agent
    
    result = await preview_agent.generate_preview(
        files=req.context.get("files", []),
        project_type=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="preview_agent",
        message="✅ Preview generated",
        metadata=result
    )


# ============================================
# SPECIALIZED GENERATORS
# ============================================

async def execute_test_generator(req: AgentRequest) -> AgentResponse:
    """Test Generator - Unit/Integration/Widget Tests"""
    from ai.test_generator.test_generator import TestGenerator
    
    test_gen = TestGenerator()
    tests = await test_gen.generate_tests_for_project(
        project_type=req.project_type,
        files=req.context.get("files", [])
    )
    
    return AgentResponse(
        success=True,
        agent_used="test_generator",
        files=tests,
        message=f"✅ {len(tests)} test files generated"
    )


async def execute_autofix_agent(req: AgentRequest) -> AgentResponse:
    """AutoFix Agent - Code Quality & Bug Fixes"""
    from ai.autofix.autofix_agent import AutofixAgent
    
    autofix = AutofixAgent()
    result = await autofix.fix_project(
        files=req.context.get("files", []),
        auto_apply=req.auto_fix
    )
    
    return AgentResponse(
        success=True,
        agent_used="autofix_agent",
        files=result.get("fixed_files", []),
        message=f"✅ Fixed {result.get('fixes_applied', 0)} issues"
    )


async def execute_api_generator(req: AgentRequest) -> AgentResponse:
    """API Generator - REST/GraphQL APIs"""
    from ai.api.api_generator import APIGenerator
    
    api_gen = APIGenerator()
    result = await api_gen.generate_api(
        description=req.prompt,
        api_type=req.context.get("api_type", "rest"),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="api_generator",
        files=result.get("files", []),
        message=f"✅ API generated with {len(result.get('endpoints', []))} endpoints"
    )


async def execute_auth_generator(req: AgentRequest) -> AgentResponse:
    """Auth Generator - Authentication System"""
    from ai.auth.auth_generator import AuthGenerator
    
    auth_gen = AuthGenerator()
    result = await auth_gen.generate_auth(
        auth_type=req.context.get("auth_type", "jwt"),
        providers=req.context.get("providers", ["email"]),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="auth_generator",
        files=result.get("files", []),
        message="✅ Authentication system generated"
    )


async def execute_db_generator(req: AgentRequest) -> AgentResponse:
    """Database Generator - Schema & Migrations"""
    from ai.database.db_generator import DBGenerator
    
    db_gen = DBGenerator()
    result = await db_gen.generate_schema(
        description=req.prompt,
        db_type=req.context.get("db_type", "sqlite"),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="db_generator",
        files=result.get("files", []),
        message=f"✅ Database schema with {len(result.get('tables', []))} tables"
    )


async def execute_flutter_generator(req: AgentRequest) -> AgentResponse:
    """Flutter Generator - Complete Flutter App"""
    from ai.code_generator.flutter_generator import FlutterGenerator
    
    flutter_gen = FlutterGenerator()
    result = await flutter_gen.generate_app(
        app_name=req.project_name,
        description=req.prompt,
        features=req.context.get("features", [])
    )
    
    return AgentResponse(
        success=True,
        agent_used="flutter_generator",
        files=result.get("files", []),
        message=f"✅ Flutter app generated with {len(result.get('files', []))} files"
    )


async def execute_react_generator(req: AgentRequest) -> AgentResponse:
    """React Generator - Complete React App"""
    from ai.code_generator.react_generator import ReactGenerator
    
    react_gen = ReactGenerator()
    result = await react_gen.generate_app(
        app_name=req.project_name,
        description=req.prompt,
        features=req.context.get("features", [])
    )
    
    return AgentResponse(
        success=True,
        agent_used="react_generator",
        files=result.get("files", []),
        message=f"✅ React app generated with {len(result.get('files', []))} files"
    )


async def execute_payment_generator(req: AgentRequest) -> AgentResponse:
    """Payment Generator - Stripe/PayPal Integration"""
    from ai.payment_generator.payment_generator import PaymentGenerator
    
    payment_gen = PaymentGenerator()
    result = await payment_gen.generate_payment_system(
        providers=req.context.get("providers", ["stripe"]),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="payment_generator",
        files=result.get("files", []),
        message="✅ Payment integration generated"
    )


async def execute_pwa_generator(req: AgentRequest) -> AgentResponse:
    """PWA Generator - Progressive Web App Features"""
    from ai.pwa.pwa_generator import PWAGenerator
    
    pwa_gen = PWAGenerator()
    result = await pwa_gen.generate_pwa_features(
        app_name=req.project_name,
        features=req.context.get("features", ["offline", "install"])
    )
    
    return AgentResponse(
        success=True,
        agent_used="pwa_generator",
        files=result.get("files", []),
        message="✅ PWA features generated"
    )


async def execute_theme_generator(req: AgentRequest) -> AgentResponse:
    """Theme Generator - Theming & Styling"""
    from ai.theme.theme_generator import ThemeGenerator
    
    theme_gen = ThemeGenerator()
    result = await theme_gen.generate_theme(
        style=req.context.get("style", "modern"),
        colors=req.context.get("colors", {}),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="theme_generator",
        files=result.get("files", []),
        message="✅ Theme generated"
    )


async def execute_store_generator(req: AgentRequest) -> AgentResponse:
    """Store Generator - State Management"""
    from ai.store_generator.store_generator import StoreGenerator
    
    store_gen = StoreGenerator()
    result = await store_gen.generate_store(
        state_type=req.context.get("state_type", "provider"),
        framework=req.project_type
    )
    
    return AgentResponse(
        success=True,
        agent_used="store_generator",
        files=result.get("files", []),
        message="✅ State management generated"
    )


@router.get("/api/agents/list")
async def list_all_agents():
    """Liste aller verfügbaren Agents"""
    return {
        "total_agents": 16,
        "agents": [
            {"name": "ui_agent", "description": "UI & Screen Generation"},
            {"name": "code_agent", "description": "Business Logic"},
            {"name": "build_agent", "description": "Build Configuration"},
            {"name": "deploy_agent", "description": "Deployment Setup"},
            {"name": "preview_agent", "description": "Preview & Testing"},
            {"name": "test_generator", "description": "Automated Tests"},
            {"name": "autofix_agent", "description": "Code Fixing & Quality"},
            {"name": "api_generator", "description": "REST/GraphQL APIs"},
            {"name": "auth_generator", "description": "Authentication"},
            {"name": "db_generator", "description": "Database Schema"},
            {"name": "flutter_generator", "description": "Flutter Apps"},
            {"name": "react_generator", "description": "React Apps"},
            {"name": "payment_generator", "description": "Payment Integration"},
            {"name": "pwa_generator", "description": "PWA Features"},
            {"name": "theme_generator", "description": "Theming & Styling"},
            {"name": "store_generator", "description": "State Management"}
        ]
    }
