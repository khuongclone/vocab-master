import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from './pages/Auth';
import VocabPage from './pages/Vocab';
import TestStudyPage from './pages/TestStudy';
import ImportPage from './pages/Import';
import PlaceholderPage from './pages/Placeholder';

const queryClient = new QueryClient();

function AuthListener() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/vocab" element={<VocabPage />} />
          <Route path="/vocab/test/:testId" element={<TestStudyPage />} />
          <Route path="/vocab/test/:testId/study" element={<TestStudyPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/grammar" element={<PlaceholderPage title="Ngữ pháp TOEIC" />} />
          <Route path="/listening" element={<PlaceholderPage title="Listening TOEIC" />} />
          <Route path="/reading" element={<PlaceholderPage title="Reading TOEIC" />} />
          <Route path="/test-center" element={<PlaceholderPage title="Test Center" />} />
          <Route path="/more" element={<PlaceholderPage title="Thêm" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
