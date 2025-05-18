/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/Welcome';
import OnboardingScreen from '../screens/Onboarding';
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
  Welcome: undefined;
  
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

const AppNavigator = () => {
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
  
  // Use a single navigator with all screens, but change the initial route based on onboarding status
  const initialRoute = isOnboardingComplete ? "Dashboard" : "Onboarding";
  console.log(`Using initial route: ${initialRoute}`);
  
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
      }}
      screenListeners={{
        state: (e) => {
          const currentRouteName = e.data?.state?.routes[e.data.state.index]?.name;
          const currentRouteParams = e.data?.state?.routes[e.data.state.index]?.params;
          console.log(`Current route: ${currentRouteName} (index: ${e.data?.state?.index})`);
          console.log(`Current route params: ${currentRouteParams ? JSON.stringify(currentRouteParams) : 'none'}`);
          console.log(`Available routes: ${e.data?.state?.routeNames.join(', ')}`);
        }
      }}
    >
      {/* Onboarding */}
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      
      {/* Main screens */}
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
        options={{ title: "Entry Details" }}
      />
      <Stack.Screen 
        name="MonthlyCheckup" 
        component={MonthlyCheckupScreen} 
        options={{ title: "Monthly Checkup" }}
      />
      <Stack.Screen 
        name="ChatBot" 
        component={ChatBotScreen} 
        options={{ title: "AI Journal Assistant" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 