import { useCallback } from 'react';
import { useJournalStore } from '../store/useJournalStore';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: number;
  tags?: string[];
  createdAt: number;
  media?: {
    type: 'image' | 'audio' | 'video';
    uri: string;
  }[];
}

export const useJournalEntries = () => {
  const entries = useJournalStore(state => state.entries);
  
  const getEntriesByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [entries]);

  const getEntriesByMonth = useCallback((month: number, year: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return getEntriesByDateRange(startDate, endDate);
  }, [getEntriesByDateRange]);

  const getEntriesByTag = useCallback((tag: string) => {
    return entries.filter(entry => entry.tags?.includes(tag));
  }, [entries]);

  const getEntriesByMoodRange = useCallback((minMood: number, maxMood: number) => {
    return entries.filter(entry => 
      entry.mood !== undefined && entry.mood >= minMood && entry.mood <= maxMood
    );
  }, [entries]);

  return {
    entries,
    getEntriesByDateRange,
    getEntriesByMonth,
    getEntriesByTag,
    getEntriesByMoodRange
  };
}; 