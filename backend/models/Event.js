import mongoose from "mongoose";

const recurrenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["none", "daily", "weekly", "custom"],
      default: "none",
    },
    // 0=Sunday ... 6=Saturday (JS Date.getDay() convention).
    // Used when type is "weekly" (single day) or "custom" (multiple days).
    daysOfWeek: { type: [Number], default: [] },
    startDate: { type: Date, default: null }, // when the recurrence begins
    endDate: { type: Date, default: null }, // null = repeats indefinitely
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    category: {
      type: String,
      enum: ["prayer", "study", "gym", "freelance", "personal", "work", "other"],
      default: "other",
    },
    color: { type: String, default: null }, // optional hex override of category default

    // Time of day this event occurs, stored as 24h "HH:mm" so it's timezone-stable
    // and trivial to place on the weekly grid's time rows.
    startTime: { type: String, required: true }, // e.g. "04:45"
    endTime: { type: String, default: null }, // e.g. "05:15"
    isAllDay: { type: Boolean, default: false },

    // For one-off events (not recurring): the specific calendar date.
    date: { type: Date, default: null },

    recurrence: { type: recurrenceSchema, default: () => ({}) },

    // Specific occurrence dates to skip for a recurring event
    // (e.g. "no gym this Friday" without breaking the whole recurrence rule).
    exceptions: { type: [Date], default: [] },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    reminder: {
      enabled: { type: Boolean, default: true },
      minutesBefore: { type: Number, default: 0 },
    },

    // Was this created by typing a natural-language prompt, or via the manual form?
    source: { type: String, enum: ["ai", "manual"], default: "manual" },
    originalPrompt: { type: String, default: null },

    // Occurrence dates the user has marked done — feeds the analytics dashboard later.
    completedDates: { type: [Date], default: [] },
  },
  { timestamps: true }
);

eventSchema.index({ user: 1, "recurrence.daysOfWeek": 1 });
eventSchema.index({ user: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
