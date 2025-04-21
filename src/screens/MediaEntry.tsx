import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Appbar, Button, TextInput, useTheme, Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';
import { useJournalStore } from '../store/useJournalStore';
import { classifyMood } from '../api/openai';

type MediaEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MediaEntry'>;
};

// Mock images for the demo
const mockImages = [
  { id: '1', uri: 'https://picsum.photos/300' },
  { id: '2', uri: 'https://picsum.photos/300/300?random=2' },
];

const MediaEntryScreen: React.FC<MediaEntryScreenProps> = ({ navigation }) => {
  console.log('MediaEntry props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const addEntry = useJournalStore(state => state.addEntry);
  const [selectedImages, setSelectedImages] = useState<any[]>(mockImages);
  const [caption, setCaption] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // In a real app, we would process the selected images
      // For the demo, we'll just use our mock images
      console.log('Selected images:', result.assets);
    }
  };

  const handleSave = async () => {
    if (!caption.trim() || selectedImages.length === 0) {
      setError('Please add an image and caption');
      return;
    }

    try {
      setIsClassifying(true);
      
      // Classify the mood based on the caption
      let mood: number | undefined = undefined;
      try {
        mood = await classifyMood(caption);
      } catch (err) {
        console.error('Mood classification error:', err);
        setError('AI service unavailable; saved without mood');
      }
      
      // Save entry to the store
      addEntry({
        type: 'media',
        content: caption,
        uri: selectedImages[0].uri,
        tags: [],
        mood,
      });
      
      // Navigate back to dashboard
      navigation.goBack();
    } catch (err) {
      setError('Error saving entry: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Media Entry" />
        {isClassifying ? (
          <ActivityIndicator size={24} color={theme.colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <Appbar.Action icon="check" onPress={handleSave} />
        )}
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.imagesSection}>
          <TouchableOpacity 
            style={[styles.addButton, { borderColor: theme.colors.primary }]} 
            onPress={pickImage}
          >
            <MaterialCommunityIcons 
              name="image-plus" 
              size={32} 
              color={theme.colors.primary} 
            />
            <Text style={{ color: theme.colors.primary, marginTop: 8 }}>
              Add Photos
            </Text>
          </TouchableOpacity>

          {selectedImages.map((img) => (
            <View key={img.id} style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => {
                  setSelectedImages(selectedImages.filter(image => image.id !== img.id));
                }}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TextInput
          mode="outlined"
          multiline
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
          style={styles.captionInput}
        />
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
  imagesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  addButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  imageContainer: {
    position: 'relative',
    margin: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  captionInput: {
    marginTop: 16,
  },
});

export default MediaEntryScreen; 