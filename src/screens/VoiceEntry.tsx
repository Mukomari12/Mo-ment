import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, FAB, Text, useTheme, ActivityIndicator, Snackbar, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WaveRecorder from '../components/WaveRecorder';
import { Audio } from 'expo-av';
import { useJournalStore } from '../store/useJournalStore';
import { transcribe, classifyMood } from '../api/openai';

type VoiceEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VoiceEntry'>;
};

const VoiceEntryScreen: React.FC<VoiceEntryScreenProps> = ({ navigation }) => {
  console.log('VoiceEntry props:', { props: { navigation }, routeParams: {} });
  
  const theme = useTheme();
  const addEntry = useJournalStore(state => state.addEntry);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mock available tags
  const availableTags = ['Work', 'Personal', 'Family', 'Travel', 'Health', 'Ideas'];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  useEffect(() => {
    // Request permissions
    Audio.requestPermissionsAsync();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setRecordingTime(0);
      setTranscription('');
      setMood(undefined);
      
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      // Begin transcribing the audio
      const uri = recording.getURI();
      if (uri) {
        processRecording(uri);
      } else {
        setError('No recording was found');
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError('Failed to stop recording: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const processRecording = async (uri: string) => {
    try {
      setIsTranscribing(true);
      
      // Transcribe the audio using OpenAI's Whisper API
      const text = await transcribe(uri);
      setTranscription(text);
      
      // Classify the mood based on the transcription
      if (text) {
        const detectedMood = await classifyMood(text);
        setMood(detectedMood);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('AI service unavailable; saved without transcription/mood');
      // Set some placeholder text to allow saving anyway
      setTranscription('Voice memo (transcription failed)');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    try {
      // Save to the journal store
      addEntry({
        type: 'voice',
        content: transcription,
        tags: selectedTags,
        mood,
        uri: recording?.getURI() || undefined,
      });
      
      // Navigate back to dashboard
      navigation.goBack();
    } catch (err) {
      setError('Failed to save entry: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Voice Entry" />
        {transcription && !isTranscribing && (
          <Appbar.Action icon="check" onPress={handleSave} disabled={isTranscribing} />
        )}
      </Appbar.Header>

      <ScrollView style={styles.contentContainer}>
        {isRecording && (
          <View style={styles.waveContainer}>
            <WaveRecorder />
          </View>
        )}
        
        {isTranscribing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Transcribing your audio...</Text>
          </View>
        )}
        
        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <Text variant="titleLarge" style={styles.transcriptionTitle}>Transcription</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
            
            {mood && (
              <View style={styles.moodContainer}>
                <Text variant="labelLarge">Detected Mood: {mood}/5</Text>
                <View style={styles.moodIcons}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <View
                      key={value}
                      style={[
                        styles.moodIcon,
                        { 
                          backgroundColor: value === mood 
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                          opacity: value === mood ? 1 : 0.5
                        }
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.tagsContainer}>
              <Text variant="labelLarge" style={{ marginBottom: 8 }}>Tags</Text>
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
          </View>
        ) : (
          <View style={styles.instructionsContainer}>
            <Text variant="bodyLarge" style={styles.instructionText}>
              {isRecording 
                ? "Speak clearly..." 
                : "Tap the microphone button to start recording"}
            </Text>
          </View>
        )}
        
        <View style={styles.timerContainer}>
          {isRecording && (
            <Text variant="headlineLarge" style={{ color: theme.colors.error }}>
              {formatTime(recordingTime)}
            </Text>
          )}
        </View>
      </ScrollView>

      <FAB
        icon={isRecording ? "stop" : "microphone"}
        style={[
          styles.fab, 
          { backgroundColor: isRecording ? theme.colors.error : theme.colors.primary }
        ]}
        onPress={toggleRecording}
        disabled={isTranscribing}
      />
      
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
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  waveContainer: {
    height: 100,
    marginVertical: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 50,
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    textAlign: 'center',
  },
  transcriptionContainer: {
    flex: 1,
    padding: 16,
  },
  transcriptionTitle: {
    marginBottom: 16,
  },
  transcriptionText: {
    lineHeight: 24,
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  moodContainer: {
    marginBottom: 24,
  },
  moodIcons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  moodIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  tagsContainer: {
    marginTop: 16,
  },
  chip: {
    marginRight: 8,
    marginVertical: 4,
  },
});

export default VoiceEntryScreen; 