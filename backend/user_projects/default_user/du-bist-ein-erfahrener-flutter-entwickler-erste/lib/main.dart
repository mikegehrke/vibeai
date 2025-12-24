/*
  This file contains the main entry point for the --Du-bist-ein-erfahrener-Flutter-Entwickler--Erste Flutter application.
  It sets up the MaterialApp, defines routing for navigation between screens, and applies a consistent theme throughout the app.
  The main components include the MyApp class which extends StatelessWidget and the main() function which initializes the Flutter application.
*/

import 'package:flutter/material.dart';

/*
  The main() function is the entry point of the Flutter application.
  It initializes the Flutter engine and runs the application.
  This function is required for every Flutter app to start the execution.
*/
void main() {
  // runApp is a built-in Flutter method that inflates the given widget (MyApp) and attaches it to the screen.
  runApp(MyApp());
}

/*
  MyApp is the root widget of the application which sets up the entire app structure.
  WHAT: This class initializes the Flutter application by setting its theme and routing.
  HOW: It uses MaterialApp to wrap the main application widget, configures the theme, and defines initial screen.
  WHY: It is essential for setting up the root configuration for navigation and theming across the app.
*/
class MyApp extends StatelessWidget {
  // Theme configuration for the application
  // WHY: Centralized theme configuration makes it easy to apply consistent styling across the entire app.
  final ThemeData theme = ThemeData(
    primarySwatch: Colors.blue, // Main color theme of the application
    visualDensity: VisualDensity.adaptivePlatformDensity, // Adapts the visual density for different platforms
  );

  @override
  Widget build(BuildContext context) {
    /*
      WHAT: Builds the app's widget tree.
      HOW: Returns a MaterialApp widget that includes theme and initial route settings.
      WHY: MaterialApp is used to provide Material Design components and manage navigation between different screens.
    */
    return MaterialApp(
      title: 'Du bist ein erfahrener Flutter Entwickler',
      theme: theme, // Applying the theme defined above
      initialRoute: '/', // Initial route or screen when the app starts
      routes: {
        // Defines the available routes in the app and their corresponding screens
        '/': (context) => HomeScreen(), // Home route
        '/about': (context) => AboutScreen(), // About route
      },
      /*
        WHAT: Error handling for navigation errors.
        HOW: onUnknownRoute is triggered when an unknown route is accessed, providing a fallback screen or error page.
        WHY: Provides a better user experience by handling navigation errors gracefully.
      */
      onUnknownRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => ErrorScreen(),
        );
      },
    );
  }
}

/*
  HomeScreen is the first screen users will see when they open the app.
  WHAT: Displays the main content and navigation options.
  WHY: Serves as the entry point for users to navigate to other parts of the app.
*/
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Welcome to the Home Screen!',
            ),
            ElevatedButton(
              onPressed: () {
                // Navigates to the About screen when the button is pressed
                Navigator.pushNamed(context, '/about');
              },
              child: Text('Go to About'),
            ),
          ],
        ),
      ),
    );
  }
}

/*
  AboutScreen provides information about the application.
  WHAT: Displays details or descriptions relevant to the app.
  WHY: Helps users understand the purpose or background of the app.
*/
class AboutScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('About'),
      ),
      body: Center(
        child: Text(
          'This is the About Screen.',
        ),
      ),
    );
  }
}

/*
  ErrorScreen is displayed when navigation to an unknown route is attempted.
  WHAT: Provides feedback to the user about navigation errors.
  WHY: Ensures users have a clear understanding when they reach an unexpected state.
*/
class ErrorScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Error'),
      ),
      body: Center(
        child: Text(
          '404 - Page not found!',
        ),
      ),
    );
  }
}