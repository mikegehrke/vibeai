"""
VIBEAI - State Management Generator

Generiert State Management Code für verschiedene Frameworks:
- Flutter: Riverpod, Provider, Bloc, GetX
- React: Zustand, Redux, Context API, Recoil
- Vue: Pinia, Vuex
"""

import os
from typing import Any, Dict, List, Optional


class StateManager:
    """State Management Code Generator"""

    def __init__(self):
        self.supported_frameworks = {
            "flutter": ["riverpod", "provider", "bloc", "getx"],
            "react": ["zustand", "redux", "context", "recoil"],
            "vue": ["pinia", "vuex"],
        }

    # ============================================================
    # FLUTTER STATE MANAGEMENT
    # ============================================================

    def create_riverpod(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert Flutter Riverpod State Provider"""
        fields = fields or [{"name": "count", "type": "int", "default": "0"}]

        state_class = f"""
class {state_name.capitalize()}State {{
  {chr(10).join([f'  final {f["type"]} {f["name"]};' for f in fields])}

  {state_name.capitalize()}State({{
    {chr(10).join([f'    required this.{f["name"]},' for f in fields])}
  }});

  {state_name.capitalize()}State copyWith({{
    {chr(10).join([f'    {f["type"]}? {f["name"]},' for f in fields])}
  }}) {{
    return {state_name.capitalize()}State(
      {chr(10).join([f'      {f["name"]}: {f["name"]} ?? this.{f["name"]},' for f in fields])}
    );
  }}
}}
"""

        provider_code = f"""
final {state_name}Provider = StateNotifierProvider<{state_name.capitalize()}Notifier, {state_name.capitalize()}State>(
  (ref) => {state_name.capitalize()}Notifier(),
);

class {state_name.capitalize()}Notifier extends StateNotifier<{state_name.capitalize()}State> {{
  {state_name.capitalize()}Notifier() : super({state_name.capitalize()}State(
    {chr(10).join([f'    {f["name"]}: {f["default"]},' for f in fields])}
  ));

  void update{fields[0]["name"].capitalize()}({fields[0]["type"]} value) {{
    state = state.copyWith({fields[0]["name"]}: value);
  }}
}}
"""

        return f"""import 'package:flutter_riverpod/flutter_riverpod.dart';
{state_class}
{provider_code}
"""

    def create_provider(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert Flutter Provider"""
        fields = fields or [{"name": "count", "type": "int", "default": "0"}]

        return f"""import 'package:flutter/foundation.dart';

class {state_name.capitalize()}Provider with ChangeNotifier {{
  {chr(10).join([f'  {f["type"]} _{f["name"]} = {f["default"]};' for f in fields])}

{chr(10).join([f'''  {f["type"]} get {f["name"]} => _{f["name"]};

  void set{f["name"].capitalize()}({f["type"]} value) {{
    _{f["name"]} = value;
    notifyListeners();
  }}''' for f in fields])}
}}
"""

    def create_bloc(self, state_name: str = "app") -> str:
        """Generiert Flutter Bloc"""
        return f"""import 'package:flutter_bloc/flutter_bloc.dart';

// Events
abstract class {state_name.capitalize()}Event {{}}

class Increment extends {state_name.capitalize()}Event {{}}
class Decrement extends {state_name.capitalize()}Event {{}}

// State
class {state_name.capitalize()}State {{
  final int count;
  {state_name.capitalize()}State({{this.count = 0}});
}}

// Bloc
class {state_name.capitalize()}Bloc extends Bloc<{state_name.capitalize()}Event, {state_name.capitalize()}State> {{
  {state_name.capitalize()}Bloc() : super({state_name.capitalize()}State()) {{
    on<Increment>((event, emit) => emit({state_name.capitalize()}State(count: state.count + 1)));
    on<Decrement>((event, emit) => emit({state_name.capitalize()}State(count: state.count - 1)));
  }}
}}
"""

    def create_getx(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert Flutter GetX Controller"""
        fields = fields or [{"name": "count", "type": "int", "default": "0"}]

        return f"""import 'package:get/get.dart';

class {state_name.capitalize()}Controller extends GetxController {{
  {chr(10).join([f'  var {f["name"]} = {f["default"]}.obs;' for f in fields])}

  void increment() {{
    count.value++;
  }}
}}
"""

    # ============================================================
    # REACT STATE MANAGEMENT
    # ============================================================

    def create_zustand(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert React Zustand Store"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        state_fields = ", ".join([f"{f['name']}: {f['default']}" for f in fields])
        actions = "\n  ".join(
            [f"set{f['name'].capitalize()}: (value) => set({{ {f['name']}: value }})," for f in fields]
        )

        return f"""import {{ create }} from 'zustand';

export const use{state_name.capitalize()}Store = create((set) => ({{
  {state_fields},
  {actions}
  increment: () => set((state) => ({{ count: state.count + 1 }})),
  decrement: () => set((state) => ({{ count: state.count - 1 }}))
}}));
"""

    def create_redux(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert React Redux Store"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        initial_state = "{ " + ", ".join([f"{f['name']}: {f['default']}" for f in fields]) + " }"

        return f"""import {{ createSlice }} from '@reduxjs/toolkit';

const {state_name}Slice = createSlice({{
  name: '{state_name}',
  initialState: {initial_state},
  reducers: {{
    increment: (state) => {{ state.count += 1; }},
    decrement: (state) => {{ state.count -= 1; }},
    setValue: (state, action) => {{ state.count = action.payload; }}
  }}
}});

export const {{ increment, decrement, setValue }} = {state_name}Slice.actions;
export default {state_name}Slice.reducer;
"""

    def create_context(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert React Context API"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        initial_state = "{ " + ", ".join([f"{f['name']}: {f['default']}" for f in fields]) + " }"

        return f"""import {{ createContext, useContext, useState }} from 'react';

const {state_name.capitalize()}Context = createContext();

export function {state_name.capitalize()}Provider({{ children }}) {{
  const [state, setState] = useState({initial_state});

  const updateState = (updates) => {{
    setState(prev => ({{ ...prev, ...updates }}));
  }};

  return (
    <{state_name.capitalize()}Context.Provider value={{{{ state, updateState }}}}>
      {{children}}
    </{state_name.capitalize()}Context.Provider>
  );
}}

export const use{state_name.capitalize()} = () => useContext({state_name.capitalize()}Context);
"""

    def create_recoil(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert React Recoil Atoms"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        atoms = "\n\n".join(
            [
                f"export const {f['name']}State = atom({{\n  key: '{state_name}_{f['name']}',\n  default: {f['default']}\n}});"
                for f in fields
            ]
        )

        return f"""import {{ atom }} from 'recoil';

{atoms}
"""

    # ============================================================
    # VUE STATE MANAGEMENT
    # ============================================================

    def create_pinia(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert Vue Pinia Store"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        state_fields = ",\n    ".join([f"{f['name']}: {f['default']}" for f in fields])
        actions = "\n    ".join([f"{f['name'].capitalize()}(value) {{ this.{f['name']} = value; }}," for f in fields])

        return f"""import {{ defineStore }} from 'pinia';

export const use{state_name.capitalize()}Store = defineStore('{state_name}', {{
  state: () => ({{
    {state_fields}
  }}),
  actions: {{
    {actions}
    increment() {{ this.count++; }},
    decrement() {{ this.count--; }}
  }}
}});
"""

    def create_vuex(self, state_name: str = "app", fields: List[Dict] = None) -> str:
        """Generiert Vue Vuex Store"""
        fields = fields or [{"name": "count", "type": "number", "default": "0"}]

        state_fields = ",\n    ".join([f"{f['name']}: {f['default']}" for f in fields])
        mutations = "\n    ".join(
            [f"SET_{f['name'].upper()}(state, value) {{ state.{f['name']} = value; }}," for f in fields]
        )

        return f"""import {{ createStore }} from 'vuex';

export default createStore({{
  state: {{
    {state_fields}
  }},
  mutations: {{
    {mutations}
    INCREMENT(state) {{ state.count++; }},
    DECREMENT(state) {{ state.count--; }}
  }},
  actions: {{
    increment({{ commit }}) {{ commit('INCREMENT'); }},
    decrement({{ commit }}) {{ commit('DECREMENT'); }}
  }}
}});
"""

    # ============================================================
    # UNIVERSAL GENERATOR
    # ============================================================

    def generate_state(
        self,
        framework: str,
        library: str,
        state_name: str = "app",
        fields: List[Dict] = None,
        base_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Universal State Management Generator

        Args:
            framework: flutter | react | vue
            library: riverpod | provider | bloc | getx | zustand | redux | context | recoil | pinia | vuex
            state_name: Name des State
            fields: Liste von State-Feldern [{"name": "count", "type": "int", "default": "0"}]
            base_path: Optional - Pfad zum Speichern der Datei

        Returns:
            {success: bool, code: str, file_path: str, library: str}
        """
        try:
            framework = framework.lower()
            library = library.lower()

            # Method Mapping
            generators = {
                "riverpod": self.create_riverpod,
                "provider": self.create_provider,
                "bloc": self.create_bloc,
                "getx": self.create_getx,
                "zustand": self.create_zustand,
                "redux": self.create_redux,
                "context": self.create_context,
                "recoil": self.create_recoil,
                "pinia": self.create_pinia,
                "vuex": self.create_vuex,
            }

            if library not in generators:
                return {
                    "success": False,
                    "error": f"Unsupported library: {library}",
                    "supported": self.supported_frameworks,
                }

            # Code generieren
            if library in ["riverpod", "provider", "getx"]:
                code = generators[library](state_name, fields)
            elif library == "bloc":
                code = generators[library](state_name)
            else:
                code = generators[library](state_name, fields)

            result = {
                "success": True,
                "code": code,
                "framework": framework,
                "library": library,
                "state_name": state_name,
            }

            # Optional: Datei schreiben
            if base_path:
                file_extensions = {"flutter": ".dart", "react": ".js", "vue": ".js"}
                ext = file_extensions.get(framework, ".txt")
                file_name = f"{state_name}_state{ext}"

                if framework == "flutter":
                    file_path = os.path.join(base_path, "lib", "state", file_name)
                elif framework == "react":
                    file_path = os.path.join(base_path, "src", "store", file_name)
                elif framework == "vue":
                    file_path = os.path.join(base_path, "src", "stores", file_name)
                else:
                    file_path = os.path.join(base_path, file_name)

                os.makedirs(os.path.dirname(file_path), exist_ok=True)

                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(code)

                result["file_path"] = file_path

            return result

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "framework": framework,
                "library": library,
            }


# Singleton Instance
state_manager = StateManager()
