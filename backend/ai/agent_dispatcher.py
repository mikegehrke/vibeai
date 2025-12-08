#!/usr/bin/env python3
"""
⭐ BLOCK C — MULTI-AGENT DISPATCHER
Each agent automatically gets its best model
"""

from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from ai.model_selector import OptimizationStrategy, SelectionCriteria, model_selector
from ai.pricing.pricing_table import ModelCapability


class AgentType(Enum):
    """Specialized agent types"""

    LEAD_DEVELOPER = "lead_developer"
    CODE_REVIEWER = "code_reviewer"
    UI_UX_DESIGNER = "ui_ux_designer"
    PERFORMANCE_OPTIMIZER = "performance_optimizer"
    DATABASE_ARCHITECT = "database_architect"
    TEST_ENGINEER = "test_engineer"
    ERROR_FIXER = "error_fixer"
    BUILD_ENGINEER = "build_engineer"


@dataclass
class AgentConfig:
    """Agent configuration"""

    agent_type: AgentType
    min_quality: int
    max_cost_per_1k: float
    preferred_strategy: OptimizationStrategy
    required_capabilities: List[ModelCapability]
    description: str


class AgentDispatcher:
    """Multi-agent dispatch engine with automatic model selection"""

    def __init__(self):
        self.model_selector = model_selector
        self.agent_configs = self._init_agent_configs()
        self.task_history = []

    def _init_agent_configs(self) -> Dict[AgentType, AgentConfig]:
        """Initialize agent configurations"""

        return {
            AgentType.LEAD_DEVELOPER: AgentConfig(
                agent_type=AgentType.LEAD_DEVELOPER,
                min_quality=9,
                max_cost_per_1k=0.015,
                preferred_strategy=OptimizationStrategy.BEST_QUALITY,
                required_capabilities=[ModelCapability.CODE, ModelCapability.TEXT],
                description="Senior architect for complex development tasks",
            ),
            AgentType.CODE_REVIEWER: AgentConfig(
                agent_type=AgentType.CODE_REVIEWER,
                min_quality=8,
                max_cost_per_1k=0.01,
                preferred_strategy=OptimizationStrategy.BALANCED,
                required_capabilities=[ModelCapability.CODE],
                description="Code quality and best practices reviewer",
            ),
            AgentType.UI_UX_DESIGNER: AgentConfig(
                agent_type=AgentType.UI_UX_DESIGNER,
                min_quality=8,
                max_cost_per_1k=0.01,
                preferred_strategy=OptimizationStrategy.BALANCED,
                required_capabilities=[ModelCapability.CODE, ModelCapability.VISION],
                description="UI/UX design and implementation",
            ),
            AgentType.PERFORMANCE_OPTIMIZER: AgentConfig(
                agent_type=AgentType.PERFORMANCE_OPTIMIZER,
                min_quality=8,
                max_cost_per_1k=0.008,
                preferred_strategy=OptimizationStrategy.COST_PERFORMANCE,
                required_capabilities=[ModelCapability.CODE],
                description="Performance analysis and optimization",
            ),
            AgentType.DATABASE_ARCHITECT: AgentConfig(
                agent_type=AgentType.DATABASE_ARCHITECT,
                min_quality=8,
                max_cost_per_1k=0.01,
                preferred_strategy=OptimizationStrategy.BALANCED,
                required_capabilities=[ModelCapability.CODE],
                description="Database design and query optimization",
            ),
            AgentType.TEST_ENGINEER: AgentConfig(
                agent_type=AgentType.TEST_ENGINEER,
                min_quality=7,
                max_cost_per_1k=0.005,
                preferred_strategy=OptimizationStrategy.CHEAPEST,
                required_capabilities=[ModelCapability.CODE],
                description="Test generation and quality assurance",
            ),
            AgentType.ERROR_FIXER: AgentConfig(
                agent_type=AgentType.ERROR_FIXER,
                min_quality=8,
                max_cost_per_1k=0.008,
                preferred_strategy=OptimizationStrategy.FASTEST,
                required_capabilities=[ModelCapability.CODE],
                description="Bug detection and fixing",
            ),
            AgentType.BUILD_ENGINEER: AgentConfig(
                agent_type=AgentType.BUILD_ENGINEER,
                min_quality=7,
                max_cost_per_1k=0.005,
                preferred_strategy=OptimizationStrategy.COST_PERFORMANCE,
                required_capabilities=[ModelCapability.CODE, ModelCapability.TEXT],
                description="Build configuration and deployment",
            ),
        }

    def dispatch(
        self,
        agent_type: AgentType,
        task: str,
        *,
        max_cost: Optional[float] = None,
        quality: Optional[int] = None,
        speed: bool = False,
    ) -> Dict[str, Any]:
        """
        Dispatch task to agent with automatic model selection

        Args:
            agent_type: Type of agent to use
            task: Task description
            max_cost: Optional override for max cost per 1K tokens
            quality: Optional override for min quality
            speed: Whether to prioritize speed

        Returns:
            Dict with model_used and result
        """

        # Get agent config
        config = self.agent_configs.get(agent_type)
        if not config:
            raise ValueError(f"Unknown agent type: {agent_type}")

        # Build selection criteria
        criteria = SelectionCriteria(
            strategy=(OptimizationStrategy.FASTEST if speed else config.preferred_strategy),
            min_quality=quality if quality is not None else config.min_quality,
            max_price_per_1k=(max_cost if max_cost is not None else config.max_cost_per_1k),
            required_capabilities=config.required_capabilities,
        )

        # Select best model
        model = self.model_selector.select_model(criteria)

        # Store in history
        self.task_history.append(
            {
                "agent_type": agent_type.value,
                "model_used": model,
                "task": task[:100] + "..." if len(task) > 100 else task,
            }
        )

        return {
            "agent_type": agent_type.value,
            "agent_description": config.description,
            "model_used": model,
            "task": task,
            "criteria": {
                "min_quality": criteria.min_quality,
                "max_cost_per_1k": criteria.max_price_per_1k,
                "strategy": criteria.strategy.value,
            },
        }

    def dispatch_team(
        self, tasks: List[Dict[str, Any]], *, max_total_cost: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Dispatch multiple tasks to team of agents

        Args:
            tasks: List of dicts with 'agent_type' and 'task' keys
            max_total_cost: Optional max total cost for all tasks

        Returns:
            List of results
        """

        results = []

        for task_info in tasks:
            agent_type = task_info.get("agent_type")
            task = task_info.get("task")

            if not agent_type or not task:
                continue

            result = self.dispatch(
                agent_type=agent_type,
                task=task,
                max_cost=task_info.get("max_cost"),
                quality=task_info.get("quality"),
                speed=task_info.get("speed", False),
            )

            results.append(result)

        return results

    def get_recommended_agent(self, task_description: str) -> AgentType:
        """Recommend agent based on task description"""

        task_lower = task_description.lower()

        if any(word in task_lower for word in ["architect", "design", "plan", "complex"]):
            return AgentType.LEAD_DEVELOPER

        elif any(word in task_lower for word in ["review", "refactor", "improve", "clean"]):
            return AgentType.CODE_REVIEWER

        elif any(word in task_lower for word in ["ui", "ux", "design", "interface", "component"]):
            return AgentType.UI_UX_DESIGNER

        elif any(word in task_lower for word in ["performance", "optimize", "speed", "slow"]):
            return AgentType.PERFORMANCE_OPTIMIZER

        elif any(word in task_lower for word in ["database", "sql", "query", "schema"]):
            return AgentType.DATABASE_ARCHITECT

        elif any(word in task_lower for word in ["test", "testing", "coverage", "qa"]):
            return AgentType.TEST_ENGINEER

        elif any(word in task_lower for word in ["error", "bug", "fix", "debug"]):
            return AgentType.ERROR_FIXER

        elif any(word in task_lower for word in ["build", "deploy", "ci", "cd", "pipeline"]):
            return AgentType.BUILD_ENGINEER

        else:
            return AgentType.LEAD_DEVELOPER  # Default

    def get_agent_info(self, agent_type: AgentType) -> Dict[str, Any]:
        """Get agent configuration info"""

        config = self.agent_configs.get(agent_type)
        if not config:
            return {}

        # Select model for this agent
        criteria = SelectionCriteria(
            strategy=config.preferred_strategy,
            min_quality=config.min_quality,
            max_price_per_1k=config.max_cost_per_1k,
            required_capabilities=config.required_capabilities,
        )

        model = self.model_selector.select_model(criteria)

        return {
            "agent_type": agent_type.value,
            "description": config.description,
            "min_quality": config.min_quality,
            "max_cost_per_1k": config.max_cost_per_1k,
            "strategy": config.preferred_strategy.value,
            "capabilities": [c.value for c in config.required_capabilities],
            "recommended_model": model,
        }

    def get_all_agents_info(self) -> Dict[str, Any]:
        """Get info for all agents"""

        return {agent_type.value: self.get_agent_info(agent_type) for agent_type in AgentType}

    def get_task_history(self, limit: Optional[int] = None) -> List[Dict]:
        """Get task history"""

        if limit:
            return self.task_history[-limit:]
        return self.task_history


# Global instance
agent_dispatcher = AgentDispatcher()


# Helper functions
def dispatch(agent_type: AgentType, task: str, **kwargs) -> Dict[str, Any]:
    """Dispatch task to agent"""
    return agent_dispatcher.dispatch(agent_type, task, **kwargs)


def dispatch_team(tasks: List[Dict[str, Any]], **kwargs) -> List[Dict[str, Any]]:
    """Dispatch to team"""
    return agent_dispatcher.dispatch_team(tasks, **kwargs)


def recommend_agent(task_description: str) -> AgentType:
    """Recommend agent for task"""
    return agent_dispatcher.get_recommended_agent(task_description)


if __name__ == "__main__":
    # Demo
    print("🤖 Multi-Agent Dispatcher Demo\n")

    print("1. All Agents Info:")
    agents_info = agent_dispatcher.get_all_agents_info()
    for agent_name, info in agents_info.items():
        print(f"\n   {agent_name}:")
        print(f"   → {info['description']}")
        print(f"   → Model: {info['recommended_model']}")
        print(f"   → Quality: {info['min_quality']}, Cost: €{info['max_cost_per_1k']}/1K")

    print("\n\n2. Single Agent Dispatch:")
    result = agent_dispatcher.dispatch(
        agent_type=AgentType.LEAD_DEVELOPER,
        task="Design a microservices architecture for e-commerce platform",
    )
    print(f"   Agent: {result['agent_type']}")
    print(f"   Model: {result['model_used']}")
    print(f"   Strategy: {result['criteria']['strategy']}")

    print("\n\n3. Team Dispatch:")
    team_tasks = [
        {"agent_type": AgentType.LEAD_DEVELOPER, "task": "Design REST API structure"},
        {"agent_type": AgentType.DATABASE_ARCHITECT, "task": "Design database schema"},
        {"agent_type": AgentType.UI_UX_DESIGNER, "task": "Create dashboard mockups"},
        {"agent_type": AgentType.TEST_ENGINEER, "task": "Generate unit tests"},
    ]

    results = agent_dispatcher.dispatch_team(team_tasks)
    print(f"   Dispatched {len(results)} tasks:")
    for r in results:
        print(f"   → {r['agent_type']}: {r['model_used']}")

    print("\n\n4. Agent Recommendation:")
    tasks = [
        "Fix the authentication bug",
        "Optimize database queries",
        "Design new landing page",
        "Write integration tests",
    ]

    for task in tasks:
        agent = agent_dispatcher.get_recommended_agent(task)
        print(f"   '{task}' → {agent.value}")