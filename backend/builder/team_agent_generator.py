# -------------------------------------------------------------
# VIBEAI – TEAM AGENT GENERATOR
# -------------------------------------------------------------
"""
Team Agent Generator - Multi-Agent App Creation System

Features:
- Multiple specialized agents working in parallel
- Complete app creation (like Smart Agent)
- Live-coding in editor (character-by-character)
- File-by-file generation
- Project structure planning with multiple agents
- Better than Smart Agent (parallel work, specialized expertise)
"""

import asyncio
import json
import os
from typing import Dict, List, Optional, Callable, Any
from pydantic import BaseModel

from ai.team.team_engine import team_engine
from codestudio.project_manager import project_manager


class TeamAgentRequest(BaseModel):
    project_id: str
    project_name: str
    platform: str = "flutter"
    description: str
    features: List[str] = []


class FileInfo(BaseModel):
    path: str
    content: str
    language: str
    step: int
    agent: str  # Which agent created this file


class TeamAgentGenerator:
    """
    🤖 Team Agent Generator - Multi-Agent App Creation
    
    Uses multiple specialized agents working in parallel:
    - Frontend Agent: UI/UX, Components
    - Backend Agent: API, Services, Logic
    - Designer Agent: UI Design, Styling
    - Architect Agent: Structure, Best Practices
    - Code Generator: Implementation
    - Reviewer: Quality Check
    - Package Manager: Dependencies
    - Auto-Fix: Error Fixing
    
    All work in parallel for faster, better results!
    """
    
    def __init__(self, api_base_url: str = "http://localhost:8005"):
        self.api_base_url = api_base_url
        self.model = "gpt-4o"
        self.max_tokens = 16384
        
        # Define which agents work on which parts
        self.agent_assignments = {
            "frontend": ["frontend", "designer"],  # Frontend files
            "backend": ["backend", "architect"],   # Backend files
            "config": ["architect", "packager"],   # Config files
            "core": ["architect", "coder"],        # Core files
            "models": ["backend", "architect"],    # Data models
            "services": ["backend", "coder"],      # Services
            "screens": ["frontend", "designer"],   # UI Screens
            "widgets": ["frontend", "designer"],   # UI Components
            "tests": ["testing", "reviewer"]        # Tests
        }
    
    async def generate_project_live(
        self,
        request: TeamAgentRequest,
        on_file_created: Optional[Callable] = None,
        on_step: Optional[Callable] = None,
        on_error: Optional[Callable] = None
    ) -> Dict:
        """
        Generates a complete project with MULTIPLE AGENTS working in parallel
        
        Args:
            request: Project request
            on_file_created: Callback when file is created (for live updates)
            on_step: Callback for each step
            on_error: Callback on errors
            
        Returns:
            Dict with all generated files
        """
        
        try:
            all_files = []
            step_count = 0
            
            # STEP 1: Multiple agents plan project structure together
            step_count += 1
            if on_step:
                await on_step("👥 **Team Agent:** Mehrere Agenten planen Projektstruktur...", step_count)
            
            # Use Architect + Frontend + Backend agents to plan structure
            structure_prompt = f"""
            Plan the complete project structure for:
            - Project: {request.project_name}
            - Platform: {request.platform}
            - Description: {request.description}
            - Features: {', '.join(request.features)}
            
            Create a detailed file structure with:
            1. Configuration files (package.json, pubspec.yaml, etc.)
            2. Core files (main, app, routing)
            3. Models/Data structures
            4. Services/API
            5. Screens/UI
            6. Widgets/Components
            7. Tests
            
            Return JSON structure with file paths and descriptions.
            """
            
            # Get structure from Architect agent (best for planning)
            architect_result = await team_engine.ask("architect", structure_prompt)
            structure_plan = self._parse_structure_plan(architect_result.get("response", ""))
            
            step_count += 1
            if on_step:
                await on_step(f"✅ Projektstruktur geplant: {len(structure_plan)} Dateien (von {len(self.agent_assignments)} Agenten)", step_count)
            
            # STEP 2: Generate files in parallel with multiple agents
            step_count += 1
            if on_step:
                await on_step("⚡ **Team Agent:** Mehrere Agenten erstellen Dateien parallel...", step_count)
            
            # Group files by type for parallel agent assignment
            file_groups = self._group_files_by_type(structure_plan)
            
            # Generate each group in parallel
            tasks = []
            for file_type, files in file_groups.items():
                agents = self.agent_assignments.get(file_type, ["coder"])
                task = self._generate_file_group_parallel(
                    files, agents, request, step_count, on_file_created
                )
                tasks.append(task)
            
            # Wait for all groups to complete (parallel execution)
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Collect all files
            for result in results:
                if isinstance(result, list):
                    all_files.extend(result)
                elif isinstance(result, Exception):
                    print(f"❌ Error in file group: {result}")
            
            # STEP 3: Review and fix with Reviewer + Auto-Fix agents
            step_count += 1
            if on_step:
                await on_step("🔍 **Team Agent:** Reviewer prüft Code-Qualität...", step_count)
            
            # Review all files in parallel
            review_tasks = []
            for file_info in all_files:
                review_task = self._review_and_fix_file(file_info, on_file_created)
                review_tasks.append(review_task)
            
            reviewed_files = await asyncio.gather(*review_tasks, return_exceptions=True)
            
            # Update files with fixes
            for i, reviewed_file in enumerate(reviewed_files):
                if isinstance(reviewed_file, dict) and reviewed_file.get("fixed"):
                    all_files[i] = reviewed_file["file"]
            
            return {
                "success": True,
                "files": all_files,
                "total_files": len(all_files),
                "agents_used": len(self.agent_assignments),
                "message": f"✅ Projekt erfolgreich generiert mit {len(all_files)} Dateien von {len(self.agent_assignments)} Agenten!"
            }
            
        except Exception as e:
            if on_error:
                await on_error(str(e))
            raise
    
    def _parse_structure_plan(self, response: str) -> List[Dict]:
        """Parse structure plan from agent response"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                structure = json.loads(json_str)
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                structure = json.loads(json_str)
            else:
                # Try parsing entire response as JSON
                structure = json.loads(response)
            
            # Convert to list of file dicts
            if isinstance(structure, dict):
                files = []
                for path, info in structure.items():
                    if isinstance(info, dict):
                        files.append({
                            "path": path,
                            "type": info.get("type", "code"),
                            "description": info.get("description", "")
                        })
                    else:
                        files.append({"path": path, "type": "code", "description": str(info)})
                return files
            elif isinstance(structure, list):
                return structure
            else:
                return []
        except:
            # Fallback: Generate default structure
            return self._generate_default_structure()
    
    def _generate_default_structure(self) -> List[Dict]:
        """Generate default project structure"""
        return [
            {"path": "package.json", "type": "config", "description": "Package configuration"},
            {"path": "lib/main.dart", "type": "core", "description": "Main entry point"},
            {"path": "lib/app.dart", "type": "core", "description": "App widget"},
        ]
    
    def _group_files_by_type(self, structure_plan: List[Dict]) -> Dict[str, List[Dict]]:
        """Group files by type for parallel agent assignment"""
        groups = {
            "config": [],
            "core": [],
            "models": [],
            "services": [],
            "screens": [],
            "widgets": [],
            "tests": [],
            "backend": [],
            "frontend": []
        }
        
        for file_info in structure_plan:
            path = file_info.get("path", "")
            file_type = file_info.get("type", "code")
            
            # Determine group based on path and type
            if "package.json" in path or "pubspec.yaml" in path or "config" in path.lower():
                groups["config"].append(file_info)
            elif "main" in path or "app" in path or "core" in path.lower():
                groups["core"].append(file_info)
            elif "model" in path.lower() or "data" in path.lower():
                groups["models"].append(file_info)
            elif "service" in path.lower() or "api" in path.lower():
                groups["services"].append(file_info)
            elif "screen" in path.lower() or "page" in path.lower():
                groups["screens"].append(file_info)
            elif "widget" in path.lower() or "component" in path.lower():
                groups["widgets"].append(file_info)
            elif "test" in path.lower():
                groups["tests"].append(file_info)
            elif "backend" in path.lower() or "server" in path.lower():
                groups["backend"].append(file_info)
            else:
                groups["frontend"].append(file_info)
        
        # Remove empty groups
        return {k: v for k, v in groups.items() if v}
    
    async def _generate_file_group_parallel(
        self,
        files: List[Dict],
        agents: List[str],
        request: TeamAgentRequest,
        step: int,
        on_file_created: Optional[Callable]
    ) -> List[Dict]:
        """Generate a group of files using multiple agents in parallel"""
        all_files = []
        
        # Create tasks for each file with assigned agents
        tasks = []
        for file_info in files:
            # Use first agent as primary, others as reviewers
            primary_agent = agents[0] if agents else "coder"
            task = self._generate_file_with_agent(
                file_info, primary_agent, request, step, on_file_created
            )
            tasks.append(task)
        
        # Generate all files in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, dict):
                all_files.append(result)
        
        return all_files
    
    async def _generate_file_with_agent(
        self,
        file_info: Dict,
        agent: str,
        request: TeamAgentRequest,
        step: int,
        on_file_created: Optional[Callable]
    ) -> Dict:
        """Generate a single file using a specific agent"""
        file_path = file_info.get("path", "")
        file_type = file_info.get("type", "code")
        description = file_info.get("description", "")
        
        # Build prompt for agent
        prompt = f"""
        Generate complete, production-ready code for:
        - File: {file_path}
        - Type: {file_type}
        - Description: {description}
        - Project: {request.project_name}
        - Platform: {request.platform}
        - Features: {', '.join(request.features)}
        
        Requirements:
        1. Complete, working code
        2. Well-documented with comments (WHAT, HOW, WHY)
        3. Follow best practices
        4. Include error handling
        5. Production-ready quality
        
        Return ONLY the code, no explanations.
        """
        
        # Get code from agent
        result = await team_engine.ask(agent, prompt)
        code_content = result.get("response", "")
        
        # Extract code from markdown if needed
        if "```" in code_content:
            code_start = code_content.find("```")
            if code_start != -1:
                code_start = code_content.find("\n", code_start) + 1
                code_end = code_content.find("```", code_start)
                if code_end != -1:
                    code_content = code_content[code_start:code_end].strip()
        
        # Determine language from file extension
        language = self._get_language_from_path(file_path)
        
        file_data = {
            "path": file_path,
            "content": code_content,
            "language": language,
            "step": step,
            "agent": agent
        }
        
        # Save file
        await self._save_file_directly(request.project_id, file_path, code_content)
        
        # Callback for live updates
        if on_file_created:
            await on_file_created(FileInfo(
                path=file_path,
                content=code_content,
                language=language,
                step=step,
                agent=agent
            ))
        
        return file_data
    
    async def _review_and_fix_file(
        self,
        file_info: Dict,
        on_file_created: Optional[Callable]
    ) -> Dict:
        """Review and fix a file using Reviewer + Auto-Fix agents"""
        try:
            # Review with Reviewer agent
            review_prompt = f"""
            Review this code for errors, bugs, and improvements:
            
            File: {file_info['path']}
            Code:
            {file_info['content'][:2000]}  # Limit for token efficiency
            
            Check for:
            1. Syntax errors
            2. Type errors
            3. Import errors
            4. Logic errors
            5. Best practices
            
            Return JSON: {{"has_errors": bool, "errors": [list], "fixed_code": "..."}}
            """
            
            review_result = await team_engine.ask("reviewer", review_prompt)
            review_response = review_result.get("response", "")
            
            # Parse review
            has_errors = "error" in review_response.lower() or "bug" in review_response.lower()
            
            if has_errors:
                # Fix with Auto-Fix agent
                fix_prompt = f"""
                Fix all errors in this code:
                
                File: {file_info['path']}
                Code:
                {file_info['content']}
                
                Review feedback:
                {review_response}
                
                Return ONLY the fixed code, no explanations.
                """
                
                fix_result = await team_engine.ask("fixer", fix_prompt)
                fixed_code = fix_result.get("response", "")
                
                # Extract code if in markdown
                if "```" in fixed_code:
                    code_start = fixed_code.find("```")
                    if code_start != -1:
                        code_start = fixed_code.find("\n", code_start) + 1
                        code_end = fixed_code.find("```", code_start)
                        if code_end != -1:
                            fixed_code = fixed_code[code_start:code_end].strip()
                
                # Update file
                file_info["content"] = fixed_code
                await self._save_file_directly(
                    file_info.get("project_id", ""),
                    file_info["path"],
                    fixed_code
                )
                
                if on_file_created:
                    await on_file_created(FileInfo(
                        path=file_info["path"],
                        content=fixed_code,
                        language=file_info["language"],
                        step=file_info["step"],
                        agent="fixer"
                    ))
                
                return {"fixed": True, "file": file_info}
            
            return {"fixed": False, "file": file_info}
            
        except Exception as e:
            print(f"⚠️ Review error for {file_info.get('path')}: {e}")
            return {"fixed": False, "file": file_info}
    
    async def _save_file_directly(self, project_id: str, file_path: str, content: str):
        """Save file directly via API"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/api/builder/update-file",
                    json={
                        "project_id": project_id,
                        "file_path": file_path,
                        "content": content
                    }
                ) as response:
                    if response.status == 200:
                        print(f"✅ Saved: {file_path}")
                    else:
                        print(f"⚠️ Save failed: {file_path} ({response.status})")
        except Exception as e:
            print(f"❌ Error saving {file_path}: {e}")
    
    def _get_language_from_path(self, path: str) -> str:
        """Determine language from file path"""
        ext = path.split(".")[-1].lower()
        language_map = {
            "dart": "dart",
            "js": "javascript",
            "jsx": "javascript",
            "ts": "typescript",
            "tsx": "typescript",
            "py": "python",
            "json": "json",
            "yaml": "yaml",
            "yml": "yaml",
            "md": "markdown",
            "html": "html",
            "css": "css"
        }
        return language_map.get(ext, "text")


