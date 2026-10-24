export interface PrayerTimings {
  fajr_azan?: string;
  fajr_jamaat?: string;
  zuhr_azan?: string;
  zuhr_jamaat?: string;
  asr_azan?: string;
  asr_jamaat?: string;
  maghrib_azan?: string;
  maghrib_jamaat?: string;
  isha_azan?: string;
  isha_jamaat?: string;
  jumuah_khutbah_1?: string;
}

export interface PrayerStatusResult {
  currentPrayer: string;
  nextPrayer: string;
  nextTimeFormatted: string;
  timeRemainingText: string;
  isTomorrow: boolean;
  isJumuah: boolean;
}

// Convert "HH:mm" or "HH:mm:ss" (or 12-hour string) to minutes from midnight
export function timeStringToMinutes(timeStr?: string): number {
  if (!timeStr) return -1;

  // Handle "05:00 PM" format if present
  const ampmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Handle "HH:mm" or "HH:mm:ss" (24-hour)
  const parts = timeStr.split(':').map((p) => parseInt(p, 10));
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }

  return -1;
}

// Format minutes from midnight to readable 12-hour format e.g. "5:00 PM"
export function minutesTo12Hour(minutes: number): string {
  if (minutes < 0) return '--:--';
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function calculatePrayerStatus(
  timings?: PrayerTimings | null,
  nowDate: Date = new Date()
): PrayerStatusResult {
  // Safe default fallback times if DB timings are missing
  const effectiveTimings = {
    fajr: timeStringToMinutes(timings?.fajr_jamaat) !== -1 ? timeStringToMinutes(timings?.fajr_jamaat) : 5 * 60 + 15, // 05:15 AM
    zuhr: timeStringToMinutes(timings?.zuhr_jamaat) !== -1 ? timeStringToMinutes(timings?.zuhr_jamaat) : 13 * 60, // 01:00 PM
    asr: timeStringToMinutes(timings?.asr_jamaat) !== -1 ? timeStringToMinutes(timings?.asr_jamaat) : 17 * 60, // 05:00 PM
    maghrib: timeStringToMinutes(timings?.maghrib_jamaat) !== -1 ? timeStringToMinutes(timings?.maghrib_jamaat) : 18 * 60 + 25, // 06:25 PM
    isha: timeStringToMinutes(timings?.isha_jamaat) !== -1 ? timeStringToMinutes(timings?.isha_jamaat) : 20 * 60 + 15, // 08:15 PM
  };

  const isFriday = nowDate.getDay() === 5;
  const zuhrName = isFriday ? "Jumu'ah" : 'Zuhr';

  // Current client local time in minutes from midnight
  const currentMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  let currentPrayer = 'Isha';
  let nextPrayer = 'Fajr';
  let nextTimeMinutes = effectiveTimings.fajr;
  let isTomorrow = false;
  let diffMinutes = 0;

  if (currentMinutes < effectiveTimings.fajr) {
    // Before Fajr (Night / Tahajjud window)
    currentPrayer = 'Qiyam / Night';
    nextPrayer = 'Fajr';
    nextTimeMinutes = effectiveTimings.fajr;
    diffMinutes = effectiveTimings.fajr - currentMinutes;
  } else if (currentMinutes < effectiveTimings.zuhr) {
    // Between Fajr and Zuhr
    currentPrayer = 'Fajr';
    nextPrayer = zuhrName;
    nextTimeMinutes = effectiveTimings.zuhr;
    diffMinutes = effectiveTimings.zuhr - currentMinutes;
  } else if (currentMinutes < effectiveTimings.asr) {
    // Between Zuhr and Asr
    currentPrayer = zuhrName;
    nextPrayer = 'Asr';
    nextTimeMinutes = effectiveTimings.asr;
    diffMinutes = effectiveTimings.asr - currentMinutes;
  } else if (currentMinutes < effectiveTimings.maghrib) {
    // Between Asr and Maghrib
    currentPrayer = 'Asr';
    nextPrayer = 'Maghrib';
    nextTimeMinutes = effectiveTimings.maghrib;
    diffMinutes = effectiveTimings.maghrib - currentMinutes;
  } else if (currentMinutes < effectiveTimings.isha) {
    // Between Maghrib and Isha
    currentPrayer = 'Maghrib';
    nextPrayer = 'Isha';
    nextTimeMinutes = effectiveTimings.isha;
    diffMinutes = effectiveTimings.isha - currentMinutes;
  } else {
    // After Isha (Rolling over to next day's Fajr)
    currentPrayer = 'Isha';
    nextPrayer = 'Fajr';
    nextTimeMinutes = effectiveTimings.fajr;
    isTomorrow = true;
    diffMinutes = 24 * 60 - currentMinutes + effectiveTimings.fajr;
  }

  // Format countdown text e.g. "in 35 mins" or "in 2 hrs 10 mins"
  const hoursLeft = Math.floor(diffMinutes / 60);
  const minsLeft = diffMinutes % 60;
  let timeRemainingText = '';
  if (hoursLeft > 0) {
    timeRemainingText = `in ${hoursLeft}h ${minsLeft}m`;
  } else if (minsLeft > 0) {
    timeRemainingText = `in ${minsLeft} min${minsLeft === 1 ? '' : 's'}`;
  } else {
    timeRemainingText = 'Starting now';
  }

  return {
    currentPrayer,
    nextPrayer,
    nextTimeFormatted: minutesTo12Hour(nextTimeMinutes),
    timeRemainingText,
    isTomorrow,
    isJumuah: isFriday && nextPrayer === "Jumu'ah",
  };
}