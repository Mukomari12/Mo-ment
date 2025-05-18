import { create } from 'zustand';
import { MonthlyReport, MoodAnalysis, EmotionTrend } from '../api/openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Emotion = {
  label: string;
  emoji: string;
};

export type Entry = {
  id: string;
  createdAt: number; // timestamp
  type: 'text' | 'voice' | 'media';
  content: string;
  mood?: Emotion;
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
  moods: { date: string; score: number }[];
  
  // User settings
  settings: {
    remindersOn: boolean;
    reminderTime: string;
    theme: 'light' | 'dark' | 'system';
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
}

// Demo entries for dev mode
const demoEntries: Entry[] = [
  {
    id: '1',
    type: 'text',
    content: 'Started using this journal app to track my daily mood and thoughts.',
    mood: 3,
    tags: ['Personal'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: '2',
    type: 'text',
    content: 'Had a great day at the park with friends. The weather was perfect!',
    mood: 4,
    tags: ['Friends', 'Outdoors'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
  {
    id: '3',
    type: 'text',
    content: 'Work was stressful today, but I managed to get through it.',
    mood: 2,
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
function generateMockMoods() {
  return Array.from({ length: 60 }).map((_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score: Math.random() * 10,
  }));
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

// Create the store with persistence
export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      // Journal entries state
      entries: mockEntries,
      addEntry: (entry) => set((state) => ({
        entries: [
          {
            ...entry,
            id: Date.now().toString(),
            createdAt: Date.now(),
          },
          ...state.entries,
        ],
      })),
      addVoiceEntry: (audioUri, transcript) => set(s => ({
        entries: [{
          id: Date.now().toString(),
          createdAt: Date.now(),
          type: 'voice',
          uri: audioUri,
          content: transcript,
          tags: [],
        }, ...s.entries]
      })),
      addMediaEntry: (photoUri, caption, mood, tags = []) => set(s => ({
        entries: [{
          id: Date.now().toString(),
          createdAt: Date.now(),
          type: 'media',
          uri: photoUri,
          content: caption,
          mood,
          tags
        }, ...s.entries]
      })),
      removeEntry: (id) => set(state => ({
        entries: state.entries.filter(entry => entry.id !== id)
      })),
      
      // Moods state
      moods: generateMockMoods(),
      
      // Settings state
      settings: {
        remindersOn: false,
        reminderTime: '20:00',
        theme: 'light'
      },
      setSettings: (newSettings) => set(s => ({
        settings: {
          ...s.settings,
          ...newSettings
        }
      })),
      
      // Life Eras state
      eras: [],
      setEras: (newEras) => set(() => ({ 
        eras: newEras.map(era => ({
          ...era,
          generatedAt: Date.now(),
          isExpanded: false
        }))
      })),
      addEras: (newEras) => set(state => ({ 
        eras: [
          ...newEras.map(era => ({
            ...era,
            generatedAt: Date.now(),
            isExpanded: false
          })),
          ...state.eras
        ] 
      })),
      toggleEraExpanded: (eraIndex) => set(state => ({
        eras: state.eras.map((era, index) => 
          index === eraIndex ? { ...era, isExpanded: !era.isExpanded } : era
        )
      })),
      lastEraGeneration: 0,
      setLastEraGeneration: (timestamp) => set(() => ({ lastEraGeneration: timestamp })),
      
      // Monthly reports state
      monthlyReports: {} as Record<string, MonthlyReport>,
      addMonthlyReport: (month, report) => set(state => ({
        monthlyReports: {
          ...state.monthlyReports,
          [month]: report
        }
      })),
      
      // Monthly mood analysis
      moodAnalysis: {} as Record<string, MoodAnalysis>,
      addMoodAnalysis: (month, analysis) => set(state => ({
        moodAnalysis: {
          ...state.moodAnalysis,
          [month]: analysis
        }
      })),
      
      // Monthly analysis tracking
      monthlyAnalysisCount: 0,
      lastMonthlyAnalysisMonth: '',
      incrementMonthlyAnalysisCount: () => set(s => ({ monthlyAnalysisCount: s.monthlyAnalysisCount + 1 })),
      setLastMonthlyAnalysisMonth: (month) => set(() => ({ 
        lastMonthlyAnalysisMonth: month,
        // Reset counter if it's a new month
        monthlyAnalysisCount: get().lastMonthlyAnalysisMonth === month ? get().monthlyAnalysisCount : 0
      })),
    }),
    {
      name: 'mowment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper selector
export const selectEntries = (s: JournalState) => s.entries; 