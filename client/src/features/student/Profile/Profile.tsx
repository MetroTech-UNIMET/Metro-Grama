import { AddFriendButton } from './buttons/AddFriendButton';
import { AcceptFriendButton } from './buttons/AcceptFriendButton';
import { FriendsCard } from './cards/FriendsCard';
import { SubjectsCard } from './cards/SubjectsCard';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';

import type { MyStudentDetails, OtherStudentDetails } from '@/interfaces/Student';

interface Props {
  data: OtherStudentDetails | MyStudentDetails;
}

export default function Profile({ data }: Props) {
  const name = `${data.user.firstName} ${data.user.lastName}`.trim();
  const initials = `${data.user.firstName?.[0] ?? ''}${data.user.lastName?.[0] ?? ''}`.toUpperCase();

  const isSelf = isMyProfile(data);

  console.log(data.user.pictureUrl);

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
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={data.user.pictureUrl} alt={name} />
              <AvatarFallback>{initials || 'ST'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <div className="text-muted-foreground text-sm">{data.user.email}</div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap justify-between gap-2">
            <aside className="grid gap-2">
              <div className="text-sm">
                <span className="font-medium">Cédula:</span> {data.id_card}
              </div>
              <div className="text-sm">
                <span className="font-medium">Teléfono:</span> {data.user.phone || '—'}
              </div>
              <div className="text-sm">
                <span className="font-medium">Verificado:</span> {data.user.verified ? 'Sí' : 'No'}
              </div>
            </aside>

            <aside className="grid gap-2">
              <div className="text-sm">
                <span className="font-medium">Carreras:</span>{' '}
                {data.careers.length === 0 && <span className="text-muted-foreground">Sin carreras</span>}
              </div>
              {data.careers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.careers.map((c) => (
                    <Badge key={c.id.ID} variant="secondary" className="h-fit">
                      {c.emoji} {c.name}
                    </Badge>
                  ))}
                </div>
              )}
            </aside>

            {/* TODO - SI yo ya recibi una solicitud y se la mando, deberia ser un accept */}

            {!isSelf && (
              <div className="pt-2">
                <AddFriendButton userToAddId={data.id.ID} friendshipStatus={data.friendship_status} />
              </div>
            )}
          </CardContent>
        </Card>

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

function isMyProfile(data: OtherStudentDetails | MyStudentDetails): data is MyStudentDetails {
  return (data as MyStudentDetails).pending_friends !== undefined;
}
