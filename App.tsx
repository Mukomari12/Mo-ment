/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, Portal } from 'react-native-paper';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import { theme } from './src/theme/mo-mentTheme';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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
import { AuthProvider } from './src/contexts/AuthContext';

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
        <PaperProvider theme={theme}>
          <AuthProvider>
          <BottomSheetModalProvider>
            <NavigationContainer 
              ref={navigationRef} 
              theme={navigationTheme} 
              onStateChange={(state) => {
                console.log('Navigation state changed:', JSON.stringify(state));
                // Debug info to help diagnose navigation
                if (state && state.routes) {
                  const currentRoute = state.routes[state.index];
                  console.log(`Current route: ${currentRoute.name} (index: ${state.index})`);
                  console.log(`Current route params:`, currentRoute.params || 'none');
                  console.log(`Available routes:`, state.routes.map(r => r.name).join(', '));
                }
              }}
              onReady={() => {
                console.log('Navigation container is ready');
              }}
              fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading navigation...</Text>
              </View>}
            >
              <StatusBar style="dark" backgroundColor={theme.colors.background} />
              <AppNavigator />
            </NavigationContainer>
          </BottomSheetModalProvider>
          </AuthProvider>
        </PaperProvider>
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
