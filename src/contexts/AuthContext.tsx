/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/AppNavigator';
import { auth } from '../lib/firebase';
import type { User, Auth } from 'firebase/auth';

// Constants for AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

type AuthCtx = {
  user: User | null;
  isVerified: boolean;
  isOnline: boolean;
  refreshUserStatus: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx>({ 
  user: null, 
  isVerified: false,
  isOnline: true,
  refreshUserStatus: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      console.log('Network connectivity changed:', state.isConnected);
      setIsOnline(!!state.isConnected);
      
      // Force refresh user status when coming back online
      if (state.isConnected && auth.currentUser) {
        refreshUserStatus();
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Function to manually refresh the user's verification status
  const refreshUserStatus = useCallback(async () => {
    console.log('Refreshing user status...');
    
    // Only throttle in production, not in development
    if (!__DEV__) {
      // Avoid excessive refreshes (throttle to once every 2 seconds)
      const now = new Date();
      if (now.getTime() - lastRefresh.getTime() < 2000) {
        console.log('Refresh throttled, too soon since last refresh');
        return;
      }
    }
    
    setLastRefresh(new Date());
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('Current user found, reloading from server...');
        await currentUser.reload();
        
        // Re-fetch after reload to get the latest data
        const refreshedUser = auth.currentUser;
        console.log('User reloaded, email verified:', refreshedUser?.emailVerified);
        
        if (refreshedUser && refreshedUser.emailVerified) {
          setUser(refreshedUser);
          setIsVerified(true);
          await SecureStore.setItemAsync('uid', refreshedUser.uid);
          console.log('Email verified, user is now verified in AuthContext');
          
          // Check if onboarding is complete, and navigate appropriately
          const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
          console.log('On verification, onboarding complete?', onboardingCompleted === 'true');
          
          // If we're coming from verification and onboarding is not complete, we'll show onboarding
          // navigate() function will only work if the navigation container is ready
        } else if (refreshedUser && !refreshedUser.emailVerified) {
          setUser(refreshedUser);
          setIsVerified(false);
          await SecureStore.deleteItemAsync('uid');
          console.log('Email not verified, keeping user as unverified in AuthContext');
        }
      } else {
        console.log('No current user to refresh');
      }
    } catch (error) {
      console.error('Failed to refresh user status:', error);
      // Don't change state on error - just log it
    }
  }, [lastRefresh]);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    let checkInterval: NodeJS.Timeout | null = null;
    
    const authStateListener = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed, user:', user?.email, 'verified:', user?.emailVerified);
      
      if (user && user.emailVerified) {
        // User is logged in and verified
        console.log('User is verified, setting up AuthContext');
        setUser(user);
        setIsVerified(true);
        await SecureStore.setItemAsync('uid', user.uid);
        
        // Clear any existing interval
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
          console.log('Cleared verification check interval');
        }
      } else if (user && !user.emailVerified) {
        // User exists but email is not verified
        console.log('User not verified, setting up verification checks');
        setUser(user);
        setIsVerified(false);
        // Let's not store the uid in secure storage since they're not verified
        await SecureStore.deleteItemAsync('uid');
        
        // Set up periodic verification checks more frequently
        // Clear any existing interval first
        if (checkInterval) {
          clearInterval(checkInterval);
          console.log('Cleared previous verification check interval');
        }
        
        console.log('Setting up new verification check interval');
        checkInterval = setInterval(async () => {
          if (isOnline) {
            console.log('Running periodic verification check...');
            await refreshUserStatus();
          } else {
            console.log('Skipping verification check while offline');
          }
        }, 5000); // Check every 5 seconds (more frequent)
        
        console.log('Verification check interval set up');
      } else {
        // No user
        console.log('No user logged in');
        setUser(null);
        setIsVerified(false);
        await SecureStore.deleteItemAsync('uid');
        
        // Clear any existing interval
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
          console.log('Cleared verification check interval (no user)');
        }
      }
    });
    
    // Also set up an initial check and a recurring check even when auth state doesn't change
    const recurringCheck = setInterval(() => {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified && isOnline) {
        console.log('Running additional verification check...');
        refreshUserStatus();
      }
    }, 10000); // Every 10 seconds
    
    return () => {
      console.log('Cleaning up auth state listener');
      authStateListener();
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      clearInterval(recurringCheck);
    };
  }, [refreshUserStatus, isOnline]);

  return (
    <AuthContext.Provider value={{ user, isVerified, isOnline, refreshUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
}; 