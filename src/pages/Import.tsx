import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TopNav from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState<{ id: string; name: string; testName: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    const { data: secs } = await supabase
      .from('sections')
      .select('id, name, test_id')
      .order('sort_order');

    if (secs) {
      const result = [];
      for (const sec of secs) {
        const { data: test } = await supabase.from('tests').select('name').eq('id', sec.test_id).single();
        result.push({ id: sec.id, name: sec.name, testName: test?.name || '' });
      }
      setSections(result);
    }
  }

  async function handleImport() {
    if (!file || !sectionId) return;
    setStatus('loading');

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes('word') && header.includes('meaning');
      const dataLines = hasHeader ? lines.slice(1) : lines;

      const words = dataLines.map((line, i) => {
        const cols = line.split(',').map(c => c.trim());
        if (cols.length >= 8) {
          return {
            section_id: sectionId,
            word: cols[0],
            meaning: cols[1],
            example: cols[2] || null,
            pronunciation: cols[3] || null,
            part_of_speech: cols[4] || null,
            synonyms: cols[5] || null,
            difficulty: parseInt(cols[6]) || 1,
            sort_order: i,
          };
        }
        return {
          section_id: sectionId,
          word: cols[0],
          meaning: cols[1] || '',
          example: cols[2] || null,
          pronunciation: null,
          part_of_speech: null,
          synonyms: null,
          difficulty: 1,
          sort_order: i,
        };
      });

      const { error } = await supabase.from('words').insert(words);
      if (error) throw error;

      setStatus('success');
      setMessage(`Đã import ${words.length} từ thành công!`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Import thất bại');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container py-8 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Import CSV</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            Hỗ trợ format: word,meaning,example,pronunciation,partOfSpeech,synonyms,difficulty,deckId
            <br />
            Hoặc đơn giản: word,meaning,example
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Section</label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.testName} → {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">File CSV</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : 'Click để chọn file CSV'}
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!file || !sectionId || status === 'loading'}
              onClick={handleImport}
            >
              <FileText className="h-4 w-4 mr-2" />
              {status === 'loading' ? 'Đang import...' : 'Import'}
            </Button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                {message}
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {message}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
