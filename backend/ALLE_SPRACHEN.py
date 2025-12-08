"""
ALLE PROGRAMMIERSPRACHEN - KOMPLETTE LISTE
Für Agenten, Code Studio, Project Generator
"""

ALLE_SPRACHEN = {
    # ============ WEB FRONTEND ============
    "web_frontend": {
        "JavaScript": {
            "extensions": [".js", ".mjs", ".cjs"],
            "executor": "node",
            "package_manager": "npm",
            "frameworks": ["React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "Express"]
        },
        "TypeScript": {
            "extensions": [".ts", ".tsx"],
            "executor": "ts-node",
            "package_manager": "npm",
            "frameworks": ["React", "Vue", "Angular", "Next.js", "Nest.js"]
        },
        "HTML": {
            "extensions": [".html", ".htm"],
            "executor": "browser",
            "frameworks": ["Bootstrap", "Tailwind", "Material-UI"]
        },
        "CSS": {
            "extensions": [".css", ".scss", ".sass", ".less"],
            "preprocessors": ["Sass", "Less", "PostCSS"],
            "frameworks": ["Tailwind", "Bootstrap", "Bulma"]
        }
    },
    
    # ============ BACKEND ============
    "backend": {
        "Python": {
            "extensions": [".py"],
            "executor": "python3",
            "package_manager": "pip",
            "frameworks": ["FastAPI", "Django", "Flask", "Pyramid", "Tornado"]
        },
        "Node.js": {
            "extensions": [".js", ".ts"],
            "executor": "node",
            "package_manager": "npm",
            "frameworks": ["Express", "Nest.js", "Fastify", "Koa", "Hapi"]
        },
        "Go": {
            "extensions": [".go"],
            "executor": "go run",
            "package_manager": "go mod",
            "frameworks": ["Gin", "Echo", "Fiber", "Chi"]
        },
        "Rust": {
            "extensions": [".rs"],
            "executor": "cargo run",
            "package_manager": "cargo",
            "frameworks": ["Actix", "Rocket", "Axum", "Warp"]
        },
        "Java": {
            "extensions": [".java"],
            "executor": "java",
            "package_manager": "maven/gradle",
            "frameworks": ["Spring Boot", "Quarkus", "Micronaut", "Vert.x"]
        },
        "C#": {
            "extensions": [".cs"],
            "executor": "dotnet run",
            "package_manager": "nuget",
            "frameworks": ["ASP.NET Core", "Blazor", "SignalR"]
        },
        "PHP": {
            "extensions": [".php"],
            "executor": "php",
            "package_manager": "composer",
            "frameworks": ["Laravel", "Symfony", "CodeIgniter", "Slim"]
        },
        "Ruby": {
            "extensions": [".rb"],
            "executor": "ruby",
            "package_manager": "gem",
            "frameworks": ["Rails", "Sinatra", "Hanami"]
        }
    },
    
    # ============ MOBILE ============
    "mobile": {
        "Swift": {
            "extensions": [".swift"],
            "executor": "swift",
            "platform": "iOS/macOS",
            "frameworks": ["SwiftUI", "UIKit", "Combine"]
        },
        "Kotlin": {
            "extensions": [".kt", ".kts"],
            "executor": "kotlinc",
            "platform": "Android",
            "frameworks": ["Jetpack Compose", "Ktor"]
        },
        "Dart": {
            "extensions": [".dart"],
            "executor": "dart",
            "platform": "Cross-platform",
            "frameworks": ["Flutter"]
        },
        "Java": {
            "extensions": [".java"],
            "executor": "java",
            "platform": "Android",
            "frameworks": ["Android SDK", "Jetpack"]
        },
        "React Native": {
            "extensions": [".js", ".jsx", ".ts", ".tsx"],
            "executor": "node",
            "platform": "Cross-platform",
            "frameworks": ["Expo", "React Native"]
        }
    },
    
    # ============ SYSTEMS PROGRAMMING ============
    "systems": {
        "C": {
            "extensions": [".c", ".h"],
            "executor": "gcc",
            "use_cases": ["OS", "Embedded", "Drivers"]
        },
        "C++": {
            "extensions": [".cpp", ".cc", ".cxx", ".hpp"],
            "executor": "g++",
            "use_cases": ["Games", "Performance", "Systems"]
        },
        "Rust": {
            "extensions": [".rs"],
            "executor": "cargo",
            "use_cases": ["WebAssembly", "Systems", "Blockchain"]
        },
        "Assembly": {
            "extensions": [".asm", ".s"],
            "executor": "nasm/gas",
            "use_cases": ["Low-level", "Optimization"]
        }
    },
    
    # ============ DATA SCIENCE / ML ============
    "data_science": {
        "Python": {
            "extensions": [".py", ".ipynb"],
            "executor": "python3",
            "libraries": ["NumPy", "Pandas", "Scikit-learn", "TensorFlow", "PyTorch"]
        },
        "R": {
            "extensions": [".r", ".R"],
            "executor": "Rscript",
            "libraries": ["ggplot2", "dplyr", "tidyr", "caret"]
        },
        "Julia": {
            "extensions": [".jl"],
            "executor": "julia",
            "libraries": ["DataFrames", "Flux", "Plots"]
        },
        "MATLAB": {
            "extensions": [".m"],
            "executor": "matlab",
            "use_cases": ["Scientific Computing", "Signal Processing"]
        }
    },
    
    # ============ SCRIPTING ============
    "scripting": {
        "Bash": {
            "extensions": [".sh", ".bash"],
            "executor": "bash",
            "use_cases": ["Automation", "DevOps", "CI/CD"]
        },
        "PowerShell": {
            "extensions": [".ps1"],
            "executor": "pwsh",
            "platform": "Windows/Cross-platform"
        },
        "Perl": {
            "extensions": [".pl", ".pm"],
            "executor": "perl",
            "use_cases": ["Text Processing", "System Admin"]
        },
        "Lua": {
            "extensions": [".lua"],
            "executor": "lua",
            "use_cases": ["Game Scripting", "Embedded"]
        }
    },
    
    # ============ FUNCTIONAL ============
    "functional": {
        "Haskell": {
            "extensions": [".hs"],
            "executor": "ghc",
            "paradigm": "Pure Functional"
        },
        "Scala": {
            "extensions": [".scala"],
            "executor": "scala",
            "paradigm": "Functional + OOP"
        },
        "Elixir": {
            "extensions": [".ex", ".exs"],
            "executor": "elixir",
            "framework": "Phoenix"
        },
        "F#": {
            "extensions": [".fs"],
            "executor": "dotnet",
            "paradigm": "Functional-first"
        }
    },
    
    # ============ DATABASE ============
    "database": {
        "SQL": {
            "variants": ["PostgreSQL", "MySQL", "SQLite", "SQL Server"],
            "extensions": [".sql"]
        },
        "NoSQL": {
            "types": ["MongoDB", "Redis", "Cassandra", "DynamoDB"]
        }
    },
    
    # ============ MARKUP / CONFIG ============
    "markup": {
        "YAML": {
            "extensions": [".yml", ".yaml"],
            "use_cases": ["Config", "CI/CD", "Docker Compose"]
        },
        "JSON": {
            "extensions": [".json"],
            "use_cases": ["Config", "APIs", "Data"]
        },
        "XML": {
            "extensions": [".xml"],
            "use_cases": ["Config", "Data Exchange"]
        },
        "Markdown": {
            "extensions": [".md", ".markdown"],
            "use_cases": ["Documentation", "README"]
        },
        "TOML": {
            "extensions": [".toml"],
            "use_cases": ["Config", "Rust Projects"]
        }
    }
}


def get_all_languages():
    """Gibt alle unterstützten Sprachen zurück"""
    all_langs = []
    for category in ALLE_SPRACHEN.values():
        all_langs.extend(category.keys())
    return sorted(set(all_langs))


def get_language_by_extension(ext: str):
    """Findet Sprache anhand der Dateiendung"""
    for category in ALLE_SPRACHEN.values():
        for lang, info in category.items():
            if "extensions" in info and ext in info["extensions"]:
                return lang
    return None


def get_executor(language: str):
    """Gibt den Executor für eine Sprache zurück"""
    for category in ALLE_SPRACHEN.values():
        if language in category and "executor" in category[language]:
            return category[language]["executor"]
    return None


if __name__ == "__main__":
    print("🌍 ALLE UNTERSTÜTZTEN PROGRAMMIERSPRACHEN:")
    print("=" * 60)
    
    for category, langs in ALLE_SPRACHEN.items():
        print(f"\n📁 {category.upper().replace('_', ' ')}")
        for lang, info in langs.items():
            executor = info.get("executor", "N/A")
            print(f"  • {lang:20} → {executor}")
    
    print(f"\n✅ Gesamt: {len(get_all_languages())} Sprachen")
