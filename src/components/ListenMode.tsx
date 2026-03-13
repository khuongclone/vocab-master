import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Check, X, ArrowRight, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { speakWord } from '@/lib/tts';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  audio_url?: string;
}

interface ListenModeProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  currentIndex: number;
  total: number;
}

export default function ListenMode({ word, onAnswer, currentIndex, total }: ListenModeProps) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput('');
    setSubmitted(false);
    setIsCorrect(false);
    // Auto-play on new word
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
              <Button onClick={() => onAnswer(isCorrect)} className="w-full rounded-xl h-12" variant="outline">
                Tiếp theo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}
