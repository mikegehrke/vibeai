/*
 * This file defines a Dart class that represents a User data model in a Flutter application.
 * The purpose of this file is to encapsulate user-related data and provide serialization
 * and deserialization methods (toJson and fromJson) for converting between User objects and JSON.
 * 
 * Main Components:
 * - User class: Represents the user with fields such as id, name, email, etc.
 * - Constructor and factory methods for creating User objects.
 * - toJson method: Converts a User object into a JSON map.
 * - fromJson method: Creates a User object from a JSON map.
 * - Error handling for potential issues during JSON parsing.
 */

// Section: Imports
// Importing necessary packages for JSON serialization.
import 'package:flutter/foundation.dart';

// Section: User Class Definition
/*
 * User class represents the data model for a user in the application.
 * 
 * This class includes fields that typically represent a user, such as id, name, email, etc.
 * It provides methods to convert the user data to and from JSON, making it useful for
 * network communication and local storage.
 */
class User {
  // Unique identifier for the user.
  final String id;

  // Name of the user.
  final String name;

  // Email address of the user.
  final String email;

  // URL to the user's profile picture.
  final String? profilePictureUrl;

  // Boolean to indicate if the user is active.
  final bool isActive;

  // DateTime to record the user's registration date.
  final DateTime registrationDate;

  /*
   * Constructor for the User class.
   * 
   * WHAT: Initializes a new instance of the User class with given parameters.
   * HOW: Takes all necessary fields as parameters and initializes the user object.
   * WHY: Allows creating user objects with the required data.
   */
  User({
    required this.id,
    required this.name,
    required this.email,
    this.profilePictureUrl,
    required this.isActive,
    required this.registrationDate,
  });

  /*
   * Factory method to create a User object from a JSON map.
   * 
   * WHAT: Parses JSON data to create a User instance.
   * HOW: Extracts values from the JSON map and initializes a User object.
   * WHY: Necessary for converting JSON data received from APIs into usable User objects.
   * 
   * Parameters:
   * - json: Map<String, dynamic> representing user data in JSON format.
   * 
   * Returns: A User object initialized with data from the JSON map.
   */
  factory User.fromJson(Map<String, dynamic> json) {
    try {
      // Parse and convert JSON fields to appropriate types.
      return User(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        profilePictureUrl: json['profilePictureUrl'] as String?,
        isActive: json['isActive'] as bool,
        // Parse registrationDate from ISO 8601 string to DateTime.
        registrationDate: DateTime.parse(json['registrationDate'] as String),
      );
    } catch (e) {
      // Handle any parsing errors by throwing an informative exception.
      throw FormatException('Error parsing User JSON: $e');
    }
  }

  /*
   * Converts the User object into a JSON map.
   * 
   * WHAT: Serializes the User object to JSON format.
   * HOW: Maps each field of the User object to a key-value pair in a map.
   * WHY: Necessary for sending user data to APIs or storing locally.
   * 
   * Returns: A Map<String, dynamic> representing the user data in JSON format.
   */
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profilePictureUrl': profilePictureUrl,
      'isActive': isActive,
      // Convert DateTime to ISO 8601 string format for JSON compatibility.
      'registrationDate': registrationDate.toIso8601String(),
    };
  }
}