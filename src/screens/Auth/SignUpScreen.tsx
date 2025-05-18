/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, safeFirebaseOperation } from '../../lib/firebase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ONBOARDING_COMPLETE_KEY = 'mowment_onboarding_complete';

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    console.log('Signup process started');
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Create the user account
      console.log('Creating user account with email and password');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      console.log('Sending verification email');
      await sendEmailVerification(userCredential.user);
      
      // Create a user document in Firestore
      console.log('Creating user document in Firestore');
      const userDoc = {
        uid: userCredential.user.uid,
        email,
        displayName: '',
        photoURL: '',
        birthday: birthday || null,
        emailVerified: false,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      // Add the user document to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
      console.log('User document created');
      
      // Mark onboarding as incomplete for new users
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false');
      console.log('Onboarding marked as incomplete for new user');
      
      // Sign out since email verification is required
      console.log('Signing out to require email verification');
      await auth.signOut();
      setLoading(false);
      
      // Use a direct imperative navigation to ensure it happens right away
      navigation.reset({
        index: 0,
        routes: [{ name: 'VerifyEmail', params: { email } }],
      });
      
      // Return early to avoid setting loading state again
      return;
    } catch (error: any) {
      console.error('Signup error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = error.message;
      
      // Handle specific Firebase auth errors with user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try a different email or login.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid. Please enter a valid email.';
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      console.log('Signup process completed');
      // Only set loading to false if we haven't already done so
      if (loading) {
        setLoading(false);
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthday(selectedDate);
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
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join Mo-ment to start your journaling journey</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-outline" size={24} color="#b58a65" style={styles.inputIcon} />
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                autoCapitalize="words"
                mode="outlined"
                outlineColor="#d0c3b6"
                activeOutlineColor="#b58a65"
                outlineStyle={styles.inputOutline}
              />
            </View>
            
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
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Birthday</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#b58a65" style={styles.dateIcon} />
                <Text style={styles.dateText}>{format(birthday, 'MMMM d, yyyy')}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#b58a65" />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthday}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <Button 
              mode="contained" 
              onPress={handleSignUp}
              style={styles.signupButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </View>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
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
    marginBottom: 32,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
  dateContainer: {
    marginBottom: 32,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#6a4e42',
    fontFamily: 'WorkSans_400Regular',
    marginLeft: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: '#d0c3b6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    flex: 1,
    fontFamily: 'WorkSans_400Regular',
    color: '#3d2f28',
    fontSize: 16,
  },
  signupButton: {
    marginTop: 8,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loginText: {
    fontFamily: 'WorkSans_400Regular',
    color: '#6a4e42',
  },
  loginLink: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  loginLinkText: {
    color: '#b58a65',
    fontFamily: 'WorkSans_600SemiBold',
    fontSize: 15,
  },
});

export default SignUpScreen; 