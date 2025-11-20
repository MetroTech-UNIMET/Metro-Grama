import { toast } from 'sonner';
import { set } from 'date-fns';

import { createSubjectSchedule } from '@/api/subject_scheduleAPI';

import type { SubjectScheduleInput, SubjectScheduleOutput } from './schema';
import type { SubjectSectionWithSchedules } from '@/interfaces/SubjectSection';

export function transformSection(sections: SubjectSectionWithSchedules[]): SubjectScheduleInput['sections'] {
  return sections.map(({ schedules, classroom_code, id }) => ({
    subject_section_id: id,
    classroom_code: classroom_code ?? undefined,
    schedules: schedules.map(
      ({
        day_of_week,
        ending_hour,
        ending_minute: ending_minutes,
        starting_hour,
        starting_minute: starting_minutes,
      }) => ({
        day_of_week,
        starting_time: set(new Date(), {
          hours: starting_hour,
          minutes: starting_minutes,
          seconds: 0,
          milliseconds: 0,
        }),
        ending_time: set(new Date(), { hours: ending_hour, minutes: ending_minutes, seconds: 0, milliseconds: 0 }),
      }),
    ),
  }));
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
