import { useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import * as eventsApi from "../api/events";

export default function PromptBar({ onParsed, onManualAdd }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const draft = await eventsApi.parsePrompt(text.trim());
      onParsed(draft);
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't understand that — try rephrasing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Try: Gym at 6pm every Monday and Wednesday"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-ink-soft border border-white/10 text-sand text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-ink text-sm font-medium px-4 rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onManualAdd}
          title="Add manually"
          className="bg-ink-soft border border-white/10 text-sand px-3 rounded-xl hover:border-white/30"
        >
          <Plus size={18} />
        </button>
      </form>
      {error && <p className="text-clay text-xs mt-1.5">{error}</p>}
    </div>
  );
}
