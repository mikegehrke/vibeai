# ❗ Die Datei ist komplett leer
#
# Genau wie bei Aura — nur ein Platzhalter.
#
# 📝 ANALYSE (technisch)
#
# Die leere Datei bedeutet:
#
# 👉 Du hast die Struktur vorbereitet
# 👉 Aber Cora hat keine Logik
# 👉 Kein Modell
# 👉 Kein Prompt
# 👉 Kein Agent-System Hook
# 👉 Keine Tools
# 👉 Kein Pipeline-Support
# 👉 Keine Antwort-Logik
# 👉 Keine Token-Auswertung
#
# Da du ein riesiges 280-Module-System hast, ist Cora technisch ein wichtiger Spezial-Agent.
#
# Typisch:
#     • Aura = General Assistant
#     • Cora = Coding Agent / Developer Agent
#     • Devra = technische Problemlöserin
#     • Lumi = kreative Agentin


# -------------------------------------------------------------
# VIBEAI – CORA (ADVANCED CODING & DEBUGGING AGENT)
# -------------------------------------------------------------
from core.model_registry_v2 import resolve_model


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
    model = "gpt-4o"   # dynamisch durch resolve_model()

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
                {"role": "user", "content": message}
            ],
            context=context
        )

        return {
            "message": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown")
        }


# ============================================================
# ⭐ VIBEAI – CORA AGENT (PRODUCTION VERSION)
# ============================================================
# ✔ Advanced Coding & Debugging AI
# ✔ Multi-Language Support (Python/JS/TS/Swift/Kotlin/Dart/C#/Rust/Go)
# ✔ Code Analysis & Refactoring
# ✔ Bug Detection & Fixing
# ✔ Code Explanation & Documentation
# ✔ Best Practices Enforcement
# ✔ Multi-Provider Support (GPT-4o/Claude/Gemini/Copilot/Ollama)
# ✔ Intelligent Fallback System
# ✔ Code Studio Integration Ready
# ✔ Token & Cost Tracking
# ============================================================

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger("cora_agent")


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
            "multi_language"
        ]
        
        # Supported languages
        self.supported_languages = [
            "python", "javascript", "typescript", "java", "c++", "c#",
            "swift", "kotlin", "dart", "rust", "go", "ruby", "php",
            "sql", "html", "css", "bash", "powershell"
        ]
        
        # Fallback models (coding-optimized)
        self.fallback_models = [
            ("claude-3-5-sonnet-20241022", "anthropic"),  # Excellent at code
            ("gpt-4o", "github"),  # Copilot
            ("gemini-2.0-flash-exp", "google"),
            ("deepseek-coder", "ollama")  # Local code model
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
    
    async def run(
        self,
        messages: List[Dict],
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
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
        full_messages = [
            {"role": "system", "content": self.system_prompt}
        ] + messages
        
        # Add code context if available
        if context.get("code_context"):
            code_context_msg = f"\n\nCode Context:\n```\n{context['code_context']}\n```"
            full_messages[-1]["content"] += code_context_msg
        
        # Try primary model
        try:
            result = await self._run_with_provider(
                model=self.model,
                provider=self.provider,
                messages=full_messages,
                context=context
            )
            
            # Detect code blocks in response
            result["has_code"] = "```" in result.get("response", "")
            
            return result
        
        except Exception as e:
            logger.warning(f"Primary model {self.model} failed: {e}")
            
            # Try fallback models
            for fallback_model, fallback_provider in self.fallback_models:
                try:
                    logger.info(f"Trying fallback: {fallback_model} ({fallback_provider})")
                    
                    result = await self._run_with_provider(
                        model=fallback_model,
                        provider=fallback_provider,
                        messages=full_messages,
                        context=context
                    )
                    
                    result["fallback"] = True
                    result["fallback_reason"] = str(e)
                    result["has_code"] = "```" in result.get("response", "")
                    
                    return result
                
                except Exception as fallback_error:
                    logger.warning(f"Fallback {fallback_model} failed: {fallback_error}")
                    continue
            
            # All models failed
            logger.error("All coding models failed")
            
            return {
                "status": "error",
                "model": self.model,
                "provider": self.provider,
                "response": "I'm experiencing technical difficulties analyzing your code. Please try again.",
                "error": str(e),
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "cost_usd": 0.0
            }
    
    async def _run_with_provider(
        self,
        model: str,
        provider: str,
        messages: List[Dict],
        context: Dict
    ) -> Dict[str, Any]:
        """
        Run coding agent with specific model and provider.
        """
        # Import provider clients
        if provider == "openai":
            from core.provider_clients.openai_client import openai_client as client
        elif provider == "anthropic":
            from core.provider_clients.anthropic_client import anthropic_client as client
        elif provider == "google":
            from core.provider_clients.gemini_client import gemini_client as client
        elif provider == "github":
            from core.provider_clients.copilot_client import copilot_client as client
        elif provider == "ollama":
            from core.provider_clients.ollama_client import ollama_client as client
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        # Call provider with coding-optimized settings
        response = await client.chat_completion(
            model=model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens
        )
        
        # Extract response
        if isinstance(response, dict):
            response_text = response.get("content", response.get("message", str(response)))
            input_tokens = response.get("input_tokens", response.get("prompt_tokens", 0))
            output_tokens = response.get("output_tokens", response.get("completion_tokens", 0))
        else:
            response_text = str(response)
            input_tokens = 0
            output_tokens = 0
        
        total_tokens = input_tokens + output_tokens
        
        # Calculate cost
        cost_usd = 0.0
        if total_tokens > 0:
            try:
                from billing.pricing_rules import calculate_token_cost
                cost_usd = calculate_token_cost(
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    provider=provider
                )
            except Exception as e:
                logger.warning(f"Cost calculation failed: {e}")
        
        return {
            "status": "success",
            "model": model,
            "provider": provider,
            "response": response_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "cost_usd": cost_usd,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def process(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Simplified interface for single coding request.
        """
        messages = [{"role": "user", "content": message}]
        return await self.run(messages, context)
    
    async def analyze_code(self, code: str, language: Optional[str] = None) -> Dict:
        """
        Analyze code for issues, improvements, and best practices.
        
        Args:
            code: Code to analyze
            language: Programming language (optional, auto-detected)
        
        Returns:
            Analysis with suggestions
        """
        prompt = f"Analyze this code and suggest improvements:\n\n```{language or ''}\n{code}\n```"
        return await self.process(prompt)
    
    async def fix_bug(self, code: str, error: str, language: Optional[str] = None) -> Dict:
        """
        Debug code and provide fix.
        
        Args:
            code: Code with bug
            error: Error message
            language: Programming language
        
        Returns:
            Fix with explanation
        """
        prompt = f"""Debug this code:

Error: {error}

Code:
```{language or ''}
{code}
```

Please identify the issue and provide the corrected code."""
        
        return await self.process(prompt)
    
    async def refactor_code(self, code: str, goal: str, language: Optional[str] = None) -> Dict:
        """
        Refactor code for specific goal.
        
        Args:
            code: Code to refactor
            goal: Refactoring goal (e.g., "improve performance", "add error handling")
            language: Programming language
        
        Returns:
            Refactored code with explanation
        """
        prompt = f"""Refactor this code to: {goal}

```{language or ''}
{code}
```

Provide the refactored version with explanations."""
        
        return await self.process(prompt)
    
    def get_info(self) -> Dict:
        """
        Get agent information and capabilities.
        """
        return {
            "name": self.name,
            "description": self.description,
            "model": self.model,
            "provider": self.provider,
            "capabilities": self.capabilities,
            "supported_languages": self.supported_languages,
            "fallback_models": self.fallback_models,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }


# ============================================================
# HELPER FUNCTIONS
# ============================================================

async def run_cora(message: str, context: Optional[Dict] = None) -> Dict:
    """
    Convenience function to run Cora agent.
    """
    agent = Agent()
    return await agent.process(message, context)


async def analyze_code_quick(code: str, language: Optional[str] = None) -> Dict:
    """
    Quick code analysis.
    """
    agent = Agent()
    return await agent.analyze_code(code, language)


async def fix_bug_quick(code: str, error: str, language: Optional[str] = None) -> Dict:
    """
    Quick bug fix.
    """
    agent = Agent()
    return await agent.fix_bug(code, error, language)


def create_cora_instance() -> Agent:
    """
    Create new Cora agent instance.
    """
    return Agent()

