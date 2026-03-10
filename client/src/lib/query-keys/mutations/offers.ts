export const offersMutationKeys = {
  uploadAnnualPdf: ['subjects', 'offer', 'upload-pdf'] as const,
  createForSubject: (subjectId: unknown) => ['subjects', 'offer', 'create', subjectId] as const,
  deleteForSubject: (subjectId: unknown) => ['subjects', 'offer', 'delete', subjectId] as const,
  batchUpdate: ['subjects', 'offer', 'batch-update'] as const,
};
