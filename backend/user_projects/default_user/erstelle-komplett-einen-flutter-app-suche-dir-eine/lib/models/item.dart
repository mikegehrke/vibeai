import 'package:flutter/foundation.dart';

/// A data model class representing an item with necessary fields and methods
/// to convert to and from JSON.
class Item {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;

  /// Creates an [Item] with the required fields.
  /// 
  /// Throws an [AssertionError] if any field is null.
  Item({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
  })  : assert(id.isNotEmpty, 'ID cannot be empty'),
        assert(name.isNotEmpty, 'Name cannot be empty'),
        assert(description.isNotEmpty, 'Description cannot be empty'),
        assert(price >= 0, 'Price cannot be negative'),
        assert(imageUrl.isNotEmpty, 'Image URL cannot be empty');

  /// Creates an [Item] from a JSON object.
  factory Item.fromJson(Map<String, dynamic> json) {
    try {
      return Item(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        price: (json['price'] as num).toDouble(),
        imageUrl: json['imageUrl'] as String,
      );
    } catch (e) {
      // Log the error or handle it as needed
      if (kDebugMode) {
        print('Error parsing Item from JSON: $e');
      }
      rethrow;
    }
  }

  /// Converts the [Item] instance to a JSON object.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'imageUrl': imageUrl,
    };
  }

  /// Copies the current [Item] instance with new values.
  /// 
  /// Any field not provided will use the existing value from the current instance.
  Item copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    String? imageUrl,
  }) {
    return Item(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }

  @override
  String toString() {
    return 'Item(id: $id, name: $name, description: $description, price: $price, imageUrl: $imageUrl)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Item &&
        other.id == id &&
        other.name == name &&
        other.description == description &&
        other.price == price &&
        other.imageUrl == imageUrl;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        name.hashCode ^
        description.hashCode ^
        price.hashCode ^
        imageUrl.hashCode;
  }
}