/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Image } from 'react-native';
import { Text, Divider, Switch, Button, Avatar, IconButton, useTheme } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { useAuth } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

type UserProfile = {
  fullName: string;
  email: string;
  createdAt: any;
  birthday: any;
  photoURL?: string;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, usingMockAuth } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnapshot = await getDoc(profileRef);
      
      if (profileSnapshot.exists()) {
        setProfile(profileSnapshot.data() as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { signOut } = useAuth();
      await signOut();
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile?.fullName) return '?';
    return profile.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile?.photoURL ? (
              <Avatar.Image 
                source={{ uri: profile.photoURL }} 
                size={80} 
                style={styles.avatar} 
              />
            ) : (
              <Avatar.Text 
                label={getInitials()} 
                size={80} 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            <IconButton
              icon="camera"
              mode="contained"
              containerColor="#b58a65"
              iconColor="white"
              size={16}
              onPress={() => Alert.alert('Coming Soon', 'Profile photo uploads will be available soon!')}
              style={styles.editAvatarButton}
            />
            </View>
          
          <Text style={styles.profileName}>{profile?.fullName || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email || 'No email'}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
              <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color="#b58a65"
              />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="theme-light-dark" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch 
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              color="#b58a65"
            />
          </View>

          {usingMockAuth && (
            <View style={styles.infoItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="information-outline" size={24} color="#ff9800" />
                <Text style={[styles.settingLabel, { color: '#ff9800' }]}>Using Mock Auth</Text>
              </View>
              <MaterialCommunityIcons name="check-circle" size={24} color="#ff9800" />
            </View>
          )}
        </View>

        <Divider style={styles.divider} />
        
        {/* Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('Reminders')}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Manage Reminders</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Privacy Settings</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon!')}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="export-variant" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Export Your Data</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => Alert.alert('Coming Soon', 'Account deletion will be available soon!')}
          >
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="account-remove-outline" size={24} color="#e74c3c" />
              <Text style={[styles.settingLabel, { color: '#e74c3c' }]}>Delete Account</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
          
        <Divider style={styles.divider} />
        
        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.navigationItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>About Mo-ment</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navigationItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navigationItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color="#b58a65" />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#b58a65" />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={confirmLogout}
          style={styles.logoutButton}
          textColor="#e74c3c"
          labelStyle={styles.logoutButtonText}
        >
          Logout
        </Button>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#b58a65',
  },
  avatarLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
  },
  profileName: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3d2f28',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: '#6a4e42',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b58a65',
  },
  editProfileText: {
    color: '#b58a65',
    fontFamily: 'WorkSans_500Medium',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3d2f28',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: '#3d2f28',
    marginLeft: 12,
  },
  logoutButton: {
    margin: 24,
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontFamily: 'WorkSans_500Medium',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontFamily: 'WorkSans_400Regular',
    fontSize: 12,
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
});

export default SettingsScreen; 