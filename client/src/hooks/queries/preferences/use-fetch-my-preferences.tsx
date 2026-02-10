import { queryOptions, useQuery } from '@tanstack/react-query';
import { getMyStudentPreferences } from '@/api/preferences/studentPreferencesApi';

import type { OptionalQueryOptions } from '../types';
import type { StudentPreferencesEntity } from '@/interfaces/preferences/StudentPreferences';

interface Props<T = StudentPreferencesEntity> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchMyPreferencesOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['student_preferences', 'mine'],
    queryFn: () => getMyStudentPreferences(),
    ...queryOpt,
  });
}

export function useFetchMyPreferences(props?: Props) {
  return useQuery(fetchMyPreferencesOptions(props));
}
