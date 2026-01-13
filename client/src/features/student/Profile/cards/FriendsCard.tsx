import { Link } from '@tanstack/react-router';
import { useIsMutating } from '@tanstack/react-query';

import { RejectFriendButton } from '../buttons/RejectFriendButton';
import { AcceptFriendButton } from '../buttons/AcceptFriendButton';

import { getAcceptFriendMutationKey } from '@/hooks/mutations/friend/use-accept-friend';
import { getEliminateFriendMutationKey } from '@/hooks/mutations/friend/use-eliminate-friend';

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
    <Card className="pb-2">
      <CardHeader>
        <CardTitle>Amigos</CardTitle>
      </CardHeader>
      <CardContent className="max-h-86 overflow-y-auto">
        <Tabs defaultValue="amigos" className="relative">
          <TabsList className="sticky top-0 z-10">
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
              friend_applications.map((f: StudentWithUser) => <FriendRow key={f.id.ID} student={f} approvable />)
            ) : (
              <div className="text-muted-foreground text-sm">No tienes solicitudes por aceptar</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function OnlyFriendsCard({ friends }: Pick<Props, 'friends'>) {
  return (
    <Card className="pb-2">
      <CardHeader>
        <CardTitle>Amigos</CardTitle>
      </CardHeader>
      <CardContent className="max-h-86 space-y-3 overflow-y-auto">
        {friends?.length ? (
          friends.map((f) => <FriendRow key={f.id.ID} student={f} />)
        ) : (
          <div className="text-muted-foreground text-sm">Aún no tienes amigos :c</div>
        )}
      </CardContent>
    </Card>
  );
}

interface FriendRowProps {
  student: StudentWithUser;

  approvable?: boolean;
}

function FriendRow({ student, approvable }: FriendRowProps) {
  const sName = `${student.user.firstName} ${student.user.lastName}`.trim();
  const sInitials = `${student.user.firstName?.[0] ?? ''}${student.user.lastName?.[0] ?? ''}`.toUpperCase();
  const studentId = student.id.ID;

  const rootClasses = 'hover:bg-muted flex gap-3 rounded-md p-2 transition-colors max-md:flex-col';

  const isAccepting = useIsMutating({ mutationKey: getAcceptFriendMutationKey(studentId) }) > 0;
  const isRejecting = useIsMutating({ mutationKey: getEliminateFriendMutationKey(studentId) }) > 0;

  const studentInfo = (
    <>
      <Avatar className="h-8 w-8">
        <AvatarImage src={student.user.pictureUrl} alt={sName} />
        <AvatarFallback>{sInitials || 'ST'}</AvatarFallback>
      </Avatar>
      <main className="text-sm">
        <div className="leading-none font-medium">{sName}</div>
        <div className="text-muted-foreground">{student.user.email}</div>
      </main>
    </>
  );

  if (approvable) {
    return (
      <div className={rootClasses}>
        <Link to="/student/$studentId" params={{ studentId: studentId }} className="flex flex-row items-center gap-3">
          {studentInfo}
        </Link>

        <aside className="mx-auto flex flex-row gap-2 text-sm md:ml-auto">
          <AcceptFriendButton userToAcceptId={studentId} disabled={isAccepting || isRejecting} />
          <RejectFriendButton userToRejectId={studentId} disabled={isAccepting || isRejecting} />
        </aside>
      </div>
    );
  }

  return (
    <Link to="/student/$studentId" params={{ studentId: studentId }} className={rootClasses}>
      <div className="flex flex-row items-center gap-3">{studentInfo}</div>
    </Link>
  );
}
