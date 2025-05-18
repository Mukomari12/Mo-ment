/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  sendEmailVerification as fbSendVerification,
  signOut as fbSignOut,
  onAuthStateChanged as fbAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { auth, usingMockAuth } from '../lib/firebaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MockUser, MockAuth } from '../lib/mockAuthService';

// Created a mock AsyncStorage for auth persistence that is Expo Go compatible
const setupAuthPersistence = async () => {
  try {
    // Check if we have cached auth data
    const authData = await AsyncStorage.getItem('auth_data');
    if (authData) {
      console.log('Found cached auth data');
    }
  } catch (error) {
    console.error('Error loading cached auth data:', error);
  }
};

// Initialize auth persistence
setupAuthPersistence();

// Union type that works with both real Firebase User and our MockUser
type AppUser = User | MockUser;

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signUp: (email: string, password: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
  usingMockAuth: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    console.log('Using mock auth:', usingMockAuth ? 'Yes' : 'No');
    
    // Use the appropriate onAuthStateChanged based on which auth system we're using
    let unsubscribe: () => void;
    
    if (usingMockAuth) {
      // Using mock auth
      unsubscribe = (auth as MockAuth).onAuthStateChanged((currentUser) => {
        console.log('Auth state changed (mock):', currentUser ? 'signed in' : 'signed out');
        setUser(currentUser);
        setLoading(false);
      });
    } else {
      // Using Firebase auth
      unsubscribe = fbAuthStateChanged(auth as Auth, (currentUser) => {
        console.log('Auth state changed (Firebase):', currentUser ? 'signed in' : 'signed out');
        setUser(currentUser);
        setLoading(false);
      });
    }

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      let userCredential;
      
      if (usingMockAuth) {
        // Using mock auth
        userCredential = await (auth as MockAuth).signInWithEmailAndPassword(email, password);
      } else {
        // Using Firebase auth
        userCredential = await fbSignIn(auth as Auth, email, password);
      }
      
      // Cache the auth state in AsyncStorage for better persistence
      try {
        await AsyncStorage.setItem('auth_email', email);
      } catch (error) {
        console.error('Error caching auth data:', error);
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Creating new user:', email);
      
      let userCredential;
      
      if (usingMockAuth) {
        // Using mock auth
        userCredential = await (auth as MockAuth).createUserWithEmailAndPassword(email, password);
      } else {
        // Using Firebase auth
        userCredential = await fbCreateUser(auth as Auth, email, password);
      }
      
      console.log('Sending verification email...');
      
      if (usingMockAuth) {
        // Using mock auth
        await (auth as MockAuth).sendEmailVerification(userCredential.user);
      } else {
        // Using Firebase auth
        await fbSendVerification(userCredential.user as User);
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      if (usingMockAuth) {
        // Using mock auth
        await (auth as MockAuth).signOut();
      } else {
        // Using Firebase auth
        await fbSignOut(auth as Auth);
      }
      
      // Clear cached auth data
      try {
        await AsyncStorage.removeItem('auth_email');
      } catch (error) {
        console.error('Error clearing cached auth data:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, usingMockAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 