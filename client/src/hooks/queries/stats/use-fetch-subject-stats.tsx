import { queryOptions, useQuery } from '@tanstack/react-query';

import { getSubjectStats } from '@/api/statsApi';

import type { SubjectStats } from '@/interfaces/Subject';
import type { OptionalQueryOptions } from '../types';

export function fetchSubjectStatsOptions(subjectCode: string, queryOpt?: OptionalQueryOptions<SubjectStats[]>) {
  return queryOptions({
    queryKey: ['subjects', subjectCode, 'stat'],
    queryFn: () => getSubjectStats(subjectCode),
    ...queryOpt,
  });
}

export function useFetchSubjectStats(subjectCode: string, queryOptions?: OptionalQueryOptions<SubjectStats[]>) {
  const query = useQuery(fetchSubjectStatsOptions(subjectCode, queryOptions));
  return query;
}
