# Mowment - Privacy-First Journaling App

## Overview

Mowment is a privacy-focused journaling application that helps users track their moods, record journal entries in multiple formats (text, voice, and photos), and gain insights through AI-powered analysis. The app uses a combination of on-device storage and secure AI processing to ensure your personal data remains private.

## Features

### Elegant User Interface

Mowment offers a beautiful, thoughtfully designed user experience:

- **Premium Welcome Screen**: Featuring the app logo, elegant typography, and smooth gradients
- **Intuitive Navigation**: Seamless flow between screens with visual feedback
- **Consistent Design Language**: Warm color palette (#b58a65, #f9f6f2) and carefully chosen typography
- **Responsive Interactions**: Haptic feedback and smooth animations enhance the user experience
- **Adaptive Layouts**: Properly formatted for all iOS and Android devices

### Authentication & Security

The app implements a robust, user-friendly authentication system:

- **Email Verification Flow**: Users must verify their email address to access the app
- **Secure Account Creation**: Password strength validation and secure storage
- **Profile Management**: View and edit profile information with avatar support
- **Session Management**: Automatic login persistence with secure token storage
- **Account Recovery**: Password reset functionality for forgotten credentials
- **Secure Logout**: Complete session termination with proper state reset

### Modern Authentication UI

- **Stylish Login Screen**: Clean layout with icon-enhanced input fields and show/hide password toggle
- **Intuitive Signup Process**: Step-by-step account creation with visual guidance
- **Custom Date Selection**: Easy birthday selection with formatted date display
- **Form Validation**: Real-time feedback on input errors
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Accessibility Features**: Proper contrast ratios and touch target sizes

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
- **UI Components**: React Native Paper with custom styling
- **Authentication**: Firebase Authentication with email verification
- **Cloud Storage**: Firestore for user profiles
- **AI Processing**: OpenAI API (GPT-4 and Whisper)
- **Storage**: AsyncStorage + Expo FileSystem
- **UI Enhancements**: Linear gradients, custom animations, and haptic feedback

## Authentication & User Profiles

Mowment uses Firebase Authentication for secure user management:

- **Email/Password Authentication**: Create an account with your email and password
- **Email Verification**: Required step to access the app's features
- **User Profiles**: Profile information stored in Firestore with avatar support
- **Secure Storage**: User credentials are securely stored using expo-secure-store
- **Profile Management**: View and edit profile details in the Settings screen
- **Logout Functionality**: Securely terminate your session from the Settings screen
- **Session Persistence**: Stay logged in across app restarts
- **Protected Navigation**: App routes are protected based on authentication status

## User Interface Design

The app features a carefully crafted UI with attention to detail:

- **Typography**: PlayfairDisplay for headings and WorkSans for body text
- **Color Palette**: Warm neutrals with accent colors (#b58a65, #3d2f28)
- **Visual Effects**: Subtle gradients, shadows, and animations
- **Input Elements**: Custom styled text inputs with icon enhancement
- **Interactive Elements**: Haptic feedback on buttons and gestures
- **Layout Structure**: Clean, consistent spacing and alignment
- **Loading States**: Elegant loading indicators during asynchronous operations

## Environment Setup

To run this application, you need to set up environment variables:

1. Create a `.env` file in the root directory (based on `.env.example`)
2. Add your Firebase configuration variables:
   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   ```
3. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

Never commit your `.env` file to version control.

# Debugging Network Issues

If you encounter 'Network request failed' errors, try these steps:

1. Check your API key format - should match sk-proj-* format for newer OpenAI APIs
2. Verify network connectivity
3. Make sure you're using a real audio file for transcription
4. Check console logs for detailed error information

# Legal

Mowment™ is a trademark of Mohammad Muqtader Omari.
Source code © 2025 Mohammad Muqtader Omari – released under the MIT License (see LICENSE).
