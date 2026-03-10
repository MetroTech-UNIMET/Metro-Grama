import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createSubjectElective } from '@/api/subjectsAPI';
import { surrealIdToId } from '@utils/queries';
import { mutationKeys, queryKeys } from '@/lib/query-keys';

type CreateElectiveArgs = Parameters<typeof createSubjectElective>;

interface Props {
  afterSubmit?: () => void;
}

export function useCreateElectiveMutation({ afterSubmit }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.subjects.createElective,
    mutationFn: async ({ data }: { data: CreateElectiveArgs[0] }) => {
      return createSubjectElective(data);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.electivesGraph.queryKey });
      queryClient.setQueryData(queryKeys.subjects.electivesGraph.queryKey, (oldData: any) => {
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
