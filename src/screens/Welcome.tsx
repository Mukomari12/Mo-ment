import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Image, SafeAreaView } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import { RFValue } from 'react-native-responsive-fontsize';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Image 
            source={require('../../assets/branding/logo_1024.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text variant="titleLarge" style={styles.title}>Mowment</Text>
          <Text variant="bodyMedium" style={[styles.tagline, { color: theme.colors.onBackground }]}>
            Capture life, one moment at a time
          </Text>
        </Animated.View>
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Onboarding')}
          style={[styles.button, { marginHorizontal: hPad }]}
          contentStyle={styles.buttonContent}
          buttonColor={theme.colors.primary}
        >
          Get Started
        </Button>
      </SafeAreaView>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 50,
    paddingTop: 100,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: RFValue(28),
  },
  tagline: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: RFValue(16),
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    height: 56,
  },
});

export default WelcomeScreen; 