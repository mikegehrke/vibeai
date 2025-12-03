"""
🔍 VibeAI 2.0 - Web Search Integration
Real-time web search with fallback options
"""

import os
import json
import aiohttp  # type: ignore
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
                from tavily import TavilyClient  # type: ignore
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


# ✔ Original WebSearchService ist vollständig und funktioniert
# ✔ Tavily Integration mit Fallback
# ✔ search(), fallback_search(), get_search_status() funktionieren
# ✔ ENV-basierte Konfiguration
# ✔ Async-basiert
#
# ❗ ABER:
#     - Nur Tavily Support (teuer, benötigt API-Key)
#     - Kein Bing Support
#     - Kein DuckDuckGo Support
#     - Keine URL-Analyse mit KI-Zusammenfassung
#     - Keine Integration mit model_registry_v2
#     - Keine Integration mit Billing/Tokens
#     - Keine Integration mit agent_system
#     - Fallback ist nur Simulation (keine echte Suche)
#
# 👉 Das Original ist ein guter Tavily-Wrapper
# 👉 Für dein 280-Modul-System brauchen wir Multi-Provider + KI-Analysis


# -------------------------------------------------------------
# VIBEAI – WEB SEARCH ENGINE V2 (BING / DUCKDUCKGO / URL-READER)
# -------------------------------------------------------------
import httpx
from core.model_registry_v2 import resolve_model


class WebSearchV2:
    """
    Multi-Provider Web Search:
    - Bing Search API (primär)
    - DuckDuckGo (kostenlos, Fallback)
    - Tavily (optional)
    - URL-Analyse mit KI
    - Content Extraction
    """

    def __init__(self):
        self.bing_key = os.getenv("BING_SEARCH_API_KEY")
        self.tavily_key = os.getenv("TAVILY_API_KEY")
        self.bing_endpoint = "https://api.bing.microsoft.com/v7.0/search"

    async def search(self, query: str, count: int = 5, provider: str = "auto"):
        """
        Intelligente Websuche mit Provider-Auswahl.
        """
        
        # Auto-Select: Bing > Tavily > DuckDuckGo
        if provider == "auto":
            if self.bing_key:
                return await self.search_bing(query, count)
            elif self.tavily_key:
                return await self.search_tavily(query, count)
            else:
                return await self.search_duckduckgo(query, count)
        
        # Spezifischer Provider
        if provider == "bing":
            return await self.search_bing(query, count)
        elif provider == "tavily":
            return await self.search_tavily(query, count)
        elif provider == "duckduckgo":
            return await self.search_duckduckgo(query, count)

    async def search_bing(self, query: str, count: int = 5):
        """Bing Search API"""
        if not self.bing_key:
            return {"error": "Bing API Key not configured"}

        params = {
            "q": query,
            "count": count,
            "textDecorations": False,
            "textFormat": "Raw",
        }

        headers = {"Ocp-Apim-Subscription-Key": self.bing_key}

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                self.bing_endpoint,
                params=params,
                headers=headers
            )
            data = resp.json()

            results = []
            for item in data.get("webPages", {}).get("value", []):
                results.append({
                    "title": item.get("name"),
                    "url": item.get("url"),
                    "snippet": item.get("snippet"),
                })

            return {
                "provider": "bing",
                "query": query,
                "results": results,
                "count": len(results)
            }

    async def search_tavily(self, query: str, count: int = 5):
        """Tavily Search (from original)"""
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.tavily_key)
            
            response = client.search(
                query=query,
                search_depth="advanced",
                max_results=count,
                include_answer=True
            )

            return {
                "provider": "tavily",
                "query": query,
                "answer": response.get("answer", ""),
                "results": response.get("results", []),
                "count": len(response.get("results", []))
            }
        except Exception as e:
            return {"error": f"Tavily error: {str(e)}"}

    async def search_duckduckgo(self, query: str, count: int = 5):
        """DuckDuckGo Instant Answer API (kostenlos)"""
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json"}
            )
            data = resp.json()

            abstract = data.get("Abstract", "")
            related = data.get("RelatedTopics", [])

            results = []

            if abstract:
                results.append({
                    "title": query,
                    "url": data.get("AbstractURL", ""),
                    "snippet": abstract
                })

            for item in related[:count]:
                if isinstance(item, dict) and item.get("Text"):
                    results.append({
                        "title": item.get("Text"),
                        "url": item.get("FirstURL"),
                        "snippet": item.get("Text")
                    })

            return {
                "provider": "duckduckgo",
                "query": query,
                "results": results,
                "count": len(results)
            }

    async def analyze_url(self, url: str, model_name="gpt-4o-mini"):
        """
        URL-Analyse: Lädt Webseite und fasst sie mit KI zusammen.
        """
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            text = resp.text[:10000]  # Limitiere auf 10k Zeichen

        # KI-Zusammenfassung
        model = resolve_model(model_name)

        result = await model.run(
            messages=[
                {"role": "system", "content": "Summarize this webpage content clearly."},
                {"role": "user", "content": text},
            ],
            context={},
        )

        return {
            "url": url,
            "summary": result.get("message"),
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "provider": result.get("provider", "unknown"),
        }


# Globale Instanz
web_search_v2 = WebSearchV2()
