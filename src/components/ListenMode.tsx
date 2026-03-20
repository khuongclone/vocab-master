import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X, Headphones, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speakWord } from '@/lib/tts';
import { useStudyStore } from '@/stores/studyStore';
import { Rating, formatInterval, type SchedulingResult } from '@/lib/fsrs';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  audio_url?: string;
}

interface ListenModeProps {
  word: Word;
  scheduling: Record<Rating, SchedulingResult> | null;
  onRate: (rating: Rating) => void;
  currentIndex: number;
  total: number;
}

function maskWord(word: string): string {
  if (word.length <= 1) return word;
  return word[0] + '.'.repeat(word.length - 1);
}

const ratingConfig = [
  { rating: Rating.Again, label: 'Again', color: 'border-destructive text-destructive hover:bg-destructive/10' },
  { rating: Rating.Hard, label: 'Hard', color: 'border-warning text-warning hover:bg-warning/10' },
  { rating: Rating.Good, label: 'Good', color: 'border-success text-success hover:bg-success/10' },
  { rating: Rating.Easy, label: 'Easy', color: 'border-primary text-primary hover:bg-primary/10' },
];

export default function ListenMode({ word, scheduling, onRate, currentIndex, total }: ListenModeProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setHintUsed(false);
    setTimeout(() => {
      handleSpeak();
      inputRef.current?.focus();
    }, 300);
  }, [word.id]);

  const handleSpeak = useCallback(() => {
    if (word.audio_url) {
      new Audio(word.audio_url).play();
    } else {
      speakWord(word.word);
    }
  }, [word]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || !input.trim()) return;
    const correct = input.trim().toLowerCase() === word.word.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div className="w-full flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {total}</span>
        {!submitted && (
          <button
            onClick={() => setHintUsed(true)}
            disabled={hintUsed}
            className={`flex items-center gap-1 transition-colors ${hintUsed ? 'text-primary' : 'hover:text-foreground'}`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {hintUsed ? maskWord(word.word) : 'Gợi ý'}
          </button>
        )}
      </div>

      <div className="w-full rounded-3xl border bg-card card-shadow p-8 text-center">
        <Headphones className="h-8 w-8 text-primary mx-auto mb-4" />
        <p className="text-muted-foreground mb-6">Nghe và gõ lại từ bạn nghe được</p>

        <button
          onClick={handleSpeak}
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all mb-6"
        >
          <Volume2 className="h-7 w-7" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập từ bạn nghe..."
            disabled={submitted}
            className={`text-center text-lg font-semibold rounded-xl h-14 ${
              submitted
                ? isCorrect
                  ? 'border-success bg-success/10 text-success'
                  : 'border-destructive bg-destructive/10 text-destructive'
                : ''
            }`}
            autoComplete="off"
          />

          {!submitted ? (
            <Button type="submit" className="w-full rounded-xl h-12" disabled={!input.trim()}>
              Kiểm tra
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className={`flex items-center justify-center gap-2 text-lg font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                {isCorrect ? 'Chính xác!' : 'Sai rồi!'}
              </div>
              {!isCorrect && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground">Đáp án:</span>
                    <span className="font-bold text-foreground">{word.word}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{word.meaning}</p>
                </div>
              )}
            </motion.div>
          )}
        </form>
      </div>

      {/* FSRS Rating Buttons */}
      {submitted && scheduling && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mt-6 w-full"
        >
          {ratingConfig.map(({ rating, label, color }) => {
            const interval = scheduling[rating]?.interval ?? 0;
            return (
              <button
                key={rating}
                onClick={() => onRate(rating)}
                className={`flex-1 flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 font-semibold text-sm transition-all ${color}`}
              >
                <span>{label}</span>
                <span className="text-xs opacity-70">{formatInterval(interval)}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
