/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { 
  FAB, 
  Card, 
  Text, 
  IconButton,
  Button,
  Portal,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useJournalStore, { type Entry } from '../store/useJournalStore';
import EntryCard from '../components/EntryCard';
import * as Haptics from 'expo-haptics';
import { devLog } from '../utils/devLog';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const entries = useJournalStore(state => state.entries);
  
  // Log only when entries count changes to prevent log spam
  useEffect(() => {
    devLog('Dashboard entries:', entries.length);
  }, [entries.length]);
  
  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Navigating directly to TextEntry');
    try {
      navigation.navigate('TextEntry');
      console.log('TextEntry navigation executed directly');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { id: entry.id });
  };

  const handleNavigation = (screen: Extract<keyof RootStackParamList, 'MoodGraphs' | 'LifeEras' | 'MoodCalendar' | 'JournalList' | 'MonthlyCheckup' | 'ChatBot'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    devLog(`Attempting to navigate to ${screen}`);
    navigation.navigate(screen);
  };

  // For empty state, show simple message with button
  if (entries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal</Text>
          <View style={styles.headerActions}>
            <Button 
              mode="contained" 
              onPress={handleNewEntry}
              style={styles.emptyButton}
              buttonColor="#b58a65"
              labelStyle={{color: 'white', fontSize: 16}}
            >
              Create First Entry
            </Button>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Welcome to Mo-ment</Text>
          <Text style={styles.emptyMessage}>Start capturing your moments by creating your first entry</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main dashboard with entries
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="calendar-heart"
            size={28}
            iconColor="#b58a65"
            onPress={() => {
              devLog('Mood Calendar pressed');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              try {
                navigation.navigate('MoodCalendar');
                devLog('Navigate to MoodCalendar called');
              } catch (error) {
                devLog('Navigation error:', error);
              }
            }}
            style={styles.headerIcon}
          />
          
          <IconButton
            icon="account-circle"
            size={28}
            iconColor="#b58a65"
            onPress={() => {
              devLog('Profile button pressed');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              try {
                navigation.navigate('Settings');
                devLog('Navigate to Settings called');
              } catch (error) {
                devLog('Navigation error:', error);
              }
            }}
            style={styles.headerIcon}
          />
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Button mode="contained" onPress={() => {
          devLog('Go to Journal List pressed');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          try {
            navigation.navigate('JournalList');
            devLog('Navigate to JournalList called');
          } catch (error) {
            devLog('Navigation error:', error);
          }
        }} style={{margin:8}}>
          Go to Journal List
        </Button>
        
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        
        {/* Simple 2-column grid of entries - limited to last 5 entries */}
        <View style={styles.entriesGrid}>
          <View style={styles.entriesColumn}>
            {entries
              .slice(0, 5)
              .filter((_, i) => i % 2 === 0)
              .map(entry => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry} 
                  onPress={handleEntryPress}
                  style={styles.entryCard}
                  navigation={navigation}
                />
              ))
            }
          </View>
          <View style={styles.entriesColumn}>
            {entries
              .slice(0, 5)
              .filter((_, i) => i % 2 === 1)
              .map(entry => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry} 
                  onPress={handleEntryPress}
                  style={styles.entryCard}
                  navigation={navigation}
                />
              ))
            }
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, {marginTop: 24}]}>Analytics</Text>
        
        <View style={styles.analyticsRow}>
          <TouchableOpacity 
            style={styles.analyticsCard} 
            onPress={() => {
              devLog('MoodGraphs card pressed');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                navigation.navigate('MoodGraphs');
                devLog('Navigate to MoodGraphs called');
              } catch (error) {
                devLog('Navigation error:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chart-line" size={28} color="#b58a65" />
            <Text style={styles.cardTitle}>Mood Graph</Text>
            <Text style={styles.cardDescription}>Track your mood patterns</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.analyticsCard} 
            onPress={() => {
              devLog('LifeEras card pressed');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              try {
                navigation.navigate('LifeEras');
                devLog('Navigate to LifeEras called');
              } catch (error) {
                devLog('Navigation error:', error);
              }
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="timeline-outline" size={28} color="#b58a65" />
            <Text style={styles.cardTitle}>Life Eras</Text>
            <Text style={styles.cardDescription}>Life eras visualization</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.calendarCard} 
          onPress={() => {
            devLog('MoodCalendar card pressed');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              navigation.navigate('MoodCalendar');
              devLog('Navigate to MoodCalendar called');
            } catch (error) {
              devLog('Navigation error:', error);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="calendar-month" size={28} color="#b58a65" />
          <Text style={styles.cardTitle}>Mood Calendar</Text>
          <Text style={styles.cardDescription}>Calendar view of your daily moods</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.calendarCard} 
          onPress={() => {
            devLog('ChatBot card pressed');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              navigation.navigate('ChatBot');
              devLog('Navigate to ChatBot called');
            } catch (error) {
              devLog('Navigation error:', error);
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chat-processing" size={28} color="#b58a65" />
          <Text style={styles.cardTitle}>Mo-ment Companion</Text>
          <Text style={styles.cardDescription}>Personalized reflective conversation</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleNewEntry}
        color="white"
        customSize={64}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F6F2',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#3d2f28',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    margin: 0,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginBottom: 16,
    marginLeft: 4,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3d2f28',
  },
  entriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  entriesColumn: {
    width: '48%',
  },
  entryCard: {
    marginBottom: 12,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#EFEBE6',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  calendarCard: {
    backgroundColor: '#EFEBE6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    color: '#3d2f28',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6a4e42',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#b58a65',
    borderRadius: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3d2f28',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6a4e42',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    width: '80%',
    borderRadius: 12,
    padding: 4,
  },
});

export default DashboardScreen; 