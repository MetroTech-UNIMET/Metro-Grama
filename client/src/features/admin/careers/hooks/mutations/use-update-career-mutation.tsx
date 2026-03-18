import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateCareer } from '@/api/careersApi';
import { mutationKeys, queryKeys } from '@/lib/query-keys';
import { idToSurrealId } from '@utils/queries';

import { buildDirtyCareerFields, transformEditData, validateOnSubmit } from '../../functions';

import type { CreateCareerInput, CreateCareerOutput } from '../../schema';
import type { DirtyFields } from '@utils/forms';
import type { CareerWithSubjects } from '@/interfaces/Career';

interface MutationInput {
  originalData: CareerWithSubjects;
  data: CreateCareerOutput;
  dirtyFields: DirtyFields<CreateCareerInput>;
}

export function useMutationUpdateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.careers.update,
    mutationFn: async ({ originalData, data, dirtyFields }: MutationInput) => {
      if (!validateOnSubmit(data)) throw new Error('Datos inválidos');

      const filtered = buildDirtyCareerFields(data, dirtyFields);
      const payload = transformEditData(filtered);

      await updateCareer(originalData, payload);

      return { oldCareerId: originalData.id.ID, newCareerId: data.id };
    },
    onSuccess: async ({ oldCareerId }) => {
      const careersCsv = idToSurrealId(oldCareerId, 'career');

      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.list(careersCsv).queryKey });
      await queryClient.invalidateQueries({ queryKey: queryKeys.careers.all.queryKey });

      await queryClient.invalidateQueries({ queryKey: queryKeys.careers.detail(oldCareerId).queryKey });
    },
    onError: (error) => {
      toast.error('Error al guardar la carrera', {
        description: error.message || 'Intente de nuevo más tarde',
      });
      throw error;
    },
  });
}
