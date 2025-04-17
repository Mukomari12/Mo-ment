import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { Appbar, Text, Card, useTheme, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useEras } from '../hooks/useEras';
import { useJournalStore } from '../store/useJournalStore';

type TimelineScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Timeline'>;
};

// Default icons to use for eras
const defaultIcons = [
  'school',
  'briefcase',
  'laptop',
  'airplane',
  'home',
  'heart',
  'account-group',
  'book-open-variant',
] as const;

// Default colors for eras
const defaultColors = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF9800', // Orange
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#FFEB3B', // Yellow
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_MARGIN = 16;

const TimelineScreen: React.FC<TimelineScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { eras, recompute, isComputing, error } = useEras();
  const entries = useJournalStore(state => state.entries);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  // Map eras to UI-friendly format
  const mappedEras = eras.map((era, index) => {
    // Generate start and end year from ISO dates
    const startYear = new Date(era.from).getFullYear();
    const endYear = new Date(era.to).getFullYear();
    const now = new Date().getFullYear();
    
    return {
      id: index.toString(),
      title: era.label,
      startDate: startYear.toString(),
      endDate: endYear === now ? 'Present' : endYear.toString(),
      description: `This era spans from ${startYear} to ${endYear === now ? 'now' : endYear}.`,
      color: defaultColors[index % defaultColors.length],
      icon: defaultIcons[index % defaultIcons.length],
    };
  });

  // Get key events (most recent entry from each era)
  const keyEvents = eras.flatMap((era, eraIndex) => {
    const eraStart = new Date(era.from).getTime();
    const eraEnd = new Date(era.to).getTime();
    
    // Filter entries that fall within this era's timeframe
    const eraEntries = entries.filter(entry => {
      const entryDate = entry.createdAt;
      return entryDate >= eraStart && entryDate <= eraEnd;
    });
    
    // Get the most significant entry (one with most content)
    if (eraEntries.length === 0) return [];
    
    const mostSignificant = eraEntries.reduce((prev, current) => 
      current.content.length > prev.content.length ? current : prev
    );
    
    return {
      id: `event-${eraIndex}`,
      title: mostSignificant.content.split('\n')[0] || 'Entry',
      date: new Date(mostSignificant.createdAt).toLocaleDateString(),
      description: mostSignificant.content.substring(0, 100) + (mostSignificant.content.length > 100 ? '...' : ''),
      eraId: eraIndex.toString(),
    };
  });

  const renderLifeEra = ({ item }: { item: typeof mappedEras[0] }) => {
    const matchingEvents = keyEvents.filter(event => event.eraId === item.id);
    
    return (
      <Card
        style={[
          styles.eraCard,
          { 
            width: CARD_WIDTH,
            marginRight: CARD_MARGIN,
          }
        ]}
      >
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            <Text variant="titleLarge" style={styles.eraTitle}>{item.title}</Text>
          </View>
          
          <Text variant="labelLarge" style={styles.eraDateRange}>
            {item.startDate} - {item.endDate}
          </Text>
          
          <Text variant="bodyMedium" style={styles.eraDescription}>
            {item.description}
          </Text>
          
          {matchingEvents.length > 0 && (
            <View style={styles.eventsSection}>
              <Text variant="labelLarge" style={styles.eventsSectionTitle}>Key Events</Text>
              {matchingEvents.map(event => (
                <View key={event.id} style={styles.eventItem}>
                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                    {event.date}
                  </Text>
                  <Text variant="bodyMedium">{event.title}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {event.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Life Timeline" />
        {isComputing ? (
          <ActivityIndicator size={24} color={theme.colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <Appbar.Action icon="refresh" onPress={recompute} />
        )}
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your Life Eras {eras.length > 0 ? `(${eras.length})` : ''}
        </Text>
        
        <Text variant="bodyMedium" style={styles.description}>
          {eras.length > 0 
            ? "Scroll horizontally to explore different periods of your life." 
            : "Add at least 3 journal entries for AI to generate your life eras."}
        </Text>
        
        {isComputing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Analyzing your journal entries...</Text>
          </View>
        ) : eras.length > 0 ? (
          <FlatList
            data={mappedEras}
            renderItem={renderLifeEra}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : entries.length >= 3 ? (
          <Button 
            mode="contained" 
            onPress={recompute}
            style={styles.generateButton}
          >
            Generate Life Eras
          </Button>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <MaterialCommunityIcons 
                name="book-open-page-variant" 
                size={48} 
                color={theme.colors.primary}
                style={{ alignSelf: 'center', marginBottom: 16 }}
              />
              <Text style={{ textAlign: 'center' }}>
                Add at least 3 journal entries first. Then return here to generate your life timeline.
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 8,
  },
  description: {
    marginBottom: 16,
    marginLeft: 8,
    opacity: 0.7,
  },
  listContent: {
    paddingRight: 16,
  },
  eraCard: {
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 8,
    marginLeft: 8,
    borderRadius: 12,
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 8,
    height: '100%',
  },
  cardContent: {
    paddingLeft: 16,
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eraTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  eraDateRange: {
    marginBottom: 12,
    opacity: 0.7,
  },
  eraDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  eventsSection: {
    marginTop: 8,
  },
  eventsSectionTitle: {
    marginBottom: 8,
  },
  eventItem: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  generateButton: {
    marginTop: 24,
  },
  emptyCard: {
    marginTop: 24,
    padding: 16,
  }
});

export default TimelineScreen; 