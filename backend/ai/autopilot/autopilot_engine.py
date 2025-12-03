# -------------------------------------------------------------
# VIBEAI – MULTI AGENT AUTOPILOT ENGINE
# -------------------------------------------------------------
# from ai.team.team_engine import team_engine  # Temporarily disabled - syntax error
from ai.agent_dispatcher import agent_dispatcher
from ai.memory.project_memory import project_memory
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("autopilot_engine")


class AutopilotEngine:
    """
    Multi-Agent Autopilot - Komplettes AI-Entwicklerteam.
    
    Features:
    - Team Collaboration (mehrere Agenten diskutieren)
    - Automatic Planning (Architektur-Entscheidungen)
    - Code Generation (alle Files)
    - Code Review (gegenseitige Kontrolle)
    - Testing (automatische Tests)
    - Error Fixing (AutoFix)
    - Documentation (README, Kommentare)
    - Deployment (optional)
    
    Das System arbeitet vollständig autonom:
    1. User beschreibt Feature
    2. Team plant Umsetzung
    3. Code wird generiert
    4. Tests werden erstellt
    5. Errors werden gefixt
    6. Feature ist fertig
    """
    
    def __init__(self):
        self.projects_dir = os.getenv("PROJECTS_DIR", "./projects")
        os.makedirs(self.projects_dir, exist_ok=True)
    
    async def build_feature(
        self,
        user_id: str,
        project_id: str,
        task: str,
        auto_deploy: bool = False
    ) -> Dict[str, Any]:
        """
        Baut komplettes Feature automatisch.
        
        Args:
            user_id: User ID
            project_id: Project ID
            task: Feature-Beschreibung
            auto_deploy: Automatisch deployen (default: False)
        
        Returns:
            {
                "success": bool,
                "feature_path": str,
                "collaboration": {...},
                "files_created": List[str],
                "tests_created": List[str],
                "deployment": {...} (optional)
            }
        """
        logger.info(f"🚀 Autopilot Build Feature: {task[:50]}... for user {user_id}")
        
        # 1) Team Collaboration (Brainstorming)
        logger.info("🤝 Step 1/6: Team Collaboration...")
        collaboration = await team_engine.collaborate(
            task=f"Team-Meeting: Baue folgendes Feature: {task}",
            team_members=["lead_developer", "code_reviewer", "ui_designer", "tester"],
            parallel=True
        )
        
        # 2) Extract Decisions
        results = collaboration.get("results", {})
        
        architecture = results.get("lead_developer", {}).get("response", "")
        code_review_suggestions = results.get("code_reviewer", {}).get("response", "")
        ui_design = results.get("ui_designer", {}).get("response", "")
        test_strategy = results.get("tester", {}).get("response", "")
        
        # 3) Generate Code (Lead Developer)
        logger.info("💻 Step 2/6: Code Generation...")
        code_task = f"""Erstelle vollständigen Code für:

{task}

Architektur: {architecture[:500]}
UI Design: {ui_design[:300]}

Erstelle ALLE benötigten Dateien mit komplettem Code."""
        
        code_gen = await agent_dispatcher.dispatch(
            task=code_task,
            agent_type="lead_developer",
            quality=9
        )
        
        # 4) Write Files to Project
        logger.info("📁 Step 3/6: Creating Files...")
        project_path = self._get_project_path(user_id, project_id)
        feature_path = os.path.join(project_path, "autopilot_features")
        os.makedirs(feature_path, exist_ok=True)
        
        feature_file = os.path.join(feature_path, f"feature_{len(os.listdir(feature_path)) + 1}.md")
        
        with open(feature_file, "w", encoding="utf-8") as f:
            f.write("# AUTOPILOT FEATURE\n\n")
            f.write(f"**Task:** {task}\n\n")
            f.write("---\n\n")
            f.write("## 🏗️ Architecture (Lead Developer)\n\n")
            f.write(architecture)
            f.write("\n\n## 💻 Code Implementation\n\n")
            f.write(code_gen.get("response", ""))
            f.write("\n\n## 🎨 UI/UX Design\n\n")
            f.write(ui_design)
            f.write("\n\n## 🔍 Code Review Suggestions\n\n")
            f.write(code_review_suggestions)
            f.write("\n\n## 🧪 Test Strategy\n\n")
            f.write(test_strategy)
        
        files_created = [feature_file]
        
        # 5) Generate Tests
        logger.info("🧪 Step 4/6: Generating Tests...")
        test_task = f"""Erstelle Unit Tests für:

{task}

Code:
{code_gen.get('response', '')[:1000]}

Test Strategy:
{test_strategy[:500]}"""
        
        test_gen = await agent_dispatcher.dispatch(
            task=test_task,
            agent_type="test_engineer",
            quality=7
        )
        
        test_file = os.path.join(feature_path, f"test_feature_{len(os.listdir(feature_path))}.md")
        
        with open(test_file, "w", encoding="utf-8") as f:
            f.write("# AUTOPILOT TESTS\n\n")
            f.write(test_gen.get("response", ""))
        
        files_created.append(test_file)
        
        # 6) Error Check & Fix
        logger.info("🔧 Step 5/6: Error Check...")
        error_check_task = f"""Prüfe diesen Code auf Fehler:

{code_gen.get('response', '')[:2000]}

Finde:
- Syntax Errors
- Logic Errors
- Missing Imports
- Type Errors"""
        
        error_check = await agent_dispatcher.dispatch(
            task=error_check_task,
            agent_type="error_fixer",
            quality=8
        )
        
        error_report = error_check.get("response", "")
        
        # If errors found, fix them
        if "error" in error_report.lower() or "fehler" in error_report.lower():
            logger.info("🔨 Fixing errors...")
            
            fix_task = f"""Fixe diese Fehler:

Fehler-Report:
{error_report[:1000]}

Originaler Code:
{code_gen.get('response', '')[:2000]}"""
            
            fix_result = await agent_dispatcher.dispatch(
                task=fix_task,
                agent_type="error_fixer",
                quality=8
            )
            
            # Update feature file with fixed code
            with open(feature_file, "a", encoding="utf-8") as f:
                f.write("\n\n## 🔧 Error Fixes\n\n")
                f.write(f"**Errors Found:**\n{error_report[:500]}\n\n")
                f.write(f"**Fixed Code:**\n{fix_result.get('response', '')}")
        
        # 7) Save to Memory
        logger.info("💾 Step 6/6: Saving to Memory...")
        project_memory.remember(
            project_id=project_id,
            key=f"feature_{task[:30]}",
            value={
                "task": task,
                "files": files_created,
                "timestamp": str(__import__("datetime").datetime.now())
            }
        )
        
        # 8) Optional: Deploy
        deployment_result = None
        if auto_deploy:
            logger.info("🚀 Deploying...")
            # TODO: Integrate with deployment system
            deployment_result = {"status": "not_implemented"}
        
        return {
            "success": True,
            "feature_path": feature_file,
            "collaboration": {
                "architecture": architecture[:200] + "...",
                "code_review": code_review_suggestions[:200] + "...",
                "ui_design": ui_design[:200] + "...",
                "test_strategy": test_strategy[:200] + "..."
            },
            "files_created": files_created,
            "tests_created": [test_file],
            "errors_fixed": "error" in error_report.lower(),
            "deployment": deployment_result,
            "execution_time": collaboration.get("execution_time", 0)
        }
    
    async def optimize_project(
        self,
        user_id: str,
        project_id: str
    ) -> Dict[str, Any]:
        """
        Optimiert komplettes Projekt automatisch.
        
        Team: Performance Optimizer + Code Reviewer
        """
        logger.info(f"⚡ Autopilot Optimize Project: {project_id}")
        
        # Get project files
        project_path = self._get_project_path(user_id, project_id)
        
        if not os.path.exists(project_path):
            return {
                "success": False,
                "error": "Project not found"
            }
        
        # Collect all code files
        code_files = []
        for root, dirs, files in os.walk(project_path):
            for file in files:
                if file.endswith((".py", ".js", ".ts", ".dart", ".java")):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            code_files.append({
                                "path": file_path,
                                "content": f.read()[:5000]  # Limit
                            })
                    except:
                        pass
        
        # Team reviews all files
        task = f"""Optimiere dieses Projekt:

{len(code_files)} Dateien gefunden.

Prüfe:
- Performance
- Code-Qualität
- Best Practices
- Duplikate

Sample Code:
{code_files[0]['content'][:1000] if code_files else 'No files'}"""
        
        result = await team_engine.collaborate(
            task=task,
            team_members=["performance_optimizer", "code_reviewer"],
            parallel=True
        )
        
        return {
            "success": True,
            "project_id": project_id,
            "files_analyzed": len(code_files),
            "optimization_report": result.get("consensus", ""),
            "recommendations": result.get("results", {})
        }
    
    def _get_project_path(self, user_id: str, project_id: str) -> str:
        """Get project directory path."""
        return os.path.join(self.projects_dir, user_id, project_id)


# Global Instance
autopilot_engine = AutopilotEngine()
