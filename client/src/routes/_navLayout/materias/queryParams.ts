import { createStringIdSchema } from '@/lib/schemas/surreal';
import z from 'zod/v4';

export const materiasSearchSchema = z.object({
  careers: z.array(createStringIdSchema('career')),
});

export type MateriasSearch = z.infer<typeof materiasSearchSchema>;
