'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [document, setDocument] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECORDING_SECONDS = 30;

  // Setup media recorder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          audioChunksRef.current = [];
        };

        setMediaRecorder(recorder);
      });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);

    try {
      const form = new FormData();
      form.append('audio', audioBlob, 'recording.webm');

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        form
      );

      setTranscript(data.transcript);

      const summarizeRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/summarize`, {
        recordingId: data.id,
        format: 'meeting notes',
      });

      setDocument(summarizeRes.data.document);
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <main className="p-10 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🎙️ Voice Note to Structured Doc</h1>

      {/* Recording Indicator */}
      {recording && (
        <div className="flex items-center space-x-3 text-red-600 font-semibold">
          <span className="h-3 w-3 rounded-full bg-red-600 animate-pulse"></span>
          <span>Recording... {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Transcribing Indicator */}
      {isTranscribing && (
        <div className="flex items-center space-x-2 text-blue-600 font-medium mt-4">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span>Transcribing and summarizing...</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-x-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Stop Recording
        </button>
        <button
          onClick={uploadRecording}
          disabled={!audioBlob || isTranscribing}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Upload & Transcribe
        </button>
      </div>

      {/* Transcript Output */}
      {transcript && (
        <div className="bg-gray-100 p-4 rounded mt-4">
          <h2 className="font-semibold text-lg">📝 Transcript</h2>
          <p className="whitespace-pre-wrap text-sm">{transcript}</p>
        </div>
      )}

      {/* Structured Document Output */}
      {document && (
        <div className="bg-green-100 p-4 rounded mt-4">
          <h2 className="font-semibold text-lg">📄 Structured Document</h2>
          <p className="whitespace-pre-wrap text-sm">{document}</p>
        </div>
      )}
    </main>
  );
}
