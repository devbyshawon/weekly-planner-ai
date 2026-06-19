import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatWeekRangeLabel } from "../utils/dateHelpers";

export default function WeekNavigator({ weekStart, view, onView, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-white/5 text-ink-faint hover:text-sand">
          <ChevronLeft size={18} />
        </button>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-white/5 text-ink-faint hover:text-sand">
          <ChevronRight size={18} />
        </button>
        <button
          onClick={onToday}
          className="text-xs text-ink-faint border border-white/10 rounded-lg px-2.5 py-1 hover:text-sand hover:border-white/30"
        >
          Today
        </button>
        <p className="font-display text-sand text-base ml-1">{formatWeekRangeLabel(weekStart)}</p>
      </div>

      <div className="flex bg-ink rounded-lg p-0.5 border border-white/10">
        {["week", "day"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`text-xs px-3 py-1.5 rounded-md capitalize transition ${
              view === v ? "bg-gold text-ink" : "text-ink-faint hover:text-sand"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
