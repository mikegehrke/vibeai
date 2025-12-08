# backend/model_checker.py
# Prüft verfügbare OpenAI-Modelle und Account-Status

import os

import openai
from dotenv import load_dotenv

load_dotenv()


def check_available_models():
    """
    Prüft alle verfügbaren OpenAI-Modelle für das aktuelle Konto
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("your-new"):
        return {"status": "error", "message": "Invalid API key"}

    openai.api_key = api_key

    try:
        models = openai.Model.list()

        # Kategorisiere Modelle
        coding_models = []
        chat_models = []
        other_models = []

        for model in models["data"]:
            model_id = model["id"]
            if any(keyword in model_id.lower() for keyword in ["gpt-4", "gpt-3.5", "gpt-5", "o1"]):
                if "code" in model_id.lower():
                    coding_models.append(model_id)
                else:
                    chat_models.append(model_id)
            else:
                other_models.append(model_id)

        return {
            "status": "success",
            "total_models": len(models["data"]),
            "coding_models": sorted(coding_models),
            "chat_models": sorted(chat_models),
            "other_models": sorted(other_models),
            "account_tier": determine_account_tier(chat_models),
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


def determine_account_tier(available_models):
    """
    Bestimmt Account-Tier basierend auf verfügbaren Modellen
    """
    if any("gpt-4" in model for model in available_models):
        if any("o1" in model for model in available_models):
            return "Tier 3+ (Premium)"
        elif any("gpt-4o" in model for model in available_models):
            return "Tier 2 (Advanced)"
        else:
            return "Tier 1 (Basic)"
    else:
        return "Free Tier"


def get_best_available_model(task_type="coding"):
    """
    Gibt das beste verfügbare Modell für eine bestimmte Aufgabe zurück
    """
    models_info = check_available_models()

    if models_info["status"] == "error":
        return "gpt-3.5-turbo"  # Fallback

    # Prioritätsliste für Coding
    if task_type == "coding":
        priority_models = [
            "o1",
            "o1-mini",
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo-16k",
            "gpt-3.5-turbo-1106",
            "gpt-3.5-turbo",
        ]
    else:
        priority_models = ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"]

    all_available = models_info["chat_models"] + models_info["coding_models"]

    # Finde das beste verfügbare Modell
    for model in priority_models:
        if model in all_available:
            return model

    return "gpt-3.5-turbo"  # Fallback


def test_model_access(model_name):
    """
    Testet ob ein spezifisches Modell verfügbar ist
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("your-new"):
        return {"status": "error", "message": "Invalid API key"}

    openai.api_key = api_key

    try:
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=10,
        )
        return {"status": "success", "model": model_name}
    except Exception as e:
        return {"status": "error", "model": model_name, "error": str(e)}


if __name__ == "__main__":
    print("🔍 Checking OpenAI Account Status...")
    result = check_available_models()

    if result["status"] == "success":
        print(f"\n✅ Account Tier: {result['account_tier']}")
        print(f"📊 Total Models: {result['total_models']}")
        print(f"\n🤖 Chat Models ({len(result['chat_models'])}):")
        for model in result["chat_models"]:
            print(f"   • {model}")

        print(f"\n🔧 Best Model for Coding: {get_best_available_model('coding')}")

        if not result["chat_models"] or len(result["chat_models"]) <= 3:
            print(f"\n💡 Upgrade-Empfehlung:")
            print(f"   - Gehe zu: https://platform.openai.com/settings/organization/billing")
            print(f"   - Lade $10+ Guthaben auf für GPT-4 Zugang")
            print(f"   - Oder upgrade zu Tier 1+ für erweiterte Modelle")
    else:
        print(f"❌ Error: {result['message']}")