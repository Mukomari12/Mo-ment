/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Image, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, safeFirebaseOperation } from '../../lib/firebase';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AuthContext } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for AsyncStorage keys
const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

type VerifyEmailScreenProps = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { user, isVerified, refreshUserStatus, isOnline } = useContext(AuthContext);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isForceUpdating, setIsForceUpdating] = useState(false);

  useEffect(() => {
    console.log('VerifyEmailScreen mounted, current user:', auth.currentUser?.email);
    return () => {
      console.log('VerifyEmailScreen unmounted');
    };
  }, []);

  useEffect(() => {
    // Set up a timer to check verification status
    console.log('Setting up verification check interval');
    const checkInterval = setInterval(() => {
      console.log('Checking verification status...');
      refreshUserStatus();
    }, 5000); // Check every 5 seconds
    
    return () => {
      console.log('Clearing verification check interval');
      clearInterval(checkInterval);
    };
  }, [refreshUserStatus]);

  useEffect(() => {
    // Redirect to main app if verified - with onboarding check
    if (isVerified) {
      checkOnboardingAndNavigate();
    }
  }, [isVerified, navigation]);

  // Function to check onboarding status and navigate
  const checkOnboardingAndNavigate = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      const isOnboardingComplete = onboardingCompleted === 'true';
      console.log('Email verified - Onboarding completed?', isOnboardingComplete);
      
      if (isOnboardingComplete) {
        // If onboarding is complete, go straight to Dashboard
        console.log('Onboarding already completed, going to Dashboard');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } else {
        // If onboarding is not complete, go to Onboarding first
        console.log('Onboarding not completed, going to Onboarding screen');
        
        // Force set onboarding to false to ensure the user completes it
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // In case of error, default to onboarding
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  };

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // More aggressive verification check with force update option
  const forceRefreshStatus = async () => {
    setIsForceUpdating(true);
    console.log('Forcing verification status refresh...');
    
    try {
      // First, let's try with the current user
      if (auth.currentUser) {
        console.log('Current user exists, reloading user data...');
        
        // Force reload the user data from server
        await auth.currentUser.reload();
        
        // Get the fresh user data
        const freshUser = auth.currentUser;
        console.log('User reloaded, verification status:', freshUser.emailVerified);
        
        if (freshUser && freshUser.emailVerified) {
          // Email is verified! Update UI and navigate
          console.log('Email is verified! Navigating based on onboarding status...');
          
          // Provide feedback to user
          Alert.alert('Success', 'Your email has been verified! Taking you to the app...');
          
          // Navigate after a short delay to allow the alert to be seen
          setTimeout(async () => {
            await checkOnboardingAndNavigate();
          }, 1500);
          
          return;
        }
      }
      
      // If we get here, either there's no current user or the email is not verified
      // Let's try logging in again to check verification status if we have password
      if (password) {
        console.log('Trying to login to check verification status...');
        
        try {
          // Sign in to get a fresh user object
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('Sign in successful, checking verification status');
          
          if (userCredential.user.emailVerified) {
            // Success! Email is verified
            console.log('Email is verified after login! Navigating based on onboarding status...');
            Alert.alert('Success', 'Your email has been verified! Taking you to the app...');
            
            // Navigate after a short delay
            setTimeout(async () => {
              await checkOnboardingAndNavigate();
            }, 1500);
            return;
          } else {
            // Still not verified after login
            console.log('Email still not verified after login');
            Alert.alert('Not Verified', 'Your email is still not verified. Please check your inbox and click the verification link. If you already clicked it, try signing out and signing in again.');
          }
        } catch (loginError) {
          console.error('Login error during verification check:', loginError);
        }
      } else {
        // No password, need to prompt user
        console.log('No password available, prompting user');
        setShowPasswordInput(true);
        Alert.alert(
          'Enter Password',
          'Please enter your password to check your verification status',
        );
      }
    } catch (error) {
      console.error('Force refresh error:', error);
      Alert.alert('Verification Check Failed', 'There was a problem checking your verification status. Please try logging in again.');
    } finally {
      setIsForceUpdating(false);
    }
  };

  // Enhanced resend verification handler with better error handling
  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Attempting to resend verification email...');
      
      // Simplified network check - try the operation and handle errors
      console.log('Current user check:', auth.currentUser?.email);
      
      if (auth.currentUser) {
        console.log('User is logged in, sending verification email');
        
        // Use safe operation wrapper for the email verification
        const result = await safeFirebaseOperation(async () => {
          return await sendEmailVerification(auth.currentUser!);
        });
        
        if (result !== null) {
          console.log('Verification email sent successfully');
          setLastSent(new Date());
          setCanResend(false);
          setCountdown(60); // 60 second cooldown
          Alert.alert(
            "Email Sent",
            "A verification email has been sent to your email address."
          );
        } else {
          console.log('Failed to send verification email, prompting for password');
          setShowPasswordInput(true);
        }
      } else {
        console.log('User is not logged in, prompting for password');
        setShowPasswordInput(true);
      }
    } catch (error: any) {
      console.error('Verification resend error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Prompt for password on any error
      setShowPasswordInput(true);
    } finally {
      setIsResending(false);
    }
  };
  
  const handleLoginAndResend = async () => {
    if (!password) {
      Alert.alert('Please enter your password');
      return;
    }
    
    setIsResending(true);
    try {
      console.log('Attempting to login to resend verification email');
      // Sign in to get access to the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful, sending verification email');
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      console.log('Verification email sent after login');
      
      setLastSent(new Date());
      setCanResend(false);
      setCountdown(60); // 60 second cooldown
      setShowPasswordInput(false);
      
      Alert.alert(
        "Email Sent",
        "A verification email has been sent to your email address."
      );
    } catch (error: any) {
      console.error('Login and resend error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = "Failed to authenticate. Please check your password.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      Alert.alert("Authentication Failed", errorMessage);
    } finally {
      setIsResending(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };
  
  return (
    <LinearGradient
      colors={['#f9f6f2', '#efe8df']}
      style={styles.container}
    >
      {!isOnline && (
        <View style={styles.offlineBar}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#fff" />
          <Text style={styles.offlineText}>You're offline. Some features may be unavailable.</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToLogin}
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
        <MaterialCommunityIcons 
          name={isOnline ? "email-check-outline" : "email-off-outline"} 
          size={80} 
          color="#b58a65" 
          style={styles.icon} 
        />
        
        <Text style={styles.title}>Verify Your Email</Text>
        
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Please check your inbox and click the verification link to complete your registration.
          If you don't see the email, check your spam folder.
        </Text>
        
        {showPasswordInput ? (
          <View style={styles.passwordContainer}>
            <Text style={styles.passwordLabel}>Enter your password to resend the verification email:</Text>
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.passwordInput}
              mode="outlined"
              outlineColor="#d0c3b6"
              activeOutlineColor="#b58a65"
              outlineStyle={styles.inputOutline}
            />
            <View style={styles.passwordButtonsContainer}>
              <Button
                mode="contained"
                onPress={handleLoginAndResend}
                style={styles.resendButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                loading={isResending}
                disabled={isResending || !password}
              >
                Resend Verification
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowPasswordInput(false)}
                style={styles.cancelButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.loginButtonLabel}
              >
                Cancel
              </Button>
              <Button
                mode="text"
                onPress={forceRefreshStatus}
                style={styles.refreshButton}
                loading={isForceUpdating}
                disabled={isForceUpdating}
              >
                I've Already Verified
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleResendVerification}
              style={[
                styles.resendButton, 
                !canResend && styles.disabledButton,
                !isOnline && styles.offlineButton
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              loading={isResending}
              disabled={isResending || !canResend || !isOnline}
            >
              {!isOnline 
                ? "Waiting for connection..." 
                : canResend 
                  ? "Resend Verification Email" 
                  : `Resend in ${countdown}s`
              }
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleBackToLogin}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.loginButtonLabel}
            >
              Back to Login
            </Button>
            
            <Button
              mode="text"
              onPress={forceRefreshStatus}
              loading={isForceUpdating}
              disabled={isForceUpdating}
            >
              I've Already Verified
            </Button>
          </View>
        )}
        
        {lastSent && (
          <Text style={styles.lastSentText}>
            Last sent: {lastSent.toLocaleTimeString()}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3d2f28',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#3d2f28',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  resendButton: {
    backgroundColor: '#b58a65',
    borderRadius: 12,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#d0c3b6',
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    letterSpacing: 0.5,
  },
  loginButton: {
    borderColor: '#b58a65',
    borderRadius: 12,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    letterSpacing: 0.5,
    color: '#b58a65',
  },
  lastSentText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
  },
  offlineBar: {
    backgroundColor: '#c95e5e',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  offlineText: {
    color: 'white',
    marginLeft: 8,
    fontFamily: 'WorkSans_500Medium',
    fontSize: 14,
  },
  offlineButton: {
    backgroundColor: '#c0c0c0',
  },
  passwordContainer: {
    width: '100%',
    marginTop: 20,
  },
  passwordLabel: {
    fontSize: 16,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 12,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 10,
  },
  passwordButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    borderColor: '#b58a65',
    borderRadius: 12,
  },
  refreshButton: {
    borderColor: '#b58a65',
    borderRadius: 12,
  },
});

export default VerifyEmailScreen; 