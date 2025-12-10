# -------------------------------------------------------------
# VIBEAI – BUILD COMPLETE APP ENDPOINT
# -------------------------------------------------------------
"""
Build COMPLETE production-ready app: code + tests + store assets + deployment
"""

import os
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["App Builder"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class BuildCompleteAppRequest(BaseModel):
    app_name: str
    description: str
    platform: str = "flutter"
    features: List[str] = []


@router.post("/build-complete-app")
async def build_complete_app(request: BuildCompleteAppRequest):
    """
    Build COMPLETE production-ready app: code + tests + store assets + deployment
    """
    try:
        # Check if OpenAI API key is available
        if not client.api_key:
            raise HTTPException(
                status_code=503,
                detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable to use the app builder."
            )
        
        description = request.description
        platform = request.platform
        features = request.features
        app_name = request.app_name

        print(f"🏗️ Building COMPLETE {platform} app: {app_name}")

        all_files = []
        steps = []

        # MEGA PROMPT - Generate everything at once - MINDESTENS 30-50 DATEIEN!
        mega_prompt = f"""Build a COMPLETE, PRODUCTION-READY {platform} app called "{app_name}":

CRITICAL: You MUST generate AT LEAST 30-50 files for a complete, professional app!

DESCRIPTION: {description}
FEATURES: {', '.join(features) if features else 'Standard app features'}

Generate EVERYTHING needed for a professional app:

DESCRIPTION: {description}
FEATURES: {', '.join(features)}

Generate EVERYTHING needed for a professional app:

1. PROJECT STRUCTURE & CORE FILES
   - Config files (pubspec.yaml/package.json/requirements.txt)
   - Main entry point
   - Navigation/routing
   - State management
   - Folder structure

2. FEATURE IMPLEMENTATION (MINDESTENS 15-20 SCREENS/KOMPONENTEN!)
   - ALL UI screens/pages (Home, Profile, Settings, List, Detail, etc.)
   - Business logic/ViewModels für JEDEN Screen
   - API services mit vollständiger Implementierung
   - Models & data classes für ALLE Entitäten
   - Local storage/State management
   - Error handling & Loading states
   - Navigation zwischen ALLEN Screens
   - Custom Widgets/Components (Buttons, Cards, Inputs, etc.)

3. TESTS
   - Unit tests
   - Widget/Component tests
   - Integration tests
   - Test utilities

4. STORE ASSETS (in /store/ folder)
   - APP_STORE_DESCRIPTION.md
   - GOOGLE_PLAY_DESCRIPTION.md
   - PRIVACY_POLICY.md
   - TERMS_OF_SERVICE.md
   - KEYWORDS.md

5. DEPLOYMENT (in /deployment/ folder)
   - .github/workflows/ci-cd.yml
   - fastlane/Fastfile (mobile)
   - vercel.json or netlify.toml (web)
   - .env.example
   - DEPLOYMENT_GUIDE.md

6. DOCUMENTATION
   - Complete README.md with setup instructions

Format EVERY file as:
```language path/to/filename
[COMPLETE CODE]
```

Make it PRODUCTION-READY with:
- Clean architecture
- Error handling
- Loading states
- Responsive design
- Best practices
- Store-ready
- Deploy-ready"""

        # Use streaming for better response quality
        # Use streaming for better UX - but we'll collect all chunks
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert app developer. Generate COMPLETE, PRODUCTION-READY applications.

CRITICAL REQUIREMENTS:
1. Generate EVERY file needed for a complete, working app
2. Include ALL dependencies in config files
3. Write COMPLETE code - no placeholders, no TODOs, no "// TODO" comments
4. Include proper error handling everywhere
5. Add helpful comments where needed
6. Follow best practices for the chosen platform
7. Make it immediately runnable - user should be able to run it right away
8. Include ALL necessary imports
9. Complete implementations - no stub functions

FORMAT: For each file, use:
```language path/to/file
[COMPLETE CODE - NO PLACEHOLDERS - FULLY FUNCTIONAL]
```

Generate AT LEAST 30-50 files for a complete, production-ready app including:
- All config files (package.json, pubspec.yaml, requirements.txt, etc.)
- Main entry point with complete implementation
- ALL screens/pages with full UI
- Models/data classes with all fields
- Services/APIs with complete logic
- State management fully implemented
- Navigation/routing complete
- Tests with actual test cases
- README with complete setup instructions
- Environment files (.env.example)
- Git configuration
- CI/CD configs if needed

IMPORTANT: Every file must be COMPLETE and WORKING. No placeholders!""",
                },
                {"role": "user", "content": mega_prompt},
            ],
            temperature=0.7,
            max_tokens=16384,  # Maximum supported by gpt-4o
        )
        
        print(f"📊 AI Response received: {len(response.choices[0].message.content)} characters")

        content = response.choices[0].message.content
        print(f"📊 AI Response: {len(content)} characters, {len(content.split('```'))} code blocks found")

        # Parse files from response
        files = _parse_files_from_response(content, platform)
        print(f"✅ Parsed {len(files)} files from response")
        
        # Warnung wenn zu wenige Dateien
        if len(files) < 20:
            print(f"⚠️  WARNING: Only {len(files)} files generated! Expected 30-50 files.")
            print("💡 The AI might not have generated enough files. Consider improving the prompt.")

        return {
            "success": True,
            "app_name": app_name,
            "platform": platform,
            "files": files,
            "files_count": len(files),
            "message": f"✅ Complete {platform} app generated with {len(files)} files!",
        }

    except Exception as e:
        print(f"❌ Build error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Build failed: {str(e)}")


def _parse_files_from_response(content: str, platform: str) -> List[Dict]:
    """Parse code blocks from AI response into file structure."""
    import re

    files = []
    current_file = None
    current_content = []

    # Pattern: ```language path/to/file
    pattern = r"```(\w+)\s+(.+?)\n"

    lines = content.split("\n")
    in_code_block = False

    for line in lines:
        # Start of code block
        if line.strip().startswith("```"):
            if in_code_block and current_file:
                # Save previous file
                files.append(
                    {
                        "path": current_file["path"],
                        "content": "\n".join(current_content),
                        "language": current_file["language"],
                    }
                )
                current_content = []
                current_file = None

            # Extract language and path
            match = re.match(r"```(\w+)\s+(.+?)$", line.strip())
            if match:
                language = match.group(1)
                path = match.group(2).strip()
                current_file = {"path": path, "language": language}
                in_code_block = True
                continue

        # End of code block
        if line.strip() == "```" and in_code_block:
            if current_file:
                files.append(
                    {
                        "path": current_file["path"],
                        "content": "\n".join(current_content),
                        "language": current_file["language"],
                    }
                )
                current_content = []
                current_file = None
            in_code_block = False
            continue

        # Content line
        if in_code_block and current_file:
            current_content.append(line)

    # Add last file if exists
    if current_file and current_content:
        files.append(
            {
                "path": current_file["path"],
                "content": "\n".join(current_content),
                "language": current_file["language"],
            }
        )

    return files


