import { useState } from "react";
import { Moon, Loader } from "lucide-react";
import { fetchPrayerTimes } from "../utils/prayerTimes";

// Dhaka coordinates — used as default since that's where the user is.
// Future enhancement: let user set custom location in settings.
const DHAKA_LAT = 23.8103;
const DHAKA_LNG = 90.4125;

export default function PrayerTimePanel({ onAddPrayers }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const prayers = await fetchPrayerTimes(DHAKA_LAT, DHAKA_LNG);
      await onAddPrayers(prayers);
      setStatus(`Added ${prayers.length} daily prayers ✓`);
    } catch {
      setError("Couldn't fetch prayer times. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gold/10 border border-gold/20 rounded-xl px-4 py-2.5 mb-4">
      <Moon size={16} className="text-gold shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sand text-sm font-medium leading-tight">Auto-add prayer times</p>
        <p className="text-ink-faint text-xs">Fajr · Dhuhr · Asr · Maghrib · Isha (Dhaka, Karachi method)</p>
        {status && <p className="text-sage text-xs mt-0.5">{status}</p>}
        {error && <p className="text-clay text-xs mt-0.5">{error}</p>}
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="shrink-0 flex items-center gap-1.5 bg-gold text-ink text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader size={13} className="animate-spin" /> : null}
        {loading ? "Fetching..." : "Add all"}
      </button>
    </div>
  );
}
