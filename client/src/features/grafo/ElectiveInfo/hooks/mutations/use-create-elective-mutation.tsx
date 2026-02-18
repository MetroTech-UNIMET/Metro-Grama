import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createSubjectElective } from '@/api/subjectsAPI';
import { surrealIdToId } from '@utils/queries';

type CreateElectiveArgs = Parameters<typeof createSubjectElective>;

interface Props {
  afterSubmit?: () => void;
}

export function useCreateElectiveMutation({ afterSubmit }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-subject-elective'],
    mutationFn: async ({ data }: { data: CreateElectiveArgs[0] }) => {
      return createSubjectElective(data);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['subjects', 'electives', 'graph'] });
      queryClient.setQueryData(['subjects', 'electives', 'graph'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          nodes: [
            ...oldData.nodes,
            {
              id: surrealIdToId(result.id),
              data: result,
            },
          ],
        };
      });
      toast.success('Materia electiva creada correctamente');
      afterSubmit?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error al crear la materia electiva');
      throw error;
    },
  });
}
