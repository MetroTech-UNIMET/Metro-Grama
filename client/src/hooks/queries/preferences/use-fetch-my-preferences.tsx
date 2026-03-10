import { queryOptions, useQuery } from '@tanstack/react-query';
import { getMyStudentPreferences } from '@/api/preferences/studentPreferencesApi';
import { queryKeys } from '@/lib/query-keys';

import type { OptionalQueryOptions } from '../types';
import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';

interface Props<T = StudentPreferencesEntity> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchMyPreferencesOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: queryKeys.preferences.mine.queryKey,
    queryFn: () => getMyStudentPreferences(),
    ...queryOpt,
  });
}

export function useFetchMyPreferences(props?: Props) {
  return useQuery(fetchMyPreferencesOptions(props));
}
