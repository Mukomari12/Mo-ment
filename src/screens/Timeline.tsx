import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { Appbar, Text, Card, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TimelineScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Timeline'>;
};

// Mock data for life eras
const lifeEras = [
  {
    id: '1',
    title: 'College Years',
    startDate: '2018',
    endDate: '2022',
    description: 'Four years of intensive learning, making friends, and discovering my true interests.',
    color: '#4CAF50', // Green
    icon: 'school' as any,
  },
  {
    id: '2',
    title: 'First Job',
    startDate: '2022',
    endDate: '2023',
    description: 'Started my career as a junior developer at TechCorp, learning the ropes of professional work.',
    color: '#2196F3', // Blue
    icon: 'briefcase' as any,
  },
  {
    id: '3',
    title: 'Freelancing',
    startDate: '2023',
    endDate: 'Present',
    description: 'Took the leap to freelance, working on exciting projects and managing my own schedule.',
    color: '#9C27B0', // Purple
    icon: 'laptop' as any,
  },
  {
    id: '4',
    title: 'Travel Sabbatical',
    startDate: '2024',
    endDate: '2024',
    description: 'Took three months off to travel around Southeast Asia, a life-changing experience.',
    color: '#FF9800', // Orange
    icon: 'airplane' as any,
  },
];

// Mock data for key events
const keyEvents = [
  {
    id: '1',
    title: 'Graduation',
    date: 'May 2022',
    description: 'Graduated with honors in Computer Science',
    eraId: '1',
  },
  {
    id: '2',
    title: 'First Client',
    date: 'January 2023',
    description: 'Landed my first major freelance client',
    eraId: '3',
  },
  {
    id: '3',
    title: 'Promotion',
    date: 'November 2022',
    description: 'Promoted to mid-level developer after 6 months',
    eraId: '2',
  },
  {
    id: '4',
    title: 'Visited Thailand',
    date: 'February 2024',
    description: 'Spent 3 weeks exploring Thailand',
    eraId: '4',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_MARGIN = 16;

const TimelineScreen: React.FC<TimelineScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  const renderLifeEra = ({ item }: { item: typeof lifeEras[0] }) => {
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
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Your Life Eras
        </Text>
        
        <Text variant="bodyMedium" style={styles.description}>
          Scroll horizontally to explore different periods of your life.
        </Text>
        
        <FlatList
          data={lifeEras}
          renderItem={renderLifeEra}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
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
});

export default TimelineScreen; 