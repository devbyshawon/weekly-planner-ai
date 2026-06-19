import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEventPayload } from "./validateEvent.js";

test("rejects an event missing required fields", () => {
  const errors = validateEventPayload({});
  assert.ok(errors.includes("Title is required."));
  assert.ok(errors.some((e) => e.includes("startTime")));
});

test("accepts a well-formed daily recurring event", () => {
  const errors = validateEventPayload({
    title: "Fajr prayer",
    startTime: "04:45",
    category: "prayer",
    priority: "high",
    recurrence: { type: "daily" },
  });
  assert.deepEqual(errors, []);
});

test("rejects malformed time strings", () => {
  const errors = validateEventPayload({
    title: "Gym",
    startTime: "6pm",
    recurrence: { type: "none" },
    date: new Date(),
  });
  assert.ok(errors.some((e) => e.includes("startTime")));
});

test("weekly/custom recurrence requires at least one day", () => {
  const errors = validateEventPayload({
    title: "Gym",
    startTime: "18:00",
    recurrence: { type: "weekly", daysOfWeek: [] },
  });
  assert.ok(errors.some((e) => e.includes("daysOfWeek")));
});

test("one-off event requires a date", () => {
  const errors = validateEventPayload({
    title: "Submit thesis",
    startTime: "17:00",
    recurrence: { type: "none" },
  });
  assert.ok(errors.some((e) => e.includes("date is required")));
});

test("rejects an invalid category", () => {
  const errors = validateEventPayload({
    title: "Mystery task",
    startTime: "10:00",
    category: "hobby",
    recurrence: { type: "none" },
    date: new Date(),
  });
  assert.ok(errors.some((e) => e.includes("category")));
});

test("partial mode (for PATCH/PUT) only validates fields actually present", () => {
  const errors = validateEventPayload({ startTime: "19:30" }, { partial: true });
  assert.deepEqual(errors, []);
});

test("rejects recurrence.endDate earlier than recurrence.startDate", () => {
  const errors = validateEventPayload({
    title: "Ramadan night prayer",
    startTime: "23:00",
    recurrence: {
      type: "daily",
      startDate: "2026-06-24",
      endDate: "2026-06-20",
    },
  });
  assert.ok(errors.some((e) => e.includes("endDate cannot be before")));
});
