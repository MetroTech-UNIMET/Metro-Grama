import type { Career } from './Career';
import type { EnrollEntity } from './Enroll';
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

export interface StudentDetails extends StudentWithUser {
  careers: Career[];
  passed_subjects: EnrollEntity[];
  friends: StudentWithUser[];
}
