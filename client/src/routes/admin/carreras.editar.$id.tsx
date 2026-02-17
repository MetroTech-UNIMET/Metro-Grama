import { createFileRoute } from '@tanstack/react-router';

import { fetchSubjectsOptions } from '@/hooks/queries/subject/use-FetchSubjects';
import { useFetchCompleteCareer, fetchCompleteCareerOptions } from '@/hooks/queries/career/use-fetch-complete-career';

import CareerForm from '@/features/admin/careers/CareerForm';

import { getMetaTags } from '@utils/meta';
import ErrorPage from '@components/ErrorPage';

import { Spinner } from '@ui/spinner';

export const Route = createFileRoute('/admin/carreras/editar/$id')({
  loader: async ({ context: { queryClient: qc }, params: { id } }) => {
    qc.ensureQueryData(fetchSubjectsOptions());
    const career = await qc.ensureQueryData(fetchCompleteCareerOptions({ id }));
    return { career };
  },
  head: ({ loaderData }) => {
    const title = `Editar ${loaderData?.career.name} | MetroGrama`;
    const description = `Edita la carrera ${loaderData?.career.name} en MetroGrama`;

    return {
      meta: getMetaTags({
        title,
        description,
      }),
    };
  },
  errorComponent: (props) => <ErrorPage title="Error cargando el editor de carreras" {...props} />,

  component: UpdateCareer,
});

function UpdateCareer() {
  const { id } = Route.useParams();

  const { data, isLoading } = useFetchCompleteCareer({ id });
  // TODO - Mejor maneo de loading y error
  if (isLoading) return <Spinner />;

  if (!data) return null;

  console.log(data);
  return <CareerForm mode="edit" data={data} />;
}
