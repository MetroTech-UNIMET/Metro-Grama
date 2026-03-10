import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { acceptFriend } from '@/api/interactions/friendApi';

import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';
import { mutationKeys, queryKeys } from '@/lib/query-keys';

import type { OtherStudentDetails } from '@/api/interactions/student.types';

interface Props {
  studentId: string;
}

export function useAcceptFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.friends.accept(studentId),
    mutationFn: () => acceptFriend(studentId),
    onSuccess: async () => {
      const studentDetails = await queryClient.ensureQueryData(fetchStudentDetailsOptions());

      toast.success('Solicitud de amistad aceptada');

      queryClient.setQueryData(
        queryKeys.student.details('my-id').queryKey,
        (oldData: typeof studentDetails | undefined) => {
          if (!oldData) return oldData;

          const accepted = (oldData.friend_applications || []).find((app) => app.id.ID === studentId);

          return {
            ...oldData,
            friends: accepted ? [...(oldData.friends || []), accepted] : oldData.friends,
            friend_applications: (oldData.friend_applications || []).filter((app) => app.id.ID !== studentId),
          } as typeof studentDetails;
        },
      );

      queryClient.setQueryData(
        queryKeys.student.details(studentId).queryKey,
        (oldData: OtherStudentDetails | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            receiving_friendship_status: 'accepted',
            friendship_status: 'accepted',
          };
        },
      );
    },
    onError: (error) => {
      toast.error('Error al aceptar la solicitud de amistad', {
        description: error.message,
      });
    },
  });
}
