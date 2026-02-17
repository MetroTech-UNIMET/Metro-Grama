import { createFileRoute } from '@tanstack/react-router';

import { getMetaTags } from '@utils/meta';

import ErrorPage from '@components/ErrorPage';

import CareerForm from '@/features/admin/careers/CareerForm';

import { fetchSubjectsOptions } from '@/hooks/queries/subject/use-FetchSubjects';

export const Route = createFileRoute('/admin/carreras/crear')({
  head: () => ({
    meta: getMetaTags({
      title: 'Crear Carrera | MetroGrama',
      description: 'Crea una nueva carrera en MetroGrama',
    }),
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchSubjectsOptions()),
  component: CreateCareer,
  errorComponent: (props) => <ErrorPage title="Error cargando el creador de carreras" {...props} />,
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
