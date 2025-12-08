#!/usr/bin/env python3
"""
Script to fix all linting errors in api_generator.py systematically
"""
import re


def fix_api_generator():
    file_path = "api_generator.py"

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove unused List import
    content = content.replace(
        "from typing import Dict, List, Any, Optional",
        "from typing import Dict, Any, Optional",
    )

    # 2. Split supported_frameworks list
    content = content.replace(
        '        self.supported_frameworks = ["flutter", "react", "nextjs", "vue", "nodejs"]',
        """        self.supported_frameworks = [
            "flutter", "react", "nextjs", "vue", "nodejs"
        ]""",
    )

    # 3. Split long docstring in generate_api_client
    content = content.replace(
        "            options: Optionale Konfiguration (base_url, auth_type, timeout, etc.)",
        """            options: Optionale Konfiguration
                (base_url, auth_type, timeout, etc.)""",
    )

    # 4. Split error messages with f-string concatenation
    content = content.replace(
        '                "error": f"Framework \'{framework}\' nicht unterstützt. Verfügbar: {self.supported_frameworks}"',
        """                "error": (
                    f"Framework '{framework}' nicht unterstützt. "
                    f"Verfügbar: {self.supported_frameworks}"
                )""",
    )

    content = content.replace(
        '                "error": f"Protokoll \'{protocol}\' nicht unterstützt. Verfügbar: {self.supported_protocols}"',
        """                "error": (
                    f"Protokoll '{protocol}' nicht unterstützt. "
                    f"Verfügbar: {self.supported_protocols}"
                )""",
    )

    # 5. Split return statements for _generate_flutter_* methods
    content = content.replace(
        "                return self._generate_flutter_rest(base_path, base_url, auth_type, timeout)",
        """                return self._generate_flutter_rest(
                    base_path, base_url, auth_type, timeout
                )""",
    )

    content = content.replace(
        "                return self._generate_flutter_graphql(base_path, base_url, auth_type)",
        """                return self._generate_flutter_graphql(
                    base_path, base_url, auth_type
                )""",
    )

    content = content.replace(
        "                return self._generate_flutter_websocket(base_path, base_url)",
        """                return self._generate_flutter_websocket(
                    base_path, base_url
                )""",
    )

    # 6. Split return statements for _generate_react_* methods
    content = content.replace(
        "                return self._generate_react_rest(base_path, base_url, auth_type, timeout)",
        """                return self._generate_react_rest(
                    base_path, base_url, auth_type, timeout
                )""",
    )

    content = content.replace(
        "                return self._generate_react_graphql(base_path, base_url, auth_type)",
        """                return self._generate_react_graphql(
                    base_path, base_url, auth_type
                )""",
    )

    content = content.replace(
        "                return self._generate_react_websocket(base_path, base_url)",
        """                return self._generate_react_websocket(
                    base_path, base_url
                )""",
    )

    # 7. Split return statements for _generate_nextjs_* methods
    content = content.replace(
        "                return self._generate_nextjs_rest(base_path, base_url, auth_type, timeout)",
        """                return self._generate_nextjs_rest(
                    base_path, base_url, auth_type, timeout
                )""",
    )

    content = content.replace(
        "                return self._generate_nextjs_graphql(base_path, base_url, auth_type)",
        """                return self._generate_nextjs_graphql(
                    base_path, base_url, auth_type
                )""",
    )

    content = content.replace(
        "                return self._generate_nextjs_websocket(base_path, base_url)",
        """                return self._generate_nextjs_websocket(
                    base_path, base_url
                )""",
    )

    # 8. Split return statements for _generate_vue_* methods
    content = content.replace(
        "                return self._generate_vue_rest(base_path, base_url, auth_type, timeout)",
        """                return self._generate_vue_rest(
                    base_path, base_url, auth_type, timeout
                )""",
    )

    content = content.replace(
        "                return self._generate_vue_graphql(base_path, base_url, auth_type)",
        """                return self._generate_vue_graphql(
                    base_path, base_url, auth_type
                )""",
    )

    content = content.replace(
        "                return self._generate_vue_websocket(base_path, base_url)",
        """                return self._generate_vue_websocket(
                    base_path, base_url
                )""",
    )

    # 9. Split return statements for _generate_nodejs_* methods
    content = content.replace(
        "                return self._generate_nodejs_rest(base_path, base_url, auth_type, timeout)",
        """                return self._generate_nodejs_rest(
                    base_path, base_url, auth_type, timeout
                )""",
    )

    content = content.replace(
        "                return self._generate_nodejs_graphql(base_path, base_url, auth_type)",
        """                return self._generate_nodejs_graphql(
                    base_path, base_url, auth_type
                )""",
    )

    content = content.replace(
        "                return self._generate_nodejs_websocket(base_path, base_url)",
        """                return self._generate_nodejs_websocket(
                    base_path, base_url
                )""",
    )

    # 10. Split final error return
    content = content.replace(
        '        return {"success": False, "error": f"Kombination {framework} + {protocol} noch nicht implementiert"}',
        """        return {
            "success": False,
            "error": (
                f"Kombination {framework} + {protocol} "
                "noch nicht implementiert"
            )
        }""",
    )

    # 11. Split function signatures
    content = content.replace(
        "    def _generate_flutter_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:",
        """    def _generate_flutter_rest(
        self, base_path: str, base_url: str,
        auth_type: str, timeout: int
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_flutter_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:",
        """    def _generate_flutter_graphql(
        self, base_path: str, base_url: str, auth_type: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_flutter_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:",
        """    def _generate_flutter_websocket(
        self, base_path: str, base_url: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_react_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:",
        """    def _generate_react_rest(
        self, base_path: str, base_url: str,
        auth_type: str, timeout: int
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_react_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:",
        """    def _generate_react_graphql(
        self, base_path: str, base_url: str, auth_type: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_react_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:",
        """    def _generate_react_websocket(
        self, base_path: str, base_url: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_nextjs_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:",
        """    def _generate_nextjs_rest(
        self, base_path: str, base_url: str,
        auth_type: str, timeout: int
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        '        """Next.js REST Client (similar to React but with server-side support)"""',
        '''        """Next.js REST Client.

        Similar to React but with server-side support.
        """''',
    )

    content = content.replace(
        "        return self._generate_react_rest(base_path, base_url, auth_type, timeout)",
        """        return self._generate_react_rest(
            base_path, base_url, auth_type, timeout
        )""",
    )

    content = content.replace(
        "    def _generate_nextjs_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:",
        """    def _generate_nextjs_graphql(
        self, base_path: str, base_url: str, auth_type: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_nextjs_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:",
        """    def _generate_nextjs_websocket(
        self, base_path: str, base_url: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_vue_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:",
        """    def _generate_vue_rest(
        self, base_path: str, base_url: str,
        auth_type: str, timeout: int
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_vue_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:",
        """    def _generate_vue_graphql(
        self, base_path: str, base_url: str, auth_type: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        '        return {"success": False, "error": "Vue GraphQL kommt in nächster Version"}',
        """        return {
            "success": False,
            "error": "Vue GraphQL kommt in nächster Version"
        }""",
    )

    content = content.replace(
        "    def _generate_vue_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:",
        """    def _generate_vue_websocket(
        self, base_path: str, base_url: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        '        return {"success": False, "error": "Vue WebSocket kommt in nächster Version"}',
        """        return {
            "success": False,
            "error": "Vue WebSocket kommt in nächster Version"
        }""",
    )

    content = content.replace(
        "    def _generate_nodejs_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:",
        """    def _generate_nodejs_rest(
        self, base_path: str, base_url: str,
        auth_type: str, timeout: int
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        "    def _generate_nodejs_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:",
        """    def _generate_nodejs_graphql(
        self, _base_path: str, _base_url: str, _auth_type: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        '        return {"success": False, "error": "Node.js GraphQL kommt in nächster Version"}',
        """        return {
            "success": False,
            "error": "Node.js GraphQL kommt in nächster Version"
        }""",
    )

    content = content.replace(
        "    def _generate_nodejs_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:",
        """    def _generate_nodejs_websocket(
        self, _base_path: str, _base_url: str
    ) -> Dict[str, Any]:""",
    )

    content = content.replace(
        '        return {"success": False, "error": "Node.js WebSocket kommt in nächster Version"}',
        """        return {
            "success": False,
            "error": "Node.js WebSocket kommt in nächster Version"
        }""",
    )

    # 12. Fix ws_url lines (both occurrences)
    content = re.sub(
        r'        ws_url = base_url\.replace\("https://", "wss://"\)\.replace\("http://", "ws://"\)',
        '        ws_url = base_url.replace(\n            "https://", "wss://"\n        ).replace("http://", "ws://")',
        content,
    )

    # 13. Fix features list
    content = content.replace(
        '            "features": ["Auth Token", "Timeout", "React Hook", "Error Handling"]',
        """            "features": [
                "Auth Token", "Timeout", "React Hook",
                "Error Handling"
            ]""",
    )

    # 14. Add encoding to open() calls
    content = re.sub(
        r'            with open\(filepath, "w"\) as f:',
        '            with open(filepath, "w", encoding="utf-8") as f:',
        content,
    )

    # 15. Fix unused auth_type in _generate_flutter_graphql
    # Find line "self, base_path: str, base_url: str, auth_type: str" in _generate_flutter_graphql
    # and change auth_type to _auth_type
    pattern = r"(_generate_flutter_graphql\(\s+self, base_path: str, base_url: str,) auth_type: str"
    replacement = r"\1 _auth_type: str"
    content = re.sub(pattern, replacement, content)

    # 16. Shorten comment lines in triple-quoted strings from 65 to 40 dashes
    # Pattern: '''// followed by 65 or more dashes
    content = re.sub(r"('''// )-{65,}", r"\1" + "-" * 40, content)
    content = re.sub(r"(f'''// )-{65,}", r"\1" + "-" * 40, content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print("Fixed all linting errors in api_generator.py!")
    print("Changes applied:")
    print("  - Removed unused List import")
    print("  - Split long lines (signatures, return statements, error messages)")
    print("  - Fixed ws_url lines")
    print("  - Added encoding to open() calls")
    print("  - Prefixed unused parameters with _")
    print("  - Shortened comment lines in templates")


if __name__ == "__main__":
    fix_api_generator()