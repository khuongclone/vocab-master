import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useStreak() {
  const { user } = useAuthStore();
  const [streak, setStreak] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);

  const fetchStreak = useCallback(async () => {
    if (!user) { setStreak(0); setStudiedToday(false); return; }

    const { data } = await supabase
      .from('profiles')
      .select('streak_days, last_study_date')
      .eq('user_id', user.id)
      .single();

    if (!data) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = data.last_study_date;
    const isToday = lastDate === today;

    setStudiedToday(isToday);
    setStreak(data.streak_days ?? 0);
  }, [user]);

  const recordStudy = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const { data } = await supabase
      .from('profiles')
      .select('streak_days, last_study_date')
      .eq('user_id', user.id)
      .single();

    if (!data) return;
    if (data.last_study_date === today) return; // already recorded

    const newStreak = data.last_study_date === yesterday
      ? (data.streak_days ?? 0) + 1
      : 1;

    await supabase
      .from('profiles')
      .update({ streak_days: newStreak, last_study_date: today })
      .eq('user_id', user.id);

    setStreak(newStreak);
    setStudiedToday(true);
  }, [user]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  return { streak, studiedToday, recordStudy };
}
