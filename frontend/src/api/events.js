import api from "./axios";

export const fetchEvents = () => api.get("/events").then((r) => r.data);

export const fetchOccurrences = (start, end) =>
  api.get("/events/occurrences", { params: { start, end } }).then((r) => r.data);

export const createEvent = (payload) => api.post("/events", payload).then((r) => r.data);

export const updateEvent = (id, payload) => api.put(`/events/${id}`, payload).then((r) => r.data);

export const deleteEvent = (id) => api.delete(`/events/${id}`).then((r) => r.data);

export const toggleComplete = (id, date) =>
  api.patch(`/events/${id}/complete`, { date }).then((r) => r.data);

export const addException = (id, date) =>
  api.patch(`/events/${id}/exception`, { date }).then((r) => r.data);

export const parsePrompt = (text) => api.post("/parse", { text }).then((r) => r.data);
