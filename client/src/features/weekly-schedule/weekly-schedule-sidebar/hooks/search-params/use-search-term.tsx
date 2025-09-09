import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useDebounceValue } from '@/hooks/shadcn.io/debounce/use-debounce-value';

export function useSearchTerm() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const [term, setTerm] = useState(search.search);
  const [debouncedTerm] = useDebounceValue(term, 300);

  // Keep URL in sync when the debounced value changes and is stable
  useEffect(() => {
    const current = search?.search ?? '';
    // Avoid navigating until debouncedTerm has settled to the latest term
    if (debouncedTerm !== term) return;
    if (current !== debouncedTerm) {
      navigate({
        to: '/horario',
        search: { ...search, search: debouncedTerm },
        replace: true,
      });
    }
  }, [debouncedTerm, term, navigate, search]);

  return { term, setTerm, debouncedTerm };
}
