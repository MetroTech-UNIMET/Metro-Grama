import { UserPlus } from 'lucide-react';

import { useAcceptFriend } from '@/hooks/mutations/friend/use-accept-friend';

import { LoadingButton } from '@ui/derived/submit-button';
import { Button } from '@ui/button';

interface Props extends React.ComponentProps<typeof Button> {
  userToAcceptId: string;
}

// Exclusively accepts a pending friend request
export function AcceptFriendButton({ userToAcceptId, ...props }: Props) {
  const acceptMutation = useAcceptFriend({ studentId: userToAcceptId });

  return (
    <LoadingButton
      size="sm"
      colors="secondary"
      isLoading={acceptMutation.isPending}
      onClick={() => acceptMutation.mutate()}
      disabled={acceptMutation.isPending}
      {...props}
    >
      <UserPlus /> Aceptar
    </LoadingButton>
  );
}
