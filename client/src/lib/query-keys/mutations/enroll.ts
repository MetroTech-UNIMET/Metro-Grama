export const enrollMutationKeys = {
  create: (subjectCode: string | undefined) => ['enroll-subject', subjectCode] as const,
  update: (subjectCode: string | undefined) => ['update-enroll-subject', subjectCode] as const,
};
