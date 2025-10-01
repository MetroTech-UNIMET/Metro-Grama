import { useMutation } from '@tanstack/react-query';
import { eliminateFriend } from '@/api/interactions/friendApi';

export function useEliminateFriend() {
  return useMutation({
    mutationKey: ['friend', 'eliminate'],
    mutationFn: (studentId: string) => eliminateFriend(studentId),
  });
}
