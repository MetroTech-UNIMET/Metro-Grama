import { AcceptFriendButton } from './buttons/AcceptFriendButton';
import { FriendsCard } from './cards/FriendsCard';
import { SubjectsCard } from './cards/SubjectsCard';
import { StudentCard } from './cards/StudentCard';
import { isMyProfile } from './utils';

import type { MyStudentDetails, OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  data: OtherStudentDetails | MyStudentDetails;
}

export default function Profile({ data }: Props) {
  const name = `${data.user.firstName} ${data.user.lastName}`.trim();

  const isSelf = isMyProfile(data);

  return (
    <>
      {!isSelf && data.receiving_friendship_status === 'pending' && (
        <div
          role="alert"
          className="bg-secondary-600 border-secondary-300 flex w-full items-center justify-center gap-4 border p-3 text-sm text-white"
        >
          <span>
            <strong>{name}</strong> quiere ser tu amigo, aceptalo!{' '}
          </span>
          <AcceptFriendButton userToAcceptId={data.id.ID} colors="tertiary" variant="outline" className="" />
        </div>
      )}
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <StudentCard data={data} />

        <SubjectsCard passed_subjects={data.passed_subjects} />

        {isSelf && (
          <FriendsCard
            friends={data.friends}
            pending_friends={data.pending_friends}
            friend_applications={data.friend_applications}
          />
        )}
      </div>
    </>
  );
}
