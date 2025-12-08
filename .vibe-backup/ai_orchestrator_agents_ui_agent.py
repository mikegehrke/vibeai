# -------------------------------------------------------------
# VIBEAI – UI AGENT
# -------------------------------------------------------------
"""
UI Agent - Generates UI structures from natural language.

Capabilities:
- Create screens
- Suggest components
- Generate layouts
- Design patterns
"""

import json
import os
from typing import Dict, Optional

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class UIAgent:
    """Agent for UI generation."""

    async def create_ui(self, prompt: str, context: Optional[Dict] = None) -> Dict:
        """
        Generate UI structure from prompt.

        Returns:
        {
            "name": "LoginScreen",
            "title": "Login",
            "components": [
                {"type": "text", "value": "Welcome"},
                {"type": "input", "placeholder": "Email"},
                {"type": "button", "label": "Login"}
            ]
        }
        """
        system_prompt = """
You are a UI design expert. Generate UI component structures in JSON format.

Output structure:
{
  "name": "ScreenName",
  "title": "Screen Title",
  "components": [
    {"type": "text", "value": "Text content"},
    {"type": "input", "placeholder": "Placeholder"},
    {"type": "button", "label": "Button Label"},
    {"type": "image", "url": "https://..."},
    {"type": "container", "children": [...]}
  ]
}

Available component types:
- text: Display text
- input: Text input field
- button: Action button
- image: Image display
- container: Layout container
- list: Scrollable list
- card: Card component
"""

        framework = context.get("framework", "flutter") if context else "flutter"
        style = "Material Design" if framework == "flutter" else "Modern Web"

        user_prompt = f"""
Create a {style} UI for:

{prompt}

Context:
- Framework: {framework}
- Style: {style}
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            result = json.loads(response.choices[0].message.content)

            return {"success": True, "screen": result, "framework": framework}

        except Exception as e:
            # Fallback: Simple structure
            return {
                "success": True,
                "screen": {
                    "name": "GeneratedScreen",
                    "title": "Screen",
                    "components": [{"type": "text", "value": prompt}],
                },
                "framework": framework,
                "note": f"Fallback mode: {str(e)}",
            }

    async def suggest_improvements(self, screen: Dict) -> Dict:
        """Suggest UI improvements."""
        system_prompt = """
Analyze the UI structure and suggest improvements for:
- Usability
- Accessibility
- Visual hierarchy
- Component organization
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Improve this UI: {json.dumps(screen)}",
                    },
                ],
                response_format={"type": "json_object"},
            )

            return json.loads(response.choices[0].message.content)

        except Exception as e:
            return {"error": str(e)}


# Global instance
ui_agent = UIAgent()
