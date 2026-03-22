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

export interface DatabaseSchedule {
  day_of_week: number;
  
  starting_hour: number;
  starting_minute: number;

  ending_hour: number;
  ending_minute: number;
}