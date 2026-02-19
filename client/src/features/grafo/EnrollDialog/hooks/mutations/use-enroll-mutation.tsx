import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { enrollStudent } from '@/api/interactions/enrollApi';
import { useStatusActions } from '@/features/grafo/behaviors/StatusActions';

import type { SubjectNode } from '@/features/grafo/behaviors/MenuActions';

type EnrollStudentArgs = Parameters<typeof enrollStudent>;

interface Props {
  subject: SubjectNode | null;
  afterSubmit: () => void;
}

export function useMutationEnrollSubject({ subject, afterSubmit }: Props) {
  const subjectCode = subject?._cfg?.model?.data.data.code.ID ?? '';

  const queryClient = useQueryClient();
  const { nodeActions } = useStatusActions();

  return useMutation({
    mutationKey: ['enroll-subject', subjectCode],
    mutationFn: async ({ data }: { data: EnrollStudentArgs[1] }) => {
      if (!subject) throw new Error('Es necesario seleccionar una materia');

      return enrollStudent(subjectCode, data);
    },
    onSuccess: async (result, { data }) => {
      if (!subject) return;
      await queryClient.invalidateQueries({ queryKey: ['subjects', subjectCode, 'stats'], refetchType: 'all' });

      if (data.grade >= 10) nodeActions.enableViewedNode(subject);

      toast.success('Materia marcada exitosamente', {
        description: result.message || 'La materia se marcó como cursada',
      });
      afterSubmit();
    },
    onError: (error) => {
      toast.error('Error al marcar materia vista', {
        description: error.message || 'Intente de nuevo más tarde',
      });
      throw error;
    },
  });
}
