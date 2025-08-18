import type { Id } from './surrealDb';
import type { User } from './User';

export interface Student {
  id: Id;
  id_card: string;
  user: User;
}
