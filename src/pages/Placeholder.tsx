import TopNav from '@/components/TopNav';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="container py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground mb-4">{title}</h1>
        <p className="text-muted-foreground">Tính năng này sẽ được cập nhật sớm.</p>
      </main>
    </div>
  );
}
