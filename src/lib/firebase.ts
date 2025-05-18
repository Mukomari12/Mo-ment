/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Use configuration from environment variables or fallback to hardcoded values for development
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || "AIzaSyANbE9eeJuC4DUvJe4lNC8pFn-LLieejTo",
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || "mo-ment-prod.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || "mo-ment-prod",
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || "mo-ment-prod.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_SENDER_ID || "188833780043",
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || "1:188833780043:ios:a2682386378695131f58ce"
};

// Make sure we initialize Firebase early
let app: FirebaseApp;
try {
  console.log("Initializing Firebase app...");
  app = getApp();
  console.log("Firebase app already initialized");
} catch (error) {
  console.log("Initializing new Firebase app");
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase Auth BEFORE other Firebase services
const auth = getAuth(app);
console.log("Firebase Auth initialized:", !!auth);

// Define a custom class that wraps the Firebase auth object to ensure it's loaded
class AuthWrapper {
  private _auth: Auth;
  private _user: User | null = null;
  private _isReady: boolean = false;
  private _readyCallbacks: Array<() => void> = [];

  constructor(auth: Auth) {
    this._auth = auth;
    
    // Set up auth state listener to maintain local state
    onAuthStateChanged(this._auth, (user) => {
      console.log("Auth state changed, user:", user?.uid);
      this._user = user;
      this._isReady = true;
      
      // Call ready callbacks
      this._readyCallbacks.forEach(callback => callback());
      this._readyCallbacks = [];
      
      // Store minimal user data in AsyncStorage
      if (user) {
        AsyncStorage.setItem('auth_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        })).catch(err => console.error("Error storing auth state:", err));
      } else {
        AsyncStorage.removeItem('auth_user').catch(err => console.error("Error clearing auth state:", err));
      }
    });
  }
  
  // Get the current user
  get currentUser(): User | null {
    return this._user;
  }
  
  // Ensure auth is ready before proceeding
  whenReady(): Promise<void> {
    if (this._isReady) {
      return Promise.resolve();
    }
    
    return new Promise((resolve) => {
      this._readyCallbacks.push(resolve);
    });
  }
  
  // Forward all method calls to the underlying auth object
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this._auth, callback);
  }
  
  signOut(): Promise<void> {
    return this._auth.signOut();
  }
  
  // Add other auth methods as needed...
}

// Create a wrapper for Firebase Auth
const wrappedAuth = new AuthWrapper(auth);

// Initialize other Firebase services
console.log("Initializing other Firebase services");
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Helper function to safely perform Firebase operations with error handling
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    // Make sure auth is ready before proceeding
    await wrappedAuth.whenReady();
    return await operation();
  } catch (error: any) {
    console.error('Firebase operation failed:', error?.message || error);
    return fallback;
  }
};

// Helper function for handling Firestore errors
export const handleFirestoreError = (error: any): string => {
  console.error('Firestore operation error:', error);
  
  // Map common Firestore error codes to user-friendly messages
  const errorCode = error?.code || '';
  if (errorCode.includes('permission-denied')) {
    return 'You do not have permission to perform this operation.';
  } else if (errorCode.includes('not-found')) {
    return 'The requested document was not found.';
  } else if (errorCode.includes('already-exists')) {
    return 'The document already exists.';
  } else {
    return error?.message || 'An unexpected error occurred.';
  }
};

// Helper to check if we can perform write operations (needs online connectivity)
export const canPerformWrite = async (): Promise<boolean> => {
  return true; // We'll implement network detection elsewhere
};

// Export the wrapped auth object as if it were the regular auth object
// This ensures compatibility with existing code
export { app, wrappedAuth as auth, db, functions, storage };

// Also export the getters for compatibility
export {
  getAuth,
  getFirestore,
  getFunctions,
  getStorage
}; 