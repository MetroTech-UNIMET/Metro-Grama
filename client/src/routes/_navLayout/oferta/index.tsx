import { createFileRoute } from '@tanstack/react-router';

import { ofertaSearchSchema } from './queryParams';
import { OfertaAcademicTable } from '@/features/oferta/OfertaAcademicTable';

export const Route = createFileRoute('/_navLayout/oferta/')({
  validateSearch: ofertaSearchSchema,
  loaderDeps: ({ search: { career, year } }) => ({ career, year }),
  loader: async ({ deps: { career, year } }) => ({ career, year }),
  component: OfertaRoute,
});

function OfertaRoute() {
  return <OfertaAcademicTable />;
}
