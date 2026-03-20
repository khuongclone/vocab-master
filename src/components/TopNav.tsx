import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Headphones, FileText, PenTool, MoreHorizontal, LogIn, LogOut, Flame, Volume2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useStreak } from '@/hooks/useStreak';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Grammar', icon: PenTool, path: '/grammar' },
  { label: 'Vocab', icon: BookOpen, path: '/vocab' },
  { label: 'Listening', icon: Headphones, path: '/listening' },
  { label: 'Reading', icon: FileText, path: '/reading' },
  { label: 'Test', icon: Volume2, path: '/test-center' },
  { label: 'More', icon: MoreHorizontal, path: '/more' },
];

interface TopNavProps {
  dueCount?: number;
}

export default function TopNav({ dueCount = 0 }: TopNavProps) {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { streak } = useStreak();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">VocabMaster</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.label === 'Vocab' && dueCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                    {dueCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Flame className={`h-4 w-4 ${streak > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                <span className="font-medium">{streak}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                <LogIn className="h-4 w-4 mr-1" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto border-t border-border px-2 py-1 gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4 mb-0.5" />
              {item.label}
              {item.label === 'Vocab' && dueCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
