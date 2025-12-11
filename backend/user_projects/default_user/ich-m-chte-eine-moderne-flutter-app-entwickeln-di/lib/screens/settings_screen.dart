/*
  This file defines the SettingsScreen widget for a Flutter app.
  The SettingsScreen provides a user interface for managing application settings.
  It includes widgets for toggling settings, updating preferences, and saving changes.
  This code ensures a seamless user experience by handling state and ensuring responsive design.
*/

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

// The SettingsScreen widget is a StatefulWidget because it needs to manage dynamic state changes
class SettingsScreen extends StatefulWidget {
  // Constructor for SettingsScreen
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

// This private State class manages the state of the SettingsScreen widget
class _SettingsScreenState extends State<SettingsScreen> {
  // Variables to hold the current state of the settings
  bool _notificationsEnabled = false; // Whether notifications are enabled
  String _theme = 'Light'; // Currently selected theme, default is 'Light'
  
  // Initialize the settings by loading saved preferences
  @override
  void initState() {
    super.initState();
    // Load saved settings asynchronously
    _loadSettings();
  }

  // Function to asynchronously load saved settings from SharedPreferences
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    // Retrieve settings from SharedPreferences and update state
    setState(() {
      _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? false;
      _theme = prefs.getString('theme') ?? 'Light';
    });
  }

  // Function to save the current settings to SharedPreferences
  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    // Save current settings to SharedPreferences
    await prefs.setBool('notificationsEnabled', _notificationsEnabled);
    await prefs.setString('theme', _theme);
  }

  // Build method to create the UI of the SettingsScreen
  @override
  Widget build(BuildContext context) {
    // Scaffold provides the basic material design layout structure
    return Scaffold(
      appBar: AppBar(
        // AppBar title
        title: const Text('Settings'),
      ),
      // Body of the scaffold containing settings options
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Switch to toggle notifications
            SwitchListTile(
              title: const Text('Enable Notifications'),
              value: _notificationsEnabled,
              // Update state when switch is toggled
              onChanged: (bool value) {
                setState(() {
                  _notificationsEnabled = value;
                });
                // Save settings when changed
                _saveSettings();
              },
            ),
            const SizedBox(height: 20),
            // Dropdown to select theme
            Text(
              'Select Theme',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            DropdownButton<String>(
              value: _theme,
              // Dropdown menu items for theme selection
              items: <String>['Light', 'Dark', 'System Default'].map((String value) {
                return DropdownMenuItem<String>(
                  value: value,
                  child: Text(value),
                );
              }).toList(),
              // Update state when a new theme is selected
              onChanged: (String? newValue) {
                setState(() {
                  _theme = newValue!;
                });
                // Save settings when changed
                _saveSettings();
              },
            ),
          ],
        ),
      ),
    );
  }
}