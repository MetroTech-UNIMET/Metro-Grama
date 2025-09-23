import z from 'zod/v4';

import { maxScaleNumber, minScaleNumber } from './constants';

import { createOptionSchema } from '@/lib/schemas/option';

export const enrollDialogSchema = z.object({
  grade: z
    .int({
      error: (issue) => (!issue.input ? 'La nota es requerida' : 'La nota debe ser un número entero'),
    })
    .min(0, 'La nota debe ser al menos 0')
    .max(20, 'La nota debe ser como máximo 20'),
  trimesterId: createOptionSchema((issue) =>
    !issue.input ? 'El trimestre es requerido' : 'El trimestre debe ser una opción válida',
  ).transform((option) => ({
    ID: option.value,
    Table: 'trimester',
  })),
  difficulty: z
    .int({
      error: (issue) => (!issue.input ? 'La dificultad es requerida' : 'La dificultad debe ser un número entero'),
    })
    .min(minScaleNumber, `La dificultad debe ser al menos ${minScaleNumber}`)
    .max(maxScaleNumber, `La dificultad debe ser como máximo ${maxScaleNumber}`),
  workload: z
    .int({
      error: (issue) => (!issue.input ? 'La carga es requerida' : 'La carga debe ser un número entero'),
    })
    .min(minScaleNumber, `La carga debe ser al menos ${minScaleNumber}`)
    .max(maxScaleNumber, `La carga debe ser como máximo ${maxScaleNumber}`),
});

export type EnrollDialogInput = z.input<typeof enrollDialogSchema>;
export type EnrollDialogOutput = z.output<typeof enrollDialogSchema>;

export const defaultEnrollDialogValues: EnrollDialogInput = {
  grade: 0,
  trimesterId: null as any,
  difficulty: 3,
  workload: 3,
};
