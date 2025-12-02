import { createFileRoute } from '@tanstack/react-router';
import CareerForm from '@/features/admin/careers/CareerForm';

export const Route = createFileRoute('/admin/carreras/crear')({
  head: () => ({
    meta: [
      {
        title: 'Crear Carrera | MetroGrama',
      },
    ],
  }),
  component: CreateCareer,
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
