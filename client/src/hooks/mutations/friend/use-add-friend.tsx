import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addFriend } from '@/api/interactions/friendApi';

import type { OtherStudentDetails } from '@/api/interactions/student.types';

interface Props {
  studentId: string;
}

export function useAddFriend({ studentId }: Props) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['friend', 'add', studentId],
    mutationFn: () => addFriend(studentId),
    onSuccess: () => {
      toast.success('Solicitud de amistad enviada');

      queryClient.setQueryData(['student', 'details', studentId], (oldData: OtherStudentDetails | undefined) => {
        if (!oldData) return oldData;
        const isPending = oldData.receiving_friendship_status === 'pending';

        return {
          ...oldData,
          friendship_status: isPending ? 'accepted' : 'pending',
          receiving_friendship_status: isPending ? 'none' : oldData.receiving_friendship_status,
        };
      });
    },
    onError: (error) => {
      toast.error('Error al enviar la solicitud de amistad', {
        description: error.message,
      });
    },
  });
}
