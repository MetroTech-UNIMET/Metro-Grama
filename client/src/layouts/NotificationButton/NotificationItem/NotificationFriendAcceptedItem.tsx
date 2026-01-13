import { Link } from '@tanstack/react-router';

import { getNotificationMessage } from '../functions';

import { cn } from '@utils/className';
import { getInitials } from '@utils/strings';

import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';

import type { Notification_FriendAccepted } from '@/interfaces/Notifications';

interface Props extends React.HTMLAttributes<HTMLAnchorElement> {
  notification: Notification_FriendAccepted;
}

export function NotificationFriendAcceptedItem({ notification, className, ...props }: Props) {
  const studentId = notification.extraData.recipient.ID;

  const content = getNotificationMessage(notification);
  const initials = getInitials(...notification.extraData.actor.split(' '));

  return (
    <Link
      to="/student/$studentId"
      params={{ studentId }}
      className={cn('hover:bg-accent flex flex-row items-center gap-2', className)}
      {...props}
    >
      <Avatar className="size-8">
        <AvatarImage src={notification.extraData.image} alt={notification.extraData.actor} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div>{content}</div>
    </Link>
  );
}
