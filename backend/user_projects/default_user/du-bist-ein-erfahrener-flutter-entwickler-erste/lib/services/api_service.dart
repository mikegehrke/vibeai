/*
 * This file defines the ApiService class which is responsible for handling all API-related operations.
 * The purpose of this service is to provide a centralized and reusable way to perform network requests,
 * handle responses, and manage errors efficiently across the Flutter application.
 * 
 * Main components of this file include:
 * - Imports: Necessary Dart and Flutter packages for HTTP requests and error handling.
 * - ApiService Class: Core class that contains methods for GET, POST, PUT, and DELETE HTTP methods.
 * - Error Handling: Mechanisms to catch and process errors during network requests.
 */

// Section: Imports
import 'dart:convert'; // For converting JSON responses to Dart objects
import 'package:http/http.dart' as http; // HTTP package to make network requests
import 'package:flutter/material.dart'; // Flutter package for core functionalities

// Section: ApiService Class

/*
 * ApiService is a singleton class that provides methods to interact with RESTful APIs.
 * 
 * WHAT: Handles HTTP requests (GET, POST, PUT, DELETE) and processes their responses.
 * HOW: Utilizes the http package to send requests and manage responses.
 * WHY: Centralizing API calls in one class makes the codebase easier to maintain and extend.
 */
class ApiService {
  // Singleton pattern implementation to ensure a single instance
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // Base URL for the API
  final String _baseUrl = "https://api.example.com";

  /*
   * Method to perform a GET request
   * 
   * WHAT: Fetches data from the server using a GET request.
   * HOW: Sends a GET request to the specified endpoint and returns the response data.
   * WHY: Needed to retrieve data from the server.
   * 
   * Parameters:
   * - [endpoint] (String): The API endpoint to send the request to.
   * 
   * Returns: Future<dynamic>: The data from the API response.
   */
  Future<dynamic> getRequest(String endpoint) async {
    try {
      // Constructing the complete URL
      final url = Uri.parse("$_baseUrl/$endpoint");
      // Sending GET request
      final response = await http.get(url);

      // Checking if the response is successful
      if (response.statusCode == 200) {
        // Parsing the response body as JSON
        return jsonDecode(response.body);
      } else {
        // Throwing an exception if the response is not successful
        throw Exception('Failed to load data');
      }
    } catch (e) {
      // Logging and rethrowing the error for further handling
      debugPrint('Error in GET request: $e');
      throw e;
    }
  }

  /*
   * Method to perform a POST request
   * 
   * WHAT: Sends data to the server using a POST request.
   * HOW: Encodes the provided data to JSON and sends it to the specified endpoint.
   * WHY: Needed to create new resources on the server.
   * 
   * Parameters:
   * - [endpoint] (String): The API endpoint to send the request to.
   * - [data] (Map<String, dynamic>): The data to be sent in the request body.
   * 
   * Returns: Future<dynamic>: The data from the API response.
   */
  Future<dynamic> postRequest(String endpoint, Map<String, dynamic> data) async {
    try {
      // Constructing the complete URL
      final url = Uri.parse("$_baseUrl/$endpoint");
      // Sending POST request with JSON-encoded data
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );

      // Checking if the response is successful
      if (response.statusCode == 201) {
        // Parsing the response body as JSON
        return jsonDecode(response.body);
      } else {
        // Throwing an exception if the response is not successful
        throw Exception('Failed to post data');
      }
    } catch (e) {
      // Logging and rethrowing the error for further handling
      debugPrint('Error in POST request: $e');
      throw e;
    }
  }

  /*
   * Method to perform a PUT request
   * 
   * WHAT: Updates data on the server using a PUT request.
   * HOW: Encodes the provided data to JSON and sends it to the specified endpoint.
   * WHY: Needed to update existing resources on the server.
   * 
   * Parameters:
   * - [endpoint] (String): The API endpoint to send the request to.
   * - [data] (Map<String, dynamic>): The data to be sent in the request body.
   * 
   * Returns: Future<dynamic>: The data from the API response.
   */
  Future<dynamic> putRequest(String endpoint, Map<String, dynamic> data) async {
    try {
      // Constructing the complete URL
      final url = Uri.parse("$_baseUrl/$endpoint");
      // Sending PUT request with JSON-encoded data
      final response = await http.put(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(data),
      );

      // Checking if the response is successful
      if (response.statusCode == 200) {
        // Parsing the response body as JSON
        return jsonDecode(response.body);
      } else {
        // Throwing an exception if the response is not successful
        throw Exception('Failed to update data');
      }
    } catch (e) {
      // Logging and rethrowing the error for further handling
      debugPrint('Error in PUT request: $e');
      throw e;
    }
  }

  /*
   * Method to perform a DELETE request
   * 
   * WHAT: Removes data from the server using a DELETE request.
   * HOW: Sends a DELETE request to the specified endpoint.
   * WHY: Needed to delete resources from the server.
   * 
   * Parameters:
   * - [endpoint] (String): The API endpoint to send the request to.
   * 
   * Returns: Future<bool>: True if the deletion was successful, false otherwise.
   */
  Future<bool> deleteRequest(String endpoint) async {
    try {
      // Constructing the complete URL
      final url = Uri.parse("$_baseUrl/$endpoint");
      // Sending DELETE request
      final response = await http.delete(url);

      // Checking if the response is successful
      if (response.statusCode == 200) {
        return true; // Deletion was successful
      } else {
        // Throwing an exception if the response is not successful
        throw Exception('Failed to delete data');
      }
    } catch (e) {
      // Logging and rethrowing the error for further handling
      debugPrint('Error in DELETE request: $e');
      throw e;
    }
  }
}