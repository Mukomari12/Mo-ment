/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { create } from 'zustand';
import { MonthlyReport, MoodAnalysis, EmotionTrend } from '../api/openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, writeBatch } from 'firebase/firestore';
import { auth, db, canPerformWrite, safeFirebaseOperation } from '../lib/firebase';

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
  
  // Sync entries with Firestore
  syncEntriesWithFirestore: (userId: string) => Promise<boolean>;
  syncMoodsWithFirestore: (userId: string) => Promise<boolean>;
  syncErasWithFirestore: (userId: string) => Promise<boolean>;
  loadDataFromFirestore: (userId: string) => Promise<boolean>;
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

// Create the store with persistence
export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      // Journal entries state
      entries: mockEntries,
      addEntry: (entry) => {
        const newEntry = {
            ...entry,
            id: Date.now().toString(),
            createdAt: Date.now(),
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        // Only back up text entries to Firestore
        if (newEntry.type === 'text' && auth.currentUser && canPerformWrite()) {
          const userId = auth.currentUser.uid;
          const entryDoc = doc(db, `users/${userId}/entries/${newEntry.id}`);
          safeFirebaseOperation(() => 
            setDoc(entryDoc, {
              id: newEntry.id,
              createdAt: newEntry.createdAt,
              type: newEntry.type,
              content: newEntry.content,
              tags: newEntry.tags || [],
              mood: newEntry.mood || null
            })
          );
        }
      },
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
      removeEntry: (id) => {
        set(state => ({
        entries: state.entries.filter(entry => entry.id !== id)
        }));
        
        // If user is authenticated, also delete from Firestore
        if (auth.currentUser && canPerformWrite()) {
          const userId = auth.currentUser.uid;
          const entryDoc = doc(db, `users/${userId}/entries/${id}`);
          safeFirebaseOperation(() => setDoc(entryDoc, { deleted: true }, { merge: true }));
        }
      },
      
      // Moods tracking over time
      moods: generateMockMoods(),
      
      // Settings state
      settings: {
        darkMode: false,
        language: 'en',
        reminders: false,
        reminderTime: '20:00',
        cloudBackup: true,
      },
      setSettings: (settings) => set(s => ({
        settings: {
          ...s.settings,
          ...settings
        }
      })),
      
      // Life Eras
      eras: [],
      setEras: (newEras) => {
        const formattedEras = newEras.map(era => ({
          ...era,
          generatedAt: Date.now(),
          isExpanded: false
        }));
        
        set(() => ({ eras: formattedEras }));
        
        // Sync eras to Firestore
        const state = get();
        if (auth.currentUser) {
          state.syncErasWithFirestore(auth.currentUser.uid);
        }
      },
      addEras: (newEras) => {
        const formattedEras = newEras.map(era => ({
            ...era,
            generatedAt: Date.now(),
            isExpanded: false
        }));
        
        set(state => ({ 
          eras: [...formattedEras, ...state.eras]
        }));
        
        // Sync eras to Firestore
        const state = get();
        if (auth.currentUser) {
          state.syncErasWithFirestore(auth.currentUser.uid);
        }
      },
      toggleEraExpanded: (eraIndex) => set(state => ({
        eras: state.eras.map((era, index) => 
          index === eraIndex ? { ...era, isExpanded: !era.isExpanded } : era
        )
      })),
      lastEraGeneration: 0,
      setLastEraGeneration: (timestamp) => set(() => ({ lastEraGeneration: timestamp })),
      
      // Monthly reports state
      monthlyReports: {},
      addMonthlyReport: (month, report) => set(state => ({
        monthlyReports: {
          ...state.monthlyReports,
          [month]: report
        }
      })),
      
      // Monthly mood analysis
      moodAnalysis: {},
      addMoodAnalysis: (month, analysis) => set(state => ({
        moodAnalysis: {
          ...state.moodAnalysis,
          [month]: analysis
        }
      })),
      
      // Analysis tracking
      monthlyAnalysisCount: 0,
      lastMonthlyAnalysisMonth: '',
      incrementMonthlyAnalysisCount: () => set(s => ({ monthlyAnalysisCount: s.monthlyAnalysisCount + 1 })),
      setLastMonthlyAnalysisMonth: (month) => set(() => ({ 
        lastMonthlyAnalysisMonth: month,
        // Reset counter if it's a new month
        monthlyAnalysisCount: get().lastMonthlyAnalysisMonth === month ? get().monthlyAnalysisCount : 0
      })),
      
      // Sync entries with Firestore
      syncEntriesWithFirestore: async (userId: string) => {
        if (auth.currentUser && userId) {
          try {
            // Get current entries from state
            const { entries } = get();
            
            // Only sync text entries to Firestore
            const textEntries = entries.filter(entry => entry.type === 'text');
            
            // Use batched writes for efficiency
            const batch = writeBatch(db);
            
            // Add each text entry to the batch
            textEntries.forEach((entry) => {
              const entryRef = doc(db, `users/${userId}/entries/${entry.id}`);
              batch.set(entryRef, entry);
            });
            
            // Commit the batch
            await batch.commit();
            
            // Update last synced timestamp
            set({ lastSynced: Date.now() });
            
            console.log('Successfully synced entries with Firestore');
            return true;
          } catch (error) {
            console.error('Error syncing entries with Firestore:', error);
            return false;
          }
        }
        return false;
      },
      
      // Sync moods with Firestore
      syncMoodsWithFirestore: async (userId: string) => {
        if (auth.currentUser && userId) {
          try {
            // Get current moods from store
            const { moods } = get();
            
            // Upload to Firestore
            await setDoc(doc(db, `users/${userId}/data`, 'moods'), { moods });
            console.log('Moods synced with Firestore');
            return true;
          } catch (error) {
            console.error('Error syncing moods with Firestore:', error);
            return false;
          }
        }
        return false;
      },
      
      // Sync eras with Firestore
      syncErasWithFirestore: async (userId: string) => {
        if (auth.currentUser && userId) {
          try {
            // Get current eras from store
            const { eras } = get();
            
            // Upload to Firestore
            await setDoc(doc(db, `users/${userId}/data`, 'eras'), { eras });
            console.log('Eras synced with Firestore');
            return true;
          } catch (error) {
            console.error('Error syncing eras with Firestore:', error);
            return false;
          }
        }
        return false;
      },
      
      // Load data from Firestore
      loadDataFromFirestore: async (userId: string) => {
        try {
          // Load text entries
          const entriesCollection = collection(db, `users/${userId}/entries`);
          const entriesSnapshot = await getDocs(entriesCollection);
          const cloudEntries: Entry[] = [];
          
          entriesSnapshot.forEach((doc) => {
            const entry = doc.data() as Entry;
            cloudEntries.push(entry);
          });
          
          // Load moods
          const moodsDoc = doc(db, `users/${userId}/data`, 'moods');
          const moodsSnapshot = await getDoc(moodsDoc);
          let cloudMoods: Emotion[] = [];
          
          if (moodsSnapshot.exists()) {
            cloudMoods = moodsSnapshot.data().moods as Emotion[];
          }
          
          // Load eras
          const erasDoc = doc(db, `users/${userId}/data`, 'eras');
          const erasSnapshot = await getDoc(erasDoc);
          let cloudEras: Era[] = [];
          
          if (erasSnapshot.exists()) {
            cloudEras = erasSnapshot.data().eras;
          }
          
          // Get current local data
          const currentEntries = get().entries;
          
          // Merge cloud and local data
          // Keep local media/voice entries, replace text entries with cloud version
          const localMediaEntries = currentEntries.filter(entry => entry.type !== 'text');
          const mergedEntries = [...cloudEntries, ...localMediaEntries];
          
          // Update store with cloud data
          set({
            entries: mergedEntries,
            moods: cloudMoods.length > 0 ? cloudMoods : get().moods,
            eras: cloudEras.length > 0 ? cloudEras : get().eras,
            lastSynced: Date.now()
          });
          
          console.log('Successfully loaded data from Firestore');
          return true;
        } catch (error) {
          console.error('Error loading data from Firestore:', error);
          return false;
        }
      },
      
      lastSynced: null,
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize sync from Firestore when auth state changes
auth.onAuthStateChanged((user) => {
  if (user && user.emailVerified) {
    const store = useJournalStore.getState();
    store.syncEntriesWithFirestore(user.uid);
    
    // Also set up listeners for future changes if needed
    // This is optional and depends on your app's requirements
  }
});

// Fix the selectors and helpers with proper function structure
export const selectEntries = (s: JournalState) => s.entries; 

// Fix the helper functions by using useJournalStore.getState() and useJournalStore.setState()
export const addMood = (mood: Emotion, userId?: string) => {
  const state = useJournalStore.getState();
  const newMoods = [...state.moods, mood];
  useJournalStore.setState({ moods: newMoods });
  
  // If userId is provided and cloud backup is enabled, sync moods
  if (userId && state.settings.cloudBackup) {
    state.syncMoodsWithFirestore(userId);
  }
};

// Fix the removeMood method to trigger sync
export const removeMood = (id: string, userId?: string) => {
  const state = useJournalStore.getState();
  const filteredMoods = state.moods.filter(mood => mood.label !== id);
  useJournalStore.setState({ moods: filteredMoods });
  
  // If userId is provided and cloud backup is enabled, sync moods
  if (userId && state.settings.cloudBackup) {
    state.syncMoodsWithFirestore(userId);
  }
};

// Fix the addEra method to trigger sync
export const addEra = (era: Era, userId?: string) => {
  const state = useJournalStore.getState();
  const newEras = [...state.eras, era];
  useJournalStore.setState({ eras: newEras });
  
  // If userId is provided and cloud backup is enabled, sync eras
  if (userId && state.settings.cloudBackup) {
    state.syncErasWithFirestore(userId);
  }
};

// Fix the removeEra method to trigger sync
export const removeEra = (id: string, userId?: string) => {
  const state = useJournalStore.getState();
  const filteredEras = state.eras.filter(era => era.id !== id);
  useJournalStore.setState({ eras: filteredEras });
  
  // If userId is provided and cloud backup is enabled, sync eras
  if (userId && state.settings.cloudBackup) {
    state.syncErasWithFirestore(userId);
  }
};

// Fix the updateEra method to trigger sync
export const updateEra = (id: string, updatedEra: Partial<Era>, userId?: string) => {
  const state = useJournalStore.getState();
  const updatedEras = state.eras.map(era => 
    era.id === id ? { ...era, ...updatedEra } : era
  );
  useJournalStore.setState({ eras: updatedEras });
  
  // If userId is provided and cloud backup is enabled, sync eras
  if (userId && state.settings.cloudBackup) {
    state.syncErasWithFirestore(userId);
  }
};

// Fix subscription to handle null correctly
useJournalStore.subscribe((state, prevState) => {
  const user = auth.currentUser;
  if (user && user.emailVerified) {
    const store = useJournalStore.getState();
    store.syncEntriesWithFirestore(user.uid);
  }
}); 