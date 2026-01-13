import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { AvatarImage, AvatarFallback, Avatar } from '@ui/avatar';

import type { StudentWithUser } from '@/interfaces/Student';
import { Button } from '@ui/button';

export function EditorStudent({ student }: { student: StudentWithUser }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-fit p-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.user.pictureUrl || undefined} />
            <AvatarFallback>{student.user.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* <div className="flex flex-col">
          <span className="font-medium">{student.user.firstName} {student.user.lastName}</span>
          <span className="text-sm text-muted-foreground">{student.user.email}</span>
        </div> */}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto">
        <div className="flex flex-col">
          <p className="mb-4 text-center text-lg font-medium">Ultimo editor de la sección</p>

          <span className="font-medium">
            {student.user.firstName} {student.user.lastName}
          </span>
          <span className="text-muted-foreground text-sm">{student.user.email}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
