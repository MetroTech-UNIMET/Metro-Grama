// import { Link } from '@tanstack/react-router';

import { getNotificationMessage } from '../functions';

import { cn } from '@utils/className';
import { getInitials } from '@utils/strings';

import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';

import type { Notification_SubjectSectionUpdate } from '@/interfaces/Notifications';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  notification: Notification_SubjectSectionUpdate;
}

// TODO - Considerar hacer una pagina para ver el detalle de un subjectOffer
export function NotificationSubjectSectionUpdateItem({ notification, className, ...props }: Props) {
  // const subjectSectionId = notification.extraData.subject_section.ID;

  const content = getNotificationMessage(notification);
  const initials = getInitials(...notification.extraData.actor.split(' '));

  return (
    <div
      // to="/subject-offer/$subjectOfferId"
      // params={{ subjectOfferId }}
      className={cn('hover:bg-accent flex flex-row items-center gap-2', className)}
      {...props}
    >
      <Avatar className="size-8">
        <AvatarImage src={notification.extraData.image} alt={notification.extraData.actor} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div>{content}</div>
    </div>
  );
}
