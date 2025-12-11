// This file defines a reusable Flutter widget for custom text input.
// The primary purpose of this widget is to provide a consistent and customizable input field
// throughout the application, with built-in validation and error handling.
// Components include the CustomInput class, error handling logic, and state management.

import 'package:flutter/material.dart';

// CustomInput is a reusable widget that provides a styled input field with validation.
// 
// WHAT: This widget encapsulates the logic for displaying a text input field with optional validation.
// HOW: It uses a TextFormField within a Container to apply specific styling and behavior.
// WHY: Reusability and consistency are key reasons for encapsulating input field logic into a widget.
class CustomInput extends StatelessWidget {
  // The controller for the TextFormField, allowing external access to the input value.
  final TextEditingController controller;
  
  // Placeholder text for the input field.
  final String placeholder;
  
  // Validation function that returns an error message string if validation fails.
  final String? Function(String?)? validator;
  
  // Whether the input field should obscure text (useful for passwords).
  final bool obscureText;
  
  // Optional icon to display within the input field.
  final IconData? icon;
  
  // Constructor for the CustomInput widget.
  // 
  // Parameters:
  // - controller: Manages the text being edited.
  // - placeholder: Displays a hint text when the input is empty.
  // - validator: Function to validate the input value.
  // - obscureText: Hides the input text if true.
  // - icon: Displays an optional icon inside the input field.
  CustomInput({
    Key? key,
    required this.controller,
    this.placeholder = '',
    this.validator,
    this.obscureText = false,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Returns a styled TextFormField wrapped in a Container.
    // The Container gives us flexibility for further decoration, padding, and margin.
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10.0),
      child: TextFormField(
        controller: controller, // Connects the TextFormField with the provided controller.
        obscureText: obscureText, // Determines if the text should be obscured.
        decoration: InputDecoration(
          labelText: placeholder, // Sets the placeholder text.
          prefixIcon: icon != null ? Icon(icon) : null, // Conditionally adds an icon.
          border: OutlineInputBorder(), // Provides a clear border around the input.
        ),
        validator: validator, // Applies the provided validation function.
      ),
    );
  }
}

/*
Usage Example:
---------------
CustomInput(
  controller: TextEditingController(),
  placeholder: 'Enter your email',
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Please enter some text';
    }
    return null;
  },
  obscureText: false,
  icon: Icons.email,
)
*/

// This example demonstrates how to use the CustomInput widget in a form,
// specifying a controller for managing the input state, a placeholder for guidance,
// a validator for input validation, and an optional icon to enhance the UI.