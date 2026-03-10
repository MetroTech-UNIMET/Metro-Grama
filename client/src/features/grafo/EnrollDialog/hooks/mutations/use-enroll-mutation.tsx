import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { enrollStudent } from '@/api/interactions/enrollApi';
import { mutationKeys, queryKeys } from '@/lib/query-keys';

import type { EnrollDialogOutput } from '../../schema';

interface Props {
  subjectCode: string | undefined;
  afterSubmit: (data: EnrollDialogOutput) => void;
}

export function useMutationEnrollSubject({ subjectCode, afterSubmit }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.enroll.create(subjectCode),
    mutationFn: async ({ data }: { data: EnrollDialogOutput }) => {
      if (!subjectCode) throw new Error('Es necesario seleccionar una materia');

      return enrollStudent(subjectCode, data);
    },
    onSuccess: async (result, { data }) => {
      if (!subjectCode) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subjects.details(subjectCode)._ctx.stats(undefined).queryKey,
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.student.details('my-id').queryKey,
        refetchType: 'all',
      });
      await queryClient.invalidateQueries({ queryKey:  queryKeys.subjectOffers._def, refetchType: 'all' }); //REVIEW Ya ni me acuerdo porq ue invalidaba esto, en verdad es necesario? Capaz para cuando es especifica por trimestre por el tema de los stats
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.enrolledSubjects._def });

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
