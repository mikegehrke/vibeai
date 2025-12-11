import 'package:flutter/material.dart';

/// CustomInput is a reusable widget for text input with customizable
/// properties such as label, hint, and icon. It is suitable for both
/// single-line and multi-line text inputs.
class CustomInput extends StatelessWidget {
  final String? labelText;
  final String? hintText;
  final IconData? icon;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final bool isPassword;
  final int maxLines;
  final ValueChanged<String>? onChanged;
  final FormFieldValidator<String>? validator;

  const CustomInput({
    Key? key,
    this.labelText,
    this.hintText,
    this.icon,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.isPassword = false,
    this.maxLines = 1,
    this.onChanged,
    this.validator,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: isPassword,
      maxLines: maxLines,
      onChanged: onChanged,
      validator: validator,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: icon != null ? Icon(icon) : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        errorStyle: TextStyle(
          color: Colors.redAccent,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}