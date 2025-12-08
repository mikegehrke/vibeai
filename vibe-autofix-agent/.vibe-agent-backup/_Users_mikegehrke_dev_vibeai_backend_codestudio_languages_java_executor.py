# -------------------------------------------------------------
# VIBEAI – JAVA EXECUTOR
# -------------------------------------------------------------
import os
import re
import subprocess


class JavaExecutor:
    """
    Führt Java-Code aus (mit Kompilierung).

    - Extrahiert Klassennamen aus Code
    - Kompiliert mit javac
    - Führt mit java aus
    - Wraps Code in Main-Klasse falls nötig
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt Java-Code in temporäre Datei.
        Extrahiert Klassennamen oder nutzt 'Main'.
        """
        # Extract class name from code
        class_match = re.search(r"public\s+class\s+(\w+)", code)

        if class_match:
            class_name = class_match.group(1)
        else:
            class_name = "Main"
            # Wrap code in Main class if not present
            if "class " not in code:
                code = f"public class Main {{\n{code}\n}}"

        code_file = os.path.join(temp_dir, f"{class_name}.java")

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Kompiliert Java-Code und gibt Ausführungs-Kommando zurück.

        Schritt 1: javac kompiliert .java zu .class
        Schritt 2: Rückgabe = ["java", "-cp", "/tmp", "Main"]
        """
        # Compile Java file
        compile_result = subprocess.run(["javac", code_file], capture_output=True, text=True, check=False)

        if compile_result.returncode != 0:
            error_msg = f"Java compilation failed: {compile_result.stderr}"
            raise RuntimeError(error_msg)

        # Extract class name and directory
        class_name = os.path.splitext(os.path.basename(code_file))[0]
        class_dir = os.path.dirname(code_file)

        # Run compiled class
        return ["java", "-cp", class_dir, class_name]
