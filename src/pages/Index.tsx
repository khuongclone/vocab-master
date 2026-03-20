import { motion } from 'framer-motion';
import { BookOpen, Headphones, PenTool, FileText, ArrowRight, Flame, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { useDueCount } from '@/hooks/useDueCount';
import { useStreak } from '@/hooks/useStreak';

const categories = [
  {
    title: 'Từ vựng',
    description: 'Chinh phục từ vựng TOEIC với flashcard và spaced repetition',
    icon: BookOpen,
    path: '/vocab',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Ngữ pháp',
    description: 'Nắm vững ngữ pháp TOEIC từ cơ bản đến nâng cao',
    icon: PenTool,
    path: '/grammar',
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Listening',
    description: 'Luyện nghe TOEIC Part 1-4 với audio chất lượng',
    icon: Headphones,
    path: '/listening',
    color: 'bg-warning/10 text-warning',
  },
  {
    title: 'Reading',
    description: 'Luyện đọc TOEIC Part 5-7 với đề thi thật',
    icon: FileText,
    path: '/reading',
    color: 'bg-destructive/10 text-destructive',
  },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const dueCount = useDueCount();
  const { streak, studiedToday } = useStreak();

  return (
    <div className="min-h-screen bg-background">
      <TopNav dueCount={dueCount} />
      
      <main className="container py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Chinh phục TOEIC 
            <span className="text-primary"> dễ dàng</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Học từ vựng thông minh với thuật toán lặp lại ngắt quãng (Spaced Repetition). 
            Ghi nhớ lâu hơn, học hiệu quả hơn.
          </p>
          {!user && (
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
              >
                Bắt đầu ngay
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={cat.path}
                className="flex items-start gap-4 rounded-2xl border bg-card p-6 card-shadow hover:card-shadow-hover transition-all group"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
