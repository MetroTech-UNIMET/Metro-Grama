import { queryOptions, useQuery } from '@tanstack/react-query';

import { getSubjectStats, Query_SubjectStats } from '@/api/statsApi';
import { queryKeys } from '@/lib/query-keys';

import type { SubjectStats } from '@/interfaces/Subject';
import type { OptionalQueryOptions } from '../types';

interface Props<T = SubjectStats[]> {
  queryOptions?: OptionalQueryOptions<T>;
  optionalQuery?: Query_SubjectStats;
}

export function fetchSubjectStatsOptions(subjectCode: string, { queryOptions: queryOpt, optionalQuery }: Props = {}) {
  const { careers, ...restQuery } = optionalQuery ?? {};
  const careerOrdered = careers?.sort();

  const newQuery = { ...restQuery, careers: careerOrdered };

  return queryOptions({
    queryKey: queryKeys.subjects.details(subjectCode)._ctx.stats(newQuery).queryKey,
    queryFn: () => getSubjectStats(subjectCode, newQuery),
    ...queryOpt,
  });
}

export function useFetchSubjectStats(subjectCode: string, props: Props = {}) {
  const query = useQuery(fetchSubjectStatsOptions(subjectCode, props));
  return query;
}
