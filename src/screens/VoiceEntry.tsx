import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, Alert, Platform, TouchableOpacity} from 'react-native';
import {Button, Text, ActivityIndicator, Surface, useTheme} from 'react-native-paper';
import {Audio} from 'expo-av';
import * as Haptics from 'expo-haptics';
import {useJournalStore} from '../store/useJournalStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { transcribe } from '../api/openai';
import { checkApiKey, showApiKeyAlert } from '../utils/apiKeyStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

// Debug mode for simulators
const DEBUG_MODE = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV && (Platform.constants.systemName?.includes('Simulator') || false);

type VoiceEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VoiceEntry'>;
};

export default function VoiceEntry({ navigation }: VoiceEntryScreenProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioURI, setAudioURI] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const addVoice = useJournalStore(s => s.addVoiceEntry);
  
  // Check API key on component mount
  useEffect(() => {
    const isValid = checkApiKey();
    if (!isValid) {
      showApiKeyAlert();
      setError('OpenAI API key not configured. Voice transcription will not work.');
    }
    
    if (DEBUG_MODE) {
      console.log("Running in iOS Simulator debug mode");
    }
  }, []);

  // Setup navigation options
  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: 'Cancel',
    });
  }, [navigation]);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRec = async () => {
    try {
      setError('');
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      
      // Start timer for recording duration
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording: ' + err.message);
    }
  };

  const stopRec = async () => {
    try {
      if (!recording) {
        setError('No active recording found');
        return;
      }
      
      // Clear recording timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsProcessing(true);
      
      // Ensure recording is prepared before stopping
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        
        if (uri) {
          await handleTranscription(uri);
        } else {
          setError('Recording failed: No audio file was created');
          setIsProcessing(false);
        }
      } catch (err: any) {
        setError('Recording was not properly prepared: ' + err.message);
        setIsProcessing(false);
        setRecording(null);
      }
    } catch (err: any) {
      setError('Failed to process recording: ' + err.message);
      setIsProcessing(false);
      setRecording(null);
    }
  };

  const handleTranscription = async (uri: string) => {
    setIsProcessing(true);
    setError('');
    try {
      console.log('Transcribing audio from:', uri);
      
      // Read audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-1');
      
      // Call OpenAI API for transcription
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      const transcriptionText = response.data.text;
      console.log('Transcription:', transcriptionText);
      
      if (transcriptionText) {
        setTranscript(transcriptionText);
        // Instead of navigating to TextEntry, save directly and return to Dashboard
        addVoice(uri, transcriptionText);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('Dashboard');
      } else {
        setError('Transcription failed: Empty result');
      }
    } catch (err: any) {
      console.error('Transcription error', err.response || err);
      setError(`Transcription failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Debug function for simulators
  const testDirectTranscription = () => {
    Alert.alert(
      "Simulator Debug Mode",
      "Since audio recording doesn't always work in simulators, you can save an entry with sample text.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Save Sample Entry",
          onPress: () => {
            // Use a mock transcription since recording doesn't work well in simulators
            addVoice("debug://sample-recording.m4a", "This is a sample voice entry created in debug mode from the simulator. Voice recordings work better on physical devices.");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.root}>
      <Surface style={styles.content} elevation={2}>
        <Text style={styles.title}>Voice Journal Entry</Text>
        
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        ) : null}
        
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.processingText}>Processing your recording...</Text>
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            {recording ? (
              <>
                <View style={styles.recordingIndicator}>
                  <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />
                  <Text style={styles.recordingText}>Recording in progress</Text>
                </View>
                <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
                <TouchableOpacity 
                  style={[styles.recordButton, styles.stopButton, { backgroundColor: theme.colors.error }]}
                  onPress={stopRec}
                >
                  <MaterialCommunityIcons name="stop" size={36} color="white" />
                </TouchableOpacity>
                <Text style={styles.instructionText}>Tap to stop recording</Text>
              </>
            ) : (
              <>
                <Text style={styles.instructionText}>Tap the microphone to start recording</Text>
                <TouchableOpacity 
                  style={[styles.recordButton, { backgroundColor: theme.colors.primary }]}
                  onPress={DEBUG_MODE ? testDirectTranscription : startRec}
                >
                  <MaterialCommunityIcons name="microphone" size={36} color="white" />
                </TouchableOpacity>
                <Text style={styles.helpText}>Your recording will be transcribed automatically</Text>
              </>
            )}
          </View>
        )}
        
        <Button 
          mode="outlined" 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          Cancel
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
  },
  durationText: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  cancelButton: {
    marginTop: 'auto',
  },
}); 