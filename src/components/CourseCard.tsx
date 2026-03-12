import { motion } from 'framer-motion';
import { BookOpen, Eye, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  label: string;
  name: string;
  learned: number;
  total: number;
  onPreview: () => void;
  onStudy: () => void;
}

export default function CourseCard({ label, name, learned, total, onPreview, onStudy }: CourseCardProps) {
  const progress = total > 0 ? Math.round((learned / total) * 100) : 0;
  const isDone = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border bg-card p-5 card-shadow transition-all hover:card-shadow-hover',
        isDone && 'border-success/30 bg-success/5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <GraduationCap className="h-3.5 w-3.5" />
          {label}
        </span>
        {isDone && (
          <span className="text-xs font-semibold text-success">✓ Hoàn thành</span>
        )}
      </div>

      <h3 className="font-display text-lg font-bold text-card-foreground mb-4">{name}</h3>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{learned}/{total} từ</span>
          <span className={cn('font-semibold', isDone ? 'text-success' : 'text-primary')}>{progress}%</span>
        </div>
        <Progress value={progress} className={cn('h-2', isDone && '[&>div]:bg-success')} />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onPreview}>
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview
        </Button>
        <Button variant="study" size="sm" className="flex-1" onClick={onStudy}>
          <BookOpen className="h-3.5 w-3.5 mr-1" />
          Study
        </Button>
      </div>
    </motion.div>
  );
}
