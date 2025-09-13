import z from 'zod/v4';

import { createIdSchema } from '@/lib/schemas/surreal';

export const courseSchema = z
  .object({
    studentId: createIdSchema('student'),
    subjectEvents: z.array(
      z.object({
        id: createIdSchema('subject_offer'),
        subjectSectionId: createIdSchema('subject_section'),
      }),
    ),
    trimesterId: createIdSchema('trimester'),
    is_principal: z.boolean().prefault(false),
  })
  .transform(({ subjectEvents, ...data }) => {
    return {
      ...data,
      sections: subjectEvents.map((item) => item.subjectSectionId),
    };
  });

export type CourseSchemaInput = z.input<typeof courseSchema>;
export type CourseSchemaOutput = z.output<typeof courseSchema>;
