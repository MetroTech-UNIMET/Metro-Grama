import z from 'zod/v4';

import { careersQueryParam } from '@/routes/-common_queryParams/careers';

export const materiasSearchSchema = z.object({
  careers: careersQueryParam,
  isElective: z.boolean().optional().prefault(false),
});

export type MateriasSearch = z.infer<typeof materiasSearchSchema>;
