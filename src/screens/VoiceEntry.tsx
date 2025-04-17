import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import WaveRecorder from '../components/WaveRecorder';

type VoiceEntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VoiceEntry'>;
};

const VoiceEntryScreen: React.FC<VoiceEntryScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (recording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (!recording && recordingTime !== 0) {
      // If we just stopped recording
      if (recordingTime > 3) {
        // Fake some transcription for the demo
        setTranscription("This is a simulated voice transcription for the Mowment app demo. The real app would use a speech-to-text API to convert your voice recording into text.");
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recording, recordingTime]);

  const toggleRecording = () => {
    setRecording(prev => !prev);
    
    if (recording) {
      // Stop recording
      // In a real app, we would process the audio here
    } else {
      // Start recording
      setRecordingTime(0);
      setTranscription('');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    // In a real app, we would save to the store
    // For now, just navigate back
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Voice Entry" />
        {transcription ? (
          <Appbar.Action icon="check" onPress={handleSave} />
        ) : null}
      </Appbar.Header>

      <View style={styles.contentContainer}>
        {recording && (
          <View style={styles.waveContainer}>
            <WaveRecorder />
          </View>
        )}
        
        {transcription ? (
          <View style={styles.transcriptionContainer}>
            <Text variant="titleLarge" style={styles.transcriptionTitle}>Transcription</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        ) : (
          <View style={styles.instructionsContainer}>
            <Text variant="bodyLarge" style={styles.instructionText}>
              {recording 
                ? "Speak clearly..." 
                : "Tap the microphone button to start recording"}
            </Text>
          </View>
        )}
        
        <View style={styles.timerContainer}>
          {recording && (
            <Text variant="headlineLarge" style={{ color: theme.colors.error }}>
              {formatTime(recordingTime)}
            </Text>
          )}
        </View>
      </View>

      <FAB
        icon={recording ? "stop" : "microphone"}
        style={[
          styles.fab, 
          { backgroundColor: recording ? theme.colors.error : theme.colors.primary }
        ]}
        onPress={toggleRecording}
        animated={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
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
    padding: 20,
  },
  transcriptionTitle: {
    marginBottom: 10,
  },
  transcriptionText: {
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default VoiceEntryScreen; 