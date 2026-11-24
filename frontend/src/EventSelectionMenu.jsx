import { useEffect, useState } from "react";
import {
  addOccurrence,
  listEventsForSelection,
} from "./eventsApi";

<<<<<<< HEAD
const STRESS_LEVELS = [
  { value: 1, label: "1 – Sehr niedrig", emoji: "😄" },
  { value: 2, label: "2 – Leicht", emoji: "🙂" },
  { value: 3, label: "3 – Moderat", emoji: "😐" },
  { value: 4, label: "4 – Hoch", emoji: "🙁" },
  { value: 5, label: "5 – Sehr hoch", emoji: "🫣" },
];
=======
import "./EventSelectionMenu.css";
>>>>>>> origin/main

function EventSelectionMenu({ date, onClose, onSaved }) {
  const [normalEvents, setNormalEvents] = useState([]);
  const [staticEvents, setStaticEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
<<<<<<< HEAD
  const [loadValue, setLoadValue] = useState(3);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
=======
>>>>>>> origin/main

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Ereignisse aus dem Backend laden
  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await listEventsForSelection();

        if (!active) return;

        setNormalEvents(data.normalEvents ?? []);
        setStaticEvents(data.staticEvents ?? []);
      } catch (err) {
        if (active) {
          setError(
            err.message || "Ereignisse konnten nicht geladen werden."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

<<<<<<< HEAD
  const allEvents = [...normalEvents, ...staticEvents];
  const selectedEvent = allEvents.find((e) => String(e.id) === String(eventId));
  const eventName = selectedEvent && selectedEvent.name ? selectedEvent.name.trim().toLowerCase() : "";

  // Debug-Ausgabe in der Browser-F12-Konsole
  console.log("Aktuelle Event-ID:", eventId, "| Gefundenes Event:", selectedEvent?.name, "| Clean Name:", eventName);

  // Das Feld wird nur angezeigt, wenn nichts gewählt ist ODER der Name exakt "sport" bzw. "lernzeit" ist
  const showLoadField = !eventId || eventName === "sport" || eventName === "lernzeit";

  async function handleSave(event) {
    event.preventDefault();
=======
  // Ereignis auswählen
  function selectEvent(event, type) {
    setSelectedEvent({ ...event, type });
>>>>>>> origin/main
    setError("");
  }

  // Ereignis im Kalender speichern
  async function handleSave() {
    if (!selectedEvent) {
      setError("Bitte wähle ein Ereignis aus.");
      return;
    }

    if (startTime >= endTime) {
      setError("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    try {
<<<<<<< HEAD
      const payload = {
=======
      setSaving(true);
      setError("");

      await addOccurrence(selectedEvent.id, {
>>>>>>> origin/main
        eventDate: date,
        startTime,
        endTime,
        ...(showLoadField ? { loadValue: Number(loadValue) } : {}),
      };

      await addOccurrence(eventId, payload);

      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(
        err.message || "Das Ereignis konnte nicht gespeichert werden."
      );
    } finally {
      setSaving(false);
    }
  }

  // Kleine Tabellenzeilen für Ereignisse
  function renderEventRows(events, type) {
    if (events.length === 0) {
      return (
        <p className="event-empty">
          Keine Ereignisse vorhanden.
        </p>
      );
    }

    return events.map((event) => {
      const selected = selectedEvent?.id === event.id;

      return (
        <button
          type="button"
          key={event.id}
          className={`event-menu-row ${
            selected ? "selected" : ""
          }`}
          onClick={() => selectEvent(event, type)}
          aria-pressed={selected}
        >
          <span className="event-menu-icon">
            {type === "static" ? "📌" : "📅"}
          </span>

          <span className="event-menu-info">
            <strong>{event.name}</strong>
            <small>
              {type === "static"
                ? "Statisches Ereignis"
                : "Normales Ereignis"}
            </small>
          </span>

          <span className="event-menu-arrow">
            {selected ? "✓" : "›"}
          </span>
        </button>
      );
    });
  }

  return (
    <div className="event-menu-container">
      <div className="event-menu-header">
        <h3>Ereignis-Auswahlmenü</h3>

        <button
          type="button"
          className="event-menu-close"
          onClick={onClose}
          aria-label="Menü schließen"
        >
          ×
        </button>
      </div>

      <div className="event-menu-content">
        <p className="event-menu-date">
          Datum: {date}
        </p>

        {loading ? (
          <p>Ereignisse werden geladen...</p>
        ) : (
          <>
            {/* Statische Ereignisse */}
            <div className="event-menu-section">
              <h4>Statische Ereignisse</h4>

              <div className="event-menu-table">
                {renderEventRows(staticEvents, "static")}
              </div>
            </div>

<<<<<<< HEAD
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
=======
            {/* Normale Ereignisse */}
            <div className="event-menu-section">
              <h4>Normale Ereignisse</h4>
>>>>>>> origin/main

              <div className="event-menu-table">
                {renderEventRows(normalEvents, "normal")}
              </div>
            </div>
          </>
        )}

        {/* Ausgewähltes Ereignis */}
        {selectedEvent && (
          <div className="event-menu-selected">
            <p>
              Ausgewählt: <strong>{selectedEvent.name}</strong>
            </p>

            <div className="event-menu-times">
              <label>
                Startzeit
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                />
              </label>

              <label>
                Endzeit
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className="event-menu-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Speichern..." : "Ereignis hinzufügen"}
            </button>
          </div>
        )}

        {error && (
          <p className="event-menu-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default EventSelectionMenu;