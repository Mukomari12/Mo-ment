/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyANbE9eeJuC4DUvJe4lNC8pFn-LLieejTo",
  authDomain: "mo-ment-prod.firebaseapp.com",
  projectId: "mo-ment-prod",
  storageBucket: "mo-ment-prod.firebasestorage.app",
  messagingSenderId: "188833780043",
  appId: "1:188833780043:ios:a2682386378695131f58ce"
};

// Initialize Firebase
let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
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
