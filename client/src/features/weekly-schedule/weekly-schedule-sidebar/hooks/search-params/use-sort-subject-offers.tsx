import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { useFetchMyPreferences } from '@/hooks/queries/preferences/use-fetch-my-preferences';
import { useAuth } from '@/contexts/AuthenticationContext';

import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';
import type { SortDirection } from '@/routes/_navLayout/horario/queryParams';

export function useSortSubjectOffers() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_navLayout/horario/' });
  const { user } = useAuth();
  const myPreferencesQuery = useFetchMyPreferences();
  const canUseFriendsOrder = !!user;

  const preferredDefaultOrderBy = myPreferencesQuery.isSuccess
    ? myPreferencesQuery.data.schedulePreferences.default_order
    : undefined;

  const [sorting, setSorting] = useState<{ orderBy: OrderBySubjectOffers; orderDir: SortDirection }>({
    orderBy: sanitizeOrderBy(
      search.orderBy ?? preferredDefaultOrderBy ?? OrderBySubjectOffers.Alphabetical,
      canUseFriendsOrder,
    ),
    orderDir: search.orderDir ?? 'asc',
  });

  const lastSynced = useRef(JSON.stringify(sorting));

  useEffect(() => {
    const rawOrderBy = search.orderBy ?? preferredDefaultOrderBy ?? OrderBySubjectOffers.Alphabetical;
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
  }, [search.orderBy, search.orderDir, canUseFriendsOrder, preferredDefaultOrderBy]);

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
