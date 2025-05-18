/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, indexedDBLocalPersistence } from 'firebase/auth';
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

// Define types for Firebase services
interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  functions: Functions | null;
  storage: FirebaseStorage | null;
}

// Initialize Firebase
let app: FirebaseApp;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase Auth
// Note: This is a basic initialization that will work with Expo Go.
// For a production app, we would use React Native Firebase's native modules.
const auth = getAuth(app);

// Initialize other Firebase services
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Set up AsyncStorage-based persistence manually
// Store the user's auth state in AsyncStorage when it changes
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      // Store minimal user data
      const userData = {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      };
      await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing auth state:', error);
    }
  } else {
    try {
      await AsyncStorage.removeItem('auth_user');
    } catch (error) {
      console.error('Error removing auth state:', error);
    }
  }
});

// Helper function to safely perform Firebase operations with error handling
export const safeFirebaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
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

// Export Firebase services
export {
  app,
  auth,
  db,
  functions,
  storage
};

// Also export the getters for compatibility
export {
  getAuth,
  getFirestore,
  getFunctions,
  getStorage
}; 