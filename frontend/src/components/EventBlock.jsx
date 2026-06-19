import { categoryColor } from "../utils/categories";
import { AlertTriangle } from "lucide-react";

export default function EventBlock({ occurrence, top, height, onClick, hasConflict }) {
  const color = categoryColor(occurrence.category);

  return (
    <button
      onClick={() => onClick(occurrence)}
      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left overflow-hidden transition hover:brightness-110 hover:z-10"
      style={{
        top,
        height,
        background: `color-mix(in srgb, ${color} 22%, var(--color-ink-soft))`,
        borderLeft: `2.5px solid ${hasConflict ? "var(--color-clay)" : color}`,
        opacity: occurrence.completed ? 0.55 : 1,
        outline: hasConflict ? "1px solid color-mix(in srgb, var(--color-clay) 40%, transparent)" : "none",
      }}
    >
      <div className="flex items-center gap-0.5">
        {hasConflict && <AlertTriangle size={9} className="text-clay shrink-0" />}
        <p
          className="text-[11px] font-medium text-sand leading-tight truncate"
          style={{ textDecoration: occurrence.completed ? "line-through" : "none" }}
        >
          {occurrence.title}
        </p>
      </div>
      {height > 30 && (
        <p className="text-[10px] font-mono text-ink-faint leading-tight">{occurrence.startTime}</p>
      )}
    </button>
  );
}
