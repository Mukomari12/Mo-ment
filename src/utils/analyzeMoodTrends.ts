import { JournalEntry } from '../hooks/useJournalEntries';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export interface EmotionalState {
  name: string;
  score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  insights: string[];
}

export interface MoodAnalysis {
  summary: string;
  emotionalStates: EmotionalState[];
  recommendations: string[];
  periodLabel: string;
}

export const analyzeMoodTrends = async (
  entries: JournalEntry[],
  period: '7days' | '30days' | 'month'
): Promise<MoodAnalysis> => {
  try {
    if (entries.length === 0) {
      throw new Error('No entries to analyze');
    }

    // Format entries for OpenAI prompt
    const entriesText = entries.map(entry => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      return `Date: ${date}\nMood Score: ${entry.mood || 'N/A'}\nContent: ${entry.content}`;
    }).join('\n\n');

    // Generate prompt for analysis
    const prompt = `
    I have a set of journal entries over a period of time. Each entry includes the date, a mood score (1-10, where 10 is very positive), and the journal content. 
    Please analyze these entries to identify emotional states (like happiness, anxiety, sadness, etc.), their trends, and provide insights.

    Please respond in the following JSON format:
    {
      "summary": "A short paragraph summarizing overall emotional trends and patterns",
      "emotionalStates": [
        {
          "name": "emotional state name (e.g., happiness, anxiety, depression)",
          "score": "score from 1-10 representing the intensity",
          "trend": "increasing/decreasing/stable",
          "insights": ["2-3 specific insights about this emotional state from the entries"]
        }
      ],
      "recommendations": ["3-5 actionable recommendations based on the emotional trends"]
    }

    Here are the journal entries:

    ${entriesText}
    `;

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an expert in psychological analysis and emotional well-being." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const response = JSON.parse(responseText) as {
      summary: string;
      emotionalStates: EmotionalState[];
      recommendations: string[];
    };

    // Determine period label for display
    let periodLabel = '';
    if (period === '7days') {
      periodLabel = 'Past 7 Days';
    } else if (period === '30days') {
      periodLabel = 'Past 30 Days';
    } else if (period === 'month') {
      // Get month name from the most recent entry
      const latestEntry = entries.reduce((latest, entry) => 
        entry.createdAt > latest.createdAt ? entry : latest
      );
      const date = new Date(latestEntry.createdAt);
      periodLabel = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    return {
      ...response,
      periodLabel
    };
  } catch (error) {
    console.error('Error analyzing mood trends:', error);
    throw error;
  }
}; 