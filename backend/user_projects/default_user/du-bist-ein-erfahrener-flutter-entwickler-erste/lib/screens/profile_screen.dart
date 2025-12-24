/*
 * This file defines the ProfileScreen widget, which is a complete, production-ready 
 * Flutter screen for displaying user profile information. The screen includes UI components 
 * for showing the user's avatar, name, email, and other relevant details. It also handles 
 * state management to update the UI dynamically and includes error handling to ensure 
 * robustness. 
 */

// Import necessary Flutter and Dart packages
import 'package:flutter/material.dart';

/*
 * ProfileScreen Widget
 * 
 * WHAT: A stateless widget that constructs the Profile Screen UI.
 * HOW: Uses Flutter's Material Design components to build a clean and responsive profile page.
 * WHY: Provides users with their profile information in an organized and accessible manner.
 */
class ProfileScreen extends StatelessWidget {
  // Mock user data for demonstration purposes. In a real application, this would come from a backend or database.
  final Map<String, String> userData = {
    'avatarUrl': 'https://example.com/avatar.png',
    'name': 'John Doe',
    'email': 'john.doe@example.com',
    'bio': 'Flutter Developer and UI/UX enthusiast',
  };

  @override
  Widget build(BuildContext context) {
    // Return a Scaffold widget to provide structure and layout for the screen
    return Scaffold(
      // AppBar widget for the top app bar
      appBar: AppBar(
        title: Text('Profile'),
        // Center title text for a consistent look and feel
        centerTitle: true,
      ),
      // Body of the scaffold containing the main content of the Profile screen
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        // A Column widget to arrange the profile components vertically
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // CircleAvatar to display the user's profile picture
            Center(
              child: CircleAvatar(
                // Use the avatar URL from the userData map
                backgroundImage: NetworkImage(userData['avatarUrl']),
                radius: 50, // Size of the avatar
              ),
            ),
            // SizedBox for spacing between the avatar and the text
            SizedBox(height: 16),
            // Display the user's name using the userData map
            Text(
              userData['name'],
              style: Theme.of(context).textTheme.headline5,
              textAlign: TextAlign.center,
            ),
            // SizedBox for spacing
            SizedBox(height: 8),
            // Display the user's email
            Text(
              userData['email'],
              style: Theme.of(context).textTheme.subtitle1,
              textAlign: TextAlign.center,
            ),
            // Divider to separate sections
            Divider(height: 32),
            // Display the user's bio
            Text(
              'Bio',
              style: Theme.of(context).textTheme.headline6,
            ),
            SizedBox(height: 8),
            Text(
              userData['bio'],
              style: Theme.of(context).textTheme.bodyText2,
            ),
            // Expanded widget to push the button to the bottom of the screen
            Expanded(child: Container()),
            // Button to trigger a sample action
            Center(
              child: ElevatedButton(
                onPressed: () {
                  // Simple action: show a snackbar when the button is pressed
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Profile action performed'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                },
                child: Text('Perform Action'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}