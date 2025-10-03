import { UserX } from 'lucide-react';

import { useEliminateFriend } from '@/hooks/mutations/friend/use-eliminate-friend';

import { LoadingButton } from '@ui/derived/submit-button';

interface Props {
  userToAddId: string;
}

// Exclusively rejects/cancels a pending friend request
export function RejectFriendButton({ userToAddId }: Props) {
  const eliminateMutation = useEliminateFriend({ studentId: userToAddId });

  return (
    <LoadingButton
      size="sm"
      colors="destructive"
      className="transition-colors"
      isLoading={eliminateMutation.isPending}
      onClick={() => eliminateMutation.mutate()}
      disabled={eliminateMutation.isPending}
    >
      <UserX /> Rechazar
    </LoadingButton>
  );
}
