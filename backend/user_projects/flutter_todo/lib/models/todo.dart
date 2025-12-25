class Todo {
  final String id;
  final String title;
  bool isCompleted;
  
  Todo({required this.id, required this.title, this.isCompleted = false});
  
  void toggle() => isCompleted = !isCompleted;
}
