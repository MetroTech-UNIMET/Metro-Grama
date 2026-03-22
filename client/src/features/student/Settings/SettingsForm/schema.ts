import z from 'zod/v4';
import { getHours, getMinutes, set } from 'date-fns';
import { findOverlappingIndexesByDay } from '@utils/time-overlapping';
import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';

export const visibilitySchema = z.enum(['public', 'friendsFriends', 'onlyFriends', 'private']);

const schedulePreferenceSchema = z
  .object({
    day_of_week: z.int().min(0).max(6),
    starting_time: z.date({
      error: (issue) => (!issue.input ? 'Selecciona la hora de inicio' : 'Hora de inicio inválida'),
    }),
    ending_time: z.date({
      error: (issue) => (!issue.input ? 'Selecciona la hora de finalización' : 'Hora de finalización inválida'),
    }),
  })
  .check((ctx) => {
    const { starting_time, ending_time } = ctx.value;
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
  })
  .transform(({ starting_time, ending_time, ...value }) => {
    return {
      ...value,
      starting_hour: getHours(starting_time),
      starting_minute: getMinutes(starting_time),
      ending_hour: getHours(ending_time),
      ending_minute: getMinutes(ending_time),
    };
  });

const schedulePreferencesSchema = z
  .object({
    default_order: z.enum(OrderBySubjectOffers),
    preferred_schedules: z.array(schedulePreferenceSchema).default([]),
    prohibited_schedules: z.array(schedulePreferenceSchema).default([]),
  })
  .check((ctx) => {
    const { preferred_schedules, prohibited_schedules } = ctx.value;
    const allSchedules = preferred_schedules.concat(prohibited_schedules);
    const overlapping = findOverlappingIndexesByDay(
      allSchedules,
      (s) => s.day_of_week,
      (s) => s.starting_hour * 60 + s.starting_minute,
      (s) => s.ending_hour * 60 + s.ending_minute,
    );
    if (!overlapping.size) return;

    for (const idx of overlapping) {
      const originSchedule = idx < preferred_schedules.length ? 'preferred_schedules' : 'prohibited_schedules';
      const transformedIdx = idx < preferred_schedules.length ? idx : idx - preferred_schedules.length;

      ctx.issues.push({
        code: 'custom',
        input:
          originSchedule === 'preferred_schedules'
            ? preferred_schedules[transformedIdx]
            : prohibited_schedules[transformedIdx],
        path: [originSchedule, transformedIdx],
        message: 'Horario solapado con otro horario del mismo día',
      });
    }
  });

export const studentSettingsSchema = z.object({
  privacyPreferences: z.object({
    show_friends: visibilitySchema.default('onlyFriends'),
    show_schedule: visibilitySchema.default('onlyFriends'),
    show_subjects: visibilitySchema.default('onlyFriends'),
  }),
  schedulePreferences: schedulePreferencesSchema,
});

export type StudentSettingsFormInput = z.input<typeof studentSettingsSchema>;
export type StudentSettingsFormOutput = z.output<typeof studentSettingsSchema>;
export type Visibility = z.output<typeof visibilitySchema>;
export type SchedulePreference = z.output<typeof schedulePreferenceSchema>;

export const defaultScheduleBlock: z.input<typeof schedulePreferenceSchema> = {
  day_of_week: 0,
  starting_time: set(new Date(), { hours: 7, minutes: 0, seconds: 0, milliseconds: 0 }),
  ending_time: set(new Date(), { hours: 8, minutes: 0, seconds: 0, milliseconds: 0 }),
};

// surrealgo_migrate migrate up --path surrealdb/migrations --host 127.0.0.1:8000 --db test2 --ns test --user root --pass root --path /surrealdb/migrations
