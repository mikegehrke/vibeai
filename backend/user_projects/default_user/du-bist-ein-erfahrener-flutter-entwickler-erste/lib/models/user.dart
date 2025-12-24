/*
 * This file defines the User data model class for a Flutter application.
 * 
 * PURPOSE: 
 * The primary purpose of this file is to provide a structured representation
 * of a user in the application, encapsulating user data with serialization
 * and deserialization capabilities.
 * 
 * MAIN COMPONENTS:
 * - User class: Represents a user with various attributes such as id, name, email, and others.
 * - fromJson method: Deserializes user data from a JSON object.
 * - toJson method: Serializes user data into a JSON object.
 * 
 * This model is essential for interacting with user data throughout the application, 
 * ensuring consistency and ease of data manipulation.
 */

// Importing necessary libraries for JSON serialization and deserialization
import 'dart:convert';

// User class definition
class User {
  // Unique identifier for the user, typically from a database
  final String id;

  // User's name
  final String name;

  // User's email address
  final String email;

  // Optional field for user's phone number
  final String? phoneNumber;

  // Optional field for user's age
  final int? age;

  /*
   * Constructor for creating a User instance.
   * 
   * WHAT: Initializes a User object with required and optional parameters.
   * HOW: Uses named parameters to set object properties, ensuring null safety.
   * WHY: Provides a structured way to represent user details in the application.
   */
  User({
    required this.id,
    required this.name,
    required this.email,
    this.phoneNumber,
    this.age,
  });

  /*
   * Factory method for creating a User instance from a JSON object.
   * 
   * WHAT: Constructs a User object from a Map<String, dynamic> which represents JSON data.
   * HOW: Extracts values using JSON keys and assigns them to the equivalent class properties.
   * WHY: Facilitates the conversion of JSON data from network or local storage into a User object.
   * 
   * Parameters:
   * - json: A Map<String, dynamic> object containing user data in JSON format.
   * 
   * Returns:
   * - A new User instance populated with data from the JSON object.
   */
  factory User.fromJson(Map<String, dynamic> json) {
    // Error handling for missing required fields
    if (json['id'] == null || json['name'] == null || json['email'] == null) {
      throw ArgumentError('Missing required user fields');
    }

    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      age: json['age'] as int?,
    );
  }

  /*
   * Method for converting a User instance into a JSON object.
   * 
   * WHAT: Serializes the User object's properties into a Map<String, dynamic>.
   * HOW: Creates a map with key-value pairs corresponding to the user's attributes.
   * WHY: Allows easy storage and transmission of user data in JSON format.
   * 
   * Returns:
   * - A Map<String, dynamic> representing the User instance in JSON format.
   */
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phoneNumber': phoneNumber,
      'age': age,
    };
  }
}