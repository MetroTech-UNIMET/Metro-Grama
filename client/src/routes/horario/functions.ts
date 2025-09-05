export function getStudentTimeSlots(start_hour: number, end_hour: number): string[] {
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
