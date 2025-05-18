/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { create } from 'zustand';
import { MonthlyReport, MoodAnalysis, EmotionTrend } from '../api/openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import NetInfo from '@react-native-community/netinfo';

export type Emotion = {
  label: string;
  emoji: string;
  date?: string;
  score?: number;
};

export type Entry = {
  id: string;
  createdAt: number; // timestamp
  type: 'text' | 'voice' | 'media';
  content: string;
  mood?: Emotion;
  emotion?: Emotion;
  uri?: string; // For voice or media entries
  tags: string[];
};

export type Era = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  generatedAt: number;
  isExpanded: boolean;
};

// Define the storage structure for our Zustand store
interface JournalState {
  // Journal entries
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => void;
  addVoiceEntry: (audioUri: string, transcript: string) => void;
  addMediaEntry: (photoUri: string, caption: string, mood?: Emotion, tags?: string[]) => void;
  removeEntry: (id: string) => void;
  
  // Moods tracking over time
  moods: Emotion[];
  
  // User settings
  settings: {
    darkMode: boolean;
    language: string;
    reminders: boolean;
    reminderTime: string;
    cloudBackup: boolean;
  };
  setSettings: (settings: Partial<JournalState['settings']>) => void;
  
  // Life Eras
  eras: Era[];
  setEras: (newEras: Omit<Era, 'generatedAt' | 'isExpanded'>[]) => void;
  addEras: (newEras: Omit<Era, 'generatedAt' | 'isExpanded'>[]) => void;
  toggleEraExpanded: (eraIndex: number) => void;
  lastEraGeneration: number; // Timestamp of last era generation
  setLastEraGeneration: (timestamp: number) => void;
  
  // Monthly reports and analysis
  monthlyReports: Record<string, MonthlyReport>;
  addMonthlyReport: (month: string, report: MonthlyReport) => void;
  
  // Monthly mood analysis
  moodAnalysis: Record<string, MoodAnalysis>;
  addMoodAnalysis: (month: string, analysis: MoodAnalysis) => void;
  
  // Tracking for monthly analysis
  monthlyAnalysisCount: number;
  lastMonthlyAnalysisMonth: string; // Format: "YYYY-MM"
  incrementMonthlyAnalysisCount: () => void;
  setLastMonthlyAnalysisMonth: (month: string) => void;
  
  lastSynced: number | null;
}

// Demo entries for dev mode
const demoEntries: Entry[] = [
  {
    id: '1',
    type: 'text',
    content: 'Started using this journal app to track my daily mood and thoughts.',
    mood: { label: 'Happy', emoji: '😊' },
    tags: ['Personal'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: '2',
    type: 'text',
    content: 'Had a great day at the park with friends. The weather was perfect!',
    mood: { label: 'Excited', emoji: '🤩' },
    tags: ['Friends', 'Outdoors'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
  {
    id: '3',
    type: 'text',
    content: 'Work was stressful today, but I managed to get through it.',
    mood: { label: 'Stressed', emoji: '😓' },
    tags: ['Work', 'Stress'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

// Define mock data for initial state
const mockEntries: Entry[] = [
  {
    id: '1',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    type: 'text',
    content: 'Today was such a great day! I finally finished that project at work and my boss was really impressed.',
    tags: ['work', 'success']
  },
  {
    id: '2',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    type: 'text',
    content: 'Feeling a bit anxious about the upcoming presentation, but I know I\'ll be prepared.',
    tags: ['work', 'stress']
  },
  {
    id: '3',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
    type: 'text',
    content: 'Had dinner with Sarah and Mike tonight. We laughed so much!',
    tags: ['friends', 'social']
  },
  {
    id: '4',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
    type: 'text',
    content: 'Spent the whole day reading that new book. I couldn\'t put it down!',
    tags: ['reading', 'relaxation']
  },
  {
    id: '5',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    type: 'text',
    content: 'Got some disappointing news today. Need to figure out a plan B.',
    tags: ['challenges']
  },
  {
    id: '6',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12, // 12 days ago
    type: 'text',
    content: 'First day at the new gym. The trainer was tough but I feel great!',
    tags: ['fitness', 'health']
  },
  {
    id: '7',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
    type: 'text',
    content: 'Had a minor argument with Sam. Need to work on our communication.',
    tags: ['relationships']
  },
  {
    id: '8',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 16, // 16 days ago
    type: 'text',
    content: 'Went hiking at Mt. Rainier. The views were absolutely breathtaking!',
    tags: ['nature', 'adventure']
  },
  {
    id: '9',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17, // 17 days ago
    type: 'text',
    content: 'Learned how to make pasta from scratch today. It was messy but fun!',
    tags: ['cooking', 'learning']
  },
  {
    id: '10',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20, // 20 days ago
    type: 'text',
    content: 'Feeling grateful for all the support I\'ve been getting lately.',
    tags: ['gratitude', 'reflection']
  }
];

// Helper function to generate mock mood data
function generateMockMoods(): Emotion[] {
  const defaultMoods: Emotion[] = [
    { date: new Date().toISOString().split('T')[0], score: 3, label: 'Neutral', emoji: '😐' },
    // Add more default moods as needed
  ];
  return defaultMoods;
}

// Mock monthly report
const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
const mockMonthlyReport: MonthlyReport = {
  month: currentMonth,
  topTriggers: [
    {
      emotion: 'anxious',
      phrases: ['upcoming presentation', 'deadlines', 'work pressure']
    },
    {
      emotion: 'happy',
      phrases: ['spending time with friends', 'travel plans', 'personal goals']
    }
  ],
  summary: 'This month showed a mix of work-related stress and enjoyable social activities. While work deadlines created anxiety, focusing on future travel and connecting with friends provided balance and positive energy.'
};

// Global limits for monthly analysis
export const globalLimits = {
  monthlyAnalysisMax: 3, // Maximum number of monthly analyses per month
  monthlyAnalysis: {
    count: 0
  }
};

// Create and export the Zustand store
const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: demoEntries,
      moods: generateMockMoods(),
      settings: {
        darkMode: false,
        language: 'en',
        reminders: true,
        reminderTime: '20:00',
        cloudBackup: false,
      },
      eras: [],
      lastEraGeneration: 0,
      monthlyReports: { [currentMonth]: mockMonthlyReport },
      moodAnalysis: {},
      monthlyAnalysisCount: 0,
      lastMonthlyAnalysisMonth: '',
      lastSynced: null,

      // Methods for entries
      addEntry: (entry) => {
        const id = Date.now().toString();
        const newEntry = { ...entry, id, createdAt: Date.now() };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
      },
      
      addVoiceEntry: (audioUri, transcript) => {
        const id = Date.now().toString();
        const newEntry = { 
          id, 
          createdAt: Date.now(),
          type: 'voice' as const,
          content: transcript,
          uri: audioUri,
          tags: ['voice']
        };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
      },
      
      addMediaEntry: (photoUri, caption, mood, tags = []) => {
        const id = Date.now().toString();
        const newEntry = { 
          id, 
          createdAt: Date.now(),
          type: 'media' as const,
          content: caption,
          uri: photoUri,
          mood,
          tags: [...tags, 'photo']
        };
        set((state) => ({ entries: [newEntry, ...state.entries] }));
      },
      
      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id)
        }));
      },
      
      // Methods for settings
      setSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      // Methods for life eras
      setEras: (newEras) => {
        const erasWithMetadata = newEras.map(era => ({
          ...era,
          generatedAt: Date.now(),
          isExpanded: false
        }));
        set({ eras: erasWithMetadata });
      },
      
      addEras: (newEras) => {
        const erasWithMetadata = newEras.map(era => ({
          ...era,
          generatedAt: Date.now(),
          isExpanded: false
        }));
        set((state) => ({ 
          eras: [...state.eras, ...erasWithMetadata] 
        }));
      },
      
      toggleEraExpanded: (eraIndex) => {
        set((state) => {
          const updatedEras = [...state.eras];
          if (updatedEras[eraIndex]) {
            updatedEras[eraIndex] = {
              ...updatedEras[eraIndex],
              isExpanded: !updatedEras[eraIndex].isExpanded
            };
          }
          return { eras: updatedEras };
        });
      },
      
      setLastEraGeneration: (timestamp) => {
        set({ lastEraGeneration: timestamp });
      },
      
      // Methods for monthly reports
      addMonthlyReport: (month, report) => {
        set((state) => ({
          monthlyReports: { ...state.monthlyReports, [month]: report }
        }));
      },
      
      // Methods for mood analysis
      addMoodAnalysis: (month, analysis) => {
        set((state) => ({
          moodAnalysis: { ...state.moodAnalysis, [month]: analysis }
        }));
      },
      
      // Methods for tracking monthly analysis
      incrementMonthlyAnalysisCount: () => {
        set((state) => ({
          monthlyAnalysisCount: state.monthlyAnalysisCount + 1
        }));
      },
      
      setLastMonthlyAnalysisMonth: (month) => {
        set({ lastMonthlyAnalysisMonth: month });
      },
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useJournalStore; 