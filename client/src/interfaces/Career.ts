import type { Subject } from "./Subject";
import type { Id } from "./surrealDb";

export interface Career {
  id: Id;
  name: string;
  emoji: string;
}

type SubjectWithPrelations = Omit<Subject, 'careers'> & {
  prelations: Id[];
}

export interface CareerWithSubjects extends Career {
  subjects: (SubjectWithPrelations | null)[][];
}