import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function transcribeAudio(filePath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1'
  });

  return transcription.text;
}

export async function generateDocument(transcript: string, format = 'meeting notes'): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `Format the following transcript as ${format}` },
      { role: 'user', content: transcript }
    ]
  });

  return completion.choices[0].message.content ?? '';
}
