import { OPENAI_API_KEY } from '@env';
import { Entry } from '../store/useJournalStore';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const BASE = 'https://api.openai.com/v1';

// Function to extract text from images using OpenAI's vision capabilities
export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    console.log('Starting image text extraction, API key length:', OPENAI_API_KEY?.length || 0);
    console.log('API key prefix:', OPENAI_API_KEY?.substring(0, 10) + '...');
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    console.log('Image URI:', imageUri);
    
    // Check if file exists
    if (imageUri.startsWith('file://')) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        console.log('File exists:', fileInfo.exists, 'File size:', fileInfo.exists ? fileInfo.size || 'unknown' : 'N/A');
        
        if (!fileInfo.exists) {
          throw new Error('Image file does not exist at path: ' + imageUri);
        }
      } catch (error: any) {
        console.error('File system error:', error);
        throw new Error('Failed to access image file: ' + (error?.message || String(error)));
      }
    }
    
    // Convert image to base64
    let base64Image;
    try {
      base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('Image converted to base64, length:', base64Image.length);
    } catch (error: any) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64: ' + (error?.message || String(error)));
    }
    
    // Prepare request to GPT-4 Vision
    const body = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text visible in this image. Return only the extracted text, nothing else. If there's no visible text, respond with 'No text found in image.'"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };
    
    console.log('Sending image text extraction request to OpenAI...');
    
    // For debugging - add a timeout to the fetch request
    const timeoutDuration = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!r.ok) {
        const errorData = await r.json().catch(e => ({ error: 'Could not parse error response' }));
        console.error('Text extraction error response:', JSON.stringify(errorData));
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      const j = await r.json();
      const extractedText = j.choices[0].message.content.trim();
      console.log('Text extraction successful, length:', extractedText.length);
      return extractedText === 'No text found in image.' ? '' : extractedText;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('Request timed out after', timeoutDuration, 'ms');
        throw new Error('Request timed out. Network may be slow or unreliable.');
      }
      console.error('Fetch error details:', error);
      throw error;
    }
  } catch (error) {
    console.error('Image text extraction error:', error);
    throw error;
  }
}

export async function transcribe(uri: string) {
  try {
    console.log('Starting transcription, API key length:', OPENAI_API_KEY?.length || 0);
    console.log('API key prefix:', OPENAI_API_KEY?.substring(0, 10) + '...');
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    console.log('Audio URI:', uri);
    
    // Handle file URI for simulator and real device
    let fileUri = uri;
    if (Platform.OS === 'ios' && uri.startsWith('file://')) {
      console.log('iOS platform detected, using improved file handling');
      
      try {
        // Check if file exists and get its info
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File exists:', fileInfo.exists, 'File size:', fileInfo.exists ? fileInfo.size || 'unknown' : 'N/A');
        
        if (!fileInfo.exists) {
          throw new Error('Audio file does not exist at path: ' + uri);
        }
      } catch (error: any) {
        console.error('File system error:', error);
        throw new Error('Failed to access audio file: ' + (error?.message || String(error)));
      }
    }
    
    // Create form data with file
    const form = new FormData();
    form.append('file', {
      uri: fileUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);
    form.append('model', 'whisper-1');
    
    console.log('Sending transcription request to OpenAI...');
    
    // For debugging - add a timeout to the fetch request
    const timeoutDuration = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    try {
      const r = await fetch(`${BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          // Add content type explicitly for debugging
          'Accept': 'application/json',
        },
        body: form,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!r.ok) {
        const errorData = await r.json().catch(e => ({ error: 'Could not parse error response' }));
        console.error('Transcription error response:', JSON.stringify(errorData));
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      const j = await r.json();
      console.log('Transcription successful');
      return j.text as string;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('Request timed out after', timeoutDuration, 'ms');
        throw new Error('Request timed out. Network may be slow or unreliable.');
      }
      console.error('Fetch error details:', error);
      throw error;
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

export async function classifyMood(text: string): Promise<1|2|3|4|5> {
  try {
    console.log('Starting mood classification, API key length:', OPENAI_API_KEY?.length || 0);
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Output ONLY a single integer 1‑5 (1=very negative, 5=very positive).' },
        { role: 'user', content: text.slice(0, 4000) }
      ],
      max_tokens: 1,
    };
    
    console.log('Sending mood classification request to OpenAI...');
    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!r.ok) {
      const errorData = await r.json();
      console.error('Mood classification error response:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const j = await r.json();
    console.log('Mood classification successful:', j.choices[0].message.content);
    return parseInt(j.choices[0].message.content.trim(), 10) as 1|2|3|4|5;
  } catch (error) {
    console.error('Mood classification error:', error);
    throw error;
  }
}

export async function classifyEmotion(text: string): Promise<{label: string; emoji: string}> {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Return JSON: {"label":"one word emotion","emoji":"emoji"}' },
      { role: 'user', content: `Text:\n${text.slice(0, 4000)}` }
    ],
    max_tokens: 20,
    temperature: 0.3,
  };
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return JSON.parse(j.choices[0].message.content.trim());
}

export async function generateEras(entryBlobs: { id: string, date: string, text: string }[]) {
  try {
    console.log('Starting life eras generation, API key length:', OPENAI_API_KEY?.length || 0);
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    // Ensure we have enough entries to generate meaningful eras
    if (entryBlobs.length < 10) {
      throw new Error('At least 10 journal entries are required to generate life eras.');
    }
    
    const prompt = `
Based on the chronological journal excerpts below, create 8-12 memorable "life eras" that sound fun, trendy, and extremely relatable for a Gen Z audience. 
Make sure to include a mix of both positive and challenging periods, with creative interpretations that might not be obvious from the entries.

Each era should have:
1. A catchy, creative name that reflects the emotional vibe of that period. Examples:
   - "Main Character Era" - when you're living your best life as the protagonist
   - "Villain Era" - when you're embracing your dark side or setting boundaries
   - "Healing Era" - recovering from something difficult
   - "Baddie Era" - peak confidence and self-assurance
   - "Slay Era" - when everything is working out perfectly
   - "Self-Discovery Era" - finding your authentic self
   - "Spiraling Era" - when things feel chaotic and out of control
   - "Hot Mess Era" - embracing the beautiful disaster energy
   - "Cosmic Glow-Up Era" - transformation and positive change
   - "Chronically Online Era" - extremely online, for better or worse
   - "Main Pop Girl Era" - feeling like everyone's favorite person
   - "Delulu Era" - manifesting unrealistic dreams that somehow work out
   - "Rizz Era" - peak charisma and charm, making connections effortlessly
   - "Quiet Luxury Era" - subtle elegance and mindfulness
   - "Soft Life Era" - prioritizing peace and comfort
   - "Plot Twist Era" - unexpected changes and redirections
   - "Fitness Girlies Era" - health and wellness focused period
   - "Dopamine Dressing Era" - using fashion to boost mood
   - "Burnout Era" - pushing too hard and hitting a wall
   - "Renaissance Era" - a period of creative rebirth
   - "Situationship Era" - complex, undefined relationships
   - "Revenge Body Era" - working on yourself after a setback
   - "Goblin Mode Era" - embracing chaos and dropping social norms

2. A short, witty description (1-3 sentences) with current slang that captures the essence of this period. Make it sound like something that would go viral on TikTok.

3. Date ranges in ISO format (YYYY-MM-DD)

Create *at least* 8 different eras, ensuring they're diverse in tone and covering different aspects of life.

Return valid JSON array where each item = { "label": string, "description": string, "from": ISOdate, "to": ISOdate }.
Example: 
[
  {
    "label": "Healing Era",
    "description": "Giving main character energy while leaving the drama in the past. The vibes were immaculate and the peace was non-negotiable.",
    "from": "2023-01-01",
    "to": "2023-03-15"
  },
  {
    "label": "Baddie Era",
    "description": "Living your best life without apologies. No thoughts, just vibes and serving looks that ate every single time.",
    "from": "2023-03-16",
    "to": "2023-06-30"
  }
]

### Entries ###
${entryBlobs.map(e => `${e.date}: ${e.text}`).join('\n')}
`;

    const body = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a Gen Z trend expert and social media content creator who specializes in creating viral, catchy life era labels from journal entries. Your tone is confident, expressive, and uses current internet slang and expressions. Be creative, hyper-relatable, and just the right amount of dramatic - make each era sound like something people would proudly put in their TikTok bio. You excel at finding patterns and creating meaningful story arcs from seemingly disconnected events.' },
        { role: 'user', content: prompt }
      ],
      temperature: 1.0,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    };
    
    console.log('Sending eras generation request to OpenAI...');
    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!r.ok) {
      const errorData = await r.json().catch(e => ({ error: 'Could not parse error response' }));
      console.error('Life eras generation error response:', JSON.stringify(errorData));
      throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }
    
    const j = await r.json();
    const content = j.choices[0].message.content.trim();
    console.log('Received eras response:', content.substring(0, 100) + '...');
    
    // Parse the JSON response carefully
    try {
      // Check if the content is wrapped in a "data" or "eras" field (from response_format: json_object)
      const parsed = JSON.parse(content);
      let eras;
      
      if (Array.isArray(parsed)) {
        eras = parsed;
      } else if (parsed.eras && Array.isArray(parsed.eras)) {
        eras = parsed.eras;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        eras = parsed.data;
      } else {
        // Create default era if we can't parse the proper format
        console.log('Response was not in expected format, creating fallback eras');
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        eras = [
          {
            label: "Main Character Era",
            description: "Living life like you're the protagonist in your own movie. Unapologetically focused on your journey.",
            from: sixMonthsAgo.toISOString().split('T')[0],
            to: now.toISOString().split('T')[0]
          }
        ];
      }
      
      // Add entry IDs for each era
      return eras.map((era: { label: string; description: string; from: string; to: string }) => {
        // Find entries that fall within this era's date range
        const eraEntryIds = entryBlobs
          .filter(entry => {
            const entryDate = entry.date;
            return entryDate >= era.from && entryDate <= era.to;
          })
          .map(entry => entry.id);
        
        return {
          ...era,
          entryIds: eraEntryIds,
          isExpanded: false,
          generatedAt: Date.now()
        };
      });
    } catch (parseError) {
      console.error('Error parsing life eras response:', parseError);
      throw new Error('Failed to parse life eras. The AI provided an invalid response format.');
    }
  } catch (error) {
    console.error('Life eras generation error:', error);
    throw error;
  }
}

export type MonthlyReport = {
  month: string; // "2025-04"
  topTriggers: { emotion: 'happy' | 'anxious'; phrases: string[] }[];
  summary: string; // ≤ 120 words
};

export async function generateMonthlyReport(month: string, entries: Entry[]): Promise<MonthlyReport> {
  // Filter entries for the specific month
  const monthlyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt).toISOString().split('T')[0].substring(0, 7); // YYYY-MM
    return entryDate === month;
  });
  
  if (monthlyEntries.length === 0) {
    return {
      month,
      topTriggers: [
        { emotion: 'anxious', phrases: [] },
        { emotion: 'happy', phrases: [] }
      ],
      summary: 'No entries found for this month.'
    };
  }
  
  const formatDate = (timestamp: number) => new Date(timestamp).toISOString().split('T')[0];
  
  const prompt = `
Given these journal entries from ${month}, list:
1. top 3 recurring "anxious" triggers
2. top 3 "happy" factors
3. a concise 100-word overall summary
Return JSON:
{ "topTriggers":[{"emotion":"anxious","phrases":[...]},{"emotion":"happy","phrases":[...]}],
  "summary":"..." }
### Entries ###
${monthlyEntries
  .map(e => `${formatDate(e.createdAt)} ${e.emotion?.label || ''}: ${e.content.slice(0, 200)}`)
  .join('\n')
}
`;

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a mental-health journaling coach.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 512,
  };
  
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body),
  });
  
  const j = await r.json();
  const report = JSON.parse(j.choices[0].message.content.trim());
  
  return {
    month,
    topTriggers: report.topTriggers,
    summary: report.summary
  };
}

// Function to generate a description of an image when OCR finds no text
export async function describeImage(imageUri: string): Promise<{description: string, question: string}> {
  try {
    console.log('Starting image description, API key length:', OPENAI_API_KEY?.length || 0);
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    // Convert image to base64
    let base64Image;
    try {
      base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('Image converted to base64, length:', base64Image.length);
    } catch (error: any) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64: ' + (error?.message || String(error)));
    }
    
    // Prepare request to GPT-4 Vision
    const body = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe what's in this image very concisely in 1-2 sentences. Then, on a new line, ask a reflective question about how this image relates to the user's feelings or thoughts. Format as JSON: {\"description\": \"...\", \"question\": \"...\"}"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };
    
    console.log('Sending image description request to OpenAI...');
    
    const timeoutDuration = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
    
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!r.ok) {
        const errorData = await r.json().catch(e => ({ error: 'Could not parse error response' }));
        console.error('Image description error response:', JSON.stringify(errorData));
        throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
      }
      
      const j = await r.json();
      const content = j.choices[0].message.content.trim();
      
      // Parse the JSON response or handle plain text
      try {
        const parsed = JSON.parse(content);
        return {
          description: parsed.description || "An image captured in your journal.",
          question: parsed.question || "How does this image make you feel?"
        };
      } catch (parseError) {
        // If not valid JSON, try to extract description and question from text
        const lines = content.split('\n').filter((line: string) => line.trim());
        return {
          description: lines[0] || "An image captured in your journal.",
          question: lines[1] || "How does this image make you feel?"
        };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('Request timed out after', timeoutDuration, 'ms');
        throw new Error('Request timed out. Network may be slow or unreliable.');
      }
      console.error('Fetch error details:', error);
      throw error;
    }
  } catch (error) {
    console.error('Image description error:', error);
    throw error;
  }
}

export type EmotionTrend = {
  emotion: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  score: number; // 0-100 intensity
  triggers: string[]; // phrases that trigger this emotion
};

export type MoodAnalysis = {
  emotions: EmotionTrend[];
  summary: string;
  insights: string;
  recommendations: string[];
};

export async function analyzeMoodTrends(entries: Entry[]): Promise<MoodAnalysis> {
  try {
    console.log('Starting mood trend analysis, API key length:', OPENAI_API_KEY?.length || 0);
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please set your API key in the .env file.');
    }
    
    if (entries.length === 0) {
      return {
        emotions: [],
        summary: "No entries available for analysis.",
        insights: "Add journal entries to see your mood analysis.",
        recommendations: ["Start journaling to track your emotional patterns."]
      };
    }
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);
    
    // Extract content, dates, and moods
    const entriesData = sortedEntries.map(entry => ({
      date: new Date(entry.createdAt).toISOString().split('T')[0],
      content: entry.content,
      mood: entry.mood,
      type: entry.type,
      emotion: entry.emotion?.label
    }));
    
    const prompt = `Analyze these journal entries chronologically to identify emotional trends and patterns.
    
ENTRIES:
${JSON.stringify(entriesData, null, 2)}

Your task is to:
1. Identify the top 3-5 emotions present (happiness, anxiety, depression, excitement, contentment, stress, etc.)
2. For each emotion, determine if it's increasing, decreasing, or stable over time
3. Score each emotion from 0-100 based on intensity in the entries
4. Identify key phrases or topics that trigger each emotion
5. Provide a summary of overall emotional state and changes over time
6. Deliver 1-3 helpful insights about emotional patterns
7. Suggest 2-3 actionable recommendations based on the analysis

Return ONLY a JSON object with this structure:
{
  "emotions": [
    {
      "emotion": "string",
      "trend": "increasing|decreasing|stable",
      "score": number,
      "triggers": ["phrase1", "phrase2"]
    }
  ],
  "summary": "paragraph summary of emotional state",
  "insights": "key insights about patterns",
  "recommendations": ["recommendation1", "recommendation2"]
}`;

    const body = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an emotional analysis AI that helps people understand their mood patterns.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    };
    
    console.log('Sending mood analysis request to OpenAI...');
    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!r.ok) {
      const errorData = await r.json();
      console.error('Mood analysis error response:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const j = await r.json();
    console.log('Mood analysis successful');
    
    // Parse the response
    try {
      const content = j.choices[0].message.content.trim();
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const analysis = JSON.parse(jsonStr) as MoodAnalysis;
      
      return analysis;
    } catch (parseError) {
      console.error('Error parsing mood analysis response:', parseError);
      throw new Error('Failed to parse mood analysis response');
    }
  } catch (error) {
    console.error('Mood analysis error:', error);
    throw error;
  }
} 