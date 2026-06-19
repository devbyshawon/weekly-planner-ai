/**
 * https://aladhan.com/prayer-times-api — completely free, no API key.
 * Prayer order: Fajr, Dhuhr, Asr, Maghrib, Isha
 */

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const METHOD = 1;

export async function fetchPrayerTimes(lat, lng, date = new Date()) {
  const d = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${d}?latitude=${lat}&longitude=${lng}&method=${METHOD}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch prayer times");
  const json = await res.json();
  const timings = json.data.timings;

  return PRAYER_NAMES.map((name) => ({
    title: `${name} prayer`,
    startTime: to24h(timings[name]),
    category: "prayer",
    priority: "high",
    recurrence: { type: "daily", daysOfWeek: [], startDate: null, endDate: null },
    date: null,
    source: "ai",
    notes: `Auto-fetched from Aladhan API (Karachi method)`,
  }));
}

function to24h(timeStr) {
  // Aladhan returns "04:32 (BST)" or "04:32" — normalise to "HH:mm"
  const clean = timeStr.replace(/\s*\(.*\)/, "").trim();
  const [h, m] = clean.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export { PRAYER_NAMES };
