import { useState } from "react";
import { X, Trash2, Check, SkipForward } from "lucide-react";
import { CATEGORIES, PRIORITIES } from "../utils/categories";
import { DAY_LABELS, DAY_ORDER } from "../utils/dateHelpers";

const emptyForm = {
  title: "",
  category: "other",
  startTime: "",
  endTime: "",
  priority: "medium",
  notes: "",
  recurrenceType: "none",
  daysOfWeek: [],
  date: "",
};

function toFormState(initial) {
  if (!initial) return { ...emptyForm };
  return {
    title: initial.title || "",
    category: initial.category || "other",
    startTime: initial.startTime || "",
    endTime: initial.endTime || "",
    priority: initial.priority || "medium",
    notes: initial.notes || "",
    recurrenceType: initial.recurrence?.type || "none",
    daysOfWeek: initial.recurrence?.daysOfWeek || [],
    date: initial.date ? new Date(initial.date).toISOString().slice(0, 10) : "",
  };
}

export default function EventModal({
  onClose,
  initial, // event being edited, or an AI draft, or null for blank manual entry
  occurrenceDate, // the specific date clicked on the grid, if any
  onSave,
  onDelete,
  onMarkComplete,
  onSkip,
}) {
  const [form, setForm] = useState(() => toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(initial?._id);
  const isRecurring = form.recurrenceType !== "none";

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (isRecurring && form.daysOfWeek.length === 0) {
      setFormError("Pick at least one day for a recurring event.");
      return;
    }
    if (form.recurrenceType === "none" && !form.date) {
      setFormError("Pick a date for a one-off event.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      startTime: form.startTime,
      endTime: form.endTime || null,
      priority: form.priority,
      notes: form.notes,
      recurrence:
        form.recurrenceType === "none"
          ? { type: "none" }
          : { type: form.recurrenceType, daysOfWeek: form.daysOfWeek, startDate: null, endDate: null },
      date: form.recurrenceType === "none" ? form.date : null,
    };

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || "Couldn't save this event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-ink-soft border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-display text-xl text-sand">
            {isEditing ? "Edit event" : "New event"}
          </h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-sand">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-3 space-y-4">
          {initial?.rawText && (
            <div className="bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 text-xs text-sand/90">
              Parsed from: <span className="italic">"{initial.rawText}"</span> — review before saving.
              {initial.dateAssumed && (
                <p className="text-gold mt-1">No date was mentioned — defaulted to today. Adjust if needed.</p>
              )}
            </div>
          )}

          {formError && <p className="text-clay text-sm">{formError}</p>}

          <div>
            <label className="block text-sand text-sm mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sand text-sm mb-1">Start time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sand text-sm mb-1">End time (optional)</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sand text-sm mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition ${
                    form.category === c.value
                      ? "border-gold text-sand"
                      : "border-white/10 text-ink-faint hover:border-white/30"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sand text-sm mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sand text-sm mb-1">Repeats</label>
            <select
              value={form.recurrenceType}
              onChange={(e) => setForm((f) => ({ ...f, recurrenceType: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="none">Doesn't repeat (one-off)</option>
              <option value="daily">Every day</option>
              <option value="weekly">Specific day(s) of the week</option>
            </select>
          </div>

          {form.recurrenceType === "none" ? (
            <div>
              <label className="block text-sand text-sm mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          ) : form.recurrenceType === "weekly" ? (
            <div>
              <label className="block text-sand text-sm mb-1">On these days</label>
              <div className="flex gap-1.5">
                {DAY_ORDER.map((jsDay, i) => (
                  <button
                    type="button"
                    key={jsDay}
                    onClick={() => toggleDay(jsDay)}
                    className={`w-9 h-9 rounded-lg text-xs font-medium transition ${
                      form.daysOfWeek.includes(jsDay)
                        ? "bg-gold text-ink"
                        : "bg-ink text-ink-faint border border-white/10"
                    }`}
                  >
                    {DAY_LABELS[i][0]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-sand text-sm mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-ink border border-white/10 text-sand text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none"
            />
          </div>

          {isEditing && occurrenceDate && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onMarkComplete(initial._id, occurrenceDate)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-sage/15 text-sage border border-sage/30 hover:bg-sage/25"
              >
                <Check size={14} /> Mark done
              </button>
              {isRecurring && (
                <button
                  type="button"
                  onClick={() => onSkip(initial._id, occurrenceDate)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-white/5 text-ink-faint border border-white/10 hover:bg-white/10"
                >
                  <SkipForward size={14} /> Skip this date
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {isEditing ? (
              <button
                type="button"
                onClick={() => onDelete(initial._id)}
                className="flex items-center gap-1.5 text-clay text-sm hover:opacity-80"
              >
                <Trash2 size={15} /> Delete
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={saving}
              className="bg-gold text-ink font-medium text-sm px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
