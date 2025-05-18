import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Image } from 'react-native';
import { Text, Appbar, useTheme, Button, Divider, Chip, Card, Surface } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import PaperSheet from '../components/PaperSheet';
import { useSpacing } from '../utils/useSpacing';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type EntryDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EntryDetail'>;
  route: RouteProp<RootStackParamList, 'EntryDetail'>;
};

const EntryDetail: React.FC<EntryDetailScreenProps> = ({ navigation, route }) => {
  const { id } = route.params;
  console.log('EntryDetail rendered for id:', id);
  
  const theme = useTheme();
  const { hPad } = useSpacing();
  const entries = useJournalStore(state => state.entries);
  
  // Find the specific entry
  const entry = entries.find(e => e.id === id);
  
  useEffect(() => {
    console.log('EntryDetail entry:', entry ? 'Found' : 'Not found');
    if (entry) {
      console.log('Entry content:', entry.content);
      console.log('Entry type:', entry.type);
      console.log('Entry mood:', entry.mood);
      console.log('Entry tags:', entry.tags);
    } else {
      console.log('Available entry IDs:', entries.map(e => e.id));
    }
  }, [entry, entries]);

  // Handle case when entry is not found
  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }} 
          />
          <Appbar.Content title="Entry Not Found" />
        </Appbar.Header>
        <View style={[styles.fallbackContainer, { backgroundColor: theme.colors.background }]}>
          <Text variant="bodyLarge">Entry with ID {id} could not be found.</Text>
          <Text variant="bodyMedium" style={{marginTop: 8, marginBottom: 16}}>
            Available IDs: {entries.map(e => e.id).join(', ')}
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }} 
        />
        <Appbar.Content 
          title={format(new Date(entry.createdAt), 'MMMM d, yyyy')} 
        />
      </Appbar.Header>
      
      <ScrollView style={{flex: 1}} contentContainerStyle={{ padding: hPad }}>
        <Surface style={styles.entryCard}>
          {/* Emotion tag and mood indicator in header */}
          <View style={styles.entryHeader}>
            {entry.emotion && (
              <Chip 
                icon={() => <Text style={styles.emoji}>{entry.emotion?.emoji}</Text>}
                style={styles.emotionChip}
              >
                {entry.emotion.label}
              </Chip>
            )}
            
            {entry.mood && (
              <View style={styles.moodDotsContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View 
                    key={i}
                    style={[
                      styles.moodDot,
                      { 
                        backgroundColor: i <= entry.mood! ? theme.colors.primary : theme.colors.surfaceVariant,
                        opacity: i <= entry.mood! ? 1 : 0.5
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
          
          {/* Media content */}
          {entry.type === 'media' && entry.uri && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: entry.uri }} style={styles.media} />
              <Divider style={{ marginVertical: 16 }} />
            </View>
          )}
          
          {/* Voice content */}
          {entry.type === 'voice' && entry.uri && (
            <View style={styles.voiceContainer}>
              <Button 
                mode="contained" 
                icon="play"
                onPress={() => {/* future: play audio */}}
                style={styles.playButton}
              >
                Play Audio
              </Button>
              <Divider style={{ marginVertical: 16 }} />
            </View>
          )}
          
          {/* Entry text content */}
          <Text style={styles.entryContent}>
            {entry.content || "No content available"}
          </Text>
          
          <Divider style={{ marginVertical: 16 }} />
          
          {/* Type and timestamp info */}
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Entry type: {entry.type}
            </Text>
            <Text style={styles.metaText}>
              Created: {format(new Date(entry.createdAt), 'PPpp')}
            </Text>
          </View>
          
          {/* Tags section */}
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tagsList}>
                {entry.tags.map((tag, index) => (
                  <Chip 
                    key={index}
                    style={styles.tag}
                    compact
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  entryCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  entryContent: {
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
  },
  emotionContainer: {
    marginBottom: 16,
  },
  emotionChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0e6ff',
  },
  emoji: {
    fontSize: 18,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodLabel: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.7,
  },
  moodDotsContainer: {
    flexDirection: 'row',
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  mediaContainer: {
    marginBottom: 16,
  },
  media: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  voiceContainer: {
    marginBottom: 16,
  },
  playButton: {
    alignSelf: 'flex-start',
  },
  metaInfo: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagsLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default EntryDetail; 