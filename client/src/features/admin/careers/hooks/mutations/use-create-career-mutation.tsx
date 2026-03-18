import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createCareer } from '@/api/careersApi';
import { mutationKeys, queryKeys } from '@/lib/query-keys';
import { idToSurrealId } from '@utils/queries';

import { transformCreateData, validateOnSubmit } from '../../functions';

import type { CreateCareerOutput } from '../../schema';

export function useMutationCreateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.careers.create,
    mutationFn: async ({ data }: { data: CreateCareerOutput }) => {
      if (!validateOnSubmit(data)) throw new Error('Datos inválidos');

      const payload = transformCreateData(data);
      await createCareer(payload);

      return data;
    },
    onSuccess: async (data) => {
      const careersCsv = idToSurrealId(data.id, 'career');

      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.list(careersCsv).queryKey });
      await queryClient.invalidateQueries({ queryKey: queryKeys.careers.all.queryKey });
    },
    onError: (error) => {
      toast.error('Error al guardar la carrera', {
        description: error.message || 'Intente de nuevo más tarde',
      });
      throw error;
    },
  });
}
