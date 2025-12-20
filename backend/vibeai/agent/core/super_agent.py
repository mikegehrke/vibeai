# -------------------------------------------------------------
# VIBEAI SUPER AGENT - MAIN ENTRY POINT
# -------------------------------------------------------------
"""
Main entry point for the VibeAI Super Agent.

This is the facade that coordinates all agent modules.
"""

from vibeai.agent.core.agent_core import SuperAgentCore, AgentState
from vibeai.agent.event_stream.event_emitter import EventEmitter


class SuperAgent:
    """
    🚀 VibeAI Super Agent - Main Interface
    
    Usage:
        agent = SuperAgent(project_id, on_event_callback)
        async for event in agent.generate_project(...):
            # Handle event
    """
    
    def __init__(
        self,
        project_id: str,
        on_event: callable = None,
        api_base_url: str = "http://localhost:8005"
    ):
        self.core = SuperAgentCore(project_id, api_base_url, on_event)
        self.project_id = project_id
    
    async def generate_project(
        self,
        project_name: str,
        platform: str,
        description: str,
        features: list = None
    ):
        """
        Generate project with live streaming.
        
        Yields events as they happen.
        """
        async for event in self.core.start_project_generation(
            project_name,
            platform,
            description,
            features or []
        ):
            yield event
    
    @property
    def state(self) -> AgentState:
        """Get current agent state."""
        return self.core.state








