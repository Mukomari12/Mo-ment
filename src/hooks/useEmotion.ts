import { useState } from 'react';
import { Entry, useJournalStore } from '../store/useJournalStore';
import { classifyEmotion, classifyMood } from '../api/openai';

export const useEmotion = () => {
  const addEntry = useJournalStore(s => s.addEntry);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (content: string, base: Omit<Entry, 'id' | 'createdAt' | 'emotion' | 'mood'>) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Analyze the content with both classifiers
      let emotion = undefined;
      let mood = undefined;
      
      try {
        emotion = await classifyEmotion(content);
        mood = await classifyMood(content);
      } catch (err) {
        console.error('Analysis error:', err);
        setError('AI service unavailable; saved without emotion/mood');
      }
      
      // Save the entry with the analysis results
      addEntry({ ...base, content, emotion, mood });
      
      return { success: true, emotion, mood };
    } catch (err) {
      const errorMessage = 'Error analyzing entry: ' + (err instanceof Error ? err.message : String(err));
      console.error(errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return { analyze, isAnalyzing, error };
}; 