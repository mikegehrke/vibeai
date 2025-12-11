/*
 * This file defines the data model class for a Task in a Flutter application.
 * It serves as the blueprint for creating task objects, which are used to represent
 * individual tasks within the app. The class includes fields for task properties,
 * methods for converting to and from JSON, and proper error handling.
 * 
 * Main Components:
 * - Task Class: Represents the task entity with properties and methods.
 * - JSON Serialization/Deserialization: Allows tasks to be easily converted to and from JSON.
 * - Error Handling: Ensures robust handling of unexpected data formats and values.
 */

// Importing necessary libraries
import 'package:flutter/material.dart';
import 'dart:convert'; // Required for JSON encoding and decoding

/*
 * Task Class
 * 
 * WHAT: This class models a Task with various attributes that describe it.
 * HOW: It contains fields for task details and methods for JSON serialization.
 * WHY: To provide a structured way to manage task data throughout the app.
 */
class Task {
  // Fields representing the properties of a task
  final String id; // Unique identifier for the task
  final String title; // Title of the task
  final String description; // Description of the task
  final DateTime dueDate; // Due date for the task
  final bool isCompleted; // Status of task completion

  /*
   * Constructor for Task
   * 
   * WHAT: Initializes a Task object with provided values.
   * HOW: Takes named parameters for each field, with assertions to ensure validity.
   * WHY: To ensure tasks are created consistently with all necessary data.
   */
  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.dueDate,
    this.isCompleted = false, // Default to false indicating task is incomplete
  }) : assert(id.isNotEmpty, 'Task id cannot be empty'),
       assert(title.isNotEmpty, 'Task title cannot be empty');

  /*
   * Method: toJson
   * 
   * WHAT: Converts the Task object into a JSON-compatible map.
   * HOW: Maps each field to a key-value pair, using JSON encoding for special types like DateTime.
   * WHY: To enable easy serialization of Task objects for storage or network transfer.
   * 
   * Returns: Map<String, dynamic> - A map representation of the task suitable for JSON encoding.
   */
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      // Convert DateTime to ISO 8601 string format for JSON compatibility
      'dueDate': dueDate.toIso8601String(),
      'isCompleted': isCompleted,
    };
  }

  /*
   * Factory Constructor: fromJson
   * 
   * WHAT: Creates a Task object from a JSON map.
   * HOW: Parses the map and converts it into a Task, handling any necessary type conversions.
   * WHY: To facilitate the creation of Task objects from JSON data, such as from an API response.
   * 
   * Parameters:
   * - Map<String, dynamic> json: The JSON map containing task data.
   * 
   * Returns: Task - A new Task object initialized with data from the JSON map.
   */
  factory Task.fromJson(Map<String, dynamic> json) {
    try {
      return Task(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        // Parse ISO 8601 formatted date strings into DateTime objects
        dueDate: DateTime.parse(json['dueDate'] as String),
        isCompleted: json['isCompleted'] as bool,
      );
    } catch (e) {
      // Log or handle error as necessary
      throw FormatException('Invalid JSON format for Task: $e');
    }
  }
}