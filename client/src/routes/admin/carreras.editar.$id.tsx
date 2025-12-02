import { createFileRoute } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import CareerForm from '@/features/admin/careers/CareerForm';
import { getCompleteCareer } from '@/api/careersApi';
import { Spinner } from '@ui/spinner';

export const Route = createFileRoute('/admin/carreras/editar/$id')({
  head: () => ({
    meta: [
      {
        title: 'Editar Carrera | MetroGrama',
      },
    ],
  }),
  component: UpdateCareer,
});

function UpdateCareer() {
  const { id } = useParams({ from: '/admin/carreras/editar/$id' });

  const { data, isLoading } = useQuery({
    queryKey: ['career', id],
    queryFn: () => getCompleteCareer(id),
  });

  // TODO - Mejor maneo de loading y error
  if (isLoading) return <Spinner />;

  if (!data) return null;

  console.log(data);
  return <CareerForm mode="edit" data={data} />;
}
