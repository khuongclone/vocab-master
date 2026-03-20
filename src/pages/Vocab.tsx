import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import CourseCard from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, BookOpen, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ExamWithTests {
  id: string;
  year: number;
  name: string;
  tests: {
    id: string;
    name: string;
    wordCount: number;
    learnedCount: number;
  }[];
}

export default function VocabPage() {
  const [exams, setExams] = useState<ExamWithTests[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    const { data: examsData } = await supabase
      .from('exams')
      .select('id, year, name, course_id')
      .order('year', { ascending: false });

    if (!examsData) { setLoading(false); return; }

    const examResults: ExamWithTests[] = [];

    for (const exam of examsData) {
      const { data: tests } = await supabase
        .from('tests')
        .select('id, name, sort_order')
        .eq('exam_id', exam.id)
        .order('sort_order');

      const testsWithCount = [];
      for (const test of (tests || [])) {
        const { count } = await supabase
          .from('words')
          .select('id', { count: 'exact', head: true })
          .in('section_id', 
            (await supabase.from('sections').select('id').eq('test_id', test.id)).data?.map(s => s.id) || []
          );

        testsWithCount.push({
          id: test.id,
          name: test.name,
          wordCount: count || 0,
          learnedCount: 0,
        });
      }

      examResults.push({
        id: exam.id,
        year: exam.year,
        name: exam.name,
        tests: testsWithCount,
      });
    }

    setExams(examResults);
    setLoading(false);
  }

  async function exportAllWords() {
    toast.info('Đang xuất dữ liệu...');
    const { data: words, error } = await supabase
      .from('words')
      .select('word, meaning, pronunciation, part_of_speech, example, synonyms, difficulty, section_id')
      .order('word');

    if (error || !words?.length) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    const header = 'word,meaning,pronunciation,part_of_speech,example,synonyms,difficulty';
    const csvRows = words.map(w => 
      [w.word, w.meaning, w.pronunciation ?? '', w.part_of_speech ?? '', w.example ?? '', w.synonyms ?? '', w.difficulty ?? 1]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${words.length} từ vựng`);
  }

  const years = [...new Set(exams.map(e => e.year))].sort((a, b) => b - a);
  const defaultTab = years[0]?.toString() || '2026';

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Chinh phục Từ vựng TOEIC
              </h1>
            </div>
            <Button variant="outline" size="sm" onClick={exportAllWords} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">Chọn bộ đề để bắt đầu học từ vựng</p>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài test..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {years.length > 0 ? (
            <Tabs defaultValue={defaultTab}>
              <TabsList className="mb-6">
                {years.map(y => (
                  <TabsTrigger key={y} value={y.toString()}>ETS {y}</TabsTrigger>
                ))}
              </TabsList>

              {years.map(y => {
                const exam = exams.find(e => e.year === y);
                const filteredTests = exam?.tests.filter(t =>
                  t.name.toLowerCase().includes(search.toLowerCase())
                ) || [];

                return (
                  <TabsContent key={y} value={y.toString()}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTests.map(test => (
                        <CourseCard
                          key={test.id}
                          label={`ETS ${y}`}
                          name={test.name}
                          learned={test.learnedCount}
                          total={test.wordCount}
                          onPreview={() => navigate(`/vocab/test/${test.id}`)}
                          onStudy={() => navigate(`/vocab/test/${test.id}/study`)}
                        />
                      ))}
                    </div>
                    {filteredTests.length === 0 && (
                      <div className="text-center py-16 text-muted-foreground">
                        {loading ? 'Đang tải...' : 'Chưa có bài test nào. Hãy import dữ liệu CSV.'}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              {loading ? 'Đang tải...' : 'Chưa có dữ liệu. Hãy thêm khóa học và import CSV.'}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
