# -------------------------------------------------------------
# VIBEAI – PROJECT OPTIMIZER AGENT
# -------------------------------------------------------------
import logging
import os
from typing import Any, Dict

from ai.agent_dispatcher import agent_dispatcher
from ai.memory.project_memory import project_memory

logger = logging.getLogger("project_optimizer")


class ProjectOptimizer:
    """
    Project Optimization Agent.

    Analysiert und optimiert komplette Projekte:

    **Code Analysis:**
    - Ungenutzter Code (Dead Code)
    - Doppelte Dateien/Funktionen
    - Ineffiziente Funktionen
    - Fehlende Imports
    - Type Safety Issues

    **Structure Analysis:**
    - Schlechte Ordnerstruktur
    - Falsche Modul-Organisation
    - Circular Dependencies
    - Over-Engineering

    **Performance Analysis:**
    - Langsame Funktionen
    - Memory Leaks
    - Unnötige Re-Renders
    - Database Query Optimization

    **Quality Analysis:**
    - Code Smells
    - Anti-Patterns
    - Missing Error Handling
    - Inconsistent Naming

    **Recommendations:**
    - Neue Architektur vorschlagen
    - Refactoring-Plan
    - Migration Guide
    - Best Practices
    """

    def __init__(self):
        self.projects_dir = os.getenv("PROJECTS_DIR", "./projects")

        self.file_extensions = {
            "python": [".py"],
            "javascript": [".js", ".jsx", ".ts", ".tsx"],
            "dart": [".dart"],
            "java": [".java"],
            "csharp": [".cs"],
            "go": [".go"],
            "rust": [".rs"],
            "php": [".php"],
        }

    async def analyze(self, user_id: str, project_id: str, analysis_type: str = "full") -> Dict[str, Any]:
        """
        Analyze project and find optimization opportunities.

        Args:
            user_id: User ID
            project_id: Project ID
            analysis_type: Type of analysis
                - "full" (complete analysis)
                - "code" (code quality only)
                - "structure" (architecture only)
                - "performance" (performance only)

        Returns:
            {
                "success": bool,
                "project_id": str,
                "analysis_type": str,
                "files_analyzed": int,
                "issues_found": int,
                "report": {...},
                "recommendations": List[str]
            }
        """
        logger.info(f"🔍 Analyzing project {project_id} (type: {analysis_type})")

        project_path = self._get_project_path(user_id, project_id)

        if not os.path.exists(project_path):
            return {"success": False, "error": "Project not found"}

        # 1) Collect all code files
        code_map = self._collect_code_files(project_path)

        if not code_map:
            return {"success": False, "error": "No code files found in project"}

        # 2) Build analysis prompt based on type
        prompt = self._build_analysis_prompt(code_map, analysis_type)

        # 3) Use high-quality agent for analysis
        result = await agent_dispatcher.dispatch(
            task=prompt,
            agent_type="lead_developer",  # Best for architecture analysis
            quality=9,
            max_cost=0.10,  # Allow expensive model for thorough analysis
        )

        response = result.get("response", "")

        # 4) Parse report
        report = self._parse_analysis_report(response)

        # 5) Save to memory
        project_memory.add_decision(
            project_id=project_id,
            decision=f"Optimization Analysis ({analysis_type})",
            reason=f"Found {report.get('issues_count', 0)} issues",
        )

        return {
            "success": True,
            "project_id": project_id,
            "analysis_type": analysis_type,
            "files_analyzed": len(code_map),
            "issues_found": report.get("issues_count", 0),
            "report": report,
            "recommendations": report.get("recommendations", []),
            "model_used": result.get("model_used"),
            "cost": result.get("cost", 0),
        }

    async def suggest_refactoring(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """
        Suggest complete project refactoring.

        Returns:
            {
                "success": bool,
                "current_structure": str,
                "suggested_structure": str,
                "migration_steps": List[str],
                "benefits": List[str]
            }
        """
        logger.info(f"🔄 Suggesting refactoring for {project_id}")

        project_path = self._get_project_path(user_id, project_id)

        if not os.path.exists(project_path):
            return {"success": False, "error": "Project not found"}

        # Get current structure
        structure = self._get_project_structure(project_path)

        # Ask AI for refactoring suggestions
        prompt = f"""Analysiere diese Projektstruktur und schlage Verbesserungen vor:

**Aktuelle Struktur:**
{structure}

Erstelle:
1. Optimale neue Ordnerstruktur
2. Schritt-für-Schritt Migration Plan
3. Vorteile der neuen Struktur
4. Potenzielle Risiken

Fokus auf:
- Clean Architecture
- Separation of Concerns
- Maintainability
- Scalability"""

        result = await agent_dispatcher.dispatch(task=prompt, agent_type="lead_developer", quality=9)

        response = result.get("response", "")

        # Parse response
        refactoring = self._parse_refactoring_suggestion(response)

        return {
            "success": True,
            "project_id": project_id,
            "current_structure": structure,
            "suggested_structure": refactoring.get("new_structure", ""),
            "migration_steps": refactoring.get("steps", []),
            "benefits": refactoring.get("benefits", []),
            "risks": refactoring.get("risks", []),
        }

    async def find_dead_code(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """
        Find unused code in project.

        Returns:
            {
                "success": bool,
                "dead_code_found": int,
                "unused_files": List[str],
                "unused_functions": List[str],
                "unused_imports": List[str]
            }
        """
        logger.info(f"🗑️ Finding dead code in {project_id}")

        project_path = self._get_project_path(user_id, project_id)
        code_map = self._collect_code_files(project_path)

        if not code_map:
            return {"success": False, "error": "No code files"}

        prompt = f"""Finde ungenutzten Code in diesem Projekt:

{len(code_map)} Dateien analysiert.

Sample:
{list(code_map.items())[0][1][:1500] if code_map else ''}

Finde:
- Ungenutzte Dateien
- Ungenutzte Funktionen
- Ungenutzte Imports
- Toten Code
- Doppelte Dateien

Liste jede Datei/Funktion die gelöscht werden kann."""

        result = await agent_dispatcher.dispatch(task=prompt, agent_type="code_reviewer", quality=8)

        response = result.get("response", "")

        # Parse dead code report
        dead_code = self._parse_dead_code_report(response)

        return {
            "success": True,
            "project_id": project_id,
            "dead_code_found": dead_code.get("total_items", 0),
            "unused_files": dead_code.get("files", []),
            "unused_functions": dead_code.get("functions", []),
            "unused_imports": dead_code.get("imports", []),
            "duplicates": dead_code.get("duplicates", []),
        }

    async def optimize_performance(self, user_id: str, project_id: str) -> Dict[str, Any]:
        """
        Find performance bottlenecks.

        Returns:
            {
                "success": bool,
                "bottlenecks": List[Dict],
                "optimizations": List[str]
            }
        """
        logger.info(f"⚡ Optimizing performance for {project_id}")

        project_path = self._get_project_path(user_id, project_id)
        code_map = self._collect_code_files(project_path)

        prompt = f"""Analysiere Performance-Probleme:

{len(code_map)} Dateien.

Sample:
{list(code_map.items())[0][1][:1500] if code_map else ''}

Finde:
- Langsame Funktionen
- Ineffiziente Loops
- Unnötige Re-Calculations
- Memory Leaks
- Database Query Probleme

Schlage Optimierungen vor."""

        result = await agent_dispatcher.dispatch(task=prompt, agent_type="performance_optimizer", quality=8)

        response = result.get("response", "")

        performance = self._parse_performance_report(response)

        return {
            "success": True,
            "project_id": project_id,
            "bottlenecks": performance.get("bottlenecks", []),
            "optimizations": performance.get("optimizations", []),
            "estimated_improvement": performance.get("improvement", "Unknown"),
        }

    def _get_project_path(self, user_id: str, project_id: str) -> str:
        """Get project directory path."""
        return os.path.join(self.projects_dir, user_id, project_id)

    def _collect_code_files(self, project_path: str) -> Dict[str, str]:
        """
        Collect all code files in project.

        Returns:
            {
                "path/file.py": "file content",
                ...
            }
        """
        code_map = {}

        for root, dirs, files in os.walk(project_path):
            for file in files:
                # Check if code file
                is_code = any(file.endswith(ext) for exts in self.file_extensions.values() for ext in exts)

                if not is_code:
                    continue

                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, project_path)

                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()

                        # Limit content size
                        if len(content) > 10000:
                            content = content[:10000] + "\n... (truncated)"

                        code_map[relative_path] = content

                except Exception as e:
                    logger.warning(f"⚠️ Could not read {relative_path}: {e}")

        return code_map

    def _get_project_structure(self, project_path: str) -> str:
        """
        Get project folder structure.

        Returns:
            Tree-like structure string
        """
        structure = []

        for root, dirs, files in os.walk(project_path):
            level = root.replace(project_path, "").count(os.sep)
            indent = " " * 2 * level
            structure.append(f"{indent}{os.path.basename(root)}/")

            sub_indent = " " * 2 * (level + 1)
            for file in files:
                structure.append(f"{sub_indent}{file}")

        return "\n".join(structure[:100])  # Limit

    def _build_analysis_prompt(self, code_map: Dict[str, str], analysis_type: str) -> str:
        """Build prompt based on analysis type."""

        # Sample code (first 3 files)
        sample_files = list(code_map.items())[:3]
        sample_code = "\n\n".join([f"**{path}**\n```\n{content[:1000]}\n```" for path, content in sample_files])

        if analysis_type == "full":
            return f"""Vollständige Projekt-Analyse:

{len(code_map)} Dateien gefunden.

Sample Code:
{sample_code}

Analysiere ALLES:
1. **Code Quality:** Bugs, Anti-Patterns, Code Smells
2. **Architecture:** Struktur, Dependencies, Organization
3. **Performance:** Bottlenecks, Ineffizienzen
4. **Security:** Vulnerabilities, Best Practices
5. **Dead Code:** Ungenutzter Code, Duplikate
6. **Documentation:** Fehlende Docs, Kommentare

Erstelle detaillierten Report mit:
- Kritische Probleme (🔴)
- Warnings (🟡)
- Verbesserungen (🟢)
- Empfohlene Aktionen"""

        elif analysis_type == "code":
            return f"""Code Quality Analysis:

{sample_code}

Prüfe:
- Bugs und Fehler
- Code Smells
- Anti-Patterns
- Best Practices
- Type Safety
- Error Handling"""

        elif analysis_type == "structure":
            structure = self._get_project_structure(list(code_map.keys())[0] if code_map else ".")
            return f"""Architecture Analysis:

**Struktur:**
{structure}

Prüfe:
- Ordner-Organisation
- Module Dependencies
- Separation of Concerns
- Scalability
- Maintainability"""

        elif analysis_type == "performance":
            return f"""Performance Analysis:

{sample_code}

Finde:
- Langsame Funktionen
- Ineffiziente Algorithmen
- Memory Issues
- Unnecessary Calculations
- Database Query Problems"""

        return f"Analyze this project: {len(code_map)} files"

    def _parse_analysis_report(self, response: str) -> Dict:
        """Parse AI analysis response."""

        # Simple parsing (can be improved with structured output)

        # Count mentions of issues
        critical = response.lower().count("critical") + response.lower().count("🔴")
        warnings = response.lower().count("warning") + response.lower().count("🟡")

        return {
            "raw_report": response,
            "issues_count": critical + warnings,
            "critical_issues": critical,
            "warnings": warnings,
            "recommendations": ["See detailed report"],  # Can be parsed from response
        }

    def _parse_refactoring_suggestion(self, response: str) -> Dict:
        """Parse refactoring suggestion."""
        return {
            "new_structure": response,  # Simplified
            "steps": ["See detailed plan"],
            "benefits": ["See analysis"],
            "risks": ["Review carefully"],
        }

    def _parse_dead_code_report(self, response: str) -> Dict:
        """Parse dead code findings."""
        return {
            "total_items": response.count("unused") + response.count("delete"),
            "files": [],  # Can be parsed
            "functions": [],
            "imports": [],
            "duplicates": [],
        }

    def _parse_performance_report(self, response: str) -> Dict:
        """Parse performance analysis."""
        return {
            "bottlenecks": [],
            "optimizations": ["See detailed report"],
            "improvement": "See analysis",
        }


# Global Instance
project_optimizer = ProjectOptimizer()
