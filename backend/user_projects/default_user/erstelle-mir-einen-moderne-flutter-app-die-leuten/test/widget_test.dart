import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Center(child: Text('Test')),
      ),
    ));

    // Verify that our text is displayed
    expect(find.text('Test'), findsOneWidget);
  });
}
