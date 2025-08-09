import { useMemo, useState } from 'react';

import { useFetchSubjects } from '@/hooks/queries/subject/use-FetchSubjects';

import type { Subject } from '@/interfaces/Subject';
import type { Option } from '@ui/types';

// TODO - Eliminar y usar el T Data de Option
export interface CodeOption {
  value: string;
  label: string;
  subject?: Subject;
}

export type SubjectNameCode = Pick<Subject, 'name' | 'code'>;

// TODO función para añadir más opciones a medida que se popule
export default function useSubjectOptions() {
  const { data: subjects, ...query } = useFetchSubjects();

  const [additionalSubjects, setAdditionalSubjects] = useState<Record<string, SubjectNameCode>>({});

  function addAdditionalSubject(subject: SubjectNameCode) {
    setAdditionalSubjects((prev) => ({ ...prev, [subject.code.ID]: subject }));
  }

  function removeAdditionalSubject(code: string) {
    setAdditionalSubjects((prev) => {
      const newAdditionalSubjects = { ...prev };
      delete newAdditionalSubjects[code];
      return newAdditionalSubjects;
    });
  }

  const options = useMemo(() => {
    if (!subjects) return [[], []];

    return generateOptions([...Object.values(additionalSubjects), ...subjects]);
  }, [additionalSubjects, subjects]);

  return {
    options,
    query,
    addAdditionalSubject,
    removeAdditionalSubject,
  };
}

function generateOptions(subjects: (SubjectNameCode | Subject)[]): [Option[], CodeOption[]] {
  const prelationsOptions: Option[] = [];
  const codeOptions: CodeOption[] = [];

  subjects.forEach((subject) => {
    const code = subject.code.ID;
    const label = `(${code}) - ${subject.name}`;

    prelationsOptions.push({
      label,
      value: code,
    });

    if (isSubject(subject))
      codeOptions.push({
        label,
        value: code,
        subject,
      });
  });

  return [prelationsOptions, codeOptions];
}

function isSubject(subject: SubjectNameCode | Subject): subject is Subject {
  return (subject as Subject).careers !== undefined;
}
