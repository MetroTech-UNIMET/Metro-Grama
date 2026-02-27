import type { Career } from '@/interfaces/Career';
import type { EnrollEntity } from '@/interfaces/Enroll';
import type { FriendEntity } from '@/interfaces/Friend';
import type { StudentWithUser } from '@/interfaces/Student';
import type { SubjectEntity } from '@/interfaces/Subject';
import type { Id } from '@/interfaces/surrealDb';
import type { SubjectSectionWithSubject } from './course.types';
import type { SubjectSectionHistoryWithSchedules } from '@/interfaces/SubjectSectionHistory';

interface StudentDetails extends StudentWithUser {
  careers: Career[];

  next_courses: StudentCourse;
  current_courses: StudentCourse;

  subject_section_history: SubjectSectionHistoryWithSchedules[];
}

export interface PassedSubjectEntry {
  difficulty: EnrollEntity['difficulty'];
  grade: EnrollEntity['grade'];
  subject: SubjectEntity;
  workload: EnrollEntity['workload'];
}

export interface StudentCourse {
  principal: SubjectSectionWithSubject[] | null;
  secondary: SubjectSectionWithSubject[] | null;
}

export interface MyStudentDetails extends StudentDetails {
  enrolled_subjects: {
    subjects: PassedSubjectEntry[];
    trimester: Id<'trimester'>;
    average_grade: number;
  }[];
  friends: StudentWithUser[];
  pending_friends: StudentWithUser[];
  friend_applications: StudentWithUser[];
}

export interface OtherStudentDetails extends StudentDetails {
  enrolled_subjects?: MyStudentDetails['enrolled_subjects'];
  friends?: MyStudentDetails['friends'];

  receiving_friendship_status: FriendEntity['status'] | 'none';
  friendship_status: FriendEntity['status'] | 'none';
}
