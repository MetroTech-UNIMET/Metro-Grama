import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
}

const isValid = (v: string) => /^\d{2}:\d{2}$/.test(v);

function clampRange(range: TimeRange | undefined): TimeRange | undefined {
  if (!range) return undefined;

  const { start, end } = range;
  if (!isValid(start) || !isValid(end)) return { start: '08:00', end: '22:00' };
  return { start, end };
}

export function useFilterByTimeRange() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const initial = clampRange(search.filterByTimeRange);
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>(initial);
  const lastSynced = useRef<string>('');

  // External change sync
  useEffect(() => {
    const incomingObj = clampRange(search.filterByTimeRange);
    const incoming = incomingObj ? `${incomingObj.start}-${incomingObj.end}` : '';
    if (incoming !== lastSynced.current) {
      setTimeRange(incomingObj);
      lastSynced.current = incoming;
    }
  }, [search.filterByTimeRange]);

  // Push to URL
  useEffect(() => {
    const key = timeRange ? `${timeRange.start}-${timeRange.end}` : '';
    if (key === lastSynced.current) return;
    navigate({
      to: '/horario',
      search: { ...search, filterByTimeRange: timeRange },
      replace: true,
    });
    lastSynced.current = key;
  }, [timeRange, navigate, search]);

  const update = useCallback((next: Partial<TimeRange>) => {
    setTimeRange((prev) => {
      const merged: TimeRange = prev
        ? { start: next.start || prev.start, end: next.end || prev.end }
        : { start: next.start || '08:00', end: next.end || '22:00' };
      return clampRange(merged);
    });
  }, []);

  const reset = useCallback(() => setTimeRange(undefined), []);

  return { timeRange, setTimeRange: update, reset };
}

export type UseFilterByTimeRangeReturn = ReturnType<typeof useFilterByTimeRange>;
