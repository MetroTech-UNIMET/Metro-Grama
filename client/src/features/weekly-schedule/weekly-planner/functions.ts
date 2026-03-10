import { formatTimeHour } from '@utils/time';
import { createSurrealId } from '@utils/queries';

import type { SubjectSectionWithSubject, SubjectSectionWithSubjectAndAvgs } from '@/api/interactions/course.types';
import type { BaseSubjectEvent, SubjectEvent } from '@/routes/_navLayout/horario';
import type { Event } from '@/features/weekly-schedule/weekly-planner/types';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

export function sectionToBaseSubjectEvents(section: SubjectSectionWithSubject): Event<BaseSubjectEvent>[] {
  return section.subject_schedule.map((subjectSchedule) =>
    schedulesToBaseSubjectEvents(subjectSchedule, {
      subjectName: section.subject.name,
      subjectOfferId: section.subject_offer,
      subjectSectionId: section.id,
    }),
  );
}

export function sectionToSubjectEvents(
  section: SubjectSectionWithSubjectAndAvgs,
  trimesterId: string,
): Event<SubjectEvent>[] {
  return section.subject_schedule.map((subjectSchedule) =>
    schedulesToSubjectEvents(subjectSchedule, {
      subjectName: section.subject.name,
      trimesterId: createSurrealId('trimester', trimesterId),
      subjectOfferId: section.subject_offer,
      subjectSectionId: section.id,
      avg_difficulty: section.avg_difficulty,
      avg_grade: section.avg_grade,
      avg_workload: section.avg_workload,
    }),
  );
}

export function schedulesToSubjectEvents(
  subjectSchedule: SubjectSchedule,
  extraData: {
    subjectName: string;
    trimesterId: SubjectEvent['trimesterId'];
    subjectSectionId: SubjectEvent['subjectSectionId'];
    subjectOfferId: SubjectEvent['id'];
    avg_difficulty: number;
    avg_grade: number;
    avg_workload: number;
  },
): Event<SubjectEvent> {
  return {
    id: subjectSchedule.id.ID,
    title: extraData.subjectName,
    start_hour: formatTimeHour(subjectSchedule.starting_hour, subjectSchedule.starting_minute),
    end_hour: formatTimeHour(subjectSchedule.ending_hour, subjectSchedule.ending_minute),
    dayIndex: subjectSchedule.day_of_week,
    data: {
      id: extraData.subjectOfferId,
      subjectSectionId: extraData.subjectSectionId,
      trimesterId: extraData.trimesterId,
      avg_difficulty: extraData.avg_difficulty,
      avg_grade: extraData.avg_grade,
      avg_workload: extraData.avg_workload,
    },
  };
}

export function schedulesToBaseSubjectEvents(
  subjectSchedule: SubjectSchedule,
  extraData: {
    subjectName: string;
    subjectSectionId: SubjectEvent['subjectSectionId'];
    subjectOfferId: SubjectEvent['id'];
  },
): Event<BaseSubjectEvent> {
  return {
    id: subjectSchedule.id.ID,
    title: extraData.subjectName,
    start_hour: formatTimeHour(subjectSchedule.starting_hour, subjectSchedule.starting_minute),
    end_hour: formatTimeHour(subjectSchedule.ending_hour, subjectSchedule.ending_minute),
    dayIndex: subjectSchedule.day_of_week,
    data: {
      id: extraData.subjectOfferId,
      subjectSectionId: extraData.subjectSectionId,
    },
  };
}
