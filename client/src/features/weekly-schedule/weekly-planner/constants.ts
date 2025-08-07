import { eachDayOfInterval } from "date-fns";

export const daysOfWeek = eachDayOfInterval({
  start: new Date(
    new Date().setDate(new Date().getDate() - new Date().getDay() + 1)
  ), // Adjust to the most recent Monday
  end: new Date(
    new Date().setDate(new Date().getDate() - new Date().getDay() + 7)
  ),
});
