import z from 'zod/v4';

import { careersQueryParam } from '@/routes/-common_queryParams/careers';

// TODO - Seguramente tenga un filtro para solamente ver electivas o por carrera
export const queryParams = z.object({
  trimester: z.union([z.literal('none'), z.string()]).catch('none'),
  is_principal: z.boolean().default(true),
  careers: careersQueryParam,

  // Client only
  search: z.string().catch(''),
  filterByDays: z.array(z.number().min(0).max(6)).catch([]),
  filterByTimeRange: z
    .object({
      start: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .catch('08:00'),
      end: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .catch('22:00'),
    })
    .optional()
    .catch(undefined),
  orderBy: z.union([z.literal('name'), z.literal('prelations')]).catch('name'),
});
