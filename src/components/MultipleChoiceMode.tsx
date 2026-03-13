import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Volume2 } from 'lucide-react';
import { speakWord } from '@/lib/tts';

interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  audio_url?: string;
  part_of_speech?: string;
}

interface MultipleChoiceModeProps {
  word: Word;
  allWords: Word[];
  onAnswer: (correct: boolean) => void;
  currentIndex: number;
  total: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MultipleChoiceMode({ word, allWords, onAnswer, currentIndex, total }: MultipleChoiceModeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const options = useMemo(() => {
    const others = allWords.filter(w => w.id !== word.id);
    const distractors = shuffle(others).slice(0, 3);
    return shuffle([word, ...distractors]);
  }, [word.id, allWords]);

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
  }, [word.id]);

  const handleSpeak = () => {
    if (word.audio_url) {
      new Audio(word.audio_url).play();
    } else {
      speakWord(word.word);
    }
  };

  const handleSelect = (optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const correct = optionId === word.id;
    setTimeout(() => onAnswer(correct), 1200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div className="w-full flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <span>{currentIndex + 1} / {total}</span>
      </div>

      <div className="w-full rounded-3xl border bg-card card-shadow p-8 text-center mb-6">
        <p className="font-display text-3xl font-bold text-foreground mb-2">{word.word}</p>
        {word.pronunciation && (
          <p className="text-muted-foreground mb-3">{word.pronunciation}</p>
        )}
        <button onClick={handleSpeak} className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      <div className="w-full grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrectOption = opt.id === word.id;
          const isSelected = selected === opt.id;
          let borderClass = 'border-border hover:border-primary/50';
          if (answered) {
            if (isCorrectOption) borderClass = 'border-success bg-success/10';
            else if (isSelected) borderClass = 'border-destructive bg-destructive/10';
            else borderClass = 'border-border opacity-50';
          }

          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className={`w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${borderClass}`}
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 font-medium text-foreground">{opt.meaning}</span>
              {answered && isCorrectOption && <Check className="h-5 w-5 text-success" />}
              {answered && isSelected && !isCorrectOption && <X className="h-5 w-5 text-destructive" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
