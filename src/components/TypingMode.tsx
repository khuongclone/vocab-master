import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Volume2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speakWord } from '@/lib/tts';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
  audio_url?: string;
  part_of_speech?: string;
}

interface TypingModeProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  currentIndex: number;
  total: number;
}

export default function TypingMode({ word, onAnswer, currentIndex, total }: TypingModeProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [word.id]);

  const handleSpeak = useCallback(() => {
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play();
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

  const handleNext = () => {
    onAnswer(isCorrect);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div className="w-full flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {total}</span>
      </div>

      <div className="w-full rounded-3xl border bg-card card-shadow p-8 text-center">
        {word.part_of_speech && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            {word.part_of_speech}
          </span>
        )}
        <p className="font-display text-xl font-bold text-foreground mb-2">{word.meaning}</p>
        {word.example && (
          <p className="text-sm text-muted-foreground italic mb-4">"{word.example}"</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập từ tiếng Anh..."
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
            <AnimatePresence>
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
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-muted-foreground">Đáp án:</span>
                    <span className="font-bold text-foreground">{word.word}</span>
                    <button onClick={handleSpeak} className="text-primary hover:text-primary/80">
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <Button onClick={handleNext} className="w-full rounded-xl h-12" variant="outline">
                  Tiếp theo <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </form>
      </div>
    </div>
  );
}
