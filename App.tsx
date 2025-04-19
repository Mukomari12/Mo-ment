import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/vintageTheme';
import { StatusBar } from 'expo-status-bar';
import { 
  useFonts as usePlayfairDisplay, 
  PlayfairDisplay_400Regular, 
  PlayfairDisplay_700Bold 
} from '@expo-google-fonts/playfair-display';
import { 
  useFonts as useWorkSans, 
  WorkSans_400Regular, 
  WorkSans_500Medium,
  WorkSans_600SemiBold
} from '@expo-google-fonts/work-sans';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [playfairLoaded] = usePlayfairDisplay({
    'PlayfairDisplay_400Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay_700Bold': PlayfairDisplay_700Bold,
  });

  const [workSansLoaded] = useWorkSans({
    'WorkSans_400Regular': WorkSans_400Regular,
    'WorkSans_500Medium': WorkSans_500Medium,
    'WorkSans_600SemiBold': WorkSans_600SemiBold,
  });

  const fontsLoaded = playfairLoaded && workSansLoaded;

  // Customize the navigation theme to match our paper theme
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.onBackground,
    },
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
