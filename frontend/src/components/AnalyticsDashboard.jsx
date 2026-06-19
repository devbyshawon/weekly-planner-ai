import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { timeToMinutes } from "../utils/dateHelpers";
import { CATEGORIES } from "../utils/categories";

function getHours(occ) {
  const start = timeToMinutes(occ.startTime);
  const end = occ.endTime ? timeToMinutes(occ.endTime) : start + 30;
  return Math.max(end - start, 0) / 60;
}

const CATEGORY_HEX = {
  prayer: "#c99a3c",
  study: "#3d5a6c",
  gym: "#6b8f71",
  freelance: "#b5533c",
  personal: "#8a7ca8",
  work: "#4a7a8c",
  other: "#8a8a8a",
};

export default function AnalyticsDashboard({ occurrences }) {
  const stats = useMemo(() => {
    const hoursByCategory = {};
    let totalCompleted = 0;

    for (const occ of occurrences) {
      const cat = occ.category || "other";
      hoursByCategory[cat] = (hoursByCategory[cat] || 0) + getHours(occ);
      if (occ.completed) totalCompleted++;
    }

    const chartData = CATEGORIES
      .map((c) => ({ name: c.label, hours: parseFloat((hoursByCategory[c.value] || 0).toFixed(1)), key: c.value }))
      .filter((d) => d.hours > 0)
      .sort((a, b) => b.hours - a.hours);

    const completionRate = occurrences.length
      ? Math.round((totalCompleted / occurrences.length) * 100)
      : 0;

    return { chartData, completionRate, total: occurrences.length, completed: totalCompleted };
  }, [occurrences]);

  if (!occurrences.length) {
    return (
      <div className="bg-ink-soft border border-white/5 rounded-2xl p-6 text-center text-ink-faint text-sm">
        No events this week yet — add some to see analytics.
      </div>
    );
  }

  return (
    <div className="bg-ink-soft border border-white/5 rounded-2xl p-5">
      <h2 className="font-display text-sand text-base mb-4">This week</h2>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-ink rounded-xl p-3 text-center">
          <p className="font-display text-2xl text-gold">{stats.total}</p>
          <p className="text-ink-faint text-xs mt-0.5">total events</p>
        </div>
        <div className="bg-ink rounded-xl p-3 text-center">
          <p className="font-display text-2xl text-sage">{stats.completed}</p>
          <p className="text-ink-faint text-xs mt-0.5">completed</p>
        </div>
        <div className="bg-ink rounded-xl p-3 text-center">
          <p className="font-display text-2xl text-sand">{stats.completionRate}%</p>
          <p className="text-ink-faint text-xs mt-0.5">completion rate</p>
        </div>
      </div>

      {stats.chartData.length > 0 && (
        <>
          <p className="text-ink-faint text-xs mb-2">Hours by category</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5c6f69" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#5c6f69" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a2e28", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#f4efe2" }}
                itemStyle={{ color: "#f4efe2" }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {stats.chartData.map((entry) => (
                  <Cell key={entry.key} fill={CATEGORY_HEX[entry.key] || "#8a8a8a"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
