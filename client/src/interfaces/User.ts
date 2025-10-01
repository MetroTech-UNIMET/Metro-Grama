import type { Id } from './surrealDb';
import type { StudentEntity } from './Student';

export interface User {
  id: Id<'user'>;
  firstName: string;
  lastName: string;
  email: string;
  pictureUrl: string;
  role: Id<'role', UserRole>;
  phone: string | null;
  created: string;
  verified: boolean;
}

export interface StudentUser extends User {
  role: Id<'role', 'student'>;
  student: StudentEntity;
}

export type UserRole = 'admin' | 'student';

export function isStudentUser(user: User | StudentUser): user is StudentUser {
  return user.role.ID === 'student';
}
