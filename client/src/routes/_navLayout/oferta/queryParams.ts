import z from 'zod/v4';

import { createStringIdSchema } from '@/lib/schemas/surreal';

const academicYearSchema = z
  .string()
  .regex(/^\d{4}$/, 'Debe tener exactamente 4 dígitos')
  .refine((v) => {
    const start = parseInt(v.slice(0, 2), 10);
    const end = parseInt(v.slice(2), 10);
    // Disallow wrap-around (e.g., 9900) to keep only ascending consecutive pairs within same century
    if (start === 99) return false;
    return end === start + 1;
  }, 'Año académico inválido. Use el patrón 2122, 2223, 2324.');

export const ofertaSearchSchema = z.object({
  career: createStringIdSchema('career').optional().catch(undefined),
  year: academicYearSchema.optional().catch(undefined),
});

export type OfertaSearch = z.infer<typeof ofertaSearchSchema>;
