import { createFileRoute } from '@tanstack/react-router';

import { ofertaSearchSchema } from './queryParams';

import { getMetaTags } from '@utils/meta';

import { OfertaAcademicTable } from '@/features/oferta/OfertaAcademicTable';

import { fetchAnnualOfferByYearOptions } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-year';

const route = '/_navLayout/oferta/edit';

export const Route = createFileRoute(route)({
  validateSearch: ofertaSearchSchema,
  loaderDeps: ({ search: { career, year } }) => ({ career, year }),
  loader: async ({ deps: { career, year }, context: { queryClient } }) => {
    queryClient.ensureQueryData(fetchAnnualOfferByYearOptions({ year, career }));
  },
  head: () => {
    return {
      meta: getMetaTags({
        title: 'Editar Oferta Académica | MetroGrama',
        description: 'Consulta y edita la oferta académica por carrera y año en MetroGrama',
      }),
    };
  },
  component: OfertaEditPage,
});

function OfertaEditPage() {
  return <OfertaAcademicTable from={route} editMode={true} />;
}
