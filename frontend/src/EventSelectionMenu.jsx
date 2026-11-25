import { useEffect, useState } from "react";
import {
  addOccurrence,
  listEvents,
  listEventsForSelection,
} from "./eventsApi";
import { findConflicts, fmtMin, isoWeekday } from "./timelineUtils";
import "./EventSelectionMenu.css";
import "./Ereignisse.css";


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
  const [selectedEvent, setSelectedEvent] = useState(null);
  

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [loadValue, setLoadValue] = useState(3);

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

  // Belastung (1–5) gibt es nur für Sport und Lernzeit
  const eventName = selectedEvent?.name?.trim().toLowerCase() ?? "";
  const showLoadField = eventName === "sport" || eventName === "lernzeit";

  // Ereignis auswählen, gespeicherte Belastung des Nutzers vorbelegen
  function selectEvent(event, type) {
    setSelectedEvent({ ...event, type });
    setLoadValue(event.load_value ?? 3);
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
      setSaving(true);
      setError("");

      await addOccurrence(selectedEvent.id, {
        eventDate: date,
        startTime,
        endTime,
        ...(showLoadField ? { loadValue: Number(loadValue) } : {}),
      });

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
          className={`event-menu-row ${selected ? "selected" : ""}`}
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

            {/* Normale Ereignisse */}
            <div className="event-menu-section">
              <h4>Normale Ereignisse</h4>

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

            {showLoadField && (
              <label>
                Belastung (1–5)
                <select
                  value={loadValue}
                  onChange={(e) => setLoadValue(Number(e.target.value))}
                >
                  {STRESS_LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.emoji} {lvl.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="event-menu-times">
              <label>
                Startzeit
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>

              <label>
                Endzeit
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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