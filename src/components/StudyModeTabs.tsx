import { cn } from '@/lib/utils';
import { Layers, Keyboard, CheckSquare, Zap, GitMerge, Headphones } from 'lucide-react';

const modes = [
  { key: 'flashcard' as const, label: 'Flashcard', icon: Layers },
  { key: 'typing' as const, label: 'Typing', icon: Keyboard },
  { key: 'multiple-choice' as const, label: 'Multiple Choice', icon: CheckSquare },
  { key: 'word-blast' as const, label: 'Word Blast', icon: Zap },
  { key: 'matching' as const, label: 'Matching', icon: GitMerge },
  { key: 'listen' as const, label: 'Listen', icon: Headphones },
];

interface StudyModeTabsProps {
  active: string;
  onChange: (mode: string) => void;
}

export default function StudyModeTabs({ active, onChange }: StudyModeTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {modes.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
            active === key
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-accent text-muted-foreground hover:bg-accent/80 hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
