# -------------------------------------------------------------
# VIBEAI – CONFIG WRITER
# -------------------------------------------------------------
# Generiert Config-Dateien für verschiedene Frameworks:
# - package.json (Node.js, React Native, Next.js)
# - pubspec.yaml (Flutter)
# - requirements.txt (Python)
# - Package.swift (iOS)
# - build.gradle (Android)
# - tsconfig.json, next.config.js, etc.
# -------------------------------------------------------------

import json
from typing import Dict, Optional


class ConfigWriter:
    """Generiert projekt-spezifische Config-Dateien."""

    def generate_package_json(
        self,
        project_name: str,
        version: str = "1.0.0",
        description: str = "",
        framework: str = "react-native",
        dependencies: Optional[Dict[str, str]] = None,
    ) -> str:
        """Generiert package.json für Node.js-basierte Projekte."""

        default_deps = {
            "react-native": {
                "react": "^18.2.0",
                "react-native": "^0.72.0",
            },
            "nextjs": {
                "next": "^14.0.0",
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
            },
            "nodejs": {
                "express": "^4.18.0",
            },
        }

        config = {
            "name": project_name.lower().replace(" ", "-"),
            "version": version,
            "description": description or f"{project_name} application",
            "main": "index.js" if framework == "nodejs" else "index.ts",
            "scripts": self._get_scripts(framework),
            "dependencies": dependencies or default_deps.get(framework, {}),
            "devDependencies": self._get_dev_dependencies(framework),
        }

        return json.dumps(config, indent=2)

    def generate_pubspec_yaml(
        self,
        project_name: str,
        description: str = "",
        version: str = "1.0.0",
        dependencies: Optional[Dict[str, str]] = None,
    ) -> str:
        """Generiert pubspec.yaml für Flutter."""

        deps = dependencies or {
            "flutter": {"sdk": "flutter"},
            "cupertino_icons": "^1.0.2",
        }

        yaml_content = f"""name: {project_name.lower().replace(" ", "_")}
description: {description or f"A new Flutter project"}
version: {version}+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
"""

        for dep, ver in deps.items():
            if isinstance(ver, dict):
                yaml_content += f"  {dep}:\n"
                for k, v in ver.items():
                    yaml_content += f"    {k}: {v}\n"
            else:
                yaml_content += f"  {dep}: {ver}\n"

        yaml_content += """
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
"""

        return yaml_content

    def generate_requirements_txt(self, framework: str = "fastapi", dependencies: Optional[list] = None) -> str:
        """Generiert requirements.txt für Python."""

        default_deps = {
            "fastapi": [
                "fastapi==0.104.0",
                "uvicorn[standard]==0.24.0",
                "pydantic==2.5.0",
                "sqlalchemy==2.0.23",
            ],
            "django": [
                "Django==5.0.0",
                "djangorestframework==3.14.0",
            ],
            "flask": [
                "Flask==3.0.0",
                "flask-cors==4.0.0",
            ],
        }

        deps = dependencies or default_deps.get(framework, [])
        return "\n".join(deps)

    def generate_tsconfig_json(self, framework: str = "react-native") -> str:
        """Generiert tsconfig.json für TypeScript-Projekte."""

        configs = {
            "react-native": {
                "compilerOptions": {
                    "target": "esnext",
                    "module": "commonjs",
                    "lib": ["es2017"],
                    "allowJs": True,
                    "jsx": "react-native",
                    "noEmit": True,
                    "isolatedModules": True,
                    "strict": True,
                    "moduleResolution": "node",
                    "resolveJsonModule": True,
                    "allowSyntheticDefaultImports": True,
                    "esModuleInterop": True,
                    "skipLibCheck": True,
                },
                "exclude": ["node_modules"],
            },
            "nextjs": {
                "compilerOptions": {
                    "target": "es5",
                    "lib": ["dom", "dom.iterable", "esnext"],
                    "allowJs": True,
                    "skipLibCheck": True,
                    "strict": True,
                    "forceConsistentCasingInFileNames": True,
                    "noEmit": True,
                    "esModuleInterop": True,
                    "module": "esnext",
                    "moduleResolution": "bundler",
                    "resolveJsonModule": True,
                    "isolatedModules": True,
                    "jsx": "preserve",
                    "incremental": True,
                    "plugins": [{"name": "next"}],
                    "paths": {"@/*": ["./src/*"]},
                },
                "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
                "exclude": ["node_modules"],
            },
        }

        config = configs.get(framework, configs["react-native"])
        return json.dumps(config, indent=2)

    def generate_gitignore(self, framework: str) -> str:
        """Generiert .gitignore für verschiedene Frameworks."""

        common = """# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
"""

        framework_specific = {
            "flutter": """
# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
/build/

# Android related
**/android/**/gradle-wrapper.jar
**/android/.gradle
**/android/captures/
**/android/gradlew
**/android/gradlew.bat
**/android/local.properties
**/android/**/GeneratedPluginRegistrant.java

# iOS/XCode related
**/ios/**/*.mode1v3
**/ios/**/*.mode2v3
**/ios/**/*.moved-aside
**/ios/**/*.pbxuser
**/ios/**/*.perspectivev3
**/ios/**/*sync/
**/ios/**/.sconsign.dblite
**/ios/**/.tags*
**/ios/**/.vagrant/
**/ios/**/DerivedData/
**/ios/**/Icon?
**/ios/**/Pods/
**/ios/**/.symlinks/
**/ios/**/profile
**/ios/**/xcuserdata
**/ios/.generated/
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Flutter.podspec
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/ephemeral/
**/ios/Flutter/app.flx
**/ios/Flutter/app.zip
**/ios/Flutter/flutter_assets/
**/ios/Flutter/flutter_export_environment.sh
**/ios/ServiceDefinitions.json
**/ios/Runner/GeneratedPluginRegistrant.*
""",
            "python": """
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
""",
            "android": """
# Android
*.iml
.gradle
/local.properties
/.idea/
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
""",
        }

        return common + framework_specific.get(framework, "")

    def _get_scripts(self, framework: str) -> Dict[str, str]:
        """Generiert npm scripts basierend auf Framework."""
        scripts = {
            "react-native": {
                "android": "react-native run-android",
                "ios": "react-native run-ios",
                "start": "react-native start",
                "test": "jest",
                "lint": "eslint .",
            },
            "nextjs": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint",
            },
            "nodejs": {
                "start": "node index.js",
                "dev": "nodemon index.js",
                "test": "jest",
            },
        }
        return scripts.get(framework, {})

    def _get_dev_dependencies(self, framework: str) -> Dict[str, str]:
        """Generiert devDependencies basierend auf Framework."""
        dev_deps = {
            "react-native": {
                "@babel/core": "^7.20.0",
                "@babel/preset-env": "^7.20.0",
                "@babel/runtime": "^7.20.0",
                "@react-native/eslint-config": "^0.72.0",
                "@react-native/metro-config": "^0.72.0",
                "@tsconfig/react-native": "^3.0.0",
                "@types/react": "^18.0.24",
                "@types/react-test-renderer": "^18.0.0",
                "typescript": "^5.0.0",
            },
            "nextjs": {
                "typescript": "^5.0.0",
                "@types/node": "^20.0.0",
                "@types/react": "^18.0.0",
                "@types/react-dom": "^18.0.0",
                "eslint": "^8.0.0",
                "eslint-config-next": "14.0.0",
            },
            "nodejs": {"nodemon": "^3.0.0", "jest": "^29.0.0"},
        }
        return dev_deps.get(framework, {})


# Globale Instanz
config_writer = ConfigWriter()
