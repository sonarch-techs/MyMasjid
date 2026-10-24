export interface JumuahLifecycle {
  isTodayFriday: boolean;
  todayDateStr: string;
  lastFridayDateStr: string;
  nextFridayDateStr: string;
  daysUntilNextFriday: number;
}

export function getJumuahLifecycle(referenceDate: Date = new Date()): JumuahLifecycle {
  const current = new Date(referenceDate);
  const dayOfWeek = current.getDay(); // 0 = Sunday, 5 = Friday
  const isTodayFriday = dayOfWeek === 5;

  const todayDateStr = formatDate(current);

  // 1. Calculate Last Completed Friday
  const lastFriday = new Date(current);
  if (isTodayFriday) {
    // If today is Friday, previous completed Friday was 7 days ago
    lastFriday.setDate(current.getDate() - 7);
  } else {
    // Number of days back to the preceding Friday
    const daysBack = (dayOfWeek + 7 - 5) % 7;
    lastFriday.setDate(current.getDate() - daysBack);
  }
  const lastFridayDateStr = formatDate(lastFriday);

  // 2. Calculate Next Upcoming Friday
  const nextFriday = new Date(current);
  let daysForward = (5 - dayOfWeek + 7) % 7;
  if (daysForward === 0) {
    daysForward = 7; // Next week's Friday
  }
  nextFriday.setDate(current.getDate() + daysForward);
  const nextFridayDateStr = formatDate(nextFriday);

  return {
    isTodayFriday,
    todayDateStr,
    lastFridayDateStr,
    nextFridayDateStr,
    daysUntilNextFriday: daysForward,
  };
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}