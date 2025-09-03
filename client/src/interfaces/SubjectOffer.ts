import type { Id } from './surrealDb';

import type { SubjectEntity } from '@/interfaces/Subject';
import type { Trimester } from '@/interfaces/Trimester';
import type { SubjectSectionWithSchedules } from './SubjectSection';

export interface SubjectOffer {
  id: Id;
  subject: SubjectEntity;
  trimester: Trimester;
}

export interface SubjectOfferWithSections extends SubjectOffer {
  sections: SubjectSectionWithSchedules[];
}
