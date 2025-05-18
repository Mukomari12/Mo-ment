import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, Menu, IconButton, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import EmotionChip from './EmotionChip';
import { Entry } from '../store/useJournalStore';
import * as Haptics from 'expo-haptics';

type EntryCardProps = {
  entry: Entry;
  onPress: (entry: Entry) => void;
  style?: any;
  navigation?: NativeStackNavigationProp<RootStackParamList, any>;
  onDelete?: (entryId: string) => void;
};

const EntryCard: React.FC<EntryCardProps> = ({ entry, onPress, style, navigation, onDelete }) => {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today, ' + format(date, 'h:mm a');
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday, ' + format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, yyyy • h:mm a');
    }
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
  
  const handleDeletePress = () => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            if (onDelete) {
              onDelete(entry.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          style: "destructive" 
        }
      ]
    );
  };
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Haptics.selectionAsync();
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
        <View style={styles.cardContent}>
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
            
            <View style={styles.headerRight}>
              {entry.emotion && (
                <EmotionChip emotion={entry.emotion} size="small" showLabel={false} />
              )}
              
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton 
                    icon="dots-vertical" 
                    size={20} 
                    onPress={toggleMenu}
                    style={{margin: 0}}
                  />
                }
              >
                <Menu.Item onPress={handleDeletePress} title="Delete" leadingIcon="trash-can-outline" />
              </Menu>
            </View>
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
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    flex: 1,
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