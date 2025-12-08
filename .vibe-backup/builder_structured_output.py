# -------------------------------------------------------------
# VIBEAI – STRUCTURED OUTPUT
# -------------------------------------------------------------
# Erstellt strukturierte JSON-Outputs für Frontend:
# - Projekt-Übersicht
# - Datei-Struktur
# - Build-Status
# - Fehler-Reports
# - Generation-Logs
# -------------------------------------------------------------

import json
from datetime import datetime
from typing import Any, Dict, List


class StructuredOutput:
    """
    Generiert strukturierte JSON-Outputs für Frontend-Kommunikation.
    """

    def create_project_output(
        self,
        project_name: str,
        framework: str,
        files: List[Dict],
        errors: List[Dict] = None,
        warnings: List[Dict] = None,
        metadata: Dict = None,
    ) -> Dict[str, Any]:
        """
        Erstellt strukturierte Projekt-Ausgabe.

        Args:
            project_name: Projektname
            framework: Framework/Plattform
            files: Liste von Datei-Informationen
            errors: Fehler-Liste
            warnings: Warnungen-Liste
            metadata: Zusätzliche Metadaten

        Returns:
            Strukturiertes Dictionary für JSON-Serialisierung
        """
        return {
            "project": {
                "name": project_name,
                "framework": framework,
                "created_at": datetime.now().isoformat(),
                "metadata": metadata or {},
            },
            "files": files,
            "statistics": {
                "total_files": len(files),
                "total_lines": sum(f.get("lines", 0) for f in files),
                "file_types": self._count_file_types(files),
            },
            "quality": {
                "errors": errors or [],
                "warnings": warnings or [],
                "error_count": len(errors) if errors else 0,
                "warning_count": len(warnings) if warnings else 0,
                "has_critical_errors": bool(errors),
            },
            "status": "success" if not errors else "completed_with_errors",
        }

    def create_file_info(
        self,
        path: str,
        content: str,
        language: str,
        size: int = None,
        errors: List[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Erstellt strukturierte Datei-Information.

        Returns:
            {
                "path": str,
                "name": str,
                "language": str,
                "size": int,
                "lines": int,
                "content": str,
                "has_errors": bool,
                "errors": List
            }
        """
        lines = content.count("\n") + 1 if content else 0

        return {
            "path": path,
            "name": path.split("/")[-1],
            "language": language,
            "size": size or len(content.encode("utf-8")),
            "lines": lines,
            "content": content,
            "has_errors": bool(errors),
            "errors": errors or [],
        }

    def create_build_status(
        self,
        status: str,
        progress: float,
        current_step: str,
        steps: List[str],
        logs: List[str] = None,
        errors: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Erstellt Build-Status für Live-Updates.

        Args:
            status: "pending", "building", "success", "failed"
            progress: 0.0 - 1.0
            current_step: Aktueller Schritt
            steps: Alle Schritte
            logs: Build-Logs
            errors: Fehler-Logs

        Returns:
            Status-Dictionary
        """
        return {
            "status": status,
            "progress": progress,
            "current_step": current_step,
            "total_steps": len(steps),
            "completed_steps": int(progress * len(steps)),
            "steps": steps,
            "logs": logs or [],
            "errors": errors or [],
            "timestamp": datetime.now().isoformat(),
        }

    def create_error_report(
        self, errors: List[Dict], file_path: str = None, severity_filter: str = None
    ) -> Dict[str, Any]:
        """
        Erstellt detaillierten Fehler-Report.

        Args:
            errors: Liste von Fehlern
            file_path: Optional Datei-Filter
            severity_filter: "error", "warning", "info"

        Returns:
            Fehler-Report
        """
        filtered_errors = errors

        if file_path:
            filtered_errors = [e for e in filtered_errors if e.get("file") == file_path]

        if severity_filter:
            filtered_errors = [e for e in filtered_errors if e.get("severity") == severity_filter]

        error_count = len([e for e in filtered_errors if e.get("severity") == "error"])
        warning_count = len([e for e in filtered_errors if e.get("severity") == "warning"])
        info_count = len([e for e in filtered_errors if e.get("severity") == "info"])

        return {
            "summary": {
                "total": len(filtered_errors),
                "errors": error_count,
                "warnings": warning_count,
                "info": info_count,
            },
            "details": filtered_errors,
            "grouped_by_file": self._group_errors_by_file(filtered_errors),
            "grouped_by_type": self._group_errors_by_type(filtered_errors),
        }

    def create_generation_log(
        self, action: str, details: str, status: str = "info", data: Dict = None
    ) -> Dict[str, Any]:
        """
        Erstellt Log-Eintrag für Generation-Process.

        Args:
            action: "file_created", "error_detected", "formatted", etc.
            details: Beschreibung
            status: "info", "success", "warning", "error"
            data: Zusätzliche Daten

        Returns:
            Log-Eintrag
        """
        return {
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "status": status,
            "details": details,
            "data": data or {},
        }

    def to_json(self, data: Dict, pretty: bool = True) -> str:
        """Konvertiert Dictionary zu JSON-String."""
        if pretty:
            return json.dumps(data, indent=2, ensure_ascii=False)
        return json.dumps(data, ensure_ascii=False)

    def _count_file_types(self, files: List[Dict]) -> Dict[str, int]:
        """Zählt Dateitypen."""
        type_counts = {}
        for f in files:
            lang = f.get("language", "unknown")
            type_counts[lang] = type_counts.get(lang, 0) + 1
        return type_counts

    def _group_errors_by_file(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """Gruppiert Fehler nach Datei."""
        grouped = {}
        for error in errors:
            file = error.get("file", "unknown")
            if file not in grouped:
                grouped[file] = []
            grouped[file].append(error)
        return grouped

    def _group_errors_by_type(self, errors: List[Dict]) -> Dict[str, List[Dict]]:
        """Gruppiert Fehler nach Typ."""
        grouped = {}
        for error in errors:
            error_type = error.get("type", "unknown")
            if error_type not in grouped:
                grouped[error_type] = []
            grouped[error_type].append(error)
        return grouped


# Globale Instanz
structured_output = StructuredOutput()
