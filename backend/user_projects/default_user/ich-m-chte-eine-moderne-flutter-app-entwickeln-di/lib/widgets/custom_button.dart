/*
 * This file defines a reusable Flutter widget for a custom button.
 * The purpose of this file is to provide a flexible and customizable button component
 * that can be reused throughout a Flutter application. This widget allows for customization
 * of text, color, size, and actions, making it adaptable to various parts of an app where
 * different button configurations are needed.
 */

// Section: Imports
// Importing necessary Flutter material package for UI components and styling
import 'package:flutter/material.dart';

// Section: CustomButton Class
// CustomButton is a stateless widget that represents a button with customizable properties.
// It is designed to be flexible and reusable across different screens of a Flutter application.
class CustomButton extends StatelessWidget {
  // Properties of the CustomButton, defining its appearance and behavior.

  // The text displayed on the button.
  final String text;

  // The color of the button's background.
  final Color backgroundColor;

  // The color of the text displayed on the button.
  final Color textColor;

  // The callback function to be executed when the button is pressed.
  final VoidCallback onPressed;

  // The height of the button, allowing customization of button size.
  final double height;

  // The width of the button, allowing customization of button size.
  final double width;

  // Constructor for the CustomButton widget.
  // WHAT: Constructs a CustomButton widget with specified properties.
  // HOW: Accepts parameters for text, colors, dimensions, and an onPressed callback.
  // WHY: Allows for easy instantiation of a button with custom behavior and styling.
  // Parameters:
  // - text: The label text of the button.
  // - backgroundColor: The background color of the button.
  // - textColor: The color of the text.
  // - onPressed: The function to execute on button press.
  // - height: The height of the button.
  // - width: The width of the button.
  const CustomButton({
    Key? key,
    required this.text,
    required this.backgroundColor,
    required this.textColor,
    required this.onPressed,
    this.height = 50.0, // Default height of the button set to 50.0
    this.width = 200.0, // Default width of the button set to 200.0
  }) : super(key: key);

  // Section: Build Method
  // WHAT: Builds the widget tree for the CustomButton.
  // HOW: Utilizes a GestureDetector to handle tap events and a Container to style the button.
  // WHY: Provides a visual and interactive component that users can interact with.
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      // onTap is utilized here to handle the button press event.
      // It triggers the onPressed callback provided during construction.
      onTap: onPressed,
      child: Container(
        // Container is used for styling the button with size, color, and decoration.
        height: height, // Set the height of the button
        width: width,   // Set the width of the button
        decoration: BoxDecoration(
          color: backgroundColor, // Apply the background color to the button
          borderRadius: BorderRadius.circular(8.0), // Rounded corners for aesthetic appeal
          // Add a subtle shadow for better visual depth
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              spreadRadius: 2,
              blurRadius: 5,
              offset: Offset(0, 3), // Shadow position
            ),
          ],
        ),
        // Align the text in the center of the button
        alignment: Alignment.center,
        // Display the text with the specified style
        child: Text(
          text,
          style: TextStyle(
            color: textColor, // Set the color of the text
            fontSize: 16.0,   // Set the font size of the text
            fontWeight: FontWeight.bold, // Bold font for emphasis
          ),
        ),
      ),
    );
  }
}