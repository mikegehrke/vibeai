# backend/actions/flutter_project.py
# -----------------------------------
# Flutter To-Do Projekt Generator
# Vollständige App mit Actions nach User-Pattern

import asyncio
from kernel.events import AgentEvent, EVENT_MESSAGE
from actions.filesystem import CreateFile, CreateFolder
from actions.editor import WriteCode
from actions.comments import AddComment


class CreateFlutterTodoProject:
    """Erzeugt vollständiges Flutter To-Do Projekt"""
    
    def __init__(self, root: str = "user_projects/flutter_todo_app"):
        self.root = root
    
    def describe(self):
        return "Ich lege ein neues Flutter To-Do Projekt an."
    
    async def execute(self, streamer):
        """Führt Projekt-Erstellung aus - genau wie Cursor/Copilot"""
        
        # 💬 Ankündigung
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"🚀 {self.describe()}\n\nIch erstelle eine moderne Flutter To-Do App mit Provider State Management."
        ))
        
        await asyncio.sleep(0.3)
        
        # 📁 Ordnerstruktur
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 1: Ordnerstruktur anlegen..."
        ))
        
        folders = [
            f"{self.root}/lib",
            f"{self.root}/lib/models",
            f"{self.root}/lib/screens",
        ]
        
        for folder in folders:
            await CreateFolder(folder).execute(streamer)
        
        # 📄 pubspec.yaml
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 2: Projekt-Konfiguration (pubspec.yaml)..."
        ))
        
        pubspec = """name: flutter_todo_app
description: Einfache To-Do App
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.0.5

flutter:
  uses-material-design: true
"""
        
        await CreateFile(f"{self.root}/pubspec.yaml", pubspec).execute(streamer)
        
        # 💬 main.dart
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 3: Haupt-App (main.dart) - schreibe Code Zeile für Zeile..."
        ))
        
        await CreateFile(f"{self.root}/lib/main.dart", "").execute(streamer)
        
        await WriteCode(
            f"{self.root}/lib/main.dart",
            [
                "import 'package:flutter/material.dart';",
                "import 'package:provider/provider.dart';",
                "import 'models/todo_provider.dart';",
                "import 'screens/home_screen.dart';",
                "",
                "void main() {",
                "  runApp(const TodoApp());",
                "}",
                "",
                "class TodoApp extends StatelessWidget {",
                "  const TodoApp({super.key});",
                "",
                "  @override",
                "  Widget build(BuildContext context) {",
                "    return ChangeNotifierProvider(",
                "      create: (_) => TodoProvider(),",
                "      child: MaterialApp(",
                "        title: 'To-Do App',",
                "        theme: ThemeData(primarySwatch: Colors.blue),",
                "        home: const HomeScreen(),",
                "      ),",
                "    );",
                "  }",
                "}",
            ]
        ).execute(streamer)
        
        await AddComment(
            f"{self.root}/lib/main.dart",
            "Flutter To-Do App - Einstiegspunkt mit Provider Setup"
        ).execute(streamer)
        
        # 💬 Todo Model
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 4: Datenmodell..."
        ))
        
        await CreateFile(f"{self.root}/lib/models/todo.dart", "").execute(streamer)
        
        await WriteCode(
            f"{self.root}/lib/models/todo.dart",
            [
                "class Todo {",
                "  final String id;",
                "  final String title;",
                "  bool isCompleted;",
                "  ",
                "  Todo({required this.id, required this.title, this.isCompleted = false});",
                "  ",
                "  void toggle() => isCompleted = !isCompleted;",
                "}",
            ]
        ).execute(streamer)
        
        # 💬 Provider
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 5: State Management..."
        ))
        
        await CreateFile(f"{self.root}/lib/models/todo_provider.dart", "").execute(streamer)
        
        await WriteCode(
            f"{self.root}/lib/models/todo_provider.dart",
            [
                "import 'package:flutter/foundation.dart';",
                "import 'todo.dart';",
                "",
                "class TodoProvider extends ChangeNotifier {",
                "  final List<Todo> _todos = [];",
                "  List<Todo> get todos => [..._todos];",
                "  ",
                "  void addTodo(String title) {",
                "    _todos.add(Todo(id: DateTime.now().toString(), title: title));",
                "    notifyListeners();",
                "  }",
                "  ",
                "  void toggleTodo(String id) {",
                "    _todos.firstWhere((t) => t.id == id).toggle();",
                "    notifyListeners();",
                "  }",
                "}",
            ]
        ).execute(streamer)
        
        # 💬 Home Screen
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message="Schritt 6: Home Screen UI..."
        ))
        
        await CreateFile(f"{self.root}/lib/screens/home_screen.dart", "").execute(streamer)
        
        await WriteCode(
            f"{self.root}/lib/screens/home_screen.dart",
            [
                "import 'package:flutter/material.dart';",
                "import 'package:provider/provider.dart';",
                "import '../models/todo_provider.dart';",
                "",
                "class HomeScreen extends StatelessWidget {",
                "  const HomeScreen({super.key});",
                "",
                "  @override",
                "  Widget build(BuildContext context) {",
                "    return Scaffold(",
                "      appBar: AppBar(title: const Text('Meine Aufgaben')),",
                "      body: Consumer<TodoProvider>(",
                "        builder: (context, provider, child) {",
                "          if (provider.todos.isEmpty) {",
                "            return const Center(child: Text('Keine Aufgaben!'));",
                "          }",
                "          return ListView.builder(",
                "            itemCount: provider.todos.length,",
                "            itemBuilder: (context, index) {",
                "              final todo = provider.todos[index];",
                "              return ListTile(",
                "                leading: Checkbox(",
                "                  value: todo.isCompleted,",
                "                  onChanged: (_) => provider.toggleTodo(todo.id),",
                "                ),",
                "                title: Text(todo.title),",
                "              );",
                "            },",
                "          );",
                "        },",
                "      ),",
                "      floatingActionButton: FloatingActionButton(",
                "        onPressed: () => _showAddDialog(context),",
                "        child: const Icon(Icons.add),",
                "      ),",
                "    );",
                "  }",
                "  ",
                "  void _showAddDialog(BuildContext context) {",
                "    final ctrl = TextEditingController();",
                "    showDialog(",
                "      context: context,",
                "      builder: (c) => AlertDialog(",
                "        title: const Text('Neue Aufgabe'),",
                "        content: TextField(controller: ctrl),",
                "        actions: [",
                "          TextButton(",
                "            onPressed: () => Navigator.pop(context),",
                "            child: const Text('Abbrechen'),",
                "          ),",
                "          ElevatedButton(",
                "            onPressed: () {",
                "              if (ctrl.text.isNotEmpty) {",
                "                context.read<TodoProvider>().addTodo(ctrl.text);",
                "                Navigator.pop(context);",
                "              }",
                "            },",
                "            child: const Text('OK'),",
                "          ),",
                "        ],",
                "      ),",
                "    );",
                "  }",
                "}",
            ]
        ).execute(streamer)
        
        # ✅ Fertig
        await streamer.send_event(AgentEvent(
            type=EVENT_MESSAGE,
            message=f"✅ Flutter To-Do App fertig!\n\nProjekt: {self.root}/\n\nJetzt: cd {self.root} && flutter run 🚀"
        ))
