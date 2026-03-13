import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Word {
  id: string;
  word: string;
  meaning: string;
}

interface WordBlastModeProps {
  words: Word[];
  onComplete: (results: { correct: number; total: number }) => void;
}

const ROUND_TIME = 60; // seconds

export default function WordBlastMode({ words, onComplete }: WordBlastModeProps) {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && !finished) inputRef.current?.focus();
  }, [currentIndex, started, finished]);

  const currentWord = words[currentIndex % words.length];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || finished) return;
    const correct = input.trim().toLowerCase() === currentWord.word.toLowerCase();
    if (correct) {
      setScore(s => s + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setInput('');
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex(i => i + 1);
    }, 400);
  };

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(ROUND_TIME);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto text-center">
        <div className="rounded-3xl border bg-card card-shadow p-10">
          <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Word Blast</h2>
          <p className="text-muted-foreground mb-6">Gõ đúng từ tiếng Anh trong {ROUND_TIME} giây. Càng nhiều càng tốt!</p>
          <Button onClick={handleStart} className="rounded-xl h-12 px-8">
            Bắt đầu!
          </Button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto text-center">
        <div className="rounded-3xl border bg-card card-shadow p-10">
          <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Kết quả</h2>
          <p className="text-4xl font-bold text-primary mb-2">{score}</p>
          <p className="text-muted-foreground mb-6">từ đúng trong {ROUND_TIME} giây</p>
          <Button onClick={() => { handleStart(); onComplete({ correct: score, total: currentIndex }); }} className="rounded-xl h-12 px-8">
            Chơi lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Timer className="h-4 w-4 text-primary" />
          <span className={timeLeft <= 10 ? 'text-destructive' : 'text-foreground'}>{timeLeft}s</span>
        </div>
        <span className="text-sm font-bold text-primary">{score} điểm</span>
      </div>

      <Progress value={(timeLeft / ROUND_TIME) * 100} className="mb-6 h-2" />

      <div className={`w-full rounded-3xl border bg-card card-shadow p-8 text-center transition-colors ${
        feedback === 'correct' ? 'border-success' : feedback === 'wrong' ? 'border-destructive' : ''
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-display text-xl font-bold text-foreground mb-6">{currentWord.meaning}</p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Gõ từ tiếng Anh..."
            className="text-center text-lg font-semibold rounded-xl h-14"
            autoComplete="off"
          />
        </form>

        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-3 flex items-center justify-center gap-1 text-sm font-medium ${feedback === 'correct' ? 'text-success' : 'text-destructive'}`}
          >
            {feedback === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {feedback === 'correct' ? 'Đúng!' : `Sai! → ${currentWord.word}`}
          </motion.div>
        )}
      </div>
    </div>
  );
}
