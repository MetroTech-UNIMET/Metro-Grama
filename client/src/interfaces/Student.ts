import type { Id } from './surrealDb';
import type { User } from './User';

export interface StudentEntity {
  id: Id;
  id_card: string;
  user: Id;
  // user: User;
}

export interface StudentWithUser extends Omit<StudentEntity, 'user'> {
  user: User;
}