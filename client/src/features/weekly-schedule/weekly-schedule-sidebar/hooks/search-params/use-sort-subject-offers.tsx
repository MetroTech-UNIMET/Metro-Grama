import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useAuth } from '@/contexts/AuthenticationContext';
import { type SortDirection } from '@/routes/_navLayout/horario/queryParams';
import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';

export function useSortSubjectOffers() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });
  const { user } = useAuth();
  const canUseFriendsOrder = !!user;

  const [sorting, setSorting] = useState<{ orderBy: OrderBySubjectOffers; orderDir: SortDirection }>({
    orderBy: sanitizeOrderBy(search.orderBy ?? OrderBySubjectOffers.Alphabetical, canUseFriendsOrder),
    orderDir: search.orderDir ?? 'asc',
  });

  const lastSynced = useRef(JSON.stringify(sorting));

  useEffect(() => {
    const rawOrderBy = search.orderBy ?? OrderBySubjectOffers.Alphabetical;
    const currentFromSearch = {
      orderBy: sanitizeOrderBy(rawOrderBy, canUseFriendsOrder),
      orderDir: search.orderDir ?? 'asc',
    };
    const currentStr = JSON.stringify(currentFromSearch);
    const internalStr = JSON.stringify(sorting);

    if (currentStr !== internalStr) {
      setSorting(currentFromSearch);

      // Keep URL and state in sync: only mark as synced if we did not sanitize.
      if (currentFromSearch.orderBy === rawOrderBy) {
        lastSynced.current = currentStr;
      }
    }
  }, [search.orderBy, search.orderDir, canUseFriendsOrder]);

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
  }, [sorting, navigate, search]);

  const setOrderBy = useCallback(
    (field: OrderBySubjectOffers) => {
      setSorting((prev) => ({
        ...prev,
        orderBy: sanitizeOrderBy(field, canUseFriendsOrder),
      }));
    },
    [canUseFriendsOrder],
  );

  const toggleOrderDir = useCallback(() => {
    setSorting((prev) => ({ ...prev, orderDir: prev.orderDir === 'asc' ? 'desc' : 'asc' }));
  }, []);

  return { sorting, setOrderBy, toggleOrderDir, setSorting };
}

function sanitizeOrderBy(orderBy: OrderBySubjectOffers, canUseFriendsOrder: boolean): OrderBySubjectOffers {
  if (!canUseFriendsOrder && orderBy === OrderBySubjectOffers.Friends) {
    return OrderBySubjectOffers.Alphabetical;
  }

  return orderBy;
}
