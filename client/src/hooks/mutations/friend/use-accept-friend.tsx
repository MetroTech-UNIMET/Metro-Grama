import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { acceptFriend } from '@/api/interactions/friendApi';

import type { OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  studentId: string;
}

export function useAcceptFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['friend', 'accept'],
    mutationFn: () => acceptFriend(studentId),
    onSuccess: () => {
      toast.success('Solicitud de amistad aceptada');

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
