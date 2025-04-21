import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import { theme } from './src/theme/vintageTheme';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { View, ActivityIndicator, Text } from 'react-native';

export default function App() {
  console.log("App component started");

  const [playfairLoaded] = usePlayfairDisplay({
    'PlayfairDisplay_400Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay_700Bold': PlayfairDisplay_700Bold,
  });

  const [workSansLoaded] = useWorkSans({
    'WorkSans_400Regular': WorkSans_400Regular,
    'WorkSans_500Medium': WorkSans_500Medium,
    'WorkSans_600SemiBold': WorkSans_600SemiBold,
  });

  useEffect(() => {
    console.log("Font loading status:", {playfairLoaded, workSansLoaded});
  }, [playfairLoaded, workSansLoaded]);

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
    console.log("Fonts not loaded, showing loading screen");
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.onBackground }}>Loading fonts...</Text>
      </View>
    );
  }

  console.log("Rendering main app with navigation");
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer 
          ref={navigationRef} 
          theme={navigationTheme} 
          onStateChange={(state) => {
            console.log('Navigation state changed:', JSON.stringify(state));
          }}
        >
          <PaperProvider theme={theme}>
            <StatusBar style="dark" backgroundColor={theme.colors.background} />
            <AppNavigator />
          </PaperProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    );
  } catch (error: any) {
    console.error("Error rendering app:", error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          Error loading app: {error.message}
        </Text>
      </View>
    );
  }
}
