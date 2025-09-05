import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { SaveScheduleButton } from './components/SaveScheduleButton';
import { getStudentTimeSlots } from './functions';
import { queryParams } from './queryParams';

import { PlannerSidebar } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/PlannerSidebar/PlannerSidebar';
import { WeeklyPlanner } from '@/features/weekly-schedule/weekly-planner/WeeklyPlanner';

import AuthenticationContext from '@/contexts/AuthenticationContext';

import { cn } from '@utils/className';
import { formatTimeHour } from '@utils/time';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@ui/sidebar';

import type { Event } from '@/features/weekly-schedule/weekly-planner/types';
import type { SubjectOffer } from '@/interfaces/SubjectOffer';
import type { SubjectSection } from '@/interfaces/SubjectSection';
import type { Trimester } from '@/interfaces/Trimester';

export const Route = createFileRoute('/horario/')({
  validateSearch: (search) => queryParams.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AuthenticationContext>
        <WeeklySchedulePage />
      </AuthenticationContext>
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
  const [subjectEvents, setSubjectEvents] = useState<Event<SubjectEvent>[]>([
    // {
    //   id: 'm1',
    //   start_hour: '09:30',
    //   end_hour: '10:30',
    //   title: 'Abs Circuit',
    //   type: 'abs',
    //   dayIndex: 1,
    // },
    // {
    //   id: 'm2',
    //   start_hour: '11:00',
    //   end_hour: '12:30',
    //   title: 'Rowing Workout',
    //   type: 'rowing',
    //   dayIndex: 1,
    // },
    // {
    //   id: 'm3',
    //   start_hour: '14:00',
    //   end_hour: '15:15',
    //   title: 'Yoga Level 1',
    //   type: 'yoga1',
    //   dayIndex: 1,
    // },
    // {
    //   id: 't1',
    //   start_hour: '10:00',
    //   end_hour: '11:00',
    //   title: 'Rowing Workout',
    //   type: 'rowing',
    //   dayIndex: 2,
    // },
    // {
    //   id: 't2',
    //   start_hour: '11:30',
    //   end_hour: '13:00',
    //   title: 'Restorative Yoga',
    //   type: 'restorative',
    //   dayIndex: 2,
    // },
    // {
    //   id: 't3',
    //   start_hour: '13:30',
    //   end_hour: '15:00',
    //   title: 'Abs Circuit',
    //   type: 'abs',
    //   dayIndex: 2,
    // },
    // {
    //   id: 't4',
    //   start_hour: '15:45',
    //   end_hour: '16:45',
    //   title: 'Yoga Level 1',
    //   type: 'yoga1',
    //   dayIndex: 2,
    // },
    // {
    //   id: 'w1',
    //   start_hour: '09:00',
    //   end_hour: '10:15',
    //   title: 'Restorative Yoga',
    //   type: 'restorative',
    //   dayIndex: 3,
    // },
    // {
    //   id: 'w2',
    //   start_hour: '10:45',
    //   end_hour: '11:45',
    //   title: 'Yoga Level 1',
    //   type: 'yoga1',
    //   dayIndex: 3,
    // },
    // {
    //   id: 'w3',
    //   start_hour: '12:00',
    //   end_hour: '13:45',
    //   title: 'Rowing Workout',
    //   type: 'rowing',
    //   dayIndex: 3,
    // },
    // {
    //   id: 'w4',
    //   start_hour: '13:45',
    //   end_hour: '15:00',
    //   title: 'Yoga Level 1',
    //   type: 'yoga1',
    //   dayIndex: 3,
    // },
    // {
    //   id: 'th1',
    //   start_hour: '09:30',
    //   end_hour: '10:30',
    //   title: 'Abs Circuit',
    //   type: 'abs',
    //   dayIndex: 4,
    // },
    // {
    //   id: 'th2',
    //   start_hour: '12:00',
    //   end_hour: '13:45',
    //   title: 'Restorative Yoga',
    //   type: 'restorative',
    //   dayIndex: 4,
    // },
    // {
    //   id: 'th3',
    //   start_hour: '15:30',
    //   end_hour: '16:30',
    //   title: 'Abs Circuit',
    //   type: 'abs',
    //   dayIndex: 4,
    // },
    // {
    //   id: 'th4',
    //   start_hour: '17:00',
    //   end_hour: '18:00',
    //   title: 'Rowing Workout',
    //   type: 'rowing',
    //   dayIndex: 4,
    // },
    // {
    //   id: 'f1',
    //   start_hour: '10:00',
    //   end_hour: '11:00',
    //   title: 'Rowing Workout',
    //   type: 'rowing',
    //   dayIndex: 5,
    // },
    // {
    //   id: 'f2',
    //   start_hour: '12:30',
    //   end_hour: '14:00',
    //   title: 'Abs Circuit',
    //   type: 'abs',
    //   dayIndex: 5,
    // },
    // {
    //   id: 'f3',
    //   start_hour: '15:45',
    //   end_hour: '16:45',
    //   title: 'Yoga Level 1',
    //   type: 'yoga1',
    //   dayIndex: 5,
    // },
  ]);

  return (
    <SidebarProvider customWidth="20rem">
      <PlannerSidebar
        onAddSubject={(subject_offer, sectionIndex) => {
          const section = subject_offer.sections[sectionIndex];
          const schedules = section.schedules;

          console.log(subject_offer);

          setSubjectEvents((prev) => [
            ...prev,
            ...schedules.map((schedule) => ({
              id: schedule.id.ID,
              title: subject_offer.subject.name,
              start_hour: formatTimeHour(schedule.starting_hour, schedule.starting_minute),
              end_hour: formatTimeHour(schedule.ending_hour, schedule.ending_minute),
              type: 'rowing' as any,
              dayIndex: schedule.day_of_week,
              data: { id: subject_offer.id, subjectSectionId: section.id, trimesterId: subject_offer.trimester.id },
            })),
          ]);
        }}
        onRemoveSubject={(subject_offerId) => {
          setSubjectEvents((prev) => [...prev.filter((event) => event.data.id.ID !== subject_offerId.ID)]);
        }}
        getIsSubjectSelected={(subject_offer) =>
          subjectEvents.some((event) => event.title === subject_offer.subject.name)
        }
      />

      <SidebarInset className="relative">
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
