export function getHourMinutes(hour: string) {
  const [h, m] = hour.split(":").map(Number);
  return { hours: h, minutes: m };
}

export function getTotalMinutes(hour: string) {
  const { hours, minutes } = getHourMinutes(hour);
  return hours * 60 + minutes;
}
