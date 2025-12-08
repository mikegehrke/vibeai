# -------------------------------------------------------------
# VIBEAI – CODE EXECUTOR (Multi-Language Execution Engine)
# -------------------------------------------------------------
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from codestudio.languages.csharp_executor import CSharpExecutor
from codestudio.languages.dart_executor import DartExecutor
from codestudio.languages.java_executor import JavaExecutor
from codestudio.languages.javascript_executor import JavaScriptExecutor
from codestudio.languages.kotlin_executor import KotlinExecutor
from codestudio.languages.python_executor import PythonExecutor
from codestudio.languages.react_executor import ReactExecutor
from codestudio.languages.swift_executor import SwiftExecutor
from codestudio.languages.typescript_executor import TypeScriptExecutor
from codestudio.output_cleaner import clean_output
from codestudio.sandbox import Sandbox

logger = logging.getLogger("executor")


class CodeExecutor:
    """
    Multi-Language Code Execution Engine.

    Features:
    - Sandboxed execution
    - Timeout protection
    - Memory limits
    - Output cleaning
    - Error handling
    - Billing integration
    """

    def __init__(self):
        # Language executors
        self.executors = {
            "python": PythonExecutor(),
            "javascript": JavaScriptExecutor(),
            "typescript": TypeScriptExecutor(),
            "react": ReactExecutor(),
            "dart": DartExecutor(),
            "swift": SwiftExecutor(),
            "kotlin": KotlinExecutor(),
            "java": JavaExecutor(),
            "csharp": CSharpExecutor(),
        }

        # Default limits
        self.DEFAULT_TIMEOUT = 30  # seconds
        self.DEFAULT_MEMORY_LIMIT = 512  # MB
        self.MAX_OUTPUT_LENGTH = 100000  # characters

    async def execute(
        self,
        language: str,
        code: str,
        user_email: str,
        project_id: Optional[str] = None,
        stdin: str = "",
        timeout: Optional[int] = None,
        memory_limit: Optional[int] = None,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """
        Execute code in specified language.

        Args:
            language: Programming language
            code: Source code to execute
            user_email: User email for tracking
            project_id: Optional project ID
            stdin: Standard input for program
            timeout: Execution timeout (seconds)
            memory_limit: Memory limit (MB)
            db: Database session for billing

        Returns:
            Execution result with output, errors, metrics
        """
        start_time = datetime.utcnow()

        # Validate language
        if language not in self.executors:
            return {
                "status": "error",
                "error": f"Unsupported language: {language}",
                "supported": list(self.executors.keys()),
            }

        # Get executor
        executor = self.executors[language]

        # Apply limits
        timeout = timeout or self.DEFAULT_TIMEOUT
        memory_limit = memory_limit or self.DEFAULT_MEMORY_LIMIT

        # Create sandbox
        sandbox = Sandbox(timeout=timeout, memory_limit=memory_limit)

        try:
            # Execute in sandbox
            result = await sandbox.execute(executor=executor, code=code, stdin=stdin)

            # Clean output
            if result.get("stdout"):
                result["stdout"] = clean_output(result["stdout"], self.MAX_OUTPUT_LENGTH)

            if result.get("stderr"):
                result["stderr"] = clean_output(result["stderr"], self.MAX_OUTPUT_LENGTH)

            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()

            # Add metadata
            result["language"] = language
            result["execution_time"] = round(execution_time, 3)
            result["user_email"] = user_email
            result["project_id"] = project_id
            result["timestamp"] = datetime.utcnow().isoformat()

            # Log execution
            logger.info(
                f"Executed {language} code for {user_email}: status={result.get('status')}, time={execution_time}s"
            )

            # Save to billing/usage DB
            if db:
                await self._save_execution_record(db, result, code)

            return result

        except asyncio.TimeoutError:
            logger.warning(f"Execution timeout for {user_email}: {language}")

            return {
                "status": "timeout",
                "error": f"Execution exceeded {timeout} second timeout",
                "language": language,
                "execution_time": timeout,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except MemoryError:
            logger.warning(f"Memory limit exceeded for {user_email}: {language}")

            return {
                "status": "memory_error",
                "error": f"Execution exceeded {memory_limit}MB memory limit",
                "language": language,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Execution failed for {user_email}: {e}")

            return {
                "status": "error",
                "error": str(e),
                "language": language,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _save_execution_record(self, db: Session, result: Dict, code: str):
        """
        Save execution record to database for billing/analytics.
        """
        try:
            import uuid

            from billing.models import UsageRecordDB

            usage = UsageRecordDB(
                id=str(uuid.uuid4()),
                user_id=result.get("user_email"),
                feature="code_studio",
                operation="execute",
                provider=result.get("language"),
                model=result.get("language"),
                input_tokens=len(code) // 4,  # Approximate
                output_tokens=len(result.get("stdout", "")) // 4,  # Approximate
                total_tokens=0,
                cost_usd=0.01,  # Fixed cost per execution
                success=result.get("status") == "success",
            )

            db.add(usage)
            db.commit()

        except Exception as e:
            logger.error(f"Failed to save execution record: {e}")


# ============================================================
# GLOBAL INSTANCE
# ============================================================

code_executor = CodeExecutor()

# ============================================================
# CONVENIENCE FUNCTION
# ============================================================


async def execute_code(
    language: str,
    code: str,
    user_email: str,
    project_id: Optional[str] = None,
    stdin: str = "",
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Execute code (convenience function).
    """
    return await code_executor.execute(
        language=language,
        code=code,
        user_email=user_email,
        project_id=project_id,
        stdin=stdin,
        db=db,
    )