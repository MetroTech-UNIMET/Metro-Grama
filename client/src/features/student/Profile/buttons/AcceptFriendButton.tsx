import { UserPlus } from 'lucide-react';

import { useAcceptFriend } from '@/hooks/mutations/friend/use-accept-friend';

import { LoadingButton } from '@ui/derived/submit-button';
import { Button } from '@ui/button';

interface Props extends React.ComponentProps<typeof Button> {
  userToAcceptId: string;
}

export function AcceptFriendButton({ userToAcceptId, disabled, ...props }: Props) {
  const acceptMutation = useAcceptFriend({ studentId: userToAcceptId });

  return (
    <LoadingButton
      size="sm"
      colors="secondary"
      className="transition-colors"
      isLoading={acceptMutation.isPending}
      onClick={() => acceptMutation.mutate()}
      disabled={acceptMutation.isPending || disabled}
      {...props}
    >
      {!acceptMutation.isPending && <UserPlus />}
      Aceptar
    </LoadingButton>
  );
}
