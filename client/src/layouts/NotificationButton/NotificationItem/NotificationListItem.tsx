import { Slot as SlotPrimitive } from 'radix-ui';

import {
  getNotificationMessage,
  isFriendAcceptedNotification,
  isFriendRequestNotification,
  isSubjectSectionUpdateNotification,
} from '../functions';
import { NotificationFriendRequestItem } from './NotificationFriendRequestItem';
import { NotificationFriendAcceptedItem } from './NotificationFriendAcceptedItem';

import { cn } from '@utils/className';

import type { Notification } from '@/interfaces/Notifications';
import { NotificationSubjectSectionUpdateItem } from './NotificationSubjectSectionUpdateItem';

// TODO - Testear porq ue no puedo mofiicar Mate V con el perfil de javier
export function NotificationListItem({ notification }: { notification: Notification }) {
  let content: React.ReactNode;
  if (isFriendRequestNotification(notification)) {
    content = <NotificationFriendRequestItem notification={notification} />;
  } else if (isFriendAcceptedNotification(notification)) {
    content = <NotificationFriendAcceptedItem notification={notification} />;
  } else if (isSubjectSectionUpdateNotification(notification)) {
    content = <NotificationSubjectSectionUpdateItem notification={notification} />;
  } else {
    content = getNotificationMessage(notification);
  }

  const Comp = SlotPrimitive.Slot;

  return (
    <Comp className={cn('border-b p-3 text-sm last:border-0', notification.read ? 'text-gray-500' : 'text-black')}>
      {content}
    </Comp>
  );
}
