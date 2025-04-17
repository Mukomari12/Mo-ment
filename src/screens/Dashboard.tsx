import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, SafeAreaView } from 'react-native';
import { 
  FAB, 
  Card, 
  Text, 
  List, 
  Avatar, 
  Portal, 
  Dialog, 
  Button,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useJournalStore, Entry } from '../store/useJournalStore';
import { format, formatDistanceToNow } from 'date-fns';
import PaperSheet from '../components/PaperSheet';
import EmptyState from '../components/EmptyState';
import { useSpacing } from '../utils/useSpacing';
import { RFValue } from 'react-native-responsive-fontsize';
import { useEras } from '../hooks/useEras';

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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today or yesterday, show relative time
    if (date.toDateString() === now.toDateString() || 
        date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise, show formatted date
    return format(date, 'MMM d, yyyy');
  };

  const getEntryPreview = (entry: Entry) => {
    switch (entry.type) {
      case 'text':
        return entry.content.length > 50 
          ? `${entry.content.substring(0, 50)}...` 
          : entry.content;
      case 'voice':
        return 'Voice memo';
      case 'media':
        return 'Photo with caption';
      default:
        return '';
    }
  };

  const renderEntryIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <List.Icon icon="notebook-outline" color={theme.colors.primary} />;
      case 'voice':
        return <List.Icon icon="microphone-outline" color={theme.colors.primary} />;
      case 'media':
        return <List.Icon icon="image-outline" color={theme.colors.primary} />;
      default:
        return <List.Icon icon="notebook-outline" color={theme.colors.primary} />;
    }
  };

  const renderMoodIndicator = (mood: number | undefined) => {
    if (!mood) return null;
    
    const moodIcons = ['emoticon-sad-outline', 'emoticon-neutral-outline', 'emoticon-happy-outline', 'emoticon-excited-outline', 'emoticon-cool-outline'];
    return (
      <Avatar.Icon 
        size={24} 
        icon={moodIcons[mood - 1] || moodIcons[2]} 
        style={{ backgroundColor: theme.colors.surfaceVariant }} 
        color={theme.colors.primary}
      />
    );
  };

  const handleNewEntry = () => {
    setEntryDialogVisible(true);
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
            icon="plus"
            style={[styles.fab, { backgroundColor: theme.colors.primary, right: hPad }]}
            onPress={handleNewEntry}
            color={theme.colors.onPrimary}
            elevation={2}
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
        </View>
        
        <ScrollView style={styles.content} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Recent Entries</Text>
          
          <Card style={[styles.entriesCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 0 }]}>
            <FlatList
              data={entries.slice(0, 3)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <List.Item
                  title={item.content.split('\n')[0]}
                  description={getEntryPreview(item)}
                  left={() => renderEntryIcon(item.type)}
                  right={() => (
                    <View style={styles.entryMeta}>
                      <Text variant="bodySmall">{formatDate(item.createdAt)}</Text>
                      {renderMoodIndicator(item.mood)}
                    </View>
                  )}
                  style={styles.entryItem}
                  onPress={() => navigation.navigate('EntryDetail', { id: item.id })}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('JournalList')}
              style={{ marginVertical: 8 }}
              labelStyle={{ fontFamily: 'PTSerif-Bold' }}
            >
              See All Entries
            </Button>
          </Card>
          
          <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>Analytics</Text>
          
          <View style={styles.analyticsRow}>
            <Card 
              style={[styles.analyticsCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 0 }]} 
              onPress={() => navigation.navigate('MoodGraphs')}
            >
              <Card.Content>
                <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Mood Graph</Text>
                <Text variant="bodySmall">Track your mood patterns</Text>
              </Card.Content>
            </Card>
            
            <Card 
              style={[styles.analyticsCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 0 }]} 
              onPress={() => navigation.navigate('Timeline')}
            >
              <Card.Content>
                <MaterialCommunityIcons name="timeline-outline" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={styles.cardTitle}>Timeline</Text>
                <Text variant="bodySmall">Life eras visualization</Text>
              </Card.Content>
            </Card>
          </View>
          
          <Card 
            style={[styles.calendarCard, { backgroundColor: theme.colors.surfaceVariant, borderRadius: 16, elevation: 0 }]} 
            onPress={() => navigation.navigate('MoodCalendar')}
          >
            <Card.Content>
              <MaterialCommunityIcons name="calendar-month" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>Mood Calendar</Text>
              <Text variant="bodySmall">Calendar view of your daily moods</Text>
            </Card.Content>
          </Card>
        </ScrollView>
        
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary, right: hPad }]}
          onPress={() => setEntryDialogVisible(true)}
          color={theme.colors.onPrimary}
          elevation={2}
        />
        
        <Portal>
          <Dialog visible={entryDialogVisible} onDismiss={() => setEntryDialogVisible(false)}>
            <Dialog.Title>New Entry</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">Choose the type of entry you want to create:</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => {
                setEntryDialogVisible(false);
                navigation.navigate('TextEntry');
              }}>Text</Button>
              <Button onPress={() => {
                setEntryDialogVisible(false);
                navigation.navigate('VoiceEntry');
              }}>Voice</Button>
              <Button onPress={() => {
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
  },
  title: {
    fontWeight: 'bold',
    fontSize: RFValue(24),
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
  },
  entriesCard: {
    marginBottom: 8,
  },
  entryItem: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    opacity: 0.2,
    marginHorizontal: 16,
  },
  entryMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: 8,
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    bottom: 0,
  },
});

export default DashboardScreen; 