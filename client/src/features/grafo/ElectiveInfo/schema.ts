import { z } from 'zod';

import { createOptionSchema } from '@/lib/schemas/option';

export const electiveFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido de la materia'),
  code: z.string().length(7, 'El código de la materia debe tener exactamente 7 caracteres'),
  prelations: z
    .array(
      createOptionSchema(
        undefined,
        z.string().length(7, {
          error: 'El código debe tener exactamente 7 caracteres',
        }),
      ),
    )
    .max(3, {
      error: 'Esta materia no puede depender de más de 3 materias',
    })
    .catch([]),
});

export type ElectiveFormValues = z.infer<typeof electiveFormSchema>;

export const electiveDefaultValues: ElectiveFormValues = {
  name: '',
  code: '',
  prelations: [],
};