import { z } from "zod";
import type { Step } from "@/hooks/useFormStep";
import type { Path } from "react-hook-form";

export const numberOfTrimesters = 12;
export const numberOfSubjectsByTrimester = 5;

export type CreateCareerFormType = z.infer<typeof createCareerSchema>;
export type CreateSubjectType = z.infer<typeof subjectSchema>;

const subjectCodeOptionSchema = z.object({
  label: z.string(),
  value: z.string().length(7, {
    message: "El código debe tener exactamente 7 caracteres",
  }),
});

const subjectSchema = z
  .object({
    code: z.string().optional(),
    name: z.string().optional(),
    credits: z
      .number()
      .int({
        message: "Los créditos necesarios deben ser un número entero",
      })
      .min(0, {
        message: "Los créditos nesarios no pueden ser negativos",
      })
      .max(150, {
        message: "Los créditos necesarios no pueden exceder 150",
      })
      .optional(),
    BPCredits: z
      .number()
      .int({
        message: "Los créditos necesarios deben ser un número entero",
      })
      .min(0, {
        message: "Los créditos nesarios no pueden ser negativos",
      })
      .max(150, {
        message: "Los créditos necesarios no pueden exceder 150",
      })
      .optional(),
    prelations: z
      .array(subjectCodeOptionSchema)
      .max(3, {
        message: "Esta materia no puede depender de más de 3 materias",
      })
      .default([]),
    subjectType: z.enum(["elective", "existing", "new"]).default("new"),
  })
  .superRefine((data, ctx) => {
    if (data.subjectType === "elective") {
      if (data.prelations.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las materias electivas no pueden tener prelaciones",
          path: ["elective"],
        });
      }
    } else {
      validateNonElective(data, ctx);
    }
  });

export const createCareerSchema = z.object({
  name: z.string().min(5, {
    message: "El nombre de la carrera debe tener mínimo 5 caracteres",
  }),
  emoji: z
    .string()
    .regex(
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/,
      {
        message: "El emoji no es válido",
      }
    ),
  id: z
    .string()
    .min(5, { message: "El id de la carrera debe tener mínimo 5 caracteres" })
    .max(10, {
      message: "El id de la carrera debe tener máximo 10 caracteres",
    }),
  subjects: z.array(
    z.array(subjectSchema).length(numberOfSubjectsByTrimester, {
      message: "Cada trimestre debe tener exactamente 5 materias",
    })
  ),
});

export const defaultCreateCareerValues: CreateCareerFormType = {
  name: "",
  emoji: "",
  id: "",
  subjects: Array.from({ length: numberOfTrimesters }, () =>
    Array.from({ length: numberOfSubjectsByTrimester }, () => ({
      code: "",
      name: "",
      credits: 0,
      BPCredits: 0,
      prelations: [],
      subjectType: "new" as "elective" | "existing" | "new",
    }))
  ),
};

const [trimesterSteps, groupedFieldNames] = generateSteps(
  numberOfTrimesters,
  numberOfSubjectsByTrimester
);

export { groupedFieldNames };
export const steps: Step<CreateCareerFormType>[] = [
  {
    id: "Carrera",
    fields: ["name", "emoji", "id"],
  },
  ...trimesterSteps,
];

function validateNonElective(data: CreateSubjectType, ctx: z.RefinementCtx) {
  if (!data.code) {
    ctx.addIssue({
      message: "El código de la materia es obligatorio",
      path: ["code"],
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
    });
  } else if (data.code.length !== 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      message: "El código de la materia debe tener exactamente 7 caracteres",
      path: ["code"],
      minimum: 7,
      exact: true,
      type: "string",
      inclusive: true,
    });
  }

  if (!data.name) {
    ctx.addIssue({
      message: "El nombre de la materia es obligatorio",
      path: ["name"],
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
    });
  }

  if (data.credits === undefined) {
    ctx.addIssue({
      message: "Los créditos de la materia son obligatorios",
      path: ["credits"],
      code: z.ZodIssueCode.invalid_type,
      expected: "number",
      received: "undefined",
    });
  } else if (data.BPCredits === undefined) {
    ctx.addIssue({
      message: "Los créditos de la materia son obligatorios",
      path: ["BPCredits"],
      code: z.ZodIssueCode.invalid_type,
      expected: "number",
      received: "undefined",
    });
  }
}

function generateSteps(
  numberOfTrimesters: number,
  numberOfSubjectsByTrimester: number
) {
  type CreateCareerPath = Path<CreateCareerFormType>;

  const steps: Step<CreateCareerFormType>[] = [];
  const groupedNames: Record<
    `subjects.${number}.${number}`,
    Readonly<CreateCareerPath[]>
  >[] = [];

  for (
    let trimesterIndex = 0;
    trimesterIndex < numberOfTrimesters;
    trimesterIndex++
  ) {
    const fields: CreateCareerPath[] = [];
    const subjectGroup: Record<string, Readonly<CreateCareerPath[]>> = {};

    for (
      let subjectIndex = 0;
      subjectIndex < numberOfSubjectsByTrimester;
      subjectIndex++
    ) {
      const subjectName = `subjects.${trimesterIndex}.${subjectIndex}` as const;

      const subjectFields = [
        `${subjectName}.code`,
        `${subjectName}.name`,
        `${subjectName}.credits`,
        `${subjectName}.BPCredits`,
      ] as const;
      fields.push(...subjectFields);

      subjectGroup[subjectName] = subjectFields;
    }

    groupedNames.push(subjectGroup);
    steps.push({
      id: trimesterIndex + 1,
      fields,
    });
  }

  return [steps, groupedNames] as const;
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
