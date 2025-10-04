import type { Career } from './Career';
import type { EnrollEntity } from './Enroll';
import type { FriendEntity } from './Friend';
import type { SubjectEntity } from './Subject';
import type { Id } from './surrealDb';
import type { User } from './User';

export interface StudentEntity {
  id: Id<'student'>;
  id_card: string;
  user: Id<'user'>;
  // user: User;
}

export interface StudentWithUser extends Omit<StudentEntity, 'user'> {
  user: User;
}

interface StudentDetails extends StudentWithUser {
  careers: Career[];
  passed_subjects: {
    subjects: PassedSubjectEntry[];
    trimester: Id<'trimester'>;
    average_grade: number;
  }[];
  friends: StudentWithUser[];
}

export interface PassedSubjectEntry {
  difficulty: EnrollEntity['difficulty'];
  grade: EnrollEntity['grade'];
  subject: SubjectEntity;
  workload: EnrollEntity['workload'];
}

export interface MyStudentDetails extends StudentDetails {
  pending_friends: StudentWithUser[];
  friend_applications: StudentWithUser[];
}

export interface OtherStudentDetails extends StudentDetails {
  receiving_friendship_status: FriendEntity['status'] | 'none';
  friendship_status: FriendEntity['status'] | 'none';
}
