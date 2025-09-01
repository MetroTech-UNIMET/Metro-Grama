import { createFileRoute } from '@tanstack/react-router';
import CareerForm from '@/features/admin/careers/CareerForm';

export const Route = createFileRoute('/admin/carreras/crear')({
  component: CreateCareer,
});

function CreateCareer() {
  return <CareerForm mode="create" />;
}
