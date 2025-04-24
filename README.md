# Mowment - Privacy-First Journaling App

## Overview

Mowment is a privacy-focused journaling application that helps users track their moods, record journal entries in multiple formats (text, voice, and photos), and gain insights through AI-powered analysis. The app uses a combination of on-device storage and secure AI processing to ensure your personal data remains private.

## Storage Implementation

### Privacy-First Approach

Mowment stores all your personal data **exclusively on your device**. This includes:

- Journal entries (text, voice recordings, photos)
- Mood tracking data
- Life eras (AI-generated periods from your journal)
- Monthly reports and analyses
- App settings and preferences

### Technical Details

The app uses the following technologies for secure, on-device data storage:

1. **Zustand with Persist Middleware**: A lightweight state management library that includes persistence capabilities to ensure your data survives app restarts and device reboots.

2. **AsyncStorage**: React Native's secure local storage solution that keeps your data encrypted and accessible only to the Mowment app.

3. **File System Storage**: For media like images and audio recordings, the app uses Expo's FileSystem module to store files securely in the app's sandbox directory.

### Data Flow

Here's how your data flows through the application:

1. You create entries in the app (text, voice, or photo)
2. The data is immediately saved to your device's local storage
3. When you generate insights (Life Eras, Monthly Reports), your data is temporarily sent to OpenAI's servers for processing
4. The AI-generated insights are then saved back to your device
5. No permanent copies of your data are stored on external servers

## Security Considerations

- **No Cloud Sync**: Your journal data is not synced to any cloud service by default, keeping it secure on your device
- **API Security**: When interacting with the OpenAI API for insights, your data is transmitted over HTTPS with industry-standard encryption
- **Local Encryption**: Data stored on your device benefits from your device's built-in security (encryption, passcode/biometric protection)

## Data Management

You have full control over your journal data:

- **Delete Entries**: Any entry can be permanently deleted from the device with a simple gesture
- **Privacy Settings**: You can manage permissions for camera, microphone, and notifications
- **Export Options**: (Future feature) Export your journal to backup in a secure format

## Why This Approach Is Safe

1. **No Server Storage**: Unlike many apps that store your data on their servers, Mowment keeps your data exclusively on your device.

2. **Temporary AI Processing**: While data is sent to OpenAI for processing features like mood analysis and life eras, this is temporary and follows OpenAI's strict data protection policies.

3. **Device Security**: By leveraging your device's built-in security features, your journal benefits from industry-leading hardware and software security measures.

## App Features

- **Multi-format Journaling**: Text, voice, and photo entries
- **Mood Tracking**: Record and visualize your emotional state over time
- **Life Eras**: AI-generated summaries of different periods in your life
- **Monthly Insights**: Get analysis of your emotional patterns and triggers
- **Customizable Settings**: Themes, notification preferences, and more

## Technical Architecture

- **Frontend**: React Native with TypeScript
- **State Management**: Zustand with persistence
- **UI Components**: React Native Paper
- **AI Processing**: OpenAI API (GPT-4 and Whisper)
- **Storage**: AsyncStorage + Expo FileSystem

# Debugging Network Issues

If you encounter 'Network request failed' errors, try these steps:

1. Check your API key format - should match sk-proj-* format for newer OpenAI APIs
2. Verify network connectivity
3. Make sure you're using a real audio file for transcription
4. Check console logs for detailed error information

# Legal

Mowment™ is a trademark of Mohammad Muqtader Omari.
Source code © 2025 Mohammad Muqtader Omari – released under the MIT License (see LICENSE).
