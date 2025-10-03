import type{ Id } from "./surrealDb";

export interface FriendEntity {
  id: Id<'friend'>;
  in: Id<'student'>;
  out: Id<'student'>;
  created: string;

  status: 'pending' | 'accepted' | 'rejected';
}