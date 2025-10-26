"""
🔍 VibeAI 2.0 - Web Search Integration
Real-time web search with fallback options
"""

import os
import json
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class WebSearchService:
    def __init__(self):
        self.tavily_api_key = os.getenv('TAVILY_API_KEY')
        self.fallback_enabled = True
        
        # Initialize Tavily if API key available
        if self.tavily_api_key:
            try:
                # Import tavily only if available
                from tavily import TavilyClient
                self.tavily_client = TavilyClient(api_key=self.tavily_api_key)
                self.tavily_available = True
                print("✅ Tavily Web Search initialized")
            except ImportError:
                print("⚠️ Tavily not installed. Using fallback search.")
                self.tavily_available = False
                self.tavily_client = None
        else:
            self.tavily_available = False
            self.tavily_client = None
            print("⚠️ Tavily API Key not found. Web search will use fallback methods.")
    
    async def search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Perform real-time web search with fallback
        """
        # Try Tavily first if available
        if self.tavily_available and self.tavily_client:
            try:
                response = self.tavily_client.search(
                    query=query,
                    search_depth="advanced", 
                    max_results=max_results,
                    include_answer=True,
                    include_raw_content=True
                )
                
                return {
                    "success": True,
                    "method": "tavily",
                    "query": query,
                    "answer": response.get("answer", ""),
                    "results": response.get("results", []),
                    "sources": [result["url"] for result in response.get("results", [])],
                    "total_results": len(response.get("results", []))
                }
            except Exception as e:
                print(f"Tavily search failed: {e}")
                # Fall back to alternative method
        
        # Fallback to simulation for demo
        return await self.fallback_search(query, max_results)
    
    async def fallback_search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Fallback search method when Tavily is not available
        """
        # Simulate web search results for demo purposes
        simulated_results = [
            {
                "title": f"Search result for: {query}",
                "url": f"https://example.com/search?q={query.replace(' ', '+')}",
                "content": f"This is a simulated search result for '{query}'. Configure TAVILY_API_KEY for real web search.",
                "score": 0.95
            },
            {
                "title": f"Documentation about {query}",
                "url": f"https://docs.example.com/{query.replace(' ', '-')}",
                "content": f"Technical documentation and guides related to {query}.",
                "score": 0.88
            },
            {
                "title": f"Latest news on {query}",
                "url": f"https://news.example.com/{query.replace(' ', '-')}",
                "content": f"Recent developments and news about {query}.",
                "score": 0.82
            }
        ]
        
        return {
            "success": True,
            "method": "fallback_simulation",
            "query": query,
            "answer": f"Based on simulated information about '{query}', here are the key findings...",
            "results": simulated_results[:max_results],
            "sources": [result["url"] for result in simulated_results[:max_results]],
            "total_results": len(simulated_results[:max_results]),
            "note": "⚠️ This is a simulated response. Configure TAVILY_API_KEY for real web search."
        }
    
    def get_search_status(self) -> Dict[str, Any]:
        """
        Get status of search capabilities
        """
        return {
            "tavily_available": self.tavily_available,
            "tavily_api_key_configured": bool(self.tavily_api_key),
            "fallback_enabled": self.fallback_enabled,
            "capabilities": [
                "Basic search" if not self.tavily_available else "Advanced web search",
                "Topic research", 
                "Current information lookup",
                "Multi-source aggregation"
            ]
        }