import type { Id } from './surrealDb';

import type { SubjectEntity } from '@/interfaces/Subject';
import type { Trimester } from '@/interfaces/Trimester';
import type { SubjectSectionWithSchedules } from './SubjectSection';
import type { StudentWithUser } from './Student';

export interface SubjectOffer {
  id: Id;
  subject: SubjectEntity;
  trimester: Trimester;
}

export interface SubjectOfferWithSections extends SubjectOffer {
  sections: SubjectOfferSections[];
  careers: Id[];
  is_enrolled?: boolean;
  is_enrollable?: boolean;
  prelations: SubjectEntity[];

  differentFriends: number;
}

interface SubjectOfferSections extends SubjectSectionWithSchedules {
  friends?: StudentWithUser[];
  friends_of_a_friend?: FriendOfAfriend[];
  students_planning_to_enroll: number;
}

interface FriendOfAfriend {
  friendOfAfriend: StudentWithUser;
  commonFriend: StudentWithUser;
}
