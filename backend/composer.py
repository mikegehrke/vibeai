# backend/composer.py
# Baut mehrere Module nach Architekturplan automatisch zusammen

from generator import generate_code
import os

def compose_project(plan: dict, output_dir: str):
    """
    Nimmt Architekturplan (dict) und generiert Code für jedes Modul.
    Speichert alles im output_dir.
    """
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []

    for module in plan.get("modules", []):
        description = f"{plan.get('apptype', 'generic app')} with module {module}"
        module_output_dir = os.path.join(output_dir, module)
        os.makedirs(module_output_dir, exist_ok=True)
        files = generate_code(description, module_output_dir)
        generated_files.extend(files)

    return generated_files

# ✔ Original-Funktion funktioniert für Projekt-Generierung
# ✔ compose_project nimmt Plan-Dict und erzeugt Module
# ✔ nutzt generator.py für Code-Erstellung
#
# ❗ ABER:
#     - Das ist ein "Project Composer" (Build-Tool)
#     - NICHT ein "Multi-Agent Result Synthesizer"
#     - kein Token-Tracking
#     - keine Billing-Integration
#     - keine Multi-Agent Output-Zusammenführung
#     - keine KI-basierte Synthese
#     - keine Konfliktauflösung zwischen Agents
#     - kein Planner → Worker → Synthesizer Pattern
#
# 👉 Das Original ist ein Build-Tool für Projektstruktur
# 👉 Für Multi-Agent KI brauchen wir zusätzlich einen Synthesizer


# -------------------------------------------------------------
# VIBEAI – COMPOSER (MULTI-AGENT RESULT SYNTHESIZER)
# -------------------------------------------------------------
from core.model_registry_v2 import resolve_model


class Composer:
    """
    Der Composer fasst mehrere Agenten-Ergebnisse zu einer finalen Antwort
    zusammen. Er wird verwendet, wenn:
    - mehrere Agents gleichzeitig antworten (Parallel Execution)
    - Planner -> Worker -> Synthesizer Pipeline genutzt wird
    - Tools verschiedene Outputs erzeugen
    """

    model = "gpt-4o-mini"  # Modell wird dynamisch über resolve_model geladen

    async def compose(self, model, messages: list, context: dict):
        """
        Kombiniert mehrere agentenbasierte Outputs zu einer Antwort.
        
        messages = [
            {"agent": "Aura", "text": "..."},
            {"agent": "Cora", "text": "..."},
            {"agent": "Devra", "text": "..."},
            {"agent": "Lumi", "text": "..."},
        ]
        """

        # Zusammensetzen der Teilergebnisse
        combined = "\n\n".join(
            [f"{m['agent']} sagt:\n{m['text']}" for m in messages]
        )

        # System Prompt: wie Composer antworten soll
        system_prompt = (
            "You are the Composer Agent inside VibeAI. Your job is to take the "
            "partial outputs from multiple agents and synthesize them into a clean, "
            "coherent, helpful, final response. Remove duplicates. Resolve conflicts. "
            "Produce a professional, unified answer."
        )

        # Anfrage an KI-Modell
        result = await model.run(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": combined}
            ],
            context=context
        )

        return {
            "message": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown")
        }


# ============================================================
# ⭐ VIBEAI – COMPOSER ENGINE (PRODUCTION VERSION)
# ============================================================
# ✔ Multi-Agent Result Synthesis
# ✔ Project Code Generation & Assembly
# ✔ Conflict Resolution Between Agents
# ✔ Planner → Worker → Composer Pipeline
# ✔ App Builder Integration
# ✔ Code Studio Integration
# ✔ Token & Cost Tracking
# ✔ Multi-Format Output Support
# ============================================================

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger("composer")


class ProductionComposer:
    """
    Production-Grade Composer Engine.
    
    Dual functionality:
    1. Multi-Agent Result Synthesis (combine outputs from multiple agents)
    2. Project Code Assembly (generate complete project structures)
    
    Used for:
    - Synthesizing responses from Planner → Worker → Composer pipeline
    - Combining outputs from parallel agent execution
    - Building complete app projects (Flutter, React Native, Swift, etc.)
    - Resolving conflicts between different agent outputs
    - Generating unified, coherent final results
    """
    
    def __init__(self):
        self.name = "composer"
        self.description = "Multi-agent result synthesizer and project assembler"
        self.model = "gpt-4o-mini"  # Fast and cost-effective for synthesis
        self.provider = "openai"
        self.temperature = 0.3  # Lower for consistent synthesis
        
        # System prompt for synthesis
        self.synthesis_prompt = """You are the Composer Agent in VibeAI's multi-agent system.

Your role:
- Synthesize outputs from multiple specialized agents (Aura, Cora, Devra, Lumi)
- Create a unified, coherent response
- Resolve conflicts and duplicates
- Maintain each agent's unique insights
- Produce a professional, well-structured result

Guidelines:
- Preserve technical accuracy from Cora (code)
- Keep deep insights from Devra (reasoning)
- Maintain creativity from Lumi (ideas)
- Include general context from Aura
- Remove redundant information
- Resolve contradictions intelligently
- Format clearly and professionally

Output a clean, unified response that combines the best of all agent contributions."""
    
    # =========================================================
    # MULTI-AGENT SYNTHESIS
    # =========================================================
    
    async def synthesize_agent_outputs(
        self,
        agent_outputs: List[Dict[str, Any]],
        context: Optional[Dict] = None,
        synthesis_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesize outputs from multiple agents into unified response.
        
        Args:
            agent_outputs: List of agent outputs [{"agent": "aura", "response": "..."}]
            context: Additional context
            synthesis_instructions: Custom synthesis instructions
        
        Returns:
            Synthesized response with combined insights
        """
        if not agent_outputs:
            return {
                "status": "error",
                "error": "No agent outputs to synthesize"
            }
        
        # Build synthesis prompt
        combined_text = self._format_agent_outputs(agent_outputs)
        
        # Add custom instructions if provided
        prompt = combined_text
        if synthesis_instructions:
            prompt = f"{synthesis_instructions}\n\n{combined_text}"
        
        try:
            # Import provider client
            from core.provider_clients.openai_client import openai_client as client
            
            # Synthesize
            response = await client.generate(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.synthesis_prompt},
                    {"role": "user", "content": prompt}
                ],
                context={"temperature": self.temperature}
            )
            
            # Extract response
            if isinstance(response, dict):
                synthesized_text = response.get("content", response.get("message", str(response)))
                input_tokens = response.get("input_tokens", response.get("prompt_tokens", 0))
                output_tokens = response.get("output_tokens", response.get("completion_tokens", 0))
            else:
                synthesized_text = str(response)
                input_tokens = 0
                output_tokens = 0
            
            total_tokens = input_tokens + output_tokens
            
            # Calculate cost
            cost_usd = 0.0
            if total_tokens > 0:
                try:
                    from billing.pricing_rules import calculate_token_cost
                    cost_usd = calculate_token_cost(
                        model=self.model,
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        provider=self.provider
                    )
                except Exception as e:
                    logger.warning(f"Cost calculation failed: {e}")
            
            return {
                "status": "success",
                "response": synthesized_text,
                "agent": "composer",
                "model": self.model,
                "provider": self.provider,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "cost_usd": cost_usd,
                "source_agents": [output.get("agent", "unknown") for output in agent_outputs],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            
            # Fallback: Simple concatenation
            return {
                "status": "partial",
                "response": self._simple_concatenation(agent_outputs),
                "error": str(e),
                "agent": "composer",
                "fallback": True
            }
    
    def _format_agent_outputs(self, agent_outputs: List[Dict]) -> str:
        """
        Format agent outputs for synthesis.
        """
        formatted = "# Agent Outputs to Synthesize\n\n"
        
        for i, output in enumerate(agent_outputs, 1):
            agent_name = output.get("agent", f"Agent {i}")
            response = output.get("response", output.get("text", ""))
            
            formatted += f"## {agent_name}\n{response}\n\n"
        
        return formatted
    
    def _simple_concatenation(self, agent_outputs: List[Dict]) -> str:
        """
        Fallback: Simple concatenation without AI synthesis.
        """
        result = "Combined Agent Responses:\n\n"
        
        for output in agent_outputs:
            agent = output.get("agent", "Unknown")
            text = output.get("response", output.get("text", ""))
            result += f"**{agent.upper()}:**\n{text}\n\n"
        
        return result
    
    # =========================================================
    # PROJECT CODE ASSEMBLY
    # =========================================================
    
    async def assemble_project(
        self,
        project_plan: Dict,
        worker_outputs: Dict[str, Dict],
        output_directory: str
    ) -> Dict[str, Any]:
        """
        Assemble complete project from plan and worker outputs.
        
        Args:
            project_plan: Architecture plan from Planner agent
            worker_outputs: Code modules from Worker agents
            output_directory: Target directory for project
        
        Returns:
            Assembly result with file paths
        """
        try:
            os.makedirs(output_directory, exist_ok=True)
            written_files = []
            
            # Extract project metadata
            project_name = project_plan.get("name", "vibeai_project")
            project_type = project_plan.get("type", "generic")
            
            # 1. Create base structure
            base_structure = project_plan.get("structure", {})
            for relative_path, content in base_structure.items():
                file_path = self._write_file(
                    output_directory,
                    relative_path,
                    content
                )
                written_files.append(file_path)
            
            # 2. Write worker-generated modules
            for module_name, module_data in worker_outputs.items():
                module_dir = os.path.join(output_directory, module_name)
                
                for file_name, file_content in module_data.items():
                    file_path = self._write_file(
                        module_dir,
                        file_name,
                        file_content
                    )
                    written_files.append(file_path)
            
            # 3. Generate README
            readme_path = self._generate_readme(
                output_directory,
                project_name,
                project_type,
                project_plan
            )
            written_files.append(readme_path)
            
            # 4. Generate manifest/config files
            config_files = self._generate_config_files(
                output_directory,
                project_type,
                project_plan
            )
            written_files.extend(config_files)
            
            return {
                "status": "success",
                "project_name": project_name,
                "project_type": project_type,
                "output_directory": output_directory,
                "files_written": written_files,
                "file_count": len(written_files),
                "timestamp": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Project assembly failed: {e}")
            
            return {
                "status": "error",
                "error": str(e),
                "output_directory": output_directory
            }
    
    def _write_file(
        self,
        base_directory: str,
        relative_path: str,
        content: str
    ) -> str:
        """
        Write file to project directory.
        """
        file_path = os.path.join(base_directory, relative_path)
        
        # Create directory if needed
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Write file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logger.info(f"Written: {file_path}")
        
        return file_path
    
    def _generate_readme(
        self,
        output_directory: str,
        project_name: str,
        project_type: str,
        project_plan: Dict
    ) -> str:
        """
        Generate README.md for project.
        """
        readme_content = f"""# {project_name}

**Type:** {project_type}

**Generated by:** VibeAI Composer

## Description

{project_plan.get('description', 'A VibeAI-generated project')}

## Structure

This project was automatically generated using VibeAI's multi-agent system:
- **Planner Agent:** Designed the architecture
- **Worker Agents:** Implemented the modules
- **Composer Agent:** Assembled the final project

## Getting Started

{project_plan.get('getting_started', 'See individual module READMEs for setup instructions.')}

## Modules

{self._format_modules_list(project_plan.get('modules', []))}

---

*Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC*
"""
        
        return self._write_file(output_directory, "README.md", readme_content)
    
    def _format_modules_list(self, modules: List) -> str:
        """
        Format modules list for README.
        """
        if not modules:
            return "No modules"
        
        return "\n".join([f"- {module}" for module in modules])
    
    def _generate_config_files(
        self,
        output_directory: str,
        project_type: str,
        project_plan: Dict
    ) -> List[str]:
        """
        Generate project-specific config files.
        """
        config_files = []
        
        # Generate .gitignore
        gitignore_content = self._get_gitignore_template(project_type)
        if gitignore_content:
            config_files.append(
                self._write_file(output_directory, ".gitignore", gitignore_content)
            )
        
        # Generate package.json for Node/React/Next.js projects
        if project_type in ["react", "nextjs", "nodejs"]:
            package_json = self._generate_package_json(project_plan)
            config_files.append(
                self._write_file(output_directory, "package.json", package_json)
            )
        
        # Generate pubspec.yaml for Flutter projects
        if project_type == "flutter":
            pubspec = self._generate_pubspec_yaml(project_plan)
            config_files.append(
                self._write_file(output_directory, "pubspec.yaml", pubspec)
            )
        
        return config_files
    
    def _get_gitignore_template(self, project_type: str) -> Optional[str]:
        """
        Get .gitignore template for project type.
        """
        templates = {
            "python": "*.pyc\n__pycache__/\n.env\nvenv/\n.venv/\n*.egg-info/\ndist/\nbuild/\n",
            "nodejs": "node_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log\n",
            "react": "node_modules/\n.env\nbuild/\n.DS_Store\n",
            "flutter": ".dart_tool/\nbuild/\n.flutter-plugins\n.packages\n.pub/\n",
            "swift": ".build/\nPackages/\n*.xcodeproj\n*.xcworkspace\nDerivedData/\n",
        }
        
        return templates.get(project_type)
    
    def _generate_package_json(self, project_plan: Dict) -> str:
        """
        Generate package.json for Node.js projects.
        """
        package = {
            "name": project_plan.get("name", "vibeai-project"),
            "version": "1.0.0",
            "description": project_plan.get("description", "Generated by VibeAI"),
            "main": "index.js",
            "scripts": {
                "start": "node index.js",
                "dev": "nodemon index.js"
            },
            "dependencies": project_plan.get("dependencies", {}),
            "devDependencies": project_plan.get("devDependencies", {})
        }
        
        return json.dumps(package, indent=2)
    
    def _generate_pubspec_yaml(self, project_plan: Dict) -> str:
        """
        Generate pubspec.yaml for Flutter projects.
        """
        return f"""name: {project_plan.get('name', 'vibeai_app')}
description: {project_plan.get('description', 'A VibeAI-generated Flutter app')}
version: 1.0.0

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
"""


# ============================================================
# GLOBAL INSTANCE
# ============================================================

composer = ProductionComposer()


# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================

async def synthesize_outputs(
    agent_outputs: List[Dict],
    context: Optional[Dict] = None
) -> Dict:
    """
    Synthesize multiple agent outputs.
    """
    return await composer.synthesize_agent_outputs(agent_outputs, context)


async def build_project(
    project_plan: Dict,
    worker_outputs: Dict,
    output_dir: str
) -> Dict:
    """
    Build complete project from plan and outputs.
    """
    return await composer.assemble_project(project_plan, worker_outputs, output_dir)

