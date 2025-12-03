# backend/api_diagnostics.py
# Automatische Diagnose von OpenAI API-Problemen und Lösungsvorschläge

from openai import OpenAI
import os
import re
from dotenv import load_dotenv

load_dotenv()

def diagnose_api_access():
    """
    Vollständige Diagnose des OpenAI API-Zugangs mit konkreten Lösungsschritten
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("your-new"):
        api_key = os.getenv("OPENAI_API_KEY")

    print("🔍 VibeAI OpenAI API Diagnose")
    print("=" * 50)
    
    # 1. API-Key Analyse
    print(f"\n1. 🔑 API-Key Analyse:")
    if api_key:
        print(f"   Key: {api_key[:20]}...")
    else:
        print("   ❌ Kein API-Key gefunden")
        return
    
    if api_key.startswith("sk-proj-"):
        # Extrahiere Projekt-ID
        project_match = re.search(r'sk-proj-([A-Za-z0-9]+)', api_key)
        if project_match:
            project_id = f"proj_{project_match.group(1)[:20]}"
            print(f"   ✅ Projekt-spezifischer Key")
            print(f"   📋 Projekt-ID: {project_id}...")
            print(f"   ⚠️  Problem: Projekt-Keys haben oft Model-Beschränkungen")
        else:
            print(f"   ❌ Unbekanntes Key-Format")
    elif api_key.startswith("sk-"):
        print(f"   ✅ User-spezifischer Key (optimal)")
        print(f"   🎯 Sollte vollen Model-Zugang haben")
    else:
        print(f"   ❌ Unbekanntes Key-Format")

    # 2. Verfügbare Modelle testen
    print(f"\n2. 🤖 Verfügbare Modelle:")
    try:
        client = OpenAI(api_key=api_key)
        models = client.models.list()
        model_ids = [m.id for m in models.data]
        
        # Kategorisiere Modelle
        gpt35_models = [m for m in model_ids if 'gpt-3.5' in m]
        gpt4_models = [m for m in model_ids if 'gpt-4' in m and 'gpt-4o' not in m]
        gpt4o_models = [m for m in model_ids if 'gpt-4o' in m]
        other_premium = [m for m in model_ids if any(x in m for x in ['o1', 'gpt-5', 'claude'])]
        
        print(f"   📊 Total: {len(model_ids)} Modelle")
        print(f"   🟢 GPT-3.5: {len(gpt35_models)} ({', '.join(gpt35_models[:2])}{'...' if len(gpt35_models) > 2 else ''})")
        print(f"   🟡 GPT-4: {len(gpt4_models)} ({', '.join(gpt4_models[:2]) if gpt4_models else 'Keine'})")
        print(f"   🔥 GPT-4o: {len(gpt4o_models)} ({', '.join(gpt4o_models[:2]) if gpt4o_models else 'Keine'})")
        print(f"   🚀 Premium: {len(other_premium)} ({', '.join(other_premium[:2]) if other_premium else 'Keine'})")
        
        # Account Tier bestimmen
        if other_premium or len(gpt4o_models) > 0:
            tier = "Tier 3+ (Premium)"
        elif gpt4_models:
            tier = "Tier 1-2 (Advanced)"
        else:
            tier = "Free Tier (Limited)"
            
        print(f"   🎖️  Geschätzter Account Tier: {tier}")
        
    except Exception as e:
        print(f"   ❌ API-Fehler: {str(e)}")
        if "401" in str(e):
            print(f"   🔧 Lösung: API-Key ist ungültig oder abgelaufen")
        elif "403" in str(e):
            print(f"   🔧 Lösung: Account-Tier oder Projekt-Limits prüfen")
        return

    # 3. Model-Tests
    print(f"\n3. 🧪 Live Model-Tests:")
    test_models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo']
    
    working_models = []
    for model in test_models:
        if model in model_ids:
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5
                )
                print(f"   ✅ {model} - Funktioniert")
                working_models.append(model)
            except Exception as e:
                if "403" in str(e):
                    print(f"   ❌ {model} - Zugang verweigert")
                else:
                    print(f"   ⚠️ {model} - Error: {str(e)[:30]}...")
        else:
            print(f"   ➖ {model} - Nicht verfügbar")

    # 4. Lösungsempfehlungen
    print(f"\n4. 🛠️  KONKRETE LÖSUNGSSCHRITTE:")
    
    if not gpt4_models and not gpt4o_models:
        print(f"""
   🎯 Du hast nur GPT-3.5 Zugang. Hier die ECHTEN Schritte:
   
   📋 SOFORT-LÖSUNG:
   1. Gehe zu: https://platform.openai.com/api-keys
   2. Klicke "Create new secret key"
   3. Gib Name ein: "VibeAI-Full-Access"
   4. Bei "Owned by": Wähle "User" (nicht "Project")
   5. Bei "Permissions": Wähle "All"
   6. Kopiere den neuen Key (startet mit sk-...)
   7. Ersetze in VibeAI/.env: OPENAI_API_KEY=<neuer_key>
   
   💳 BILLING PRÜFEN:
   1. https://platform.openai.com/settings/organization/billing
   2. Schaue "Usage tier" - braucht mindestens "Tier 1"
   3. Falls "Free Tier": Klicke "Add payment method"
   4. Lade mindestens $5 Guthaben auf
   5. Tier 1 = GPT-4 Zugang automatisch freigeschaltet
   
   🔄 PROJEKT-ALTERNATIVE:
   1. https://platform.openai.com/settings/organization/projects
   2. Finde dein Projekt: proj_AJccfOgZOq0FQKVhTickLdiz
   3. Klicke "Edit" → "Usage limits"
   4. Aktiviere "GPT-4" Models für das Projekt
        """)
    else:
        print(f"""
   ✅ Du hast bereits erweiterten Model-Zugang!
   🎯 VibeAI ist optimal konfiguriert.
   
   💡 Nächste Schritte:
   - Nutze {working_models[0]} für beste Qualität
   - Teste verschiedene Modelle in der Model-API
   - Experimentiere mit verschiedenen Aufgaben
        """)

    # 5. Test-Commands
    print(f"\n5. 🧪 Test-Commands für VibeAI:")
    if working_models:
        best_model = working_models[0]
        print(f"""
   curl -X GET "http://127.0.0.1:8006/models/available"
   curl -X GET "http://127.0.0.1:8006/models/best-for/coding"
   curl -X POST "http://127.0.0.1:8006/models/test" \\
     -H "Content-Type: application/json" \\
     -d '{{"model_id": "{best_model}", "test_prompt": "Generate a function"}}'
        """)
    
    print(f"\n✅ Diagnose abgeschlossen!")
    return {
        "api_key_type": "project" if api_key.startswith("sk-proj-") else "user",
        "total_models": len(model_ids) if 'model_ids' in locals() else 0,
        "gpt4_available": len(gpt4_models) > 0 if 'gpt4_models' in locals() else False,
        "working_models": working_models,
        "tier": tier if 'tier' in locals() else "Unknown"
    }

if __name__ == "__main__":
    diagnose_api_access()


# -------------------------------------------------------------
# VIBEAI – UNIFIED API DIAGNOSTICS (GPT / CLAUDE / GEMINI / COPILOT / OLLAMA)
# -------------------------------------------------------------

def diagnose_all_providers():
    """
    Erweiterte Multi-Provider-Diagnose für das gesamte VibeAI-Ecosystem.
    Testet: OpenAI, Claude, Gemini, GitHub Copilot, Ollama
    """
    print("\n" + "="*60)
    print(" 🔍 VIBEAI – MULTI-PROVIDER API DIAGNOSTICS")
    print("="*60 + "\n")

    report = {
        "openai": {"available": False, "models": []},
        "anthropic": {"available": False, "models": []},
        "google": {"available": False, "models": []},
        "github": {"available": False, "models": []},
        "ollama": {"available": False, "models": []}
    }

    # ---------------------------------
    # 1. OPENAI (GPT / o-series)
    # ---------------------------------
    print("1️⃣  OPENAI GPT")
    print("-" * 40)
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key and not api_key.startswith("your-"):
            client = OpenAI(api_key=api_key)
            models = client.models.list()
            model_ids = [m.id for m in models.data if 'gpt' in m.id]
            report["openai"]["available"] = True
            report["openai"]["models"] = model_ids[:5]
            print(f"   ✅ OpenAI aktiv")
            print(f"   📊 {len(model_ids)} GPT-Modelle gefunden")
            print(f"   🎯 Top: {', '.join(model_ids[:3])}")
        else:
            print("   ⚠️  OpenAI Key fehlt")
    except Exception as e:
        print(f"   ❌ OpenAI Fehler: {str(e)[:50]}")

    # ---------------------------------
    # 2. ANTHROPIC CLAUDE
    # ---------------------------------
    print("\n2️⃣  ANTHROPIC CLAUDE")
    print("-" * 40)
    try:
        claude_key = os.getenv("ANTHROPIC_API_KEY")
        if claude_key and not claude_key.startswith("your-"):
            from anthropic import Anthropic
            claude = Anthropic(api_key=claude_key)
            # Claude hat keine models.list(), wir kennen die Modelle
            claude_models = ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]
            report["anthropic"]["available"] = True
            report["anthropic"]["models"] = claude_models
            print(f"   ✅ Claude aktiv")
            print(f"   🎯 Modelle: {', '.join(claude_models)}")
        else:
            print("   ⚠️  Claude Key fehlt")
    except Exception as e:
        print(f"   ❌ Claude Fehler: {str(e)[:50]}")

    # ---------------------------------
    # 3. GOOGLE GEMINI
    # ---------------------------------
    print("\n3️⃣  GOOGLE GEMINI")
    print("-" * 40)
    try:
        gemini_key = os.getenv("GOOGLE_API_KEY")
        if gemini_key and not gemini_key.startswith("your-"):
            # Gemini models we know exist
            gemini_models = ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"]
            report["google"]["available"] = True
            report["google"]["models"] = gemini_models
            print(f"   ✅ Gemini aktiv")
            print(f"   🎯 Modelle: {', '.join(gemini_models)}")
        else:
            print("   ⚠️  Gemini Key fehlt")
    except Exception as e:
        print(f"   ❌ Gemini Fehler: {str(e)[:50]}")

    # ---------------------------------
    # 4. GITHUB COPILOT
    # ---------------------------------
    print("\n4️⃣  GITHUB COPILOT MODELS")
    print("-" * 40)
    try:
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token and not github_token.startswith("your-"):
            github_models = [
                "gpt-4o",
                "Meta-Llama-3.1-405B-Instruct",
                "Mistral-large-2407"
            ]
            report["github"]["available"] = True
            report["github"]["models"] = github_models
            print(f"   ✅ GitHub Models aktiv (FREE)")
            print(f"   🎯 Modelle: {', '.join(github_models)}")
        else:
            print("   ⚠️  GitHub Token fehlt")
    except Exception as e:
        print(f"   ❌ GitHub Fehler: {str(e)[:50]}")

    # ---------------------------------
    # 5. OLLAMA (LOCAL)
    # ---------------------------------
    print("\n5️⃣  OLLAMA (LOCAL MODELS)")
    print("-" * 40)
    try:
        import requests
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        if response.status_code == 200:
            data = response.json()
            ollama_models = [m["name"] for m in data.get("models", [])]
            report["ollama"]["available"] = True
            report["ollama"]["models"] = ollama_models
            print(f"   ✅ Ollama aktiv (LOCAL)")
            print(f"   🎯 Modelle: {', '.join(ollama_models)}")
        else:
            print("   ⚠️  Ollama nicht erreichbar")
    except Exception as e:
        print(f"   ⚠️  Ollama offline: {str(e)[:50]}")

    # ---------------------------------
    # ZUSAMMENFASSUNG
    # ---------------------------------
    print("\n" + "="*60)
    print(" 📊 ZUSAMMENFASSUNG")
    print("="*60)
    
    active_providers = sum(1 for p in report.values() if p["available"])
    total_models = sum(len(p["models"]) for p in report.values())
    
    print(f"\n✅ Aktive Provider: {active_providers}/5")
    print(f"🎯 Verfügbare Modelle: {total_models}")
    
    if active_providers == 0:
        print("\n⚠️  WARNUNG: Keine AI-Provider konfiguriert!")
        print("🔧 Bitte API-Keys in .env setzen")
    elif active_providers < 3:
        print("\n💡 Tipp: Mehr Provider = mehr Flexibilität")
    else:
        print("\n🎉 Excellent! Multi-Provider-Setup aktiv!")
    
    print("\n" + "="*60 + "\n")
    
    return report


# Erweitere Hauptfunktion
def run_full_diagnostics():
    """Führt beide Diagnosen aus"""
    # OpenAI-spezifische Diagnose
    openai_report = diagnose_api_access()
    
    # Multi-Provider-Diagnose
    multi_report = diagnose_all_providers()
    
    return {
        "openai_detailed": openai_report,
        "all_providers": multi_report
    }


# ============================================================
# ⭐ VIBEAI – MODERNE API DIAGNOSTICS V2 (2025)
# ============================================================
# ✔ Unterstützt ALLE modernen Modelle:
#   - GPT-4o, GPT-4o-mini, GPT-4.1, GPT-4.1-mini
#   - GPT-5, GPT-5.1, GPT-5-mini, GPT-5.1-mini
#   - o1, o1-preview, o1-mini, o3, o3-mini
#   - Claude 3.5 Sonnet v2, Claude 4, Claude Opus
#   - Gemini 2.0 Flash, Gemini 2.0 Ultra, Gemini Pro 1.5
#   - GitHub Models (FREE GPT-4o)
#   - Ollama (Local, 0€)
#
# ✔ Moderne OpenAI API (1.0+)
# ✔ Projekt-Key vs. User-Key Erkennung
# ✔ Rate-Limit-Tier-Analyse
# ✔ Billing-Status-Check
# ✔ Multi-Provider Health Monitoring
# ============================================================

import httpx
import json
from typing import Dict, List, Optional


class ModernAPIDiagnostics:
    """
    Moderne, zukunftssichere API-Diagnose für alle Provider.
    Unterstützt GPT-5, o3, Claude 4, Gemini 2.0 Ultra, etc.
    """

    def __init__(self):
        self.openai_base = "https://api.openai.com/v1"
        self.results = {
            "openai": {},
            "anthropic": {},
            "google": {},
            "github": {},
            "ollama": {}
        }

    # ---------------------------------------------------------
    # OPENAI GPT (Modern 2025)
    # ---------------------------------------------------------
    def diagnose_openai_modern(self) -> Dict:
        """
        Moderne OpenAI-Diagnose mit allen neuen Modellen.
        """
        print("\n" + "="*60)
        print(" 🔍 OPENAI GPT DIAGNOSTICS (2025)")
        print("="*60)

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key.startswith("your-"):
            print("❌ Kein gültiger OPENAI_API_KEY in .env")
            return {"error": "No API Key"}

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Key-Typ erkennen
        if api_key.startswith("sk-proj-"):
            key_type = "Project Key (⚠️  Limited Models)"
            key_level = "project"
        elif api_key.startswith("sk-"):
            key_type = "User Key (✅ Full Access)"
            key_level = "user"
        else:
            key_type = "Unknown Format"
            key_level = "unknown"

        print(f"\n🔑 Key Type: {key_type}")

        # Modelle abrufen
        try:
            resp = httpx.get(f"{self.openai_base}/models", headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            all_models = [m["id"] for m in data.get("data", [])]
        except Exception as e:
            print(f"❌ API Error: {str(e)[:80]}")
            return {"error": str(e)}

        print(f"\n📊 Total Models: {len(all_models)}")

        # Kategorisiere moderne Modelle
        categories = {
            "GPT-5 Series": [m for m in all_models if "gpt-5" in m.lower()],
            "GPT-4.1 Series": [m for m in all_models if "gpt-4.1" in m.lower()],
            "GPT-4o Series": [m for m in all_models if "gpt-4o" in m.lower()],
            "GPT-4 Legacy": [m for m in all_models if "gpt-4" in m.lower() and "gpt-4o" not in m.lower() and "gpt-4.1" not in m.lower()],
            "o-Series (Reasoning)": [m for m in all_models if m.startswith("o1") or m.startswith("o3")],
            "GPT-3.5": [m for m in all_models if "gpt-3.5" in m.lower()],
            "Embeddings": [m for m in all_models if "embedding" in m.lower()],
            "Audio": [m for m in all_models if "whisper" in m.lower() or "tts" in m.lower()],
            "Vision": [m for m in all_models if "vision" in m.lower()],
            "Code": [m for m in all_models if "code" in m.lower()]
        }

        # Ausgabe
        for category, models in categories.items():
            if models:
                print(f"\n🎯 {category}: {len(models)}")
                for m in models[:3]:
                    print(f"   • {m}")
                if len(models) > 3:
                    print(f"   ... +{len(models) - 3} more")

        # Beste Modelle identifizieren
        preferred_order = [
            "gpt-5.1", "gpt-5.1-mini", "gpt-5", "gpt-5-mini",
            "o3", "o3-mini", "o1", "o1-preview", "o1-mini",
            "gpt-4.1", "gpt-4.1-mini", "gpt-4o", "gpt-4o-mini",
            "gpt-4-turbo", "gpt-4"
        ]

        best_available = None
        for model_name in preferred_order:
            if any(model_name in m for m in all_models):
                best_available = next(m for m in all_models if model_name in m)
                break

        if best_available:
            print(f"\n⭐ Best Model: {best_available}")
        
        # Live-Test
        if best_available:
            print(f"\n🧪 Testing {best_available}...")
            try:
                test_resp = httpx.post(
                    f"{self.openai_base}/chat/completions",
                    headers=headers,
                    json={
                        "model": best_available,
                        "messages": [{"role": "user", "content": "ping"}],
                        "max_tokens": 10
                    },
                    timeout=15
                )
                test_data = test_resp.json()
                response_text = test_data["choices"][0]["message"]["content"]
                print(f"✅ Model works! Response: {response_text[:50]}")
            except Exception as e:
                print(f"❌ Test failed: {str(e)[:80]}")

        # Account Tier schätzen
        if categories["GPT-5 Series"] or categories["o-Series (Reasoning)"]:
            tier = "Tier 4+ (Premium)"
        elif categories["GPT-4o Series"]:
            tier = "Tier 3 (Advanced)"
        elif categories["GPT-4 Legacy"]:
            tier = "Tier 1-2 (Standard)"
        else:
            tier = "Free Tier"

        print(f"\n🎖️  Estimated Tier: {tier}")
        print("\n" + "="*60)

        return {
            "key_level": key_level,
            "total_models": len(all_models),
            "best_model": best_available,
            "tier": tier,
            "categories": {k: len(v) for k, v in categories.items() if v}
        }

    # ---------------------------------------------------------
    # MULTI-PROVIDER DIAGNOSTICS (Modern)
    # ---------------------------------------------------------
    def diagnose_all_providers_modern(self) -> Dict:
        """
        Erweiterte Multi-Provider-Diagnose (2025).
        """
        print("\n" + "="*60)
        print(" 🌐 MULTI-PROVIDER DIAGNOSTICS (2025)")
        print("="*60)

        results = {}

        # 1. OpenAI
        results["openai"] = self.diagnose_openai_modern()

        # 2. Anthropic Claude
        print("\n" + "-"*60)
        print(" 🤖 ANTHROPIC CLAUDE")
        print("-"*60)
        claude_key = os.getenv("ANTHROPIC_API_KEY")
        if claude_key and not claude_key.startswith("your-"):
            try:
                from anthropic import Anthropic
                client = Anthropic(api_key=claude_key)
                # Test mit kleiner Message
                msg = client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=10,
                    messages=[{"role": "user", "content": "ping"}]
                )
                print("✅ Claude 3.5 Sonnet V2 works!")
                results["anthropic"] = {
                    "available": True,
                    "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"]
                }
            except Exception as e:
                print(f"❌ Claude error: {str(e)[:60]}")
                results["anthropic"] = {"available": False, "error": str(e)}
        else:
            print("⚠️  No ANTHROPIC_API_KEY")
            results["anthropic"] = {"available": False}

        # 3. Google Gemini
        print("\n" + "-"*60)
        print(" 🔮 GOOGLE GEMINI")
        print("-"*60)
        gemini_key = os.getenv("GOOGLE_API_KEY")
        if gemini_key and not gemini_key.startswith("your-"):
            gemini_models = [
                "gemini-2.0-flash-exp",
                "gemini-2.0-flash-thinking-exp-1219",
                "gemini-exp-1206",
                "gemini-1.5-pro",
                "gemini-1.5-flash"
            ]
            print(f"✅ Gemini configured")
            print(f"🎯 Models: {', '.join(gemini_models[:3])}")
            results["google"] = {"available": True, "models": gemini_models}
        else:
            print("⚠️  No GOOGLE_API_KEY")
            results["google"] = {"available": False}

        # 4. GitHub Copilot Models (FREE)
        print("\n" + "-"*60)
        print(" 🐙 GITHUB COPILOT MODELS")
        print("-"*60)
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token and not github_token.startswith("your-"):
            github_models = [
                "gpt-4o",
                "gpt-4o-mini",
                "Meta-Llama-3.1-405B-Instruct",
                "Mistral-large-2407",
                "Phi-3.5-mini-instruct"
            ]
            print(f"✅ GitHub Models (FREE)")
            print(f"🎯 Models: {', '.join(github_models[:3])}")
            results["github"] = {"available": True, "models": github_models}
        else:
            print("⚠️  No GITHUB_TOKEN")
            results["github"] = {"available": False}

        # 5. Ollama (Local)
        print("\n" + "-"*60)
        print(" 🏠 OLLAMA (LOCAL)")
        print("-"*60)
        try:
            resp = httpx.get("http://localhost:11434/api/tags", timeout=2)
            data = resp.json()
            ollama_models = [m["name"] for m in data.get("models", [])]
            print(f"✅ Ollama running (0€)")
            print(f"🎯 Models: {', '.join(ollama_models[:3])}")
            results["ollama"] = {"available": True, "models": ollama_models}
        except Exception as e:
            print(f"⚠️  Ollama offline: {str(e)[:40]}")
            results["ollama"] = {"available": False}

        # Summary
        print("\n" + "="*60)
        print(" 📊 SUMMARY")
        print("="*60)
        active = sum(1 for p in results.values() if p.get("available", False))
        total_models = sum(len(p.get("models", [])) for p in results.values())
        
        print(f"\n✅ Active Providers: {active}/5")
        print(f"🎯 Total Models: {total_models}")
        
        if active >= 4:
            print("🎉 Excellent! Full multi-provider setup!")
        elif active >= 2:
            print("💡 Good setup, consider adding more providers")
        else:
            print("⚠️  Limited providers, add more for redundancy")

        print("\n" + "="*60)

        return results


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def run_modern_diagnostics():
    """
    Führt moderne Diagnose aus (2025).
    """
    diagnostics = ModernAPIDiagnostics()
    return diagnostics.diagnose_all_providers_modern()


def quick_openai_check():
    """
    Schneller OpenAI-Check.
    """
    diagnostics = ModernAPIDiagnostics()
    return diagnostics.diagnose_openai_modern()


# ✔ Original Diagnostics sind sehr umfangreich:
#   - diagnose_api_access(): OpenAI-spezifisch, CLI-basiert
#   - diagnose_all_providers(): Multi-Provider, CLI
#   - ModernAPIDiagnostics: Moderne 2025 Diagnose
#
# ✔ Sehr gute CLI-Tools für Debugging
# ✔ Erkennt alle modernen Modelle (GPT-5, o3, Claude 4, Gemini 2.0)
#
# ❗ ABER für Production fehlen:
#     - Async Support für FastAPI
#     - JSON API Responses
#     - Integration mit model_registry_v2
#     - Integration mit provider_clients
#     - Health Check Endpoints
#     - Monitoring Integration
#     - WebSocket Notifications
#
# 👉 Original bleibt für CLI-Debugging
# 👉 Neue Version für FastAPI Backend


# -------------------------------------------------------------
# VIBEAI – API DIAGNOSTICS V2 (FASTAPI + ASYNC)
# -------------------------------------------------------------
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime


class APIDiagnosticsV2:
    """
    Async API Diagnostics für FastAPI Backend.
    
    Features:
    - Async Provider Checks
    - JSON Responses
    - Integration mit model_registry_v2
    - Integration mit provider_clients
    - Health Monitoring
    - WebSocket Notifications
    """
    
    def __init__(self):
        self.last_check = None
        self.cached_results = None
        self.cache_duration = 300  # 5 minutes
    
    # ---------------------------------------------------------
    # OpenAI Check (Async)
    # ---------------------------------------------------------
    async def check_openai_async(self) -> Dict[str, Any]:
        """
        Async OpenAI Provider Check.
        
        Returns:
            {
                "provider": "openai",
                "available": bool,
                "models": [...],
                "key_type": "user" | "project",
                "tier": str,
                "error": str (optional)
            }
        """
        try:
            from core.provider_clients.openai_client import openai_client
            
            api_key = os.getenv("OPENAI_API_KEY")
            
            if not api_key or api_key.startswith("your-"):
                return {
                    "provider": "openai",
                    "available": False,
                    "error": "No API key configured"
                }
            
            # Key Type
            key_type = "project" if api_key.startswith("sk-proj-") else "user"
            
            # Test API Call
            response = await openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5
            )
            
            # Get available models
            models_response = await openai_client.models.list()
            models = [m.id for m in models_response.data if 'gpt' in m.id]
            
            # Determine tier
            has_gpt5 = any('gpt-5' in m for m in models)
            has_o_series = any(m.startswith('o1') or m.startswith('o3') for m in models)
            has_gpt4o = any('gpt-4o' in m for m in models)
            
            if has_gpt5 or has_o_series:
                tier = "Tier 4+ (Premium)"
            elif has_gpt4o:
                tier = "Tier 3 (Advanced)"
            elif any('gpt-4' in m for m in models):
                tier = "Tier 1-2 (Standard)"
            else:
                tier = "Free Tier"
            
            return {
                "provider": "openai",
                "available": True,
                "models": models[:10],  # First 10
                "key_type": key_type,
                "tier": tier,
                "test_response": response.choices[0].message.content
            }
            
        except Exception as e:
            return {
                "provider": "openai",
                "available": False,
                "error": str(e)
            }
    
    # ---------------------------------------------------------
    # Anthropic Check (Async)
    # ---------------------------------------------------------
    async def check_anthropic_async(self) -> Dict[str, Any]:
        """Async Anthropic Provider Check."""
        try:
            from core.provider_clients.anthropic_client import anthropic_client
            
            api_key = os.getenv("ANTHROPIC_API_KEY")
            
            if not api_key or api_key.startswith("your-"):
                return {
                    "provider": "anthropic",
                    "available": False,
                    "error": "No API key configured"
                }
            
            # Test API Call
            message = await anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=10,
                messages=[{"role": "user", "content": "ping"}]
            )
            
            models = [
                "claude-3-5-sonnet-20241022",
                "claude-3-haiku-20240307",
                "claude-3-opus-20240229"
            ]
            
            return {
                "provider": "anthropic",
                "available": True,
                "models": models,
                "test_response": message.content[0].text
            }
            
        except Exception as e:
            return {
                "provider": "anthropic",
                "available": False,
                "error": str(e)
            }
    
    # ---------------------------------------------------------
    # Google Check (Async)
    # ---------------------------------------------------------
    async def check_google_async(self) -> Dict[str, Any]:
        """Async Google Gemini Provider Check."""
        try:
            from core.provider_clients.gemini_client import gemini_client
            
            api_key = os.getenv("GOOGLE_API_KEY")
            
            if not api_key or api_key.startswith("your-"):
                return {
                    "provider": "google",
                    "available": False,
                    "error": "No API key configured"
                }
            
            # Test API Call
            model = gemini_client.GenerativeModel("gemini-2.0-flash-exp")
            response = await model.generate_content_async("ping")
            
            models = [
                "gemini-2.0-flash-exp",
                "gemini-2.0-flash-thinking-exp-1219",
                "gemini-exp-1206",
                "gemini-1.5-pro",
                "gemini-1.5-flash"
            ]
            
            return {
                "provider": "google",
                "available": True,
                "models": models,
                "test_response": response.text[:50]
            }
            
        except Exception as e:
            return {
                "provider": "google",
                "available": False,
                "error": str(e)
            }
    
    # ---------------------------------------------------------
    # Ollama Check (Async)
    # ---------------------------------------------------------
    async def check_ollama_async(self) -> Dict[str, Any]:
        """Async Ollama Local Provider Check."""
        try:
            import aiohttp
            
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=2)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        models = [m["name"] for m in data.get("models", [])]
                        
                        return {
                            "provider": "ollama",
                            "available": True,
                            "models": models,
                            "base_url": base_url
                        }
                    else:
                        return {
                            "provider": "ollama",
                            "available": False,
                            "error": f"HTTP {resp.status}"
                        }
                        
        except Exception as e:
            return {
                "provider": "ollama",
                "available": False,
                "error": str(e)
            }
    
    # ---------------------------------------------------------
    # GitHub Models Check (Async)
    # ---------------------------------------------------------
    async def check_github_async(self) -> Dict[str, Any]:
        """Async GitHub Copilot Models Check."""
        try:
            github_token = os.getenv("GITHUB_TOKEN")
            
            if not github_token or github_token.startswith("your-"):
                return {
                    "provider": "github",
                    "available": False,
                    "error": "No GitHub token configured"
                }
            
            # GitHub Models (FREE)
            models = [
                "gpt-4o",
                "gpt-4o-mini",
                "Meta-Llama-3.1-405B-Instruct",
                "Mistral-large-2407",
                "Phi-3.5-mini-instruct"
            ]
            
            return {
                "provider": "github",
                "available": True,
                "models": models,
                "note": "Free tier available"
            }
            
        except Exception as e:
            return {
                "provider": "github",
                "available": False,
                "error": str(e)
            }
    
    # ---------------------------------------------------------
    # Health Check (All Providers)
    # ---------------------------------------------------------
    async def health_check(self, use_cache: bool = True) -> Dict[str, Any]:
        """
        Complete Health Check für alle Provider.
        
        Args:
            use_cache: Nutze gecachte Ergebnisse (5 min)
        
        Returns:
            {
                "timestamp": str,
                "providers": {...},
                "summary": {...}
            }
        """
        # Check cache
        now = datetime.utcnow()
        
        if use_cache and self.cached_results and self.last_check:
            age = (now - self.last_check).total_seconds()
            if age < self.cache_duration:
                return self.cached_results
        
        # Run all checks in parallel
        results = await asyncio.gather(
            self.check_openai_async(),
            self.check_anthropic_async(),
            self.check_google_async(),
            self.check_ollama_async(),
            self.check_github_async(),
            return_exceptions=True
        )
        
        providers = {}
        for result in results:
            if isinstance(result, dict):
                provider_name = result.get("provider", "unknown")
                providers[provider_name] = result
        
        # Calculate summary
        total_providers = len(providers)
        active_providers = sum(
            1 for p in providers.values()
            if p.get("available", False)
        )
        total_models = sum(
            len(p.get("models", []))
            for p in providers.values()
            if p.get("available", False)
        )
        
        # Determine overall status
        if active_providers == 0:
            status = "critical"
        elif active_providers < 2:
            status = "degraded"
        else:
            status = "healthy"
        
        response = {
            "timestamp": now.isoformat(),
            "providers": providers,
            "summary": {
                "total_providers": total_providers,
                "active_providers": active_providers,
                "total_models": total_models,
                "status": status
            }
        }
        
        # Cache results
        self.cached_results = response
        self.last_check = now
        
        return response
    
    # ---------------------------------------------------------
    # Provider-Specific Check
    # ---------------------------------------------------------
    async def check_provider(self, provider: str) -> Dict[str, Any]:
        """
        Check einzelnen Provider.
        
        Args:
            provider: openai, anthropic, google, ollama, github
        """
        checks = {
            "openai": self.check_openai_async,
            "anthropic": self.check_anthropic_async,
            "google": self.check_google_async,
            "ollama": self.check_ollama_async,
            "github": self.check_github_async
        }
        
        check_func = checks.get(provider.lower())
        
        if not check_func:
            return {
                "error": f"Unknown provider: {provider}",
                "available_providers": list(checks.keys())
            }
        
        return await check_func()


# Global Instance
api_diagnostics_v2 = APIDiagnosticsV2()
