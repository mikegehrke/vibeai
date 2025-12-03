# -------------------------------------------------------------
# VIBEAI – AI NAVIGATION FLOW GENERATOR
# -------------------------------------------------------------
import os
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, asdict


@dataclass
class Screen:
    """Screen definition"""
    name: str
    route: str
    requires_auth: bool = False
    params: List[str] = None
    type: str = "fullscreen"  # fullscreen, modal, bottom_sheet
    
    def __post_init__(self):
        if self.params is None:
            self.params = []


@dataclass
class NavigationEdge:
    """Navigation edge between screens"""
    from_screen: str
    to_screen: str
    action: str = "push"  # push, replace, pop, modal
    condition: Optional[str] = None
    params_required: List[str] = None
    
    def __post_init__(self):
        if self.params_required is None:
            self.params_required = []


class FlowGenerator:
    """
    AI Navigation Flow Generator
    
    Erzeugt komplette Navigation Flows:
    - Screen Definitions
    - Route Maps
    - Navigation Guards
    - Parameter Validation
    - Flutter Navigator 2.0
    - React Router
    - Next.js App Router
    """

    def __init__(self):
        self.frameworks = ["flutter", "react", "nextjs", "vue", "react_native"]
        self.flow_templates = {
            "auth": self._create_auth_flow,
            "ecommerce": self._create_ecommerce_flow,
            "onboarding": self._create_onboarding_flow,
            "social": self._create_social_flow,
            "dashboard": self._create_dashboard_flow
        }

    def generate_navigation_flow(
        self,
        base_path: str,
        framework: str,
        flow_type: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generiert kompletten Navigation Flow
        
        Args:
            base_path: Projekt-Pfad
            framework: flutter, react, nextjs, vue, react_native
            flow_type: auth, ecommerce, onboarding, social, dashboard
            options: Custom screens, guards, params
        
        Returns:
            Dict mit success, files, flow_data
        """
        options = options or {}
        
        # Generate flow structure
        flow_data = self._generate_flow_structure(flow_type, options)
        
        # Generate framework-specific navigation
        files = []
        if framework == "flutter":
            files = self._generate_flutter_navigation(base_path, flow_data)
        elif framework == "react":
            files = self._generate_react_navigation(base_path, flow_data)
        elif framework == "nextjs":
            files = self._generate_nextjs_navigation(base_path, flow_data)
        elif framework == "vue":
            files = self._generate_vue_navigation(base_path, flow_data)
        elif framework == "react_native":
            files = self._generate_react_native_navigation(base_path, flow_data)
        else:
            raise ValueError(f"Unsupported framework: {framework}")
        
        return {
            "success": True,
            "framework": framework,
            "flow_type": flow_type,
            "files": files,
            "flow_data": flow_data,
            "screens": len(flow_data["screens"]),
            "edges": len(flow_data["edges"])
        }

    def analyze_flow(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analysiert Navigation Flow auf Probleme
        """
        issues = []
        warnings = []
        
        screens = {s["name"]: s for s in flow_data.get("screens", [])}
        edges = flow_data.get("edges", [])
        
        # Check for unreachable screens
        reachable = set()
        for edge in edges:
            reachable.add(edge["to_screen"])
        
        for screen_name in screens:
            if screen_name not in reachable and screen_name != flow_data.get("start_screen"):
                warnings.append(f"Screen '{screen_name}' is unreachable")
        
        # Check for missing screens in edges
        for edge in edges:
            if edge["from_screen"] not in screens:
                issues.append(f"Edge references missing screen: {edge['from_screen']}")
            if edge["to_screen"] not in screens:
                issues.append(f"Edge references missing screen: {edge['to_screen']}")
        
        # Check for circular navigation without exit
        # (simplified check)
        
        # Check auth guards
        for edge in edges:
            from_s = screens.get(edge["from_screen"], {})
            to_s = screens.get(edge["to_screen"], {})
            
            if not from_s.get("requires_auth") and to_s.get("requires_auth"):
                if not edge.get("condition"):
                    warnings.append(
                        f"Navigation from {edge['from_screen']} to {edge['to_screen']} "
                        f"requires auth but has no guard"
                    )
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "metrics": {
                "total_screens": len(screens),
                "total_edges": len(edges),
                "auth_screens": sum(1 for s in screens.values() if s.get("requires_auth")),
                "modal_screens": sum(1 for s in screens.values() if s.get("type") == "modal")
            }
        }

    def _generate_flow_structure(
        self,
        flow_type: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Flow Structure"""
        
        if flow_type in self.flow_templates:
            return self.flow_templates[flow_type](options)
        else:
            # Custom flow
            return options.get("custom_flow", self._create_basic_flow(options))

    # ========== FLOW TEMPLATES ==========

    def _create_auth_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Auth Flow: Login → Register → Forgot Password → Home"""
        
        screens = [
            {"name": "SplashScreen", "route": "/", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "LoginScreen", "route": "/login", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "RegisterScreen", "route": "/register", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "ForgotPasswordScreen", "route": "/forgot-password", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "HomeScreen", "route": "/home", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "ProfileScreen", "route": "/profile", "requires_auth": True, "params": [], "type": "fullscreen"}
        ]
        
        edges = [
            {"from_screen": "SplashScreen", "to_screen": "LoginScreen", "action": "replace", "condition": "!isAuthenticated"},
            {"from_screen": "SplashScreen", "to_screen": "HomeScreen", "action": "replace", "condition": "isAuthenticated"},
            {"from_screen": "LoginScreen", "to_screen": "RegisterScreen", "action": "push"},
            {"from_screen": "LoginScreen", "to_screen": "ForgotPasswordScreen", "action": "push"},
            {"from_screen": "LoginScreen", "to_screen": "HomeScreen", "action": "replace", "condition": "onLoginSuccess"},
            {"from_screen": "RegisterScreen", "to_screen": "HomeScreen", "action": "replace", "condition": "onRegisterSuccess"},
            {"from_screen": "HomeScreen", "to_screen": "ProfileScreen", "action": "push"},
            {"from_screen": "ProfileScreen", "to_screen": "LoginScreen", "action": "replace", "condition": "onLogout"}
        ]
        
        return {
            "type": "auth",
            "start_screen": "SplashScreen",
            "screens": screens,
            "edges": edges,
            "guards": ["isAuthenticated"]
        }

    def _create_ecommerce_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """E-Commerce Flow"""
        
        screens = [
            {"name": "HomeScreen", "route": "/", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "ProductListScreen", "route": "/products", "requires_auth": False, "params": ["category"], "type": "fullscreen"},
            {"name": "ProductDetailScreen", "route": "/product/:id", "requires_auth": False, "params": ["id"], "type": "fullscreen"},
            {"name": "CartScreen", "route": "/cart", "requires_auth": False, "params": [], "type": "fullscreen"},
            {"name": "CheckoutScreen", "route": "/checkout", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "AddressScreen", "route": "/checkout/address", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "PaymentScreen", "route": "/checkout/payment", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "OrderSuccessScreen", "route": "/order/success", "requires_auth": True, "params": ["orderId"], "type": "fullscreen"}
        ]
        
        edges = [
            {"from_screen": "HomeScreen", "to_screen": "ProductListScreen", "action": "push"},
            {"from_screen": "ProductListScreen", "to_screen": "ProductDetailScreen", "action": "push", "params_required": ["id"]},
            {"from_screen": "ProductDetailScreen", "to_screen": "CartScreen", "action": "push"},
            {"from_screen": "CartScreen", "to_screen": "CheckoutScreen", "action": "push"},
            {"from_screen": "CheckoutScreen", "to_screen": "AddressScreen", "action": "push"},
            {"from_screen": "AddressScreen", "to_screen": "PaymentScreen", "action": "push"},
            {"from_screen": "PaymentScreen", "to_screen": "OrderSuccessScreen", "action": "replace", "params_required": ["orderId"]},
            {"from_screen": "OrderSuccessScreen", "to_screen": "HomeScreen", "action": "replace"}
        ]
        
        return {
            "type": "ecommerce",
            "start_screen": "HomeScreen",
            "screens": screens,
            "edges": edges,
            "guards": ["isAuthenticated"]
        }

    def _create_onboarding_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Onboarding Flow"""
        
        num_steps = options.get("onboarding_steps", 3)
        
        screens = [{"name": "SplashScreen", "route": "/", "requires_auth": False, "params": [], "type": "fullscreen"}]
        
        for i in range(1, num_steps + 1):
            screens.append({
                "name": f"OnboardingStep{i}Screen",
                "route": f"/onboarding/{i}",
                "requires_auth": False,
                "params": [],
                "type": "fullscreen"
            })
        
        screens.append({"name": "HomeScreen", "route": "/home", "requires_auth": False, "params": [], "type": "fullscreen"})
        
        edges = [{"from_screen": "SplashScreen", "to_screen": "OnboardingStep1Screen", "action": "replace"}]
        
        for i in range(1, num_steps):
            edges.append({
                "from_screen": f"OnboardingStep{i}Screen",
                "to_screen": f"OnboardingStep{i+1}Screen",
                "action": "push"
            })
        
        edges.append({
            "from_screen": f"OnboardingStep{num_steps}Screen",
            "to_screen": "HomeScreen",
            "action": "replace"
        })
        
        return {
            "type": "onboarding",
            "start_screen": "SplashScreen",
            "screens": screens,
            "edges": edges,
            "guards": []
        }

    def _create_social_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Social Media Flow"""
        
        screens = [
            {"name": "FeedScreen", "route": "/", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "ProfileScreen", "route": "/profile/:userId", "requires_auth": True, "params": ["userId"], "type": "fullscreen"},
            {"name": "CreatePostScreen", "route": "/create", "requires_auth": True, "params": [], "type": "modal"},
            {"name": "PostDetailScreen", "route": "/post/:postId", "requires_auth": True, "params": ["postId"], "type": "fullscreen"},
            {"name": "SearchScreen", "route": "/search", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "NotificationsScreen", "route": "/notifications", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "MessagesScreen", "route": "/messages", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "ChatScreen", "route": "/chat/:userId", "requires_auth": True, "params": ["userId"], "type": "fullscreen"}
        ]
        
        edges = [
            {"from_screen": "FeedScreen", "to_screen": "ProfileScreen", "action": "push", "params_required": ["userId"]},
            {"from_screen": "FeedScreen", "to_screen": "CreatePostScreen", "action": "modal"},
            {"from_screen": "FeedScreen", "to_screen": "PostDetailScreen", "action": "push", "params_required": ["postId"]},
            {"from_screen": "FeedScreen", "to_screen": "SearchScreen", "action": "push"},
            {"from_screen": "FeedScreen", "to_screen": "NotificationsScreen", "action": "push"},
            {"from_screen": "FeedScreen", "to_screen": "MessagesScreen", "action": "push"},
            {"from_screen": "MessagesScreen", "to_screen": "ChatScreen", "action": "push", "params_required": ["userId"]}
        ]
        
        return {
            "type": "social",
            "start_screen": "FeedScreen",
            "screens": screens,
            "edges": edges,
            "guards": ["isAuthenticated"]
        }

    def _create_dashboard_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Dashboard Flow"""
        
        screens = [
            {"name": "DashboardScreen", "route": "/", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "AnalyticsScreen", "route": "/analytics", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "SettingsScreen", "route": "/settings", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "UsersScreen", "route": "/users", "requires_auth": True, "params": [], "type": "fullscreen"},
            {"name": "UserDetailScreen", "route": "/users/:id", "requires_auth": True, "params": ["id"], "type": "fullscreen"}
        ]
        
        edges = [
            {"from_screen": "DashboardScreen", "to_screen": "AnalyticsScreen", "action": "push"},
            {"from_screen": "DashboardScreen", "to_screen": "SettingsScreen", "action": "push"},
            {"from_screen": "DashboardScreen", "to_screen": "UsersScreen", "action": "push"},
            {"from_screen": "UsersScreen", "to_screen": "UserDetailScreen", "action": "push", "params_required": ["id"]}
        ]
        
        return {
            "type": "dashboard",
            "start_screen": "DashboardScreen",
            "screens": screens,
            "edges": edges,
            "guards": ["isAuthenticated"]
        }

    def _create_basic_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Basic Flow Template"""
        return {
            "type": "basic",
            "start_screen": "HomeScreen",
            "screens": [
                {"name": "HomeScreen", "route": "/", "requires_auth": False, "params": [], "type": "fullscreen"}
            ],
            "edges": [],
            "guards": []
        }

    # ========== FLUTTER NAVIGATION ==========

    def _generate_flutter_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Flutter Navigation"""
        files = []
        
        # 1. Routes file
        routes_file = self._create_flutter_routes(base_path, flow_data)
        files.append(routes_file)
        
        # 2. Navigation guards
        guards_file = self._create_flutter_guards(base_path, flow_data)
        files.append(guards_file)
        
        # 3. Router config
        router_file = self._create_flutter_router(base_path, flow_data)
        files.append(router_file)
        
        return files

    def _create_flutter_routes(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Flutter routes.dart"""
        
        screens = flow_data["screens"]
        
        route_defs = []
        for screen in screens:
            screen_name = screen["name"]
            route_path = screen["route"]
            params = screen.get("params", [])
            
            param_str = ", ".join([f"required String {p}" for p in params])
            if param_str:
                param_str = f", {param_str}"
            
            route_defs.append(f"""
  static Route<dynamic> {screen_name.lower()}({{}}{param_str}) {{
    return MaterialPageRoute(
      builder: (_) => {screen_name}({", ".join([f"{p}: {p}" for p in params])}),
      settings: RouteSettings(name: '{route_path}'),
    );
  }}""")
        
        content = f"""import 'package:flutter/material.dart';

// Screen imports would go here
// import 'screens/home_screen.dart';
// import 'screens/login_screen.dart';
// etc.

class AppRoutes {{
  // Route names
{chr(10).join([f"  static const String {s['name'].lower()} = '{s['route']}';" for s in screens])}

  // Route generators
{''.join(route_defs)}

  // Main route generator
  static Route<dynamic> generateRoute(RouteSettings settings) {{
    switch (settings.name) {{
{chr(10).join([f"      case {s['name'].lower()}:" + chr(10) + f"        return {s['name'].lower()}();" for s in screens])}
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Route not found: ${{settings.name}}')),
          ),
        );
    }}
  }}
}}
"""
        
        routes_path = f"{base_path}/lib/navigation/routes.dart"
        os.makedirs(os.path.dirname(routes_path), exist_ok=True)
        with open(routes_path, "w") as f:
            f.write(content)
        
        return routes_path

    def _create_flutter_guards(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Flutter navigation_guards.dart"""
        
        content = """import 'package:flutter/material.dart';

class NavigationGuard {
  static bool isAuthenticated = false;

  static Future<bool> canNavigate(String routeName) async {
    // Add your guard logic here
    // Example: check if user is authenticated before accessing protected routes
    
    final protectedRoutes = [
      '/home',
      '/profile',
      '/settings',
    ];
    
    if (protectedRoutes.contains(routeName) && !isAuthenticated) {
      return false;
    }
    
    return true;
  }

  static Route<dynamic>? guardRoute(RouteSettings settings) {
    // Redirect to login if not authenticated
    if (!isAuthenticated && settings.name != '/login') {
      return MaterialPageRoute(
        builder: (_) => Scaffold(
          body: Center(child: Text('Please login first')),
        ),
        settings: RouteSettings(name: '/login'),
      );
    }
    
    return null;
  }
}
"""
        
        guards_path = f"{base_path}/lib/navigation/navigation_guards.dart"
        os.makedirs(os.path.dirname(guards_path), exist_ok=True)
        with open(guards_path, "w") as f:
            f.write(content)
        
        return guards_path

    def _create_flutter_router(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Flutter app_router.dart"""
        
        start_screen = flow_data.get("start_screen", "HomeScreen")
        
        content = f"""import 'package:flutter/material.dart';
import 'routes.dart';
import 'navigation_guards.dart';

class AppRouter {{
  static const String initialRoute = '{flow_data["screens"][0]["route"]}';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {{
    // Check navigation guards
    final guardRoute = NavigationGuard.guardRoute(settings);
    if (guardRoute != null) {{
      return guardRoute;
    }}

    // Generate route
    return AppRoutes.generateRoute(settings);
  }}
}}
"""
        
        router_path = f"{base_path}/lib/navigation/app_router.dart"
        os.makedirs(os.path.dirname(router_path), exist_ok=True)
        with open(router_path, "w") as f:
            f.write(content)
        
        return router_path

    # ========== REACT NAVIGATION ==========

    def _generate_react_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert React Router Navigation"""
        files = []
        
        routes_file = self._create_react_routes(base_path, flow_data)
        files.append(routes_file)
        
        guards_file = self._create_react_guards(base_path, flow_data)
        files.append(guards_file)
        
        return files

    def _create_react_routes(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt React routes.jsx"""
        
        screens = flow_data["screens"]
        
        imports = [f"import {s['name']} from '../screens/{s['name']}';" for s in screens]
        
        route_elements = []
        for screen in screens:
            route = screen["route"]
            name = screen["name"]
            requires_auth = screen.get("requires_auth", False)
            
            if requires_auth:
                route_elements.append(
                    f"    {{ path: '{route}', element: <ProtectedRoute><{name} /></ProtectedRoute> }}"
                )
            else:
                route_elements.append(f"    {{ path: '{route}', element: <{name} /> }}")
        
        content = f"""import {{ createBrowserRouter, RouterProvider }} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Screen imports
{chr(10).join(imports)}

const routes = [
{(',' + chr(10)).join(route_elements)}
];

const router = createBrowserRouter(routes);

export default function AppRouter() {{
  return <RouterProvider router={{router}} />;
}}
"""
        
        routes_path = f"{base_path}/src/navigation/routes.jsx"
        os.makedirs(os.path.dirname(routes_path), exist_ok=True)
        with open(routes_path, "w") as f:
            f.write(content)
        
        return routes_path

    def _create_react_guards(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt React ProtectedRoute.jsx"""
        
        content = """import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
"""
        
        guard_path = f"{base_path}/src/navigation/ProtectedRoute.jsx"
        os.makedirs(os.path.dirname(guard_path), exist_ok=True)
        with open(guard_path, "w") as f:
            f.write(content)
        
        return guard_path

    # ========== NEXT.JS NAVIGATION ==========

    def _generate_nextjs_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Next.js App Router Navigation"""
        files = []
        
        # Create route files for each screen
        for screen in flow_data["screens"]:
            route_file = self._create_nextjs_route_file(base_path, screen)
            files.append(route_file)
        
        # Create middleware for guards
        middleware_file = self._create_nextjs_middleware(base_path, flow_data)
        files.append(middleware_file)
        
        return files

    def _create_nextjs_route_file(
        self,
        base_path: str,
        screen: Dict[str, Any]
    ) -> str:
        """Erstellt Next.js route page"""
        
        route = screen["route"].lstrip("/")
        if not route:
            route = "page"
        else:
            route = route.replace("/", "/") + "/page"
        
        content = f"""export default function {screen['name']}() {{
  return (
    <div>
      <h1>{screen['name']}</h1>
    </div>
  );
}}
"""
        
        route_path = f"{base_path}/app/{route}.tsx"
        os.makedirs(os.path.dirname(route_path), exist_ok=True)
        with open(route_path, "w") as f:
            f.write(content)
        
        return route_path

    def _create_nextjs_middleware(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Next.js middleware.ts"""
        
        protected_routes = [
            s["route"] for s in flow_data["screens"] if s.get("requires_auth")
        ]
        
        content = f"""import {{ NextResponse }} from 'next/server';
import type {{ NextRequest }} from 'next/server';

const protectedRoutes = {protected_routes};

export function middleware(request: NextRequest) {{
  const {{ pathname }} = request.nextUrl;
  const isAuthenticated = request.cookies.get('auth-token');

  if (protectedRoutes.includes(pathname) && !isAuthenticated) {{
    return NextResponse.redirect(new URL('/login', request.url));
  }}

  return NextResponse.next();
}}

export const config = {{
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}};
"""
        
        middleware_path = f"{base_path}/middleware.ts"
        with open(middleware_path, "w") as f:
            f.write(content)
        
        return middleware_path

    # ========== VUE NAVIGATION ==========

    def _generate_vue_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Vue Router Navigation"""
        files = []
        
        router_file = self._create_vue_router(base_path, flow_data)
        files.append(router_file)
        
        return files

    def _create_vue_router(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Vue router.js"""
        
        screens = flow_data["screens"]
        
        route_defs = []
        for screen in screens:
            requires_auth = screen.get("requires_auth", False)
            meta = f", meta: {{ requiresAuth: {str(requires_auth).lower()} }}" if requires_auth else ""
            
            route_defs.append(
                f"  {{ path: '{screen['route']}', name: '{screen['name']}', "
                f"component: () => import('../views/{screen['name']}.vue'){meta} }}"
            )
        
        content = f"""import {{ createRouter, createWebHistory }} from 'vue-router';

const routes = [
{(',' + chr(10)).join(route_defs)}
];

const router = createRouter({{
  history: createWebHistory(),
  routes
}});

router.beforeEach((to, from, next) => {{
  const isAuthenticated = localStorage.getItem('auth-token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {{
    next('/login');
  }} else {{
    next();
  }}
}});

export default router;
"""
        
        router_path = f"{base_path}/src/router/index.js"
        os.makedirs(os.path.dirname(router_path), exist_ok=True)
        with open(router_path, "w") as f:
            f.write(content)
        
        return router_path

    # ========== REACT NATIVE NAVIGATION ==========

    def _generate_react_native_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert React Native Navigation"""
        files = []
        
        navigator_file = self._create_react_native_navigator(base_path, flow_data)
        files.append(navigator_file)
        
        return files

    def _create_react_native_navigator(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt React Native Navigation"""
        
        screens = flow_data["screens"]
        
        screen_defs = [
            f"      <Stack.Screen name=\"{s['name']}\" component={{{s['name']}}} />"
            for s in screens
        ]
        
        content = f"""import {{ NavigationContainer }} from '@react-navigation/native';
import {{ createNativeStackNavigator }} from '@react-navigation/native-stack';

// Screen imports
{chr(10).join([f"import {s['name']} from '../screens/{s['name']}';" for s in screens])}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {{
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="{flow_data.get('start_screen', 'HomeScreen')}">
{chr(10).join(screen_defs)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}}
"""
        
        navigator_path = f"{base_path}/src/navigation/AppNavigator.jsx"
        os.makedirs(os.path.dirname(navigator_path), exist_ok=True)
        with open(navigator_path, "w") as f:
            f.write(content)
        
        return navigator_path


# Singleton instance
flow_generator = FlowGenerator()
