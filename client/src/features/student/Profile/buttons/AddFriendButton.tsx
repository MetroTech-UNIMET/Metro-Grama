import { UserCheck, UserX, UserPlus } from 'lucide-react';

import { cn } from '@utils/className';

import { useEliminateFriend } from '@/hooks/mutations/friend/use-eliminate-friend';
import { useAddFriend } from '@/hooks/mutations/friend/use-add-friend';

import { LoadingButton } from '@ui/derived/submit-button';

import type { OtherStudentDetails } from '@/api/interactions/student.types';

interface Props
  extends Omit<React.ComponentProps<typeof LoadingButton>, 'isLoading' | 'onClick' | 'disabled' | 'children'> {
  userToAddId: string;
  friendshipStatus: OtherStudentDetails['friendship_status'];
}

export function AddFriendButton({ userToAddId, friendshipStatus, className, ...props }: Props) {
  const addMutation = useAddFriend({ studentId: userToAddId });
  const eliminateMutation = useEliminateFriend({ studentId: userToAddId });

  function handleOnClick() {
    if (friendshipStatus === 'accepted' || friendshipStatus === 'pending') {
      eliminateMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }

  const isLoading = addMutation.isPending || eliminateMutation.isPending;

  const icon = isLoading ? undefined : friendshipStatus === 'accepted' ? (
    <UserCheck />
  ) : friendshipStatus === 'pending' ? (
    <UserX />
  ) : (
    <UserPlus />
  );

  return (
    <LoadingButton
      size="sm"
      colors={friendshipStatus === 'pending' ? 'destructive' : 'secondary'}
      className={cn('transition-colors', className)}
      isLoading={isLoading}
      onClick={handleOnClick}
      disabled={isLoading}
      {...props}
    >
      {friendshipStatus === 'accepted' && <>{icon} Amigos</>}

      {friendshipStatus === 'pending' && <>{icon} Cancelar solicitud</>}

      {friendshipStatus === 'none' && <>{icon} Agregar amigo</>}
    </LoadingButton>
  );
}
