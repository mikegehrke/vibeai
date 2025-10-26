# backend/composer.py
# Baut mehrere Module nach Architekturplan automatisch zusammen

from generator import generate_code
import os

def compose_project(plan: dict, output_dir: str):
    """
    Nimmt Architekturplan (dict) und generiert Code für jedes Modul.
    Speichert alles im output_dir.
    """
    os.makedirs(output_dir, exist_ok=True)
    generated_files = []

    for module in plan.get("modules", []):
        description = f"{plan.get('apptype', 'generic app')} with module {module}"
        module_output_dir = os.path.join(output_dir, module)
        os.makedirs(module_output_dir, exist_ok=True)
        files = generate_code(description, module_output_dir)
        generated_files.extend(files)

    return generated_files
