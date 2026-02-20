import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useDebounceValue } from '@/hooks/shadcn.io/debounce/use-debounce-value';

type ValidRoutes = '/_navLayout/oferta/' | '/_navLayout/oferta/edit';

export function useAcademicYear({ from }: { from: ValidRoutes }) {
  const navigate = useNavigate();
  const search = useSearch({ from });

  const [year, setYear] = useState(search.year);
  const [debouncedYear] = useDebounceValue(year, 300);

  // Keep URL in sync when the debounced value changes and is stable
  useEffect(() => {
    const current = (search as any)?.year ?? '';
    // Avoid navigating until debouncedTerm has settled to the latest term
    if (debouncedYear !== year) return;
    if (current !== debouncedYear) {
      navigate({
        to: normalizeForm(from),
        search: { ...search, year: debouncedYear },
        replace: true,
      });
    }
  }, [debouncedYear, year, navigate, search, from]);

  return { year, setYear, debouncedYear };
}

// FIXME - Eliminar código repetido
function normalizeForm(from: ValidRoutes){
  return from.split('/_navLayout')[1] as '/oferta' | '/oferta/edit';
}