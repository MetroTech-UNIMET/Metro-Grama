import { z } from 'zod/v4';

import { optionStringSchema } from '@/lib/schemas/option';
import { phoneSchema } from '@/lib/schemas/phone';

export const step1Schema = z.object({
  name: z
    .string()
    .min(3, {
      error: 'El nombre debe tener por lo menos 3 caracteres',
    })
    .max(50, {
      error: 'El nombre debe tener menos de 50 caracteres',
    }),
  lastName: z
    .string()
    .min(3, {
      error: 'El apellido debe tener por lo menos 3 caracteres',
    })
    .max(50, {
      error: 'El apellido debe tener menos de 50 caracteres',
    }),
  email: z.email({ error: (issue) => (!issue.input ? 'Ingrese un email' : 'El email no es válido') }),
  id_card: z
    .string()
    .trim()
    .length(11, {
      error: 'El carnet debe tener 11 caracteres',
    })
    .regex(/^\d+$/, {
      error: 'El carnet solo puede contener números',
    })
    .transform((val) => Number(val)),
  phone: phoneSchema,
});

export const step2Schema = z
  .object({
    careers: z
      .array(optionStringSchema)
      .min(1, {
        error: 'Debes seleccionar al menos una carrera',
      })
      .max(3, {
        error: 'No puedes seleccionar más de 3 carreras',
      }),
    startingTrimesters: z
      .array(z.string())
      .min(1, {
        error: 'Debes seleccionar al menos una carrera',
      })
      .max(3, {
        error: 'No puedes seleccionar más de 3 carreras',
      }),
    subjects: z.array(
      z.object({
        id: z.string(),
        grade: z
          .number()
          .min(1, {
            error: 'La calificación debe ser mayor a 0',
          })
          .max(20, {
            error: 'La calificación debe ser menor a 20',
          }),
      }),
    ),
    // .min(1, {
    //   message: "Debes seleccionar al menos una materia",
    // }),
  })
  .refine((data) => data.careers.length !== data.startingTrimesters.length, {
    message: 'Los trimestres de inicio deben ser diferentes a las carreras',
  });

export const registerStudentSchema = z
  .object({
    ...step1Schema.shape,
    ...step2Schema.shape,
  })
  .transform((data) => {
    const { careers, startingTrimesters, ...restData } = data;
    const careersWithTrimesters = careers.map((career, index) => ({
      career,
      trimester: startingTrimesters[index],
    }));

    return {
      careersWithTrimesters,
      ...restData,
    };
  });
export type RegisterStudentSchema = z.input<typeof registerStudentSchema>;
export type RegisterStudentOutput = z.output<typeof registerStudentSchema>;

export const defaultRegisterStudentValues: RegisterStudentSchema = {
  name: '',
  lastName: '',
  id_card: '',
  email: '',
  phone: '',
  careers: [],
  subjects: [],
  startingTrimesters: [],
};
