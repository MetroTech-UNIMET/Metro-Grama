import type { Subject, SubjectNoCareers } from '@/interfaces/Subject';

export function subjectHasCareer(subject: Subject | SubjectNoCareers): subject is Subject {
  return (subject as Subject).careers !== undefined;
}
