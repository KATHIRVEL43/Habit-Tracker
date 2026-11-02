import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export function useToday(serverTodayStr?: string) {
  const queryClient = useQueryClient();
  const [todayStr, setTodayStr] = useState<string>(() => {
    return serverTodayStr || format(new Date(), 'yyyy-MM-dd');
  });

  useEffect(() => {
    if (serverTodayStr) {
      setTodayStr(serverTodayStr);
    }
  }, [serverTodayStr]);

  useEffect(() => {
    // Schedule check at midnight
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 1
    );
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const nextDayStr = format(new Date(), 'yyyy-MM-dd');
      setTodayStr(nextDayStr);
      // Invalidate month logs query so today's column automatically shifts
      queryClient.invalidateQueries({ queryKey: ['month-logs'] });
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [todayStr, queryClient]);

  return todayStr;
}
