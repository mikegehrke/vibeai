/*
 * This file defines the HomeScreen widget, which serves as the main landing page for the Flutter application.
 * The HomeScreen includes a user interface with interactive elements and integrates state management to handle user interactions.
 * Main components include: 
 * - AppBar for the top navigation
 * - A ListView displaying dynamic content
 * - Floating Action Button to trigger actions
 */

import 'package:flutter/material.dart';

// HomeScreen is a stateful widget because it will manage dynamic content and user interactions
class HomeScreen extends StatefulWidget {
  // Constructor for HomeScreen
  HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

// State class for HomeScreen
class _HomeScreenState extends State<HomeScreen> {
  // List of items to display in the ListView, simulating dynamic content
  List<String> _items = [];

  // Initialization logic, runs when the state is created
  @override
  void initState() {
    super.initState();
    // Populate initial data into the list
    _loadInitialData();
  }

  // Function to load initial data into the list
  void _loadInitialData() {
    // Adding some dummy data to the list
    setState(() {
      _items = ['Item 1', 'Item 2', 'Item 3'];
    });
  }

  /*
   * Builds the UI for the HomeScreen
   * Consists of a Scaffold with an AppBar, ListView, and FloatingActionButton
   */
  @override
  Widget build(BuildContext context) {
    // Scaffold provides the framework for the basic material design visual layout structure
    return Scaffold(
      appBar: AppBar(
        // Title of the app bar
        title: Text('Home Screen'),
      ),
      // Body of the Scaffold where main content is displayed
      body: _buildListView(),
      // Floating Action Button to add new items to the list
      floatingActionButton: FloatingActionButton(
        onPressed: _addItem, // Action to perform on button press
        tooltip: 'Add Item', // Tooltip on long press
        child: Icon(Icons.add), // Icon to display on button
      ),
    );
  }

  /*
   * Builds a ListView widget to display a list of items
   * This is a scrollable list of widgets
   */
  Widget _buildListView() {
    return ListView.builder(
      // Number of items in the list
      itemCount: _items.length,
      // Builds each item in the list
      itemBuilder: (context, index) {
        return ListTile(
          // Title of each list item
          title: Text(_items[index]),
          // Action when the list item is tapped
          onTap: () => _onItemTap(index),
        );
      },
    );
  }

  /*
   * Adds a new item to the list
   * This function is called when the FloatingActionButton is pressed
   */
  void _addItem() {
    setState(() {
      // Adding a new item with a unique name based on current length of list
      _items.add('Item ${_items.length + 1}');
    });
  }

  /*
   * Handles tap events on list items
   * Displays a Snackbar with the item's name
   */
  void _onItemTap(int index) {
    // Showing a Snackbar at the bottom of the screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Tapped on ${_items[index]}'),
      ),
    );
  }
}