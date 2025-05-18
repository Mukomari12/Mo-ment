/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/Welcome';
import OnboardingScreen from '../screens/Onboarding';
import PasskeyScreen from '../screens/Passkey';
import DashboardScreen from '../screens/Dashboard';
import TextEntryScreen from '../screens/TextEntry';
import VoiceEntryScreen from '../screens/VoiceEntry';
import MediaEntryScreen from '../screens/MediaEntry';
import MoodGraphsScreen from '../screens/MoodGraphs';
import LifeErasScreen from '../screens/LifeEras';
import MoodCalendarScreen from '../screens/MoodCalendar';
import RemindersScreen from '../screens/Reminders';
import SettingsScreen from '../screens/Settings';
import JournalListScreen from '../screens/JournalList';
import EntryDetailScreen from '../screens/EntryDetail';
import MonthlyCheckupScreen from '../screens/MonthlyCheckup';
import ChatBotScreen from '../screens/ChatBot';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import VerifyEmailScreen from '../screens/Auth/VerifyEmailScreen';
import { AuthContext } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

// Constants for AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

// Create a navigation ref that can be used outside of the React component tree
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Function to navigate from outside of React components
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Log error if navigation is attempted before container is ready
    console.error(`Unable to navigate to ${name}, navigation ref not ready`);
  }
}

export type RootStackParamList = {
  // Onboarding Stack
  Onboarding: undefined;
  
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  VerifyEmail: { email: string };
  Passkey: undefined;

  // Main App Stack
  Dashboard: undefined;
  TextEntry: undefined;
  VoiceEntry: undefined;
  MediaEntry: undefined;
  MoodGraphs: undefined;
  LifeEras: undefined;
  MoodCalendar: undefined;
  Reminders: undefined;
  Settings: undefined;
  JournalList: undefined;
  EntryDetail: { id: string };
  MonthlyCheckup: undefined;
  ChatBot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth stack for unauthenticated users
const AuthStack = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  
  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setIsOnboardingComplete(onboardingCompleted === 'true');
        console.log('Onboarding complete?', onboardingCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  // Show loading state while checking onboarding status
  if (isOnboardingComplete === null) {
    return null; // Or a loading spinner
  }
  
  return (
    <Stack.Navigator
      initialRouteName={isOnboardingComplete ? "Welcome" : "Onboarding"}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9F6F2' },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="Passkey" component={PasskeyScreen} />
    </Stack.Navigator>
  );
};

// Main app navigation stack
const MainAppStack = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  
  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const needsOnboarding = onboardingCompleted !== 'true';
        setIsOnboardingComplete(!needsOnboarding);
        console.log('MainAppStack - Onboarding complete?', !needsOnboarding);
        console.log('MainAppStack - Onboarding value in storage:', onboardingCompleted);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      }
    };
    
    checkOnboardingStatus();
  }, []);
  
  // Show loading state while checking onboarding status
  if (isOnboardingComplete === null) {
    return null; // Or a loading spinner
  }
  
  // If onboarding is not complete, show the onboarding screen first
  if (!isOnboardingComplete) {
    console.log('MainAppStack showing Onboarding screen as first route');
    return (
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9F6F2' },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    );
  }
  
  // Otherwise show the normal app stack
  console.log('MainAppStack showing main app routes with Dashboard as initial route');
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true,
        gestureEnabled: true,
        animation: 'slide_from_right',
        animationTypeForReplace: 'push',
        contentStyle: { backgroundColor: '#F9F6F2' },
        headerTransparent: false,
        headerStyle: { 
          backgroundColor: '#F9F6F2' 
        },
        headerTitleStyle: { 
          fontFamily: 'PlayfairDisplay_700Bold',
          color: '#333333'
        },
        headerTintColor: '#b58a65',
        headerBackVisible: true,
        headerShadowVisible: false,
        headerBackButtonMenuEnabled: true,
        headerLeft: ({ canGoBack }) => 
          canGoBack 
            ? undefined  // Use default back button
            : null,      // No back button for screens that can't go back
      }}
      screenListeners={{
        state: (e) => {
          const currentRouteName = e.data?.state?.routes[e.data.state.index]?.name;
          console.log(`Current screen: ${currentRouteName}`);
          console.log('Navigation state change event:', JSON.stringify(e.data?.state));
        },
        focus: (e) => {
          console.log(`Screen focused: ${e.target}`);
        },
        beforeRemove: (e) => {
          console.log(`Screen about to be removed: ${e.target}`);
        },
        blur: (e) => {
          console.log(`Screen blurred: ${e.target}`);
        },
        transitionStart: (e) => {
          console.log(`Screen transition started to: ${e.target}`);
        },
        transitionEnd: (e) => {
          console.log(`Screen transition completed to: ${e.target}`);
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TextEntry" 
        component={TextEntryScreen} 
        options={{ 
          title: "Text Entry",
          headerBackTitle: "Cancel"
        }}
      />
      <Stack.Screen 
        name="VoiceEntry" 
        component={VoiceEntryScreen} 
        options={{ 
          title: "Voice Entry",
          headerBackTitle: "Cancel"
        }}
      />
      <Stack.Screen 
        name="MediaEntry" 
        component={MediaEntryScreen} 
        options={{ 
          title: "Media Entry",
          headerBackTitle: "Cancel"
        }}
      />
      <Stack.Screen 
        name="MoodGraphs" 
        component={MoodGraphsScreen} 
        options={{ title: "Mood Insights" }}
      />
      <Stack.Screen 
        name="LifeEras" 
        component={LifeErasScreen} 
        options={{ title: "Life Eras" }}
      />
      <Stack.Screen 
        name="MoodCalendar" 
        component={MoodCalendarScreen} 
        options={{ title: "Mood Calendar" }}
      />
      <Stack.Screen 
        name="Reminders" 
        component={RemindersScreen} 
        options={{ title: "Reminders" }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: "Settings" }}
      />
      <Stack.Screen 
        name="JournalList" 
        component={JournalListScreen} 
        options={{ title: "Journal Entries" }}
      />
      <Stack.Screen 
        name="EntryDetail" 
        component={EntryDetailScreen} 
        options={{ title: "Entry Detail" }}
      />
      <Stack.Screen 
        name="MonthlyCheckup" 
        component={MonthlyCheckupScreen} 
        options={{ title: "Monthly Review" }}
      />
      <Stack.Screen 
        name="ChatBot" 
        component={ChatBotScreen} 
        options={{ title: "Mo-ment Companion" }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  const { user, isVerified } = useContext(AuthContext);
  
  console.log('Current auth state:', user ? 'User is logged in' : 'No user logged in');
  console.log('Email verified:', isVerified ? 'Yes' : 'No');
  
  return user && isVerified ? <MainAppStack /> : <AuthStack />;
};

export default AppNavigator; 