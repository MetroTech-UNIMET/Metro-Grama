import { useQuery, queryOptions } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';

import { getSubjectsGraph } from '@/api/subjectsAPI';

import type { Graph } from '@/interfaces/Graph';
import type { Subject } from '@/interfaces/Subject';

export function fetchSubjectsGraphByCareerOptions(careers: string[]) {
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
  });
}

export default function useFetchSubjectsGraphByCareer() {
  const search = useSearch({ from: '/_navLayout/materias/' });
  const careersArray = search.careers ?? [];

  const subjectQuery = useQuery(fetchSubjectsGraphByCareerOptions(careersArray));

  return subjectQuery;
}
