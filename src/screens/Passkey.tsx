import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useSpacing } from '../utils/useSpacing';

type PasskeyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Passkey'>;
};

const CORRECT_PASSWORD = 'muq3';

const PasskeyScreen: React.FC<PasskeyScreenProps> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const theme = useTheme();
  const { hPad } = useSpacing();

  const handlePasswordSubmit = () => {
    if (password === CORRECT_PASSWORD) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Dashboard');
    } else {
      setError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Incorrect Passkey',
        'The passkey you entered is incorrect. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: hPad }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Enter Passkey
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Please enter your passkey to access the app
        </Text>
        
        <TextInput
          style={styles.input}
          mode="outlined"
          label="Passkey"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError(false);
          }}
          secureTextEntry
          error={error}
          autoCapitalize="characters"
          onSubmitEditing={handlePasswordSubmit}
        />
        
        <Button 
          mode="contained" 
          onPress={handlePasswordSubmit}
          style={styles.button}
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.8,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 20,
  }
});

export default PasskeyScreen; 