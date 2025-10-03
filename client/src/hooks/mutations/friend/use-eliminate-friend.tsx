import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { eliminateFriend } from '@/api/interactions/friendApi';

import { fetchStudentByIdOptions } from '@/hooks/queries/student/use-fetch-student-by-id';
import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';

import type { OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  studentId: string;
}

export function useEliminateFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['friend', 'eliminate', studentId],
    mutationFn: () => eliminateFriend(studentId),
    onSuccess: async () => {
      const friendship_status = (await queryClient.ensureQueryData(fetchStudentByIdOptions({ studentId })))
        .friendship_status;

      const studentDetails = await queryClient.ensureQueryData(fetchStudentDetailsOptions());

      toast.success(`${friendship_status === 'pending' ? 'Solicitud de amistad cancelada' : 'Amistad eliminada'}`);

      queryClient.setQueryData(['student', 'details', 'my-id'], (oldData: typeof studentDetails | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          friend_applications: (oldData.friend_applications || []).filter((app) => app.id.ID !== studentId),
        } as typeof studentDetails;
      });

      queryClient.setQueryData(['student', 'details', studentId], (oldData: OtherStudentDetails | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          friendship_status: 'none',
        } as OtherStudentDetails;
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
