import 'package:flutter/material.dart';
import 'package:your_app/screens/home_screen.dart';
import 'package:your_app/screens/details_screen.dart';

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
      ),
      // Define the initial route
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(),
        '/details': (context) => DetailsScreen(),
      },
      // Handle unknown routes
      onUnknownRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => Scaffold(
            appBar: AppBar(
              title: Text('Page Not Found'),
            ),
            body: Center(
              child: Text('404 - Page Not Found'),
            ),
          ),
        );
      },
      // Add error handling at the top level
      builder: (context, widget) {
        ErrorWidget.builder = (FlutterErrorDetails errorDetails) {
          return Scaffold(
            appBar: AppBar(
              title: Text('Error'),
            ),
            body: Center(
              child: Text(
                'An unexpected error occurred.\n'
                'Please try again later.',
                textAlign: TextAlign.center,
              ),
            ),
          );
        };
        return widget!;
      },
    );
  }
}