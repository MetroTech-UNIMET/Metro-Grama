import { getInitials } from '@utils/strings';

import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Separator } from '@ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Button } from '@ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { StudentWithUser } from '@/interfaces/Student';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  totalFriends: number;
}

export function FriendsPopover({ subjectOffer, totalFriends }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="mx-auto mt-4 underline">
          {totalFriends} amig{totalFriends !== 1 ? 'os' : 'o'} planea{totalFriends !== 1 ? 'n' : ''} inscribir esta
          materia
        </Button>
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-2">
        {subjectOffer.sections.map(
          (section, index) =>
            (section.friends?.length ?? 0) > 0 && (
              <div key={section.id.ID}>
                <div className="mb-1 flex justify-between">
                  <p className="font-semibold">Sección {section.section_number}</p>
                  <p className="text-muted-foreground text-sm">
                    {section.friends?.length} amig{section.friends?.length !== 1 ? 'os' : 'o'}
                  </p>
                </div>
                <div className="space-y-2">
                  {section.friends?.map((friend) => (
                    <FriendItem key={friend.id.ID} friend={friend} />
                  ))}
                  {section.friends_of_a_friend?.map((friends_of_a_friend) => (
                    <FriendOfAfriendItem
                      key={`${friends_of_a_friend.commonFriend.id.ID}-${friends_of_a_friend.friendOfAfriend.id.ID}`}
                      friendOfAfriend={friends_of_a_friend.friendOfAfriend}
                      commonFriend={friends_of_a_friend.commonFriend}
                    />
                  ))}
                </div>
                {index < subjectOffer.sections.length - 1 && <Separator className="mt-2" />}
              </div>
            ),
        )}
      </PopoverContent>
    </Popover>
  );
}

function FriendOfAfriendItem({
  friendOfAfriend,
  commonFriend,
}: {
  friendOfAfriend: StudentWithUser;
  commonFriend: StudentWithUser;
}) {
  const initials = getInitials(commonFriend.user.firstName, commonFriend.user.lastName);
  return (
    <FriendItem friend={friendOfAfriend}>
      <Tooltip>
        <TooltipTrigger className="ml-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={commonFriend.user.pictureUrl} alt={commonFriend.user.firstName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          Amigo en comun: {commonFriend.user.firstName} {commonFriend.user.lastName}
        </TooltipContent>
      </Tooltip>
    </FriendItem>
  );
}

function FriendItem({ friend, children }: { friend: StudentWithUser; children?: React.ReactNode }) {
  const initials = getInitials(friend.user.firstName, friend.user.lastName);
  return (
    <div className="flex items-center gap-2 text-sm">
      <Avatar className="h-8 w-8">
        <AvatarImage src={friend.user.pictureUrl} alt={friend.user.firstName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <span>
        {friend.user.firstName} {friend.user.lastName}
      </span>

      {children}
    </div>
  );
}
