/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Image, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, Keyboard, SafeAreaView } from 'react-native';
import { TextInput, IconButton, Chip, useTheme, Text as PaperText, ActivityIndicator, Snackbar, Portal, Modal, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore, Emotion } from '../store/useJournalStore';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { classifyMood, classifyEmotion, extractTextFromImage, transcribe } from '../api/openai';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Entry } from '../store/useJournalStore';

// Debug mode flag
const DEBUG_MODE = false;

export default function TextEntryScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addEntry } = useJournalStore();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingModalVisible, setRecordingModalVisible] = useState(false);
  const [autoEmotions, setAutoEmotions] = useState<Emotion[]>([]);
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const availableTags = [
    "Work", "Health", "Family", "Friends", "Travel", 
    "Ideas", "Goals", "Gratitude", "Challenges"
  ];
  
  const analyzeEmotions = async () => {
    if (text.trim().length > 20) {
      try {
        setIsClassifying(true);
        const emotionResult = await classifyEmotion(text);
        if (emotionResult) {
          setAutoEmotions([emotionResult]);
        }
        const moodResult = await classifyMood(text);
        if (moodResult) {
          setMoodScore(moodResult);
        }
      } catch (error) {
        console.error('Failed to classify emotions:', error);
      } finally {
        setIsClassifying(false);
      }
    }
  };
  
  // Set a timeout to classify emotions after the user stops typing
  const classificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (classificationTimeoutRef.current) {
      clearTimeout(classificationTimeoutRef.current);
    }
    
    if (text.trim().length > 20) {
      classificationTimeoutRef.current = setTimeout(() => {
        analyzeEmotions();
      }, 1500);
    }
    
    return () => {
      if (classificationTimeoutRef.current) {
        clearTimeout(classificationTimeoutRef.current);
      }
    };
  }, [text]);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const handleSave = async () => {
    try {
      if (text.trim() === '') {
        setError('Please enter some text before saving.');
        return;
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      addEntry({
        type: 'text',
        content: text,
        mood: moodScore || 5,
        emotion: (autoEmotions.length > 0 ? autoEmotions[0] : 'neutral') as Emotion,
        tags: selectedTags,
      });
      
      navigation.navigate('Dashboard');
    } catch (e) {
      console.error('Error saving entry:', e);
      setError('Failed to save entry. Please try again.');
    }
  };

  // Set up the save button in the header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        isClassifying ? (
          <ActivityIndicator size={24} color={theme.colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <TouchableOpacity 
            onPress={handleSave} 
            style={{ padding: 8, marginRight: 8 }}
          >
            <IconButton icon="check" onPress={handleSave} size={24} />
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, handleSave, isClassifying, theme.colors.primary]);
  
  // Request permissions for media features
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted' || audioStatus !== 'granted') {
          setError('Permission to access camera, media library, or microphone is required!');
        }
      }
    })();
  }, []);
  
  // Handle extracting text from images
  const processImageWithOCR = async (uri: string) => {
    try {
      setIsProcessingImage(true);
      const extractedText = await extractTextFromImage(uri);
      if (extractedText) {
        setText(prev => {
          const newText = prev.trim() === '' 
            ? extractedText 
            : `${prev}\n\n${extractedText}`;
          return newText;
        });
      }
    } catch (error) {
      console.error('OCR error:', error);
      setError('Failed to extract text from image. Please try again or enter text manually.');
    } finally {
      setIsProcessingImage(false);
    }
  };
  
  // Take a photo and extract text
  const takePicture = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await processImageWithOCR(uri);
      }
    } catch (e) {
      console.error('Camera error:', e);
      setError('Failed to capture image. Please try again.');
    }
  };
  
  // Select image from gallery and extract text
  const pickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        await processImageWithOCR(uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
      setError('Failed to select image. Please try again.');
    }
  };
  
  // Remove the current image
  const removeImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImageUri(null);
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setRecordingModalVisible(true);
      
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording. Please try again.');
      setRecordingModalVisible(false);
    }
  };
  
  // Stop voice recording and transcribe
  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(false);
      
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      console.log('Recording stopped and stored at', uri);
      setRecording(null);
      
      // Transcribe the audio recording
      await handleTranscription(uri);
      
      // Close the modal after processing
      setRecordingModalVisible(false);
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError('Failed to process recording. Please try again.');
      setIsRecording(false);
      setRecording(null);
      setRecordingModalVisible(false);
    }
  };
  
  // Process transcription from audio
  const handleTranscription = async (uri: string) => {
    try {
      console.log('Starting transcription...');
      const transcriptionResult = await transcribe(uri);
      
      if (transcriptionResult) {
        setText(prev => {
          const newText = prev.trim() === '' 
            ? transcriptionResult 
            : `${prev}\n\n${transcriptionResult}`;
          return newText;
        });
        
        console.log('Transcription added to text editor');
      } else {
        throw new Error('Transcription returned empty result');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to transcribe audio. Please try again or enter text manually.');
    }
  };
  
  // Debug function for testing in simulator
  const testDirectTranscription = () => {
    const sampleTranscription = "This is a test transcription to simulate voice input on devices where recording might not work properly. It helps with testing the app's functionality without actual microphone access.";
    
    setText(prev => {
      const newText = prev.trim() === '' 
        ? sampleTranscription 
        : `${prev}\n\n${sampleTranscription}`;
      return newText;
    });
    
    setRecordingModalVisible(false);
  };
  
  // Handler for date changes
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || customDate;
    setShowDatePicker(Platform.OS === 'ios');
    setCustomDate(currentDate);
  };
  
  // Render the mood picker UI
  const renderMoodPicker = () => {
    return (
      <View style={styles.moodContainer}>
        <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>How are you feeling?</PaperText>
        <View style={styles.moodPicker}>
          {[1, 2, 3, 4, 5].map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.moodOption,
                moodScore === score && { 
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.primary,
                }
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMoodScore(score as number);
              }}
            >
              <PaperText style={styles.moodEmoji}>
                {score === 1 ? '😞' : 
                 score === 2 ? '😕' : 
                 score === 3 ? '😐' : 
                 score === 4 ? '🙂' : '😁'}
              </PaperText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  // Render the recording modal
  const renderRecordingModal = () => (
    <Portal>
      <Modal
        visible={recordingModalVisible}
        onDismiss={() => {
          if (!isRecording) {
            setRecordingModalVisible(false);
          }
        }}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <IconButton
            icon="close"
            size={24}
            style={styles.closeButton}
            onPress={() => {
              if (isRecording) {
                stopRecording();
              } else {
                setRecordingModalVisible(false);
              }
            }}
          />
          
          <PaperText variant="headlineSmall" style={styles.modalTitle}>Voice Input</PaperText>
          
          {isProcessingImage ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <PaperText style={styles.processingText}>Processing audio...</PaperText>
            </View>
          ) : (
            <>
              <PaperText style={styles.recordingInstructions}>
                {isRecording 
                  ? "Recording in progress. Tap the STOP button when finished." 
                  : "Tap the button below to start recording."}
              </PaperText>
            
              <View style={styles.recordButtonContainer}>
                <IconButton
                  icon={isRecording ? "stop" : "microphone"}
                  size={isRecording ? 80 : 80}
                  iconColor={isRecording ? "#ffffff" : "#ffffff"}
                  mode="contained"
                  containerColor={isRecording ? "#ff5252" : theme.colors.primary}
                  style={styles.recordButton}
                  onPress={isRecording ? stopRecording : startRecording}
                />
              </View>
              
              <PaperText style={styles.recordingText}>
                {isRecording ? "Tap to STOP recording" : "Tap to START recording"}
              </PaperText>
              
              {DEBUG_MODE && (
                <Button
                  mode="outlined"
                  icon="bug"
                  style={styles.debugButton}
                  onPress={testDirectTranscription}
                >
                  Simulator Mode
                </Button>
              )}
            </>
          )}
        </View>
      </Modal>
    </Portal>
  );

  // Move the StyleSheet outside the component but use the theme within the component
  const styles = React.useMemo(() => StyleSheet.create({
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
      alignItems: 'center',
    },
    formatSpacer: {
      flex: 1,
    },
    mediaButton: {
      marginLeft: 4,
    },
    tagsContainer: {
      marginTop: 16,
      marginBottom: 24,
    },
    tagChip: {
      marginRight: 8,
      marginVertical: 4,
    },
    moodContainer: {
      marginTop: 16,
    },
    moodPicker: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    moodOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#e0e0e0',
    },
    moodEmoji: {
      fontSize: 24,
    },
    emotionsContainer: {
      marginTop: 16,
    },
    emotionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    emotionChip: {
      marginRight: 8,
      marginBottom: 8,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      marginBottom: 16,
    },
    quickActionButton: {
      flex: 1,
      marginHorizontal: 4,
    },
    imagePreviewContainer: {
      position: 'relative',
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
    },
    imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      margin: 20,
      borderRadius: 16,
    },
    modalContent: {
      alignItems: 'center',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: -12,
      right: -12,
    },
    modalTitle: {
      marginBottom: 16,
      fontWeight: 'bold',
    },
    recordingInstructions: {
      textAlign: 'center',
      marginBottom: 24,
    },
    recordButtonContainer: {
      marginBottom: 16,
    },
    recordButton: {
      borderRadius: 40,
    },
    recordingText: {
      marginBottom: 16,
      textAlign: 'center',
    },
    processingContainer: {
      alignItems: 'center',
      padding: 24,
    },
    processingText: {
      marginTop: 16,
      textAlign: 'center',
    },
    debugButton: {
      marginTop: 16,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: 'white',
      marginTop: 16,
    },
    datePickerContainer: {
      marginVertical: 16,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
    },
    dateButton: {
      marginTop: 8,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
  }), [theme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Image Preview */}
        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <IconButton
              icon="close-circle"
              size={24}
              style={styles.removeImageButton}
              onPress={removeImage}
            />
          </View>
        )}
        
        {/* Text Input */}
        <TextInput
          mode="outlined"
          multiline
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
          style={styles.textInput}
        />

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <Button 
            mode="contained-tonal"
            icon="microphone"
            onPress={startRecording}
            style={styles.quickActionButton}
          >
            Record
          </Button>
          
          <Button 
            mode="contained-tonal"
            icon="camera"
            onPress={takePicture}
            style={styles.quickActionButton}
          >
            Camera
          </Button>
          
          <Button 
            mode="contained-tonal"
            icon="image"
            onPress={pickImage}
            style={styles.quickActionButton}
          >
            Gallery
          </Button>
        </View>

        {/* Mood Picker */}
        {renderMoodPicker()}

        {/* Auto-Detected Emotions */}
        {autoEmotions.length > 0 && (
          <View style={styles.emotionsContainer}>
            <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>Detected Emotions</PaperText>
            <View style={styles.emotionChips}>
              {autoEmotions.map((emotion, index) => (
                <Chip 
                  key={index}
                  style={styles.emotionChip}
                  icon={() => <PaperText>{emotion.emoji}</PaperText>}
                >
                  {emotion.label}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>Tags (Optional)</PaperText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableTags.map(tag => (
              <Chip 
                key={tag}
                selected={selectedTags.includes(tag)}
                onPress={() => toggleTag(tag)} 
                style={styles.tagChip}
              >
                {tag}
              </Chip>
            ))}
          </ScrollView>
        </View>
        
        {/* Date Picker Section */}
        <View style={styles.datePickerContainer}>
          <PaperText variant="bodyMedium" style={{ marginBottom: 8 }}>Entry Date</PaperText>
          <Button 
            mode="outlined"
            icon="calendar"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            {customDate.toLocaleDateString()}
          </Button>
          
          {showDatePicker && (
            <DateTimePicker
              value={customDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Loading Overlay */}
      {isProcessingImage && (
        <Portal>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <PaperText style={styles.loadingText}>Extracting text from image...</PaperText>
          </View>
        </Portal>
      )}
      
      {/* Voice Recording Modal */}
      {renderRecordingModal()}

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
    </SafeAreaView>
  );
} 