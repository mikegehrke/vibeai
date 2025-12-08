# -------------------------------------------------------------
# VIBEAI – AI FLOWCHART ANALYZER
# -------------------------------------------------------------
"""
Intelligent Screen Flow Chart Analyzer

Capabilities:
1. Screen Detection: Auto-detect screens from code
2. Navigation Analysis: Find all navigation paths
3. Auth Barrier Detection: Identify login requirements
4. Tab/BottomNav Recognition: Detect persistent navigation
5. Missing Screen Detection: Find incomplete flows
6. Auto-Fix Suggestions: AI-powered flow improvements
7. Code Generation: Convert flowchart to navigation code
8. Validation: Ensure flow completeness
"""
import json
import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class ScreenType(Enum):
    """Screen Type Classification"""

    FULLSCREEN = "fullscreen"
    MODAL = "modal"
    BOTTOM_SHEET = "bottom_sheet"
    TAB = "tab"
    DRAWER = "drawer"


class NavigationType(Enum):
    """Navigation Type"""

    PUSH = "push"
    REPLACE = "replace"
    POP = "pop"
    MODAL = "modal"
    TAB_SWITCH = "tab_switch"
    DRAWER_TOGGLE = "drawer_toggle"


class AuthLevel(Enum):
    """Authentication Level"""

    PUBLIC = "public"
    AUTH_REQUIRED = "auth_required"
    AUTH_OPTIONAL = "auth_optional"
    ADMIN_ONLY = "admin_only"


@dataclass
class Screen:
    """Screen Definition"""

    name: str
    route: str
    screen_type: ScreenType = ScreenType.FULLSCREEN
    auth_level: AuthLevel = AuthLevel.PUBLIC
    params: List[str] = field(default_factory=list)
    tabs: List[str] = field(default_factory=list)
    has_bottom_nav: bool = False
    has_drawer: bool = False
    is_entry_point: bool = False
    color: str = "#3b82f6"  # Default blue

    def to_dict(self):
        return {
            "name": self.name,
            "route": self.route,
            "screen_type": self.screen_type.value,
            "auth_level": self.auth_level.value,
            "params": self.params,
            "tabs": self.tabs,
            "has_bottom_nav": self.has_bottom_nav,
            "has_drawer": self.has_drawer,
            "is_entry_point": self.is_entry_point,
            "color": self.color,
        }


@dataclass
class NavigationEdge:
    """Navigation Edge"""

    from_screen: str
    to_screen: str
    navigation_type: NavigationType = NavigationType.PUSH
    condition: Optional[str] = None
    requires_auth: bool = False
    params_passed: List[str] = field(default_factory=list)
    label: str = ""
    color: str = "#667eea"  # Default purple

    def to_dict(self):
        return {
            "from_screen": self.from_screen,
            "to_screen": self.to_screen,
            "navigation_type": self.navigation_type.value,
            "condition": self.condition,
            "requires_auth": self.requires_auth,
            "params_passed": self.params_passed,
            "label": self.label,
            "color": self.color,
        }


@dataclass
class FlowIssue:
    """Flow Issue/Warning"""

    severity: str  # "error", "warning", "info"
    screen: Optional[str]
    message: str
    suggestion: Optional[str] = None
    auto_fixable: bool = False
    fix_data: Optional[Dict[str, Any]] = None

    def to_dict(self):
        return {
            "severity": self.severity,
            "screen": self.screen,
            "message": self.message,
            "suggestion": self.suggestion,
            "auto_fixable": self.auto_fixable,
            "fix_data": self.fix_data,
        }


class FlowchartAnalyzer:
    """AI-Powered Flowchart Analyzer"""

    def __init__(self):
        self.screens: Dict[str, Screen] = {}
        self.edges: List[NavigationEdge] = []
        self.issues: List[FlowIssue] = []

        # Color schemes for different auth levels
        self.auth_colors = {
            AuthLevel.PUBLIC: "#3b82f6",  # Blue
            AuthLevel.AUTH_REQUIRED: "#f59e0b",  # Amber
            AuthLevel.AUTH_OPTIONAL: "#8b5cf6",  # Purple
            AuthLevel.ADMIN_ONLY: "#ef4444",  # Red
        }

    # ========== SCREEN DETECTION ==========

    def detect_screens_from_code(self, code: str, framework: str) -> List[Screen]:
        """Auto-detect screens from code"""
        screens = []

        if framework == "flutter":
            screens = self._detect_flutter_screens(code)
        elif framework in ["react", "nextjs"]:
            screens = self._detect_react_screens(code)
        elif framework == "react_native":
            screens = self._detect_react_native_screens(code)
        elif framework == "vue":
            screens = self._detect_vue_screens(code)

        return screens

    def _detect_flutter_screens(self, code: str) -> List[Screen]:
        """Detect Flutter screens"""
        screens = []

        # Pattern: class ScreenName extends StatelessWidget/StatefulWidget
        pattern = r"class\s+(\w+Screen)\s+extends\s+(?:Stateless|Stateful)Widget"
        matches = re.finditer(pattern, code)

        for match in matches:
            screen_name = match.group(1)
            route = f"/{self._camel_to_snake(screen_name)}"

            screens.append(
                Screen(
                    name=screen_name,
                    route=route,
                    screen_type=self._detect_screen_type(code, screen_name),
                    auth_level=self._detect_auth_level(code, screen_name),
                )
            )

        return screens

    def _detect_react_screens(self, code: str) -> List[Screen]:
        """Detect React/Next.js screens"""
        screens = []

        # Pattern: function ScreenName() or const ScreenName = () =>
        patterns = [
            r"function\s+(\w+Screen)\s*\(",
            r"const\s+(\w+Screen)\s*=\s*\(",
            r"export\s+default\s+function\s+(\w+)\s*\(",
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, code)
            for match in matches:
                screen_name = match.group(1)
                route = f"/{self._camel_to_kebab(screen_name)}"

                screens.append(
                    Screen(
                        name=screen_name,
                        route=route,
                        screen_type=self._detect_screen_type(code, screen_name),
                        auth_level=self._detect_auth_level(code, screen_name),
                    )
                )

        return screens

    def _detect_react_native_screens(self, code: str) -> List[Screen]:
        """Detect React Native screens"""
        return self._detect_react_screens(code)

    def _detect_vue_screens(self, code: str) -> List[Screen]:
        """Detect Vue screens"""
        screens = []

        # Pattern: export default { name: 'ScreenName' }
        pattern = r'name:\s*[\'"](\w+)[\'"]'
        matches = re.finditer(pattern, code)

        for match in matches:
            screen_name = match.group(1)
            route = f"/{self._camel_to_kebab(screen_name)}"

            screens.append(
                Screen(
                    name=screen_name,
                    route=route,
                    screen_type=self._detect_screen_type(code, screen_name),
                    auth_level=self._detect_auth_level(code, screen_name),
                )
            )

        return screens

    # ========== NAVIGATION DETECTION ==========

    def detect_navigation_from_code(self, code: str, framework: str) -> List[NavigationEdge]:
        """Auto-detect navigation from code"""
        edges = []

        if framework == "flutter":
            edges = self._detect_flutter_navigation(code)
        elif framework in ["react", "nextjs"]:
            edges = self._detect_react_navigation(code)
        elif framework == "react_native":
            edges = self._detect_react_native_navigation(code)
        elif framework == "vue":
            edges = self._detect_vue_navigation(code)

        return edges

    def _detect_flutter_navigation(self, code: str) -> List[NavigationEdge]:
        """Detect Flutter navigation"""
        edges = []

        # Navigator.push patterns
        push_pattern = r"Navigator\.push\([^,]+,\s*MaterialPageRoute\(builder:\s*\(\w+\)\s*=>\s*(\w+)\("
        for match in re.finditer(push_pattern, code):
            edges.append(
                NavigationEdge(
                    from_screen="Unknown",
                    to_screen=match.group(1),
                    navigation_type=NavigationType.PUSH,
                )
            )

        # Navigator.pushNamed patterns
        named_pattern = r'Navigator\.pushNamed\([^,]+,\s*[\'"]([^\'"]+)[\'"]'
        for match in re.finditer(named_pattern, code):
            edges.append(
                NavigationEdge(
                    from_screen="Unknown",
                    to_screen=match.group(1),
                    navigation_type=NavigationType.PUSH,
                )
            )

        return edges

    def _detect_react_navigation(self, code: str) -> List[NavigationEdge]:
        """Detect React navigation"""
        edges = []

        # navigate('/path') patterns
        patterns = [
            r'navigate\([\'"]([^\'"]+)[\'"]',
            r'router\.push\([\'"]([^\'"]+)[\'"]',
            r'<Link\s+to=[\'"]([^\'"]+)[\'"]',
        ]

        for pattern in patterns:
            for match in re.finditer(pattern, code):
                edges.append(
                    NavigationEdge(
                        from_screen="Unknown",
                        to_screen=match.group(1),
                        navigation_type=NavigationType.PUSH,
                    )
                )

        return edges

    def _detect_react_native_navigation(self, code: str) -> List[NavigationEdge]:
        """Detect React Native navigation"""
        edges = []

        # navigation.navigate('ScreenName') patterns
        pattern = r'navigation\.navigate\([\'"](\w+)[\'"]'
        for match in re.finditer(pattern, code):
            edges.append(
                NavigationEdge(
                    from_screen="Unknown",
                    to_screen=match.group(1),
                    navigation_type=NavigationType.PUSH,
                )
            )

        return edges

    def _detect_vue_navigation(self, code: str) -> List[NavigationEdge]:
        """Detect Vue navigation"""
        edges = []

        # router.push patterns
        patterns = [
            r'router\.push\([\'"]([^\'"]+)[\'"]',
            r'\$router\.push\([\'"]([^\'"]+)[\'"]',
            r'<router-link\s+to=[\'"]([^\'"]+)[\'"]',
        ]

        for pattern in patterns:
            for match in re.finditer(pattern, code):
                edges.append(
                    NavigationEdge(
                        from_screen="Unknown",
                        to_screen=match.group(1),
                        navigation_type=NavigationType.PUSH,
                    )
                )

        return edges

    # ========== SMART ANALYSIS ==========

    def analyze_flow(self, screens: List[Screen], edges: List[NavigationEdge]) -> Dict[str, Any]:
        """Comprehensive flow analysis"""
        self.screens = {s.name: s for s in screens}
        self.edges = edges
        self.issues = []

        # Run all analysis checks
        self._check_unreachable_screens()
        self._check_dead_ends()
        self._check_auth_barriers()
        self._check_missing_screens()
        self._check_logout_flow()
        self._check_error_handling()
        self._check_tab_consistency()
        self._check_payment_recovery()

        return {
            "valid": len([i for i in self.issues if i.severity == "error"]) == 0,
            "issues": [i.to_dict() for i in self.issues],
            "metrics": self._calculate_metrics(),
            "suggestions": self._generate_suggestions(),
        }

    def _check_unreachable_screens(self):
        """Find unreachable screens"""
        reachable = set()

        # Start from entry points
        entry_points = [s for s in self.screens.values() if s.is_entry_point]
        if not entry_points:
            entry_points = [list(self.screens.values())[0]] if self.screens else []

        # BFS to find reachable screens
        queue = [s.name for s in entry_points]
        reachable.update(queue)

        while queue:
            current = queue.pop(0)
            for edge in self.edges:
                if edge.from_screen == current and edge.to_screen not in reachable:
                    reachable.add(edge.to_screen)
                    queue.append(edge.to_screen)

        # Report unreachable screens
        for screen_name in self.screens:
            if screen_name not in reachable:
                self.issues.append(
                    FlowIssue(
                        severity="warning",
                        screen=screen_name,
                        message=f"Screen '{screen_name}' is unreachable",
                        suggestion=f"Add navigation to {screen_name}",
                        auto_fixable=True,
                        fix_data={
                            "action": "add_edge",
                            "from": list(reachable)[0] if reachable else None,
                            "to": screen_name,
                        },
                    )
                )

    def _check_dead_ends(self):
        """Find screens with no exit"""
        for screen_name, screen in self.screens.items():
            # Skip modals (they can close)
            if screen.screen_type == ScreenType.MODAL:
                continue

            has_exit = any(e.from_screen == screen_name for e in self.edges)

            if not has_exit:
                self.issues.append(
                    FlowIssue(
                        severity="warning",
                        screen=screen_name,
                        message=f"Screen '{screen_name}' has no exit navigation",
                        suggestion="Add back button or navigation to home",
                        auto_fixable=True,
                        fix_data={
                            "action": "add_back_navigation",
                            "screen": screen_name,
                        },
                    )
                )

    def _check_auth_barriers(self):
        """Detect auth barrier issues"""
        for edge in self.edges:
            from_s = self.screens.get(edge.from_screen)
            to_s = self.screens.get(edge.to_screen)

            if not from_s or not to_s:
                continue

            # Public → Auth Required without guard
            if (
                from_s.auth_level == AuthLevel.PUBLIC
                and to_s.auth_level == AuthLevel.AUTH_REQUIRED
                and not edge.requires_auth
            ):

                self.issues.append(
                    FlowIssue(
                        severity="error",
                        screen=edge.to_screen,
                        message=f"Navigation to '{edge.to_screen}' needs auth guard",
                        suggestion="Add authentication check before navigation",
                        auto_fixable=True,
                        fix_data={
                            "action": "add_auth_guard",
                            "edge": {"from": edge.from_screen, "to": edge.to_screen},
                        },
                    )
                )

    def _check_missing_screens(self):
        """Detect missing critical screens"""
        screen_names = set(self.screens.keys())

        # Check for common missing screens
        missing_checks = [
            ("Login", ["LoginScreen", "SignInScreen", "AuthScreen"]),
            ("Home", ["HomeScreen", "DashboardScreen", "MainScreen"]),
            ("Settings", ["SettingsScreen", "PreferencesScreen"]),
            ("Profile", ["ProfileScreen", "AccountScreen", "UserScreen"]),
        ]

        for category, variations in missing_checks:
            has_screen = any(v in screen_names for v in variations)

            if not has_screen and len(self.screens) > 3:
                self.issues.append(
                    FlowIssue(
                        severity="info",
                        screen=None,
                        message=f"Missing common screen: {category}",
                        suggestion=f"Consider adding a {variations[0]}",
                        auto_fixable=True,
                        fix_data={
                            "action": "add_screen",
                            "screen_name": variations[0],
                            "category": category,
                        },
                    )
                )

    def _check_logout_flow(self):
        """Check for logout flow"""
        has_logout = any(
            "logout" in edge.to_screen.lower() or "signout" in edge.to_screen.lower() for edge in self.edges
        )

        has_auth_screens = any(s.auth_level == AuthLevel.AUTH_REQUIRED for s in self.screens.values())

        if has_auth_screens and not has_logout:
            self.issues.append(
                FlowIssue(
                    severity="warning",
                    screen=None,
                    message="Missing logout flow",
                    suggestion="Add logout navigation from authenticated screens",
                    auto_fixable=True,
                    fix_data={
                        "action": "add_logout_flow",
                        "from_screens": [
                            s.name for s in self.screens.values() if s.auth_level == AuthLevel.AUTH_REQUIRED
                        ],
                    },
                )
            )

    def _check_error_handling(self):
        """Check for error screens"""
        has_error_screen = any(
            "error" in s.name.lower() or "notfound" in s.name.lower() or "404" in s.name for s in self.screens.values()
        )

        if len(self.screens) > 5 and not has_error_screen:
            self.issues.append(
                FlowIssue(
                    severity="info",
                    screen=None,
                    message="Missing error handling screen",
                    suggestion="Add ErrorScreen or NotFoundScreen",
                    auto_fixable=True,
                    fix_data={
                        "action": "add_screen",
                        "screen_name": "ErrorScreen",
                        "category": "error_handling",
                    },
                )
            )

    def _check_tab_consistency(self):
        """Check tab navigation consistency"""
        screens_with_tabs = [s for s in self.screens.values() if s.tabs]

        if screens_with_tabs:
            first_tabs = set(screens_with_tabs[0].tabs)

            for screen in screens_with_tabs[1:]:
                screen_tabs = set(screen.tabs)
                if screen_tabs != first_tabs:
                    self.issues.append(
                        FlowIssue(
                            severity="warning",
                            screen=screen.name,
                            message=f"Inconsistent tabs in {screen.name}",
                            suggestion="Ensure all tab screens have same tabs",
                            auto_fixable=True,
                            fix_data={
                                "action": "fix_tabs",
                                "screen": screen.name,
                                "expected_tabs": list(first_tabs),
                            },
                        )
                    )

    def _check_payment_recovery(self):
        """Check payment flow recovery"""
        payment_screens = [
            s for s in self.screens.values() if "payment" in s.name.lower() or "checkout" in s.name.lower()
        ]

        for screen in payment_screens:
            has_failure_path = any(
                e.from_screen == screen.name
                and (
                    "error" in e.to_screen.lower() or "failure" in e.to_screen.lower() or "retry" in e.to_screen.lower()
                )
                for e in self.edges
            )

            if not has_failure_path:
                self.issues.append(
                    FlowIssue(
                        severity="error",
                        screen=screen.name,
                        message=f"{screen.name} needs payment failure recovery",
                        suggestion="Add PaymentFailureScreen with retry option",
                        auto_fixable=True,
                        fix_data={
                            "action": "add_payment_recovery",
                            "payment_screen": screen.name,
                        },
                    )
                )

    # ========== HELPER METHODS ==========

    def _detect_screen_type(self, code: str, screen_name: str) -> ScreenType:
        """Detect screen type from code"""
        code.lower()
        name_lower = screen_name.lower()

        if "modal" in name_lower or "dialog" in name_lower:
            return ScreenType.MODAL
        elif "bottomsheet" in name_lower or "bottom_sheet" in name_lower:
            return ScreenType.BOTTOM_SHEET
        elif "tab" in name_lower:
            return ScreenType.TAB
        elif "drawer" in name_lower:
            return ScreenType.DRAWER
        else:
            return ScreenType.FULLSCREEN

    def _detect_auth_level(self, code: str, screen_name: str) -> AuthLevel:
        """Detect auth level from code/name"""
        name_lower = screen_name.lower()

        if any(word in name_lower for word in ["admin", "dashboard"]):
            return AuthLevel.ADMIN_ONLY
        elif any(word in name_lower for word in ["profile", "account", "settings"]):
            return AuthLevel.AUTH_REQUIRED
        elif any(word in name_lower for word in ["login", "signup", "register", "welcome"]):
            return AuthLevel.PUBLIC
        else:
            return AuthLevel.PUBLIC

    def _camel_to_snake(self, name: str) -> str:
        """Convert CamelCase to snake_case"""
        name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", name).lower()

    def _camel_to_kebab(self, name: str) -> str:
        """Convert CamelCase to kebab-case"""
        return self._camel_to_snake(name).replace("_", "-")

    def _calculate_metrics(self) -> Dict[str, Any]:
        """Calculate flow metrics"""
        return {
            "total_screens": len(self.screens),
            "total_edges": len(self.edges),
            "auth_required_screens": len([s for s in self.screens.values() if s.auth_level == AuthLevel.AUTH_REQUIRED]),
            "public_screens": len([s for s in self.screens.values() if s.auth_level == AuthLevel.PUBLIC]),
            "modal_screens": len([s for s in self.screens.values() if s.screen_type == ScreenType.MODAL]),
            "tab_screens": len([s for s in self.screens.values() if s.tabs]),
            "errors": len([i for i in self.issues if i.severity == "error"]),
            "warnings": len([i for i in self.issues if i.severity == "warning"]),
            "auto_fixable_issues": len([i for i in self.issues if i.auto_fixable]),
        }

    def _generate_suggestions(self) -> List[str]:
        """Generate high-level suggestions"""
        suggestions = []

        metrics = self._calculate_metrics()

        if metrics["errors"] > 0:
            suggestions.append(f"Fix {metrics['errors']} critical flow errors")

        if metrics["auto_fixable_issues"] > 0:
            suggestions.append(f"Apply auto-fix for {metrics['auto_fixable_issues']} issues")

        if metrics["auth_required_screens"] > 0 and metrics["public_screens"] == 0:
            suggestions.append("Add public landing page for unauthenticated users")

        if metrics["total_screens"] > 10 and metrics["tab_screens"] == 0:
            suggestions.append("Consider adding tab navigation for better UX")

        return suggestions

    # ========== AUTO-FIX ==========

    def apply_auto_fix(self, issue: FlowIssue) -> Dict[str, Any]:
        """Apply automatic fix for issue"""
        if not issue.auto_fixable or not issue.fix_data:
            return {"success": False, "message": "Issue not auto-fixable"}

        action = issue.fix_data.get("action")

        if action == "add_edge":
            return self._fix_add_edge(issue.fix_data)
        elif action == "add_screen":
            return self._fix_add_screen(issue.fix_data)
        elif action == "add_auth_guard":
            return self._fix_add_auth_guard(issue.fix_data)
        elif action == "add_logout_flow":
            return self._fix_add_logout_flow(issue.fix_data)
        elif action == "add_payment_recovery":
            return self._fix_add_payment_recovery(issue.fix_data)

        return {"success": False, "message": "Unknown fix action"}

    def _fix_add_edge(self, fix_data: Dict) -> Dict[str, Any]:
        """Fix: Add missing edge"""
        new_edge = NavigationEdge(
            from_screen=fix_data["from"],
            to_screen=fix_data["to"],
            navigation_type=NavigationType.PUSH,
        )
        self.edges.append(new_edge)

        return {
            "success": True,
            "message": f"Added navigation from {fix_data['from']} to {fix_data['to']}",
            "edge": new_edge.to_dict(),
        }

    def _fix_add_screen(self, fix_data: Dict) -> Dict[str, Any]:
        """Fix: Add missing screen"""
        screen_name = fix_data["screen_name"]
        category = fix_data.get("category", "general")

        new_screen = Screen(
            name=screen_name,
            route=f"/{self._camel_to_kebab(screen_name)}",
            auth_level=(AuthLevel.AUTH_REQUIRED if category in ["profile", "settings"] else AuthLevel.PUBLIC),
        )
        self.screens[screen_name] = new_screen

        return {
            "success": True,
            "message": f"Added {screen_name}",
            "screen": new_screen.to_dict(),
        }

    def _fix_add_auth_guard(self, fix_data: Dict) -> Dict[str, Any]:
        """Fix: Add auth guard"""
        edge_data = fix_data["edge"]

        for edge in self.edges:
            if edge.from_screen == edge_data["from"] and edge.to_screen == edge_data["to"]:
                edge.requires_auth = True
                edge.condition = "isAuthenticated"
                break

        return {"success": True, "message": "Added auth guard to navigation"}

    def _fix_add_logout_flow(self, fix_data: Dict) -> Dict[str, Any]:
        """Fix: Add logout flow"""
        # Add logout screen
        logout_screen = Screen(name="LogoutScreen", route="/logout", auth_level=AuthLevel.PUBLIC)
        self.screens["LogoutScreen"] = logout_screen

        # Add edges from auth screens
        for screen_name in fix_data["from_screens"][:3]:  # Limit to 3
            self.edges.append(
                NavigationEdge(
                    from_screen=screen_name,
                    to_screen="LogoutScreen",
                    navigation_type=NavigationType.PUSH,
                    label="Logout",
                )
            )

        return {
            "success": True,
            "message": "Added logout flow",
            "screen": logout_screen.to_dict(),
        }

    def _fix_add_payment_recovery(self, fix_data: Dict) -> Dict[str, Any]:
        """Fix: Add payment recovery"""
        payment_screen = fix_data["payment_screen"]

        # Add failure screen
        failure_screen = Screen(
            name="PaymentFailureScreen",
            route="/payment/failure",
            auth_level=AuthLevel.AUTH_REQUIRED,
        )
        self.screens["PaymentFailureScreen"] = failure_screen

        # Add edge from payment to failure
        self.edges.append(
            NavigationEdge(
                from_screen=payment_screen,
                to_screen="PaymentFailureScreen",
                navigation_type=NavigationType.REPLACE,
                label="On Failure",
            )
        )

        # Add retry edge
        self.edges.append(
            NavigationEdge(
                from_screen="PaymentFailureScreen",
                to_screen=payment_screen,
                navigation_type=NavigationType.REPLACE,
                label="Retry",
            )
        )

        return {
            "success": True,
            "message": "Added payment failure recovery",
            "screen": failure_screen.to_dict(),
        }

    # ========== EXPORT ==========

    def export_to_mermaid(self) -> str:
        """Export flowchart to Mermaid syntax"""
        lines = ["graph TD"]

        # Add screens
        for screen in self.screens.values():
            shape = "([{}])" if screen.screen_type == ScreenType.MODAL else "[{}]"
            lines.append(f"    {screen.name}{shape.format(screen.name)}")

        # Add edges
        for edge in self.edges:
            arrow = "-->" if edge.navigation_type == NavigationType.PUSH else "==>"
            label = f"|{edge.label}|" if edge.label else ""
            lines.append(f"    {edge.from_screen} {arrow}{label} {edge.to_screen}")

        return "\n".join(lines)

    def export_to_json(self) -> str:
        """Export flowchart to JSON"""
        return json.dumps(
            {
                "screens": [s.to_dict() for s in self.screens.values()],
                "edges": [e.to_dict() for e in self.edges],
                "issues": [i.to_dict() for i in self.issues],
            },
            indent=2,
        )


# Global instance
flowchart_analyzer = FlowchartAnalyzer()