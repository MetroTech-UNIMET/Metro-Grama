import { useMemo, useState } from 'react';

import { cn } from '@utils/className';

import { sectionToSubjectEvents } from '@/features/weekly-schedule/weekly-planner/functions';
import { WeeklyPlanner } from '@/features/weekly-schedule/weekly-planner/WeeklyPlanner';

import { getStudentTimeSlots } from '@/routes/_navLayout/horario/functions';

import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';

import type { Event } from '@/features/weekly-schedule/weekly-planner/types';
import type { SubjectEvent } from '@/routes/_navLayout/horario';
import type { StudentCourse } from '@/api/interactions/student.types';

interface Props {
  current_courses: StudentCourse;
  next_courses: StudentCourse;
}
const studentTimeSlots = getStudentTimeSlots(7, 21);

const scheduleOptions = [
  { value: 'current', label: 'Trimestre actual' },
  { value: 'next', label: 'Próximo trimestre' },
];

export function SchedulesCard({ current_courses, next_courses }: Props) {
  const [scheduleOption, setScheduleOption] = useState('next');

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between">
        <CardTitle>Horario </CardTitle>

        <Select items={scheduleOptions} value={scheduleOption} onValueChange={setScheduleOption}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {scheduleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} label={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="principal" className="relative max-h-128 overflow-y-auto">
          <TabsList className="sticky top-0 z-30">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="secondary">Secundario</TabsTrigger>
          </TabsList>

          {scheduleOption === 'current' ? (
            <CourseScheduleView courses={current_courses} />
          ) : (
            <CourseScheduleView courses={next_courses} />
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function CourseScheduleView({ courses }: { courses: StudentCourse }) {
  const principalSubjectEvents = useMemo(
    () => courses?.principal?.flatMap((section) => sectionToSubjectEvents(section, 'xd')) ?? [],
    [courses],
  );

  const secondarySubjectEvents = useMemo(
    () => courses?.secondary?.flatMap((section) => sectionToSubjectEvents(section, 'xd')) ?? [],
    [courses],
  );

  // FIXME - Mejor mensajes de vacio
  return (
    <>
      <TabsContent value="principal">
        {principalSubjectEvents.length !== 0 ? (
          <StudentPlanner events={principalSubjectEvents} />
        ) : (
          <div className="text-muted-foreground">Aún no hay cursos principales</div>
        )}
      </TabsContent>

      <TabsContent value="secondary">
        {secondarySubjectEvents.length !== 0 ? (
          <StudentPlanner events={secondarySubjectEvents} />
        ) : (
          <div className="text-muted-foreground">Aún no hay cursos secundarios</div>
        )}
      </TabsContent>
    </>
  );
}

function StudentPlanner({ events }: { events: Event<SubjectEvent>[] }) {
  return (
    <WeeklyPlanner
      events={events}
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
    ></WeeklyPlanner>
  );
}
