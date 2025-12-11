/*
 * This file defines the main application widget for the Ich-m-chte-eine-moderne-Flutter-App-entwickeln--di app.
 * It is responsible for setting up the MaterialApp, configuring app-wide themes, managing routes, and handling navigation.
 * The app uses Flutter's Material Design components and provides a modern UI framework for building a responsive application.
 */

import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/profile_screen.dart';

/*
 * Main application widget that sets up the app structure.
 *
 * WHAT: The root widget that initializes the Flutter application.
 * HOW: Uses MaterialApp to provide theme settings and routing configuration.
 * WHY: This is the required entry point for all Flutter applications that use Material Design.
 */
class MyApp extends StatelessWidget {
  // Theme configuration for the app.
  // WHY: Centralizing theme settings allows for easier maintenance and consistency across the app.
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue, // Primary color for the app's theme.
    visualDensity: VisualDensity.adaptivePlatformDensity, // Adapts density based on platform.
  );

  @override
  Widget build(BuildContext context) {
    /*
     * WHAT: Builds the app widget tree.
     * HOW: Returns a MaterialApp widget configured with theme and routes.
     * WHY: MaterialApp provides the structure for the app, including navigation and theming.
     */
    return MaterialApp(
      title: 'Ich möchte eine moderne Flutter App entwickeln', // Title of the app.
      theme: theme, // Applying the theme to the MaterialApp.
      initialRoute: '/', // Default route when the app starts.
      routes: {
        // Route configuration mapping route names to widget builders.
        '/': (context) => HomeScreen(), // Home screen of the app.
        '/settings': (context) => SettingsScreen(), // Settings screen route.
        '/profile': (context) => ProfileScreen(), // Profile screen route.
      },
      // Error handling for undefined routes.
      /*
       * WHAT: Handles navigation errors for undefined routes.
       * HOW: Provides a fallback builder for unknown routes.
       * WHY: To prevent application crashes due to navigation to unknown routes.
       */
      onUnknownRoute: (settings) {
        // Log or handle unknown route navigation here if necessary.
        return MaterialPageRoute(builder: (context) => HomeScreen());
      },
    );
  }
}

void main() {
  /*
   * Entry point for the application.
   *
   * WHAT: Calls the runApp function with MyApp.
   * HOW: Initializes and runs the Flutter application.
   * WHY: Required to start a Flutter app and display the widget tree on the screen.
   */
  runApp(MyApp());
}