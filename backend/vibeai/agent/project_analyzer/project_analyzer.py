# -------------------------------------------------------------
# VIBEAI SUPER AGENT - PROJECT ANALYZER
# -------------------------------------------------------------
"""
Project structure analysis and planning.

Analyzes requirements and creates generation plan.
"""

import os
from typing import Dict, List
from vibeai.agent.event_stream.event_emitter import EventEmitter
from codestudio.terminal_routes import get_project_path


class ProjectAnalyzer:
    """
    Analyzes project requirements and creates generation plan.
    
    Features:
    - Analyze project structure
    - Plan file generation order
    - Detect missing components
    - Create generation queue
    """
    
    def __init__(self, project_id: str, event_emitter: EventEmitter):
        self.project_id = project_id
        self.event_emitter = event_emitter
        self.project_path = get_project_path(project_id)
    
    async def analyze_project(
        self,
        project_name: str,
        platform: str,
        description: str,
        features: List[str]
    ) -> Dict:
        """
        Analyze project and create generation plan.
        
        Returns:
        - structure: Project structure
        - files_to_create: Ordered list of files to create
        - missing_components: Missing components detected
        """
        await self.event_emitter.emit("analysis_started", {
            "project_name": project_name,
            "platform": platform
        })
        
        # Analyze existing structure
        existing_files = self._scan_existing_files()
        
        # Plan structure based on platform
        if platform == "flutter":
            structure = self._plan_flutter_structure(project_name, description, features)
        elif platform in ["react", "nextjs"]:
            structure = self._plan_react_structure(project_name, description, features)
        else:
            structure = {"files": []}
        
        # Filter out existing files
        files_to_create = [
            f for f in structure["files"]
            if f["path"] not in existing_files
        ]
        
        # Detect missing components
        missing_components = self._detect_missing_components(existing_files, structure)
        
        await self.event_emitter.emit("analysis_complete", {
            "total_files": len(files_to_create),
            "missing_components": len(missing_components)
        })
        
        return {
            "structure": structure,
            "files_to_create": files_to_create,
            "missing_components": missing_components,
            "existing_files": existing_files
        }
    
    def _scan_existing_files(self) -> List[str]:
        """Scan existing files in project."""
        files = []
        
        if not os.path.exists(self.project_path):
            return files
        
        for root, dirs, filenames in os.walk(self.project_path):
            for filename in filenames:
                rel_path = os.path.relpath(
                    os.path.join(root, filename),
                    self.project_path
                )
                files.append(rel_path)
        
        return files
    
    def _plan_flutter_structure(
        self,
        project_name: str,
        description: str,
        features: List[str]
    ) -> Dict:
        """Plan Flutter project structure."""
        files = [
            {"path": "pubspec.yaml", "type": "config", "priority": 1},
            {"path": "lib/main.dart", "type": "code", "priority": 2},
            {"path": "lib/app.dart", "type": "code", "priority": 3},
        ]
        
        # Add models
        if "data" in description.lower() or "model" in description.lower():
            files.extend([
                {"path": "lib/models/user.dart", "type": "code", "priority": 4},
                {"path": "lib/models/item.dart", "type": "code", "priority": 5},
            ])
        
        # Add screens
        files.extend([
            {"path": "lib/screens/home_screen.dart", "type": "code", "priority": 6},
            {"path": "lib/screens/profile_screen.dart", "type": "code", "priority": 7},
        ])
        
        # Add services
        if "api" in description.lower() or "network" in description.lower():
            files.extend([
                {"path": "lib/services/api_service.dart", "type": "code", "priority": 8},
            ])
        
        # Add widgets
        files.extend([
            {"path": "lib/widgets/custom_button.dart", "type": "code", "priority": 9},
        ])
        
        # Add tests
        files.append({"path": "test/widget_test.dart", "type": "code", "priority": 10})
        
        # Sort by priority
        files.sort(key=lambda x: x["priority"])
        
        return {"files": files}
    
    def _plan_react_structure(
        self,
        project_name: str,
        description: str,
        features: List[str]
    ) -> Dict:
        """Plan React project structure."""
        files = [
            {"path": "package.json", "type": "config", "priority": 1},
            {"path": "src/index.js", "type": "code", "priority": 2},
            {"path": "src/App.js", "type": "code", "priority": 3},
        ]
        
        # Add components
        files.extend([
            {"path": "src/components/Header.js", "type": "code", "priority": 4},
        ])
        
        files.sort(key=lambda x: x["priority"])
        
        return {"files": files}
    
    def _detect_missing_components(self, existing_files: List[str], structure: Dict) -> List[Dict]:
        """
        ⚡ Detect missing components intelligently.
        
        Returns list of missing components with:
        - path: File path
        - type: Component type (model, screen, service, widget, etc.)
        - priority: Generation priority
        - reason: Why it's needed
        """
        missing = []
        
        required_files = structure.get("files", [])
        existing_paths = set(existing_files)
        
        for file_info in required_files:
            file_path = file_info.get("path", "")
            if file_path not in existing_paths:
                # Determine component type from path
                component_type = "unknown"
                if "/models/" in file_path:
                    component_type = "model"
                elif "/screens/" in file_path or "/pages/" in file_path:
                    component_type = "screen"
                elif "/services/" in file_path:
                    component_type = "service"
                elif "/widgets/" in file_path or "/components/" in file_path:
                    component_type = "widget"
                elif file_path.endswith(".yaml") or file_path.endswith(".json"):
                    component_type = "config"
                
                missing.append({
                    "path": file_path,
                    "type": component_type,
                    "priority": file_info.get("priority", 999),
                    "reason": f"Required for {component_type} functionality"
                })
        
        # Sort by priority
        missing.sort(key=lambda x: x["priority"])
        
        return missing

