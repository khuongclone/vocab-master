import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speakWord } from '@/lib/tts';
import { Rating, formatInterval, type SchedulingResult } from '@/lib/fsrs';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
  synonyms?: string;
  image_url?: string;
  part_of_speech?: string;
  audio_url?: string;
}

interface FlashcardProps {
  word: Word;
  scheduling: Record<Rating, SchedulingResult> | null;
  onRate: (rating: Rating) => void;
  currentIndex: number;
  total: number;
}

export default function Flashcard({ word, scheduling, onRate, currentIndex, total }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = useCallback(() => {
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play();
    } else {
      speakWord(word.word);
    }
  }, [word]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const ratingConfig = [
    { rating: Rating.Again, label: 'Again', color: 'border-destructive text-destructive hover:bg-destructive/10' },
    { rating: Rating.Hard, label: 'Hard', color: 'border-warning text-warning hover:bg-warning/10' },
    { rating: Rating.Good, label: 'Good', color: 'border-success text-success hover:bg-success/10' },
    { rating: Rating.Easy, label: 'Easy', color: 'border-primary text-primary hover:bg-primary/10' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="w-full flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {total}</span>
        <button onClick={() => setIsFlipped(false)} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <RotateCcw className="h-3.5 w-3.5" />
          Lật lại
        </button>
      </div>

      {/* Card */}
      <div
        className="relative w-full aspect-[3/4] max-h-[460px] cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl border bg-card card-shadow p-8 flex flex-col items-center justify-center text-center"
            >
              {word.part_of_speech && (
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  {word.part_of_speech}
                </span>
              )}
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                {word.word}
              </h2>
              {word.pronunciation && (
                <p className="text-lg text-muted-foreground mb-4">{word.pronunciation}</p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak();
                }}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="h-5 w-5" />
              </button>
              <p className="mt-6 text-xs text-muted-foreground">Nhấn để lật thẻ</p>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-3xl border bg-card card-shadow p-8 flex flex-col items-center justify-center text-center overflow-y-auto"
            >
              <p className="font-display text-2xl font-bold text-foreground mb-4">{word.meaning}</p>
              {word.example && (
                <p className="text-sm text-muted-foreground italic mb-3 max-w-xs">"{word.example}"</p>
              )}
              {word.synonyms && (
                <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                  {word.synonyms.split(',').map((s, i) => (
                    <span key={i} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
              {word.image_url && (
                <img src={word.image_url} alt={word.word} className="h-24 w-24 rounded-xl object-cover mt-2" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FSRS Rating Buttons - only show when flipped */}
      {isFlipped && scheduling && (
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(rating);
                  setIsFlipped(false);
                }}
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
