"""
VIBEAI - Navigation Manager

Automatische Navigation-Generierung für:
- Flutter (routes.dart)
- React (router.jsx)
- Next.js (App Router structure)
"""

import os
import json
from typing import List, Dict, Any


class NavigationManager:
    """Navigation Manager für automatische Route-Generierung"""

    def __init__(self):
        self.supported_frameworks = ["flutter", "react", "nextjs"]

    def create_flutter_routes(self, base_path: str, screens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Erstellt Flutter routes.dart"""
        try:
            imports = "\n".join([f"import '{s['name'].lower()}.dart';" for s in screens])
            routes_map = ",\n  ".join([f"'{s['name']}': (context) => {s['name']}Screen()" for s in screens])

            content = f"""import 'package:flutter/material.dart';
{imports}

Map<String, WidgetBuilder> appRoutes = {{
  {routes_map}
}};

class AppNavigator {{
  static void pushNamed(BuildContext context, String routeName) {{
    Navigator.pushNamed(context, routeName);
  }}
}}
"""
            routes_file = os.path.join(base_path, "lib", "routes.dart")
            os.makedirs(os.path.dirname(routes_file), exist_ok=True)
            
            with open(routes_file, "w", encoding="utf-8") as f:
                f.write(content)

            return {"success": True, "file_path": routes_file, "routes_count": len(screens), "framework": "flutter"}
        except Exception as e:
            return {"success": False, "error": str(e), "framework": "flutter"}

    def create_react_routes(self, base_path: str, screens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Erstellt React router.jsx"""
        try:
            imports = "\n".join([f"import {s['name']} from './components/{s['name']}';" for s in screens])
            routes_array = ",\n    ".join([
                "{ path: '" + s.get('path', '/' + s['name'].lower()) + "', element: <" + s['name'] + " /> }"
                for s in screens
            ])

            content = f"""import {{ createBrowserRouter, RouterProvider }} from 'react-router-dom';
{imports}

const router = createBrowserRouter([
  {{
    path: '/',
    element: <div>Root</div>,
    children: [
      {routes_array}
    ]
  }}
]);

export default function AppRouter() {{
  return <RouterProvider router={{router}} />;
}}
"""
            router_file = os.path.join(base_path, "src", "router.jsx")
            os.makedirs(os.path.dirname(router_file), exist_ok=True)
            
            with open(router_file, "w", encoding="utf-8") as f:
                f.write(content)

            return {"success": True, "file_path": router_file, "routes_count": len(screens), "framework": "react"}
        except Exception as e:
            return {"success": False, "error": str(e), "framework": "react"}

    def create_nextjs_routes(self, base_path: str, screens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Erstellt Next.js App Router Struktur"""
        try:
            created_routes = []

            for screen in screens:
                route_name = screen.get('path', screen['name']).lower().strip('/')
                route_dir = os.path.join(base_path, "app", route_name)
                page_file = os.path.join(route_dir, "page.jsx")
                os.makedirs(route_dir, exist_ok=True)

                content = f"""export default function {screen['name']}Page() {{
  return (
    <div className="container">
      <h1>{screen['name']}</h1>
    </div>
  );
}}
"""
                with open(page_file, "w", encoding="utf-8") as f:
                    f.write(content)

                created_routes.append({"route": f"/{route_name}", "file": page_file})

            nav_helper = os.path.join(base_path, "app", "navigation.js")
            nav_content = """'use client';
import { useRouter } from 'next/navigation';

export function useAppNavigation() {
  const router = useRouter();
  return {
    push: (path) => router.push(path),
    back: () => router.back()
  };
}
"""
            with open(nav_helper, "w", encoding="utf-8") as f:
                f.write(nav_content)

            created_routes.append({"route": "helper", "file": nav_helper})
            return {"success": True, "routes_created": created_routes, "routes_count": len(screens), "framework": "nextjs"}
        except Exception as e:
            return {"success": False, "error": str(e), "framework": "nextjs"}

    def generate_navigation(self, framework: str, base_path: str, screens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Universal Navigation Generator"""
        framework = framework.lower()
        
        if framework == "flutter":
            return self.create_flutter_routes(base_path, screens)
        elif framework == "react":
            return self.create_react_routes(base_path, screens)
        elif framework == "nextjs":
            return self.create_nextjs_routes(base_path, screens)
        else:
            return {"success": False, "error": f"Unsupported: {framework}", "supported": self.supported_frameworks}

    def extract_existing_routes(self, framework: str, base_path: str) -> Dict[str, Any]:
        """Extrahiert existierende Routes"""
        try:
            routes = []
            
            if framework == "flutter":
                lib_path = os.path.join(base_path, "lib")
                if os.path.exists(lib_path):
                    for file in os.listdir(lib_path):
                        if file.endswith("_screen.dart"):
                            name = file.replace("_screen.dart", "").capitalize()
                            routes.append({"name": name, "file": file})
            
            elif framework == "react":
                comp_path = os.path.join(base_path, "src", "components")
                if os.path.exists(comp_path):
                    for file in os.listdir(comp_path):
                        if file.endswith(".jsx") and file[0].isupper():
                            routes.append({"name": file.replace(".jsx", ""), "file": file})
            
            elif framework == "nextjs":
                app_path = os.path.join(base_path, "app")
                if os.path.exists(app_path):
                    for item in os.listdir(app_path):
                        item_path = os.path.join(app_path, item)
                        if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, "page.jsx")):
                            routes.append({"name": item.capitalize(), "path": f"/{item}"})
            
            return {"success": True, "routes": routes, "count": len(routes), "framework": framework}
        except Exception as e:
            return {"success": False, "error": str(e), "framework": framework}


navigation_manager = NavigationManager()
