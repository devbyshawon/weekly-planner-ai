import { useMemo, useRef, useEffect, forwardRef } from "react";
import {
  DAY_ORDER,
  DAY_LABELS,
  addDays,
  dateKey,
  formatDayHeader,
  hourLabel,
  isToday,
  timeToMinutes,
} from "../utils/dateHelpers";
import EventBlock from "./EventBlock";
import { detectConflicts } from "../utils/conflictDetector";

const PX_PER_HOUR = 64;
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const DEFAULT_DURATION_MIN = 30;

const WeeklyGrid = forwardRef(function WeeklyGrid({ weekStart, occurrences, onEventClick }, ref) {
  const scrollRef = useRef(null);

  const days = useMemo(() => DAY_ORDER.map((_, i) => addDays(weekStart, i)), [weekStart]);

  const occurrencesByDay = useMemo(() => {
    const map = {};
    for (const day of days) map[dateKey(day)] = [];
    for (const occ of occurrences) {
      const key = dateKey(occ.date);
      if (map[key]) map[key].push(occ);
    }
    return map;
  }, [days, occurrences]);

  const conflictKeys = useMemo(() => detectConflicts(occurrences), [occurrences]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 4 * PX_PER_HOUR;
    }
  }, [weekStart]);

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
    <div ref={ref} className="bg-ink-soft border border-white/5 rounded-2xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[44px_repeat(7,1fr)] border-b border-white/10">
        <div />
        {days.map((day, i) => (
          <div
            key={i}
            className={`text-center py-2.5 border-l border-white/5 ${isToday(day) ? "bg-gold/10" : ""}`}
          >
            <p className="text-[11px] text-ink-faint uppercase tracking-wide">{DAY_LABELS[i]}</p>
            <p className={`font-display text-sm ${isToday(day) ? "text-gold" : "text-sand"}`}>
              {formatDayHeader(day)}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} data-export-scroll className="overflow-y-auto" style={{ maxHeight: "560px" }}>
        <div className="grid grid-cols-[44px_repeat(7,1fr)] relative" style={{ height: `${24 * PX_PER_HOUR}px` }}>
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 text-right pr-1.5 text-[10px] font-mono text-ink-faint -translate-y-1/2"
                style={{ top: `${h * PX_PER_HOUR}px` }}
              >
                {h !== 0 && hourLabel(h)}
              </div>
            ))}
          </div>
          {days.map((day, i) => (
            <div key={i} className="relative border-l border-white/5">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ top: `${h * PX_PER_HOUR}px` }}
                />
              ))}
              {occurrencesByDay[dateKey(day)]?.map((occ, idx) => {
                const conflictKey = `${occ.eventId}-${occ.date}`;
                return (
                  <EventBlock
                    key={`${occ.eventId}-${idx}`}
                    occurrence={occ}
                    onClick={onEventClick}
                    hasConflict={conflictKeys.has(conflictKey)}
                    {...blockStyle(occ)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default WeeklyGrid;
