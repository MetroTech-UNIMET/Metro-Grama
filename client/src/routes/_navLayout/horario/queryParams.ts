import { createStringIdSchema } from '@/lib/schemas/surreal';
import z from 'zod/v4';

import { careersQueryParam } from '@/routes/-common_queryParams/careers';

// TODO - Seguramente tenga un filtro para solamente ver electivas o por carrera
export const queryParams = z.object({
  trimester: z.union([z.literal('none'), z.string()]).catch('none'),
  is_principal: z.boolean().default(true),
  careers: careersQueryParam,

  // Client only
  search: z.string().catch(''),
});
