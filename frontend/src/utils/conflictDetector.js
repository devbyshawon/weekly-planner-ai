import { timeToMinutes, dateKey } from "./dateHelpers";

export function detectConflicts(occurrences) {
  const conflictKeys = new Set();
  const DEFAULT_DURATION = 30;

  // Group by date
  const byDay = {};
  for (const occ of occurrences) {
    const key = dateKey(occ.date);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(occ);
  }

  for (const dayOccs of Object.values(byDay)) {
    for (let i = 0; i < dayOccs.length; i++) {
      for (let j = i + 1; j < dayOccs.length; j++) {
        const a = dayOccs[i];
        const b = dayOccs[j];

        const aStart = timeToMinutes(a.startTime);
        const aEnd = a.endTime ? timeToMinutes(a.endTime) : aStart + DEFAULT_DURATION;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = b.endTime ? timeToMinutes(b.endTime) : bStart + DEFAULT_DURATION;

        const overlaps = aStart < bEnd && bStart < aEnd;
        if (overlaps) {
          conflictKeys.add(`${a.eventId}-${a.date}`);
          conflictKeys.add(`${b.eventId}-${b.date}`);
        }
      }
    }
  }

  return conflictKeys;
}
