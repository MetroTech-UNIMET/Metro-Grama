import { useAuth } from "@/contexts/AuthenticationContext";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import { GoogleLink } from "@ui/link";
import { Skeleton } from "@ui/skeleton";
import { LogOutIcon } from "lucide-react";

export default function GoogleLogin() {
  const { user, status, logOut } = useAuth();

  if (status === "loading") return <AvatarSkeleton />;

  if (user) {
    const initials = user.firstName[0] + user.lastName[0];
    return (
      <div className="flex items-center gap-4 h-11">
        <div className="flex items-center gap-2 h-full">
          <Avatar>
            <AvatarImage src={user.pictureUrl} className="" />
            <AvatarFallback className="text-black">{initials}</AvatarFallback>
          </Avatar>
          <span>{user.firstName}</span>
        </div>

        <Button onClick={logOut} colors="destructive" className="h-full">
          <LogOutIcon />
          Cerrar sesión
        </Button>
      </div>
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
