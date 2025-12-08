# -------------------------------------------------------------
# VIBEAI – API CONNECTOR GENERATOR (REST + GraphQL + WebSockets)
# -------------------------------------------------------------
import os
from typing import Any, Dict, Optional


class APIConnectorGenerator:
    """
    Generiert API-Clients für verschiedene Protokolle und Frameworks:
    - REST: HTTP-Clients mit GET, POST, PUT, DELETE
    - GraphQL: Query/Mutation Clients
    - WebSockets: Real-time Communication
    - Frameworks: Flutter, React, Next.js, Vue, Node.js
    """

    def __init__(self):
        self.supported_protocols = ["rest", "graphql", "websocket"]
        self.supported_frameworks = ["flutter", "react", "nextjs", "vue", "nodejs"]

    def generate_api_client(
        self,
        framework: str,
        protocol: str,
        base_path: str,
        options: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Generiert API-Client Code

        Args:
            framework: flutter, react, nextjs, vue, nodejs
            protocol: rest, graphql, websocket
            base_path: Ziel-Verzeichnis
            options: Optionale Konfiguration (base_url, auth_type, timeout, etc.)

        Returns:
            Dict mit success, files, framework, protocol, features
        """
        if framework not in self.supported_frameworks:
            return {
                "success": False,
                "error": f"Framework '{framework}' nicht unterstützt. Verfügbar: {self.supported_frameworks}",
            }

        if protocol not in self.supported_protocols:
            return {
                "success": False,
                "error": f"Protokoll '{protocol}' nicht unterstützt. Verfügbar: {self.supported_protocols}",
            }

        options = options or {}
        base_url = options.get("base_url", "https://api.example.com")
        auth_type = options.get("auth_type", "bearer")  # bearer, basic, none
        timeout = options.get("timeout", 30000)

        # Framework + Protokoll Routing
        if framework == "flutter":
            if protocol == "rest":
                return self._generate_flutter_rest(base_path, base_url, auth_type, timeout)
            elif protocol == "graphql":
                return self._generate_flutter_graphql(base_path, base_url, auth_type)
            elif protocol == "websocket":
                return self._generate_flutter_websocket(base_path, base_url)

        elif framework == "react":
            if protocol == "rest":
                return self._generate_react_rest(base_path, base_url, auth_type, timeout)
            elif protocol == "graphql":
                return self._generate_react_graphql(base_path, base_url, auth_type)
            elif protocol == "websocket":
                return self._generate_react_websocket(base_path, base_url)

        elif framework == "nextjs":
            if protocol == "rest":
                return self._generate_nextjs_rest(base_path, base_url, auth_type, timeout)
            elif protocol == "graphql":
                return self._generate_nextjs_graphql(base_path, base_url, auth_type)
            elif protocol == "websocket":
                return self._generate_nextjs_websocket(base_path, base_url)

        elif framework == "vue":
            if protocol == "rest":
                return self._generate_vue_rest(base_path, base_url, auth_type, timeout)
            elif protocol == "graphql":
                return self._generate_vue_graphql(base_path, base_url, auth_type)
            elif protocol == "websocket":
                return self._generate_vue_websocket(base_path, base_url)

        elif framework == "nodejs":
            if protocol == "rest":
                return self._generate_nodejs_rest(base_path, base_url, auth_type, timeout)
            elif protocol == "graphql":
                return self._generate_nodejs_graphql(base_path, base_url, auth_type)
            elif protocol == "websocket":
                return self._generate_nodejs_websocket(base_path, base_url)

        return {"success": False, "error": "Ungültige Framework/Protokoll Kombination"}

    # ==================== FLUTTER ====================

    def _generate_flutter_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:
        """Flutter REST Client"""
        files = {}
        api_dir = os.path.join(base_path, "lib", "api")

        files[
            "rest_client.dart"
        ] = f"""// -------------------------------------------------------------
// Flutter REST API Client
// -------------------------------------------------------------
import 'dart:convert';
import 'package:http/http.dart' as http;

class RestClient {{
  static const String baseUrl = "{base_url}";
  static const int timeout = {timeout};
  static String? authToken;

  static Map<String, String> _getHeaders() {{
    final headers = {{"Content-Type": "application/json"}};
    if (authToken != null && authToken!.isNotEmpty) {{
      headers["Authorization"] = "{auth_type} $authToken";
    }}
    return headers;
  }}

  static Future<dynamic> get(String path) async {{
    try {{
      final uri = Uri.parse("$baseUrl$path");
      final response = await http.get(
        uri,
        headers: _getHeaders(),
      ).timeout(Duration(milliseconds: timeout));

      if (response.statusCode >= 200 && response.statusCode < 300) {{
        return jsonDecode(response.body);
      }} else {{
        throw Exception("HTTP ${{response.statusCode}}: ${{response.body}}");
      }}
    }} catch (e) {{
      throw Exception("GET Request failed: $e");
    }}
  }}

  static Future<dynamic> post(String path, Map<String, dynamic> data) async {{
    try {{
      final uri = Uri.parse("$baseUrl$path");
      final response = await http.post(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(data),
      ).timeout(Duration(milliseconds: timeout));

      if (response.statusCode >= 200 && response.statusCode < 300) {{
        return jsonDecode(response.body);
      }} else {{
        throw Exception("HTTP ${{response.statusCode}}: ${{response.body}}");
      }}
    }} catch (e) {{
      throw Exception("POST Request failed: $e");
    }}
  }}

  static Future<dynamic> put(String path, Map<String, dynamic> data) async {{
    try {{
      final uri = Uri.parse("$baseUrl$path");
      final response = await http.put(
        uri,
        headers: _getHeaders(),
        body: jsonEncode(data),
      ).timeout(Duration(milliseconds: timeout));

      if (response.statusCode >= 200 && response.statusCode < 300) {{
        return jsonDecode(response.body);
      }} else {{
        throw Exception("HTTP ${{response.statusCode}}: ${{response.body}}");
      }}
    }} catch (e) {{
      throw Exception("PUT Request failed: $e");
    }}
  }}

  static Future<dynamic> delete(String path) async {{
    try {{
      final uri = Uri.parse("$baseUrl$path");
      final response = await http.delete(
        uri,
        headers: _getHeaders(),
      ).timeout(Duration(milliseconds: timeout));

      if (response.statusCode >= 200 && response.statusCode < 300) {{
        return jsonDecode(response.body);
      }} else {{
        throw Exception("HTTP ${{response.statusCode}}: ${{response.body}}");
      }}
    }} catch (e) {{
      throw Exception("DELETE Request failed: $e");
    }}
  }}

  static void setAuthToken(String token) {{
    authToken = token;
  }}

  static void clearAuthToken() {{
    authToken = null;
  }}
}}
"""

        files[
            "api_service.dart"
        ] = """// -------------------------------------------------------------
// API Service Layer (Example)
// -------------------------------------------------------------
import 'rest_client.dart';

class ApiService {
  // User endpoints
  static Future<dynamic> getUsers() async {
    return await RestClient.get('/users');
  }

  static Future<dynamic> getUser(String id) async {
    return await RestClient.get('/users/$id');
  }

  static Future<dynamic> createUser(Map<String, dynamic> data) async {
    return await RestClient.post('/users', data);
  }

  static Future<dynamic> updateUser(String id, Map<String, dynamic> data) async {
    return await RestClient.put('/users/$id', data);
  }

  static Future<dynamic> deleteUser(String id) async {
    return await RestClient.delete('/users/$id');
  }

  // Auth endpoints
  static Future<dynamic> login(String email, String password) async {
    final response = await RestClient.post('/auth/login', {
      'email': email,
      'password': password,
    });

    if (response['token'] != null) {
      RestClient.setAuthToken(response['token']);
    }

    return response;
  }

  static void logout() {
    RestClient.clearAuthToken();
  }
}
"""

        files[
            "pubspec.yaml"
        ] = """name: api_client
dependencies:
  http: ^1.1.0
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "flutter",
            "protocol": "rest",
            "files": created_files,
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "features": ["Auth Token", "Timeout", "Error Handling"],
        }

    def _generate_flutter_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:
        """Flutter GraphQL Client"""
        files = {}
        api_dir = os.path.join(base_path, "lib", "api")

        files[
            "graphql_client.dart"
        ] = f"""// -------------------------------------------------------------
// Flutter GraphQL Client
// -------------------------------------------------------------
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLService {{
  static late GraphQLClient client;

  static void init() {{
    final HttpLink httpLink = HttpLink("{base_url}/graphql");

    client = GraphQLClient(
      link: httpLink,
      cache: GraphQLCache(),
    );
  }}

  static Future<QueryResult> query(String queryString) async {{
    final QueryOptions options = QueryOptions(document: gql(queryString));
    return await client.query(options);
  }}

  static Future<QueryResult> mutate(String mutationString) async {{
    final MutationOptions options = MutationOptions(document: gql(mutationString));
    return await client.mutate(options);
  }}
}}
"""

        files[
            "pubspec.yaml"
        ] = """name: graphql_client
dependencies:
  graphql_flutter: ^5.1.0
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "flutter",
            "protocol": "graphql",
            "files": created_files,
            "methods": ["Query", "Mutation"],
            "features": ["Cache", "Link", "Error Handling"],
        }

    def _generate_flutter_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:
        """Flutter WebSocket Client"""
        files = {}
        api_dir = os.path.join(base_path, "lib", "api")

        ws_url = base_url.replace("https://", "wss://").replace("http://", "ws://")

        files[
            "websocket_client.dart"
        ] = f"""// -------------------------------------------------------------
// Flutter WebSocket Client
// -------------------------------------------------------------
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {{
  static WebSocketChannel? channel;

  static void connect() {{
    channel = WebSocketChannel.connect(Uri.parse("{ws_url}"));
  }}

  static void send(String message) {{
    channel?.sink.add(message);
  }}

  static Stream get stream {{
    return channel!.stream;
  }}

  static void disconnect() {{
    channel?.sink.close();
  }}
}}
"""

        files[
            "pubspec.yaml"
        ] = """name: websocket_client
dependencies:
  web_socket_channel: ^2.4.0
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "flutter",
            "protocol": "websocket",
            "files": created_files,
            "methods": ["Connect", "Send", "Stream", "Disconnect"],
            "features": ["Real-time", "Channel"],
        }

    # ==================== REACT ====================

    def _generate_react_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:
        """React REST Client"""
        files = {}
        api_dir = os.path.join(base_path, "src", "api")

        files[
            "client.js"
        ] = f"""// -------------------------------------------------------------
// React REST API Client
// -------------------------------------------------------------

const BASE_URL = "{base_url}";
const TIMEOUT = {timeout};

let authToken = null;

const getHeaders = () => {{
  const headers = {{ "Content-Type": "application/json" }};
  if (authToken) {{
    headers["Authorization"] = `{auth_type} ${{authToken}}`;
  }}
  return headers;
}};

const fetchWithTimeout = (url, options = {{}}) => {{
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT)
    )
  ]);
}};

export const api = {{
  get: async (path) => {{
    try {{
      const response = await fetchWithTimeout(`${{BASE_URL}}${{path}}`, {{
        method: "GET",
        headers: getHeaders()
      }});

      if (!response.ok) {{
        throw new Error(`HTTP ${{response.status}}: ${{response.statusText}}`);
      }}

      return await response.json();
    }} catch (error) {{
      console.error("GET Request failed:", error);
      throw error;
    }}
  }},

  post: async (path, data) => {{
    try {{
      const response = await fetchWithTimeout(`${{BASE_URL}}${{path}}`, {{
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
      }});

      if (!response.ok) {{
        throw new Error(`HTTP ${{response.status}}: ${{response.statusText}}`);
      }}

      return await response.json();
    }} catch (error) {{
      console.error("POST Request failed:", error);
      throw error;
    }}
  }},

  put: async (path, data) => {{
    try {{
      const response = await fetchWithTimeout(`${{BASE_URL}}${{path}}`, {{
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
      }});

      if (!response.ok) {{
        throw new Error(`HTTP ${{response.status}}: ${{response.statusText}}`);
      }}

      return await response.json();
    }} catch (error) {{
      console.error("PUT Request failed:", error);
      throw error;
    }}
  }},

  delete: async (path) => {{
    try {{
      const response = await fetchWithTimeout(`${{BASE_URL}}${{path}}`, {{
        method: "DELETE",
        headers: getHeaders()
      }});

      if (!response.ok) {{
        throw new Error(`HTTP ${{response.status}}: ${{response.statusText}}`);
      }}

      return await response.json();
    }} catch (error) {{
      console.error("DELETE Request failed:", error);
      throw error;
    }}
  }},

  setAuthToken: (token) => {{
    authToken = token;
  }},

  clearAuthToken: () => {{
    authToken = null;
  }}
}};
"""

        files[
            "apiService.js"
        ] = """// -------------------------------------------------------------
// API Service Layer (Example)
// -------------------------------------------------------------
import { api } from './client';

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      api.setAuthToken(response.token);
    }
    return response;
  },

  logout: () => {
    api.clearAuthToken();
  }
};
"""

        files[
            "useApi.js"
        ] = """// -------------------------------------------------------------
// React Hook for API Calls
// -------------------------------------------------------------
import { useState, useEffect } from 'react';

export function useApi(apiCall, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiCall();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "react",
            "protocol": "rest",
            "files": created_files,
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "features": ["Auth Token", "Timeout", "React Hook", "Error Handling"],
        }

    def _generate_react_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:
        """React GraphQL Client"""
        files = {}
        api_dir = os.path.join(base_path, "src", "api")

        files[
            "graphqlClient.js"
        ] = f"""// -------------------------------------------------------------
// React GraphQL Client (Apollo)
// -------------------------------------------------------------
import {{ ApolloClient, InMemoryCache, createHttpLink }} from '@apollo/client';
import {{ setContext }} from '@apollo/client/link/context';

const httpLink = createHttpLink({{
  uri: '{base_url}/graphql',
}});

const authLink = setContext((_, {{ headers }}) => {{
  const token = localStorage.getItem('authToken');
  return {{
    headers: {{
      ...headers,
      authorization: token ? `{auth_type} ${{token}}` : "",
    }}
  }};
}});

export const client = new ApolloClient({{
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
}});
"""

        files[
            "queries.js"
        ] = """// -------------------------------------------------------------
// GraphQL Queries & Mutations
// -------------------------------------------------------------
import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
`;
"""

        files[
            "package.json"
        ] = """{
  "dependencies": {
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0"
  }
}
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "react",
            "protocol": "graphql",
            "files": created_files,
            "methods": ["Query", "Mutation"],
            "features": ["Apollo Client", "Cache", "Auth Link"],
        }

    def _generate_react_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:
        """React WebSocket Client"""
        files = {}
        api_dir = os.path.join(base_path, "src", "api")

        ws_url = base_url.replace("https://", "wss://").replace("http://", "ws://")

        files[
            "websocketClient.js"
        ] = f"""// -------------------------------------------------------------
// React WebSocket Client
// -------------------------------------------------------------

class WebSocketClient {{
  constructor() {{
    this.ws = null;
    this.listeners = new Map();
  }}

  connect() {{
    this.ws = new WebSocket("{ws_url}");

    this.ws.onopen = () => {{
      console.log("WebSocket connected");
      this.emit('connected');
    }};

    this.ws.onmessage = (event) => {{
      const data = JSON.parse(event.data);
      this.emit('message', data);
    }};

    this.ws.onerror = (error) => {{
      console.error("WebSocket error:", error);
      this.emit('error', error);
    }};

    this.ws.onclose = () => {{
      console.log("WebSocket disconnected");
      this.emit('disconnected');
    }};
  }}

  send(message) {{
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {{
      this.ws.send(JSON.stringify(message));
    }}
  }}

  on(event, callback) {{
    if (!this.listeners.has(event)) {{
      this.listeners.set(event, []);
    }}
    this.listeners.get(event).push(callback);
  }}

  emit(event, data) {{
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }}

  disconnect() {{
    if (this.ws) {{
      this.ws.close();
    }}
  }}
}}

export const wsClient = new WebSocketClient();
"""

        files[
            "useWebSocket.js"
        ] = """// -------------------------------------------------------------
// React WebSocket Hook
// -------------------------------------------------------------
import { useEffect, useState } from 'react';
import { wsClient } from './websocketClient';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    wsClient.on('connected', () => setConnected(true));
    wsClient.on('disconnected', () => setConnected(false));
    wsClient.on('message', (msg) => setMessages(prev => [...prev, msg]));

    wsClient.connect();

    return () => {
      wsClient.disconnect();
    };
  }, []);

  return {
    connected,
    messages,
    send: wsClient.send.bind(wsClient)
  };
}
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "react",
            "protocol": "websocket",
            "files": created_files,
            "methods": ["Connect", "Send", "On", "Disconnect"],
            "features": ["Event Listeners", "React Hook", "Auto-reconnect"],
        }

    # ==================== NEXT.JS ====================

    def _generate_nextjs_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:
        """Next.js REST Client (similar to React but with server-side support)"""
        return self._generate_react_rest(base_path, base_url, auth_type, timeout)

    def _generate_nextjs_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:
        """Next.js GraphQL Client"""
        return self._generate_react_graphql(base_path, base_url, auth_type)

    def _generate_nextjs_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:
        """Next.js WebSocket Client"""
        return self._generate_react_websocket(base_path, base_url)

    # ==================== VUE ====================

    def _generate_vue_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:
        """Vue 3 REST Client"""
        files = {}
        api_dir = os.path.join(base_path, "src", "api")

        files[
            "client.js"
        ] = f"""// -------------------------------------------------------------
// Vue 3 REST API Client
// -------------------------------------------------------------
import axios from 'axios';

const client = axios.create({{
  baseURL: '{base_url}',
  timeout: {timeout},
  headers: {{ 'Content-Type': 'application/json' }}
}});

client.interceptors.request.use(config => {{
  const token = localStorage.getItem('authToken');
  if (token) {{
    config.headers.Authorization = `{auth_type} ${{token}}`;
  }}
  return config;
}});

export default client;
"""

        files[
            "apiService.js"
        ] = """// -------------------------------------------------------------
// Vue API Service
// -------------------------------------------------------------
import client from './client';

export const api = {
  get: (path) => client.get(path).then(res => res.data),
  post: (path, data) => client.post(path, data).then(res => res.data),
  put: (path, data) => client.put(path, data).then(res => res.data),
  delete: (path) => client.delete(path).then(res => res.data)
};
"""

        files[
            "package.json"
        ] = """{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "vue",
            "protocol": "rest",
            "files": created_files,
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "features": ["Axios", "Interceptors", "Auth Token"],
        }

    def _generate_vue_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:
        """Vue GraphQL Client"""
        return {"success": False, "error": "Vue GraphQL kommt in nächster Version"}

    def _generate_vue_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:
        """Vue WebSocket Client"""
        return {"success": False, "error": "Vue WebSocket kommt in nächster Version"}

    # ==================== NODE.JS ====================

    def _generate_nodejs_rest(self, base_path: str, base_url: str, auth_type: str, timeout: int) -> Dict[str, Any]:
        """Node.js REST Client"""
        files = {}
        api_dir = os.path.join(base_path, "api")

        files[
            "client.js"
        ] = f"""// -------------------------------------------------------------
// Node.js REST API Client
// -------------------------------------------------------------
const axios = require('axios');

const client = axios.create({{
  baseURL: '{base_url}',
  timeout: {timeout},
  headers: {{ 'Content-Type': 'application/json' }}
}});

let authToken = null;

client.interceptors.request.use(config => {{
  if (authToken) {{
    config.headers.Authorization = `{auth_type} ${{authToken}}`;
  }}
  return config;
}});

module.exports = {{
  get: (path) => client.get(path).then(res => res.data),
  post: (path, data) => client.post(path, data).then(res => res.data),
  put: (path, data) => client.put(path, data).then(res => res.data),
  delete: (path) => client.delete(path).then(res => res.data),
  setAuthToken: (token) => {{ authToken = token; }},
  clearAuthToken: () => {{ authToken = null; }}
}};
"""

        files[
            "package.json"
        ] = """{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
"""

        os.makedirs(api_dir, exist_ok=True)

        created_files = []
        for filename, content in files.items():
            filepath = os.path.join(api_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            created_files.append(filepath)

        return {
            "success": True,
            "framework": "nodejs",
            "protocol": "rest",
            "files": created_files,
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "features": ["Axios", "Interceptors", "Auth Token"],
        }

    def _generate_nodejs_graphql(self, base_path: str, base_url: str, auth_type: str) -> Dict[str, Any]:
        """Node.js GraphQL Client"""
        return {"success": False, "error": "Node.js GraphQL kommt in nächster Version"}

    def _generate_nodejs_websocket(self, base_path: str, base_url: str) -> Dict[str, Any]:
        """Node.js WebSocket Client"""
        return {
            "success": False,
            "error": "Node.js WebSocket kommt in nächster Version",
        }


api_connector_generator = APIConnectorGenerator()