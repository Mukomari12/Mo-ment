import { OPENAI_KEY } from '@env';
import { Entry } from '../store/useJournalStore';

const BASE = 'https://api.openai.com/v1';

export async function transcribe(uri: string) {
  const form = new FormData();
  form.append('file', {
    uri,
    name: 'voice.m4a',
    type: 'audio/m4a',
  } as any);
  form.append('model', 'whisper-1');

  const r = await fetch(`${BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: form,
  });
  const j = await r.json();
  return j.text as string;
}

export async function classifyMood(text: string): Promise<1|2|3|4|5> {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Output ONLY a single integer 1‑5 (1=very negative, 5=very positive).' },
      { role: 'user', content: text.slice(0, 4000) }
    ],
    max_tokens: 1,
  };
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return parseInt(j.choices[0].message.content.trim(), 10) as 1|2|3|4|5;
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
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return JSON.parse(j.choices[0].message.content.trim());
}

export async function generateEras(entryBlobs: { date: string, text: string }[]) {
  const prompt = `
Given the chronological journal excerpts below, segment them into 2‑6 meaningful "life eras".
Return JSON array where each item = { "label": string, "from": ISOdate, "to": ISOdate }.
### Entries ###
${entryBlobs.map(e => `${e.date}: ${e.text}`).join('\n')}
`;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an insightful autobiographical analyst.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4,
    max_tokens: 256,
  };
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return JSON.parse(j.choices[0].message.content);
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
      Authorization: `Bearer ${OPENAI_KEY}`
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