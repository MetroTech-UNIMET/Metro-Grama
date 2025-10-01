import { useMutation } from '@tanstack/react-query';
import { addFriend } from '@/api/interactions/friendApi';

export function useAddFriend() {
  return useMutation({
    mutationKey: ['friend', 'add'],
    mutationFn: (studentId: string) => addFriend(studentId),
  });
}
