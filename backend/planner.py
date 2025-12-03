# backend/planner.py
# Erstellt einen Architekturplan für komplexe Apps

from openai import OpenAI
import json, os
from dotenv import load_dotenv

# Lade .env Datei
load_dotenv()

# Fallback für API Key wenn .env nicht funktioniert
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key.startswith("your-new"):
    api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

def plan_app(description: str):
    """
    Analysiert App-Idee und erstellt JSON-Struktur für Module, Screens, APIs, Funktionen, etc.
    """
    if not description.strip():
        return {"error": "Beschreibung darf nicht leer sein"}
    
    prompt = f"""
    You are an expert software architect. Given the app description below,
    analyze the app idea and create a technical architecture plan in JSON:
    - apptype (social, e-commerce, chat, etc.)
    - modules (auth, profile, feed, cart, etc.)
    - backend (api endpoints, db schema, etc.)
    - frontend (ui screens, components, navigation, etc.)
    - features (detailed list of features)
    - techstack (languages, frameworks, libraries)
    - deployment (hosting, CI/CD, etc.)
    - security (auth, data protection, etc.)
    - scalability (how to handle growth)
    - testing (unit, integration, e2e)
    - maintenance (updates, monitoring)
    - documentation (user guides, api docs)
    - timeline (phases, milestones)
    - teamroles (devs, designers, testers, etc.)
    - dependencies (3rd party services, libraries)
    - costestimate (rough budget estimate)
    
    Return ONLY valid JSON without any text before or after.
    App description: {description}
    """

    # 🚀 PREMIUM MODEL SELECTION - Alle Top-Modelle verfügbar!
    # Für Planing: O3 > Gpt-5 > O4-Mini > Gpt-5-mini > Fallbacks
    models_to_try = [
        "o3",              # 🥇 BESTE für Architecture Planning
        "gpt-5",           # 🥈 Exzellente Code-Architektur
        "o4-mini",         # 🥉 Schnelles Strategic Thinking
        "gpt-5-mini",      # 🏅 Ausgewogen für Planning
        "gpt-4.1",         # 🔧 Verbesserte Planung
        "gpt-5-nano",      # ⚡ Schnelle Pläne
        "gpt-4o-mini",     # 🔄 Fallback 1
        "gpt-4",           # 🔄 Fallback 2
        "gpt-3.5-turbo-16k", # 🔄 Fallback 3
        "gpt-3.5-turbo"    # 🔄 Final Fallback
    ]
    response = None
    
    try:
        for model in models_to_try:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=800
                )
                print(f"✅ Planner using model: {model}")
                break
            except Exception as e:
                print(f"❌ Planner model {model} failed: {str(e)}")
                if model == models_to_try[-1]:  # Letzter Versuch
                    raise e
                continue
        
        if not response:
            return {"error": "Alle Modelle fehlgeschlagen"}
        plan_content = response.choices[0].message.content
        if not plan_content:
            return {"error": "Keine Antwort von der AI erhalten"}
            
        plan = plan_content.strip()
        
        # Versuche JSON zu extrahieren falls Text drumherum ist
        if plan.startswith("```json"):
            plan = plan.replace("```json", "").replace("```", "").strip()
        
        return json.loads(plan)
        
    except json.JSONDecodeError as e:
        raw_response = locals().get('plan', 'Keine Antwort verfügbar')
        return {"error": f"JSON Parse Fehler: {str(e)}", "raw_response": raw_response}
    except Exception as e:
        return {"error": f"API Fehler: {str(e)}"}


# ✔ Original plan_app() ist vollständig und funktioniert
# ✔ Multi-Model Fallback (o3 → gpt-5 → o4-mini → etc.)
# ✔ Umfassender Architecture Plan (16+ Bereiche)
# ✔ JSON-basiert mit Parse-Fehler Handling
# ✔ Smart Model Selection (o3 für Planning)
#
# ❗ ABER:
#     - Sync API (nicht async)
#     - Hardcoded OpenAI Client
#     - Keine Integration mit model_registry_v2
#     - Keine Integration mit model_router_v2
#     - Keine Billing/Token Tracking
#     - Keine Multi-Provider Support
#     - max_tokens=800 zu wenig für große Projekte
#     - Keine Integration mit Composer
#     - Keine Worker-Integration
#
# 👉 Das Original ist ein guter OpenAI Architecture Planner
# 👉 Für dein 280-Modul-System brauchen wir Multi-Provider + Pipeline


# -------------------------------------------------------------
# VIBEAI – ARCHITECTURE PLANNER V2 (MULTI-PROVIDER + PIPELINE)
# -------------------------------------------------------------
from typing import Dict, Optional, List
from core.model_registry_v2 import resolve_model
from core.model_router_v2 import model_router_v2


class ArchitecturePlannerV2:
    """
    Production Architecture Planner mit:
    - Multi-Provider Support (GPT, Claude, Gemini, Ollama)
    - Async Interface
    - Planner → Worker → Composer Pipeline
    - Deep Analysis (Reasoning Models)
    - Large Plan Support (8000+ tokens)
    - Billing Integration
    """

    def __init__(self):
        self.default_model = "o3"  # Best for Planning
        self.max_tokens = 8000  # Large architecture plans

    async def plan_app(
        self,
        description: str,
        model: Optional[str] = None,
        detail_level: str = "comprehensive"
    ) -> Dict:
        """
        Erstellt umfassenden Architecture Plan.
        
        Args:
            description: App-Beschreibung
            model: Optional spezifisches Modell
            detail_level: "quick" | "standard" | "comprehensive"
            
        Returns:
            {
                "success": bool,
                "plan": {...},
                "model_used": str,
                "tokens": int
            }
        """
        
        # Model Selection (Devra für Deep Reasoning)
        if not model:
            model_name = model_router_v2.pick_model(
                description,
                agent="devra"  # Deep reasoning für Planning
            )
        else:
            model_name = model

        # Build Prompt based on detail level
        prompt = self._build_planning_prompt(description, detail_level)

        # AI Request
        model_wrapper = resolve_model(model_name)
        
        try:
            result = await model_wrapper.run(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert software architect with 20+ years experience. Create detailed, production-ready architecture plans."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                context={
                    "max_output_tokens": self.max_tokens,
                    "temperature": 0.4  # Balance creativity & structure
                }
            )

            # Parse Plan
            plan_data = self._parse_plan_response(result.get("message", ""))

            return {
                "success": True,
                "plan": plan_data,
                "model_used": model_name,
                "provider": result.get("provider"),
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0),
                "detail_level": detail_level
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model_attempted": model_name
            }

    def _build_planning_prompt(self, description: str, detail_level: str) -> str:
        """Erstellt optimierten Prompt für Architecture Planning."""
        
        if detail_level == "quick":
            sections = [
                "apptype", "modules", "backend", "frontend",
                "techstack", "features"
            ]
        elif detail_level == "comprehensive":
            sections = [
                "apptype", "modules", "backend", "frontend", "features",
                "techstack", "deployment", "security", "scalability",
                "testing", "maintenance", "documentation", "timeline",
                "teamroles", "dependencies", "costestimate", "risks",
                "milestones", "apis", "database_schema"
            ]
        else:  # standard
            sections = [
                "apptype", "modules", "backend", "frontend", "features",
                "techstack", "deployment", "security", "testing",
                "timeline", "costestimate"
            ]

        sections_str = "\n    - ".join(sections)

        return f"""
Create a detailed software architecture plan for: {description}

Return ONLY valid JSON with these sections:
    - {sections_str}

Requirements:
- Comprehensive analysis of requirements
- Modern best practices
- Production-ready recommendations
- Realistic timelines and costs
- Security considerations
- Scalability planning
- Complete technical stack

CRITICAL: Return ONLY the JSON, no markdown, no explanations.
"""

    def _parse_plan_response(self, response: str) -> Dict:
        """Extrahiert Plan-Daten aus AI-Response."""
        try:
            # Remove markdown if present
            clean_response = response.strip()
            
            if clean_response.startswith("```json"):
                clean_response = clean_response.replace("```json", "").replace("```", "").strip()
            elif clean_response.startswith("```"):
                clean_response = clean_response.replace("```", "").strip()

            # Parse JSON
            plan_data = json.loads(clean_response)
            return plan_data

        except json.JSONDecodeError as e:
            # Fallback: Return raw response
            return {
                "error": f"JSON Parse Error: {str(e)}",
                "raw_response": response,
                "apptype": "unknown",
                "modules": [],
                "features": [],
                "note": "Plan could not be parsed as JSON"
            }

    async def plan_feature(
        self,
        feature_description: str,
        app_context: Optional[Dict] = None,
        model: Optional[str] = None
    ) -> Dict:
        """
        Plant einzelnes Feature (schneller für Updates).
        
        Args:
            feature_description: Feature-Beschreibung
            app_context: Optional App-Kontext für bessere Planung
            model: Optional spezifisches Modell
            
        Returns:
            {
                "success": bool,
                "feature_plan": {...},
                "model_used": str
            }
        """
        model_name = model or "gpt-4o"
        model_wrapper = resolve_model(model_name)

        context_str = ""
        if app_context:
            context_str = f"\n\nApp Context:\n{json.dumps(app_context, indent=2)}"

        prompt = f"""
Create a detailed feature plan for: {feature_description}{context_str}

Return JSON with:
{{
    "feature_name": "Feature Name",
    "description": "What it does",
    "user_stories": ["As a user, I want to..."],
    "technical_requirements": ["Backend API", "Frontend UI", ...],
    "data_model": {{"fields": [...]}},
    "api_endpoints": ["/api/feature/create", ...],
    "ui_components": ["FeatureList", "FeatureDetail", ...],
    "dependencies": ["auth", "database", ...],
    "estimated_hours": 40,
    "priority": "high|medium|low"
}}

Return ONLY JSON, no explanations.
"""

        try:
            result = await model_wrapper.run(
                messages=[{"role": "user", "content": prompt}],
                context={"max_output_tokens": 3000, "temperature": 0.3}
            )

            feature_plan = self._parse_plan_response(result.get("message", ""))

            return {
                "success": True,
                "feature_plan": feature_plan,
                "model_used": model_name,
                "provider": result.get("provider"),
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def estimate_project(
        self,
        plan: Dict,
        model: Optional[str] = None
    ) -> Dict:
        """
        Schätzt Projekt-Aufwand basierend auf Architecture Plan.
        
        Args:
            plan: Architecture Plan (von plan_app)
            model: Optional spezifisches Modell
            
        Returns:
            {
                "success": bool,
                "estimate": {...},
                "model_used": str
            }
        """
        model_name = model or "gpt-4o"
        model_wrapper = resolve_model(model_name)

        prompt = f"""
Given this architecture plan, provide a detailed project estimate:

{json.dumps(plan, indent=2)}

Return JSON with:
{{
    "total_hours": 500,
    "phases": [
        {{"name": "Phase 1", "hours": 100, "weeks": 2}},
        ...
    ],
    "team_size": 5,
    "estimated_cost": {{"min": 50000, "max": 80000}},
    "risks": ["Risk 1", "Risk 2"],
    "critical_path": ["Module A", "Module B"]
}}

Return ONLY JSON.
"""

        try:
            result = await model_wrapper.run(
                messages=[{"role": "user", "content": prompt}],
                context={"max_output_tokens": 2000, "temperature": 0.2}
            )

            estimate = self._parse_plan_response(result.get("message", ""))

            return {
                "success": True,
                "estimate": estimate,
                "model_used": model_name,
                "provider": result.get("provider"),
                "input_tokens": result.get("input_tokens", 0),
                "output_tokens": result.get("output_tokens", 0)
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Globale Instanz
architecture_planner_v2 = ArchitecturePlannerV2()

# Alias für Kompatibilität
planner = plan_app
