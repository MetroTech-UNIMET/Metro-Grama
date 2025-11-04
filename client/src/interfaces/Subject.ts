import { Id } from './surrealDb';

export interface SubjectEntity {
  id: Id;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
  isElective: boolean;
}

export interface Subject {
  code: Id;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
}

export type SubjectNoCareers = Omit<Subject, 'careers'>;

export interface SubjectStats {
  count: number;
  difficulty: number;
  grade: number;
  workload: number;
  trimester: Id;
}
