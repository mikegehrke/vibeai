/*
 * This file defines a reusable Flutter widget for custom input fields.
 * The purpose of this widget is to provide a consistent and customizable input field
 * that can be reused across different parts of a Flutter application.
 * The main components include a StatefulWidget to manage the state of the input,
 * and various customization options such as labels, validation, and error handling.
 */

import 'package:flutter/material.dart';

/// CustomInput is a reusable widget that provides a stylized text input field.
/// 
/// WHAT: This widget creates a text input field with enhanced customization options.
/// HOW: It uses a StatefulWidget to maintain the state of the input value and error messages.
/// WHY: Reusable input fields help in maintaining consistency and reduce code duplication across the project.
class CustomInput extends StatefulWidget {
  // The label text to display above the input field
  final String labelText;
  // A callback function that validates the input value
  final String? Function(String?)? validator;
  // A callback function to handle changes in the input value
  final void Function(String)? onChanged;
  // The initial value of the input field
  final String initialValue;
  // Flag to obscure text for password fields
  final bool obscureText;

  /// Constructor for the CustomInput widget.
  ///
  /// [labelText]: The text to display as a label above the input field.
  /// [validator]: A function that returns an error message if the input is invalid.
  /// [onChanged]: A function that is called when the input value changes.
  /// [initialValue]: The initial text to display in the input field.
  /// [obscureText]: Whether to obscure the text for password inputs.
  CustomInput({
    required this.labelText,
    this.validator,
    this.onChanged,
    this.initialValue = '',
    this.obscureText = false,
  });

  @override
  _CustomInputState createState() => _CustomInputState();
}

/// The state class for CustomInput, managing the input's text and validation state.
class _CustomInputState extends State<CustomInput> {
  // Controller to manage the text being edited
  late TextEditingController _controller;
  // Variable to store error text for input validation
  String? _errorText;

  @override
  void initState() {
    super.initState();
    // Initialize the text controller with the initial value
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    // Dispose of the controller when the widget is removed from the widget tree
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Display the label text above the input field
        Text(
          widget.labelText,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        // The actual TextField widget
        TextField(
          controller: _controller,
          obscureText: widget.obscureText,
          onChanged: (value) {
            // Update the error text based on the validation result
            setState(() {
              _errorText = widget.validator?.call(value);
            });
            // Call the onChanged callback if provided
            if (widget.onChanged != null) {
              widget.onChanged!(value);
            }
          },
          decoration: InputDecoration(
            border: OutlineInputBorder(),
            errorText: _errorText, // Display error text if validation fails
          ),
        ),
      ],
    );
  }
}