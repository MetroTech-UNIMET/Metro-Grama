import { format } from "date-fns";
import { es } from "date-fns/locale";

import { MobileEvent } from "../Event";

import { TabsContent } from "@ui/tabs";

import type { DaySchedule } from "../../types";

interface Props {
  schedules: DaySchedule[];
}

export function MobileDayColumns({ schedules }: Props) {
  return (
    <div>
      {schedules.map((day) => (
        <TabsContent
          key={`mobile-${day.day.toISOString()}`}
          value={format(day.day, "EEE", { locale: es })}
        >
          <ul className="flex flex-col gap-4">
            {
              day.events.length > 0 ? (
                day.events.map((event) => (
                  <MobileEvent key={event.id} event={event} />
                ))
              ) : (
                <li className="text-gray-500">No tienes clases programadas</li>
              )
            }
          </ul>
        </TabsContent>
      ))}
    </div>
  );
}
