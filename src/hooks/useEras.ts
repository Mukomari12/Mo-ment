import { useEffect, useState } from 'react';
import { useJournalStore } from '../store/useJournalStore';
import { generateEras } from '../api/openai';

export const useEras = () => {
  const { entries, eras, setEras } = useJournalStore();
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recompute = async () => {
    if (entries.length < 3) {
      setError('Need at least 3 entries to generate eras');
      return;
    }

    try {
      setIsComputing(true);
      setError(null);
      
      const blobs = entries.map(e => ({
        date: new Date(e.createdAt).toISOString().split('T')[0],
        text: e.content.slice(0, 120),
      }));
      
      const result = await generateEras(blobs);
      setEras(result);
    } catch (e) {
      setError('Failed to generate eras: ' + (e instanceof Error ? e.message : String(e)));
      console.error('Era generation error:', e);
    } finally {
      setIsComputing(false);
    }
  };

  // Automatically recompute eras when entries change (debounced)
  useEffect(() => {
    if (entries.length >= 3) {
      const timer = setTimeout(() => {
        if (eras.length === 0) {
          recompute();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [entries.length]);

  return { eras, recompute, isComputing, error };
}; 