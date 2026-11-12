import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Alle Aufrufe senden das Supabase-Token mit, genau wie in Checkin.jsx.
async function request(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Bitte einloggen");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message ?? `Fehler ${res.status}`);
  }
  return body;
}

export const listEvents = () => request("/events");

export const addOccurrence = (eventId, occurrence) =>
  request(`/events/${eventId}/occurrences`, { method: "POST", body: JSON.stringify(occurrence) });
