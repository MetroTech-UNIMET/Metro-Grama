import { useCallback, useEffect, useState } from 'react';
import { createFileRoute, useSearch } from '@tanstack/react-router';

import { SaveScheduleButton } from './components/SaveScheduleButton';
import { getStudentTimeSlots } from './functions';
import { queryParams } from './queryParams';

import {
  useFetchStudentCourseByTrimester,
  fetchStudentCourseByTrimesterOptions,
} from '@/hooks/queries/course/use-fetch-student-course-by-trimester';
import { fetchTrimestersOptions } from '@/hooks/queries/trimester/use-FetchTrimesters';
import { fetchCareersOptions } from '@/hooks/queries/use-FetchCareersOptions';
import { fetchAnnualOfferByTrimesterOptions } from '@/hooks/queries/subject_offer/use-fetch-annual-offer-by-trimester';
import { fetchStudentCareersOptions } from '@/hooks/queries/student/use-fetch-student-careers';

import { PlannerSidebar } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/PlannerSidebar/PlannerSidebar';
import { WeeklyPlanner } from '@/features/weekly-schedule/weekly-planner/WeeklyPlanner';
import { schedulesToSubjectEvents, sectionToSubjectEvents } from '@/features/weekly-schedule/weekly-planner/functions';

import { eatErrorsAsync } from '@utils/errors';
import { cn } from '@utils/className';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@ui/sidebar';

import type { Event } from '@/features/weekly-schedule/weekly-planner/types';
import type { SubjectOffer } from '@/interfaces/SubjectOffer';
import type { SubjectSection } from '@/interfaces/SubjectSection';
import type { Trimester } from '@/interfaces/Trimester';
import type { SubjectSchedule } from '@/interfaces/SubjectSchedule';

// FIXME - Al cambiar de trimestre se queda en un bucle intercambiando
export const Route = createFileRoute('/_navLayout/horario/')({
  validateSearch: queryParams,
  loaderDeps: ({ search: { trimester, is_principal, careers } }) => ({
    trimester,
    is_principal,
    careers,
  }),
  loader: async ({ context, deps: { trimester, is_principal, careers } }) => {
    const qc = context.queryClient;

    const tasks: Promise<any>[] = [
      qc.ensureQueryData(fetchTrimestersOptions()),
      qc.ensureQueryData(fetchCareersOptions()),
    ];

    const trimesterId = trimester !== 'none' ? trimester : '';

    if (trimesterId) {
      tasks.push(
        eatErrorsAsync(async () => {
          () =>
            qc.ensureQueryData(
              fetchStudentCourseByTrimesterOptions({
                trimesterId,
                params: { is_principal },
                queryOptions: { enabled: true },
              } as any),
            );
        }),
      );
      qc.ensureQueryData(
        fetchAnnualOfferByTrimesterOptions({
          trimesterId,
          optionalQuery: { careers: (careers ?? []).map((c: string) => c) },
          queryOptions: { enabled: true },
        } as any),
      );
    }

    eatErrorsAsync(async () => {
      qc.ensureQueryData(fetchStudentCareersOptions());
    });

    const [trimesterOptions, careerOptions, studentCourse] = await Promise.all(tasks);
    return { trimesterOptions, careerOptions, studentCourse };
  },
  // TODO - Skeleton con pendingComponent
  // pendingComponent: () => <div>Loading...</div>,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WeeklySchedulePage />
    </>
  );
}

const studentTimeSlots = getStudentTimeSlots(7, 21);

export interface SubjectEvent {
  id: SubjectOffer['id'];
  subjectSectionId: SubjectSection['id'];
  trimesterId: Trimester['id'];
}

function WeeklySchedulePage() {
  const search = useSearch({ from: '/_navLayout/horario/' });
  const trimesterId = search.trimester !== 'none' ? search.trimester : '';
  const isPrincipal = search.is_principal;

  const [subjectEvents, setSubjectEvents] = useState<Event<SubjectEvent>[]>([]);

  // Fetch existing saved course (principal or secondary) and map to events
  const courseQuery = useFetchStudentCourseByTrimester({
    trimesterId,
    params: { is_principal: isPrincipal },
    queryOptions: { enabled: !!trimesterId },
  });

  useEffect(() => {
    if (courseQuery.isSuccess) {
      const sections = courseQuery.data.sections;
      const events: Event<SubjectEvent>[] = sections.flatMap((sec) =>
        sectionToSubjectEvents(sec, courseQuery.data.trimesterId),
      );

      setSubjectEvents(events);
    }
  }, [courseQuery.isSuccess, courseQuery.data]);

  const getWouldCauseTripleOverlap = useCallback(
    (schedules: SubjectSchedule[]) => {
      return schedules.some((sch) => {
        const schStart = sch.starting_hour * 60 + sch.starting_minute;
        const schEnd = sch.ending_hour * 60 + sch.ending_minute;
        const overlaps = subjectEvents.filter((ev) => {
          if (ev.dayIndex !== sch.day_of_week) return false;
          const [sH, sM] = ev.start_hour.split(':').map(Number);
          const [eH, eM] = ev.end_hour.split(':').map(Number);
          const evStart = sH * 60 + sM;
          const evEnd = eH * 60 + eM;
          return evStart < schEnd && schStart < evEnd; // overlap condition
        });
        return overlaps.length >= 2; // already two events there, adding would make 3
      });
    },
    [subjectEvents],
  );

  return (
    <SidebarProvider customWidth="20rem">
      {/* Memoized sidebar handlers */}
      <PlannerSidebar
        onAddSubject={useCallback((subject_offer, sectionIndex) => {
          const section = subject_offer.sections[sectionIndex];
          const schedules = section.schedules;
          setSubjectEvents((prev) => [
            ...prev,
            ...schedules.map((schedule) =>
              schedulesToSubjectEvents(schedule, {
                subjectName: subject_offer.subject.name,
                trimesterId: subject_offer.trimester.id.ID,
                subjectOfferId: subject_offer.id,
              }),
            ),
          ]);
        }, [])}
        onRemoveSubject={useCallback((subject_offerId) => {
          setSubjectEvents((prev) => prev.filter((event) => event.data.id.ID !== subject_offerId.ID));
        }, [])}
        getIsSubjectSelected={useCallback(
          (subject_offer) => subjectEvents.some((event) => event.title === subject_offer.subject.name),
          [subjectEvents],
        )}
        getIsSectionSelected={useCallback(
          (subject_offer, sectionIndex) => {
            const section = subject_offer.sections[sectionIndex];
            return section.schedules.every((schedule) => subjectEvents.some((event) => event.id === schedule.id.ID));
          },
          [subjectEvents],
        )}
        getWouldCauseTripleOverlap={getWouldCauseTripleOverlap}
      />

      <SidebarInset className="relative pb-16">
        <SidebarTrigger
          colors="primary"
          variant="default"
          className="absolute top-4 left-4 z-10 rounded-full"
          size="big-icon"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-auto pr-9 pl-18">
          <WeeklyPlanner
            events={subjectEvents}
            type="custom-interval"
            overlapping
            timeSlots={studentTimeSlots}
            shouldRenderTime={(_, index) => index % 3 !== 1}
            extraDecoration={(_, index) => (
              <div
                className={cn(
                  'absolute right-0 z-0 h-(--height-row) w-[calc(100%-60px)]',
                  index % 3 === 2 && 'bg-gray-200/70',
                )}
              ></div>
            )}
          >
            <SaveScheduleButton />
          </WeeklyPlanner>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
