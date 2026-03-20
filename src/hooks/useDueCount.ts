import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useDueCount() {
  const { user } = useAuthStore();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (!user) { setDueCount(0); return; }

    const fetch = async () => {
      const now = new Date().toISOString();
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .lte('due', now);
      setDueCount(count ?? 0);
    };

    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  return dueCount;
}
