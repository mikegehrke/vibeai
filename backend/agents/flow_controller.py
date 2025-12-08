# -------------------------------------------------------------
# VIBEAI – FULL FLOW CONTROLLER
# -------------------------------------------------------------
"""
Complete End-to-End Flow Controller

Orchestrates entire pipeline from prompt to download:
1. User Prompt
2. UI Generation (AI)
3. Code Generation
4. Live Preview
5. Build APK/Web
6. Download Link

Features:
- Smart pipeline selection
- Progress tracking
- Error recovery
- Multi-user support
- Admin monitoring
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional


class FlowController:
    """
    Main controller for complete app development flow.
    """

    def __init__(self):
        self.active_flows: Dict[str, Dict] = {}
        self.flow_history: List[Dict] = []

    # ---------------------------------------------------------
    # MAIN FLOW EXECUTION
    # ---------------------------------------------------------
    async def execute_full_flow(
        self,
        user_id: str,
        prompt: str,
        framework: str = "flutter",
        build_target: str = "apk",
        options: Optional[Dict] = None,
    ) -> Dict:
        """Execute complete flow from prompt to download."""
        flow_id = f"flow_{uuid.uuid4().hex[:8]}"
        start_time = datetime.now()

        # Initialize flow
        flow = {
            "flow_id": flow_id,
            "user_id": user_id,
            "prompt": prompt,
            "framework": framework,
            "build_target": build_target,
            "status": "starting",
            "progress": 0,
            "current_step": None,
            "results": {},
            "errors": [],
            "started_at": start_time,
            "completed_at": None,
        }

        self.active_flows[flow_id] = flow

        try:
            # Step 1: UI Generation
            flow["current_step"] = "ui_generation"
            flow["progress"] = 10
            ui_result = await self._execute_ui_generation(prompt, framework)

            if not ui_result.get("success"):
                raise Exception(f"UI Generation failed: {ui_result.get('error')}")

            flow["results"]["ui"] = ui_result.get("result")
            flow["progress"] = 25

            # Step 2: Code Generation
            flow["current_step"] = "code_generation"
            code_result = await self._execute_code_generation(ui_result.get("result"), framework)

            if not code_result.get("success"):
                raise Exception(f"Code Generation failed: {code_result.get('error')}")

            flow["results"]["code"] = code_result.get("result")
            flow["progress"] = 40

            # Step 3: Write Code & Setup Project
            flow["current_step"] = "project_setup"
            project_path = await self._setup_project(code_result.get("result"), framework, flow_id)
            flow["results"]["project_path"] = project_path
            flow["progress"] = 50

            # Step 4: Live Preview (Optional but recommended)
            flow["current_step"] = "preview"
            preview_result = await self._start_preview(project_path, framework)

            if preview_result.get("success"):
                flow["results"]["preview"] = preview_result.get("result")

            flow["progress"] = 60

            # Step 5: Build
            flow["current_step"] = "building"
            build_result = await self._execute_build(project_path, framework, build_target)

            if not build_result.get("success"):
                raise Exception(f"Build failed: {build_result.get('error')}")

            flow["results"]["build"] = build_result.get("result")
            flow["progress"] = 85

            # Step 6: Generate Download Link
            flow["current_step"] = "deploying"
            deploy_result = await self._generate_download(build_result.get("result", {}).get("build_id"))

            if deploy_result.get("success"):
                flow["results"]["download"] = deploy_result.get("result")

            flow["progress"] = 100

            # Complete
            flow["status"] = "completed"
            flow["current_step"] = "finished"
            flow["completed_at"] = datetime.now()

            # Move to history
            self.flow_history.append(flow.copy())

            return {
                "success": True,
                "flow_id": flow_id,
                "status": "completed",
                "results": flow["results"],
                "duration": (flow["completed_at"] - start_time).total_seconds(),
            }

        except Exception as e:
            flow["status"] = "failed"
            flow["errors"].append(str(e))
            flow["completed_at"] = datetime.now()

            self.flow_history.append(flow.copy())

            return {
                "success": False,
                "flow_id": flow_id,
                "status": "failed",
                "error": str(e),
                "results": flow["results"],
                "duration": (flow["completed_at"] - start_time).total_seconds(),
            }

    # ---------------------------------------------------------
    # INDIVIDUAL STEPS
    # ---------------------------------------------------------
    async def _execute_ui_generation(self, prompt: str, framework: str) -> Dict:
        """Step 1: Generate UI from prompt."""
        from agents.orchestrator import orchestrator

        return await orchestrator.execute_task(
            task_type="create_ui",
            params={
                "prompt": prompt,
                "framework": framework,
                "style": "material" if framework == "flutter" else "tailwind",
            },
        )

    async def _execute_code_generation(self, ui_structure: Dict, framework: str) -> Dict:
        """Step 2: Generate code from UI structure."""
        from agents.orchestrator import orchestrator

        task_type = f"generate_{framework}"

        return await orchestrator.execute_task(task_type=task_type, params={"screen": ui_structure.get("screen")})

    async def _setup_project(self, code_data: Dict, framework: str, flow_id: str) -> str:
        """Step 3: Write code and setup project."""
        import os

        # Create project directory
        project_path = f"/tmp/vibeai_{framework}_{flow_id}"
        os.makedirs(project_path, exist_ok=True)

        # Write code files
        if framework == "flutter":
            # Write main.dart
            lib_path = os.path.join(project_path, "lib")
            os.makedirs(lib_path, exist_ok=True)

            code_file = os.path.join(lib_path, "main.dart")
            with open(code_file, "w", encoding="utf-8") as f:
                f.write(code_data.get("code", ""))

            # Create pubspec.yaml
            pubspec = """name: vibeai_app
description: A VibeAI generated app
version: 1.0.0

environment:
  sdk: '>=2.17.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
"""
            with open(os.path.join(project_path, "pubspec.yaml"), "w") as f:
                f.write(pubspec)

        elif framework == "react":
            # Write React component
            src_path = os.path.join(project_path, "src")
            os.makedirs(src_path, exist_ok=True)

            code_file = os.path.join(src_path, "App.jsx")
            with open(code_file, "w", encoding="utf-8") as f:
                f.write(code_data.get("code", ""))

        return project_path

    async def _start_preview(self, project_path: str, framework: str) -> Dict:
        """Step 4: Start live preview."""
        from agents.orchestrator import orchestrator

        task_type = f"start_{framework}_preview"

        return await orchestrator.execute_task(task_type=task_type, params={"project_path": project_path})

    async def _execute_build(self, project_path: str, framework: str, build_target: str) -> Dict:
        """Step 5: Execute build."""
        from agents.orchestrator import orchestrator

        if framework == "flutter":
            if build_target == "apk":
                task_type = "build_flutter_apk"
            elif build_target == "web":
                task_type = "build_flutter_web"
            else:
                task_type = "build_flutter_apk"
        elif framework == "react":
            task_type = "build_react_web"
        else:
            task_type = "build_react_web"

        return await orchestrator.execute_task(
            task_type=task_type,
            params={"project_path": project_path, "build_mode": "release"},
        )

    async def _generate_download(self, build_id: str) -> Dict:
        """Step 6: Generate download link."""
        from agents.orchestrator import orchestrator

        return await orchestrator.execute_task(task_type="generate_download_link", params={"build_id": build_id})

    # ---------------------------------------------------------
    # FLOW MONITORING
    # ---------------------------------------------------------
    def get_flow_status(self, flow_id: str) -> Optional[Dict]:
        """Get flow status."""
        flow = self.active_flows.get(flow_id)

        if not flow:
            # Check history
            for f in self.flow_history:
                if f["flow_id"] == flow_id:
                    return f
            return None

        return {
            "flow_id": flow["flow_id"],
            "user_id": flow["user_id"],
            "prompt": flow["prompt"],
            "framework": flow["framework"],
            "status": flow["status"],
            "progress": flow["progress"],
            "current_step": flow["current_step"],
            "results": flow["results"],
            "errors": flow["errors"],
        }

    def list_active_flows(self) -> List[Dict]:
        """List all active flows."""
        return [self.get_flow_status(flow_id) for flow_id in self.active_flows.keys()]

    def list_user_flows(self, user_id: str) -> List[Dict]:
        """List all flows for a specific user."""
        flows = []

        # Active flows
        for flow in self.active_flows.values():
            if flow["user_id"] == user_id:
                flows.append(self.get_flow_status(flow["flow_id"]))

        # History
        for flow in self.flow_history:
            if flow["user_id"] == user_id:
                flows.append(flow)

        return sorted(flows, key=lambda x: x.get("started_at", datetime.now()), reverse=True)


# Global Controller
flow_controller = FlowController()