
import { useEffect, useState } from "react";
import {
  addOccurrence,
  listEventsForSelection,
} from "./eventsApi";

function EventSelectionMenu({ date, onClose, onSaved }) {
  const [normalEvents, setNormalEvents] = useState([]);
  const [staticEvents, setStaticEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
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
      await addOccurrence(eventId, {
        eventDate: date,
        startTime,
        endTime,
      });

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
