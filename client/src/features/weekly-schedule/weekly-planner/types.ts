export interface Day {
  name: string;
}

type HourString = `${string}:${string}`;

export interface SubjectEvent {
  id: string;
  start_hour: HourString;
  end_hour: HourString;
  title: string;
  type: 'abs' | 'rowing' | 'yoga1' | 'restorative';
  dayIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Represents days of the week from Sunday (0) to Saturday (6)
}

export interface Event {
  id: string;
  start_hour: HourString;
  end_hour: HourString;
  /** TODO BORRAR */
  type: 'abs' | 'rowing' | 'yoga1' | 'restorative';

  title: string;
}

export type DaySchedule = {
  day: Date;
  events: Event[];
};
