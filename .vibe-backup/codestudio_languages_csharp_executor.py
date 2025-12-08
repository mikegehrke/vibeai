# -------------------------------------------------------------
# VIBEAI – C# EXECUTOR
# -------------------------------------------------------------
import os


class CSharpExecutor:
    """
    Führt C#-Code mit .NET aus.

    - Schreibt Code in .cs Datei
    - Nutzt 'dotnet script' für direkte Ausführung
    - Wraps Code in Program-Klasse falls nötig
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt C#-Code in temporäre Datei.
        Fügt Program-Struktur hinzu falls fehlend.
        """
        code_file = os.path.join(temp_dir, "Program.cs")

        # Wrap in basic program structure if needed
        if "namespace " not in code and "class " not in code:
            code = f"""
using System;

class Program {{
    static void Main() {{
        {code}
    }}
}}
"""

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Gibt .NET-Script-Ausführungs-Kommando zurück.

        Rückgabe: ["dotnet", "script", "/tmp/Program.cs"]
        """
        return ["dotnet", "script", code_file]
