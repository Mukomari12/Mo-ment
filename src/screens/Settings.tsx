import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Appbar, Text, List, Switch, Divider, Button, useTheme, Avatar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import * as ImagePicker from 'expo-image-picker';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { settings, setSettings } = useJournalStore(state => ({
    settings: state.settings,
    setSettings: state.setSettings,
  }));

  // For demo purposes, we'll just store settings in state
  const [name, setName] = useState('Alex Johnson');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings({ theme: newTheme });
  };

  const renderAvatar = () => {
    if (avatarUri) {
      return (
        <Avatar.Image
          size={80}
          source={{ uri: avatarUri }}
        />
      );
    }
    return (
      <Avatar.Text
        size={80}
        label={name.split(' ').map(n => n[0]).join('')}
        style={{ backgroundColor: theme.colors.primary }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {renderAvatar()}
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.editBadgeText, { color: theme.colors.onPrimary }]}>
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text variant="headlineSmall" style={styles.nameText}>
            {name}
          </Text>
          
          <Button 
            mode="text" 
            onPress={() => {/* Would open a name edit dialog */}}
          >
            Edit Profile
          </Button>
        </View>
        
        <List.Section>
          <List.Subheader>App Settings</List.Subheader>
          
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={settings.theme === 'dark'}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Notifications"
            description="Manage your journal reminders"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Reminders')}
          />
          
          <Divider />
          
          <List.Item
            title="Export Data"
            description="Export your journal entries"
            left={props => <List.Icon {...props} icon="export" />}
            onPress={() => {/* Would handle export */}}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {/* Would open privacy policy */}}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document-outline" />}
            onPress={() => {/* Would open terms of service */}}
          />
          
          <Divider />
          
          <List.Item
            title="App Version"
            description="v1.0.0"
            left={props => <List.Icon {...props} icon="information-outline" />}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  editBadgeText: {
    fontSize: 12,
  },
  nameText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 