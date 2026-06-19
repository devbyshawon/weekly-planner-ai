const VALID_CATEGORIES = ["prayer", "study", "gym", "freelance", "personal", "work", "other"];
const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_RECURRENCE_TYPES = ["none", "daily", "weekly", "custom"];
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // strict 24h "HH:mm"

export function validateEventPayload(body, { partial = false } = {}) {
  const errors = [];

  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const require = (key) => !partial || has(key);

  if (require("title") && (!body.title || !body.title.trim())) {
    errors.push("Title is required.");
  }

  if (require("startTime")) {
    if (!body.startTime || !TIME_REGEX.test(body.startTime)) {
      errors.push("startTime must be in 24h HH:mm format, e.g. '04:45'.");
    }
  }

  if (has("endTime") && body.endTime && !TIME_REGEX.test(body.endTime)) {
    errors.push("endTime must be in 24h HH:mm format, e.g. '05:15'.");
  }

  if (has("category") && body.category && !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  if (has("priority") && body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}.`);
  }

  if (has("recurrence") && body.recurrence) {
    const { type, daysOfWeek, startDate, endDate } = body.recurrence;

    if (type && !VALID_RECURRENCE_TYPES.includes(type)) {
      errors.push(`recurrence.type must be one of: ${VALID_RECURRENCE_TYPES.join(", ")}.`);
    }

    if ((type === "weekly" || type === "custom") && (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
      errors.push("recurrence.daysOfWeek must list at least one day (0=Sun..6=Sat) for weekly/custom recurrence.");
    }

    if (Array.isArray(daysOfWeek) && daysOfWeek.some((d) => d < 0 || d > 6)) {
      errors.push("recurrence.daysOfWeek values must be between 0 and 6.");
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push("recurrence.endDate cannot be before recurrence.startDate.");
    }
  }

  // A one-off event (recurrence type "none" or absent) needs a specific date.
  const recurrenceType = body.recurrence?.type || (has("recurrence") ? "none" : undefined);
  if (require("date") && recurrenceType === "none" && !body.date && !partial) {
    errors.push("date is required for a one-off (non-recurring) event.");
  }

  return errors;
}
