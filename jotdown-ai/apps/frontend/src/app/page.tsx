'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [audio, setAudio] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [document, setDocument] = useState('');

  const handleUpload = async () => {
    if (!audio) return;

    const form = new FormData();
    form.append('audio', audio);

    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, form);
    setTranscript(data.transcript);

    const summarizeRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/summarize`, {
      recordingId: data.id,
      format: 'meeting notes'
    });

    setDocument(summarizeRes.data.document);
  };

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold">🎙️ Voice Note to Document</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setAudio(e.target.files?.[0] || null)}
        className="block"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!audio}
      >
        Upload & Transcribe
      </button>

      {transcript && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Transcript</h2>
          <p className="text-sm whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {document && (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold">Structured Document</h2>
          <p className="text-sm whitespace-pre-wrap">{document}</p>
        </div>
      )}
    </div>
  );
}
