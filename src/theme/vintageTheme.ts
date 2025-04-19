import { MD3LightTheme as Base } from 'react-native-paper';

export const theme = {
  ...Base,
  roundness: 18,
  colors: {
    ...Base.colors,
    primary: '#b58a65',
    secondary: '#6a4e42',
    background: '#f7f3ef',
    surface: '#fbfaf8',
    surfaceVariant: '#ece6df',
    onPrimary: 'white',
    onBackground: '#3c2c1d',
  },
  fonts: {
    headlineLarge: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32 },
    headlineMedium: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28 },
    headlineSmall: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24 },
    titleLarge: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26 },
    titleMedium: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
    bodyLarge: { fontFamily: 'WorkSans_400Regular', fontSize: 18 },
    bodyMedium: { fontFamily: 'WorkSans_400Regular', fontSize: 16 },
    bodySmall: { fontFamily: 'WorkSans_400Regular', fontSize: 14 },
    labelLarge: { fontFamily: 'WorkSans_400Regular', fontSize: 14 },
    labelMedium: { fontFamily: 'WorkSans_400Regular', fontSize: 13 },
    labelSmall: { fontFamily: 'WorkSans_400Regular', fontSize: 12 },
  },
} as const; 