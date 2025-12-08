# -------------------------------------------------------------
# VIBEAI – BUILDER PIPELINE (MASTER ORCHESTRATOR)
# -------------------------------------------------------------
# Orchestriert den kompletten Build-Prozess:
# 1. ProjectTreeGenerator → Struktur
# 2. FileGenerator → Code-Inhalte
# 3. ConfigWriter → Config-Dateien
# 4. ErrorDetector → Fehler finden
# 5. CodeFormatter → Code formatieren
# 6. FileMerger → Bestehende Files mergen
# 7. StructuredOutput → JSON für Frontend
# -------------------------------------------------------------

from typing import Any, Dict, Optional

from builder.code_formatter import code_formatter
from builder.config_writer import config_writer
from builder.error_detector import error_detector
from builder.file_generator import file_generator
from builder.file_merger import file_merger
from builder.project_tree_generator import project_tree_generator
from builder.structured_output import structured_output


class BuilderPipeline:
    """
    Master Orchestrator für den kompletten App-Build-Prozess.
    Nutzt alle Builder-Komponenten für vollautomatische App-Generierung.
    """

    async def build_project(
        self,
        project_name: str,
        project_type: str,
        description: str = "",
        custom_structure: Optional[Dict] = None,
        model: str = "gpt-4o",
    ) -> Dict[str, Any]:
        """
        Baut ein komplettes Projekt von Grund auf.

        Args:
            project_name: Name des Projekts
            project_type: "flutter", "react-native", "nextjs", etc.
            description: Projektbeschreibung
            custom_structure: Optionale benutzerdefinierte Struktur
            model: KI-Modell für Code-Generierung

        Returns:
            Strukturierter Output mit allen generierten Dateien
        """
        logs = []
        all_errors = []
        generated_files = []

        # Kontext für Generierung
        context = {
            "project_name": project_name,
            "description": description,
            "framework": project_type,
        }

        # STEP 1: Projektstruktur generieren
        logs.append(
            structured_output.create_generation_log(
                action="structure_generation",
                details=f"Generating project structure for {project_type}",
                status="info",
            )
        )

        tree = project_tree_generator.generate_tree(
            project_type=project_type,
            project_name=project_name,
            custom_structure=custom_structure,
        )

        # STEP 2: Config-Dateien generieren
        logs.append(
            structured_output.create_generation_log(
                action="config_generation",
                details="Generating configuration files",
                status="info",
            )
        )

        config_files = self._generate_configs(project_name, project_type)

        # STEP 3: Code-Dateien generieren
        logs.append(
            structured_output.create_generation_log(
                action="code_generation",
                details="Generating source code files",
                status="info",
            )
        )

        all_files = project_tree_generator.get_all_files(tree)

        for file_node in all_files:
            # Generiere Inhalt
            content = await file_generator.generate_file_content(
                file_path=file_node.path,
                file_type=file_node.name.split(".")[-1],
                context=context,
                model=model,
            )

            # Formatiere Code
            formatted_content = code_formatter.format_code(content=content, file_path=file_node.path)

            # Fehler-Check
            errors = error_detector.detect_errors(file_path=file_node.path, content=formatted_content)

            if errors:
                all_errors.extend(errors)

            # File Info erstellen
            file_info = structured_output.create_file_info(
                path=file_node.path,
                content=formatted_content,
                language=file_node.name.split(".")[-1],
                errors=errors,
            )

            generated_files.append(file_info)

        # Config-Dateien hinzufügen
        for config_path, config_content in config_files.items():
            file_info = structured_output.create_file_info(
                path=config_path,
                content=config_content,
                language=config_path.split(".")[-1],
            )
            generated_files.append(file_info)

        # STEP 4: Finaler Output
        logs.append(
            structured_output.create_generation_log(
                action="build_complete",
                details=f"Project built successfully with {len(generated_files)} files",
                status="success",
            )
        )

        return structured_output.create_project_output(
            project_name=project_name,
            framework=project_type,
            files=generated_files,
            errors=all_errors,
            metadata={"logs": logs, "model_used": model},
        )

    async def update_file(
        self,
        file_path: str,
        original_content: str,
        updates: str,
        merge_strategy: str = "smart",
    ) -> Dict[str, Any]:
        """
        Aktualisiert eine bestehende Datei.

        Args:
            file_path: Pfad der Datei
            original_content: Aktueller Inhalt
            updates: Neue Änderungen
            merge_strategy: "smart", "overwrite", "append"

        Returns:
            Merge-Result mit neuem Inhalt
        """
        # Merge durchführen
        merge_result = file_merger.merge_files(
            original_content=original_content,
            new_content=updates,
            file_path=file_path,
            strategy=merge_strategy,
        )

        # Formatieren
        formatted = code_formatter.format_code(content=merge_result["merged_content"], file_path=file_path)

        # Fehler-Check
        errors = error_detector.detect_errors(file_path=file_path, content=formatted)

        return {
            "file_path": file_path,
            "content": formatted,
            "changes": merge_result["changes"],
            "conflicts": merge_result["conflicts"],
            "errors": errors,
            "status": "success" if not errors else "completed_with_errors",
        }

    def _generate_configs(self, project_name: str, project_type: str) -> Dict[str, str]:
        """Generiert alle Config-Dateien für Projekttyp."""
        configs = {}

        if project_type == "flutter":
            configs["pubspec.yaml"] = config_writer.generate_pubspec_yaml(project_name=project_name)
            configs[".gitignore"] = config_writer.generate_gitignore("flutter")

        elif project_type == "react-native":
            configs["package.json"] = config_writer.generate_package_json(
                project_name=project_name, framework="react-native"
            )
            configs["tsconfig.json"] = config_writer.generate_tsconfig_json("react-native")
            configs[".gitignore"] = config_writer.generate_gitignore("react-native")

        elif project_type == "nextjs":
            configs["package.json"] = config_writer.generate_package_json(project_name=project_name, framework="nextjs")
            configs["tsconfig.json"] = config_writer.generate_tsconfig_json("nextjs")
            configs[".gitignore"] = config_writer.generate_gitignore("nextjs")

        elif project_type == "nodejs":
            configs["package.json"] = config_writer.generate_package_json(project_name=project_name, framework="nodejs")
            configs[".gitignore"] = config_writer.generate_gitignore("nodejs")

        elif project_type == "fastapi":
            configs["requirements.txt"] = config_writer.generate_requirements_txt(framework="fastapi")
            configs[".gitignore"] = config_writer.generate_gitignore("python")

        return configs


# Globale Instanz
builder_pipeline = BuilderPipeline()