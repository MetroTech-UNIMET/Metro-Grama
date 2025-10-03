import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { acceptFriend } from '@/api/interactions/friendApi';

import { fetchStudentDetailsOptions } from '@/hooks/queries/student/use-fetch-student-details';

import type { OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  studentId: string;
}

export function getAcceptFriendMutationKey(studentId: string) {
  return ['friend', 'accept', studentId] as const;
}

export function useAcceptFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getAcceptFriendMutationKey(studentId),
    mutationFn: () => acceptFriend(studentId),
    onSuccess: async () => {
      const studentDetails = await queryClient.ensureQueryData(fetchStudentDetailsOptions());

      toast.success('Solicitud de amistad aceptada');

      queryClient.setQueryData(['student', 'details', 'my-id'], (oldData: typeof studentDetails | undefined) => {
        if (!oldData) return oldData;

        const accepted = (oldData.friend_applications || []).find((app) => app.id.ID === studentId);

        return {
          ...oldData,
          friends: accepted ? [...(oldData.friends || []), accepted] : oldData.friends,
          friend_applications: (oldData.friend_applications || []).filter((app) => app.id.ID !== studentId),
        } as typeof studentDetails;
      });

      queryClient.setQueryData(['student', 'details', studentId], (oldData: OtherStudentDetails | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          receiving_friendship_status: 'accepted',
          friendship_status: 'accepted',
        };
      });
    },
    onError: (error) => {
      toast.error('Error al aceptar la solicitud de amistad', {
        description: error.message,
      });
    },
  });
}
