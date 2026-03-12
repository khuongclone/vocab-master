import { cn } from '@/lib/utils';
import { BookOpen, Headphones, PenTool } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  wordCount: number;
}

interface SectionSidebarProps {
  sections: Section[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
}

const iconMap: Record<string, typeof BookOpen> = {
  Reading: BookOpen,
  Listening: Headphones,
  Grammar: PenTool,
};

export default function SectionSidebar({ sections, activeSection, onSelectSection }: SectionSidebarProps) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
        Sections
      </h3>
      <div className="flex flex-col gap-1">
        {sections.map((section) => {
          const Icon = iconMap[section.name] || BookOpen;
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                activeSection === section.id
                  ? 'bg-primary/10 text-primary card-shadow'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1">
                <div>{section.name}</div>
                <div className="text-xs opacity-60">{section.wordCount} từ</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
