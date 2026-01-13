import { useQuery, queryOptions } from '@tanstack/react-query';

import { getSubjectsElectivesGraph } from '@/api/subjectsAPI';

import type { Graph } from '@/interfaces/Graph';
import type { SubjectNoCareers } from '@/interfaces/Subject';
import type { OptionalQueryOptions } from '../types';

interface Props<T = Graph<SubjectNoCareers>> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchSubjectsElectivesGraphOptions({ queryOptions: queryOpt }: Props = {}) {
  return queryOptions({
    queryKey: ['subjects', 'electives', 'graph'],
    queryFn: () => getSubjectsElectivesGraph(),
    ...queryOpt,
  });
}

export default function useFetchSubjectsElectivesGraph(props?: Props) {
  const query = useQuery(fetchSubjectsElectivesGraphOptions(props));
  return query;
}
