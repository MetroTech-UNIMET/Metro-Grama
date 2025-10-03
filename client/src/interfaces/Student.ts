import type { Career } from './Career';
import type { EnrollEntity } from './Enroll';
import { FriendEntity } from './Friend';
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

interface StudentDetails extends StudentWithUser {
  careers: Career[];
  passed_subjects: EnrollEntity[];
  friends: StudentWithUser[];
}

export interface MyStudentDetails extends StudentDetails {
  pending_friends: StudentWithUser[];
  friend_applications: StudentWithUser[];
}

export interface OtherStudentDetails extends StudentDetails {
  receiving_friendship_status: FriendEntity['status'] | 'none';
  friendship_status: FriendEntity['status'] | 'none';
}