/*
 * This file serves as the main entry point for the Flutter application
 * named "Ich-m-chte-eine-moderne-Flutter-App-entwickeln--di".
 * It initializes the app, sets up routing and theming using MaterialApp, 
 * and provides error handling and best practices for production readiness.
 */

// Importing necessary Flutter packages
import 'package:flutter/material.dart';
import 'home_screen.dart'; // Importing the home screen widget

// Main function to run the Flutter app
// This is the entry point of the application.
// It calls the runApp function with MyApp as the root widget.
void main() {
  // runApp is a built-in Flutter function that initializes the app
  runApp(MyApp());
}

// Main application widget that sets up the app structure
//
// WHAT: Root widget that initializes the Flutter application
// HOW: Uses MaterialApp to provide theme and routing
// WHY: Required entry point for all Flutter applications
class MyApp extends StatelessWidget {
  // Theme configuration for the app
  // WHY: Centralized theme makes it easy to change app-wide styling
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue, // Sets a blue color scheme for the app
    visualDensity: VisualDensity.adaptivePlatformDensity, // Ensures visual consistency across platforms
  );

  @override
  Widget build(BuildContext context) {
    // WHAT: Builds the app widget tree
    // HOW: Returns MaterialApp with home screen
    // WHY: MaterialApp provides Material Design components and navigation
    return MaterialApp(
      title: 'Flutter Demo', // Sets the title of the app
      theme: theme, // Applies the defined theme
      // Initial route of the application
      home: HomeScreen(), // Sets the initial screen to HomeScreen
      // Error handling using a custom error widget
      // This helps in handling unexpected errors in production gracefully
      builder: (context, widget) {
        // Checking if the widget is null, which may happen if there's an error
        return widget ?? ErrorScreen();
      },
      // Define named routes for navigation
      routes: {
        '/home': (context) => HomeScreen(), // Route for home screen
        // Additional routes can be added here
      },
    );
  }
}

// Custom error screen widget
//
// WHAT: Displays an error message when a widget fails to build
// HOW: Simple widget with a centered error message
// WHY: Provides user feedback in case of unexpected errors
class ErrorScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Error'), // Title for the error screen
      ),
      body: Center(
        child: Text(
          'An unexpected error occurred. Please try again later.',
          style: TextStyle(color: Colors.red), // Styling error message in red
          textAlign: TextAlign.center, // Center-align the text
        ),
      ),
    );
  }
}