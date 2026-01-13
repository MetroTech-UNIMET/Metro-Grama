import z from 'zod/v4';

import { createStringIdSchema } from '@/lib/schemas/surreal';

export const careersQueryParam = z.array(createStringIdSchema('career')).catch([]);
