import { MD3LightTheme as Base } from 'react-native-paper';

export const theme = {
  ...Base,
  roundness: 12,
  colors: {
    ...Base.colors,
    primary: '#b98e66',      // camel 500
    secondary: '#e9dbc7',    // camel 200
    background: '#fdfbf9',   // camel 50
    surfaceVariant: '#f5eee5',
    onPrimary: 'white',
    onBackground: '#3c2c1d', // camel 900
  },
  fonts: {
    titleLarge:  { fontFamily: 'PTSerif-Bold',    fontSize: 24 },
    titleMedium: { fontFamily: 'PTSerif-Bold',    fontSize: 20 },
    bodyLarge:   { fontFamily: 'PTSerif-Regular', fontSize: 18 },
    bodyMedium:  { fontFamily: 'PTSerif-Regular', fontSize: 16 },
    labelSmall:  { fontFamily: 'PTSerif-Regular', fontSize: 12 },
  },
} as const; 