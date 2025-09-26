import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useDebounceValue } from '@/hooks/shadcn.io/debounce/use-debounce-value';

export function useAcademicYear() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/oferta/' });

  const [year, setYear] = useState(search.year);
  const [debouncedYear] = useDebounceValue(year, 300);

  console.log({ year, debouncedYear,search });
  // Keep URL in sync when the debounced value changes and is stable
  useEffect(() => {
    const current = search?.year ?? '';
    // Avoid navigating until debouncedTerm has settled to the latest term
    if (debouncedYear !== year) return;
    if (current !== debouncedYear) {
      navigate({
        to: '/oferta',
        search: { ...search, year: debouncedYear },
        replace: true,
      });
    }
  }, [debouncedYear, year, navigate, search]);

  return { year, setYear, debouncedYear };
}
