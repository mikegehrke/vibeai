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
    print(f"   Key: {api_key[:20]}...")
    
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