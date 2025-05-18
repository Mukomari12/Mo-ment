/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Linking, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, safeFirebaseOperation } from '../../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    console.log('Login process started');
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simplified approach - focus on the core authentication logic
      console.log('Attempting to sign in with email and password');
      
      // Use a safe wrapped operation for sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful, checking email verification status');
      
      // Always reload the user to get the latest verification status
      await userCredential.user.reload();
      const freshUser = auth.currentUser;
      
      // Standard verification check
      if (!freshUser?.emailVerified) {
        console.log('Email not verified, navigating to verification screen');
        
        // Sign out the user until they verify their email
        await auth.signOut();
        console.log('User signed out');
        
        // Complete loading before navigation
        setLoading(false);
        
        // Use immediate navigation reset to ensure it happens right away
        console.log('Navigating to VerifyEmail screen');
        navigation.reset({
          index: 0,
          routes: [{ name: 'VerifyEmail', params: { email } }],
        });
        
        return;
      } else {
        console.log('Email is verified, checking onboarding status');
        
        // Check if onboarding is completed
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const isOnboardingComplete = onboardingCompleted === 'true';
        console.log('Login flow - Onboarding completed?', isOnboardingComplete);
        
        // Navigate to appropriate screen
        if (isOnboardingComplete) {
          console.log('Onboarding already completed, navigating to Dashboard');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        } else {
          console.log('Onboarding not completed, navigating to Onboarding');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = error.message;
      
      // Handle specific Firebase auth errors with user-friendly messages
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid. Please enter a valid email.';
      }
      
      // Show helpful error message to user
      Alert.alert('Login Failed', errorMessage);
    } finally {
      console.log('Login process completed');
      // Only set loading to false if we're still on this screen
      if (loading) {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#f9f6f2', '#efe8df']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#3d2f28" />
          </TouchableOpacity>
          
          <Image 
            source={require('../../../assets/branding/logo_1024.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={24} color="#b58a65" style={styles.inputIcon} />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                outlineColor="#d0c3b6"
                activeOutlineColor="#b58a65"
                outlineStyle={styles.inputOutline}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#b58a65" style={styles.inputIcon} />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="outlined"
                outlineColor="#d0c3b6"
                activeOutlineColor="#b58a65"
                outlineStyle={styles.inputOutline}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                    color="#b58a65"
                  />
                }
              />
            </View>
          
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => {
                // In a real app, implement password reset functionality
                Alert.alert('Password Reset', 'This feature is coming soon');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading}
            >
              Log In
            </Button>
          </View>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.signupButton}
            >
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3d2f28',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 40,
  },
  inputOutline: {
    borderRadius: 10,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#b58a65',
    fontFamily: 'WorkSans_500Medium',
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
    paddingVertical: 6,
    backgroundColor: '#b58a65',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  signupText: {
    fontFamily: 'WorkSans_400Regular',
    color: '#6a4e42',
  },
  signupButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signupButtonText: {
    color: '#b58a65',
    fontFamily: 'WorkSans_600SemiBold',
    fontSize: 15,
  },
});

export default LoginScreen; 