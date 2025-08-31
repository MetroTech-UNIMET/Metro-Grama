import { toast } from 'sonner';
import { set } from 'date-fns';

import { createSubjectSchedule } from '@/api/subject_scheduleAPI';

import type { SubjectScheduleInput, SubjectScheduleOutput } from './schema';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

// FIXME - No esta dando la hora que tengo en la row de la BD
export function transformSchedules(schedules: SubjectSchedule[]): SubjectScheduleInput['schedules'] {
  return schedules.map(
    ({
      day_of_week,
      ending_hour,
      ending_minute: ending_minutes,
      starting_hour,
      starting_minute: starting_minutes,
    }) => ({
      day_of_week,
      starting_time: set(new Date(), { hours: starting_hour, minutes: starting_minutes, seconds: 0, milliseconds: 0 }),
      ending_time: set(new Date(), { hours: ending_hour, minutes: ending_minutes, seconds: 0, milliseconds: 0 }),
    }),
  );
}

export async function upsertSubjectSchedule(data: SubjectScheduleOutput) {
  try {
    const result = await createSubjectSchedule(data);
    toast.success(result.message);
  } catch (error: any) {
    toast.error('Error al guardar los horarios, intenta nuevamente.', {
      description: error.message,
    });
    throw error;
  }
}
