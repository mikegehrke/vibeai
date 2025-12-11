// This file contains a basic widget test for a Flutter application.
// PURPOSE: To ensure that the Flutter widget under test behaves as expected.
// MAIN COMPONENTS: The test imports necessary testing libraries and defines a series of widget tests using the `testWidgets` function.

import 'package:flutter/material.dart'; // Importing Flutter's material library for widgets.
import 'package:flutter_test/flutter_test.dart'; // Importing Flutter's test library for widget testing.
import 'package:your_app/main.dart'; // Importing the main application file to access the widget to be tested.

// Widget test for the MyApp widget.
// WHAT: This test verifies that the MyApp widget correctly renders its children and initializes the app.
// HOW: It uses the `testWidgets` function to pump the widget into a test environment and perform assertions.
// WHY: To ensure the MyApp widget functions as expected when integrated into the app.
void main() {
  // Test case: Verify the existence of a specific widget within MyApp.
  testWidgets('MyApp has a title and a message', (WidgetTester tester) async {
    // Build MyApp and trigger a frame.
    await tester.pumpWidget(MyApp());

    // Search for a widget that displays the title 'Welcome'.
    final titleFinder = find.text('Welcome');
    // Search for a widget that displays the message 'Hello World'.
    final messageFinder = find.text('Hello World');

    // Verify that both the title and message widgets are present in the widget tree.
    expect(titleFinder, findsOneWidget);
    expect(messageFinder, findsOneWidget);
  });

  // Test case: Verify button functionality.
  // WHAT: Ensures that a button in the widget can be tapped and responds correctly.
  // HOW: It simulates a tap on the button and checks for expected changes.
  // WHY: To test interactive elements and ensure UI responds to user actions.
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build MyApp and trigger a frame.
    await tester.pumpWidget(MyApp());

    // Find the '+' icon button.
    final Finder buttonFinder = find.byIcon(Icons.add);

    // Tap the '+' button and trigger a frame.
    await tester.tap(buttonFinder);
    await tester.pump();

    // Verify that the counter text has incremented.
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });

  // Test case: Verify that the counter decreases when '-' button is pressed.
  // WHAT: Confirms the correct decrement functionality of the counter.
  // HOW: It simulates a tap on the decrement button and checks if the text updates accordingly.
  // WHY: Ensures the decrement logic is implemented and visualized correctly.
  testWidgets('Counter decrements when the minus button is tapped', (WidgetTester tester) async {
    // Build the widget and trigger a frame.
    await tester.pumpWidget(MyApp());

    // Find the '-' icon button.
    final Finder decrementButtonFinder = find.byIcon(Icons.remove);

    // Tap the '+' button first to increment the counter.
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Tap the '-' button and trigger a frame.
    await tester.tap(decrementButtonFinder);
    await tester.pump();

    // Verify that the counter text has decremented back to 0.
    expect(find.text('1'), findsNothing);
    expect(find.text('0'), findsOneWidget);
  });
}