import 'package:flutter/foundation.dart';
import 'todo.dart';

class TodoProvider extends ChangeNotifier {
  final List<Todo> _todos = [];
  List<Todo> get todos => [..._todos];
  
  void addTodo(String title) {
    _todos.add(Todo(id: DateTime.now().toString(), title: title));
    notifyListeners();
  }
  
  void toggleTodo(String id) {
    _todos.firstWhere((t) => t.id == id).toggle();
    notifyListeners();
  }
}
