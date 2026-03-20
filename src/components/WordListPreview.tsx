import { Volume2 } from 'lucide-react';
import { speakWord } from '@/lib/tts';
import { useStudyStore } from '@/stores/studyStore';

interface Word {
  id: string;
  word: string;
  pronunciation?: string | null;
  meaning: string;
  part_of_speech?: string | null;
  example?: string | null;
  audio_url?: string | null;
}

interface WordListPreviewProps {
  words: Word[];
}

export default function WordListPreview({ words }: WordListPreviewProps) {
  const { accent } = useStudyStore();

  const handleSpeak = (word: Word) => {
    if (word.audio_url) {
      new Audio(word.audio_url).play();
    } else {
      speakWord(word.word, accent === 'uk' ? 'en-GB' : 'en-US');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <p className="text-sm text-muted-foreground mb-4">{words.length} từ vựng</p>
      {words.map((word, i) => (
        <div
          key={word.id}
          className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
        >
          <span className="text-xs text-muted-foreground w-6 text-right">{i + 1}</span>
          <button
            onClick={() => handleSpeak(word)}
            className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-foreground">{word.word}</span>
              {word.part_of_speech && (
                <span className="text-xs text-muted-foreground italic">{word.part_of_speech}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{word.meaning}</p>
          </div>
          {word.pronunciation && (
            <span className="text-xs text-muted-foreground hidden sm:block">{word.pronunciation}</span>
          )}
        </div>
      ))}
    </div>
  );
}
