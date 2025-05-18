/**
 * Mock Auth Service for Expo Go
 * This provides a fallback implementation when Firebase Auth doesn't work in Expo Go
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

// Storage keys
const MOCK_AUTH_USER_KEY = 'mock_auth_user';
const MOCK_AUTH_EMAIL_VERIFIED = 'mock_auth_email_verified';

// Event emitter for auth state changes
const authEmitter = new EventEmitter();

// Mock User type
export type MockUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  reload: () => Promise<void>;
};

// Mock Auth type
export type MockAuth = {
  currentUser: MockUser | null;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<{ user: MockUser }>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<{ user: MockUser }>;
  signOut: () => Promise<void>;
  sendEmailVerification: (user: MockUser) => Promise<void>;
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => () => void;
};

let currentUser: MockUser | null = null;

// Load the user from AsyncStorage
const loadUser = async (): Promise<MockUser | null> => {
  try {
    const userData = await AsyncStorage.getItem(MOCK_AUTH_USER_KEY);
    if (userData) {
      const user = JSON.parse(userData) as MockUser;
      // Add the reload method
      user.reload = async () => {
        const emailVerified = await AsyncStorage.getItem(MOCK_AUTH_EMAIL_VERIFIED + '_' + user.uid);
        user.emailVerified = emailVerified === 'true';
        await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user));
        currentUser = user;
        authEmitter.emit('authStateChanged', user);
      };
      currentUser = user;
      return user;
    }
  } catch (error) {
    console.error('Error loading mock user:', error);
  }
  return null;
};

// Initialize - load the user on startup
loadUser().then(user => {
  if (user) {
    console.log('Mock auth: Loaded user from storage:', user.email);
    authEmitter.emit('authStateChanged', user);
  } else {
    console.log('Mock auth: No user found in storage');
    authEmitter.emit('authStateChanged', null);
  }
});

// Create a mock auth implementation
export const mockAuth: MockAuth = {
  get currentUser() {
    return currentUser;
  },

  // Sign in with email and password
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // In a real implementation, we would validate credentials
    // For this mock, we'll just check if the user exists
    const mockUserData = await AsyncStorage.getItem(MOCK_AUTH_USER_KEY);
    if (mockUserData) {
      const mockUser = JSON.parse(mockUserData) as MockUser;
      if (mockUser.email === email) {
        // Add the reload method
        mockUser.reload = async () => {
          const emailVerified = await AsyncStorage.getItem(MOCK_AUTH_EMAIL_VERIFIED + '_' + mockUser.uid);
          mockUser.emailVerified = emailVerified === 'true';
          await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(mockUser));
          currentUser = mockUser;
          authEmitter.emit('authStateChanged', mockUser);
        };
        currentUser = mockUser;
        authEmitter.emit('authStateChanged', mockUser);
        return { user: mockUser };
      }
    }
    
    // If we don't find the user, throw an error
    throw new Error('auth/user-not-found');
  },

  // Create a new user
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Create a new mock user
    const newUser: MockUser = {
      uid: 'mock_' + Date.now().toString(),
      email,
      emailVerified: false,
      displayName: null,
      photoURL: null,
      reload: async () => {
        const emailVerified = await AsyncStorage.getItem(MOCK_AUTH_EMAIL_VERIFIED + '_' + newUser.uid);
        newUser.emailVerified = emailVerified === 'true';
        await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(newUser));
        currentUser = newUser;
        authEmitter.emit('authStateChanged', newUser);
      },
    };
    
    // Save the user to AsyncStorage
    await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(newUser));
    currentUser = newUser;
    authEmitter.emit('authStateChanged', newUser);
    
    return { user: newUser };
  },

  // Sign out
  signOut: async () => {
    currentUser = null;
    authEmitter.emit('authStateChanged', null);
    await AsyncStorage.removeItem(MOCK_AUTH_USER_KEY);
  },

  // Send verification email
  sendEmailVerification: async (user: MockUser) => {
    // In a real app, this would send an actual email
    // For our mock, we'll just mark the user as verified immediately
    await AsyncStorage.setItem(MOCK_AUTH_EMAIL_VERIFIED + '_' + user.uid, 'true');
    console.log('Mock auth: Email verification marked as sent for', user.email);
  },

  // Auth state change listener
  onAuthStateChanged: (callback: (user: MockUser | null) => void) => {
    const listener = (user: MockUser | null) => {
      callback(user);
    };
    
    authEmitter.on('authStateChanged', listener);
    
    // Call the callback immediately with the current user
    if (currentUser) {
      callback(currentUser);
    } else {
      loadUser().then(user => {
        callback(user);
      });
    }
    
    // Return a function to unsubscribe
    return () => {
      authEmitter.off('authStateChanged', listener);
    };
  },
};

export default mockAuth; 