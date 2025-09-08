import { createFileRoute } from '@tanstack/react-router';
import GraphLayout from '@/layouts/GraphLayout';
import Graph from '@/features/grafo/Graph';
import { StatusActions } from '@/features/grafo/behaviors/StatusActions';
import { SubjectSheet, SubjectSheetContent } from '@/features/grafo/SubjectSheet';
import { materiasSearchSchema } from './queryParams';
import { fetchSubjectsGraphByCareerOptions } from '@/hooks/queries/subject/use-FecthSubjectsGraphByCareer';

export const Route = createFileRoute('/_navLayout/materias/')({
  validateSearch: materiasSearchSchema,
  loaderDeps: ({ search: { careers } }) => ({
    careers,
  }),
  loader: async ({ context, deps: { careers } }) =>
    context.queryClient.ensureQueryData(fetchSubjectsGraphByCareerOptions(careers)),
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
