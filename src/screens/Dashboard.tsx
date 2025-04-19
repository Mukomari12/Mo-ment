import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { 
  FAB, 
  Card, 
  Text, 
  Portal, 
  IconButton,
  Button,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJournalStore, Entry } from '../store/useJournalStore';
import EntryCard from '../components/EntryCard';
import BottomSheetCompose, { BottomSheetComposeRef } from '../components/BottomSheetCompose';
import * as Haptics from 'expo-haptics';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const entries = useJournalStore(state => state.entries);
  const bottomSheetRef = useRef<BottomSheetComposeRef>(null);
  
  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
  };

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { id: entry.id });
  };

  const handleNavigation = (screen: Extract<keyof RootStackParamList, 'MoodGraphs' | 'Timeline' | 'MoodCalendar' | 'JournalList' | 'MonthlyCheckup'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  // For empty state, show simple message with button
  if (entries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Welcome to Mowment</Text>
          <Text style={styles.emptyMessage}>Start capturing your moments by creating your first entry</Text>
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
        
        <Portal>
          <BottomSheetCompose ref={bottomSheetRef} navigation={navigation} />
        </Portal>
      </SafeAreaView>
    );
  }

  // Main dashboard with entries
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <IconButton
          icon="calendar-heart"
          size={28}
          iconColor="#b58a65"
          onPress={() => handleNavigation('MonthlyCheckup')}
          style={styles.headerIcon}
        />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Recent Entries</Text>
        
        {/* Simple 2-column grid of entries */}
        <View style={styles.entriesGrid}>
          <View style={styles.entriesColumn}>
            {entries
              .slice(0, 6)
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
              .slice(0, 6)
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
        
        <Button 
          mode="text" 
          onPress={() => handleNavigation('JournalList')}
          style={styles.viewAllButton}
          textColor="#b58a65"
          labelStyle={{fontSize: 16}}
        >
          See All Entries
        </Button>
        
        <Text style={[styles.sectionTitle, {marginTop: 24}]}>Analytics</Text>
        
        <View style={styles.analyticsRow}>
          <TouchableOpacity 
            style={styles.analyticsCard} 
            onPress={() => handleNavigation('MoodGraphs')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="chart-line" size={28} color="#b58a65" />
            <Text style={styles.cardTitle}>Mood Graph</Text>
            <Text style={styles.cardDescription}>Track your mood patterns</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.analyticsCard} 
            onPress={() => handleNavigation('Timeline')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="timeline-outline" size={28} color="#b58a65" />
            <Text style={styles.cardTitle}>Timeline</Text>
            <Text style={styles.cardDescription}>Life eras visualization</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.calendarCard} 
          onPress={() => handleNavigation('MoodCalendar')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="calendar-month" size={28} color="#b58a65" />
          <Text style={styles.cardTitle}>Mood Calendar</Text>
          <Text style={styles.cardDescription}>Calendar view of your daily moods</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleNewEntry}
        color="white"
        customSize={64}
      />
      
      <Portal>
        <BottomSheetCompose ref={bottomSheetRef} navigation={navigation} />
      </Portal>
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
    bottom: 24,
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