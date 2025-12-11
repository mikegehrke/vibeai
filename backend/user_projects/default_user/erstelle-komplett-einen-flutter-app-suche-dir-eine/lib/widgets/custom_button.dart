import 'package:flutter/material.dart';

/// A reusable custom button widget with icon and text.
/// 
/// This widget provides a customizable button with an icon and text.
/// It handles taps and provides feedback for disabled state.
class CustomButton extends StatelessWidget {
  /// The text to display on the button.
  final String text;

  /// The icon to display on the button.
  final IconData icon;

  /// The callback that is called when the button is tapped.
  /// 
  /// If null, the button will be disabled.
  final VoidCallback? onPressed;

  /// The color of the button background.
  /// Defaults to [Colors.blue].
  final Color color;

  /// The text style of the button's text.
  /// Defaults to white text with [FontWeight.bold].
  final TextStyle textStyle;

  /// Creates a [CustomButton].
  /// 
  /// The [text] and [icon] must not be null.
  const CustomButton({
    Key? key,
    required this.text,
    required this.icon,
    this.onPressed,
    this.color = Colors.blue,
    this.textStyle = const TextStyle(
      color: Colors.white,
      fontWeight: FontWeight.bold,
    ),
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        primary: onPressed != null ? color : Colors.grey, // Disable color if onPressed is null
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: textStyle.color),
          const SizedBox(width: 8.0),
          Text(text, style: textStyle),
        ],
      ),
    );
  }
}