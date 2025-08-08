import { z } from 'zod/v4';
import { numberOfSubjectsByTrimester, numberOfTrimesters } from './constants';

import type { Step } from '@/hooks/useFormStep';

export type CreateCareerFormType = z.infer<typeof createCareerSchema>;
export type CreateSubjectType = z.infer<typeof subjectSchema>;

const subjectCodeOptionSchema = z.object({
  label: z.string(),
  value: z.string().length(7, {
    error: 'El código debe tener exactamente 7 caracteres',
  }),
});

const subjectSchema = z
  .object({
    code: z.string().optional(),
    name: z.string().optional(),
    credits: z
      .int()
      .min(0, {
        error: 'Los créditos nesarios no pueden ser negativos',
      })
      .max(150, {
        error: 'Los créditos necesarios no pueden exceder 150',
      })
      .optional(),
    BPCredits: z
      .int()
      .min(0, {
        error: 'Los créditos nesarios no pueden ser negativos',
      })
      .max(150, {
        error: 'Los créditos necesarios no pueden exceder 150',
      })
      .optional(),
    prelations: z
      .array(subjectCodeOptionSchema)
      .max(3, {
        error: 'Esta materia no puede depender de más de 3 materias',
      })
      .prefault([]),
    subjectType: z.enum(['elective', 'existing', 'new']).prefault('new'),
  })
  .superRefine((data, ctx) => {
    if (data.subjectType === 'elective') {
      if (data.prelations.length > 0) {
        ctx.issues.push({
          code: 'custom',
          message: 'Las materias electivas no pueden tener prelaciones',
          path: ['prelations'],
          input: data.prelations,
        });
      }
    } else {
      validateNonElective(data, ctx);
    }
  });

const stepCareerSchema = z.object({
  name: z.string().min(5, {
    error: 'El nombre de la carrera debe tener mínimo 5 caracteres',
  }),
  emoji: z
    .string()
    .regex(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/, {
      error: 'El emoji no es válido',
    }),
  id: z
    .string()
    .min(5, {
      error: 'El id de la carrera debe tener mínimo 5 caracteres',
    })
    .max(10, {
      error: 'El id de la carrera debe tener máximo 10 caracteres',
    }),
});

const stepSubjects = z.object({
  subjects: z
    .array(
      z
        .array(subjectSchema)
        .length(numberOfSubjectsByTrimester, {
          error: `Cada trimestre debe tener exactamente ${numberOfSubjectsByTrimester} materias`,
        })
        .length(1, {
          error: 'xdddd',
        }),
    )
    .length(numberOfTrimesters, {
      error: `Debe haber exactamente ${numberOfTrimesters} trimestres`,
    }),
});

export const createCareerSchema = z.object({
  ...stepCareerSchema.shape,
  ...stepSubjects.shape,
});
export const defaultCreateCareerValues: CreateCareerFormType = {
  name: '',
  emoji: '',
  id: '',
  subjects: Array.from({ length: numberOfTrimesters }, () =>
    Array.from({ length: numberOfSubjectsByTrimester }, () => ({
      code: '',
      name: '',
      credits: 0,
      BPCredits: 0,
      prelations: [],
      subjectType: 'new' as 'elective' | 'existing' | 'new',
    })),
  ),
};

const trimesterSteps = generateSteps(numberOfTrimesters);

export const steps: Step[] = [
  {
    id: 'Carrera',
    schema: stepCareerSchema,
  },
  ...trimesterSteps,
];

function validateNonElective(data: CreateSubjectType, ctx: z.RefinementCtx) {
  if (!data.code) {
    ctx.issues.push({
      path: ['code'],
      code: 'invalid_type',
      expected: 'string',
      received: undefined,
      input: data.code,
      message: 'El código de la materia es obligatorio',
    });
  } else if (data.code.length !== 7) {
    ctx.issues.push({
      code: 'too_small',
      path: ['code'],
      minimum: 7,
      exact: true,
      origin: 'string',
      inclusive: true,
      input: data.code,
      message: 'El código de la materia debe tener exactamente 7 caracteres',
    });
  }

  if (!data.name) {
    ctx.issues.push({
      path: ['name'],
      code: 'invalid_type',
      expected: 'string',
      received: undefined,
      input: data.name,
      message: 'El nombre de la materia es obligatorio',
    });
  }

  if (data.credits === undefined) {
    ctx.issues.push({
      path: ['credits'],
      code: 'invalid_type',
      expected: 'number',
      received: undefined,
      input: data.credits,
      message: 'Los créditos de la materia son obligatorios',
    });
  } else if (data.BPCredits === undefined) {
    ctx.issues.push({
      path: ['BPCredits'],
      code: 'invalid_type',
      expected: 'number',
      received: 'undefined',
      input: data.BPCredits,
      message: 'Los créditos de la materia son obligatorios',
    });
  }
}

function generateSteps(numberOfTrimesters: number) {
  const steps: Step[] = [];

  for (let trimesterIndex = 0; trimesterIndex < numberOfTrimesters; trimesterIndex++) {
    steps.push({
      id: trimesterIndex + 1,
      schema: stepSubjects,
    });
  }

  return steps;
}

// REVIEW - Esto se usaba pasra retonar el indices de los codigos que se repetian
// El problema es quie una vez que seteas el error, no lo toma con inválido y
// el post-checking para ver si no se repite haría el código más complejo y más lento

// .superRefine((data, ctx) => {
//   const allCodes = data.subjects.flatMap((subject, trimesterIndex) =>
//     subject.map((item, subjectIndex) => ({
//       code: item.code,
//       trimesterIndex,
//       subjectIndex,
//     }))
//   );
//   const codeMap: Map<string, [number, number][]> = new Map();

//   allCodes.forEach(({ code, trimesterIndex, subjectIndex }) => {
//     const repeatedIndexes = codeMap.get(code);

//     if (repeatedIndexes) {
//       codeMap.set(code, [...repeatedIndexes, [trimesterIndex, subjectIndex]]);
//     } else {
//       codeMap.set(code, [[trimesterIndex, subjectIndex]]);
//     }
//   });

//   const repeatedIndexes = Array.from(codeMap.values())
//     .filter((indexes) => indexes.length > 1)
//     .flat();

//   const repeatedCodes = Array.from(
//     new Set(
//       repeatedIndexes.map(
//         ([trimesterIndex, subjectIndex]) =>
//           data.subjects[trimesterIndex][subjectIndex].code
//       )
//     )
//   );

//   if (repeatedCodes.length > 0) {
//     const message =
//       repeatedCodes.length > 1
//         ? `Los códigos ${repeatedCodes.join(", ")} están repetidos`
//         : `El código ${repeatedCodes[0]} está repetido`;

//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message,
//       path: ["subjects"],
//       params: { repeatedIndexes },
//     });
//   }

//   return z.NEVER;
// });
