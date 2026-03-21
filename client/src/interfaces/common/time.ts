export interface Time {
  hours: number;
  minutes: number;
}

export interface TimeRange {
  starting_time: Time;
  ending_time: Time;
}

export interface Schedule extends TimeRange {
  day_of_week: number;
}