import { formatTimeHour } from '@utils/time';

import type { SubjectSectionWithSubject } from '@/api/interactions/course.types';
import type { SubjectEvent } from '@/routes/_navLayout/horario';
import type { Event } from '@/features/weekly-schedule/weekly-planner/types';
import { SubjectSchedule } from '@/interfaces/SubjectSchedule';

export function sectionToSubjectEvents(section: SubjectSectionWithSubject, trimesterId: string): Event<SubjectEvent>[] {
  return section.subject_schedule.map((subjectSchedule) =>
    schedulesToSubjectEvents(subjectSchedule, {
      subjectName: section.subject.name,
      trimesterId,
      subjectOfferId: section.subject_offer,
    }),
  );
}

export function schedulesToSubjectEvents(
  subjectSchedule: SubjectSchedule,
  extraData: {
    subjectName: string;
    trimesterId: string;
    subjectOfferId: SubjectEvent['id'];
  },
): Event<SubjectEvent> {
  return {
    id: subjectSchedule.id.ID,
    title: extraData.subjectName,
    start_hour: formatTimeHour(subjectSchedule.starting_hour, subjectSchedule.starting_minute),
    end_hour: formatTimeHour(subjectSchedule.ending_hour, subjectSchedule.ending_minute),
    type: 'rowing' as any,
    dayIndex: subjectSchedule.day_of_week,
    data: {
      id: extraData.subjectOfferId,
      subjectSectionId: subjectSchedule.id,
      trimesterId: { ID: extraData.trimesterId, Table: 'trimester' },
    },
  };
}
