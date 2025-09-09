import { createStringIdSchema } from '@/lib/schemas/surreal';
import z from 'zod/v4';

export const queryParams = z.object({
  trimester: z.union([z.literal('none'), z.string()]).catch('none'),
  is_principal: z.boolean().default(true),
  careers: z.array(createStringIdSchema('career')).catch([]),
  search: z.string().catch(''),
});
