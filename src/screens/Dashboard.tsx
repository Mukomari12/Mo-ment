import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { 
  FAB, 
  Card, 
  Text, 
  Portal, 
  Dialog, 
  Button,
  useTheme,
  Snackbar,
  IconButton,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJournalStore, Entry } from '../store/useJournalStore';
import { format, formatDistanceToNow } from 'date-fns';
import PaperSheet from '../components/PaperSheet';
import EmptyState from '../components/EmptyState';
import EntryCard from '../components/EntryCard';
import { useSpacing } from '../utils/useSpacing';
import { RFValue } from 'react-native-responsive-fontsize';
import { useEras } from '../hooks/useEras';
import * as Haptics from 'expo-haptics';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { hPad } = useSpacing();
  const [entryDialogVisible, setEntryDialogVisible] = useState(false);
  const entries = useJournalStore(state => state.entries);
  const { error: erasError, eras } = useEras();
  const [error, setError] = useState<string | null>(null);

  // Display error from eras generation if any
  useEffect(() => {
    if (erasError) {
      setError(erasError);
    }
  }, [erasError]);

  const handleNewEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEntryDialogVisible(true);
  };

  const handleEntryPress = (entry: Entry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('EntryDetail', { id: entry.id });
  };

  const handleMonthlyCheckup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MonthlyCheckup');
  };

  if (entries.length === 0) {
    return (
      <PaperSheet>
        <SafeAreaView style={styles.container}>
          <View style={[styles.header, { paddingHorizontal: hPad }]}>
            <Text variant="titleLarge" style={styles.title}>Journal</Text>
          </View>
          <EmptyState onPress={handleNewEntry} />
          <FAB
            icon="plus-box-outline"
            style={[styles.fab, { backgroundColor: theme.colors.primary, right: hPad }]}
            onPress={handleNewEntry}
            color={theme.colors.onPrimary}
            elevation={4}
          />
        </SafeAreaView>
      </PaperSheet>
    );
  }

  return (
    <PaperSheet>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingHorizontal: hPad }]}>
          <Text variant="titleLarge" style={styles.title}>Journal</Text>
          <IconButton
            icon="calendar-heart"
            size={24}
            iconColor={theme.colors.primary}
            onPress={handleMonthlyCheckup}
          />
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Entries</Text>
          
          {/* Masonry-style 2-column grid of entries */}
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
                  />
                ))
              }
            </View>
          </View>
          
          <Button 
            mode="text" 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('JournalList');
            }}
            style={{ marginVertical: 8 }}
            labelStyle={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            See All Entries
          </Button>
          
          <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>Analytics</Text>
          
          <View style={styles.analyticsRow}>
            <Card 
              style={[styles.analyticsCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 4, shadowColor: theme.colors.secondary + '26' }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('MoodGraphs');
              }}
            >
              <Card.Content>
                <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Mood Graph</Text>
                <Text variant="bodySmall">Track your mood patterns</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={[styles.analyticsCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 4, shadowColor: theme.colors.secondary + '26' }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Timeline');
              }}
            >
              <Card.Content>
                <MaterialCommunityIcons name="timeline-outline" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Timeline</Text>
                <Text variant="bodySmall">Life eras visualization</Text>
              </Card.Content>
            </Card>
          </View>
          
          <Card 
            style={[styles.calendarCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 4, shadowColor: theme.colors.secondary + '26' }]} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('MoodCalendar');
            }}
          >
            <Card.Content>
              <MaterialCommunityIcons name="calendar-month" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>Mood Calendar</Text>
              <Text variant="bodySmall">Calendar view of your daily moods</Text>
            </Card.Content>
          </Card>
        </ScrollView>
        
        <FAB
          icon="plus-box-outline"
          style={[styles.fab, { backgroundColor: theme.colors.primary, right: hPad }]}
          onPress={handleNewEntry}
          color={theme.colors.onPrimary}
          elevation={4}
        />
        
        <Portal>
          <Dialog visible={entryDialogVisible} onDismiss={() => setEntryDialogVisible(false)}>
            <Dialog.Title style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>New Entry</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ fontFamily: 'WorkSans_400Regular' }}>Choose the type of entry you want to create:</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEntryDialogVisible(false);
                navigation.navigate('TextEntry');
              }}>Text</Button>
              <Button onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEntryDialogVisible(false);
                navigation.navigate('VoiceEntry');
              }}>Voice</Button>
              <Button onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEntryDialogVisible(false);
                navigation.navigate('MediaEntry');
              }}>Media</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => setError(null),
        }}
      >
        {error}
      </Snackbar>
    </PaperSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: RFValue(24),
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 8,
    fontSize: RFValue(18),
    fontFamily: 'PlayfairDisplay_700Bold',
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
    width: '100%',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    marginBottom: 16,
  },
  calendarCard: {
    marginBottom: 16,
  },
  cardTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: RFValue(16),
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    bottom: 0,
  },
});

export default DashboardScreen; 