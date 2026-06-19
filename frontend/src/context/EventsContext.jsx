import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getWeekStart, addDays, dateKey } from "../utils/dateHelpers";
import * as eventsApi from "../api/events";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [events, setEvents] = useState([]); // raw event definitions (for editing)
  const [occurrences, setOccurrences] = useState([]); // expanded for the visible week
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekEnd = addDays(weekStart, 6);

  const loadOccurrences = useCallback(async (start, end) => {
    try {
      const data = await eventsApi.fetchOccurrences(dateKey(start), dateKey(end));
      setOccurrences(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load this week's schedule.");
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventsApi.fetchEvents();
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your events.");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadEvents(), loadOccurrences(weekStart, weekEnd)]);
    setLoading(false);
  }, [loadEvents, loadOccurrences, weekStart, weekEnd]);

  useEffect(() => {
    // Standard fetch-on-mount-and-on-dependency-change pattern. refreshAll's
    // setLoading(true) call is reachable synchronously here, which the
    // newer react-hooks lint rule flags, but this is the correct/idiomatic
    // way to refetch when the visible week changes without a data library.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const goToWeek = (newWeekStart) => setWeekStart(getWeekStart(newWeekStart));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const goToToday = () => setWeekStart(getWeekStart(new Date()));

  const addEvent = async (payload) => {
    await eventsApi.createEvent(payload);
    await refreshAll();
  };

  const editEvent = async (id, payload) => {
    await eventsApi.updateEvent(id, payload);
    await refreshAll();
  };

  const removeEvent = async (id) => {
    await eventsApi.deleteEvent(id);
    await refreshAll();
  };

  const markComplete = async (id, date) => {
    await eventsApi.toggleComplete(id, date);
    await loadOccurrences(weekStart, weekEnd);
  };

  const skipOccurrence = async (id, date) => {
    await eventsApi.addException(id, date);
    await loadOccurrences(weekStart, weekEnd);
  };

  const getEventById = (id) => events.find((e) => e._id === id);

  return (
    <EventsContext.Provider
      value={{
        weekStart,
        weekEnd,
        events,
        occurrences,
        loading,
        error,
        goToWeek,
        nextWeek,
        prevWeek,
        goToToday,
        addEvent,
        editEvent,
        removeEvent,
        markComplete,
        skipOccurrence,
        getEventById,
        refreshAll,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- intentional: context hook lives alongside its provider
export const useEvents = () => useContext(EventsContext);
