import { useEffect, useState } from "react";
import {
  addOccurrence,
  listEventsForSelection,
} from "./eventsApi";

const STRESS_LEVELS = [
  { value: 1, label: "1 – Sehr niedrig", emoji: "😄" },
  { value: 2, label: "2 – Leicht", emoji: "🙂" },
  { value: 3, label: "3 – Moderat", emoji: "😐" },
  { value: 4, label: "4 – Hoch", emoji: "🙁" },
  { value: 5, label: "5 – Sehr hoch", emoji: "🫣" },
];

function EventSelectionMenu({ date, onClose, onSaved }) {
  const [normalEvents, setNormalEvents] = useState([]);
  const [staticEvents, setStaticEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [loadValue, setLoadValue] = useState(3);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listEventsForSelection()
      .then((data) => {
        if (!active) return;

        setNormalEvents(data.normalEvents ?? []);
        setStaticEvents(data.staticEvents ?? []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const allEvents = [...normalEvents, ...staticEvents];
  const selectedEvent = allEvents.find((e) => String(e.id) === String(eventId));
  const eventName = selectedEvent && selectedEvent.name ? selectedEvent.name.trim().toLowerCase() : "";

  // Debug-Ausgabe in der Browser-F12-Konsole
  console.log("Aktuelle Event-ID:", eventId, "| Gefundenes Event:", selectedEvent?.name, "| Clean Name:", eventName);

  // Das Feld wird nur angezeigt, wenn nichts gewählt ist ODER der Name exakt "sport" bzw. "lernzeit" ist
  const showLoadField = !eventId || eventName === "sport" || eventName === "lernzeit";

  async function handleSave(event) {
    event.preventDefault();
    setError("");

    if (!eventId) {
      setError("Bitte ein Ereignis auswählen.");
      return;
    }

    if (startTime >= endTime) {
      setError("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        eventDate: date,
        startTime,
        endTime,
        ...(showLoadField ? { loadValue: Number(loadValue) } : {}),
      };

      await addOccurrence(eventId, payload);

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="event-selection-menu">
      <h3>Ereignis hinzufügen</h3>
      <p>Datum: {date}</p>

      {loading ? (
        <p>Ereignisse werden geladen...</p>
      ) : (
        <form onSubmit={handleSave}>
          <label htmlFor="event-selection">
            Ereignis auswählen
          </label>

          <select
            id="event-selection"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
          >
            <option value="">Bitte auswählen</option>

            <optgroup label="Normale Ereignisse">
              {normalEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Statische Ereignisse">
              {staticEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </optgroup>
          </select>

          {showLoadField && (
            <>
              <label htmlFor="event-load">
                Belastung (1–5)
              </label>
              <select
                id="event-load"
                value={loadValue}
                onChange={(e) => setLoadValue(Number(e.target.value))}
              >
                {STRESS_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.emoji} {lvl.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="event-start">
            Startzeit
          </label>
          <input
            id="event-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <label htmlFor="event-end">
            Endzeit
          </label>
          <input
            id="event-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

          <div className="event-selection-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Speichern..." : "Hinzufügen"}
            </button>

            <button type="button" onClick={onClose}>
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {!loading && error && (
        <p role="alert">{error}</p>
      )}
    </div>
  );
}

export default EventSelectionMenu;