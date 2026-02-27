import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateEnrolledStudent } from '@/api/interactions/enrollApi';

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
    mutationKey: ['update-enroll-subject', subjectCode],
    mutationFn: async ({ data }: { data: EnrollDialogOutput }) => {
      if (!subjectCode) throw new Error('Es necesario seleccionar una materia');
      if (!originalTrimesterId) throw new Error('El ID del trimestre original es requerido para actualizar la cursada');

      return updateEnrolledStudent(subjectCode, data, originalTrimesterId);
    },
    onSuccess: async (result, { data }) => {
      if (!subjectCode) return;
      await queryClient.invalidateQueries({ queryKey: ['subjects', subjectCode, 'stats'] });
      await queryClient.invalidateQueries({ queryKey: ['student', 'details', 'my-id'] });
      await queryClient.invalidateQueries({ queryKey: ['subjects', 'offer'] });
      await queryClient.invalidateQueries({ queryKey: ['student', 'enrolled-subjects'] });

      // REVIEW - Capaz sea mejor hacer un setData del enrollment como ya tengo los datos
      await queryClient.invalidateQueries({ queryKey: ['subjects', subjectCode, 'enrollment'] });

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
