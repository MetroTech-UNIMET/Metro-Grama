import { useMemo } from "react";
import { format } from "date-fns";

import { daysOfWeek } from "../constants";
import { useWeeklyPlannerContext } from "../context";

import { TabsList, TabsTrigger } from "@ui/tabs";

export function MobileTabNavigation() {
  const { locale } = useWeeklyPlannerContext();
  const weekdays = useMemo(
    () => daysOfWeek.map((day) => format(day, "EEE", { locale })),
    [locale]
  );

  return (
    <TabsList className="flex items-center gap-2 h-20 bg-transparent lg:hidden">
      {weekdays.map((day) => (
        <TabsTrigger
          key={day}
          className="grow basis-0 uppercase text-xl h-20 bg-gray-100"
          value={day}
        >
          {day}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
// data-[state=active]
