import { useRef, useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { EventsProvider, useEvents } from "../context/EventsContext";
import WeekNavigator from "../components/WeekNavigator";
import WeeklyGrid from "../components/WeeklyGrid";
import DailyAgenda from "../components/DailyAgenda";
import PromptBar from "../components/PromptBar";
import EventModal from "../components/EventModal";
import PrayerTimePanel from "../components/PrayerTimePanel";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import SearchBar from "../components/SearchBar";
import Toolbar from "../components/Toolbar";
import TemplateManager from "../components/TemplateManager";
import { addDays, dateKey, getWeekStart } from "../utils/dateHelpers";
import { scheduleNotifications } from "../utils/notifications";
import { LogOut, BarChart2 } from "lucide-react";

function PlannerView() {
  const {
    weekStart, occurrences, events, loading, error,
    nextWeek, prevWeek, goToToday, goToWeek,
    addEvent, editEvent, removeEvent,
    markComplete, skipOccurrence, getEventById,
  } = useEvents();

  const [view, setView] = useState("week");
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [modal, setModal] = useState({ isOpen: false, initial: null, occurrenceDate: null });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filter, setFilter] = useState({ query: "", category: "" });
  const gridRef = useRef(null);

  useEffect(() => {
    if (occurrences.length) scheduleNotifications(occurrences, 5);
  }, [occurrences]);

  const filteredOccurrences = useMemo(() => {
    if (!filter.query && !filter.category) return occurrences;
    return occurrences.filter((o) => {
      const matchesQuery = !filter.query || o.title.toLowerCase().includes(filter.query);
      const matchesCategory = !filter.category || o.category === filter.category;
      return matchesQuery && matchesCategory;
    });
  }, [occurrences, filter]);

  const openManual = () => setModal({ isOpen: true, initial: null, occurrenceDate: null });
  const openFromDraft = (draft) => setModal({ isOpen: true, initial: draft, occurrenceDate: null });
  const openFromOccurrence = (occ) => {
    const fullEvent = getEventById(occ.eventId);
    setModal({ isOpen: true, initial: fullEvent, occurrenceDate: occ.date });
  };
  const closeModal = () => setModal({ isOpen: false, initial: null, occurrenceDate: null });

  const handleSave = async (payload) => {
    if (modal.initial?._id) await editEvent(modal.initial._id, payload);
    else await addEvent(payload);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this event entirely? All occurrences will be removed.")) {
      await removeEvent(id);
      closeModal();
    }
  };

  const handleMarkComplete = async (id, date) => {
    await markComplete(id, date);
    closeModal();
  };

  const handleSkip = async (id, date) => {
    await skipOccurrence(id, date);
    closeModal();
  };

  const handleAddPrayers = async (prayers) => {
    for (const p of prayers) await addEvent(p);
  };

  const handleApplyTemplate = async (templateEvents) => {
    for (const e of templateEvents) await addEvent(e);
  };

  const stepDay = (delta) => {
    const next = addDays(selectedDay, delta);
    setSelectedDay(next);
    if (dateKey(getWeekStart(next)) !== dateKey(weekStart)) goToWeek(next);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PrayerTimePanel onAddPrayers={handleAddPrayers} />
      <PromptBar onParsed={openFromDraft} onManualAdd={openManual} />
      <SearchBar onFilter={setFilter} />

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex-1">
          <WeekNavigator
            weekStart={weekStart}
            view={view}
            onView={setView}
            onPrev={view === "week" ? prevWeek : () => stepDay(-1)}
            onNext={view === "week" ? nextWeek : () => stepDay(1)}
            onToday={() => { goToToday(); setSelectedDay(new Date()); }}
          />
        </div>
        <button
          onClick={() => setShowAnalytics((s) => !s)}
          className={`flex items-center gap-1.5 text-xs border px-2.5 py-1.5 rounded-lg transition ${
            showAnalytics ? "text-gold border-gold/40" : "text-ink-faint border-white/10 hover:text-sand"
          }`}
        >
          <BarChart2 size={13} /> Analytics
        </button>
        <TemplateManager currentEvents={events} onApplyTemplate={handleApplyTemplate} />
      </div>

      <div className="mb-3">
        <Toolbar gridRef={gridRef} />
      </div>

      {error && <p className="text-clay text-sm mb-3">{error}</p>}

      {showAnalytics && (
        <div className="mb-4">
          <AnalyticsDashboard occurrences={occurrences} />
        </div>
      )}

      {loading ? (
        <p className="text-ink-faint text-sm text-center py-10">Loading your schedule...</p>
      ) : view === "week" ? (
        <WeeklyGrid
          ref={gridRef}
          weekStart={weekStart}
          occurrences={filteredOccurrences}
          onEventClick={openFromOccurrence}
        />
      ) : (
        <DailyAgenda
          selectedDay={selectedDay}
          occurrences={filteredOccurrences}
          onEventClick={openFromOccurrence}
          onPrevDay={() => stepDay(-1)}
          onNextDay={() => stepDay(1)}
        />
      )}

      {modal.isOpen && (
        <EventModal
          key={modal.initial?._id || modal.initial?.rawText || "blank"}
          onClose={closeModal}
          initial={modal.initial}
          occurrenceDate={modal.occurrenceDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onMarkComplete={handleMarkComplete}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink text-sand px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl">Weekly Planner AI</h1>
          <p className="text-ink-faint text-xs">{user?.name}'s schedule</p>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-ink-faint text-sm hover:text-gold">
          <LogOut size={15} /> Log out
        </button>
      </div>
      <EventsProvider>
        <PlannerView />
      </EventsProvider>
    </div>
  );
}
