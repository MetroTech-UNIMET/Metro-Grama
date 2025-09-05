import type { Id } from './surrealDb';
import type { StudentEntity } from './Student';

export interface User {
  id: Id;
  careerID: string;
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl: string;
  role: Id<UserRole>;
  created: string;
}

export interface StudentUser extends User {
  role: Id<'student'>;
  student: StudentEntity;
}

export type UserRole = 'admin' | 'student';

export function isStudentUser(user: User | StudentUser): user is StudentUser {
  return user.role.ID === 'student';
}
