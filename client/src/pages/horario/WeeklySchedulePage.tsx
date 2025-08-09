import { PlannerSidebar } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/PlannerSidebar';
import { WeeklyPlanner } from '@/features/weekly-schedule/weekly-planner/WeeklyPlanner';

import { cn } from '@utils/className';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@ui/sidebar';

function getStudentTimeSlots(start_hour: number, end_hour: number): string[] {
  const startHour = start_hour * 60;
  const endHour = end_hour * 60;
  const slots: string[] = [];

  let currentTime = startHour;
  let count = 0;

  while (currentTime < endHour) {
    const hours = Math.floor(currentTime / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (currentTime % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);

    if (count === 2) {
      currentTime += 15; // Add 15 minutes after every 2 slots of 45 minutes
      count = 0;
    } else {
      currentTime += 45; // Add 45 minutes for the first two slots
      count++;
    }
  }

  return slots;
}

const studentTimeSlots = getStudentTimeSlots(7, 21);

export default function WeeklySchedulePage() {
  return (
    <SidebarProvider customWidth="20rem">
      <PlannerSidebar />

      <SidebarInset className="relative">
        <SidebarTrigger
          colors={'primary'}
          variant={'default'}
          className="absolute top-4 left-4 z-10 rounded-full"
          size="big-icon"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 overflow-auto pl-16">
          <WeeklyPlanner
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
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
