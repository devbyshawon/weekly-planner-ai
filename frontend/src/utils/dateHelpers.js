// This app uses the Bangladeshi week convention: Saturday is day 0, Friday is day 6.

export const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5]; // JS day numbers, in Sat→Fri display order
export const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
export const DAY_LABELS_FULL = [
  "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
];

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the Saturday that starts the week containing `date`. */
export function getWeekStart(date) {
  const d = startOfDay(date);
  const jsDay = d.getDay(); // 0=Sun..6=Sat
  const customIndex = (jsDay - 6 + 7) % 7; // 0=Sat..6=Fri
  d.setDate(d.getDate() - customIndex);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** "2026-06-20" — used as a stable key for matching occurrences to grid columns. */
export function dateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDayHeader(date) {
  const d = new Date(date);
  return d.getDate();
}

export function formatWeekRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const opts = { month: "short", day: "numeric" };
  const startLabel = weekStart.toLocaleDateString("en-US", opts);
  const endLabel = sameMonth
    ? weekEnd.getDate()
    : weekEnd.toLocaleDateString("en-US", opts);
  return `${startLabel} – ${endLabel}${sameMonth ? "" : ""}, ${weekEnd.getFullYear()}`;
}

/** "04:45" -> 285 (minutes since midnight) */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/** Hour label for the ruler column, e.g. 0 -> "12 AM", 13 -> "1 PM" */
export function hourLabel(hour) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function isToday(date) {
  return dateKey(date) === dateKey(new Date());
}
