import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { enrollStudent } from '@/api/interactions/enrollApi';

import type { EnrollDialogOutput } from '../../schema';

interface Props {
  subjectCode: string | undefined;
  afterSubmit: (data: EnrollDialogOutput) => void;
}

export function useMutationEnrollSubject({ subjectCode, afterSubmit }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['enroll-subject', subjectCode],
    mutationFn: async ({ data }: { data: EnrollDialogOutput }) => {
      if (!subjectCode) throw new Error('Es necesario seleccionar una materia');

      return enrollStudent(subjectCode, data);
    },
    onSuccess: async (result, { data }) => {
      if (!subjectCode) return;
      await queryClient.invalidateQueries({ queryKey: ['subjects', subjectCode, 'stats'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['student', 'details', 'my-id'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['subjects', 'offer'], refetchType: 'all' });
      await queryClient.invalidateQueries({ queryKey: ['student', 'enrolled-subjects'] });

      toast.success('Materia marcada exitosamente', {
        description: result.message || 'La materia se marcó como cursada',
      });
      afterSubmit(data);
    },
    onError: (error) => {
      toast.error('Error al marcar materia vista', {
        description: error.message || 'Intente de nuevo más tarde',
      });
      throw error;
    },
  });
}
