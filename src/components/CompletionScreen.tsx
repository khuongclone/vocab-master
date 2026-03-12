import { motion } from 'framer-motion';
import { PartyPopper, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionScreenProps {
  onRestart: () => void;
}

export default function CompletionScreen({ onRestart }: CompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mb-6">
        <PartyPopper className="h-10 w-10 text-success" />
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">Hoàn thành! 🎉</h2>
      <p className="text-muted-foreground mb-8">Bạn đã hoàn thành tất cả các từ trong phần này.</p>
      <Button variant="study" size="lg" onClick={onRestart}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Kiểm tra lại
      </Button>
    </motion.div>
  );
}
