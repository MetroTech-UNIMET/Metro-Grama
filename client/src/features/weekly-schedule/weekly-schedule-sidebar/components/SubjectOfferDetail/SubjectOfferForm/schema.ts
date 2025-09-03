import z from 'zod/v4';
import { correctIntervalBetweenHours, default10Hour, default8Hour } from './constants';
import { differenceInMinutes, getHours, getMinutes } from 'date-fns';

const scheduleSchema = z
  .object({
    starting_time: z.date({
      error: (issue) => (!issue.input ? 'Selecciona la hora de inicio' : 'Hora de inicio inválida'),
    }),
    ending_time: z.date({
      error: (issue) => (!issue.input ? 'Selecciona la hora de finalización' : 'Hora de finalización inválida'),
    }),
    day_of_week: z
      .number({
        error: (issue) => (!issue.input ? 'Selecciona el día de la semana' : 'Día de la semana inválido'),
      })
      .min(0)
      .max(6),
  })
  .check((ctx) => {
    const { starting_time, ending_time } = ctx.value;
    // Ensure start is before end
    console.log(starting_time, ending_time, starting_time >= ending_time);
    if (starting_time >= ending_time) {
      ctx.issues.push({
        code: 'too_big',
        input: ctx.value,
        maximum: ending_time.getTime(),
        origin: 'date',
        inclusive: false,
        path: ['starting_time'],
        message: 'La hora de inicio debe ser anterior a la hora de fin',
      });
    }

    const diff = differenceInMinutes(ending_time, starting_time);
    if (diff !== correctIntervalBetweenHours) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        path: ['ending_time'],
        message: `El intervalo debe ser de exactamente ${correctIntervalBetweenHours} minutos`,
      });
    }
  })
  .transform(({ starting_time, ending_time, ...value }) => {
    return {
      ...value,
      starting_time: {
        hours: getHours(starting_time),
        minutes: getMinutes(starting_time),
      },
      ending_time: {
        hours: getHours(ending_time),
        minutes: getMinutes(ending_time),
      },
    };
  });

const sectionsSchema = z.object({
  schedules: z
    .array(scheduleSchema)
    .min(1, {
      message: 'Se requiere al menos un horario para la materia',
    })
    .max(3, {
      message: 'Se permiten un máximo de 3 horarios para la materia',
    }),
  classroom_code: z.string().optional(),
});

export const subjectScheduleSchema = z.object({
  sections: z
    .array(sectionsSchema)
    .min(1, {
      error: 'Se requiere al menos una sección para la materia',
    })
    .max(10, {
      error: 'Se permiten un máximo de 10 secciones para la materia',
    })
    .transform((value) => value.map((section, index) => ({ ...section, section_number: index + 1 }))),
  subject_offer_id: z.object({
    ID: z.string(),
    Table: z.literal('subject_offer'),
  }),
});

export type SubjectScheduleInput = z.input<typeof subjectScheduleSchema>;
export type SubjectScheduleOutput = z.output<typeof subjectScheduleSchema>;

export const subjectScheduleDefaultValues: SubjectScheduleInput = {
  sections: [
    {
      schedules: [
        {
          starting_time: default8Hour,
          ending_time: default10Hour,
          day_of_week: null as any,
        },
      ],
    },
  ],
  subject_offer_id: { ID: '', Table: 'subject_offer' },
};
