const dateOnly = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const isSameDate = (a, b) => dateOnly(a).getTime() === dateOnly(b).getTime();

/**
 * Expand a single event into its occurrences within [rangeStart, rangeEnd] (inclusive).
 */
export function expandEvent(event, rangeStart, rangeEnd) {
  const occurrences = [];
  const start = dateOnly(rangeStart);
  const end = dateOnly(rangeEnd);

  if (start > end) return occurrences;

  const isException = (d) => (event.exceptions || []).some((ex) => isSameDate(ex, d));
  const isCompleted = (d) => (event.completedDates || []).some((c) => isSameDate(c, d));

  const pushOccurrence = (date) => {
    occurrences.push({
      eventId: event._id,
      title: event.title,
      notes: event.notes || "",
      category: event.category,
      color: event.color || null,
      startTime: event.startTime,
      endTime: event.endTime || null,
      isAllDay: !!event.isAllDay,
      priority: event.priority,
      source: event.source,
      date: dateOnly(date).toISOString(),
      completed: isCompleted(date),
    });
  };

  const recurrenceType = event.recurrence?.type || "none";

  // One-off event: a single specific calendar date, no repetition.
  if (recurrenceType === "none") {
    if (event.date && dateOnly(event.date) >= start && dateOnly(event.date) <= end) {
      if (!isException(event.date)) pushOccurrence(event.date);
    }
    return occurrences;
  }

  // Recurring event: walk every day in the requested range and test membership.
  // Bounded by the caller's range size (not by how long the recurrence has
  // existed), so this stays cheap even for "repeats forever" events.
  const recStart = event.recurrence?.startDate ? dateOnly(event.recurrence.startDate) : null;
  const recEnd = event.recurrence?.endDate ? dateOnly(event.recurrence.endDate) : null;

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const day = new Date(cursor);

    if (recStart && day < recStart) continue;
    if (recEnd && day > recEnd) continue;
    if (isException(day)) continue;

    if (recurrenceType === "daily") {
      pushOccurrence(day);
    } else if (recurrenceType === "weekly" || recurrenceType === "custom") {
      if ((event.recurrence.daysOfWeek || []).includes(day.getDay())) {
        pushOccurrence(day);
      }
    }
  }

  return occurrences;
}

export function expandEvents(events, rangeStart, rangeEnd) {
  return events
    .flatMap((event) => expandEvent(event, rangeStart, rangeEnd))
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    });
}

export const MAX_RANGE_DAYS = 90;
