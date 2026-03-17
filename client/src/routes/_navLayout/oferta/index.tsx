import { createFileRoute } from '@tanstack/react-router';

import { ofertaSearchSchema } from './queryParams';

import { getMetaTags } from '@utils/meta';

import { OfertaAcademicTable } from '@/features/oferta/OfertaAcademicTable';

import { fetchAnnualOfferByYearOptions } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';

const route = '/_navLayout/oferta/';

export const Route = createFileRoute(route)({
  validateSearch: ofertaSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps: { career, year, includeElectives }, context: { queryClient } }) => {
    queryClient.ensureQueryData(fetchAnnualOfferByYearOptions({ year, query: { career, includeElectives } }));
  },
  head: () => ({
    meta: getMetaTags({
      title: 'Oferta Académica | MetroGrama',
      description: 'Consulta la oferta académica por carrera y año en MetroGrama',
    }),
  }),
  component: OfertaRoute,
});

function OfertaRoute() {
  return <OfertaAcademicTable from={route} editMode={false} />;
}
