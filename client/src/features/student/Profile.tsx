import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';

import type { StudentDetails, StudentWithUser } from '@/interfaces/Student';
import { Button } from '@ui/button';
import { useAddFriend } from '@/hooks/mutations/friend/use-add-friend';
import { Link } from '@tanstack/react-router';

interface Props {
  data: StudentDetails;
  // Whether the profile belongs to the logged-in user
  isSelf?: boolean;
}

export default function Profile({ data, isSelf = false }: Props) {
  const name = `${data.user.firstName} ${data.user.lastName}`.trim();
  const initials = `${data.user.firstName?.[0] ?? ''}${data.user.lastName?.[0] ?? ''}`.toUpperCase();

  const { mutate: addFriend, isPending: isAdding } = useAddFriend();

  const handleAddFriend = () => {
    addFriend(data.id.ID);
  };

  const FriendRow = ({ student }: { student: StudentWithUser }) => {
    const sName = `${student.user.firstName} ${student.user.lastName}`.trim();
    const sInitials = `${student.user.firstName?.[0] ?? ''}${student.user.lastName?.[0] ?? ''}`.toUpperCase();
    const sid = (student.id as any)?.ID ?? String((student as any).id ?? '');
    return (
      <Link
        to="/student/$studentId"
        params={{ studentId: sid }}
        className="hover:bg-muted flex items-center gap-3 rounded-md p-2 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={student.user.pictureUrl} alt={sName} />
          <AvatarFallback>{sInitials || 'ST'}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <div className="leading-none font-medium">{sName}</div>
          <div className="text-muted-foreground">{student.user.email}</div>
        </div>
      </Link>
    );
  };

  return (
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
              <Button size="sm" colors="secondary" onClick={handleAddFriend} disabled={isAdding}>
                {isAdding ? 'Agregando…' : 'Agregar amigo'}
              </Button>
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
        <Card>
          <CardHeader>
            <CardTitle>Amigos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.friends?.length ? (
              data.friends.map((f) => <FriendRow key={(f.id as any).ID ?? String(f.id)} student={f} />)
            ) : (
              <div className="text-muted-foreground text-sm">Aún no tienes amigos</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
