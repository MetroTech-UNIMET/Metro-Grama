import type {
  Notification,
  Notification_FriendRequest,
  Notification_FriendAccepted,
  Notification_SubjectSectionUpdate,
} from '@/interfaces/Notifications';

export function getNotificationMessage(notification: Notification): React.ReactNode {
  switch (notification.type) {
    case 'friendRequest':
    case 'friendAccepted':
    case 'subject_section_update': {
      const n = notification as Notification_FriendRequest | Notification_FriendAccepted;
      const actor = n.extraData.actor;
      const parts = n.message.split('$actor');
      return (
        <div>
          <strong>{actor}</strong>
          {parts[1]}
        </div>
      );
    }
    default:
      return <div>{notification.message}</div>;
  }
}

// Type guards
export function isFriendRequestNotification(n: Notification): n is Notification_FriendRequest {
  return n.type === 'friendRequest';
}

export function isFriendAcceptedNotification(n: Notification): n is Notification_FriendAccepted {
  return n.type === 'friendAccepted';
}

export function isSubjectSectionUpdateNotification(n: Notification): n is Notification_SubjectSectionUpdate {
  return n.type === 'subject_section_update';
}
