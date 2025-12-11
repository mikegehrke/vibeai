/*
  This file defines the Item data model class, which represents an item entity in the application.
  The purpose of this class is to encapsulate all the necessary fields related to an item and provide
  functionalities to convert the object to and from JSON format, enabling easy serialization and deserialization.

  Main components:
  - Item class: Represents the item entity with fields and methods.
  - toJson method: Converts the Item object to a JSON map.
  - fromJson factory: Creates an Item object from a JSON map.
*/

import 'package:flutter/foundation.dart'; // Importing foundation for basic Flutter functionalities
import 'package:flutter/material.dart'; // Importing material for any material design components if needed

/// Item class
/// 
/// WHAT: Represents an item with its properties and provides serialization methods.
/// HOW: Encapsulates item attributes and provides toJson and fromJson methods for data handling.
/// WHY: Provides a structured way to manage item data and facilitates easy data interchange.
class Item {
  // Unique identifier for the item
  final String id;

  // Name of the item
  final String name;

  // Description of the item
  final String description;

  // Price of the item
  final double price;

  // URL of the image representing the item
  final String imageUrl;

  // Availability status of the item (true if available, false otherwise)
  final bool isAvailable;

  /// Constructor for the Item class
  /// 
  /// WHAT: Initializes an Item object with given attributes.
  /// HOW: Takes named parameters and assigns them to respective fields.
  /// WHY: Provides a way to create an Item instance with all necessary data.
  Item({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.isAvailable,
  });

  /// Factory constructor to create an Item instance from a JSON map
  /// 
  /// WHAT: Constructs an Item object from a JSON map.
  /// HOW: Extracts fields from the map and passes them to the Item constructor.
  /// WHY: Facilitates easy deserialization from JSON format to Item object.
  /// 
  /// Parameters:
  /// - json: A map representing the item data, typically decoded from a JSON string.
  /// 
  /// Returns:
  /// - An instance of Item initialized with data from the JSON map.
  factory Item.fromJson(Map<String, dynamic> json) {
    try {
      // Construct and return an Item using map values
      return Item(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        price: json['price'].toDouble(), // Ensure price is a double
        imageUrl: json['imageUrl'] as String,
        isAvailable: json['isAvailable'] as bool,
      );
    } catch (e) {
      // Error handling: Print error and throw an exception
      debugPrint('Error parsing Item from JSON: $e');
      throw Exception('Error parsing Item from JSON');
    }
  }

  /// Converts the Item instance into a JSON map
  /// 
  /// WHAT: Serializes the Item object's data into a JSON-compatible map.
  /// HOW: Maps each field of the Item to key-value pairs in a map.
  /// WHY: Enables easy serialization of the Item object to JSON format.
  /// 
  /// Returns:
  /// - A map with key-value pairs representing the item data, suitable for encoding to JSON.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
    };
  }
}