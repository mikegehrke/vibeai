/* 
 * Profile Screen
 * 
 * This file defines the ProfileScreen widget, which represents the user profile interface in the application. 
 * It includes UI components for displaying user information, editing profile details, and managing state changes.
 * The file leverages Flutter's state management to ensure that changes to the profile are reflected in real-time.
 */

// Section: Imports
// Importing necessary Flutter packages and external dependencies
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:your_app/models/user.dart'; // Assuming a User model is defined
import 'package:your_app/providers/user_provider.dart'; // Assuming a UserProvider is defined for state management

// ProfileScreen Widget
// 
// WHAT: A stateful widget that displays the user's profile information and allows editing.
// HOW: Uses a combination of Flutter widgets, state management via Provider, and error handling.
// WHY: To provide users with a graphical interface to view and update their profile details.
class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

// _ProfileScreenState
// 
// WHAT: Manages the state for ProfileScreen, handling user interactions and data updates.
// HOW: Uses Flutter's setState to manage local widget state and Provider for app-wide state.
// WHY: Required to maintain and update the UI based on user interactions.
class _ProfileScreenState extends State<ProfileScreen> {
  // Controller for editing user's name
  // WHY: Allows two-way data binding with the text field
  final TextEditingController _nameController = TextEditingController();

  // Controller for editing user's email
  // WHY: Allows two-way data binding with the text field
  final TextEditingController _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize the controllers with current user's data
    // WHY: Pre-fills the text fields with existing data for easier editing
    final user = Provider.of<UserProvider>(context, listen: false).user;
    _nameController.text = user.name;
    _emailController.text = user.email;
  }

  @override
  void dispose() {
    // Dispose controllers to free up resources
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  // build method
  // 
  // WHAT: Constructs the UI for the profile screen.
  // HOW: Uses various Flutter widgets to structure the layout and style.
  // WHY: To provide a visually appealing and functional user profile interface.
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfilePictureSection(),
            _buildProfileForm(),
            _buildSaveButton(),
          ],
        ),
      ),
    );
  }

  // _buildProfilePictureSection
  // 
  // WHAT: Creates a widget section for displaying and editing the profile picture.
  // HOW: Uses CircleAvatar for displaying the image and an IconButton for editing.
  // WHY: To allow users to view and change their profile picture.
  Widget _buildProfilePictureSection() {
    return Center(
      child: Stack(
        children: [
          CircleAvatar(
            radius: 50,
            backgroundImage: AssetImage('assets/profile_placeholder.png'),
            // Placeholder image; replace with actual user image
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: IconButton(
              icon: Icon(Icons.camera_alt, color: Colors.white),
              onPressed: _changeProfilePicture, // Calls a method to change picture
            ),
          ),
        ],
      ),
    );
  }

  // _buildProfileForm
  // 
  // WHAT: Constructs the form for editing the user's name and email.
  // HOW: Uses TextField widgets with controllers for input handling.
  // WHY: To enable users to update their profile information.
  Widget _buildProfileForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Name', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        TextField(
          controller: _nameController,
          decoration: InputDecoration(hintText: 'Enter your name'),
        ),
        SizedBox(height: 16),
        Text('Email', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        TextField(
          controller: _emailController,
          decoration: InputDecoration(hintText: 'Enter your email'),
          keyboardType: TextInputType.emailAddress,
        ),
      ],
    );
  }

  // _buildSaveButton
  // 
  // WHAT: Creates a button widget to save profile changes.
  // HOW: Uses an ElevatedButton with an onPressed callback.
  // WHY: To apply changes made to the profile and update the backend or state.
  Widget _buildSaveButton() {
    return Center(
      child: ElevatedButton(
        onPressed: _saveProfileChanges, // Triggers method to save changes
        child: Text('Save Changes'),
      ),
    );
  }

  // _changeProfilePicture
  // 
  // WHAT: Handles the logic for changing the user's profile picture.
  // HOW: This method would typically open an image picker dialog.
  // WHY: To provide functionality for updating the profile picture.
  void _changeProfilePicture() {
    // Implementation for changing profile picture would go here
    // Typically involves using an image picker package
    print('Change profile picture tapped');
  }

  // _saveProfileChanges
  // 
  // WHAT: Saves the changes made to the user's profile.
  // HOW: Validates inputs and updates the user data via Provider.
  // WHY: To ensure changes are reflected in the app and persisted.
  void _saveProfileChanges() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    // Validate inputs (example: ensure non-empty)
    if (_nameController.text.isEmpty || _emailController.text.isEmpty) {
      _showErrorDialog('Please fill all fields');
      return;
    }
    // Update user data
    userProvider.updateUser(
      name: _nameController.text,
      email: _emailController.text,
    );
    // Show confirmation message
    _showConfirmationDialog('Profile updated successfully!');
  }

  // _showErrorDialog
  // 
  // WHAT: Displays an error dialog with a given message.
  // HOW: Uses Flutter's showDialog function to present a dialog.
  // WHY: To provide user feedback for errors.
  // Parameters: message - The error message to display.
  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  // _showConfirmationDialog
  // 
  // WHAT: Displays a confirmation dialog with a given message.
  // HOW: Uses Flutter's showDialog function to present a dialog.
  // WHY: To confirm success of an operation to the user.
  // Parameters: message - The confirmation message to display.
  void _showConfirmationDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Success'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }
}