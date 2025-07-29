import { WeeklyPlanner } from "@/features/weekly-planner/WeeklyPlanner";
import { cn } from "@utils/className";

function getStudentTimeSlots(start_hour: number, end_hour: number): string[] {
  const startHour = start_hour * 60;
  const endHour = end_hour * 60;
  const slots: string[] = [];

  let currentTime = startHour;
  let count = 0;

  while (currentTime < endHour) {
    const hours = Math.floor(currentTime / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (currentTime % 60).toString().padStart(2, "0");
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

export default function HorarioPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto py-16 w-[calc(100%-2*clamp(1.5rem,calc(1.125rem+0.78125vw),1.75rem))]">
        <WeeklyPlanner
          type="custom-interval"
          timeSlots={studentTimeSlots}
          shouldRenderTime={(_, index) => index % 3 !== 1}
          extraDecoration={(_, index) => (
            <div
              className={cn(
                "w-[calc(100%-60px)] h-12 right-0 absolute z-0",
                index % 3 === 2 && "bg-gray-200/70"
              )}
            ></div>
          )}
        />
      </div>
    </>
  );
}
