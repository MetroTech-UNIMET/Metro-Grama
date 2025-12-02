import { createFileRoute } from '@tanstack/react-router';
import CareerForm from '@/features/admin/careers/CareerForm';
import { fetchSubjectsOptions } from '@/hooks/queries/subject/use-FetchSubjects';

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
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
