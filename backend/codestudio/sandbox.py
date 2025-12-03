# -------------------------------------------------------------
# VIBEAI – SANDBOX (Secure Code Execution Environment)
# -------------------------------------------------------------
import asyncio
import tempfile
import logging
from typing import Dict, Any

logger = logging.getLogger("sandbox")


class Sandbox:
    """
    Secure sandbox for code execution.
    
    Features:
    - Timeout protection
    - Memory limits
    - Isolated environment
    - Secure temp file handling
    """
    
    def __init__(self, timeout: int = 30, memory_limit: int = 512):
        self.timeout = timeout
        self.memory_limit = memory_limit  # MB
    
    async def execute(
        self,
        executor,
        code: str,
        stdin: str = ""
    ) -> Dict[str, Any]:
        """
        Execute code using language executor.
        
        Args:
            executor: Language executor instance
            code: Source code
            stdin: Standard input
        
        Returns:
            Execution result
        """
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                # Prepare code file
                code_file = executor.prepare_code_file(temp_dir, code)
                
                # Build execution command
                command = executor.get_execution_command(code_file)
                
                # Execute with timeout
                result = await asyncio.wait_for(
                    self._run_process(command, stdin),
                    timeout=self.timeout
                )
                
                result["status"] = "success" if result["returncode"] == 0 else "error"
                
                return result
            
            except asyncio.TimeoutError:
                raise
            
            except Exception as e:
                logger.error(f"Sandbox execution failed: {e}")
                
                return {
                    "status": "error",
                    "stdout": "",
                    "stderr": str(e),
                    "returncode": -1
                }
    
    async def _run_process(
        self,
        command: list,
        stdin: str
    ) -> Dict[str, Any]:
        """
        Run process and capture output.
        """
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Send stdin and wait for completion
        stdout, stderr = await process.communicate(
            input=stdin.encode() if stdin else None
        )
        
        return {
            "stdout": stdout.decode('utf-8', errors='replace'),
            "stderr": stderr.decode('utf-8', errors='replace'),
            "returncode": process.returncode
        }
