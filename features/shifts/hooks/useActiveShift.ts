'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DailyShift, ActiveShiftApiResponse } from '@/types/shifts';

export function useActiveShift() {
  const [activeShift, setActiveShift] = useState<DailyShift | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const fetchActiveShift = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorCode(null);

      const res = await fetch('/api/admin/shifts');
      const data: ActiveShiftApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'فشل جلب حالة الوردية');
        setErrorCode(data.code || 'FETCH_ERROR');
        setActiveShift(null);
        return;
      }

      setActiveShift(data.shift);
    } catch (err: any) {
      setError(err?.message || 'تعذر الاتصال بالخادم');
      setErrorCode('NETWORK_ERROR');
      setActiveShift(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveShift();

    // Supabase Realtime subscription for daily_shifts table
    const channel = supabase
      .channel('admin-daily-shifts-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_shifts' },
        () => {
          fetchActiveShift();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveShift]);

  return {
    activeShift,
    hasActiveShift: activeShift !== null,
    loading,
    error,
    errorCode,
    refreshShift: fetchActiveShift,
  };
}
