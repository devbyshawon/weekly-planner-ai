import { useMemo, useRef, useEffect } from "react";
import { dateKey, hourLabel, timeToMinutes } from "../utils/dateHelpers";
import EventBlock from "./EventBlock";

const PX_PER_HOUR = 72;
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const DEFAULT_DURATION_MIN = 30;

export default function DailyAgenda({ selectedDay, occurrences, onEventClick, onPrevDay, onNextDay }) {
  const scrollRef = useRef(null);
  const key = dateKey(selectedDay);

  const dayOccurrences = useMemo(
    () => occurrences.filter((o) => dateKey(o.date) === key).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [occurrences, key]
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 4 * PX_PER_HOUR;
  }, [key]);

  const blockStyle = (occ) => {
    const startMin = timeToMinutes(occ.startTime);
    const endMin = occ.endTime ? timeToMinutes(occ.endTime) : startMin + DEFAULT_DURATION_MIN;
    const durationMin = Math.max(endMin - startMin, 18);
    return {
      top: `${(startMin / 60) * PX_PER_HOUR}px`,
      height: `${(durationMin / 60) * PX_PER_HOUR}px`,
    };
  };

  return (
    <div className="bg-ink-soft border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onPrevDay} className="text-ink-faint hover:text-sand text-sm px-2">‹</button>
        <p className="font-display text-sand text-sm">
          {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <button onClick={onNextDay} className="text-ink-faint hover:text-sand text-sm px-2">›</button>
      </div>

      {dayOccurrences.length === 0 && (
        <p className="text-ink-faint text-sm text-center py-6">Nothing scheduled for this day.</p>
      )}

      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "560px" }}>
        <div className="grid grid-cols-[52px_1fr] relative" style={{ height: `${24 * PX_PER_HOUR}px` }}>
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 text-right pr-2 text-[10px] font-mono text-ink-faint -translate-y-1/2"
                style={{ top: `${h * PX_PER_HOUR}px` }}
              >
                {h !== 0 && hourLabel(h)}
              </div>
            ))}
          </div>
          <div className="relative border-l border-white/5">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{ top: `${h * PX_PER_HOUR}px` }}
              />
            ))}
            {dayOccurrences.map((occ, idx) => (
              <EventBlock key={`${occ.eventId}-${idx}`} occurrence={occ} onClick={onEventClick} {...blockStyle(occ)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
