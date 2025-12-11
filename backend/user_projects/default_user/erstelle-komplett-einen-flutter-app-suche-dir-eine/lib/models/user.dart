import 'dart:convert';

/// A model class representing a User in the application.
class User {
  final String id;
  final String name;
  final String email;
  final String avatarUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  /// Constructs a [User] object.
  /// 
  /// [id], [name], and [email] are required fields.
  /// [avatarUrl], [createdAt], and [updatedAt] are optional.
  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl = '',
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  /// Creates a [User] object from a JSON map.
  /// Throws [FormatException] if the JSON is invalid or required fields are missing.
  factory User.fromJson(Map<String, dynamic> json) {
    try {
      if (json['id'] == null || json['name'] == null || json['email'] == null) {
        throw FormatException('Missing required fields');
      }
      return User(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        avatarUrl: json['avatarUrl'] as String? ?? '',
        createdAt: DateTime.parse(json['createdAt'] as String? ?? DateTime.now().toIso8601String()),
        updatedAt: DateTime.parse(json['updatedAt'] as String? ?? DateTime.now().toIso8601String()),
      );
    } catch (e) {
      // Log the error in a production application
      throw FormatException('Error parsing User JSON: ${e.toString()}');
    }
  }

  /// Converts the [User] object to a JSON map.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Returns a string representation of the [User] object.
  @override
  String toString() {
    return 'User{id: $id, name: $name, email: $email, avatarUrl: $avatarUrl, createdAt: $createdAt, updatedAt: $updatedAt}';
  }
}