import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import WelcomeScreen from '../screens/Welcome';
import OnboardingScreen from '../screens/Onboarding';
import DashboardScreen from '../screens/Dashboard';
import TextEntryScreen from '../screens/TextEntry';
import VoiceEntryScreen from '../screens/VoiceEntry';
import MediaEntryScreen from '../screens/MediaEntry';
import MoodGraphsScreen from '../screens/MoodGraphs';
import TimelineScreen from '../screens/Timeline';
import MoodCalendarScreen from '../screens/MoodCalendar';
import RemindersScreen from '../screens/Reminders';
import SettingsScreen from '../screens/Settings';
import JournalListScreen from '../screens/JournalList';
import EntryDetailScreen from '../screens/EntryDetail';
import MonthlyCheckupScreen from '../screens/MonthlyCheckup';

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

// Simple debug screen to test if navigation works
const DebugScreen = () => {
  console.log("Debug screen rendering");
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, color: 'red' }}>Debug Screen Visible</Text>
      <Text style={{ fontSize: 18, marginTop: 20 }}>If you can see this, navigation is working</Text>
    </View>
  );
};

export type RootStackParamList = {
  Debug: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Dashboard: undefined;
  TextEntry: undefined;
  VoiceEntry: undefined;
  MediaEntry: undefined;
  MoodGraphs: undefined;
  Timeline: undefined;
  MoodCalendar: undefined;
  Reminders: undefined;
  Settings: undefined;
  JournalList: undefined;
  EntryDetail: { id: string };
  MonthlyCheckup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  console.log("AppNavigator rendering");
  
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        animationTypeForReplace: 'push',
        contentStyle: { backgroundColor: '#F9F6F2' },
      }}
    >
      <Stack.Screen 
        name="Debug" 
        component={DebugScreen} 
        options={{
          headerShown: true,
          title: 'Debug Navigation',
        }}
      />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="TextEntry" component={TextEntryScreen} />
      <Stack.Screen name="VoiceEntry" component={VoiceEntryScreen} />
      <Stack.Screen name="MediaEntry" component={MediaEntryScreen} />
      <Stack.Screen name="MoodGraphs" component={MoodGraphsScreen} />
      <Stack.Screen name="Timeline" component={TimelineScreen} />
      <Stack.Screen name="MoodCalendar" component={MoodCalendarScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="JournalList" component={JournalListScreen} />
      <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
      <Stack.Screen name="MonthlyCheckup" component={MonthlyCheckupScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 