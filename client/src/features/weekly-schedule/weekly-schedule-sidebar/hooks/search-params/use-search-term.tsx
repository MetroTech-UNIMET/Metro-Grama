import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export function useSearchTerm() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const [term, setTerm] = useState(search.search);

  // Keep URL in sync when the debounced value changes and is stable
  useEffect(() => {
    const current = search?.search ?? '';
    // Avoid navigating until debouncedTerm has settled to the latest term
    if (current !== term) {
      navigate({
        to: '/horario',
        search: { ...search, search: term },
        replace: true,
      });
    }
  }, [term, navigate, search]);

  return { term, setTerm };
}
