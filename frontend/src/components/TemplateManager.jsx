import { useState, useEffect } from "react";
import { BookmarkPlus, BookOpen, Trash2, X } from "lucide-react";

const STORAGE_KEY = "planner_templates";

function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/**
 * Converts an array of raw Event documents into a template — strips
 * occurrence-specific fields, keeping only the scheduling rule.
 */
function eventsToTemplate(events, name) {
  return {
    id: Date.now(),
    name,
    createdAt: new Date().toISOString(),
    events: events.map((e) => ({
      title: e.title,
      category: e.category,
      startTime: e.startTime,
      endTime: e.endTime || null,
      priority: e.priority,
      notes: e.notes || "",
      recurrence: e.recurrence,
      source: "manual",
    })),
  };
}

export default function TemplateManager({ currentEvents, onApplyTemplate }) {
  const [templates, setTemplates] = useState(loadTemplates);
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const handleSave = () => {
    if (!saveName.trim()) return;
    const template = eventsToTemplate(currentEvents, saveName.trim());
    setTemplates((t) => [...t, template]);
    setSaveName("");
    setSaving(false);
  };

  const handleApply = async (template) => {
    if (!window.confirm(`Apply template "${template.name}"? This will add ${template.events.length} events to your planner.`)) return;
    setApplying(template.id);
    try {
      await onApplyTemplate(template.events);
    } finally {
      setApplying(null);
      setIsOpen(false);
    }
  };

  const handleDelete = (id) => {
    setTemplates((t) => t.filter((tp) => tp.id !== id));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-ink-faint border border-white/10 px-2.5 py-1.5 rounded-lg hover:text-sand hover:border-white/30"
      >
        <BookOpen size={13} /> Templates
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setIsOpen(false)}>
          <div className="bg-ink-soft border border-white/10 rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-sand text-lg">Weekly Templates</h2>
              <button onClick={() => setIsOpen(false)} className="text-ink-faint hover:text-sand"><X size={18} /></button>
            </div>

            {/* Save current week as template */}
            <div className="mb-5">
              {saving ? (
                <div className="flex gap-2">
                  <input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Template name, e.g. 'Normal week'"
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg bg-ink border border-white/10 text-sand text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setSaving(false); }}
                  />
                  <button onClick={handleSave} disabled={!saveName.trim()} className="bg-gold text-ink text-xs font-medium px-3 rounded-lg disabled:opacity-50">Save</button>
                  <button onClick={() => setSaving(false)} className="text-ink-faint hover:text-sand"><X size={16} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setSaving(true)}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-2.5 text-ink-faint text-sm hover:border-gold/40 hover:text-sand"
                >
                  <BookmarkPlus size={15} /> Save current week as template
                </button>
              )}
            </div>

            {/* Saved templates list */}
            {templates.length === 0 ? (
              <p className="text-ink-faint text-sm text-center py-4">No templates yet. Save a week to reuse it.</p>
            ) : (
              <div className="space-y-2">
                {templates.map((tp) => (
                  <div key={tp.id} className="flex items-center justify-between bg-ink rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sand text-sm font-medium">{tp.name}</p>
                      <p className="text-ink-faint text-xs">{tp.events.length} events</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApply(tp)}
                        disabled={applying === tp.id}
                        className="text-xs bg-gold/20 text-gold border border-gold/30 px-2.5 py-1 rounded-lg hover:bg-gold/30 disabled:opacity-50"
                      >
                        {applying === tp.id ? "Applying..." : "Apply"}
                      </button>
                      <button onClick={() => handleDelete(tp.id)} className="text-ink-faint hover:text-clay">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
