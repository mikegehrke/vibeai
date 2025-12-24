// ******************************************************************
// File Header Comment
// ******************************************************************
// This file implements a service class for handling authentication 
// operations in a Flutter application. The AuthService class provides 
// methods to sign up, sign in, and sign out users, utilizing Firebase 
// Authentication as the backend service. Error handling and best practices 
// are incorporated to ensure secure and efficient user authentication.
//
// Major Components:
// - AuthService class: Contains methods for handling user authentication.
// - FirebaseAuth: Used for interaction with Firebase Authentication.
//
// This service is crucial for managing user sessions and ensuring that 
// only authenticated users can access specific parts of the application.

// ******************************************************************
// Section: Imports
// ******************************************************************

// Importing necessary packages
import 'package:firebase_auth/firebase_auth.dart';  // Firebase Authentication library for user management
import 'package:flutter/material.dart';             // Flutter's material design library for UI elements

// ******************************************************************
// Class: AuthService
// ******************************************************************
// This class is a service that encapsulates the authentication logic 
// for Firebase Authentication. It provides methods to handle user 
// registration, login, and logout operations.
//
// The use of this service class promotes code reusability and separation 
// of concerns, making it easier to maintain and test the authentication 
// logic separately from the UI logic.
class AuthService {
  // Instance of FirebaseAuth for handling authentication
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

  // ******************************************************************
  // Method: signUp
  // ******************************************************************
  // WHAT: Registers a new user with an email and password.
  // HOW: Uses Firebase's createUserWithEmailAndPassword method to create
  //      a new user account.
  // WHY: This method is needed to allow new users to register and create
  //      their accounts.
  //
  // Parameters:
  // - email (String): The email address of the user to register.
  // - password (String): The password for the new user account.
  //
  // Returns:
  // - Future<UserCredential>: A Future that resolves to the authentication
  //                           credential of the newly created user.
  Future<UserCredential> signUp(String email, String password) async {
    try {
      // Attempt to create a new user with the provided email and password
      return await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      // Handle specific error codes and provide meaningful messages
      if (e.code == 'email-already-in-use') {
        throw Exception('The email address is already in use by another account.');
      } else if (e.code == 'weak-password') {
        throw Exception('The password provided is too weak.');
      }
      throw Exception('Failed to register: ${e.message}');
    }
  }

  // ******************************************************************
  // Method: signIn
  // ******************************************************************
  // WHAT: Signs in an existing user using email and password.
  // HOW: Utilizes Firebase's signInWithEmailAndPassword method to log
  //      the user in.
  // WHY: This method is essential for allowing users to access their 
  //      accounts and use the app's features.
  //
  // Parameters:
  // - email (String): The email address of the user attempting to sign in.
  // - password (String): The password for the user's account.
  //
  // Returns:
  // - Future<UserCredential>: A Future that resolves to the authentication
  //                           credential of the signed-in user.
  Future<UserCredential> signIn(String email, String password) async {
    try {
      // Attempt to sign in the user with the provided email and password
      return await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      // Handle specific error codes and provide meaningful messages
      if (e.code == 'user-not-found') {
        throw Exception('No user found for that email.');
      } else if (e.code == 'wrong-password') {
        throw Exception('Wrong password provided.');
      }
      throw Exception('Failed to sign in: ${e.message}');
    }
  }

  // ******************************************************************
  // Method: signOut
  // ******************************************************************
  // WHAT: Signs out the currently logged-in user.
  // HOW: Calls FirebaseAuth's signOut method to terminate the user session.
  // WHY: This method is necessary to log users out and maintain security
  //      by ensuring that user sessions are properly ended.
  //
  // Returns:
  // - Future<void>: A Future that resolves when the sign-out operation is complete.
  Future<void> signOut() async {
    try {
      // Sign out the currently logged-in user
      await _firebaseAuth.signOut();
    } catch (e) {
      // If sign out fails, throw an exception with a meaningful message
      throw Exception('Failed to sign out: ${e.toString()}');
    }
  }

  // ******************************************************************
  // Method: getCurrentUser
  // ******************************************************************
  // WHAT: Retrieves the current logged-in user, if any.
  // HOW: Uses the currentUser property of FirebaseAuth to get the user.
  // WHY: This method is important to check the authentication state
  //      and manage user sessions appropriately.
  //
  // Returns:
  // - User?: The currently logged-in user, or null if no user is logged in.
  User? getCurrentUser() {
    // Return the current user from FirebaseAuth
    return _firebaseAuth.currentUser;
  }
}