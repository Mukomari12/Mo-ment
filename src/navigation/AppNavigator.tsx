import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

export type RootStackParamList = {
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
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
    </Stack.Navigator>
  );
};

export default AppNavigator; 