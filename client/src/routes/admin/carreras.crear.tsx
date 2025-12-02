import { createFileRoute } from '@tanstack/react-router';
import CareerForm from '@/features/admin/careers/CareerForm';
import { fetchSubjectsOptions } from '@/hooks/queries/subject/use-FetchSubjects';

export const Route = createFileRoute('/admin/carreras/crear')({
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchSubjectsOptions()),
  component: CreateCareer,
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
