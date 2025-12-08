"""
MASTER AGENT COORDINATOR V2 - LAZY LOADING
Nutzt ALLE vorhandenen VibeAI Agents für vollautomatische App-Generierung
"""
from typing import Dict, List, Optional, Any
import asyncio


class MasterAgentCoordinator:
    """
    MASTER COORDINATOR - Nutzt ALLE vorhandenen Agents mit LAZY LOADING
    
    Agents (lazy loaded):
    - AgentOrchestrator (UI, Code, Build, Deploy, Preview)
    - TestGenerator (Unit, Integration, Widget Tests)
    - AutofixAgent (Code Fixing)
    - Multi-Agent System (V2, V3, V6)
    - Build & Deploy Agents
    """
    
    def __init__(self):
        # LAZY LOADING - Agents werden erst bei Bedarf importiert
        self._orchestrator = None
        self._test_generator = None
        self._autofix_agent = None
        self._agent_coordinator = None
        self._multi_agent = None
        self._build_deploy = None
        
        print("✅ Master Agent Coordinator initialized (lazy loading)")
    
    @property
    def orchestrator(self):
        """Lazy load AgentOrchestrator"""
        if self._orchestrator is None:
            try:
                from ai.orchestrator.orchestrator import AgentOrchestrator
                self._orchestrator = AgentOrchestrator()
            except Exception as e:
                print(f"⚠️ Could not load AgentOrchestrator: {e}")
                self._orchestrator = None
        return self._orchestrator
    
    @property
    def test_generator(self):
        """Lazy load TestGenerator"""
        if self._test_generator is None:
            try:
                from ai.test_generator.test_generator import TestGenerator
                self._test_generator = TestGenerator()
            except Exception as e:
                print(f"⚠️ Could not load TestGenerator: {e}")
                self._test_generator = None
        return self._test_generator
    
    @property
    def autofix_agent(self):
        """Lazy load AutofixAgent"""
        if self._autofix_agent is None:
            try:
                from ai.autofix.autofix_agent import AutofixAgent
                self._autofix_agent = AutofixAgent()
            except Exception as e:
                print(f"⚠️ Could not load AutofixAgent: {e}")
                self._autofix_agent = None
        return self._autofix_agent
    
    @property
    def agent_coordinator(self):
        """Lazy load AgentCoordinator"""
        if self._agent_coordinator is None:
            try:
                from builder.agent_coordinator import AgentCoordinator
                self._agent_coordinator = AgentCoordinator()
            except Exception as e:
                print(f"⚠️ Could not load AgentCoordinator: {e}")
                self._agent_coordinator = None
        return self._agent_coordinator
    
    @property
    def multi_agent(self):
        """Lazy load Multi-Agent System"""
        if self._multi_agent is None:
            try:
                from agents.orchestrator import orchestrator
                self._multi_agent = orchestrator
            except Exception as e:
                print(f"⚠️ Could not load Multi-Agent: {e}")
                self._multi_agent = None
        return self._multi_agent
    
    @property
    def build_deploy(self):
        """Lazy load BuildDeployAgents"""
        if self._build_deploy is None:
            try:
                from agents.build_deploy_agents import BuildDeployAgents
                self._build_deploy = BuildDeployAgents()
            except Exception as e:
                print(f"⚠️ Could not load BuildDeployAgents: {e}")
                self._build_deploy = None
        return self._build_deploy
    
    async def build_complete_project(
        self,
        project_name: str,
        project_type: str,
        description: str,
        user_id: str,
        include_tests: bool = True,
        include_auth: bool = False,
        include_payment: bool = False,
        websocket_callback=None
    ) -> Dict:
        """
        Baut ein KOMPLETTES Projekt mit ALLEN Agents
        
        Pipeline:
        1. UI Agent → Screens & Components
        2. Code Agent → Business Logic
        3. Test Generator → Alle Tests
        4. Autofix Agent → Code Quality
        5. Build Agent → Kompilierung
        6. Deploy Agent → Deployment Config
        """
        
        results = {
            "files": [],
            "tests": [],
            "build_config": {},
            "deploy_config": {},
            "errors_fixed": 0,
            "total_files": 0
        }
        
        try:
            # STEP 1: UI Generation
            if websocket_callback:
                await websocket_callback({
                    "event": "build.step",
                    "step": "ui_generation",
                    "message": "🎨 Generiere UI Components..."
                })
            
            ui_result = await self.orchestrator.handle(
                user_id=user_id,
                project_id=project_name,
                prompt=f"Create {project_type} UI for: {description}",
                context={"intent": "ui"}
            )
            
            if ui_result.get("files"):
                results["files"].extend(ui_result["files"])
                for file in ui_result["files"]:
                    if websocket_callback:
                        await websocket_callback({
                            "event": "file.created",
                            "path": file["path"],
                            "content": file["content"]
                        })
            
            # STEP 2: Code Generation
            if websocket_callback:
                await websocket_callback({
                    "event": "build.step",
                    "step": "code_generation",
                    "message": "⚙️ Generiere Business Logic..."
                })
            
            code_result = await self.orchestrator.handle(
                user_id=user_id,
                project_id=project_name,
                prompt=f"Generate {project_type} code for: {description}",
                context={"intent": "code"}
            )
            
            if code_result.get("files"):
                results["files"].extend(code_result["files"])
                for file in code_result["files"]:
                    if websocket_callback:
                        await websocket_callback({
                            "event": "file.created",
                            "path": file["path"],
                            "content": file["content"]
                        })
            
            # STEP 3: Test Generation (optional)
            if include_tests:
                if websocket_callback:
                    await websocket_callback({
                        "event": "build.step",
                        "step": "test_generation",
                        "message": "🧪 Generiere Tests..."
                    })
                
                # Generate tests for all files
                for file in results["files"]:
                    if file["path"].endswith(('.dart', '.ts', '.tsx', '.js', '.jsx', '.py')):
                        test_cases = await self.test_generator.generate_tests_for_code(
                            code=file["content"],
                            file_path=file["path"],
                            framework=project_type
                        )
                        results["tests"].extend(test_cases)
            
            # STEP 4: Auto-Fix (Code Quality)
            if websocket_callback:
                await websocket_callback({
                    "event": "build.step",
                    "step": "autofix",
                    "message": "🔧 Prüfe Code Quality..."
                })
            
            for file in results["files"]:
                fixed_result = await self.autofix_agent.fix_code(
                    code=file["content"],
                    language=self._detect_language(file["path"])
                )
                if fixed_result.get("fixed"):
                    file["content"] = fixed_result["code"]
                    results["errors_fixed"] += len(fixed_result.get("fixes", []))
            
            # STEP 5: Build Config
            if websocket_callback:
                await websocket_callback({
                    "event": "build.step",
                    "step": "build_config",
                    "message": "📦 Erstelle Build Configuration..."
                })
            
            build_result = await self.build_deploy.generate_build_config(
                project_type=project_type,
                project_name=project_name
            )
            results["build_config"] = build_result
            
            # STEP 6: Deploy Config (optional)
            if websocket_callback:
                await websocket_callback({
                    "event": "build.step",
                    "step": "deploy_config",
                    "message": "🚀 Erstelle Deployment Config..."
                })
            
            deploy_result = await self.build_deploy.generate_deploy_config(
                project_type=project_type,
                project_name=project_name
            )
            results["deploy_config"] = deploy_result
            
            # COMPLETE
            results["total_files"] = len(results["files"]) + len(results["tests"])
            
            if websocket_callback:
                await websocket_callback({
                    "event": "build.finished",
                    "total_files": results["total_files"],
                    "errors_fixed": results["errors_fixed"]
                })
            
            return results
            
        except Exception as e:
            if websocket_callback:
                await websocket_callback({
                    "event": "build.error",
                    "error": str(e)
                })
            raise
    
    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        ext = file_path.split('.')[-1]
        mapping = {
            'dart': 'dart',
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'py': 'python',
            'java': 'java',
            'kt': 'kotlin',
            'swift': 'swift'
        }
        return mapping.get(ext, 'unknown')


# Global instance
master_coordinator = MasterAgentCoordinator()
