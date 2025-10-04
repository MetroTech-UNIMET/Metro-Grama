import { Settings } from 'lucide-react';

import { AvatarImage, AvatarFallback, Avatar } from '@ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card';

import { AddFriendButton } from '../buttons/AddFriendButton';
import { isMyProfile } from '../utils';

import { Badge } from '@ui/badge';
import { ButtonLink } from '@ui/link';

import type { MyStudentDetails, OtherStudentDetails } from '@/interfaces/Student';

type StudentDetails = MyStudentDetails | OtherStudentDetails;

interface Props {
  data: StudentDetails;
}

export function StudentCard({ data }: Props) {
  const name = `${data.user.firstName} ${data.user.lastName}`.trim();
  const initials = `${data.user.firstName?.[0] ?? ''}${data.user.lastName?.[0] ?? ''}`.toUpperCase();

  const isSelf = isMyProfile(data);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={data.user.pictureUrl} alt={name} />
          <AvatarFallback>{initials || 'ST'}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{name}</CardTitle>
          <div className="text-muted-foreground text-sm">{data.user.email}</div>
        </div>

        {isSelf && (
          <div className="ml-auto">
            <ButtonLink to="/profile/settings" variant="ghost" size="big-icon" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </ButtonLink>
          </div>
        )}
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
  );
}
