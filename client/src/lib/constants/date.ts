import { format, eachDayOfInterval } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

export const defaultLocale = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? es : enUS;
const weekdayDates = Array.from({ length: 7 }).map((_, i) => new Date(1970, 0, 4 + i));

export const weekDayOptions = weekdayDates.map((date, idx) => ({
  value: idx,
  label: format(date, 'EEEE', { locale: defaultLocale }),
}));

export const daysOfWeek = eachDayOfInterval({
  start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
  end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 6)),
});
