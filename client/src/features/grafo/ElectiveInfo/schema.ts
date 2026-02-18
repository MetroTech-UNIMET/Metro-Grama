import { z } from 'zod';

import { createOptionSchema } from '@/lib/schemas/option';

export const electiveFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido de la materia').trim(),
  code: z.string().trim().length(7, 'El código de la materia debe tener exactamente 7 caracteres'),
  prelations: z
    .array(
      createOptionSchema(
        undefined,
        z.string().length(7, {
          error: 'El código debe tener exactamente 7 caracteres',
        }),
      ).transform((option) => option.value),
    )
    .max(3, {
      error: 'Esta materia no puede depender de más de 3 materias',
    })
    .catch([]),
});

export type ElectiveFormInput = z.input<typeof electiveFormSchema>;
export type ElectiveFormOutput = z.output<typeof electiveFormSchema>;

export const electiveDefaultValues: ElectiveFormInput = {
  name: '',
  code: '',
  prelations: [],
};
