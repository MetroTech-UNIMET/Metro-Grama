import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateEnrolledStudent } from '@/api/interactions/enrollApi';
import { mutationKeys, queryKeys } from '@/lib/query-keys';

import type { EnrollDialogOutput } from '../../schema';
import type { Id } from '@/interfaces/surrealDb';

interface Props {
  subjectCode: string | undefined;
  afterSubmit: (data: EnrollDialogOutput) => void;
  originalTrimester: string | undefined;
}

export function useMutationUpdateEnrollSubject({ subjectCode, afterSubmit, originalTrimester }: Props) {
  const queryClient = useQueryClient();

  const originalTrimesterId: Id<'trimester'> | undefined = originalTrimester
    ? {
        Table: 'trimester',
        ID: originalTrimester,
      }
    : undefined;

  return useMutation({
    mutationKey: mutationKeys.enroll.update(subjectCode),
    mutationFn: async ({ data }: { data: EnrollDialogOutput }) => {
      if (!subjectCode) throw new Error('Es necesario seleccionar una materia');
      if (!originalTrimesterId) throw new Error('El ID del trimestre original es requerido para actualizar la cursada');

      return updateEnrolledStudent(subjectCode, data, originalTrimesterId);
    },
    onSuccess: async (result, { data }) => {
      if (!subjectCode) return;
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subjects.details(subjectCode)._ctx.stats(undefined).queryKey,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.details('my-id').queryKey });
      await queryClient.invalidateQueries({ queryKey:  queryKeys.subjectOffers._def  }); //REVIEW Ya ni me acuerdo porq ue invalidaba esto, en verdad es necesario? Capaz para cuando es especifica por trimestre por el tema de los stats
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.enrolledSubjects().queryKey });

      // REVIEW - Capaz sea mejor hacer un setData del enrollment como ya tengo los datos
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subjects.details(subjectCode)._ctx.enrollment.queryKey,
      });

      toast.success('Cursada actualizada exitosamente', {
        description: result.message || 'La materia se actualizó correctamente',
      });
      afterSubmit(data);
    },
    onError: (error) => {
      toast.error('Error al actualizar materia', {
        description: error.message || 'Intente de nuevo más tarde',
      });
      throw error;
    },
  });
}
