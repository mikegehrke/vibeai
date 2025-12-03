# -------------------------------------------------------------
# VIBEAI – PROJECT TREE GENERATOR
# -------------------------------------------------------------
# Generiert komplette Projektstrukturen für:
# - Flutter Apps
# - React Native Apps
# - Next.js Apps
# - Node.js Backend
# - Python FastAPI
# - Swift iOS Apps
# - Kotlin Android Apps
# -------------------------------------------------------------

import os
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class FileNode:
    """Repräsentiert eine Datei oder einen Ordner im Projektbaum."""
    name: str
    type: str  # "file" oder "folder"
    path: str
    content: Optional[str] = None
    children: Optional[List['FileNode']] = None


class ProjectTreeGenerator:
    """
    Generiert Projektbäume für verschiedene Frameworks/Plattformen.
    """

    # Templates für verschiedene Projekttypen
    TEMPLATES = {
        "flutter": {
            "lib/": ["main.dart", "app.dart"],
            "lib/screens/": ["home_screen.dart"],
            "lib/widgets/": ["custom_button.dart"],
            "lib/models/": ["user.dart"],
            "lib/services/": ["api_service.dart"],
            "assets/images/": [],
            "assets/fonts/": [],
            "test/": ["widget_test.dart"],
        },
        "react-native": {
            "src/": ["App.tsx", "index.ts"],
            "src/screens/": ["HomeScreen.tsx"],
            "src/components/": ["Button.tsx"],
            "src/navigation/": ["AppNavigator.tsx"],
            "src/services/": ["api.ts"],
            "src/utils/": ["helpers.ts"],
            "assets/": [],
            "__tests__/": ["App.test.tsx"],
        },
        "nextjs": {
            "app/": ["page.tsx", "layout.tsx"],
            "app/api/": ["route.ts"],
            "components/": ["Header.tsx", "Footer.tsx"],
            "lib/": ["utils.ts"],
            "public/": [],
            "styles/": ["globals.css"],
        },
        "nodejs": {
            "src/": ["index.js", "app.js"],
            "src/routes/": ["api.js"],
            "src/controllers/": ["userController.js"],
            "src/models/": ["User.js"],
            "src/middleware/": ["auth.js"],
            "src/utils/": ["helpers.js"],
            "tests/": ["api.test.js"],
        },
        "fastapi": {
            "app/": ["main.py", "__init__.py"],
            "app/routes/": ["api.py"],
            "app/models/": ["user.py"],
            "app/schemas/": ["user.py"],
            "app/core/": ["config.py", "security.py"],
            "app/db/": ["database.py"],
            "tests/": ["test_api.py"],
        },
        "ios-swift": {
            "Sources/": ["AppDelegate.swift", "SceneDelegate.swift"],
            "Sources/Views/": ["ContentView.swift"],
            "Sources/ViewModels/": ["HomeViewModel.swift"],
            "Sources/Models/": ["User.swift"],
            "Sources/Services/": ["NetworkService.swift"],
            "Resources/": ["Assets.xcassets"],
            "Tests/": ["AppTests.swift"],
        },
        "android-kotlin": {
            "app/src/main/java/com/app/": ["MainActivity.kt"],
            "app/src/main/java/com/app/ui/": ["HomeScreen.kt"],
            "app/src/main/java/com/app/viewmodel/": ["HomeViewModel.kt"],
            "app/src/main/java/com/app/data/": ["User.kt"],
            "app/src/main/java/com/app/network/": ["ApiService.kt"],
            "app/src/main/res/layout/": ["activity_main.xml"],
            "app/src/test/java/": ["ExampleUnitTest.kt"],
        },
    }

    def generate_tree(
        self,
        project_type: str,
        project_name: str,
        custom_structure: Optional[Dict] = None
    ) -> FileNode:
        """
        Generiert einen kompletten Projektbaum.
        
        Args:
            project_type: "flutter", "react-native", "nextjs", etc.
            project_name: Name des Projekts
            custom_structure: Optional benutzerdefinierte Struktur
        
        Returns:
            Root FileNode mit kompletter Baumstruktur
        """
        # Template holen oder custom structure nutzen
        structure = custom_structure or self.TEMPLATES.get(
            project_type, 
            {}
        )

        # Root-Node erstellen
        root = FileNode(
            name=project_name,
            type="folder",
            path=project_name,
            children=[]
        )

        # Struktur aufbauen
        for folder_path, files in structure.items():
            self._add_folder(root, folder_path, files)

        # Config-Dateien hinzufügen
        self._add_config_files(root, project_type)

        return root

    def _add_folder(
        self, 
        parent: FileNode, 
        folder_path: str, 
        files: List[str]
    ):
        """Fügt einen Ordner mit Dateien zum Baum hinzu."""
        # Pfad-Teile aufteilen
        parts = folder_path.rstrip("/").split("/")
        
        current = parent
        accumulated_path = parent.path

        # Ordnerstruktur erstellen
        for part in parts:
            accumulated_path = os.path.join(accumulated_path, part)
            
            # Prüfen ob Ordner bereits existiert
            existing = next(
                (child for child in (current.children or []) 
                 if child.name == part and child.type == "folder"),
                None
            )

            if existing:
                current = existing
            else:
                new_folder = FileNode(
                    name=part,
                    type="folder",
                    path=accumulated_path,
                    children=[]
                )
                if current.children is None:
                    current.children = []
                current.children.append(new_folder)
                current = new_folder

        # Dateien hinzufügen
        for file_name in files:
            file_node = FileNode(
                name=file_name,
                type="file",
                path=os.path.join(accumulated_path, file_name),
                content=""  # Wird später vom FileGenerator gefüllt
            )
            if current.children is None:
                current.children = []
            current.children.append(file_node)

    def _add_config_files(self, root: FileNode, project_type: str):
        """Fügt projekt-spezifische Config-Dateien hinzu."""
        config_files = {
            "flutter": ["pubspec.yaml", "analysis_options.yaml", ".gitignore"],
            "react-native": ["package.json", "tsconfig.json", ".gitignore"],
            "nextjs": ["package.json", "next.config.js", "tsconfig.json"],
            "nodejs": ["package.json", ".env.example", ".gitignore"],
            "fastapi": ["requirements.txt", ".env.example", ".gitignore"],
            "ios-swift": ["Package.swift", ".gitignore"],
            "android-kotlin": ["build.gradle", "settings.gradle", ".gitignore"],
        }

        files = config_files.get(project_type, [])
        
        for file_name in files:
            file_node = FileNode(
                name=file_name,
                type="file",
                path=os.path.join(root.path, file_name),
                content=""
            )
            if root.children is None:
                root.children = []
            root.children.append(file_node)

    def tree_to_dict(self, node: FileNode) -> Dict:
        """Konvertiert FileNode zu Dictionary für JSON-Output."""
        result = {
            "name": node.name,
            "type": node.type,
            "path": node.path,
        }

        if node.type == "file":
            result["content"] = node.content or ""
        
        if node.children:
            result["children"] = [
                self.tree_to_dict(child) for child in node.children
            ]

        return result

    def get_all_files(self, node: FileNode) -> List[FileNode]:
        """Extrahiert alle Datei-Nodes aus dem Baum."""
        files = []
        
        if node.type == "file":
            files.append(node)
        
        if node.children:
            for child in node.children:
                files.extend(self.get_all_files(child))
        
        return files

    def print_tree(self, node: FileNode, indent: int = 0):
        """Gibt den Baum formatiert in der Konsole aus."""
        prefix = "  " * indent
        icon = "📁" if node.type == "folder" else "📄"
        print(f"{prefix}{icon} {node.name}")
        
        if node.children:
            for child in node.children:
                self.print_tree(child, indent + 1)


# Globale Instanz
project_tree_generator = ProjectTreeGenerator()
