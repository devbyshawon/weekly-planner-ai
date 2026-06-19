import Event from "../models/Event.js";
import { validateEventPayload } from "../utils/validateEvent.js";
import { expandEvents, MAX_RANGE_DAYS } from "../utils/recurrenceEngine.js";

// GET /api/events  — all events belonging to the logged-in user
// The frontend expands recurrence into actual occurrences client-side for the
// grid/agenda views; the backend just stores the underlying event definitions.
// GET /api/events/occurrences?start=2026-06-20&end=2026-06-26
// Expands every recurring/one-off event the user has into concrete
// occurrences within the given range — this is what the weekly grid and
// daily agenda views actually render.
export const getOccurrences = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ message: "Both start and end query params are required (ISO dates)." });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ message: "start and end must be valid dates." });
  }
  if (startDate > endDate) {
    return res.status(400).json({ message: "start must not be after end." });
  }
  const rangeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
  if (rangeDays > MAX_RANGE_DAYS) {
    return res.status(400).json({ message: `Range too large — max ${MAX_RANGE_DAYS} days.` });
  }

  try {
    const events = await Event.find({ user: req.user._id });
    const occurrences = expandEvents(events, startDate, endDate);
    res.json(occurrences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id }).sort({ startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/events — create one event. Used by both the manual form and the
// AI prompt flow (the prompt is parsed into this same shape before saving).
export const createEvent = async (req, res) => {
  const errors = validateEventPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const event = await Event.create({ ...req.body, user: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/events/:id — update an event (e.g. drag-and-drop reschedule, edits)
export const updateEvent = async (req, res) => {
  const errors = validateEventPayload(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/events/:id — delete an event entirely
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/events/:id/exception — skip one occurrence of a recurring event
// without breaking the rest of the recurrence (e.g. "no gym this Friday").
export const addException = async (req, res) => {
  try {
    const { date } = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $addToSet: { exceptions: new Date(date) } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/events/:id/complete — toggle an occurrence as completed (feeds analytics)
export const toggleComplete = async (req, res) => {
  try {
    const { date } = req.body;
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    const target = new Date(date).toDateString();
    const idx = event.completedDates.findIndex((d) => d.toDateString() === target);

    if (idx >= 0) {
      event.completedDates.splice(idx, 1);
    } else {
      event.completedDates.push(new Date(date));
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
