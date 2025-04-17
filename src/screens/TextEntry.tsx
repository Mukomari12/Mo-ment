import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, IconButton, Chip, Appbar, useTheme, Text as PaperText, ActivityIndicator, Snackbar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import { classifyMood } from '../api/openai';

type TextEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TextEntry'>;
};

const TextEntryScreen: React.FC<TextEntryScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const addEntry = useJournalStore(state => state.addEntry);
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock available tags
  const availableTags = ['Work', 'Personal', 'Family', 'Travel', 'Health', 'Ideas'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!text.trim()) return;

    try {
      setIsClassifying(true);
      // Classify the mood based on the text content
      let entryMood = mood;
      if (!entryMood) {
        try {
          entryMood = await classifyMood(text);
        } catch (err) {
          console.error('Mood classification error:', err);
          setError('AI service unavailable; saved without mood');
        }
      }

      // Save entry to the store
      addEntry({
        type: 'text',
        content: text,
        tags: selectedTags,
        mood: entryMood,
      });

      // Navigate back to dashboard
      navigation.goBack();
    } catch (err) {
      setError('Error saving entry: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsClassifying(false);
    }
  };

  const renderMoodPicker = () => {
    const moods = [
      { value: 1, icon: 'emoticon-sad-outline', label: 'Bad' },
      { value: 2, icon: 'emoticon-neutral-outline', label: 'Not Great' },
      { value: 3, icon: 'emoticon-outline', label: 'Okay' },
      { value: 4, icon: 'emoticon-happy-outline', label: 'Good' },
      { value: 5, icon: 'emoticon-excited-outline', label: 'Great' },
    ];

    return (
      <View style={styles.moodContainer}>
        <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>How are you feeling? (Optional - AI will detect if not set)</PaperText>
        <View style={styles.moodIcons}>
          {moods.map((item) => (
            <IconButton
              key={item.value}
              icon={item.icon}
              size={24}
              mode={mood === item.value ? 'contained' : 'outlined'}
              onPress={() => setMood(item.value)}
              style={styles.moodIcon}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="New Text Entry" />
        {isClassifying ? (
          <ActivityIndicator size={24} color={theme.colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <Appbar.Action icon="check" onPress={handleSave} />
        )}
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <TextInput
          mode="outlined"
          multiline
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
          style={styles.textInput}
        />

        <View style={styles.formatBar}>
          <IconButton 
            icon="format-bold" 
            size={20}
            onPress={() => {/* Would handle formatting */}}
          />
          <IconButton 
            icon="format-italic" 
            size={20}
            onPress={() => {/* Would handle formatting */}}
          />
          <IconButton 
            icon="format-list-bulleted" 
            size={20}
            onPress={() => {/* Would handle formatting */}}
          />
        </View>

        {renderMoodPicker()}

        <View style={styles.tagsContainer}>
          <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>Tags</PaperText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableTags.map(tag => (
              <Chip 
                key={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)} 
                style={styles.chip}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

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
  textInput: {
    minHeight: 200,
  },
  formatBar: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  tagsContainer: {
    marginTop: 16,
  },
  chip: {
    marginRight: 8,
    marginVertical: 4,
  },
  moodContainer: {
    marginTop: 16,
  },
  moodIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodIcon: {
    marginRight: 8,
  },
});

export default TextEntryScreen; 