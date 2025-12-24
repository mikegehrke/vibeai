/*
 * This file defines the StorageService class, which is responsible for handling
 * data storage operations in a Flutter application. It offers methods to store,
 * retrieve, and delete data from persistent storage using the SharedPreferences
 * package. This service abstracts the complexities of direct storage operations,
 * providing a simple interface for data management throughout the app.
 */

// Import necessary packages
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

/*
 * StorageService
 *
 * WHAT: This class provides a set of methods for interacting with persistent
 * storage using SharedPreferences.
 * 
 * HOW: It uses SharedPreferences to save, retrieve, and delete key-value pairs.
 * The methods are asynchronous, ensuring they do not block the main thread.
 * 
 * WHY: A centralized storage service ensures that data operations are consistent
 * across the app and simplifies the codebase by abstracting storage logic.
 */
class StorageService {
  // Singleton pattern implementation to ensure only one instance of StorageService exists.
  static final StorageService _instance = StorageService._internal();

  // Internal constructor
  StorageService._internal();

  // Factory constructor to return the singleton instance
  factory StorageService() {
    return _instance;
  }

  /*
   * saveData
   *
   * WHAT: Saves a string value in persistent storage under a specified key.
   * HOW: Utilizes SharedPreferences to store the value asynchronously.
   * WHY: Provides a simple interface to persistently save data.
   * 
   * Parameters:
   * - key (String): The key under which the value is stored.
   * - value (String): The string value to store.
   * 
   * Returns: A Future<bool> indicating if the operation was successful.
   */
  Future<bool> saveData(String key, String value) async {
    try {
      // Obtain an instance of SharedPreferences
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      // Save the string value under the provided key
      return await prefs.setString(key, value);
    } catch (e) {
      // Log error and return false in case of a failure
      print('Error saving data: $e');
      return false;
    }
  }

  /*
   * getData
   *
   * WHAT: Retrieves a string value from persistent storage using a given key.
   * HOW: Uses SharedPreferences to access the stored value asynchronously.
   * WHY: Allows retrieval of previously saved data for use in the application.
   * 
   * Parameters:
   * - key (String): The key for which to retrieve the stored value.
   * 
   * Returns: A Future<String?> representing the retrieved value or null if not found.
   */
  Future<String?> getData(String key) async {
    try {
      // Obtain an instance of SharedPreferences
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      // Retrieve the string value stored under the provided key
      return prefs.getString(key);
    } catch (e) {
      // Log error and return null if retrieval fails
      print('Error retrieving data: $e');
      return null;
    }
  }

  /*
   * deleteData
   *
   * WHAT: Deletes a value from persistent storage using a specific key.
   * HOW: Utilizes SharedPreferences to remove the value asynchronously.
   * WHY: Necessary for removing data that is no longer needed, freeing resources.
   * 
   * Parameters:
   * - key (String): The key for which to delete the stored value.
   * 
   * Returns: A Future<bool> indicating if the deletion was successful.
   */
  Future<bool> deleteData(String key) async {
    try {
      // Obtain an instance of SharedPreferences
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      // Remove the value stored under the provided key
      return await prefs.remove(key);
    } catch (e) {
      // Log error and return false if deletion fails
      print('Error deleting data: $e');
      return false;
    }
  }
}