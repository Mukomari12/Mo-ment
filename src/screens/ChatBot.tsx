import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as NativeTextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface, Avatar, useTheme, IconButton, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useJournalStore } from '../store/useJournalStore';
import * as Haptics from 'expo-haptics';
import { OPENAI_API_KEY } from '@env';
import PaperSheet from '../components/PaperSheet';

type ChatBotScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatBot'>;
};

type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
};

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Get entries from the store
  const entries = useJournalStore(state => state.entries);
  
  // Get the 10 most recent entries
  const recentEntries = [...entries]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);
    
  // Function to generate personalized welcome message and question
  const generateInitialMessage = async () => {
    if (initialPromptSent || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Welcome message while we wait for the API
      setMessages([
        {
          id: '0',
          text: "Hi! I'm your Mo-ment companion. I'm looking through your recent journal entries to find something meaningful to discuss...",
          sender: 'bot',
          timestamp: Date.now()
        }
      ]);
      
      if (recentEntries.length === 0) {
        // If no entries, provide a generic welcome
        setMessages([
          {
            id: '0',
            text: "Hi! I'm your Mo-ment companion. I notice you haven't added any journal entries yet. How are you feeling today?",
            sender: 'bot',
            timestamp: Date.now()
          }
        ]);
        setIsLoading(false);
        setInitialPromptSent(true);
        return;
      }
      
      // Prepare entry data for the API
      const entryData = recentEntries.map(entry => ({
        content: entry.content,
        date: new Date(entry.createdAt).toLocaleDateString(),
        tags: entry.tags.join(', '),
        mood: entry.mood ? (typeof entry.mood === 'number' ? entry.mood : entry.mood.label) : 'unknown'
      }));
      
      // Create the prompt for the API
      const prompt = `
      You are Mo, a friendly and helpful journaling assistant in the Mo-ment journal app. 
      You have access to the user's 10 most recent journal entries.
      
      Here are the entries:
      ${JSON.stringify(entryData, null, 2)}
      
      Based on these entries, please:
      1. Identify one meaningful topic, emotion, or pattern from the entries
      2. Craft a personalized, empathetic greeting that acknowledges what you've noticed
      3. Ask ONE specific and thoughtful question to help the user reflect more deeply
      
      Your response should be conversational, warm, and specific to their entries.
      Keep your response under 150 words and focus on helping the user process their feelings.
      DON'T mention that you're an AI or that you've analyzed their entries.
      `;
      
      // Make the API request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are Mo, a warm and insightful journaling companion that helps people reflect more deeply on their experiences.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 250
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get a response from the AI');
      }
      
      const data = await response.json();
      const aiMessage = data.choices[0].message.content.trim();
      
      // Update the initial message
      setMessages([
        {
          id: '0',
          text: aiMessage,
          sender: 'bot',
          timestamp: Date.now()
        }
      ]);
      
      setInitialPromptSent(true);
    } catch (error) {
      console.error('Error generating initial message:', error);
      // Fallback message if the API fails
      setMessages([
        {
          id: '0',
          text: "Hi! I'm your Mo-ment companion. I'm here to chat about your journal entries and help you reflect. How are you feeling today?",
          sender: 'bot',
          timestamp: Date.now()
        }
      ]);
      setInitialPromptSent(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate the initial message on component mount
  useEffect(() => {
    generateInitialMessage();
  }, []);
  
  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Function to send user message and get AI response
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    // Add user message to the chat
    const userMessage: MessageType = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      // Combine the conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: message.trim()
      });
      
      // Create a system message with entry context
      const entryContext = recentEntries.length > 0 
        ? `Recent journal entries themes: ${recentEntries.slice(0, 3).map(e => e.content.substring(0, 50)).join(' | ')}`
        : 'No journal entries available.';
        
      // Make the API request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are Mo, a warm and insightful journaling companion in the Mo-ment app. 
              Your goal is to help the user reflect more deeply on their experiences and feelings.
              Be conversational, empathetic, and specific. Ask thoughtful follow-up questions to guide reflection.
              Keep responses relatively brief (under 150 words) and focused on one point at a time.
              
              ${entryContext}` 
            },
            ...conversationHistory
          ],
          temperature: 0.7,
          max_tokens: 250
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get a response from the AI');
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content.trim();
      
      // Add AI response to the chat
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add an error message
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Could you try again in a moment?",
        sender: 'bot',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render individual message bubbles
  const renderMessage = ({ item }: { item: MessageType }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageBubbleContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        {!isUser && (
          <Avatar.Icon 
            size={36} 
            icon="account-circle"
            style={{ backgroundColor: theme.colors.primary }} 
          />
        )}
        
        <Surface style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.botMessage,
          { 
            backgroundColor: isUser ? theme.colors.primary : theme.colors.surface,
            borderWidth: isUser ? 0 : 1,
            borderColor: isUser ? 'transparent' : '#E0E0E0',
          }
        ]}>
          <Text style={[
            styles.messageText,
            { 
              color: isUser ? 'white' : theme.colors.onSurface,
              fontFamily: 'WorkSans_400Regular'
            }
          ]}>
            {item.text}
          </Text>
        </Surface>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary, fontFamily: 'PlayfairDisplay_700Bold' }]}>
          Mo-ment Companion
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.mainContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          {messages.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Starting a new conversation...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Mo is thinking...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            style={styles.input}
            mode="outlined"
            disabled={isLoading}
            multiline
            dense
            outlineColor="#DDDDDD"
            activeOutlineColor={theme.colors.primary}
            right={
              <TextInput.Icon
                icon="send"
                onPress={sendMessage}
                disabled={!message.trim() || isLoading}
                forceTextInputFocus={false}
                color={() => message.trim() && !isLoading ? theme.colors.primary : '#CCCCCC'}
              />
            }
            onSubmitEditing={sendMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 18,
    elevation: 1,
    marginLeft: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    shadowColor: '#000',
  },
  userMessage: {
    borderTopRightRadius: 4,
    marginLeft: 0,
  },
  botMessage: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default ChatBotScreen; 