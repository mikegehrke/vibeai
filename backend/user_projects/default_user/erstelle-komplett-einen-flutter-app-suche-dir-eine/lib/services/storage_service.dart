import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// A service class to handle local storage using SharedPreferences.
/// This class provides methods to save, retrieve and delete data.
class StorageService {
  static final StorageService _instance = StorageService._internal();

  factory StorageService() {
    return _instance;
  }

  StorageService._internal();

  /// Save a string value to local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// [value] is the string data to be stored.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> saveString(String key, String value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setString(key, value);
    } catch (e) {
      print('Error saving string to storage: $e');
      return false;
    }
  }

  /// Retrieve a string value from local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// Returns the string value associated with the key or null if not found.
  Future<String?> getString(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(key);
    } catch (e) {
      print('Error retrieving string from storage: $e');
      return null;
    }
  }

  /// Save an integer value to local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// [value] is the integer data to be stored.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> saveInt(String key, int value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setInt(key, value);
    } catch (e) {
      print('Error saving int to storage: $e');
      return false;
    }
  }

  /// Retrieve an integer value from local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// Returns the integer value associated with the key or null if not found.
  Future<int?> getInt(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getInt(key);
    } catch (e) {
      print('Error retrieving int from storage: $e');
      return null;
    }
  }

  /// Save a boolean value to local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// [value] is the boolean data to be stored.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> saveBool(String key, bool value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setBool(key, value);
    } catch (e) {
      print('Error saving bool to storage: $e');
      return false;
    }
  }

  /// Retrieve a boolean value from local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// Returns the boolean value associated with the key or null if not found.
  Future<bool?> getBool(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(key);
    } catch (e) {
      print('Error retrieving bool from storage: $e');
      return null;
    }
  }

  /// Save a double value to local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// [value] is the double data to be stored.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> saveDouble(String key, double value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setDouble(key, value);
    } catch (e) {
      print('Error saving double to storage: $e');
      return false;
    }
  }

  /// Retrieve a double value from local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// Returns the double value associated with the key or null if not found.
  Future<double?> getDouble(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getDouble(key);
    } catch (e) {
      print('Error retrieving double from storage: $e');
      return null;
    }
  }

  /// Save a list of strings to local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// [value] is the list of strings to be stored.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> saveStringList(String key, List<String> value) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.setStringList(key, value);
    } catch (e) {
      print('Error saving string list to storage: $e');
      return false;
    }
  }

  /// Retrieve a list of strings from local storage.
  /// 
  /// [key] is the unique identifier for the data.
  /// Returns the list of strings associated with the key or null if not found.
  Future<List<String>?> getStringList(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getStringList(key);
    } catch (e) {
      print('Error retrieving string list from storage: $e');
      return null;
    }
  }

  /// Remove a value from local storage.
  /// 
  /// [key] is the unique identifier for the data to be removed.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> remove(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.remove(key);
    } catch (e) {
      print('Error removing data from storage: $e');
      return false;
    }
  }

  /// Clears all the data in local storage.
  /// Use with caution as it will remove all saved values.
  /// Returns a [Future] indicating the success or failure of the operation.
  Future<bool> clear() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return await prefs.clear();
    } catch (e) {
      print('Error clearing storage: $e');
      return false;
    }
  }
}