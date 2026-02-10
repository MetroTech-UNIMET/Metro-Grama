import { createFileRoute } from '@tanstack/react-router';
import CareerForm from '@/features/admin/careers/CareerForm';
import { fetchSubjectsOptions } from '@/hooks/queries/subject/use-FetchSubjects';
import ErrorPage from '@components/ErrorPage';

export const Route = createFileRoute('/admin/carreras/crear')({
  head: () => ({
    meta: [
      {
        title: 'Crear Carrera | MetroGrama',
      },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchSubjectsOptions()),
  component: CreateCareer,
  errorComponent: (props) => <ErrorPage title="Error cargando el creador de carreras" {...props} />,
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
