import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addFriend } from '@/api/interactions/friendApi';

import type { OtherStudentDetails } from '@/interfaces/Student';

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
        return {
          ...oldData,
          friendship_status: 'pending',
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
