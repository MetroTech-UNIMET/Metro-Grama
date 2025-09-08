import { z } from 'zod';

// Centralized search/query param schema for /materias
// Extend here when adding more params. Keep defaults explicit.
export const materiasSearchSchema = z
  .object({
    careers: z.string().catch('none'),
  })

export type MateriasSearch = z.infer<typeof materiasSearchSchema>;
