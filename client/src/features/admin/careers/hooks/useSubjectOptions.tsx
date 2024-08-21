import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSubjects } from "@/api/subjectsAPI";
import type { Subject } from "@/interfaces/Subject";
import type { Option } from "@ui/derived/multidropdown";

export interface CodeOption {
  value: string;
  label: string;
  subject?: Subject;
}

export type SubjectNameCode = Pick<Subject, "name" | "code">;

// TODO función para añadir más opciones a medida que se popule
export default function useSubjectOptions() {
  const { data: subjects, ...query } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => getSubjects("none"),
  });


  const [additionalSubjects, setAdditionalSubjects] = useState<Record<string, SubjectNameCode>>({});

  function addAdditionalSubject(subject: SubjectNameCode) {
    setAdditionalSubjects((prev) => ({ ...prev, [subject.code]: subject }));
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

function generateOptions(
  subjects: (SubjectNameCode | Subject)[]
): [Option[], CodeOption[]] {
  const prelationsOptions: Option[] = [];
  const codeOptions: CodeOption[] = [];

  subjects.forEach((subject) => {
    const code = subject.code.split(":")[1];

    prelationsOptions.push({
      label: subject.name,
      value: code,
    });

    if (isSubject(subject))
      codeOptions.push({
        label: `(${code}) - ${subject.name}`,
        value: code,
        subject,
      });
  });

  return [prelationsOptions, codeOptions];
}

function isSubject(subject: SubjectNameCode | Subject): subject is Subject {
  return (subject as Subject).careers !== undefined;
}
