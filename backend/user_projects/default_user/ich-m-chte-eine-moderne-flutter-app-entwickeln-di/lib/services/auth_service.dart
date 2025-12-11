/*
 * This file defines the AuthService class, which provides authentication services for a Flutter app.
 * The main purpose of this file is to handle user authentication using email and password, 
 * and manage user session information. This service is crucial for any app that requires 
 * user sign-in functionality. The main components include:
 * - User registration
 * - User login
 * - User logout
 * - Session management
 * - Error handling for authentication operations
 */

// Section: Imports
import 'dart:async'; // For managing asynchronous operations
import 'package:firebase_auth/firebase_auth.dart'; // Firebase authentication package
import 'package:flutter/foundation.dart'; // For foundation operations like debug logging

// Section: AuthService Class
/*
 * AuthService class provides methods to handle user authentication.
 * 
 * WHAT: Provides methods for user registration, login, logout, and session management.
 * HOW: Utilizes FirebaseAuth for backend authentication operations.
 * WHY: Centralizes authentication logic, making it easier to maintain and update.
 */
class AuthService {
  // FirebaseAuth instance to interact with Firebase authentication
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  // Constructor
  AuthService();

  // Function: Register User
  /*
   * Registers a new user using email and password.
   * 
   * Parameters:
   * - email (String): The user's email address.
   * - password (String): The user's password.
   * 
   * Returns:
   * - Future<UserCredential>: The credential of the registered user.
   * 
   * HOW: Calls FirebaseAuth's createUserWithEmailAndPassword method.
   * WHY: To allow new users to create an account with email and password.
   */
  Future<UserCredential> registerUser(String email, String password) async {
    try {
      // Attempt to create a new user with email and password
      return await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      // Handle specific Firebase authentication errors
      if (kDebugMode) {
        print('Firebase Auth Exception: ${e.message}');
      }
      rethrow; // Rethrow error for further handling by the caller
    } catch (e) {
      // Handle any other errors
      if (kDebugMode) {
        print('General Exception: $e');
      }
      rethrow;
    }
  }

  // Function: Login User
  /*
   * Logs in an existing user using email and password.
   * 
   * Parameters:
   * - email (String): The user's email address.
   * - password (String): The user's password.
   * 
   * Returns:
   * - Future<UserCredential>: The credential of the logged-in user.
   * 
   * HOW: Calls FirebaseAuth's signInWithEmailAndPassword method.
   * WHY: To authenticate users and allow access to the app's features.
   */
  Future<UserCredential> loginUser(String email, String password) async {
    try {
      // Attempt to sign in the user with email and password
      return await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      // Handle specific Firebase authentication errors
      if (kDebugMode) {
        print('Firebase Auth Exception: ${e.message}');
      }
      rethrow;
    } catch (e) {
      // Handle any other errors
      if (kDebugMode) {
        print('General Exception: $e');
      }
      rethrow;
    }
  }

  // Function: Logout User
  /*
   * Logs out the current user.
   * 
   * Returns:
   * - Future<void>: Indicates the completion of the logout process.
   * 
   * HOW: Calls FirebaseAuth's signOut method.
   * WHY: To end the user's session and revoke access to app's features.
   */
  Future<void> logoutUser() async {
    try {
      // Sign out the current user
      return await _firebaseAuth.signOut();
    } catch (e) {
      // Handle any errors that occur during sign out
      if (kDebugMode) {
        print('Sign Out Exception: $e');
      }
      rethrow;
    }
  }

  // Function: Current User Stream
  /*
   * Provides a stream of authentication state changes.
   * 
   * Returns:
   * - Stream<User?>: A stream that emits the current user or null if logged out.
   * 
   * HOW: Uses FirebaseAuth's authStateChanges method.
   * WHY: To allow the app to react to authentication state changes in real-time.
   */
  Stream<User?> authStateChanges() {
    return _firebaseAuth.authStateChanges();
  }

  // Function: Get Current User
  /*
   * Retrieves the currently signed-in user.
   * 
   * Returns:
   * - User?: The currently logged-in user or null if no user is logged in.
   * 
   * HOW: Accesses FirebaseAuth's currentUser property.
   * WHY: To get the currently authenticated user for session management.
   */
  User? get currentUser {
    return _firebaseAuth.currentUser;
  }
}