import { OPENAI_KEY } from '@env';

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