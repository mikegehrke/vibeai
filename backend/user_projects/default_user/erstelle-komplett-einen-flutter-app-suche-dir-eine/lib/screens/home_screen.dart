import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Simulating a list of items for demonstration purposes
  final List<String> _items = List<String>.generate(20, (i) => "Item $i");
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text('Home Screen'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _refreshItems,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: _addItem,
        tooltip: 'Add Item',
        child: Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody() {
    if (_items.isEmpty) {
      return Center(
        child: Text(
          'No items available.',
          style: TextStyle(fontSize: 18),
        ),
      );
    }
    return ListView.builder(
      itemCount: _items.length,
      itemBuilder: (context, index) {
        return ListTile(
          title: Text(_items[index]),
          trailing: IconButton(
            icon: Icon(Icons.delete),
            onPressed: () => _deleteItem(index),
          ),
        );
      },
    );
  }

  // Method to refresh items
  void _refreshItems() {
    setState(() {
      _items.shuffle();
    });
    _showSnackBar('Items refreshed');
  }

  // Method to add a new item
  void _addItem() {
    setState(() {
      _items.add('New Item ${_items.length}');
    });
    _showSnackBar('Item added');
  }

  // Method to delete an item
  void _deleteItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
    _showSnackBar('Item deleted');
  }

  // Method to show a Snackbar with a message
  void _showSnackBar(String message) {
    _scaffoldKey.currentState?.showSnackBar(
      SnackBar(
        content: Text(message),
        duration: Duration(seconds: 2),
      ),
    );
  }
}