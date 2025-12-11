/*
 * This file defines the StorageService class which provides functionalities
 * to interact with local storage in a Flutter application. It uses the 
 * SharedPreferences package to store, retrieve, and manage key-value pairs.
 * Main components of this file include methods for saving, retrieving, 
 * and deleting data from storage.
 */

import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async'; // For Future and async operations

/*
 * StorageService
 * 
 * WHAT: A service class that provides an interface for storing and retrieving
 * data using SharedPreferences.
 * 
 * HOW: It abstracts the SharedPreferences API, making it easier to use 
 * throughout the application. It provides methods to save, retrieve, 
 * and delete different types of data such as strings, integers, booleans, 
 * and string lists.
 * 
 * WHY: Centralizing storage logic in a service class promotes code 
 * reusability and maintainability. It also encapsulates the storage 
 * mechanism, allowing for easier changes if the storage strategy needs 
 * to be updated in the future.
 */
class StorageService {
  // Singleton pattern to ensure a single instance of StorageService.
  static final StorageService _instance = StorageService._internal();

  // Private constructor
  StorageService._internal();

  // Factory constructor to return the singleton instance
  factory StorageService() {
    return _instance;
  }

  /*
   * saveString
   * 
   * WHAT: Saves a string value in the local storage.
   * 
   * HOW: Uses SharedPreferences to set a string value for a given key.
   * 
   * WHY: To persist user data or application state as a string.
   * 
   * @param key: The key under which the value will be stored.
   * @param value: The string value to be saved.
   * @returns Future<void>: Completes when the value is successfully saved.
   */
  Future<void> saveString(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  /*
   * getString
   * 
   * WHAT: Retrieves a string value from local storage.
   * 
   * HOW: Uses SharedPreferences to get a string value for a given key.
   * 
   * WHY: To retrieve previously stored user data or application state.
   * 
   * @param key: The key associated with the value to be retrieved.
   * @returns Future<String?>: The string value if it exists, otherwise null.
   */
  Future<String?> getString(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  /*
   * saveInt
   * 
   * WHAT: Saves an integer value in the local storage.
   * 
   * HOW: Uses SharedPreferences to set an int value for a given key.
   * 
   * WHY: To persist numerical data such as counters or scores.
   * 
   * @param key: The key under which the value will be stored.
   * @param value: The integer value to be saved.
   * @returns Future<void>: Completes when the value is successfully saved.
   */
  Future<void> saveInt(String key, int value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(key, value);
  }

  /*
   * getInt
   * 
   * WHAT: Retrieves an integer value from local storage.
   * 
   * HOW: Uses SharedPreferences to get an int value for a given key.
   * 
   * WHY: To retrieve previously stored numerical data.
   * 
   * @param key: The key associated with the value to be retrieved.
   * @returns Future<int?>: The integer value if it exists, otherwise null.
   */
  Future<int?> getInt(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(key);
  }

  /*
   * saveBool
   * 
   * WHAT: Saves a boolean value in the local storage.
   * 
   * HOW: Uses SharedPreferences to set a bool value for a given key.
   * 
   * WHY: To persist true/false states such as user preferences.
   * 
   * @param key: The key under which the value will be stored.
   * @param value: The boolean value to be saved.
   * @returns Future<void>: Completes when the value is successfully saved.
   */
  Future<void> saveBool(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
  }

  /*
   * getBool
   * 
   * WHAT: Retrieves a boolean value from local storage.
   * 
   * HOW: Uses SharedPreferences to get a bool value for a given key.
   * 
   * WHY: To retrieve previously stored true/false states.
   * 
   * @param key: The key associated with the value to be retrieved.
   * @returns Future<bool?>: The boolean value if it exists, otherwise null.
   */
  Future<bool?> getBool(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(key);
  }

  /*
   * remove
   * 
   * WHAT: Removes a value from local storage.
   * 
   * HOW: Uses SharedPreferences to remove a value for a given key.
   * 
   * WHY: To delete data that is no longer needed.
   * 
   * @param key: The key associated with the value to be removed.
   * @returns Future<void>: Completes when the value is successfully removed.
   */
  Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  /*
   * clear
   * 
   * WHAT: Clears all data from local storage.
   * 
   * HOW: Uses SharedPreferences to clear all stored key-value pairs.
   * 
   * WHY: To reset the storage, such as during user logout.
   * 
   * @returns Future<void>: Completes when all data is successfully cleared.
   */
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}