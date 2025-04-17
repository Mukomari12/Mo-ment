import { create } from 'zustand';

export type Entry = {
  id: string;
  type: 'text' | 'voice' | 'media';
  content: string;      // text or caption
  uri?: string;         // media local URI
  mood?: number;        // 1-5
  tags: string[];
  createdAt: number;
};

export type Era = {
  label: string;
  from: string; // ISO date
  to: string;   // ISO date
};

interface JournalState {
  entries: Entry[];
  addEntry: (e: Omit<Entry, 'id' | 'createdAt'>) => void;
  moods: { date: string; score: number }[];   // seeded mock data
  settings: { 
    remindersOn: boolean; 
    reminderTime: string; 
    theme: 'light' | 'dark' | 'system' 
  };
  setSettings: (p: Partial<JournalState['settings']>) => void;
  eras: Era[];
  setEras: (e: Era[]) => void;
}

// Mock data for entries
const mockEntries: Entry[] = [
  {
    id: '1',
    type: 'text',
    content: 'Today I took some time to think about my goals for the next few months. I want to focus more on building healthy habits and spending quality time with friends.',
    mood: 4,
    tags: ['Personal', 'Goals'],
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: '2',
    type: 'voice',
    content: 'Voice note about some project ideas I had while walking in the park.',
    mood: 5,
    tags: ['Ideas', 'Work'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: '3',
    type: 'media',
    content: 'Beautiful sunset at the beach today. The colors were amazing!',
    uri: 'https://picsum.photos/300/200',
    mood: 5,
    tags: ['Travel', 'Nature'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
  {
    id: '4',
    type: 'text',
    content: 'Feeling a bit stressed about the upcoming presentation. Need to prepare more slides and practice my delivery.',
    mood: 2,
    tags: ['Work', 'Stress'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
  },
  {
    id: '5',
    type: 'text',
    content: 'Had a great lunch with Sarah today. We talked about our travel plans for next summer. Thinking about visiting Italy or Greece.',
    mood: 4,
    tags: ['Friends', 'Travel'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
  },
];

// Mock data for mood tracking over 30 days
const generateMockMoods = () => {
  const moods: { date: string; score: number }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate a somewhat realistic pattern
    let baseScore = 3;
    
    // Weekends are generally happier
    if (date.getDay() === 0 || date.getDay() === 6) {
      baseScore += 1;
    }
    
    // Add some randomness
    const randomFactor = Math.random() * 2 - 1; // -1 to 1
    const score = Math.max(1, Math.min(5, Math.round(baseScore + randomFactor)));
    
    moods.push({ date: dateStr, score });
  }
  
  return moods;
};

export const useJournalStore = create<JournalState>((set) => ({
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
  moods: generateMockMoods(),
  settings: {
    remindersOn: true,
    reminderTime: '21:00',
    theme: 'system',
  },
  setSettings: (newSettings) => set((state) => ({
    settings: {
      ...state.settings,
      ...newSettings,
    },
  })),
  eras: [],
  setEras: (newEras) => set(() => ({
    eras: newEras,
  })),
})); 