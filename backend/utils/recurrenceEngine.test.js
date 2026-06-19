import { test } from "node:test";
import assert from "node:assert/strict";
import { expandEvent, expandEvents } from "./recurrenceEngine.js";

// A Saturday-to-Friday week, matching the app's weekly grid (Sat=6 ... Fri=5)
const WEEK_START = new Date("2026-06-20"); // a Saturday
const WEEK_END = new Date("2026-06-26"); // the following Friday

test("daily recurrence produces one occurrence per day in range", () => {
  const event = {
    _id: "e1",
    title: "Fajr prayer",
    category: "prayer",
    startTime: "04:45",
    priority: "high",
    source: "ai",
    recurrence: { type: "daily", startDate: null, endDate: null },
    exceptions: [],
    completedDates: [],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(occurrences.length, 7);
  assert.equal(occurrences[0].startTime, "04:45");
});

test("weekly recurrence only fires on the matching weekday", () => {
  const event = {
    _id: "e2",
    title: "Gym",
    category: "gym",
    startTime: "18:00",
    priority: "medium",
    source: "manual",
    recurrence: { type: "weekly", daysOfWeek: [1], startDate: null, endDate: null }, // Monday
    exceptions: [],
    completedDates: [],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(occurrences.length, 1);
  assert.equal(new Date(occurrences[0].date).getDay(), 1);
});

test("custom recurrence fires on every listed weekday", () => {
  const event = {
    _id: "e3",
    title: "Freelance proposals",
    category: "freelance",
    startTime: "21:00",
    priority: "low",
    source: "manual",
    recurrence: { type: "custom", daysOfWeek: [0, 3], startDate: null, endDate: null }, // Sun + Wed
    exceptions: [],
    completedDates: [],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(occurrences.length, 2);
});

test("one-off event ('none') only appears on its exact date", () => {
  const event = {
    _id: "e4",
    title: "Submit thesis report",
    category: "study",
    startTime: "17:00",
    priority: "high",
    source: "ai",
    date: new Date("2026-06-25"),
    recurrence: { type: "none" },
    exceptions: [],
    completedDates: [],
  };

  const inRange = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(inRange.length, 1);

  const outOfRange = expandEvent(event, new Date("2026-07-01"), new Date("2026-07-07"));
  assert.equal(outOfRange.length, 0);
});

test("exceptions skip a specific occurrence without breaking the rest", () => {
  const skippedDay = new Date("2026-06-23"); // a Tuesday in the test week
  const event = {
    _id: "e5",
    title: "Fajr prayer",
    category: "prayer",
    startTime: "04:45",
    priority: "high",
    source: "ai",
    recurrence: { type: "daily", startDate: null, endDate: null },
    exceptions: [skippedDay],
    completedDates: [],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(occurrences.length, 6);
  const hasSkippedDay = occurrences.some(
    (o) => new Date(o.date).toDateString() === skippedDay.toDateString()
  );
  assert.equal(hasSkippedDay, false);
});

test("recurrence respects startDate and endDate boundaries", () => {
  const event = {
    _id: "e6",
    title: "Ramadan-only night prayer",
    category: "prayer",
    startTime: "23:00",
    priority: "medium",
    source: "manual",
    recurrence: {
      type: "daily",
      startDate: new Date("2026-06-22"),
      endDate: new Date("2026-06-24"),
    },
    exceptions: [],
    completedDates: [],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  assert.equal(occurrences.length, 3); // only Jun 22, 23, 24 fall in the window
});

test("completed occurrences are flagged correctly, per-date", () => {
  const completedDay = new Date("2026-06-21");
  const event = {
    _id: "e7",
    title: "Fajr prayer",
    category: "prayer",
    startTime: "04:45",
    priority: "high",
    source: "ai",
    recurrence: { type: "daily", startDate: null, endDate: null },
    exceptions: [],
    completedDates: [completedDay],
  };

  const occurrences = expandEvent(event, WEEK_START, WEEK_END);
  const completedOccurrence = occurrences.find(
    (o) => new Date(o.date).toDateString() === completedDay.toDateString()
  );
  const otherOccurrence = occurrences.find(
    (o) => new Date(o.date).toDateString() !== completedDay.toDateString()
  );

  assert.equal(completedOccurrence.completed, true);
  assert.equal(otherOccurrence.completed, false);
});

test("expandEvents merges multiple events and sorts by date then time", () => {
  const events = [
    {
      _id: "a",
      title: "Gym",
      category: "gym",
      startTime: "18:00",
      priority: "medium",
      source: "manual",
      recurrence: { type: "daily" },
      exceptions: [],
      completedDates: [],
    },
    {
      _id: "b",
      title: "Fajr",
      category: "prayer",
      startTime: "04:45",
      priority: "high",
      source: "ai",
      recurrence: { type: "daily" },
      exceptions: [],
      completedDates: [],
    },
  ];

  const occurrences = expandEvents(events, WEEK_START, WEEK_START);
  assert.equal(occurrences.length, 2);
  // Same day, so Fajr (04:45) must come before Gym (18:00)
  assert.equal(occurrences[0].title, "Fajr");
  assert.equal(occurrences[1].title, "Gym");
});

test("an inverted range (end before start) returns nothing instead of throwing", () => {
  const event = {
    _id: "e8",
    title: "Fajr",
    category: "prayer",
    startTime: "04:45",
    recurrence: { type: "daily" },
    exceptions: [],
    completedDates: [],
  };
  const occurrences = expandEvent(event, WEEK_END, WEEK_START);
  assert.equal(occurrences.length, 0);
});
