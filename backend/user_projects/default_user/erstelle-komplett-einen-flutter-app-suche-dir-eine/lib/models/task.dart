import 'package:flutter/foundation.dart';

/// A model class representing a Task.
class Task {
  final String id;
  final String title;
  final String description;
  final DateTime dueDate;
  final bool isCompleted;

  /// Constructor for creating a [Task] instance.
  /// 
  /// All fields are required to ensure a valid [Task] object.
  Task({
    @required this.id,
    @required this.title,
    @required this.description,
    @required this.dueDate,
    this.isCompleted = false,
  })  : assert(id != null),
        assert(title != null),
        assert(description != null),
        assert(dueDate != null);

  /// Converts a [Task] object into a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'dueDate': dueDate.toIso8601String(),
      'isCompleted': isCompleted,
    };
  }

  /// Creates a [Task] object from a JSON map.
  /// 
  /// Handles potential errors by returning null if required fields are missing.
  static Task fromJson(Map<String, dynamic> json) {
    try {
      return Task(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        dueDate: DateTime.parse(json['dueDate'] as String),
        isCompleted: json['isCompleted'] as bool ?? false,
      );
    } catch (e) {
      // Log the error or handle it as required in your application context.
      if (kDebugMode) {
        print('Error parsing Task from JSON: $e');
      }
      return null;
    }
  }

  /// Factory method to create a copy of a [Task] with updated fields.
  Task copyWith({
    String id,
    String title,
    String description,
    DateTime dueDate,
    bool isCompleted,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      dueDate: dueDate ?? this.dueDate,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }

  @override
  String toString() {
    return 'Task{id: $id, title: $title, description: $description, dueDate: $dueDate, isCompleted: $isCompleted}';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Task &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          description == other.description &&
          dueDate == other.dueDate &&
          isCompleted == other.isCompleted;

  @override
  int get hashCode =>
      id.hashCode ^
      title.hashCode ^
      description.hashCode ^
      dueDate.hashCode ^
      isCompleted.hashCode;
}