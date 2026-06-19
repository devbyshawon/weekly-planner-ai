import { useState } from "react";
import { Image, FileText, Sun, Moon, Bell, BellOff } from "lucide-react";
import { exportToPng, exportToPdf } from "../utils/exportUtils";
import { useTheme } from "../context/ThemeContext";
import { requestNotificationPermission } from "../utils/notifications";

export default function Toolbar({ gridRef }) {
  const { theme, toggle } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === "png") await exportToPng(gridRef);
      else await exportToPdf(gridRef);
    } catch {
      alert("Export failed — try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleNotif = async () => {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleExport("png")}
        disabled={exporting}
        className="flex items-center gap-1.5 text-xs text-ink-faint border border-white/10 px-2.5 py-1.5 rounded-lg hover:text-sand hover:border-white/30 disabled:opacity-50"
      >
        <Image size={13} /> PNG
      </button>
      <button
        onClick={() => handleExport("pdf")}
        disabled={exporting}
        className="flex items-center gap-1.5 text-xs text-ink-faint border border-white/10 px-2.5 py-1.5 rounded-lg hover:text-sand hover:border-white/30 disabled:opacity-50"
      >
        <FileText size={13} /> PDF
      </button>

      {notifStatus !== "unsupported" && (
        <button
          onClick={handleNotif}
          title={notifStatus === "granted" ? "Notifications on" : "Enable notifications"}
          className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-lg transition ${
            notifStatus === "granted"
              ? "text-sage border-sage/40"
              : "text-ink-faint border-white/10 hover:text-sand"
          }`}
        >
          {notifStatus === "granted" ? <Bell size={13} /> : <BellOff size={13} />}
          {notifStatus === "granted" ? "Notifs on" : "Enable notifs"}
        </button>
      )}

      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-ink-faint border border-white/10 px-2.5 py-1.5 rounded-lg hover:text-sand hover:border-white/30 ml-auto"
      >
        {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
