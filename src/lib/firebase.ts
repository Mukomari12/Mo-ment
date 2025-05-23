/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
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

// Custom persistence implementation for React Native
const reactNativePersistence = {
  type: 'LOCAL' as const,
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  }
};

// Initialize Firebase
let app: FirebaseApp;
try {
  console.log("Initializing Firebase app...");
  app = getApp();
  console.log("Firebase app already initialized");
} catch (error) {
  console.log("Initializing new Firebase app");
  app = initializeApp(firebaseConfig);
}

// Initialize Auth with proper React Native support
let auth: Auth;
try {
  // Try to get existing auth instance first
  auth = getAuth(app);
  console.log("Using existing auth instance");
} catch (error) {
  console.log("Initializing new auth instance with React Native persistence");
  // If no auth instance exists, create one with React Native persistence
  auth = initializeAuth(app, {
    persistence: reactNativePersistence
  });
}

console.log("Firebase Auth initialized:", !!auth);

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
export { app, auth, db, functions, storage };

// Also export the getters for compatibility
export {
  getAuth,
  getFirestore,
  getFunctions,
  getStorage
}; 