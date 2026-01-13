import { useQuery, queryOptions } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';

import { getSubjectsGraph } from '@/api/subjectsAPI';

import type { Graph } from '@/interfaces/Graph';
import type { Subject } from '@/interfaces/Subject';
import { OptionalQueryOptions } from '../types';

interface Props<T = Graph<Subject>> {
  queryOptions?: OptionalQueryOptions<T>;
}

export function fetchSubjectsGraphByCareerOptions(careers: string[], { queryOptions: queryOpt }: Props = {}) {
  const careersCsv = careers.length === 0 ? 'none' : careers.sort().join(',');
  return queryOptions<Graph<Subject>>({
    queryKey: [
      'subjects',
      'graph',
      {
        careers: careersCsv,
      },
    ],
    queryFn: () => getSubjectsGraph(careersCsv),
    ...queryOpt,
  });
}

export function useFetchSubjectsGraphByCareer(props?: Props) {
  const search = useSearch({ from: '/_navLayout/materias/' });
  const careersArray = search.careers ?? [];

  const subjectQuery = useQuery(fetchSubjectsGraphByCareerOptions(careersArray, props));

  return subjectQuery;
}
