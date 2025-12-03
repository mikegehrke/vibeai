# -------------------------------------------------------------
# VIBEAI – AUTO FIX AGENT (CODE REPAIR) ⭐ BLOCK 18
# -------------------------------------------------------------
"""
AutoFixAgent - AI-powered code repair and optimization

Features:
- Error detection and fixing
- Code refactoring
- Import optimization
- UI improvement suggestions
- Navigation repair
- Warning resolution
- Context-aware code improvements
"""

import os
import re
from typing import Dict, List, Optional, Any
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI()

class AutoFixAgent:
    """
    AI agent for automatic code fixing and optimization
    """

    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
        self.max_tokens = 4000

    async def fix_file(
        self, 
        user: str, 
        project_id: str, 
        file_path: str, 
        content: str,
        issue_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fix a file with AI-powered code repair
        
        Args:
            user: User email
            project_id: Project ID
            file_path: Relative file path
            content: File content to fix
            issue_type: Type of issue (error, warning, improvement)
        
        Returns:
            Dict with fixed content and metadata
        """
        
        # Determine fix strategy based on file type and issue
        fix_strategy = self._get_fix_strategy(file_path, issue_type)
        
        # Generate system prompt
        system_prompt = self._generate_system_prompt(fix_strategy, file_path)
        
        # Call AI to fix code
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Fix this code:\n\n{content}"}
                ],
                max_tokens=self.max_tokens,
                temperature=0.3
            )
            
            fixed_content = response.choices[0].message.content
            
            # Extract code from markdown if present
            fixed_content = self._extract_code(fixed_content)
            
            # Write fixed content to file
            success = await self._write_file(user, project_id, file_path, fixed_content)
            
            return {
                "success": success,
                "fixed": True,
                "file": file_path,
                "original_length": len(content),
                "fixed_length": len(fixed_content),
                "changes_made": self._detect_changes(content, fixed_content),
                "issue_type": issue_type or "general"
            }
            
        except Exception as e:
            return {
                "success": False,
                "fixed": False,
                "file": file_path,
                "error": str(e)
            }

    async def detect_issues(
        self, 
        user: str, 
        project_id: str, 
        file_path: str, 
        content: str
    ) -> Dict[str, Any]:
        """
        Detect issues in code without fixing
        
        Args:
            user: User email
            project_id: Project ID
            file_path: Relative file path
            content: File content to analyze
        
        Returns:
            Dict with detected issues
        """
        
        system_prompt = """
        You are a code analyzer. Detect issues in the code:
        - Syntax errors
        - Import errors
        - Unused variables
        - Type errors
        - Logic errors
        - Performance issues
        - Security vulnerabilities
        
        Return JSON format:
        {
            "issues": [
                {"type": "error|warning|info", "line": 10, "message": "..."}
            ]
        }
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            result = response.choices[0].message.content
            
            # Parse JSON response (simplified)
            import json
            try:
                issues = json.loads(result)
            except:
                issues = {"issues": [{"type": "info", "message": result}]}
            
            return {
                "success": True,
                "file": file_path,
                "issues": issues.get("issues", []),
                "has_errors": any(i.get("type") == "error" for i in issues.get("issues", []))
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def optimize_imports(
        self, 
        user: str, 
        project_id: str, 
        file_path: str, 
        content: str
    ) -> Dict[str, Any]:
        """
        Optimize imports in a file
        
        Args:
            user: User email
            project_id: Project ID
            file_path: Relative file path
            content: File content
        
        Returns:
            Dict with optimized content
        """
        
        system_prompt = """
        You are an import optimizer.
        - Remove unused imports
        - Sort imports alphabetically
        - Group imports (stdlib, third-party, local)
        - Fix import errors
        - Add missing imports
        
        Return ONLY the fixed code, no explanations.
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content}
                ],
                max_tokens=self.max_tokens,
                temperature=0.2
            )
            
            optimized = response.choices[0].message.content
            optimized = self._extract_code(optimized)
            
            success = await self._write_file(user, project_id, file_path, optimized)
            
            return {
                "success": success,
                "file": file_path,
                "imports_optimized": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def refactor_code(
        self, 
        user: str, 
        project_id: str, 
        file_path: str, 
        content: str,
        refactor_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Refactor code with AI suggestions
        
        Args:
            user: User email
            project_id: Project ID
            file_path: Relative file path
            content: File content
            refactor_type: Type of refactoring (general, performance, readability)
        
        Returns:
            Dict with refactored content
        """
        
        refactor_prompts = {
            "general": "Refactor this code to improve quality, readability, and maintainability.",
            "performance": "Optimize this code for better performance and efficiency.",
            "readability": "Improve code readability with better naming and structure.",
            "security": "Fix security vulnerabilities and improve code security."
        }
        
        system_prompt = f"""
        You are a code refactoring expert.
        {refactor_prompts.get(refactor_type, refactor_prompts["general"])}
        
        - Keep functionality identical
        - Improve code structure
        - Add helpful comments where needed
        - Follow best practices
        
        Return ONLY the refactored code.
        """
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content}
                ],
                max_tokens=self.max_tokens,
                temperature=0.4
            )
            
            refactored = response.choices[0].message.content
            refactored = self._extract_code(refactored)
            
            success = await self._write_file(user, project_id, file_path, refactored)
            
            return {
                "success": success,
                "file": file_path,
                "refactored": True,
                "refactor_type": refactor_type
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    # ========================================
    # HELPER METHODS
    # ========================================

    def _get_fix_strategy(self, file_path: str, issue_type: Optional[str]) -> str:
        """Determine fix strategy based on file and issue type"""
        
        ext = os.path.splitext(file_path)[1]
        
        strategies = {
            ".py": "python",
            ".js": "javascript",
            ".jsx": "react",
            ".ts": "typescript",
            ".tsx": "react_typescript",
            ".dart": "flutter",
            ".css": "css",
            ".html": "html"
        }
        
        strategy = strategies.get(ext, "general")
        
        if issue_type:
            strategy = f"{strategy}_{issue_type}"
        
        return strategy

    def _generate_system_prompt(self, strategy: str, file_path: str) -> str:
        """Generate AI system prompt based on strategy"""
        
        base_prompt = """
        You are an expert code repair agent for VibeAI.
        
        Your tasks:
        - Find and fix syntax errors
        - Resolve import issues
        - Fix type errors
        - Optimize code structure
        - Improve code quality
        - Add missing error handling
        - Fix deprecation warnings
        
        IMPORTANT:
        - Return ONLY the fixed code
        - No explanations or markdown
        - Maintain original functionality
        - Keep the same code style
        - Preserve comments
        """
        
        if "python" in strategy:
            base_prompt += "\n- Follow PEP 8 style guide\n- Use type hints where appropriate"
        elif "react" in strategy or "javascript" in strategy:
            base_prompt += "\n- Follow ESLint rules\n- Use modern ES6+ syntax"
        elif "flutter" in strategy or "dart" in strategy:
            base_prompt += "\n- Follow Dart style guide\n- Use null safety"
        
        return base_prompt

    def _extract_code(self, content: str) -> str:
        """Extract code from markdown code blocks"""
        
        # Remove markdown code blocks
        code_block_pattern = r"```[\w]*\n(.*?)\n```"
        matches = re.findall(code_block_pattern, content, re.DOTALL)
        
        if matches:
            return matches[0].strip()
        
        return content.strip()

    def _detect_changes(self, original: str, fixed: str) -> List[str]:
        """Detect what changed between original and fixed"""
        
        changes = []
        
        # Simple change detection
        if len(original.split('\n')) != len(fixed.split('\n')):
            changes.append("line_count_changed")
        
        if "import" in original and "import" in fixed:
            if original.count("import") != fixed.count("import"):
                changes.append("imports_modified")
        
        if "def " in original and "def " in fixed:
            if original.count("def ") != fixed.count("def "):
                changes.append("functions_modified")
        
        if not changes:
            changes.append("code_improved")
        
        return changes

    async def _write_file(
        self, 
        user: str, 
        project_id: str, 
        file_path: str, 
        content: str
    ) -> bool:
        """Write content to file"""
        
        try:
            # Get project path
            from projects import get_project_path
            project_path = get_project_path(user, project_id)
            
            # Build absolute file path
            abs_file = os.path.join(project_path, file_path)
            
            # Create directory if needed
            os.makedirs(os.path.dirname(abs_file), exist_ok=True)
            
            # Write file
            with open(abs_file, "w", encoding="utf-8") as f:
                f.write(content)
            
            print(f"✅ Auto-fixed: {file_path}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to write file {file_path}: {e}")
            return False


# Singleton instance
autofix_agent = AutoFixAgent()
