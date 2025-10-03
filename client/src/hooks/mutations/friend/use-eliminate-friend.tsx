import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { eliminateFriend } from '@/api/interactions/friendApi';

import type { OtherStudentDetails } from '@/interfaces/Student';
import { fetchStudentByIdOptions } from '@/hooks/queries/student/use-fetch-student-by-id';

interface Props {
  studentId: string;
}

export function useEliminateFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['friend', 'eliminate'],
    mutationFn: () => eliminateFriend(studentId),
    onSuccess: async () => {
      const friendship_status = (await queryClient.ensureQueryData(fetchStudentByIdOptions({ studentId })))
        .friendship_status;

      toast.success(`${friendship_status === 'pending' ? 'Solicitud de amistad cancelada' : 'Amistad eliminada'}`);

      queryClient.setQueryData(['student', 'details', studentId], (oldData: OtherStudentDetails | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          friendship_status: 'none',
        };
      });
    },

    onError: async (error) => {
      const friendship_status = (await queryClient.ensureQueryData(fetchStudentByIdOptions({ studentId })))
        .friendship_status;

      toast.error(
        `Error al ${friendship_status === 'pending' ? 'cancelar la solicitud de amistad' : 'eliminar la amistad'}`,
        {
          description: error.message,
        },
      );
    },
  });
}
