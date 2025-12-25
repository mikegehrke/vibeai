#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from kernel.agent_kernel import AgentKernel
from kernel.streamer import SSEStreamer  
from llm.router import LLMRouter
from llm.openai_client import OpenAIClient

# Use environment variable (set via export OPENAI_API_KEY=...)
if 'OPENAI_API_KEY' not in os.environ:
    raise ValueError("OPENAI_API_KEY environment variable not set")

class PrintResponse:
    async def write(self, data: str):
        print(data, end='', flush=True)
    async def flush(self):
        pass

async def main():
    streamer = SSEStreamer(response=PrintResponse())
    
    llm_router = LLMRouter({
        "openai": OpenAIClient(model="gpt-4o"),
        "openai-mini": OpenAIClient(model="gpt-4o-mini"),
    })
    
    kernel = AgentKernel(streamer=streamer, llm_router=llm_router)
    
    try:
        await kernel.run("hallo")
    except Exception as e:
        print(f"\n\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
