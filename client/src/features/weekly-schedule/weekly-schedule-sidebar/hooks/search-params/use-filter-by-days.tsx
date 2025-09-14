import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

/**
 * Hook to manage the `filterByDays` search param (array<number>) in the horario route.
 * Days follow JS getDay(): 0=Sun ... 6=Sat.
 */
export function useFilterByDays() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const [selectedDays, setSelectedDays] = useState<number[]>(() => (search.filterByDays as number[]) ?? []);
  const lastSynced = useRef<string>('');

  // Sync internal state if URL changes externally (back/forward navigation)
  useEffect(() => {
    const incoming = ((search.filterByDays as number[]) ?? []).slice().sort().join(',');
    if (incoming !== lastSynced.current) {
      setSelectedDays(incoming ? incoming.split(',').map(Number) : []);
      lastSynced.current = incoming;
    }
  }, [search.filterByDays]);

  // Push to URL when selection changes
  useEffect(() => {
    const sorted = selectedDays.slice().sort();
    const key = sorted.join(',');
    if (key === lastSynced.current) return;
    navigate({
      to: '/horario',
      search: { ...search, filterByDays: sorted },
      replace: true,
    });
    lastSynced.current = key;
  }, [selectedDays, navigate, search]);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }, []);

  const clearDays = useCallback(() => setSelectedDays([]), []);

  return { selectedDays, setSelectedDays, toggleDay, clearDays };
}

export type UseFilterByDaysReturn = ReturnType<typeof useFilterByDays>;
