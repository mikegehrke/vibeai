/*
  This file defines a reusable custom button widget for a Flutter application.
  The purpose of this file is to provide a standardized button component that can be reused across the app,
  ensuring consistency and reducing duplication. The main component is the `CustomButton` class which extends
  `StatelessWidget`. It allows customization of button text, styling, and behavior via parameters.
*/

// Importing necessary Flutter packages
import 'package:flutter/material.dart';

// CustomButton class definition
/*
  WHAT: A reusable button widget that can be customized and used throughout the Flutter app.
  HOW: Extends `StatelessWidget` to create an immutable button widget.
  WHY: Provides a consistent button design and behavior that can be easily reused and customized.
*/
class CustomButton extends StatelessWidget {
  // Text to display on the button
  final String text;

  // Callback function to execute when the button is pressed
  final VoidCallback onPressed;

  // Optional styling for the button text
  final TextStyle? textStyle;

  // Optional color for the button background
  final Color? backgroundColor;

  // Constructor for the CustomButton class
  /*
    WHAT: Initializes a new instance of the CustomButton with required and optional parameters.
    HOW: Uses named parameters to allow selective customization.
    WHY: Flexibility in button customization while ensuring required parameters are provided.
    
    Parameters:
    - text (String): The label text for the button.
    - onPressed (VoidCallback): The function to call when the button is pressed.
    - textStyle (TextStyle?): Optional parameter to customize text appearance.
    - backgroundColor (Color?): Optional parameter to customize button color.

    Returns: An instance of `CustomButton`.
  */
  const CustomButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.textStyle,
    this.backgroundColor,
  }) : super(key: key);

  // Building the widget tree for the custom button
  /*
    WHAT: Builds the UI for the button.
    HOW: Uses a `Material` widget to provide ripple effects and a `GestureDetector` for tap handling.
    WHY: To create a visually appealing and interactive button with customizable properties.
  */
  @override
  Widget build(BuildContext context) {
    // Default text style if not provided
    final defaultTextStyle = Theme.of(context).textTheme.button?.copyWith(
          color: Colors.white,
        );

    // Default background color if not provided
    final defaultBackgroundColor = Theme.of(context).primaryColor;

    return GestureDetector(
      // Handling button tap event
      onTap: onPressed,
      child: Container(
        // Styling the button container
        padding: EdgeInsets.symmetric(vertical: 12.0, horizontal: 20.0),
        decoration: BoxDecoration(
          color: backgroundColor ?? defaultBackgroundColor,
          borderRadius: BorderRadius.circular(8.0),
        ),
        // Centering the button text
        child: Center(
          child: Text(
            text,
            style: textStyle ?? defaultTextStyle,
          ),
        ),
      ),
    );
  }
}