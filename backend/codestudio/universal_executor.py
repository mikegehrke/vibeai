"""
Code Studio - Universal Language Executor
Führt Code in 40+ Sprachen aus
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any

from ALLE_SPRACHEN import get_executor, get_language_by_extension


class UniversalExecutor:
    """Führt Code in allen unterstützten Sprachen aus"""
    
    # Sprach-spezifische Konfigurationen
    EXECUTORS = {
        # WEB & SCRIPTING
        "JavaScript": {"cmd": "node", "ext": ".js"},
        "TypeScript": {"cmd": "ts-node", "ext": ".ts"},
        "Python": {"cmd": "python3", "ext": ".py"},
        
        # COMPILED LANGUAGES
        "Go": {"cmd": "go run", "ext": ".go"},
        "Rust": {"cmd": "rustc", "ext": ".rs", "compile_run": True},
        "C": {"cmd": "gcc", "ext": ".c", "compile_run": True},
        "C++": {"cmd": "g++", "ext": ".cpp", "compile_run": True},
        
        # MOBILE
        "Swift": {"cmd": "swift", "ext": ".swift"},
        "Kotlin": {"cmd": "kotlinc", "ext": ".kt", "compile_run": True},
        "Dart": {"cmd": "dart", "ext": ".dart"},
        
        # JVM
        "Java": {"cmd": "javac", "ext": ".java", "compile_run": True},
        "Scala": {"cmd": "scala", "ext": ".scala"},
        
        # .NET
        "C#": {"cmd": "dotnet", "ext": ".cs", "needs_project": True},
        "F#": {"cmd": "dotnet", "ext": ".fs", "needs_project": True},
        
        # FUNCTIONAL
        "Haskell": {"cmd": "ghc", "ext": ".hs", "compile_run": True},
        "Elixir": {"cmd": "elixir", "ext": ".ex"},
        
        # SCRIPTING
        "Bash": {"cmd": "bash", "ext": ".sh"},
        "PowerShell": {"cmd": "pwsh", "ext": ".ps1"},
        "Perl": {"cmd": "perl", "ext": ".pl"},
        "Lua": {"cmd": "lua", "ext": ".lua"},
        "Ruby": {"cmd": "ruby", "ext": ".rb"},
        "PHP": {"cmd": "php", "ext": ".php"},
        
        # DATA SCIENCE
        "R": {"cmd": "Rscript", "ext": ".r"},
        "Julia": {"cmd": "julia", "ext": ".jl"},
    }
    
    async def execute(self, language: str, code: str, stdin: str = "") -> Dict[str, Any]:
        """
        Führt Code aus
        
        Args:
            language: Programmiersprache
            code: Source Code
            stdin: Standard Input
            
        Returns:
            {"success": bool, "output": str, "error": str, "execution_time": float}
        """
        
        if language not in self.EXECUTORS:
            return {
                "success": False,
                "output": "",
                "error": f"Sprache '{language}' nicht unterstützt. Verfügbar: {', '.join(self.EXECUTORS.keys())}"
            }
        
        config = self.EXECUTORS[language]
        
        try:
            # Compile & Run Languages
            if config.get("compile_run"):
                return await self._compile_and_run(language, code, config, stdin)
            
            # Interpreted Languages
            else:
                return await self._run_interpreted(language, code, config, stdin)
                
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Execution error: {str(e)}"
            }
    
    async def _run_interpreted(self, language: str, code: str, config: Dict, stdin: str) -> Dict:
        """Führt interpreted language aus"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix=config["ext"], delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            cmd = [config["cmd"], temp_file]
            
            result = subprocess.run(
                cmd,
                input=stdin,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr,
                "language": language
            }
        finally:
            os.unlink(temp_file)
    
    async def _compile_and_run(self, language: str, code: str, config: Dict, stdin: str) -> Dict:
        """Kompiliert und führt aus"""
        
        with tempfile.TemporaryDirectory() as tmpdir:
            source_file = Path(tmpdir) / f"main{config['ext']}"
            output_file = Path(tmpdir) / "output"
            
            source_file.write_text(code)
            
            # Compile
            if language in ["C", "C++"]:
                compile_cmd = [config["cmd"], str(source_file), "-o", str(output_file)]
            elif language == "Java":
                compile_cmd = ["javac", str(source_file)]
                output_file = Path(tmpdir) / "Main"
            elif language == "Rust":
                compile_cmd = ["rustc", str(source_file), "-o", str(output_file)]
            elif language == "Haskell":
                compile_cmd = ["ghc", str(source_file), "-o", str(output_file)]
            elif language == "Kotlin":
                compile_cmd = ["kotlinc", str(source_file), "-include-runtime", "-d", f"{output_file}.jar"]
            else:
                return {"success": False, "output": "", "error": f"Unknown compile config for {language}"}
            
            # Compile Step
            compile_result = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if compile_result.returncode != 0:
                return {
                    "success": False,
                    "output": "",
                    "error": f"Compilation failed:\n{compile_result.stderr}",
                    "language": language
                }
            
            # Run
            if language == "Java":
                run_cmd = ["java", "-cp", tmpdir, "Main"]
            elif language == "Kotlin":
                run_cmd = ["java", "-jar", f"{output_file}.jar"]
            else:
                run_cmd = [str(output_file)]
            
            run_result = subprocess.run(
                run_cmd,
                input=stdin,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return {
                "success": run_result.returncode == 0,
                "output": run_result.stdout,
                "error": run_result.stderr,
                "language": language
            }


# Global instance
universal_executor = UniversalExecutor()
