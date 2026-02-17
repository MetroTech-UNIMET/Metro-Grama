import { createFileRoute } from '@tanstack/react-router';

import { ofertaSearchSchema } from './queryParams';

import { getMetaTags } from '@utils/meta';

import { OfertaAcademicTable } from '@/features/oferta/OfertaAcademicTable';

import { fetchAnnualOfferByYearOptions } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';

export const Route = createFileRoute('/_navLayout/oferta/')({
  validateSearch: ofertaSearchSchema,
  loaderDeps: ({ search: { career, year } }) => ({ career, year }),
  loader: async ({ deps: { career, year }, context: { queryClient } }) => {
    queryClient.ensureQueryData(fetchAnnualOfferByYearOptions({ year, career }));
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
  return <OfertaAcademicTable />;
}
