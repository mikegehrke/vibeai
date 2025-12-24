// Importing necessary Dart packages for handling JSON data.
// These imports allow the Task model to serialize and deserialize JSON objects,
// which is essential for interacting with APIs or local storage.
import 'dart:convert';

/* 
 * Task Model Class
 *
 * WHAT: This file defines a Dart class `Task` that models a task entity.
 * HOW: It includes various properties that describe a task, along with
 * methods to convert the class instance to and from JSON.
 * WHY: In a Flutter application, we often need to represent data structures
 * fetched from APIs or stored locally. This class provides a structured way
 * to handle task data with easy conversion to and from JSON format.
 */
class Task {
  // Unique identifier for the task
  final String id;

  // Title or name of the task
  final String title;

  // Detailed description of the task
  final String description;

  // The current status of the task (e.g., pending, completed)
  final String status;

  // Due date for the task completion
  final DateTime dueDate;

  // Priority level of the task (e.g., low, medium, high)
  final String priority;

  /*
   * Constructor for Task class
   *
   * WHAT: Initializes a Task instance with required properties.
   * HOW: Accepts named parameters to set values for each of the task's fields.
   * WHY: Provides a simple way to create Task objects with specified values.
   *
   * Parameters:
   * - id: Unique identifier for the task.
   * - title: Name of the task.
   * - description: Detailed information about the task.
   * - status: Current status of the task.
   * - dueDate: Date by which the task should be completed.
   * - priority: Level of importance for the task.
   */
  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.dueDate,
    required this.priority,
  });

  /*
   * Factory constructor to create a Task instance from a JSON map
   *
   * WHAT: Parses JSON data and creates a Task object.
   * HOW: Uses a factory constructor to map JSON keys to Task properties.
   * WHY: Essential for converting JSON responses from APIs into Dart objects.
   *
   * Parameters:
   * - json: A Map<String, dynamic> representing JSON data.
   *
   * Returns: A Task object initialized with data from the JSON map.
   */
  factory Task.fromJson(Map<String, dynamic> json) {
    try {
      return Task(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        status: json['status'] as String,
        dueDate: DateTime.parse(json['dueDate'] as String),
        priority: json['priority'] as String,
      );
    } catch (e) {
      // Error handling for JSON parsing issues
      throw FormatException('Error parsing Task from JSON: $e');
    }
  }

  /*
   * Method to convert Task instance to a JSON map
   *
   * WHAT: Serializes the Task object into JSON format.
   * HOW: Creates a map of key-value pairs representing the Task properties.
   * WHY: Allows Task objects to be easily converted to JSON for storage or API requests.
   *
   * Returns: A Map<String, dynamic> representing the task in JSON format.
   */
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'status': status,
      'dueDate': dueDate.toIso8601String(), // Converts DateTime to ISO 8601 string
      'priority': priority,
    };
  }
}