import 'package:flutter/material.dart';
import 'package:erstelle_komplett_einen_flutter_app/screens/home_screen.dart';
import 'package:erstelle_komplett_einen_flutter_app/screens/details_screen.dart';
import 'package:erstelle_komplett_einen_flutter_app/screens/error_screen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Erstelle Komplett Einen Flutter App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        // Define text theme to ensure consistency across app
        textTheme: TextTheme(
          headline1: TextStyle(fontSize: 32.0, fontWeight: FontWeight.bold),
          bodyText1: TextStyle(fontSize: 16.0),
        ),
      ),
      // Initial route to be loaded when the app starts
      initialRoute: '/',
      // Define the app's routes
      routes: {
        '/': (context) => HomeScreen(),
        '/details': (context) => DetailsScreen(),
      },
      // Handle any unknown routes
      onUnknownRoute: (settings) {
        return MaterialPageRoute(builder: (context) => ErrorScreen());
      },
      // Add error handling for navigation
      builder: (context, child) {
        return Navigator(
          onGenerateRoute: (settings) {
            try {
              // Attempt to get the route based on settings
              return MaterialPageRoute(builder: (context) {
                return child!;
              });
            } catch (error) {
              // If an error occurs, navigate to the ErrorScreen
              return MaterialPageRoute(builder: (context) => ErrorScreen());
            }
          },
        );
      },
    );
  }
}