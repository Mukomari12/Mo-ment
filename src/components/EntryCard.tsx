import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import EmotionChip from './EmotionChip';
import { Entry } from '../store/useJournalStore';

type EntryCardProps = {
  entry: Entry;
  onPress: (entry: Entry) => void;
  style?: any;
};

const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress, style }) => {
  const theme = useTheme();
  
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy');
  };
  
  const getPreview = (content: string, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    
    // Find the last space before maxLength to avoid cutting words
    const lastSpace = content.substring(0, maxLength).lastIndexOf(' ');
    return content.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };
  
  const renderMoodDots = () => {
    if (!entry.mood) return null;
    
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View 
          key={i}
          style={[
            styles.moodDot,
            { 
              backgroundColor: i <= entry.mood ? theme.colors.primary : theme.colors.surfaceVariant,
              opacity: i <= entry.mood ? 1 : 0.5
            }
          ]}
        />
      );
    }
    
    return (
      <View style={styles.moodDotsContainer}>
        {dots}
      </View>
    );
  };

  const getEntryTypeIcon = () => {
    switch (entry.type) {
      case 'voice': return '🎙️';
      case 'media': return '📷';
      default: return '✍️';
    }
  };
  
  return (
    <TouchableOpacity onPress={() => onPress(entry)} activeOpacity={0.9}>
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
            // Shadow styling for embossed effect
            shadowColor: theme.colors.secondary,
            elevation: 4,
          },
          style
        ]}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.date,
              { 
                color: theme.colors.secondary,
                fontFamily: 'PlayfairDisplay_400Regular'
              }
            ]}
          >
            {formatDate(entry.createdAt)}
          </Text>
          
          {entry.emotion && (
            <EmotionChip emotion={entry.emotion} size="small" showLabel={false} />
          )}
        </View>
        
        <View style={styles.content}>
          <Text
            style={[
              styles.preview,
              { 
                color: theme.colors.onSurface,
                fontFamily: 'WorkSans_400Regular'
              }
            ]}
            numberOfLines={4}
          >
            {getEntryTypeIcon()} {getPreview(entry.content)}
          </Text>
        </View>
        
        <View style={styles.footer}>
          {renderMoodDots()}
          
          {entry.tags && entry.tags.length > 0 && (
            <Text
              style={[
                styles.tags,
                { 
                  color: theme.colors.onSurfaceVariant,
                  fontFamily: 'WorkSans_400Regular'
                }
              ]}
              numberOfLines={1}
            >
              {entry.tags.join(' • ')}
            </Text>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
  },
  content: {
    marginBottom: 12,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  moodDotsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  tags: {
    fontSize: 12,
    opacity: 0.7,
  }
});

export default EntryCard; 