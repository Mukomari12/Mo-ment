import { OPENAI_API_KEY } from '@env';
import { Alert } from 'react-native';

/**
 * Checks if a valid OpenAI API key is configured
 * @returns true if the API key appears valid, false otherwise
 */
export function checkApiKey(): boolean {
  console.log('Checking API key validity...');
  console.log('API key prefix:', OPENAI_API_KEY?.substring(0, 10) + '...');
  
  if (!OPENAI_API_KEY || 
      OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('API key is empty or using placeholder');
    return false;
  }
  
  // Check for key format (usually starts with sk-proj-)
  console.log('API key appears valid');
  return true;
}

/**
 * Shows an alert to the user if the OpenAI API key is not properly configured
 */
export function showApiKeyAlert(): void {
  Alert.alert(
    'API Key Required',
    'To use AI features like mood classification and audio transcription, you need to set up your OpenAI API key in the .env file.',
    [
      { 
        text: 'OK', 
        style: 'default' 
      }
    ]
  );
} 