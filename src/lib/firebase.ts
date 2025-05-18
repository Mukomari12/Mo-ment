/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';
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

// Define types for Firebase services
interface FirebaseServices {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  functions: Functions | null;
  storage: FirebaseStorage | null;
}

// Initialize Firebase with delayed initialization
const initializeFirebase = (): FirebaseServices => {
  try {
    // Get existing Firebase app instance or create a new one
    let firebaseApp;
    try {
      firebaseApp = getApp();
    } catch (error) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    // Initialize Firebase services
    const firebaseAuth = getAuth(firebaseApp);
    const firebaseDb = getFirestore(firebaseApp);
    const firebaseFunctions = getFunctions(firebaseApp);
    const firebaseStorage = getStorage(firebaseApp);
    
    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      functions: firebaseFunctions,
      storage: firebaseStorage
    };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return {
      app: null,
      auth: null,
      db: null,
      functions: null,
      storage: null
    };
  }
};

// Export Firebase services lazily to avoid early initialization
let firebaseServices: FirebaseServices | undefined;

export const getFirebaseServices = (): FirebaseServices => {
  if (!firebaseServices) {
    firebaseServices = initializeFirebase();
  }
  return firebaseServices;
};

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

// For backward compatibility
// Create getters for Firebase services that initialize lazily
export const app = {} as FirebaseApp;
export const auth = {} as Auth;
export const db = {} as Firestore;
export const functions = {} as Functions;
export const storage = {} as FirebaseStorage;

// Use a side effect to set up getters on the exported objects
Object.defineProperties(app, {
  __proto__: {
    get() {
      return Object.getPrototypeOf(getFirebaseServices().app || {});
    }
  }
});

Object.defineProperties(auth, {
  currentUser: {
    get() {
      return getFirebaseServices().auth?.currentUser || null;
    }
  },
  onAuthStateChanged: {
    get() {
      return getFirebaseServices().auth?.onAuthStateChanged.bind(getFirebaseServices().auth) || 
             (() => (() => {}));
    }
  },
  signOut: {
    get() {
      return getFirebaseServices().auth?.signOut.bind(getFirebaseServices().auth) || 
             (() => Promise.resolve());
    }
  }
});

// Export the getters for compatibility
export {
  getAuth,
  getFirestore,
  getFunctions,
  getStorage
}; 