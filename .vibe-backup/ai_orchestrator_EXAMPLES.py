# -------------------------------------------------------------
# VIBEAI – ORCHESTRATOR USAGE EXAMPLES
# -------------------------------------------------------------
"""
Complete usage examples for the Multi-Agent Orchestrator.

This file demonstrates how to use the orchestrator system
in different scenarios.
"""

import asyncio

from ai.orchestrator.memory.project_context import project_context
from ai.orchestrator.orchestrator import orchestrator


# =============================================================
# EXAMPLE 1: CREATE UI FROM NATURAL LANGUAGE
# =============================================================
async def example_create_ui():
    """Create UI from natural language prompt."""

    result = await orchestrator.handle(
        user_id="user123",
        project_id="proj456",
        prompt="Create a login screen with email, password and login button",
    )

    print("UI Generation Result:")
    print(result)

    # Result:
    # {
    #     "agent": "ui_agent",
    #     "intent": "ui",
    #     "result": {
    #         "screen": {
    #             "name": "LoginScreen",
    #             "title": "Login",
    #             "components": [...]
    #         }
    #     },
    #     "success": True
    # }


# =============================================================
# EXAMPLE 2: GENERATE CODE FROM UI
# =============================================================
async def example_generate_code():
    """Generate code from UI structure."""

    # First create UI
    await orchestrator.handle(user_id="user123", project_id="proj456", prompt="Create a profile screen")

    # Then generate code
    result = await orchestrator.handle(user_id="user123", project_id="proj456", prompt="Generate Flutter code")

    print("Code Generation Result:")
    print(result)

    # Result:
    # {
    #     "agent": "code_agent",
    #     "intent": "code",
    #     "result": {
    #         "code": "import 'package:flutter/material.dart';...",
    #         "framework": "flutter",
    #         "files": {"main.dart": "..."}
    #     },
    #     "success": True
    # }


# =============================================================
# EXAMPLE 3: COMPLETE WORKFLOW
# =============================================================
async def example_full_workflow():
    """Execute complete app creation workflow."""

    result = await orchestrator.execute_workflow(
        user_id="user123",
        project_id="proj456",
        workflow="full_cycle",
        params={"prompt": "Create a social media app with feed and profile"},
    )

    print("Workflow Result:")
    print(f"Workflow: {result['workflow']}")
    print(f"Steps: {result['steps']}")
    print(f"Success: {result['success']}")

    for i, step_result in enumerate(result["results"]):
        print(f"\nStep {i+1}: {step_result['agent']}")
        print(f"  Intent: {step_result['intent']}")
        print(f"  Success: {step_result['success']}")


# =============================================================
# EXAMPLE 4: CREATE PROJECT WITH TEMPLATE
# =============================================================
async def example_create_project():
    """Create project with template."""

    from ai.project_generator.generator import project_generator

    result = await project_generator.create_project(
        project_id="proj789",
        framework="flutter",
        project_name="my_social_app",
        options=None,
    )

    print("Project Created:")
    print(f"Path: {result['project_path']}")
    print(f"Framework: {result['framework']}")
    print(f"Files Created: {result['files_created']}")

    # Update context
    project_context.update(
        user_id="user123",
        project_id="proj789",
        updates={"framework": "flutter", "project_path": result["project_path"]},
    )


# =============================================================
# EXAMPLE 5: MULTI-FRAMEWORK CODE GENERATION
# =============================================================
async def example_multi_framework():
    """Generate code for all frameworks."""

    from ai.orchestrator.agents.code_agent import code_agent

    # Create UI first
    ui_result = await orchestrator.handle(user_id="user123", project_id="proj456", prompt="Create a settings screen")

    screen = ui_result["result"]["screen"]

    # Generate for all frameworks
    all_code = await code_agent.generate_all_frameworks(screen)

    print("Multi-Framework Code:")
    print(f"Flutter: {len(all_code['frameworks']['flutter']['code'])} chars")
    print(f"React: {len(all_code['frameworks']['react']['code'])} chars")
    print(f"Vue: {len(all_code['frameworks']['vue']['code'])} chars")
    print(f"HTML: {len(all_code['frameworks']['html']['code'])} chars")


# =============================================================
# EXAMPLE 6: PROJECT CONTEXT MANAGEMENT
# =============================================================
async def example_context_management():
    """Manage project context."""

    # Load context
    ctx = project_context.load("user123", "proj456")
    print("Current Context:")
    print(ctx)

    # Update context
    project_context.update("user123", "proj456", {"framework": "react", "custom_field": "value"})

    # Add screen
    screen = {"name": "HomeScreen", "title": "Home", "components": []}
    project_context.add_screen("user123", "proj456", screen)

    # Get last screen
    last = project_context.get_last_screen("user123", "proj456")
    print("Last Screen:")
    print(last)

    # List all user projects
    projects = project_context.list_projects("user123")
    print(f"Total Projects: {len(projects)}")


# =============================================================
# EXAMPLE 7: COMPLETE END-TO-END EXAMPLE
# =============================================================
async def example_end_to_end():
    """Complete end-to-end example: Prompt → APK Download."""

    user_id = "user123"
    project_id = "social_app_001"

    print("=== STEP 1: Create Project ===")
    from ai.project_generator.generator import project_generator

    project = await project_generator.create_project(
        project_id=project_id, framework="flutter", project_name="social_media_app"
    )
    print(f"✓ Project created at {project['project_path']}")

    # Update context
    project_context.set_project_path(user_id, project_id, project["project_path"])

    print("\n=== STEP 2: Generate UI ===")
    ui_result = await orchestrator.handle(
        user_id=user_id,
        project_id=project_id,
        prompt="Create a social media feed with posts, likes and comments",
    )
    print(f"✓ UI Generated: {ui_result['result']['screen']['name']}")

    print("\n=== STEP 3: Generate Code ===")
    code_result = await orchestrator.handle(user_id=user_id, project_id=project_id, prompt="Generate Flutter code")
    print(f"✓ Code Generated: {len(code_result['result']['code'])} chars")

    print("\n=== STEP 4: Start Preview ===")
    preview_result = await orchestrator.handle(user_id=user_id, project_id=project_id, prompt="Show preview")

    if preview_result["success"]:
        print(f"✓ Preview: {preview_result['result']['preview_url']}")

    print("\n=== STEP 5: Build APK ===")
    build_result = await orchestrator.handle(user_id=user_id, project_id=project_id, prompt="Build APK")

    if build_result["success"]:
        print(f"✓ Build Started: {build_result['result']['build_id']}")

    print("\n=== STEP 6: Deploy ===")
    deploy_result = await orchestrator.handle(user_id=user_id, project_id=project_id, prompt="Deploy app")

    if deploy_result["success"]:
        print(f"✓ Download: {deploy_result['result']['url']}")

    print("\n=== COMPLETE! ===")


# =============================================================
# RUN EXAMPLES
# =============================================================
if __name__ == "__main__":
    print("VibeAI Orchestrator Examples\n")

    # Run examples
    # asyncio.run(example_create_ui())
    # asyncio.run(example_generate_code())
    # asyncio.run(example_full_workflow())
    # asyncio.run(example_create_project())
    # asyncio.run(example_multi_framework())
    # asyncio.run(example_context_management())
    asyncio.run(example_end_to_end())
