import { UserX } from 'lucide-react';

import { useEliminateFriend } from '@/hooks/mutations/friend/use-eliminate-friend';

import { LoadingButton } from '@ui/derived/submit-button';
import { Button } from '@ui/button';

interface Props extends React.ComponentProps<typeof Button> {
  userToRejectId: string;
}

export function RejectFriendButton({ userToRejectId, disabled, ...props }: Props) {
  const eliminateMutation = useEliminateFriend({ studentId: userToRejectId });

  return (
    <LoadingButton
      size="sm"
      colors="destructive"
      className="transition-colors"
      isLoading={eliminateMutation.isPending}
      onClick={() => eliminateMutation.mutate()}
      disabled={eliminateMutation.isPending || disabled}
      {...props}
    >
      {!eliminateMutation.isPending && <UserX />}
      Rechazar
    </LoadingButton>
  );
}
