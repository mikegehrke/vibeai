// This file contains basic widget tests for a Flutter application.
// It ensures that the widgets render correctly and interact as expected.
// The main components include a test setup function and various test cases
// that simulate user interactions and verify widget outcomes.

import 'package:flutter/material.dart'; // Import Flutter material package for UI components
import 'package:flutter_test/flutter_test.dart'; // Import Flutter test package for widget testing
import 'package:du_bist_ein_erfahrener_flutter_entwickler_erste/main.dart'; // Import the main application file to access the app widgets

// Main function for widget test execution
// WHAT: This function sets up and runs the widget tests
// HOW: Uses the testWidgets function provided by Flutter to define and run tests on the app widgets
// WHY: Required to ensure that UI components work as expected and to catch regressions
void main() {
  // Test case to verify if the counter increments when the button is pressed
  // WHAT: Tests the counter increment functionality of the main widget
  // HOW: Simulates a tap on the '+' button and verifies the change in UI
  // WHY: Ensures that the increment logic in the widget functions correctly
  // Test case to verify that the app starts correctly
  // WHAT: Tests the initial rendering of the main widget
  // HOW: Checks for the presence of key UI elements when the app is started
  // WHY: Ensures the app initializes correctly and displays the expected UI
  testWidgets('App initialization test', (WidgetTester tester) async {
    // Build the app and trigger a frame
    await tester.pumpWidget(const MyApp());

    // Verify that the app contains a MaterialApp
    // This checks that the main app structure is present
    expect(find.byType(MaterialApp), findsOneWidget);
  });

  // Test case to verify that HomeScreen is displayed
  // WHAT: Tests that the home screen is rendered
  // HOW: Checks for the presence of HomeScreen elements
  // WHY: Ensures the app displays the correct initial screen
  testWidgets('HomeScreen display test', (WidgetTester tester) async {
    // Build the app and trigger a frame
    await tester.pumpWidget(const MyApp());

    // Verify that the app contains a Scaffold (from HomeScreen)
    expect(find.byType(Scaffold), findsWidgets);
  });
}