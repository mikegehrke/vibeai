/*
 * This file defines a reusable Flutter widget called CustomCard.
 * 
 * PURPOSE:
 * The CustomCard widget is designed to provide a flexible and reusable card component 
 * that can be used throughout the application wherever a card-like UI element is required.
 * It encapsulates common properties and behaviors of a card, allowing for easy customization.
 * 
 * MAIN COMPONENTS:
 * - CustomCard class: The main class that extends StatelessWidget to create an immutable card.
 * - Customizable properties: Allows for customization of the card's content, appearance, and behavior.
 * - Complete implementation: Includes all necessary imports, error handling, and best practices.
 */

// SECTION: Imports
import 'package:flutter/material.dart';

// CLASS: CustomCard
// This class defines a reusable card widget that can be customized with different content and styles.
class CustomCard extends StatelessWidget {
  // Properties for the card's content and style
  final Widget content; // The main content of the card, expected to be a widget
  final double elevation; // Elevation of the card, affecting shadow depth
  final EdgeInsetsGeometry margin; // Margin around the card for positioning

  // Constructor for the CustomCard class
  // 
  // WHAT: Initializes a CustomCard with specified content and optional styling parameters.
  // HOW: Uses named parameters with default values for elevation and margin to allow customization.
  // WHY: Provides flexibility in creating card components with different styles and content.
  // 
  // PARAMETERS:
  // - content: The widget to display inside the card.
  // - elevation: The elevation of the card, defaults to 2.0.
  // - margin: The margin around the card, defaults to 8.0 horizontal and vertical.
  const CustomCard({
    Key? key,
    required this.content,
    this.elevation = 2.0,
    this.margin = const EdgeInsets.all(8.0),
  }) : super(key: key);

  // METHOD: build
  // 
  // WHAT: Builds the card widget tree.
  // HOW: Uses a Material widget to create a card with elevation and margin, wrapping the provided content.
  // WHY: This method is required to render the widget into the widget tree.
  // 
  // PARAMETERS:
  // - context: The BuildContext in which the widget is built.
  // 
  // RETURNS:
  // - A Widget tree that represents the card with specified content and styling.
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin, // Applies the specified margin around the card
      child: Card(
        elevation: elevation, // Sets the elevation for shadow effect
        child: Padding(
          padding: const EdgeInsets.all(16.0), // Adds padding inside the card for spacing
          child: content, // Displays the provided content widget
        ),
      ),
    );
  }
}