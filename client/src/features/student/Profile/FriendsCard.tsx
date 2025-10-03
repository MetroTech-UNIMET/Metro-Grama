import { Link } from '@tanstack/react-router';

import { Avatar, AvatarImage, AvatarFallback } from '@ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ui/tabs';

import type { StudentWithUser } from '@/interfaces/Student';

interface Props {
  friends: StudentWithUser[];
  pending_friends: StudentWithUser[];
  friend_applications: StudentWithUser[];
}

export function FriendsCard({ friends, pending_friends, friend_applications }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Amigos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="amigos">
          <TabsList className="mb-2">
            <TabsTrigger value="amigos">Amigos</TabsTrigger>
            <TabsTrigger value="pendientes">Solicitudes pendientes</TabsTrigger>
            <TabsTrigger value="por-aceptar">Solicitudes por aceptar</TabsTrigger>
          </TabsList>

          <TabsContent value="amigos" className="space-y-3">
            {friends?.length ? (
              friends.map((f) => <FriendRow key={f.id.ID} student={f} />)
            ) : (
              <div className="text-muted-foreground text-sm">Aún no tienes amigos :c</div>
            )}
          </TabsContent>

          <TabsContent value="pendientes" className="space-y-3">
            {pending_friends.length ? (
              pending_friends.map((f) => <FriendRow key={f.id.ID} student={f} />)
            ) : (
              <div className="text-muted-foreground text-sm">Sin solicitudes pendientes</div>
            )}
          </TabsContent>

          <TabsContent value="por-aceptar" className="space-y-3">
            {friend_applications?.length ? (
              friend_applications.map((f: StudentWithUser) => <FriendRow key={f.id.ID} student={f} />)
            ) : (
              <div className="text-muted-foreground text-sm">No tienes solicitudes por aceptar</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

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
