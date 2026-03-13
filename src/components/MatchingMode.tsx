import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Word {
  id: string;
  word: string;
  meaning: string;
}

interface MatchingModeProps {
  words: Word[];
  onComplete: (results: { correct: number; total: number }) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingMode({ words, onComplete }: MatchingModeProps) {
  const roundWords = useMemo(() => shuffle(words).slice(0, Math.min(6, words.length)), [words]);
  
  const [leftItems, setLeftItems] = useState<{ id: string; text: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setLeftItems(shuffle(roundWords.map(w => ({ id: w.id, text: w.word }))));
    setRightItems(shuffle(roundWords.map(w => ({ id: w.id, text: w.meaning }))));
    setSelectedLeft(null);
    setMatched(new Set());
    setWrong(null);
    setAttempts(0);
  }, [roundWords]);

  const isComplete = matched.size === roundWords.length;

  const handleLeftClick = (id: string) => {
    if (matched.has(id)) return;
    setSelectedLeft(id);
    setWrong(null);
  };

  const handleRightClick = (id: string) => {
    if (!selectedLeft || matched.has(id)) return;
    setAttempts(a => a + 1);
    if (selectedLeft === id) {
      setMatched(prev => new Set([...prev, id]));
      setSelectedLeft(null);
      if (matched.size + 1 === roundWords.length) {
        setTimeout(() => onComplete({ correct: roundWords.length, total: attempts + 1 }), 800);
      }
    } else {
      setWrong({ left: selectedLeft, right: id });
      setTimeout(() => {
        setWrong(null);
        setSelectedLeft(null);
      }, 600);
    }
  };

  const handleRestart = () => {
    setLeftItems(shuffle(roundWords.map(w => ({ id: w.id, text: w.word }))));
    setRightItems(shuffle(roundWords.map(w => ({ id: w.id, text: w.meaning }))));
    setSelectedLeft(null);
    setMatched(new Set());
    setWrong(null);
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="w-full flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>Đã ghép: {matched.size} / {roundWords.length}</span>
        <button onClick={handleRestart} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <RotateCcw className="h-3.5 w-3.5" /> Chơi lại
        </button>
      </div>

      {isComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border bg-card card-shadow p-10 text-center w-full"
        >
          <Check className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Hoàn thành!</h2>
          <p className="text-muted-foreground mb-4">Số lần thử: {attempts}</p>
          <Button onClick={handleRestart} className="rounded-xl">Chơi lại</Button>
        </motion.div>
      ) : (
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {leftItems.map(item => {
              const isMatched = matched.has(item.id);
              const isSelected = selectedLeft === item.id;
              const isWrong = wrong?.left === item.id;
              return (
                <motion.button
                  key={item.id}
                  layout
                  onClick={() => handleLeftClick(item.id)}
                  disabled={isMatched}
                  className={`w-full rounded-xl border-2 p-4 text-sm font-semibold text-left transition-all ${
                    isMatched
                      ? 'border-success/30 bg-success/5 text-success opacity-60'
                      : isWrong
                      ? 'border-destructive bg-destructive/10'
                      : isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {item.text}
                </motion.button>
              );
            })}
          </div>
          <div className="space-y-2">
            {rightItems.map(item => {
              const isMatched = matched.has(item.id);
              const isWrong = wrong?.right === item.id;
              return (
                <motion.button
                  key={item.id}
                  layout
                  onClick={() => handleRightClick(item.id)}
                  disabled={isMatched}
                  className={`w-full rounded-xl border-2 p-4 text-sm font-medium text-left transition-all ${
                    isMatched
                      ? 'border-success/30 bg-success/5 text-success opacity-60'
                      : isWrong
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {item.text}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
