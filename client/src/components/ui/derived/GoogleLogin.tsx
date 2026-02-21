import { ChevronDown, LogOutIcon, User } from 'lucide-react';

import { useAuth } from '@/contexts/AuthenticationContext';

import { getInitials } from '@utils/strings';

import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Button } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { GoogleLink } from '@ui/link';
import { Skeleton } from '@ui/skeleton';
import { Link } from '@tanstack/react-router';

export default function GoogleLogin() {
  const { user, status, logOut } = useAuth();

  if (status === 'loading') return <AvatarSkeleton />;

  if (user) {
    const initials = getInitials(user.firstName, user.lastName);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" colors="neutral" className="h-11 items-center gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.pictureUrl} />
              <AvatarFallback className="text-black">{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
            <ChevronDown className="text-muted-foreground h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* FIXME - Por ahora no  existe perfil para admin*/}
          {user.role.ID === 'student' && (
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User />

                <span>Ver mi cuenta</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={logOut} variant="destructive">
            <LogOutIcon className="" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <GoogleLink />;
}

function AvatarSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
  );
}
