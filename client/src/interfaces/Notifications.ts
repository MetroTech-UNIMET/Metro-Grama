import type { Id } from './surrealDb';

export interface Notification {
  id: Id<'notification'>;
  user: Id<'user'>;
  type: 'friendRequest' | 'friendAccepted' | 'subject_section_update';
  extraData: Record<string, unknown>;
  message: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Notification_FriendRequest extends Notification {
  type: 'friendRequest';
  extraData: {
    friend_id: Id<'friend'>;
    sender: Id<'student'>;
    actor: string;
    image: string;
  };
  message: `$actor ${string}`;
}

export interface Notification_FriendAccepted extends Notification {
  type: 'friendAccepted';
  extraData: {
    friend_id: Id<'friend'>;
    recipient: Id<'student'>;
    actor: string;
    image: string;
  };
  message: `$actor ${string}`;
}

export interface Notification_SubjectSectionUpdate extends Notification {
  type: 'subject_section_update';
  extraData: {
    history: Id<'history'>;
    subject_section: Id<'subject_section'>;
    actor: string;
    image: string;
  };
  message: `$actor ${string}`;
}
