import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger("cora_agent")


class CoraAgent:
    """
    Cora – Coding Agent:
    - spezialisiert auf Programmierung
    - Debugging, Fehleranalyse
    - Code-Erklärungen
    - Refactoring
    - Multi-Provider (GPT / Claude / Gemini / Copilot / Ollama)
    """

    # Bestes Modell für Coding
    model = "gpt-4o"  # dynamisch durch resolve_model()

    async def run(self, model, message: str, context: dict):
        """
        Führt Cora aus (Developer-Modus).
        """

        system_prompt = (
            "You are Cora, an advanced coding and debugging agent in VibeAI. "
            "You write high-quality code, explain logic clearly, and debug errors. "
            "Follow best programming practices. "
            "If the user posts an error, analyze it. "
            "Always respond with clean, correct, production-ready code."
        )

        result = await model.run(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            context=context,
        )

        return {
            "message": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown"),
        }


class Agent:
    """
    Production-Grade Cora Agent - VibeAI's Coding Expert.

    Cora specializes in:
    - Code analysis and review
    - Debugging and error fixing
    - Code refactoring and optimization
    - Explaining complex code
    - Writing production-ready code
    - Multi-language support
    - Best practices enforcement

    Personality:
    - Technical and precise
    - Clear explanations
    - Production-quality standards
    - Helpful with debugging
    - Suggests improvements
    """

    def __init__(self):
        self.name = "cora"
        self.description = "Advanced coding and debugging AI assistant"
        self.model = "gpt-4o"  # GPT-4o excels at coding
        self.provider = "openai"
        self.temperature = 0.2  # Lower temperature for precise code
        self.max_tokens = 4000  # Larger for code responses

        # Coding capabilities
        self.capabilities = [
            "code_writing",
            "debugging",
            "code_review",
            "refactoring",
            "optimization",
            "code_explanation",
            "error_analysis",
            "best_practices",
            "multi_language",
        ]

        # Supported languages
        self.supported_languages = [
            "python",
            "javascript",
            "typescript",
            "java",
            "c++",
            "c#",
            "swift",
            "kotlin",
            "dart",
            "rust",
            "go",
            "ruby",
            "php",
            "sql",
            "html",
            "css",
            "bash",
            "powershell",
        ]

        # Fallback models (coding-optimized)
        self.fallback_models = [
            ("claude-3-5-sonnet-20241022", "anthropic"),  # Excellent at code
            ("gpt-4o", "github"),  # Copilot
            ("gemini-2.0-flash-exp", "google"),
            ("deepseek-coder", "ollama"),  # Local code model
        ]

        # System prompt for coding expertise
        self.system_prompt = """You are Cora, VibeAI's expert coding and debugging AI assistant.

Your expertise:
- Write clean, efficient, production-ready code
- Debug errors with detailed analysis
- Refactor code following best practices
- Explain complex code clearly
- Support multiple programming languages
- Enforce coding standards and patterns
- Suggest optimizations and improvements

Your approach:
- Always provide complete, working code (no pseudocode unless requested)
- Include comments for complex logic
- Follow language-specific conventions and idioms
- Consider edge cases and error handling
- Suggest tests when appropriate
- Explain your reasoning for technical decisions

When debugging:
- Analyze the error message thoroughly
- Identify the root cause, not just symptoms
- Provide the fix with explanation
- Suggest preventive measures

When reviewing code:
- Point out potential bugs or issues
- Suggest improvements for readability and performance
- Recommend best practices
- Be constructive and educational

Languages you excel at: Python, JavaScript, TypeScript, Swift, Kotlin, Dart, Java, C++, C#, Rust, Go, and more.

Remember: Code quality matters. Always strive for clarity, correctness, and maintainability."""

    async def run(self, messages: List[Dict], context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute Cora agent for coding tasks.

        Args:
            messages: Conversation history [{"role": "user/assistant", "content": "..."}]
            context: Additional context (code files, error logs, etc.)

        Returns:
            Response dict with code, explanation, tokens, cost
        """
        if context is None:
            context = {}

        # Add system prompt
        full_messages = [{"role": "system", "content": self.system_prompt}] + messages

        # Add code context if available
        if context.get("code_context"):
            code_context_msg = f"\n\nCode Context:\n{context['code_context']}"
            full_messages[0]["content"] += code_context_msg