/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React from 'react';
import { View, StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f9f6f2', '#efe8df']}
        style={styles.gradient}
      >
      <View style={styles.content}>
          <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/branding/logo_1024.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
            <Text style={styles.appName}>Mo-ment</Text>
            <Text style={styles.tagline}>Capture life's meaningful moments</Text>
            <Text style={styles.definition}>
              (n.) "a moment of reflection, gratitude, and mindfulness"
          </Text>
        </View>
        
          <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Login');
              }}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            >
              Login
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('SignUp');
              }}
              style={styles.signupButton}
            contentStyle={styles.buttonContent}
              labelStyle={styles.signupLabel}
          >
              Create Account
          </Button>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3d2f28',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'WorkSans_400Regular',
    color: '#6a4e42',
    textAlign: 'center',
    marginBottom: 16,
  },
  definition: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    color: '#8b7b70',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  loginButton: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#b58a65',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderColor: '#b58a65',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonContent: {
    height: 56,
    width: '100%',
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    letterSpacing: 0.5,
  },
  signupLabel: {
    color: '#b58a65',
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen; 