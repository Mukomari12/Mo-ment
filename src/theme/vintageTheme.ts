import { MD3LightTheme } from 'react-native-paper';

console.log("Loading vintage theme");

// Define our custom theme based on Paper's MD3 theme
export const theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#b58a65',
    primaryContainer: '#e4ceb7',
    secondary: '#6a4e42', 
    secondaryContainer: '#f0e6e0',
    tertiary: '#857961',
    tertiaryContainer: '#e8e0d0',
    background: '#F9F6F2',
    surface: '#ffffff',
    surfaceVariant: '#EFEBE6',
    error: '#ba1a1a',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#3c271d',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#2c1513',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#31271a',
    onBackground: '#3d2f28',
    onSurface: '#3d2f28',
    onSurfaceVariant: '#715b4e',
    outline: '#8a7467',
    elevation: {
      level0: 'transparent',
      level1: '#f9f1ea',
      level2: '#f5eae0',
      level3: '#f0e4d7',
      level4: '#eee1d3',
      level5: '#ecded1',
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'PlayfairDisplay_700Bold',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'WorkSans_500Medium',
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'WorkSans_500Medium',
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'WorkSans_400Regular',
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'WorkSans_400Regular',
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: 'WorkSans_400Regular',
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'WorkSans_500Medium',
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: 'WorkSans_500Medium',
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: 'WorkSans_500Medium',
    },
  },
};

console.log("Vintage theme loaded successfully"); 