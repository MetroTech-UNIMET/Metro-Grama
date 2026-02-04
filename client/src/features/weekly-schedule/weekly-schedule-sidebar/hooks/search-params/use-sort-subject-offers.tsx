import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import type { SortField, SortDirection } from '@/routes/_navLayout/horario/queryParams';

export function useSortSubjectOffers() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });

  const [sorting, setSorting] = useState<{ orderBy: SortField; orderDir: SortDirection }>({
    orderBy: (search.orderBy as SortField) ?? 'alphabetical',
    orderDir: (search.orderDir as SortDirection) ?? 'asc',
  });

  const lastSynced = useRef(JSON.stringify(sorting));

  useEffect(() => {
    const currentFromSearch = {
      orderBy: (search.orderBy as SortField) ?? 'alphabetical',
      orderDir: (search.orderDir as SortDirection) ?? 'asc',
    };
    const currentStr = JSON.stringify(currentFromSearch);
    const internalStr = JSON.stringify(sorting);

    if (currentStr !== internalStr) {
      setSorting(currentFromSearch);
      lastSynced.current = currentStr;
    }
  }, [search.orderBy, search.orderDir]);

  useEffect(() => {
    const currentStr = JSON.stringify(sorting);
    if (currentStr === lastSynced.current) return;

    navigate({
      to: '/horario',
      search: {
        ...search,
        ...sorting,
      },
      replace: true,
    });
    lastSynced.current = currentStr;
  }, [sorting, navigate]);

  const setOrderBy = useCallback((field: SortField) => {
    setSorting((prev) => ({ ...prev, orderBy: field }));
  }, []);

  const toggleOrderDir = useCallback(() => {
    setSorting((prev) => ({ ...prev, orderDir: prev.orderDir === 'asc' ? 'desc' : 'asc' }));
  }, []);

  return { sorting, setOrderBy, toggleOrderDir, setSorting };
}
