import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePrompt } from "./parser.js";

test("1. daily prayer with 'every day'", () => {
  const d = parsePrompt("I pray fajr at 4:45 AM every day");
  assert.equal(d.startTime, "04:45");
  assert.equal(d.recurrence.type, "daily");
  assert.equal(d.category, "prayer");
  assert.equal(d.title, "Pray fajr");
});

test("2. 'everyday' as one word", () => {
  const d = parsePrompt("Take medicine at 9pm everyday");
  assert.equal(d.startTime, "21:00");
  assert.equal(d.recurrence.type, "daily");
});

test("3. 'daily' keyword without 'every'", () => {
  const d = parsePrompt("Drink water at 7am daily");
  assert.equal(d.startTime, "07:00");
  assert.equal(d.recurrence.type, "daily");
});

test("4. single weekday recurrence", () => {
  const d = parsePrompt("Gym at 6pm every Monday");
  assert.equal(d.startTime, "18:00");
  assert.equal(d.recurrence.type, "weekly");
  assert.deepEqual(d.recurrence.daysOfWeek, [1]);
  assert.equal(d.category, "gym");
});

test("5. multiple weekdays with 'and'", () => {
  const d = parsePrompt("Freelance client call at 9pm every Tuesday and Thursday");
  assert.equal(d.recurrence.type, "custom");
  assert.deepEqual(d.recurrence.daysOfWeek, [2, 4]);
  assert.equal(d.category, "freelance");
});

test("6. comma-separated day list", () => {
  const d = parsePrompt("Study GRE vocab at 8pm every Saturday, Sunday and Monday");
  assert.deepEqual(d.recurrence.daysOfWeek, [0, 1, 6]);
  assert.equal(d.category, "study");
});

test("7. abbreviated day names", () => {
  const d = parsePrompt("Lab work at 2pm every Tue and Thu");
  assert.deepEqual(d.recurrence.daysOfWeek, [2, 4]);
});

test("8. 'every weekday' shortcut", () => {
  const d = parsePrompt("Check emails at 9am every weekday");
  assert.deepEqual(d.recurrence.daysOfWeek, [1, 2, 3, 4, 5]);
  assert.equal(d.recurrence.type, "custom");
});

test("9. 'every weekend' shortcut", () => {
  const d = parsePrompt("Long run at 6am every weekend");
  assert.deepEqual(d.recurrence.daysOfWeek, [0, 6]);
  assert.equal(d.category, "gym");
});

test("10. one-off event with explicit date", () => {
  const d = parsePrompt("Submit thesis report on June 25 at 5pm");
  assert.equal(d.recurrence.type, "none");
  assert.equal(d.startTime, "17:00");
  assert.equal(d.dateAssumed, false);
  assert.equal(new Date(d.date).getMonth(), 5); // June = month index 5
  assert.equal(new Date(d.date).getDate(), 25);
});

test("11. mentioning a weekday WITHOUT 'every' stays one-off, not recurring", () => {
  const d = parsePrompt("Submit thesis report on Monday at 5pm");
  assert.equal(d.recurrence.type, "none");
  assert.equal(new Date(d.date).getDay(), 1);
});

test("12. no date/day mentioned at all → date assumed (today), flagged", () => {
  const d = parsePrompt("Gym at 6pm");
  assert.equal(d.recurrence.type, "none");
  assert.equal(d.dateAssumed, true);
});

test("13. time range (start + end)", () => {
  const d = parsePrompt("Study CascadeVLM paper from 8pm to 10pm every day");
  assert.equal(d.startTime, "20:00");
  assert.equal(d.endTime, "22:00");
  assert.equal(d.category, "study");
});

test("14. category: personal", () => {
  const d = parsePrompt("Dinner with wife at 8pm every Friday");
  assert.equal(d.category, "personal");
});

test("15. category: work", () => {
  const d = parsePrompt("Team meeting at 11am every Sunday");
  assert.equal(d.category, "work");
});

test("16. category: freelance via Upwork keyword", () => {
  const d = parsePrompt("Send Upwork proposals at 10pm every day");
  assert.equal(d.category, "freelance");
});

test("17. title cleanup strips leading 'I' and the time/recurrence phrases", () => {
  const d = parsePrompt("I will pray isha at 8:30 PM every day");
  assert.equal(d.title.toLowerCase().includes("8:30"), false);
  assert.equal(d.title.toLowerCase().includes("every"), false);
  assert.ok(d.title.length > 0);
});

test("18. no time at all → returns null (nothing to schedule)", () => {
  const d = parsePrompt("Finish the thesis someday");
  assert.equal(d, null);
});

test("19. category: prayer via 'salah' keyword", () => {
  const d = parsePrompt("Salah at 1pm every day");
  assert.equal(d.category, "prayer");
});

test("20. unrecognized category falls back to 'other'", () => {
  const d = parsePrompt("Water the plants at 7am every day");
  assert.equal(d.category, "other");
});
