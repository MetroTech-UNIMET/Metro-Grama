import type { Id } from './surrealDb';

import type { SubjectEntity } from '@/interfaces/Subject';
import type { Trimester } from '@/interfaces/Trimester';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

export interface SubjectOffer {
  id: Id;
  subject: SubjectEntity;
  trimester: Trimester;
}

export interface SubjectOfferWithSchedules extends SubjectOffer {
  schedules: SubjectSchedule[];
}
