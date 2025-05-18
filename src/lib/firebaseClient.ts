// Expo-Go-friendly Firebase bootstrap ----------------------------------
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import mockAuth, { MockAuth } from './mockAuthService';

// Firebase configuration
// TODO: Move these to .env variables in production
export const firebaseConfig = {
  apiKey: "AIzaSyANbE9eeJuC4DUvJe4lNC8pFn-LLieejTo",
  authDomain: "mo-ment-prod.firebaseapp.com",
  projectId: "mo-ment-prod",
  storageBucket: "mo-ment-prod.firebasestorage.app",
  messagingSenderId: "188833780043",
  appId: "1:188833780043:ios:a2682386378695131f58ce",
};

// Initialize Firebase app with singleton pattern
console.log('Setting up Firebase...');
let app;
try {
  if (!getApps().length) {
    console.log('Initializing new Firebase app');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Firebase app already initialized, reusing');
    app = getApp();
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

// Initialize Firebase Auth - with fallback to mock implementation
console.log('Initializing Firebase Auth with fallback support');
let auth: Auth | MockAuth;
let usingMockAuth = false;

try {
  // Try to use standard web auth
  auth = getAuth();
  // Test if auth is working by accessing a property
  auth.currentUser; // This will throw if auth component isn't registered
  console.log('Firebase Auth initialized successfully');
} catch (error) {
  console.warn('Firebase Auth failed to initialize, using mock implementation:', error);
  // Fall back to mock auth implementation
  auth = mockAuth;
  usingMockAuth = true;
  console.log('Mock Auth initialized as fallback');
}

// Initialize Firestore
console.log('Initializing Firebase Firestore');
export const db: Firestore = getFirestore(app);
export { auth, usingMockAuth };

// Log success
console.log('Firebase initialization complete'); 