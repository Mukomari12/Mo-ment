import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/mowmentTheme';
import { StatusBar } from 'expo-status-bar';
import { useFonts as usePTSerif, PTSerif_400Regular, PTSerif_700Bold } from '@expo-google-fonts/pt-serif';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [fontsLoaded] = usePTSerif({
    'PTSerif-Regular': PTSerif_400Regular,
    'PTSerif-Bold': PTSerif_700Bold,
  });

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
