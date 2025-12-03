# -------------------------------------------------------------
# VIBEAI – AI NAVIGATION FLOW BUILDER
# -------------------------------------------------------------
import os
import json
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, asdict


@dataclass
class Screen:
    """Screen Definition"""
    name: str
    path: str
    requires_auth: bool = False
    params: List[str] = None
    type: str = "fullscreen"  # fullscreen, modal, drawer
    title: Optional[str] = None
    icon: Optional[str] = None
    
    def __post_init__(self):
        if self.params is None:
            self.params = []
        if self.title is None:
            self.title = self.name


@dataclass
class NavigationEdge:
    """Navigation Transition"""
    from_screen: str
    to_screen: str
    action: str  # push, replace, pop, modal
    condition: Optional[str] = None  # "isLoggedIn", "hasItems"
    params: Dict[str, str] = None
    
    def __post_init__(self):
        if self.params is None:
            self.params = {}


class NavigationFlowGenerator:
    """
    AI Navigation Flow Builder
    
    Generiert:
    - Navigation Maps (JSON)
    - Flutter Navigator 2.0
    - React Router / Next.js
    - Navigation Guards
    - Parameter Handling
    - Flow Charts (Mermaid)
    """

    def __init__(self):
        self.frameworks = ["flutter", "react", "nextjs", "react_native", "vue"]
        self.flow_types = ["checkout", "onboarding", "auth", "profile", "custom"]

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
            framework: flutter, react, nextjs, react_native, vue
            flow_type: checkout, onboarding, auth, profile, custom
            options: Custom screens, edges, auth settings
        
        Returns:
            Dict mit success, files, flow_data, graph
        """
        options = options or {}
        
        # Generate flow structure
        flow_data = self._generate_flow_structure(flow_type, options)
        
        # Generate framework-specific files
        files = []
        if framework == "flutter":
            files = self._generate_flutter_navigation(base_path, flow_data)
        elif framework == "react":
            files = self._generate_react_navigation(base_path, flow_data)
        elif framework == "nextjs":
            files = self._generate_nextjs_navigation(base_path, flow_data)
        elif framework == "react_native":
            files = self._generate_react_native_navigation(base_path, flow_data)
        elif framework == "vue":
            files = self._generate_vue_navigation(base_path, flow_data)
        else:
            raise ValueError(f"Unsupported framework: {framework}")
        
        # Generate flow chart
        mermaid_chart = self._generate_mermaid_chart(flow_data)
        
        # Save flow map
        flow_map_file = self._save_flow_map(base_path, flow_data)
        files.append(flow_map_file)
        
        # Save mermaid chart
        chart_file = self._save_mermaid_chart(base_path, mermaid_chart)
        files.append(chart_file)
        
        return {
            "success": True,
            "framework": framework,
            "flow_type": flow_type,
            "files": files,
            "flow_data": {
                "screens": [asdict(s) for s in flow_data["screens"]],
                "edges": [asdict(e) for e in flow_data["edges"]],
                "entry_point": flow_data["entry_point"]
            },
            "mermaid_chart": mermaid_chart
        }

    def _generate_flow_structure(
        self,
        flow_type: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generiert Flow Structure basierend auf Typ"""
        
        if flow_type == "checkout":
            return self._create_checkout_flow()
        elif flow_type == "onboarding":
            return self._create_onboarding_flow()
        elif flow_type == "auth":
            return self._create_auth_flow()
        elif flow_type == "profile":
            return self._create_profile_flow()
        elif flow_type == "custom":
            return self._create_custom_flow(options)
        else:
            raise ValueError(f"Unknown flow type: {flow_type}")

    def _create_checkout_flow(self) -> Dict[str, Any]:
        """Erstellt Checkout Flow"""
        screens = [
            Screen("CartScreen", "/cart", requires_auth=True, icon="shopping_cart"),
            Screen("AddressScreen", "/checkout/address", requires_auth=True, icon="location_on"),
            Screen("PaymentScreen", "/checkout/payment", requires_auth=True, icon="payment"),
            Screen("ConfirmScreen", "/checkout/confirm", requires_auth=True, icon="check_circle"),
            Screen("SuccessScreen", "/checkout/success", requires_auth=True, icon="celebration")
        ]
        
        edges = [
            NavigationEdge("CartScreen", "AddressScreen", "push", condition="hasItems"),
            NavigationEdge("AddressScreen", "PaymentScreen", "push"),
            NavigationEdge("PaymentScreen", "ConfirmScreen", "push"),
            NavigationEdge("ConfirmScreen", "SuccessScreen", "replace"),
        ]
        
        return {
            "screens": screens,
            "edges": edges,
            "entry_point": "CartScreen"
        }

    def _create_onboarding_flow(self) -> Dict[str, Any]:
        """Erstellt Onboarding Flow"""
        screens = [
            Screen("WelcomeScreen", "/onboarding/welcome", icon="waving_hand"),
            Screen("FeaturesScreen", "/onboarding/features", icon="star"),
            Screen("PermissionsScreen", "/onboarding/permissions", icon="security"),
            Screen("GetStartedScreen", "/onboarding/start", icon="rocket")
        ]
        
        edges = [
            NavigationEdge("WelcomeScreen", "FeaturesScreen", "push"),
            NavigationEdge("FeaturesScreen", "PermissionsScreen", "push"),
            NavigationEdge("PermissionsScreen", "GetStartedScreen", "push"),
        ]
        
        return {
            "screens": screens,
            "edges": edges,
            "entry_point": "WelcomeScreen"
        }

    def _create_auth_flow(self) -> Dict[str, Any]:
        """Erstellt Auth Flow"""
        screens = [
            Screen("LoginScreen", "/auth/login", icon="login"),
            Screen("RegisterScreen", "/auth/register", icon="person_add"),
            Screen("ForgotPasswordScreen", "/auth/forgot", icon="lock_reset"),
            Screen("ResetPasswordScreen", "/auth/reset", params=["token"], icon="lock_open"),
            Screen("VerifyEmailScreen", "/auth/verify", params=["code"], icon="email")
        ]
        
        edges = [
            NavigationEdge("LoginScreen", "RegisterScreen", "push"),
            NavigationEdge("LoginScreen", "ForgotPasswordScreen", "push"),
            NavigationEdge("ForgotPasswordScreen", "ResetPasswordScreen", "push"),
            NavigationEdge("RegisterScreen", "VerifyEmailScreen", "replace"),
        ]
        
        return {
            "screens": screens,
            "edges": edges,
            "entry_point": "LoginScreen"
        }

    def _create_profile_flow(self) -> Dict[str, Any]:
        """Erstellt Profile Flow"""
        screens = [
            Screen("ProfileScreen", "/profile", requires_auth=True, icon="person"),
            Screen("EditProfileScreen", "/profile/edit", requires_auth=True, icon="edit"),
            Screen("SettingsScreen", "/settings", requires_auth=True, icon="settings"),
            Screen("NotificationsScreen", "/settings/notifications", requires_auth=True, icon="notifications"),
            Screen("SecurityScreen", "/settings/security", requires_auth=True, icon="shield")
        ]
        
        edges = [
            NavigationEdge("ProfileScreen", "EditProfileScreen", "push"),
            NavigationEdge("ProfileScreen", "SettingsScreen", "push"),
            NavigationEdge("SettingsScreen", "NotificationsScreen", "push"),
            NavigationEdge("SettingsScreen", "SecurityScreen", "push"),
        ]
        
        return {
            "screens": screens,
            "edges": edges,
            "entry_point": "ProfileScreen"
        }

    def _create_custom_flow(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt Custom Flow aus Options"""
        screens_data = options.get("screens", [])
        edges_data = options.get("edges", [])
        
        screens = [
            Screen(
                name=s.get("name"),
                path=s.get("path"),
                requires_auth=s.get("requires_auth", False),
                params=s.get("params", []),
                type=s.get("type", "fullscreen"),
                title=s.get("title"),
                icon=s.get("icon")
            )
            for s in screens_data
        ]
        
        edges = [
            NavigationEdge(
                from_screen=e.get("from"),
                to_screen=e.get("to"),
                action=e.get("action", "push"),
                condition=e.get("condition"),
                params=e.get("params", {})
            )
            for e in edges_data
        ]
        
        return {
            "screens": screens,
            "edges": edges,
            "entry_point": options.get("entry_point", screens[0].name if screens else "HomeScreen")
        }

    # ========== FLUTTER NAVIGATION ==========

    def _generate_flutter_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Flutter Navigator 2.0"""
        files = []
        
        # 1. Routes Definition
        routes_file = self._create_flutter_routes(base_path, flow_data)
        files.append(routes_file)
        
        # 2. Route Guards
        guards_file = self._create_flutter_guards(base_path, flow_data)
        files.append(guards_file)
        
        # 3. Navigation Service
        service_file = self._create_flutter_nav_service(base_path, flow_data)
        files.append(service_file)
        
        return files

    def _create_flutter_routes(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Flutter routes.dart"""
        
        screens = flow_data["screens"]
        
        # Generate route names
        route_names = "\n".join([
            f"  static const String {self._to_camel_case(s.name)} = '{s.path}';"
            for s in screens
        ])
        
        # Generate route map
        route_map_entries = []
        for screen in screens:
            route_map_entries.append(
                f"    Routes.{self._to_camel_case(screen.name)}: (context) => {screen.name}(),"
            )
        
        route_map = "\n".join(route_map_entries)
        
        content = f"""import 'package:flutter/material.dart';

// Import all screens
{chr(10).join([f"import '../screens/{self._to_snake_case(s.name)}.dart';" for s in screens])}

class Routes {{
{route_names}

  static Map<String, WidgetBuilder> getRoutes() {{
    return {{
{route_map}
    }};
  }}
  
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {{
    final routes = getRoutes();
    final builder = routes[settings.name];
    
    if (builder != null) {{
      return MaterialPageRoute(
        builder: builder,
        settings: settings,
      );
    }}
    
    // 404 Screen
    return MaterialPageRoute(
      builder: (_) => Scaffold(
        appBar: AppBar(title: Text('Not Found')),
        body: Center(child: Text('Page not found')),
      ),
    );
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
        
        screens = flow_data["screens"]
        protected_routes = [s.path for s in screens if s.requires_auth]
        
        content = f"""import 'package:flutter/material.dart';

class NavigationGuard {{
  static const List<String> protectedRoutes = {protected_routes};
  
  static bool requiresAuth(String? route) {{
    return protectedRoutes.contains(route);
  }}
  
  static Future<bool> canNavigate(
    BuildContext context,
    String route,
  ) async {{
    if (!requiresAuth(route)) {{
      return true;
    }}
    
    // Check auth status (implement your auth logic)
    final isAuthenticated = await _checkAuth();
    
    if (!isAuthenticated) {{
      // Redirect to login
      Navigator.pushReplacementNamed(context, '/auth/login');
      return false;
    }}
    
    return true;
  }}
  
  static Future<bool> _checkAuth() async {{
    // TODO: Implement actual auth check
    // Example: Check if token exists in secure storage
    return false;
  }}
}}
"""
        
        guards_path = f"{base_path}/lib/navigation/navigation_guards.dart"
        os.makedirs(os.path.dirname(guards_path), exist_ok=True)
        with open(guards_path, "w") as f:
            f.write(content)
        
        return guards_path

    def _create_flutter_nav_service(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Flutter navigation_service.dart"""
        
        content = """import 'package:flutter/material.dart';
import 'navigation_guards.dart';

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  
  static Future<void> navigateTo(
    String route, {
    Map<String, dynamic>? arguments,
    bool replace = false,
  }) async {
    final context = navigatorKey.currentContext;
    if (context == null) return;
    
    final canNavigate = await NavigationGuard.canNavigate(context, route);
    if (!canNavigate) return;
    
    if (replace) {
      navigatorKey.currentState?.pushReplacementNamed(route, arguments: arguments);
    } else {
      navigatorKey.currentState?.pushNamed(route, arguments: arguments);
    }
  }
  
  static void goBack() {
    navigatorKey.currentState?.pop();
  }
  
  static void popUntil(String route) {
    navigatorKey.currentState?.popUntil(ModalRoute.withName(route));
  }
  
  static Future<void> showModalScreen(Widget screen) async {
    final context = navigatorKey.currentContext;
    if (context == null) return;
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => screen,
    );
  }
}
"""
        
        service_path = f"{base_path}/lib/navigation/navigation_service.dart"
        os.makedirs(os.path.dirname(service_path), exist_ok=True)
        with open(service_path, "w") as f:
            f.write(content)
        
        return service_path

    # ========== REACT NAVIGATION ==========

    def _generate_react_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert React Router"""
        files = []
        
        # 1. Routes Config
        routes_file = self._create_react_routes(base_path, flow_data)
        files.append(routes_file)
        
        # 2. Protected Route Component
        protected_file = self._create_react_protected_route(base_path)
        files.append(protected_file)
        
        # 3. Navigation Hook
        hook_file = self._create_react_nav_hook(base_path)
        files.append(hook_file)
        
        return files

    def _create_react_routes(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt React routes.jsx"""
        
        screens = flow_data["screens"]
        
        # Generate imports
        imports = "\n".join([
            f"import {screen.name} from './screens/{screen.name}';"
            for screen in screens
        ])
        
        # Generate route objects
        route_objects = []
        for screen in screens:
            params_str = ", ".join([f":{p}" for p in screen.params])
            path_with_params = f"{screen.path}/{params_str}" if screen.params else screen.path
            
            route_obj = f"""  {{
    path: '{path_with_params}',
    element: {'<ProtectedRoute>' if screen.requires_auth else ''}<{screen.name} />{'</ProtectedRoute>' if screen.requires_auth else ''},
    title: '{screen.title}',
  }}"""
            route_objects.append(route_obj)
        
        routes_array = ",\n".join(route_objects)
        
        content = f"""import {{ BrowserRouter, Routes, Route }} from 'react-router-dom';
{imports}
import ProtectedRoute from './components/ProtectedRoute';

export const routes = [
{routes_array}
];

export const AppRouter = () => {{
  return (
    <BrowserRouter>
      <Routes>
        {{routes.map((route) => (
          <Route key={{route.path}} path={{route.path}} element={{route.element}} />
        ))}}
        <Route path="*" element={{<div>404 - Not Found</div>}} />
      </Routes>
    </BrowserRouter>
  );
}};
"""
        
        routes_path = f"{base_path}/src/navigation/routes.jsx"
        os.makedirs(os.path.dirname(routes_path), exist_ok=True)
        with open(routes_path, "w") as f:
            f.write(content)
        
        return routes_path

    def _create_react_protected_route(self, base_path: str) -> str:
        """Erstellt ProtectedRoute Component"""
        
        content = """import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
"""
        
        protected_path = f"{base_path}/src/components/ProtectedRoute.jsx"
        os.makedirs(os.path.dirname(protected_path), exist_ok=True)
        with open(protected_path, "w") as f:
            f.write(content)
        
        return protected_path

    def _create_react_nav_hook(self, base_path: str) -> str:
        """Erstellt useNavigation Hook"""
        
        content = """import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  
  const navigateTo = (path, options = {}) => {
    navigate(path, options);
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  const replace = (path) => {
    navigate(path, { replace: true });
  };
  
  return {
    navigateTo,
    goBack,
    replace,
  };
};
"""
        
        hook_path = f"{base_path}/src/hooks/useNavigation.js"
        os.makedirs(os.path.dirname(hook_path), exist_ok=True)
        with open(hook_path, "w") as f:
            f.write(content)
        
        return hook_path

    # ========== NEXT.JS NAVIGATION ==========

    def _generate_nextjs_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Next.js App Router Files"""
        files = []
        
        screens = flow_data["screens"]
        
        for screen in screens:
            # Create page.tsx for each route
            page_file = self._create_nextjs_page(base_path, screen)
            files.append(page_file)
        
        # Create middleware for auth
        middleware_file = self._create_nextjs_middleware(base_path, flow_data)
        files.append(middleware_file)
        
        return files

    def _create_nextjs_page(self, base_path: str, screen: Screen) -> str:
        """Erstellt Next.js page.tsx"""
        
        # Remove leading slash from path
        route_path = screen.path.lstrip('/')
        
        content = f"""export default function {screen.name.replace('Screen', '')}() {{
  return (
    <div>
      <h1>{screen.title}</h1>
      <p>Welcome to {screen.title}</p>
    </div>
  );
}}
"""
        
        page_path = f"{base_path}/app/{route_path}/page.tsx"
        os.makedirs(os.path.dirname(page_path), exist_ok=True)
        with open(page_path, "w") as f:
            f.write(content)
        
        return page_path

    def _create_nextjs_middleware(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt Next.js middleware.ts"""
        
        screens = flow_data["screens"]
        protected_paths = [s.path for s in screens if s.requires_auth]
        
        content = f"""import {{ NextResponse }} from 'next/server';
import type {{ NextRequest }} from 'next/server';

const protectedRoutes = {protected_paths};

export function middleware(request: NextRequest) {{
  const {{ pathname }} = request.nextUrl;
  
  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtected) {{
    // Check auth (simplified - implement proper auth check)
    const token = request.cookies.get('auth_token');
    
    if (!token) {{
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }}
  }}
  
  return NextResponse.next();
}}

export const config = {{
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}};
"""
        
        middleware_path = f"{base_path}/middleware.ts"
        with open(middleware_path, "w") as f:
            f.write(content)
        
        return middleware_path

    # ========== REACT NATIVE NAVIGATION ==========

    def _generate_react_native_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert React Navigation (Stack Navigator)"""
        files = []
        
        navigator_file = self._create_react_native_navigator(base_path, flow_data)
        files.append(navigator_file)
        
        return files

    def _create_react_native_navigator(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> str:
        """Erstellt React Navigation Stack"""
        
        screens = flow_data["screens"]
        
        imports = "\n".join([
            f"import {screen.name} from './screens/{screen.name}';"
            for screen in screens
        ])
        
        stack_screens = "\n      ".join([
            f"<Stack.Screen name=\"{screen.name}\" component={{{screen.name}}} />"
            for screen in screens
        ])
        
        content = f"""import {{ createStackNavigator }} from '@react-navigation/stack';
import {{ NavigationContainer }} from '@react-navigation/native';
{imports}

const Stack = createStackNavigator();

export const AppNavigator = () => {{
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="{flow_data['entry_point']}">
        {stack_screens}
      </Stack.Navigator>
    </NavigationContainer>
  );
}};
"""
        
        navigator_path = f"{base_path}/src/navigation/AppNavigator.jsx"
        os.makedirs(os.path.dirname(navigator_path), exist_ok=True)
        with open(navigator_path, "w") as f:
            f.write(content)
        
        return navigator_path

    # ========== VUE NAVIGATION ==========

    def _generate_vue_navigation(
        self,
        base_path: str,
        flow_data: Dict[str, Any]
    ) -> List[str]:
        """Generiert Vue Router"""
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
        
        route_objects = []
        for screen in screens:
            route_obj = f"""  {{
    path: '{screen.path}',
    name: '{screen.name}',
    component: () => import('./views/{screen.name}.vue'),
    meta: {{ requiresAuth: {str(screen.requires_auth).lower()} }}
  }}"""
            route_objects.append(route_obj)
        
        routes_array = ",\n".join(route_objects)
        
        content = f"""import {{ createRouter, createWebHistory }} from 'vue-router';

const routes = [
{routes_array}
];

const router = createRouter({{
  history: createWebHistory(),
  routes,
}});

router.beforeEach((to, from, next) => {{
  if (to.meta.requiresAuth) {{
    // Check auth status
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {{
      next('/auth/login');
    }} else {{
      next();
    }}
  }} else {{
    next();
  }}
}});

function checkAuth() {{
  // TODO: Implement auth check
  return false;
}}

export default router;
"""
        
        router_path = f"{base_path}/src/router.js"
        os.makedirs(os.path.dirname(router_path), exist_ok=True)
        with open(router_path, "w") as f:
            f.write(content)
        
        return router_path

    # ========== FLOW VISUALIZATION ==========

    def _generate_mermaid_chart(self, flow_data: Dict[str, Any]) -> str:
        """Generiert Mermaid Flow Chart"""
        
        screens = flow_data["screens"]
        edges = flow_data["edges"]
        
        # Generate nodes
        nodes = []
        for screen in screens:
            shape = "([{}])" if screen.requires_auth else "[{}]"
            node = f"    {screen.name}{shape.format(screen.title)}"
            nodes.append(node)
        
        # Generate edges
        edge_lines = []
        for edge in edges:
            arrow = "-->" if edge.action == "push" else "==>"
            label = f"|{edge.condition}|" if edge.condition else ""
            edge_line = f"    {edge.from_screen} {arrow}{label} {edge.to_screen}"
            edge_lines.append(edge_line)
        
        mermaid = f"""graph TD
{chr(10).join(nodes)}

{chr(10).join(edge_lines)}

    style {flow_data['entry_point']} fill:#667eea,stroke:#333,stroke-width:4px
"""
        
        return mermaid

    def _save_flow_map(self, base_path: str, flow_data: Dict[str, Any]) -> str:
        """Speichert Flow Map als JSON"""
        
        flow_map = {
            "screens": [asdict(s) for s in flow_data["screens"]],
            "edges": [asdict(e) for e in flow_data["edges"]],
            "entry_point": flow_data["entry_point"]
        }
        
        flow_path = f"{base_path}/navigation_flow.json"
        os.makedirs(os.path.dirname(flow_path) if os.path.dirname(flow_path) else base_path, exist_ok=True)
        with open(flow_path, "w") as f:
            json.dump(flow_map, f, indent=2)
        
        return flow_path

    def _save_mermaid_chart(self, base_path: str, mermaid: str) -> str:
        """Speichert Mermaid Chart"""
        
        chart_path = f"{base_path}/flow_chart.mmd"
        os.makedirs(os.path.dirname(chart_path) if os.path.dirname(chart_path) else base_path, exist_ok=True)
        with open(chart_path, "w") as f:
            f.write(mermaid)
        
        return chart_path

    # ========== HELPER METHODS ==========

    def _to_camel_case(self, name: str) -> str:
        """Converts ScreenName to screenName"""
        return name[0].lower() + name[1:]

    def _to_snake_case(self, name: str) -> str:
        """Converts ScreenName to screen_name"""
        import re
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


# Singleton instance
flow_generator = NavigationFlowGenerator()
