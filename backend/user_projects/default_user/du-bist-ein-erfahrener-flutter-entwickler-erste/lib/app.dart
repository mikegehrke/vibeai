/*
 * This file contains the main application entry point and routing logic for the
 * "Du-bist-ein-erfahrener-Flutter-Entwickler--Erste" Flutter project.
 * It initializes the Flutter app, sets up themes, and manages navigation between screens
 * using a MaterialApp widget.
 */

import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/profile_screen.dart';

// Main application widget that sets up the app structure
//
// WHAT: Root widget that initializes the Flutter application
// HOW: Uses MaterialApp to provide theme and routing
// WHY: Required entry point for all Flutter applications
void main() {
  runApp(MyApp());
}

// Main application widget inheriting from StatelessWidget
//
// WHAT: Defines the root of the app's widget tree
// HOW: Extends StatelessWidget and overrides the build method to return a MaterialApp
// WHY: Essential for setting up the app's theme, routes, and initial screen
class MyApp extends StatelessWidget {
  
  // Theme configuration for the app
  // WHY: Centralized theme makes it easy to change app-wide styling
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue, // Primary color scheme for the app
    visualDensity: VisualDensity.adaptivePlatformDensity, // Adapt UI density based on platform
  );

  @override
  Widget build(BuildContext context) {
    // WHAT: Builds the app widget tree
    // HOW: Returns a MaterialApp configured with theme, routes, and initial route
    // WHY: MaterialApp provides Material Design components and handles navigation
    return MaterialApp(
      title: 'Flutter Developer Experience', // Title of the application
      theme: theme, // Applying the theme to the entire app
      initialRoute: '/', // Initial route when the app is launched
      routes: {
        '/': (context) => HomeScreen(), // Default home screen route
        '/settings': (context) => SettingsScreen(), // Route to settings screen
        '/profile': (context) => ProfileScreen(), // Route to profile screen
      },
      // onGenerateRoute provides a fallback for when routes are not defined
      onGenerateRoute: (settings) {
        // This can handle dynamic route generation, logging, or error handling
        // Currently, it provides a simple error screen for undefined routes
        return MaterialPageRoute(
          builder: (context) => Scaffold(
            appBar: AppBar(title: Text('Error')),
            body: Center(child: Text('Page not found')),
          ),
        );
      },
    );
  }
}