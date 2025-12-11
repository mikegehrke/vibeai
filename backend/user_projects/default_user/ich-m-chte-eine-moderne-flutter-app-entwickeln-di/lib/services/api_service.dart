// ********************************************************************
// This file defines the ApiService class which is responsible for
// handling HTTP requests and responses for the application.
// It includes methods for GET, POST, PUT, DELETE requests using the
// Dio package for network operations. The class also includes error
// handling and response parsing.
// ********************************************************************

import 'package:dio/dio.dart';

// ********************************************************************
// ApiService Class
// 
// This class serves as a central service for making API requests
// throughout the application. It abstracts the complexities of network
// operations and provides a consistent interface for interacting with
// different API endpoints.
// 
// Main Components:
// - Dio instance configuration
// - HTTP request methods: GET, POST, PUT, DELETE
// - Error handling and response parsing
// ********************************************************************
class ApiService {
  // Dio instance for handling HTTP requests.
  final Dio _dio;

  // ********************************************************************
  // Constructor: ApiService
  // 
  // WHAT: Initializes the ApiService with a configured Dio instance.
  // HOW: Sets up Dio with default options like base URL and headers.
  // WHY: To ensure all HTTP requests go through a centralized, configured
  // client with consistent settings.
  // 
  // Parameters:
  // - baseUrl: The base URL for the API endpoints.
  // ********************************************************************
  ApiService({required String baseUrl})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: 5000, // 5 seconds
          receiveTimeout: 3000, // 3 seconds
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ));

  // ********************************************************************
  // Method: GET
  // 
  // WHAT: Performs a GET request to the specified endpoint.
  // HOW: Uses Dio's get method to fetch data from the server.
  // WHY: To retrieve data from an API endpoint without modifying it.
  // 
  // Parameters:
  // - endpoint: The specific API endpoint to send the request to.
  // - queryParameters: Optional query parameters for the request.
  // 
  // Returns: A Future containing the server response data.
  // ********************************************************************
  Future<Response> get(String endpoint, {Map<String, dynamic>? queryParameters}) async {
    try {
      final response = await _dio.get(endpoint, queryParameters: queryParameters);
      return response;
    } on DioError catch (e) {
      // Handle error and provide meaningful feedback
      throw Exception('Failed to fetch data: ${e.response?.statusCode} ${e.message}');
    }
  }

  // ********************************************************************
  // Method: POST
  // 
  // WHAT: Performs a POST request to the specified endpoint.
  // HOW: Sends data to the server using Dio's post method.
  // WHY: To create new resources or perform actions on the server.
  // 
  // Parameters:
  // - endpoint: The specific API endpoint to send the request to.
  // - data: The data to send in the body of the request.
  // 
  // Returns: A Future containing the server response data.
  // ********************************************************************
  Future<Response> post(String endpoint, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.post(endpoint, data: data);
      return response;
    } on DioError catch (e) {
      // Handle error and provide meaningful feedback
      throw Exception('Failed to post data: ${e.response?.statusCode} ${e.message}');
    }
  }

  // ********************************************************************
  // Method: PUT
  // 
  // WHAT: Performs a PUT request to the specified endpoint.
  // HOW: Updates existing resources on the server using Dio's put method.
  // WHY: To update resources with new data.
  // 
  // Parameters:
  // - endpoint: The specific API endpoint to send the request to.
  // - data: The data to send in the body of the request.
  // 
  // Returns: A Future containing the server response data.
  // ********************************************************************
  Future<Response> put(String endpoint, {Map<String, dynamic>? data}) async {
    try {
      final response = await _dio.put(endpoint, data: data);
      return response;
    } on DioError catch (e) {
      // Handle error and provide meaningful feedback
      throw Exception('Failed to update data: ${e.response?.statusCode} ${e.message}');
    }
  }

  // ********************************************************************
  // Method: DELETE
  // 
  // WHAT: Performs a DELETE request to the specified endpoint.
  // HOW: Removes resources from the server using Dio's delete method.
  // WHY: To delete resources on the server.
  // 
  // Parameters:
  // - endpoint: The specific API endpoint to send the request to.
  // 
  // Returns: A Future containing the server response data.
  // ********************************************************************
  Future<Response> delete(String endpoint) async {
    try {
      final response = await _dio.delete(endpoint);
      return response;
    } on DioError catch (e) {
      // Handle error and provide meaningful feedback
      throw Exception('Failed to delete data: ${e.response?.statusCode} ${e.message}');
    }
  }
}