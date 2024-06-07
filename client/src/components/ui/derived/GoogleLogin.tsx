import { useAuth } from "@/contexts/AuthenticationContext";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "@ui/avatar";
import { Button } from "@ui/button";
import { GoogleLink } from "@ui/link";
import { Skeleton } from "@ui/skeleton";
import { LogOutIcon } from "lucide-react";

export default function GoogleLogin() {
  const { student, loadingAuth, logOut } = useAuth();

  console.log(student, loadingAuth);

  if (loadingAuth) return <AvatarSkeleton />;

  if (student) {
    const initials = student.firstName[0] + student.lastName[0];
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={student.pictureUrl} className="" />
            <AvatarFallback className="text-black">{initials}</AvatarFallback>
          </Avatar>
          <span>{student.firstName}</span>
        </div>

        <Button onClick={logOut} variant={"destructive"}>
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
