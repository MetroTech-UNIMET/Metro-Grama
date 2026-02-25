import z from 'zod/v4';

import { careersQueryParam } from '@/routes/-common_queryParams/careers';
import { trimesterQueryParam } from '@/routes/-common_queryParams/trimester';

// TODO - Seguramente tenga un filtro para solamente ver electivas o por carrera
export const queryParams = z.object({
  trimester: trimesterQueryParam,
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
  orderBy: z.enum(['prelations', 'avg_difficulty', 'avg_grade', 'avg_workload', 'alphabetical']).catch('alphabetical'),
  orderDir: z.enum(['asc', 'desc']).catch('asc'),

  // Averages filters
  minDifficulty: z.number().min(0).max(10).catch(0),
  maxDifficulty: z.number().min(0).max(10).catch(10),

  minGrade: z.number().min(0).max(20).catch(0),
  maxGrade: z.number().min(0).max(20).catch(20),

  minWorkload: z.number().min(0).max(10).catch(0),
  maxWorkload: z.number().min(0).max(10).catch(10),
});

type QueryParams = z.infer<typeof queryParams>;

export type SortField = QueryParams['orderBy'];
export type SortDirection = QueryParams['orderDir'];
