export const friendsMutationKeys = {
  accept: (studentId: string) => ['friend', 'accept', studentId] as const,
  add: (studentId: string) => ['friend', 'add', studentId] as const,
  eliminate: (studentId: string) => ['friend', 'eliminate', studentId] as const,
};
