# -------------------------------------------------------------
# VIBEAI – KOTLIN EXECUTOR
# -------------------------------------------------------------
import os
import subprocess


class KotlinExecutor:
    """
    Führt Kotlin-Code aus (mit JAR-Kompilierung).

    - Schreibt Code in .kt Datei
    - Kompiliert zu JAR mit kotlinc
    - Führt JAR mit java -jar aus
    """

    def prepare_code_file(self, temp_dir: str, code: str) -> str:
        """
        Schreibt Kotlin-Code in temporäre Datei.
        """
        code_file = os.path.join(temp_dir, "main.kt")

        with open(code_file, "w", encoding="utf-8") as f:
            f.write(code)

        return code_file

    def get_execution_command(self, code_file: str) -> list:
        """
        Kompiliert Kotlin zu JAR und gibt Ausführungs-Kommando zurück.

        Schritt 1: kotlinc kompiliert .kt zu output.jar
        Schritt 2: Rückgabe = ["java", "-jar", "/tmp/output.jar"]
        """
        # Get directory and output JAR path
        code_dir = os.path.dirname(code_file)
        jar_file = os.path.join(code_dir, "output.jar")

        # Compile Kotlin to JAR
        compile_result = subprocess.run(
            ["kotlinc", code_file, "-include-runtime", "-d", jar_file],
            capture_output=True,
            text=True,
            check=False,
        )

        if compile_result.returncode != 0:
            error_msg = f"Kotlin compilation failed: {compile_result.stderr}"
            raise RuntimeError(error_msg)

        # Run compiled JAR
        return ["java", "-jar", jar_file]