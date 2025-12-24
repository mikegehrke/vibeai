// This file defines the data model class for "Item" in a Flutter application.
// The purpose of this class is to represent an item entity in the application, 
// complete with functionalities to serialize and deserialize JSON data.
// Main components include the Item class itself, and methods for JSON conversion.

import 'dart:convert'; // Importing dart:convert for JSON encoding and decoding utilities.

// Item class represents an entity in the application with attributes like id, name, and description.
class Item {
  // Unique identifier for the item.
  final String id;
  
  // Name of the item.
  final String name;
  
  // Description provides additional details about the item.
  final String description;

  // Constructor for the Item class.
  // WHAT: Initializes an instance of the Item class with given parameters.
  // HOW: Takes three parameters and assigns them to the class properties.
  // WHY: Necessary to create an instance of Item with specific values.
  Item({
    required this.id, // ID should be a unique string.
    required this.name, // Name is a non-null string representing the item's name.
    required this.description, // Description gives more context about the item.
  });

  // Factory constructor to create an Item instance from JSON.
  // WHAT: Deserializes a JSON map into an Item instance.
  // HOW: Uses a named constructor that returns an instance of Item.
  // WHY: Allows easy conversion from JSON data to Item objects, facilitating data handling.
  factory Item.fromJson(Map<String, dynamic> json) {
    // Validates and assigns JSON values to Item properties.
    return Item(
      id: json['id'] as String, // Retrieves the 'id' from JSON. Expects a string.
      name: json['name'] as String, // Retrieves the 'name' from JSON. Expects a string.
      description: json['description'] as String, // Retrieves the 'description' from JSON. Expects a string.
    );
  }

  // Method to convert an Item instance to JSON.
  // WHAT: Serializes the Item object into a JSON map.
  // HOW: Returns a map with key-value pairs representing the Item properties.
  // WHY: Enables conversion of Item objects into JSON format for data transmission or storage.
  Map<String, dynamic> toJson() {
    // Constructs a map with the Item's properties.
    return {
      'id': id, // Maps 'id' field to a JSON key.
      'name': name, // Maps 'name' field to a JSON key.
      'description': description, // Maps 'description' field to a JSON key.
    };
  }

  // Additional utility method to convert a list of Item objects to JSON string.
  // WHAT: Converts a list of Item instances into a JSON string.
  // HOW: Uses List's map method to apply toJson on each Item and encodes to JSON string.
  // WHY: Useful for batch operations where multiple Item objects need to be serialized.
  static String encode(List<Item> items) => json.encode(