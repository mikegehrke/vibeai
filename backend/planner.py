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