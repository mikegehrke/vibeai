/*
 * This file defines a reusable CustomCard widget for a Flutter application.
 * 
 * Purpose: The CustomCard widget is designed to provide a flexible card
 * component that can be reused across different parts of the application.
 * 
 * Main Components:
 * 1. CustomCard class: The main widget class that builds the card.
 * 2. Customizable parameters: Allows for flexibility in terms of content,
 *    styling, and actions.
 */

// Section: Import Statements
// Import necessary Flutter material package to access UI components.
import 'package:flutter/material.dart';

// Section: CustomCard Class
// CustomCard is a reusable widget that displays content in a card format.
// It is designed to be flexible and customizable, allowing for various content
// and actions to be defined by the developer when used in a Flutter app.
class CustomCard extends StatelessWidget {
  // WHAT: Constructor for CustomCard class
  // HOW: Initializes the widget with required and optional parameters
  // WHY: Allows for customization of card content and behavior
  const CustomCard({
    Key? key,
    required this.title,         // The main title text displayed on the card
    this.subtitle,               // Optional subtitle text for additional context
    this.imagePath,              // Optional image that can be displayed on the card
    this.onTap,                  // Optional callback function for tap events
    this.elevation = 4.0,        // Optional card elevation for shadow effect, default is 4.0
  }) : super(key: key);

  // Define the properties for the CustomCard:
  final String title;            // Title text for the card
  final String? subtitle;        // Optional subtitle text
  final String? imagePath;       // Optional path to an image for the card
  final VoidCallback? onTap;     // Optional tap event callback
  final double elevation;        // Elevation value for the card's shadow

  @override
  Widget build(BuildContext context) {
    // WHAT: Builds the widget tree for the CustomCard
    // HOW: Returns a GestureDetector wrapping a Card widget
    // WHY: GestureDetector is used to detect tap events, and Card is used for the card UI
    return GestureDetector(
      onTap: onTap, // Set the callback for tap events if provided
      child: Card(
        elevation: elevation, // Set the card's elevation for shadow effect
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0), // Rounded corners for the card
        ),
        margin: const EdgeInsets.all(8.0), // Margin around the card for spacing
        child: Column(
          mainAxisSize: MainAxisSize.min, // Minimize the column size to its content
          children: <Widget>[
            // If an image path is provided, display the image
            if (imagePath != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(10.0), // Rounded corners for the image
                ),
                child: Image.asset(
                  imagePath!,
                  fit: BoxFit.cover, // Ensure the image covers the container
                  width: double.infinity, // Stretch image to fill the card's width
                  height: 150.0, // Fixed height for the image
                ),
              ),
            // Padding around the text content for spacing
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start, // Align text to the start
                children: <Widget>[
                  // Display the title text in a headline6 style
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headline6,
                  ),
                  // If a subtitle is provided, display it below the title
                  if (subtitle != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0), // Spacing above the subtitle
                      child: Text(
                        subtitle!,
                        style: Theme.of(context).textTheme.subtitle1,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}