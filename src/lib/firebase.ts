/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp } from 'firebase/app';
import { 
  getAuth,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { Platform } from 'react-native';

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
const auth = getAuth(app);

// Enable persistence
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase auth persistence enabled');
    })
    .catch((error) => {
      console.error('Error setting persistence:', error);
    });
} catch (error) {
  console.warn('Could not set persistence:', error);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Functions
const functions = getFunctions(app);

// Initialize Storage
const storage = getStorage(app);

// Connect to emulators in development
if (__DEV__) {
  try {
    // Only connect to emulators if specifically enabled
    const useEmulators = false; // Set to true to use emulators

    if (useEmulators) {
      const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
      
      // Auth emulator
      // connectAuthEmulator(auth, `http://${host}:9099`);
      console.log('Connected to Auth emulator');
      
      // Firestore emulator
      connectFirestoreEmulator(db, host, 8080);
      console.log('Connected to Firestore emulator');
      
      // Functions emulator
      connectFunctionsEmulator(functions, host, 5001);
      console.log('Connected to Functions emulator');
      
      // Storage emulator
      connectStorageEmulator(storage, host, 9199);
      console.log('Connected to Storage emulator');
    }
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

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