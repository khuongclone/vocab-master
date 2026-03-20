import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import TopNav from '@/components/TopNav';
import SectionSidebar from '@/components/SectionSidebar';
import StudyModeTabs from '@/components/StudyModeTabs';
import Flashcard from '@/components/Flashcard';
import TypingMode from '@/components/TypingMode';
import MultipleChoiceMode from '@/components/MultipleChoiceMode';
import WordBlastMode from '@/components/WordBlastMode';
import MatchingMode from '@/components/MatchingMode';
import ListenMode from '@/components/ListenMode';
import WordListPreview from '@/components/WordListPreview';
import CompletionScreen from '@/components/CompletionScreen';
import { useStudyStore } from '@/stores/studyStore';
import { getSchedulingCards, createNewCard, Rating, type ReviewCard, type SchedulingResult } from '@/lib/fsrs';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Word {
  id: string;
  word: string;
  pronunciation: string | null;
  meaning: string;
  example: string | null;
  synonyms: string | null;
  image_url: string | null;
  part_of_speech: string | null;
  audio_url: string | null;
  section_id: string;
}

interface Section {
  id: string;
  name: string;
  wordCount: number;
}

export default function TestStudyPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentWordIndex, studyMode, setStudyMode, setCurrentWordIndex, reset, accent, setAccent } = useStudyStore();

  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [reviews, setReviews] = useState<Record<string, ReviewCard>>({});
  const [loading, setLoading] = useState(true);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    if (testId) loadTestData();
    return () => reset();
  }, [testId]);

  useEffect(() => {
    if (activeSection) loadWords(activeSection);
  }, [activeSection]);

  async function loadTestData() {
    const { data: test } = await supabase
      .from('tests')
      .select('name')
      .eq('id', testId!)
      .single();
    
    if (test) setTestName(test.name);

    const { data: secs } = await supabase
      .from('sections')
      .select('id, name, sort_order')
      .eq('test_id', testId!)
      .order('sort_order');

    if (secs) {
      const sectionsWithCount: Section[] = [];
      for (const sec of secs) {
        const { count } = await supabase
          .from('words')
          .select('id', { count: 'exact', head: true })
          .eq('section_id', sec.id);
        sectionsWithCount.push({ id: sec.id, name: sec.name, wordCount: count || 0 });
      }
      setSections(sectionsWithCount);
      if (sectionsWithCount.length > 0) {
        setActiveSection(sectionsWithCount[0].id);
      }
    }
    setLoading(false);
  }

  async function loadWords(sectionId: string) {
    const { data } = await supabase
      .from('words')
      .select('*')
      .eq('section_id', sectionId)
      .order('sort_order');

    if (data) {
      setWords(data as Word[]);
      setCurrentWordIndex(0);

      // Load user reviews
      if (user) {
        const wordIds = data.map(w => w.id);
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .in('word_id', wordIds);

        if (reviewData) {
          const reviewMap: Record<string, ReviewCard> = {};
          for (const r of reviewData) {
            reviewMap[r.word_id] = {
              due: new Date(r.due),
              stability: r.stability || 0,
              difficulty: r.difficulty || 0,
              elapsed_days: r.elapsed_days || 0,
              scheduled_days: r.scheduled_days || 0,
              reps: r.reps || 0,
              lapses: r.lapses || 0,
              state: r.state || 0,
              last_review: r.last_review ? new Date(r.last_review) : undefined,
            };
          }
          setReviews(reviewMap);
        }
      }
    }
  }

  const currentWord = words[currentWordIndex];
  const isComplete = currentWordIndex >= words.length && words.length > 0;

  const currentCard = currentWord
    ? reviews[currentWord.id] || createNewCard()
    : null;

  const scheduling = currentCard ? getSchedulingCards(currentCard) : null;

  async function handleRate(rating: Rating) {
    if (!currentWord || !scheduling || !user) return;

    const result = scheduling[rating];
    const card = result.card;

    // Save to DB
    await supabase.from('reviews').upsert({
      user_id: user.id,
      word_id: currentWord.id,
      due: card.due.toISOString(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: card.state,
      last_review: card.last_review?.toISOString(),
    }, { onConflict: 'user_id,word_id' });

    setReviews(prev => ({ ...prev, [currentWord.id]: card }));
    
    // Only advance to next word if rating is not "Again"
    if (rating !== Rating.Again) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">{testName}</h1>
            <p className="text-sm text-muted-foreground">
              {activeSection && sections.find(s => s.id === activeSection)?.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <SectionSidebar
            sections={sections}
            activeSection={activeSection}
            onSelectSection={(id) => {
              setActiveSection(id);
              setCurrentWordIndex(0);
            }}
          />

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <StudyModeTabs active={studyMode} onChange={(m) => setStudyMode(m as any)} />
              <div className="flex items-center gap-1 rounded-lg bg-accent p-1">
                <button
                  onClick={() => setAccent('us')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${accent === 'us' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  🇺🇸 US
                </button>
                <button
                  onClick={() => setAccent('uk')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${accent === 'uk' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  🇬🇧 UK
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Đang tải...</div>
            ) : isComplete ? (
              <CompletionScreen onRestart={() => setCurrentWordIndex(0)} />
            ) : studyMode === 'flashcard' && currentWord ? (
              <motion.div key={currentWord.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <Flashcard
                  word={{
                    ...currentWord,
                    pronunciation: currentWord.pronunciation || undefined,
                    example: currentWord.example || undefined,
                    synonyms: currentWord.synonyms || undefined,
                    image_url: currentWord.image_url || undefined,
                    part_of_speech: currentWord.part_of_speech || undefined,
                    audio_url: currentWord.audio_url || undefined,
                  }}
                  scheduling={scheduling}
                  onRate={handleRate}
                  currentIndex={currentWordIndex}
                  total={words.length}
                />
              </motion.div>
            ) : studyMode === 'typing' && currentWord ? (
              <motion.div key={currentWord.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <TypingMode
                  word={{ ...currentWord, pronunciation: currentWord.pronunciation || undefined, example: currentWord.example || undefined, audio_url: currentWord.audio_url || undefined, part_of_speech: currentWord.part_of_speech || undefined }}
                  scheduling={scheduling}
                  onRate={handleRate}
                  currentIndex={currentWordIndex}
                  total={words.length}
                />
              </motion.div>
            ) : studyMode === 'multiple-choice' && currentWord ? (
              <motion.div key={currentWord.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <MultipleChoiceMode
                  word={{ ...currentWord, pronunciation: currentWord.pronunciation || undefined, audio_url: currentWord.audio_url || undefined, part_of_speech: currentWord.part_of_speech || undefined }}
                  allWords={words.map(w => ({ ...w, pronunciation: w.pronunciation || undefined, audio_url: w.audio_url || undefined, part_of_speech: w.part_of_speech || undefined }))}
                  onAnswer={() => setCurrentWordIndex(currentWordIndex + 1)}
                  currentIndex={currentWordIndex}
                  total={words.length}
                />
              </motion.div>
            ) : studyMode === 'word-blast' && words.length > 0 ? (
              <WordBlastMode
                words={words}
                onComplete={() => {}}
              />
            ) : studyMode === 'matching' && words.length > 0 ? (
              <MatchingMode
                words={words}
                onComplete={() => {}}
              />
            ) : studyMode === 'listen' && currentWord ? (
              <motion.div key={currentWord.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                <ListenMode
                  word={{ ...currentWord, pronunciation: currentWord.pronunciation || undefined, audio_url: currentWord.audio_url || undefined }}
                  scheduling={scheduling}
                  onRate={handleRate}
                  currentIndex={currentWordIndex}
                  total={words.length}
                />
              </motion.div>
            ) : words.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Chưa có từ vựng trong section này.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
