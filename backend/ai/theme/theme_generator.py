# -------------------------------------------------------------
# VIBEAI – THEME GENERATOR
# -------------------------------------------------------------
import os
from typing import Any, Dict, List, Optional


class ThemeGenerator:
    """
    Generiert Theme-Konfigurationen für verschiedene Frameworks:
    - Light & Dark Mode
    - Custom Color Palettes
    - Flutter ThemeData
    - React Theme Provider
    - CSS Variables
    - Tailwind Config
    """

    def __init__(self):
        self.frameworks = ["flutter", "react", "css", "tailwind", "vuejs", "angular"]
        self.default_colors = {
            "primary": "#667eea",
            "secondary": "#764ba2",
            "success": "#10b981",
            "warning": "#f59e0b",
            "error": "#ef4444",
            "info": "#3b82f6",
        }

    def generate_theme(
        self, base_path: str, framework: str, options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generiert Theme-Dateien für Framework

        Args:
            base_path: Projekt-Pfad
            framework: flutter, react, css, tailwind, vuejs, angular
            options: Colors, modes, custom palettes

        Returns:
            Dict mit success, files, theme_data
        """
        options = options or {}
        files = []

        if framework == "flutter":
            files = self._generate_flutter_theme(base_path, options)
        elif framework == "react":
            files = self._generate_react_theme(base_path, options)
        elif framework == "css":
            files = self._generate_css_theme(base_path, options)
        elif framework == "tailwind":
            files = self._generate_tailwind_theme(base_path, options)
        elif framework == "vuejs":
            files = self._generate_vue_theme(base_path, options)
        elif framework == "angular":
            files = self._generate_angular_theme(base_path, options)
        else:
            raise ValueError(f"Unsupported framework: {framework}")

        return {
            "success": True,
            "framework": framework,
            "files": files,
            "theme_data": {
                "modes": ["light", "dark"],
                "colors": self._get_colors(options),
                "features": self._get_features(framework),
            },
        }

    def _get_colors(self, options: Dict[str, Any]) -> Dict[str, str]:
        """Gibt Color Palette zurück"""
        custom_colors = options.get("colors", {})
        return {**self.default_colors, **custom_colors}

    def _get_features(self, framework: str) -> List[str]:
        """Gibt Framework-spezifische Features zurück"""
        features = {
            "flutter": [
                "Light/Dark ThemeData",
                "Material Design",
                "Cupertino",
                "Custom Colors",
            ],
            "react": ["Context API", "Theme Provider", "CSS-in-JS", "Emotion/Styled"],
            "css": ["CSS Variables", "Media Queries", "Class Switching"],
            "tailwind": ["Dark Mode Class", "Custom Colors", "Extend Config"],
            "vuejs": ["Composables", "Provide/Inject", "CSS Variables"],
            "angular": ["Material Theming", "Custom Palettes", "SCSS Variables"],
        }
        return features.get(framework, [])

    # ========== FLUTTER THEME ==========

    def _generate_flutter_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert Flutter ThemeData"""
        files = []
        colors = self._get_colors(options)

        # 1. Theme Configuration
        theme_file = self._create_flutter_theme_config(base_path, colors)
        files.append(theme_file)

        # 2. Color Palette
        colors_file = self._create_flutter_colors(base_path, colors)
        files.append(colors_file)

        # 3. Theme Provider
        provider_file = self._create_flutter_theme_provider(base_path)
        files.append(provider_file)

        return files

    def _create_flutter_theme_config(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt Flutter theme.dart"""
        primary = colors.get("primary", "#667eea")

        content = f"""import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {{
  // Light Theme
  static ThemeData lightTheme() {{
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.error,
        surface: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }}

  // Dark Theme
  static ThemeData darkTheme() {{
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: Color(0xFF121212),
      colorScheme: ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        error: AppColors.error,
        surface: Color(0xFF1E1E1E),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Color(0xFF1E1E1E),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardTheme(
        color: Color(0xFF1E1E1E),
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }}
}}
"""

        theme_path = f"{base_path}/lib/theme/theme.dart"
        os.makedirs(os.path.dirname(theme_path), exist_ok=True)
        with open(theme_path, "w", encoding="utf-8") as f:
            f.write(content)

        return theme_path

    def _create_flutter_colors(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt Flutter app_colors.dart"""

        color_defs = []
        for name, hex_color in colors.items():
            # Convert hex to Flutter Color
            color_defs.append(f"  static const Color {name} = Color(0xFF{hex_color.lstrip('#')});")

        content = f"""import 'package:flutter/material.dart';

class AppColors {{
{chr(10).join(color_defs)}

  // Additional colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surface = Color(0xFFF5F5F5);
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color textPrimary = Color(0xFF000000);
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textSecondaryDark = Color(0xFFAAAAAA);
}}
"""

        colors_path = f"{base_path}/lib/theme/app_colors.dart"
        os.makedirs(os.path.dirname(colors_path), exist_ok=True)
        with open(colors_path, "w", encoding="utf-8") as f:
            f.write(content)

        return colors_path

    def _create_flutter_theme_provider(self, base_path: str) -> str:
        """Erstellt Flutter theme_provider.dart"""

        content = """import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  bool get isDarkMode => _themeMode == ThemeMode.dark;

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }

  void toggleTheme() {
    if (_themeMode == ThemeMode.light) {
      _themeMode = ThemeMode.dark;
    } else {
      _themeMode = ThemeMode.light;
    }
    notifyListeners();
  }
}
"""

        provider_path = f"{base_path}/lib/theme/theme_provider.dart"
        os.makedirs(os.path.dirname(provider_path), exist_ok=True)
        with open(provider_path, "w", encoding="utf-8") as f:
            f.write(content)

        return provider_path

    # ========== REACT THEME ==========

    def _generate_react_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert React Theme Provider"""
        files = []
        colors = self._get_colors(options)

        # 1. Theme Configuration
        theme_file = self._create_react_theme_config(base_path, colors)
        files.append(theme_file)

        # 2. Theme Context
        context_file = self._create_react_theme_context(base_path)
        files.append(context_file)

        # 3. Theme Hook
        hook_file = self._create_react_theme_hook(base_path)
        files.append(hook_file)

        return files

    def _create_react_theme_config(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt React theme.js"""

        # Convert colors to JS object
        light_colors = {k: v for k, v in colors.items()}
        dark_colors = {k: self._darken_color(v) if k not in ["primary", "secondary"] else v for k, v in colors.items()}

        content = f"""// Theme Configuration
export const lightTheme = {{
  mode: 'light',
  colors: {self._dict_to_js(light_colors)},
  background: '#ffffff',
  surface: '#f5f5f5',
  text: {{
    primary: '#000000',
    secondary: '#666666',
  }},
  border: '#e0e0e0',
  shadow: 'rgba(0, 0, 0, 0.1)',
}};

export const darkTheme = {{
  mode: 'dark',
  colors: {self._dict_to_js(dark_colors)},
  background: '#121212',
  surface: '#1e1e1e',
  text: {{
    primary: '#ffffff',
    secondary: '#aaaaaa',
  }},
  border: '#333333',
  shadow: 'rgba(0, 0, 0, 0.5)',
}};

export const themes = {{
  light: lightTheme,
  dark: darkTheme,
}};
"""

        theme_path = f"{base_path}/src/theme/theme.js"
        os.makedirs(os.path.dirname(theme_path), exist_ok=True)
        with open(theme_path, "w", encoding="utf-8") as f:
            f.write(content)

        return theme_path

    def _create_react_theme_context(self, base_path: str) -> str:
        """Erstellt React ThemeContext.jsx"""

        content = """import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from './theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? darkTheme : lightTheme;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme.mode);
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev.mode === 'light' ? darkTheme : lightTheme));
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme.mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
"""

        context_path = f"{base_path}/src/theme/ThemeContext.jsx"
        os.makedirs(os.path.dirname(context_path), exist_ok=True)
        with open(context_path, "w", encoding="utf-8") as f:
            f.write(content)

        return context_path

    def _create_react_theme_hook(self, base_path: str) -> str:
        """Erstellt React useTheme.js Hook"""

        content = """import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
"""

        hook_path = f"{base_path}/src/theme/useTheme.js"
        os.makedirs(os.path.dirname(hook_path), exist_ok=True)
        with open(hook_path, "w", encoding="utf-8") as f:
            f.write(content)

        return hook_path

    # ========== CSS THEME ==========

    def _generate_css_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert CSS Variables Theme"""
        files = []
        colors = self._get_colors(options)

        # 1. CSS Variables
        css_file = self._create_css_variables(base_path, colors)
        files.append(css_file)

        # 2. Theme Switcher JS
        js_file = self._create_css_theme_switcher(base_path)
        files.append(js_file)

        return files

    def _create_css_variables(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt theme.css mit CSS Variables"""

        color_vars_light = [f"  --color-{name}: {color};" for name, color in colors.items()]
        color_vars_dark = [
            f"  --color-{name}: {self._darken_color(color) if name not in ['primary', 'secondary'] else color};"
            for name, color in colors.items()
        ]

        content = f"""/* Theme CSS Variables */

:root {{
{chr(10).join(color_vars_light)}

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;

  /* Text */
  --text-primary: #000000;
  --text-secondary: #666666;

  /* Border */
  --border-color: #e0e0e0;

  /* Shadow */
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}}

[data-theme="dark"] {{
{chr(10).join(color_vars_dark)}

  /* Background */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;

  /* Border */
  --border-color: #333333;

  /* Shadow */
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}}

/* Apply theme variables */
body {{
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}}
"""

        css_path = f"{base_path}/styles/theme.css"
        os.makedirs(os.path.dirname(css_path), exist_ok=True)
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(content)

        return css_path

    def _create_css_theme_switcher(self, base_path: str) -> str:
        """Erstellt theme-switcher.js"""

        content = """// Theme Switcher
class ThemeSwitcher {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  getTheme() {
    return this.theme;
  }
}

// Export instance
const themeSwitcher = new ThemeSwitcher();
export default themeSwitcher;
"""

        js_path = f"{base_path}/scripts/theme-switcher.js"
        os.makedirs(os.path.dirname(js_path), exist_ok=True)
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(content)

        return js_path

    # ========== TAILWIND THEME ==========

    def _generate_tailwind_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert Tailwind Config"""
        files = []
        colors = self._get_colors(options)

        config_file = self._create_tailwind_config(base_path, colors)
        files.append(config_file)

        return files

    def _create_tailwind_config(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt tailwind.config.js"""

        content = f"""/** @type {{import('tailwindcss').Config}} */
module.exports = {{
  darkMode: 'class',
  content: [
    './src/**/*.{{js,jsx,ts,tsx}}',
    './public/index.html',
  ],
  theme: {{
    extend: {{
      colors: {self._dict_to_js(colors, indent=8)},
    }},
  }},
  plugins: [],
}};
"""

        config_path = f"{base_path}/tailwind.config.js"
        os.makedirs(
            os.path.dirname(config_path) if os.path.dirname(config_path) else base_path,
            exist_ok=True,
        )
        with open(config_path, "w", encoding="utf-8") as f:
            f.write(content)

        return config_path

    # ========== VUE THEME ==========

    def _generate_vue_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert Vue Theme Composable"""
        files = []
        colors = self._get_colors(options)

        composable_file = self._create_vue_theme_composable(base_path, colors)
        files.append(composable_file)

        return files

    def _create_vue_theme_composable(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt useTheme.js Composable"""

        content = f"""import {{ ref, computed, watch }} from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');

const lightTheme = {self._dict_to_js({'colors': colors, 'background': '#ffffff', 'text': '#000000'})};

const darkTheme = {self._dict_to_js({'colors': colors, 'background': '#121212', 'text': '#ffffff'})};

export function useTheme() {{
  const currentTheme = computed(() =>
    theme.value === 'light' ? lightTheme : darkTheme
  );

  const toggleTheme = () => {{
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }};

  watch(theme, (newTheme) => {{
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }}, {{ immediate: true }});

  return {{
    theme: currentTheme,
    isDark: computed(() => theme.value === 'dark'),
    toggleTheme,
  }};
}}
"""

        composable_path = f"{base_path}/src/composables/useTheme.js"
        os.makedirs(os.path.dirname(composable_path), exist_ok=True)
        with open(composable_path, "w", encoding="utf-8") as f:
            f.write(content)

        return composable_path

    # ========== ANGULAR THEME ==========

    def _generate_angular_theme(self, base_path: str, options: Dict[str, Any]) -> List[str]:
        """Generiert Angular Material Theme"""
        files = []
        colors = self._get_colors(options)

        theme_file = self._create_angular_theme_scss(base_path, colors)
        files.append(theme_file)

        return files

    def _create_angular_theme_scss(self, base_path: str, colors: Dict[str, str]) -> str:
        """Erstellt Angular theme.scss"""

        primary = colors.get("primary", "#667eea")

        content = f"""@use '@angular/material' as mat;

@include mat.core();

$app-primary: mat.define-palette(mat.$indigo-palette);
$app-accent: mat.define-palette(mat.$pink-palette);
$app-warn: mat.define-palette(mat.$red-palette);

$app-theme: mat.define-light-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warn: $app-warn,
  )
));

@include mat.all-component-themes($app-theme);

$app-dark-theme: mat.define-dark-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warn: $app-warn,
  )
));

.dark-theme {{
  @include mat.all-component-colors($app-dark-theme);
}}
"""

        theme_path = f"{base_path}/src/theme.scss"
        os.makedirs(os.path.dirname(theme_path), exist_ok=True)
        with open(theme_path, "w", encoding="utf-8") as f:
            f.write(content)

        return theme_path

    # ========== HELPER METHODS ==========

    def _darken_color(self, hex_color: str) -> str:
        """Darkens a hex color (simple implementation)"""
        # Keep original for now - could implement actual darkening
        return hex_color

    def _dict_to_js(self, d: Dict, indent: int = 0) -> str:
        """Converts Python dict to JS object string"""
        import json

        js_str = json.dumps(d, indent=2)
        if indent > 0:
            lines = js_str.split("\n")
            indented = [" " * indent + line if i > 0 else line for i, line in enumerate(lines)]
            return "\n".join(indented)
        return js_str


# Singleton instance
theme_generator = ThemeGenerator()