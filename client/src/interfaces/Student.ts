import type { Id } from './surrealDb';
import type { User } from './User';

export interface StudentEntity {
  id: Id<'student'>;
  id_card: string;
  user: Id<'user'>;
}

export interface StudentWithUser extends Omit<StudentEntity, 'user'> {
  user: User;
}
