import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
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
import * as Haptics from 'expo-haptics';

// Create a navigation ref that can be used outside of the React component tree
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Navigation helper function for use outside of components
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(name, params);
  } else {
    console.error('Navigation is not ready');
  }
}

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Passkey: undefined;
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
  console.log("AppNavigator rendering");
  
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
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
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Passkey" 
        component={PasskeyScreen} 
        options={{ headerShown: false }}
      />
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

export default AppNavigator; 