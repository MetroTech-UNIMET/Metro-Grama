import { FriendsCard } from './FriendsCard';
import { AddFriendButton } from './buttons/AddFriendButton';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';

import type { MyStudentDetails, OtherStudentDetails } from '@/interfaces/Student';
import { AcceptFriendButton } from './buttons/AcceptFriendButton';

interface Props {
  data: OtherStudentDetails | MyStudentDetails;
}

export default function Profile({ data }: Props) {
  const name = `${data.user.firstName} ${data.user.lastName}`.trim();
  const initials = `${data.user.firstName?.[0] ?? ''}${data.user.lastName?.[0] ?? ''}`.toUpperCase();

  const isSelf = isMyProfile(data);

  return (
    <>
      {!isSelf && data.receiving_friendship_status === 'pending' && (
        <div
          role="alert"
          className="bg-secondary-600 border-secondary-300 flex w-full gap-4 border p-3 text-sm text-white items-center justify-center"
        >
          <span>
            <strong>{name}</strong> quiere ser tu amigo, aceptalo!{' '}
          </span>
          <AcceptFriendButton userToAcceptId={data.id.ID} colors="tertiary" variant="outline" className="" />
        </div>
      )}
      <div className="mx-auto max-w-2xl space-y-4 p-4">
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
          <CardContent className="grid gap-2">
            <div className="text-sm">
              <span className="font-medium">Cédula:</span> {data.id_card}
            </div>
            <div className="text-sm">
              <span className="font-medium">Teléfono:</span> {data.user.phone || '—'}
            </div>
            <div className="text-sm">
              <span className="font-medium">Verificado:</span> {data.user.verified ? 'Sí' : 'No'}
            </div>

            {!isSelf && (
              <div className="pt-2">
                <AddFriendButton userToAddId={data.id.ID} friendshipStatus={data.friendship_status} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carreras</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.careers.length === 0 ? (
              <div className="text-muted-foreground text-sm">Sin carreras</div>
            ) : (
              data.careers.map((c) => (
                <Badge key={c.id.ID} variant="secondary">
                  {c.emoji} {c.name}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materias aprobadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.passed_subjects.length === 0 ? (
              <div className="text-muted-foreground text-sm">Aún no hay materias aprobadas</div>
            ) : (
              <ul className="list-disc pl-6 text-sm">
                {data.passed_subjects.map((enr) => (
                  <li key={enr.id.ID}>
                    <span className="font-medium">{enr.out.ID}</span> · Nota: {enr.grade}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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
