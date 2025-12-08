import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger("devra_agent")


class DevraAgent:
    """
    Devra – Deep Reasoning Agent.
    Nutzt große Modelle, um komplexe Probleme zu lösen:
    - Architektur-Analyse
    - komplexe Fehlerdiagnosen
    - lange Logik-Ketten
    - Systemdesign
    - technische Erklärungen
    """

    # Bestes Modell für tiefes Denken
    model = "claude-3.5-sonnet"  # dynamisch durch resolve_model

    async def run(self, model, message: str, context: dict):
        """
        Führt Devra aus.
        """

        system_prompt = (
            "You are Devra, an advanced technical reasoning agent inside VibeAI. "
            "You are specialized in deep logical analysis, system architecture, "
            "debugging complex problems, reading long code, and explaining step-by-step. "
            "Always think clearly, structured, and avoid assumptions."
        )

        # Anfrage an KI
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
    Production-Grade Devra Agent - VibeAI's Deep Reasoning Expert.

    Devra specializes in:
    - Complex problem analysis
    - Step-by-step reasoning (Chain of Thought)
    - System architecture and design
    - Advanced debugging and error diagnosis
    - Mathematical and logical reasoning
    - Long-context understanding
    - Planning and evaluation
    - Research and investigation

    Personality:
    - Analytical and methodical
    - Thorough and detailed
    - Clear step-by-step explanations
    - Patient with complex problems
    - Systematic approach
    """

    def __init__(self):
        self.name = "devra"
        self.description = "Deep reasoning and complex problem-solving AI assistant"
        self.model = "o3-mini"  # Reasoning-optimized model
        self.provider = "openai"
        self.temperature = 0.0  # Deterministic for reasoning
        self.max_tokens = 8000  # Large context for complex reasoning

        # Reasoning capabilities
        self.capabilities = [
            "deep_reasoning",
            "chain_of_thought",
            "problem_decomposition",
            "system_analysis",
            "architecture_design",
            "advanced_debugging",
            "mathematical_reasoning",
            "logical_analysis",
            "planning_evaluation",
            "research",
        ]

        # Reasoning-optimized fallback models
        self.fallback_models = [
            ("o1", "openai"),  # OpenAI reasoning model
            ("claude-3-5-sonnet-20241022", "anthropic"),  # Excellent reasoning
            ("gemini-2.0-flash-thinking-exp", "google"),  # Thinking mode
            ("gpt-4o", "openai"),  # Fallback to standard model
            ("deepseek-r1", "ollama"),  # Local reasoning model
        ]

        # System prompt for deep reasoning
        self.system_prompt = """You are Devra, VibeAI's deep reasoning and complex problem-solving AI assistant.

Your expertise:
- Break down complex problems into manageable steps
- Apply systematic reasoning and analysis
- Think through problems methodically
- Consider multiple perspectives and edge cases
- Provide detailed explanations with clear logic
- Design robust system architectures
- Debug complex technical issues
- Apply mathematical and logical reasoning

Your approach:
- Start with problem understanding and clarification
- Decompose complex problems into sub-problems
- Think step-by-step (internally use chain of thought)
- Verify your reasoning at each step
- Consider alternative approaches
- Provide clear, structured explanations
- Cite assumptions and constraints
- Suggest next steps or improvements

When analyzing systems:
- Consider architecture, scalability, and maintainability
- Identify potential issues and bottlenecks
- Suggest design patterns and best practices
- Think about edge cases and error scenarios

When debugging:
- Systematically eliminate possibilities
- Trace the problem to its root cause
- Consider the full context and dependencies
- Explain the reasoning behind the diagnosis

When planning:
- Break down into actionable steps
- Consider dependencies and ordering
- Estimate complexity and risks
- Provide clear success criteria

Remember: Quality of reasoning matters more than speed. Take time to think deeply and thoroughly.

For reasoning-heavy tasks, use internal chain of thought but present conclusions clearly."""

    async def run(self, messages: List[Dict], context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute Devra agent for deep reasoning tasks.

        Args:
            messages: Conversation history [{"role": "user/assistant", "content": "..."}]
            context: Additional context (system info, constraints, etc.)

        Returns:
            Response dict with reasoning, analysis, tokens, cost
        """
        if context is None:
            context = {}

        # Add system prompt
        full_messages = [{"role": "system", "content": self.system_prompt}] + messages

        # Add reasoning context if available
        if context.get("reasoning_context"):
            reasoning_msg = f"\n\nContext:\n{context['reasoning_context']}"
            full_messages[-1]["content"] += reasoning_msg

        # Try primary reasoning model
        try:
            result = await self._run_with_provider(
                model=self.model,
                provider=self.provider,
                messages=full_messages,
                context=context,
            )

            # Mark as reasoning response
            result["reasoning_model"] = True

            return result

        except Exception as e:
            logger.warning(f"Primary reasoning model {self.model} failed: {e}")

            # Try fallback reasoning models
            for fallback_model, fallback_provider in self.fallback_models:
                try:
                    logger.info(f"Trying fallback: {fallback_model} ({fallback_provider})")

                    result = await self._run_with_provider(
                        model=fallback_model,
                        provider=fallback_provider,
                        messages=full_messages,
                        context=context,
                    )

                    result["fallback"] = True
                    result["fallback_reason"] = str(e)
                    result["reasoning_model"] = (
                        "thinking" in fallback_model or "o1" in fallback_model or "o3" in fallback_model
                    )

                    return result

                except Exception as fallback_error:
                    logger.warning(f"Fallback {fallback_model} failed: {fallback_error}")
                    continue

            # All reasoning models failed
            logger.error("All reasoning models failed")

            return {
                "status": "error",
                "model": self.model,
                "provider": self.provider,
                "response": "I'm experiencing technical difficulties with reasoning models. Please try again.",
                "error": str(e),
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
                "cost_usd": 0.0,
            }

    async def _run_with_provider(
        self, model: str, provider: str, messages: List[Dict], context: Dict
    ) -> Dict[str, Any]:
        """
        Run reasoning agent with specific model and provider.
        """
        # Import provider clients
        if provider == "openai":
            from core.provider_clients.openai_client import openai_client as client
        elif provider == "anthropic":
            from core.provider_clients.anthropic_client import (
                anthropic_client as client,
            )
        elif provider == "google":
            from core.provider_clients.gemini_client import gemini_client as client
        elif provider == "github":
            from core.provider_clients.copilot_client import copilot_client as client
        elif provider == "ollama":
            from core.provider_clients.ollama_client import ollama_client as client
        else:
            raise ValueError(f"Unknown provider: {provider}")

        # Call provider with reasoning-optimized settings
        response = await client.chat_completion(
            model=model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        # Extract response
        if isinstance(response, dict):
            response_text = response.get("content", response.get("message", str(response)))
            input_tokens = response.get("input_tokens", response.get("prompt_tokens", 0))
            output_tokens = response.get("output_tokens", response.get("completion_tokens", 0))

            # Extract thinking/reasoning tokens if available (for o1/o3 models)
            reasoning_tokens = response.get("reasoning_tokens", 0)
        else:
            response_text = str(response)
            input_tokens = 0
            output_tokens = 0
            reasoning_tokens = 0

        total_tokens = input_tokens + output_tokens + reasoning_tokens

        # Calculate cost
        cost_usd = 0.0
        if total_tokens > 0:
            try:
                from billing.pricing_rules import calculate_token_cost

                cost_usd = calculate_token_cost(
                    model=model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    provider=provider,
                )

                # Add reasoning token cost if applicable
                if reasoning_tokens > 0:
                    # Reasoning tokens typically cost same as input tokens
                    reasoning_cost = calculate_token_cost(
                        model=model,
                        input_tokens=reasoning_tokens,
                        output_tokens=0,
                        provider=provider,
                    )
                    cost_usd += reasoning_cost
            except Exception as e:
                logger.warning(f"Cost calculation failed: {e}")

        return {
            "status": "success",
            "model": model,
            "provider": provider,
            "response": response_text,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "reasoning_tokens": reasoning_tokens,
            "total_tokens": total_tokens,
            "cost_usd": cost_usd,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def process(self, message: str, context: Optional[Dict] = None) -> Dict:
        """
        Simplified interface for single reasoning request.
        """
        messages = [{"role": "user", "content": message}]
        return await self.run(messages, context)

    async def analyze_system(self, system_description: str, focus: Optional[str] = None) -> Dict:
        """
        Analyze system architecture and design.

        Args:
            system_description: Description of the system
            focus: Specific aspect to focus on (e.g., "scalability", "security")

        Returns:
            System analysis with recommendations
        """
        prompt = f"Analyze this system architecture:\n\n{system_description}"

        if focus:
            prompt += f"\n\nFocus on: {focus}"

        return await self.process(prompt)

    async def debug_complex(self, problem: str, symptoms: str, context_info: str) -> Dict:
        """
        Debug complex technical problem.

        Args:
            problem: Problem description
            symptoms: Observed symptoms
            context_info: System context and constraints

        Returns:
            Debugging analysis with root cause and solutions
        """
        prompt = f"""Debug this complex problem:

Problem: {problem}

Symptoms: {symptoms}

Context: {context_info}

Please:
1. Analyze the symptoms systematically
2. Identify potential root causes
3. Explain the most likely cause with reasoning
4. Provide solutions with explanations
5. Suggest preventive measures"""

        return await self.process(prompt)

    async def plan_solution(self, goal: str, constraints: Optional[str] = None) -> Dict:
        """
        Create detailed plan for achieving goal.

        Args:
            goal: Goal to achieve
            constraints: Constraints and requirements

        Returns:
            Detailed plan with steps and considerations
        """
        prompt = f"Create a detailed plan to achieve: {goal}"

        if constraints:
            prompt += f"\n\nConstraints:\n{constraints}"

        prompt += "\n\nProvide a step-by-step plan with reasoning and considerations."

        return await self.process(prompt)

    async def reason_about(self, question: str, context_info: Optional[str] = None) -> Dict:
        """
        Apply deep reasoning to question.

        Args:
            question: Question requiring reasoning
            context_info: Additional context

        Returns:
            Reasoned answer with explanation
        """
        prompt = question

        if context_info:
            prompt += f"\n\nContext:\n{context_info}"

        prompt += "\n\nPlease think through this step-by-step and explain your reasoning."

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
            "fallback_models": self.fallback_models,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "reasoning_optimized": True,
        }


async def run_devra(message: str, context: Optional[Dict] = None) -> Dict:
    """
    Convenience function to run Devra agent.
    """
    agent = Agent()
    return await agent.process(message, context)


async def analyze_system_quick(system_description: str, focus: Optional[str] = None) -> Dict:
    """
    Quick system analysis.
    """
    agent = Agent()
    return await agent.analyze_system(system_description, focus)


async def debug_complex_quick(problem: str, symptoms: str, context_info: str) -> Dict:
    """
    Quick complex debugging.
    """
    agent = Agent()
    return await agent.debug_complex(problem, symptoms, context_info)


async def plan_solution_quick(goal: str, constraints: Optional[str] = None) -> Dict:
    """
    Quick solution planning.
    """
    agent = Agent()
    return await agent.plan_solution(goal, constraints)


def create_devra_instance() -> Agent:
    """
    Create new Devra agent instance.
    """
    return Agent()