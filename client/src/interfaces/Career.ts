import type { Subject } from "./Subject";

export interface Career {
  id: string;
  name: string;
  emoji: string;
}

type SubjectWithPrelations = Omit<Subject, 'careers'> & {
  prelations: string[];
}

export interface CareerWithSubjects extends Career {
  subjects: (SubjectWithPrelations | null)[][];
}