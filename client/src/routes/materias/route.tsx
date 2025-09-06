import { createFileRoute } from '@tanstack/react-router';
import GraphLayout from '@/layouts/GraphLayout';
import Graph from '@/features/grafo/Graph';
import { StatusActions } from '@/features/grafo/behaviors/StatusActions';
import { SubjectSheet, SubjectSheetContent } from '@/features/grafo/SubjectSheet';
import { materiasSearchSchema } from './queryParams';

// TODO - Implementar loader con ensureQueryData
export const Route = createFileRoute('/materias')({
  validateSearch: materiasSearchSchema,
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
