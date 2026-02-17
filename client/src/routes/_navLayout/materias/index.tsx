import { createFileRoute } from '@tanstack/react-router';

import { materiasSearchSchema } from './queryParams';

import { getMetaTags } from '@utils/meta';

import Graph from '@/features/grafo/Graph';
import { StatusActions } from '@/features/grafo/behaviors/StatusActions';
import { SubjectSheet, SubjectSheetContent } from '@/features/grafo/SubjectSheet/SubjectSheet';

import { fetchSubjectsGraphByCareerOptions } from '@/hooks/queries/subject/use-FecthSubjectsGraphByCareer';

import GraphLayout from '@/layouts/GraphLayout';

export const Route = createFileRoute('/_navLayout/materias/')({
  validateSearch: materiasSearchSchema,
  loaderDeps: ({ search: { careers } }) => ({
    careers,
  }),
  loader: async ({ context, deps: { careers } }) =>
    context.queryClient.ensureQueryData(fetchSubjectsGraphByCareerOptions(careers)),
  head: () => ({
    meta: getMetaTags({
      title: 'Materias | MetroGrama',
      description: 'Explora las materias y sus relaciones académicas en MetroGrama',
    }),
  }),
  component: GraphRoute,
});

function GraphRoute() {
  return (
    <GraphLayout>
      <StatusActions>
        <SubjectSheet>
          <Graph />
          <SubjectSheetContent />
        </SubjectSheet>
      </StatusActions>
    </GraphLayout>
  );
}
