import { queryOptions, useQuery } from '@tanstack/react-query';

import { getSubjectStats, Query_SubjectStats } from '@/api/statsApi';

import type { SubjectStats } from '@/interfaces/Subject';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectStats[]> {
  queryOptions?: OptionalQueryOptions<T>;
  optionalQuery?: Query_SubjectStats;
}

export function fetchSubjectStatsOptions(subjectCode: string, { queryOptions: queryOpt, optionalQuery }: Props = {}) {
  const { careers, ...restQuery } = optionalQuery ?? {};
  const careerOrdered = careers?.sort()

  const newQuery = { ...restQuery, careers: careerOrdered};

  return queryOptions({
    queryKey: ['subjects', subjectCode, 'stats', newQuery],
    queryFn: () => getSubjectStats(subjectCode, newQuery),
    ...queryOpt,
  });
}

export function useFetchSubjectStats(subjectCode: string, props: Props = {}) {
  const query = useQuery(fetchSubjectStatsOptions(subjectCode, props));
  return query;
}
