import * as chrono from "chrono-node";

/**
 * Natural-language event parser
 * ------------------------------
 * Turns a sentence like "I pray fajr at 4:45 AM every day" or
 * "Gym at 6pm every Monday and Wednesday" into a structured event draft
 * matching the Event schema. Three layers, run independently then merged:
 *
 *  1. chrono-node  → extracts time-of-day (and a specific date, if one
 *                    was actually mentioned)
 *  2. detectRecurrence → custom regex layer, since chrono is built for
 *                    absolute dates, not "every ___" recurrence phrases
 *  3. detectCategory → keyword matching against the categories the
 *                    Event schema supports
 *
 * Fully local, no API key, no cost — this *is* the "AI" in this app's
 * "works manually and via prompts" requirement.
 */

const DAY_NAME_PATTERNS = [
  { regex: /\bsun(day)?s?\b/i, day: 0 },
  { regex: /\bmon(day)?s?\b/i, day: 1 },
  { regex: /\btue(s|sday)?s?\b/i, day: 2 },
  { regex: /\bwed(nesday)?s?\b/i, day: 3 },
  { regex: /\bthu(r|rs|rsday)?s?\b/i, day: 4 },
  { regex: /\bfri(day)?s?\b/i, day: 5 },
  { regex: /\bsat(urday)?s?\b/i, day: 6 },
];

// Checked in this order — first category with at least one keyword hit wins.
// Order matters for words that could plausibly belong to more than one
// category (e.g. a sentence mentioning both "thesis" and "meeting").
const CATEGORY_KEYWORDS = [
  ["prayer", ["fajr", "dhuhr", "zuhr", "asr", "maghrib", "isha", "pray", "prayer",
    "salah", "salat", "namaz", "quran", "qur'an", "taraweeh", "tarawih", "tahajjud",
    "jumma", "jummah", "mosque"]],
  ["gym", ["gym", "workout", "work out", "exercise", "jog", "jogging", "run", "running",
    "fitness", "cardio", "weightlifting", "push ups", "pushups"]],
  ["freelance", ["freelance", "freelancing", "client", "upwork", "fiverr", "proposal", "gig"]],
  ["study", ["thesis", "study", "studying", "research", "paper", "read", "reading",
    "class", "lecture", "assignment", "exam", "gre", "ielts", "course", "lab",
    "cgpa", "revise", "revision", "vlm", "cascadevlm"]],
  ["personal", ["wife", "ushrat", "family", "friend", "dinner", "lunch", "breakfast",
    "shopping", "rest", "relax", "call mom", "call dad"]],
  ["work", ["meeting", "office", "interview", "deadline", "report"]],
];

/**
 * Scans `text` for an "every ___" recurrence phrase and figures out which
 * days it refers to. Returns null if no recurrence phrase is present at all
 * (i.e. this is a one-off event).
 */
function detectRecurrence(text) {
  // "daily" / "everyday" anywhere in the sentence, with no "every ___" needed
  const dailyMatch = text.match(/\beveryday\b|\bdaily\b/i);
  if (dailyMatch) {
    return { type: "daily", daysOfWeek: [], matched: dailyMatch[0] };
  }

  // Capture whatever follows "every" up to a natural stop word/punctuation/end
  const everyMatch = text.match(
    /\bevery\b\s+([a-zA-Z, &]+?)(?=\s+\b(at|from|starting|until|after|before|till)\b|\.|$)/i
  );
  if (!everyMatch) return null;

  const clause = everyMatch[1];
  const fullMatch = everyMatch[0];

  if (/\bday\b/i.test(clause)) {
    return { type: "daily", daysOfWeek: [], matched: fullMatch };
  }
  if (/\bweekday/i.test(clause)) {
    return { type: "custom", daysOfWeek: [1, 2, 3, 4, 5], matched: fullMatch };
  }
  if (/\bweekend/i.test(clause)) {
    return { type: "custom", daysOfWeek: [0, 6], matched: fullMatch };
  }

  const days = new Set();
  for (const { regex, day } of DAY_NAME_PATTERNS) {
    if (regex.test(clause)) days.add(day);
  }
  if (days.size === 0) return null; // "every" was used but no day/keyword recognized

  const daysOfWeek = [...days].sort((a, b) => a - b);
  return {
    type: daysOfWeek.length === 1 ? "weekly" : "custom",
    daysOfWeek,
    matched: fullMatch,
  };
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    const hit = keywords.some((kw) => new RegExp(`\\b${kw.replace(/'/g, "'?")}\\b`, "i").test(lower));
    if (hit) return category;
  }
  return "other";
}

function formatTime(component) {
  const hour = String(component.get("hour")).padStart(2, "0");
  const minute = String(component.get("minute") || 0).padStart(2, "0");
  return `${hour}:${minute}`;
}

function cleanTitle(originalText, removals) {
  let title = originalText;
  for (const r of removals) {
    if (r) title = title.replace(r, " ");
  }
  title = title.replace(/\s{2,}/g, " ").trim();
  title = title.replace(/^(i'll|i will|i'm going to|i am going to|i|to)\s+/i, "");
  title = title.replace(/[,.\s]+$/, "");
  if (!title) title = originalText.trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * parsePrompt(text) -> event draft object, or null if no time could be found
 * (a time is the one thing every event needs — without it there's nothing
 * to put on the grid).
 */
export function parsePrompt(text) {
  const chronoResults = chrono.parse(text, new Date(), { forwardDate: true });
  const chronoResult = chronoResults[0] || null;
  const recurrence = detectRecurrence(text);

  if (!chronoResult || !chronoResult.start.isCertain("hour")) {
    return null; // can't schedule anything without a clock time
  }

  const startTime = formatTime(chronoResult.start);
  const endTime =
    chronoResult.end && chronoResult.end.isCertain("hour") ? formatTime(chronoResult.end) : null;

  let date = null;
  let dateAssumed = false;

  if (!recurrence) {
    date = chronoResult.start.date();
    dateAssumed = !(chronoResult.start.isCertain("day") || chronoResult.start.isCertain("weekday"));
  }

  const category = detectCategory(text);
  const title = cleanTitle(text, [chronoResult.text, recurrence?.matched]);

  return {
    rawText: text,
    title,
    category,
    startTime,
    endTime,
    priority: "medium",
    recurrence: recurrence
      ? { type: recurrence.type, daysOfWeek: recurrence.daysOfWeek, startDate: null, endDate: null }
      : { type: "none" },
    date: recurrence ? null : date,
    dateAssumed: recurrence ? false : dateAssumed,
  };
}
