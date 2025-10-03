import { UserCheck, UserX, UserPlus } from 'lucide-react';

import { useEliminateFriend } from '@/hooks/mutations/friend/use-eliminate-friend';
import { useAddFriend } from '@/hooks/mutations/friend/use-add-friend';

import { LoadingButton } from '@ui/derived/submit-button';

import type { OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  userToAddId: string;
  friendshipStatus: OtherStudentDetails['friendship_status'];
}

export function AddFriendButton({ userToAddId, friendshipStatus }: Props) {
  const addMutation = useAddFriend({ studentId: userToAddId });
  const eliminateMutation = useEliminateFriend({ studentId: userToAddId });

  function handleOnClick() {
    if (friendshipStatus === 'accepted' || friendshipStatus === 'pending') {
      eliminateMutation.mutate();
    } else {
      addMutation.mutate();
    }
  }

  return (
    <LoadingButton
      size="sm"
      colors={friendshipStatus === 'pending' ? 'destructive' : 'secondary'}
      className="transition-colors"
      isLoading={addMutation.isPending || eliminateMutation.isPending}
      onClick={handleOnClick}
      disabled={addMutation.isPending || eliminateMutation.isPending}
    >
      {friendshipStatus === 'accepted' && (
        <>
          <UserCheck /> Amigos
        </>
      )}

      {friendshipStatus === 'pending' && (
        <>
          <UserX /> Cancelar solicitud
        </>
      )}

      {friendshipStatus === 'none' && (
        <>
          <UserPlus /> Agregar amigo
        </>
      )}
    </LoadingButton>
  );
}
