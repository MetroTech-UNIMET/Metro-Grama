import { optionSchema } from '@/lib/schemas/option';
import z from 'zod/v4';

export const enrollDialogSchema = z.object({
  grade: z
    .int({
      error: (issue) => (!issue.input ? 'La nota es requerida' : 'La nota debe ser un número entero'),
    })
    .min(0, 'La nota debe ser al menos 0')
    .max(20, 'La nota debe ser como máximo 20'),
  trimester: optionSchema
});

export type EnrollDialogInput = z.input<typeof enrollDialogSchema>;
export type EnrollDialogOutput = z.output<typeof enrollDialogSchema>;

export const defaultEnrollDialogValues: EnrollDialogInput = {
  grade: 0,
  trimester: null as any,
};