import React, { useState, useEffect } from 'react';
import { Volume2, Loader2, VolumeX } from 'lucide-react';

interface AudioButtonProps {
  text: string;
  size?: number;
  className?: string;
  dark?: boolean;
}

const AudioButton: React.FC<AudioButtonProps> = ({ text, size = 24, className = '', dark = false }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'error') {
      timer = setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [status]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'loading' || status === 'playing') return;

    if (!('speechSynthesis' in window)) {
      setStatus('error');
      setErrorMessage('Audio not supported');
      return;
    }

    if (text.length > 500) {
      setStatus('error');
      setErrorMessage('Text too long');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';

      // Intelligent Voice Selection Logic
      const voices = window.speechSynthesis.getVoices();
      const koreanVoices = voices.filter(v => v.lang.includes('ko') || v.lang.includes('KO'));

      // Priority: Google -> Microsoft Online -> Any Korean -> Default
      const preferredVoice = koreanVoices.find(v => v.name.includes('Google')) ||
        koreanVoices.find(v => v.name.includes('Microsoft') && v.name.includes('Online')) ||
        koreanVoices.find(v => v.name.includes('Microsoft')) ||
        koreanVoices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        // Adjust rate based on voice type for naturalness
        if (preferredVoice.name.includes('Google')) {
          utterance.rate = 1.0; // Google voices are usually well-paced
        } else {
          utterance.rate = 0.9; // System voices can be fast
        }
      } else {
        utterance.rate = 0.9;
      }

      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setStatus('playing');
      };

      utterance.onend = () => {
        setStatus('idle');
      };

      utterance.onerror = (e) => {
        console.error("Speech Synthesis Error", e);
        setStatus('error');
        setErrorMessage('Playback failed');
      };

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error("Failed to play audio", error);
      setStatus('error');
      setErrorMessage('Playback failed');
    }
  };

  const iconClass = dark ? 'text-white' : 'text-slate-500 hover:text-indigo-600';
  const activeClass = status === 'playing' ? (dark ? 'text-indigo-200 animate-pulse' : 'text-indigo-600 animate-pulse') : '';
  const loadingClass = dark ? 'text-indigo-200' : 'text-indigo-600';
  const errorClass = 'text-rose-500';

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Error Toast - Absolute positioned relative to container */}
      {status === 'error' && (
        <div className="absolute bottom-full mb-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50">
          {errorMessage}
          {/* Triangle pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-500"></div>
        </div>
      )}

      <button
        onClick={handlePlay}
        disabled={status === 'loading'}
        className={`rounded-full p-2 transition-all hover:bg-black/5 active:scale-95 flex items-center justify-center ${className}`}
        aria-label={status === 'error' ? errorMessage : `Play pronunciation for ${text}`}
        title="Listen to pronunciation"
      >
        {status === 'loading' ? (
          <Loader2 className={`animate-spin ${loadingClass}`} size={size} />
        ) : status === 'playing' ? (
          <Volume2 className={`${activeClass}`} size={size} />
        ) : status === 'error' ? (
          <VolumeX className={`${errorClass}`} size={size} />
        ) : (
          <Volume2 className={`${iconClass}`} size={size} />
        )}
      </button>
    </div>
  );
};

export default AudioButton;