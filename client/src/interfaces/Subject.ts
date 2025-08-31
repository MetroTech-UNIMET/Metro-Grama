import { Id } from './surrealDb';

export interface SubjectEntity {
  id: Id;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
}

export interface Subject {
  code: Id;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
}
