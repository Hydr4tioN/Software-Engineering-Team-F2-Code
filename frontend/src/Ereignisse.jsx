import { useEffect, useState } from "react";
import { addOccurrence, listEvents } from "./eventsApi";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  findConflicts, fmtMin, isoWeekday, toDateStr,
} from "./timelineUtils";
import "./Ereignisse.css";

const STRESS_LEVELS = [
  { value: 1, label: "1 – Sehr niedrig", emoji: "😄" },
  { value: 2, label: "2 – Leicht", emoji: "🙂" },
  { value: 3, label: "3 – Moderat", emoji: "😐" },
  { value: 4, label: "4 – Hoch", emoji: "🙁" },
  { value: 5, label: "5 – Sehr hoch", emoji: "🫣" },
];

const EVENT_ICONS = {
  lehrveranstaltung: "🎓",
  nebenjob: "💼",
  sport: "🏃",
  lernzeit: "📚",
};

const EVENT_SUBLABELS = {
  lehrveranstaltung: "statisches Ereignis",
  nebenjob: "statisches Ereignis",
  sport: "normales Ereignis",
  lernzeit: "normales Ereignis",
};

const iconFor = (event) =>
  EVENT_ICONS[event.name?.trim().toLowerCase()] ??
  (event.type === "statisch" ? "📌" : "📅");

const sublabelFor = (event) => {
  if (!event) return "";
  const key = event.name?.trim().toLowerCase();
  if (key && EVENT_SUBLABELS[key]) return EVENT_SUBLABELS[key];
  return event.type === "statisch" ? "statisch" : "normales Ereignis";
};

function EventForm({ events, onSaved, initialDate }) {
  const [eventId, setEventId] = useState("");
  const [date, setDate] = useState(initialDate);
  const [repeat, setRepeat] = useState(false);
  const [weekday, setWeekday] = useState(isoWeekday(initialDate));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loadValue, setLoadValue] = useState(3);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedEvent = events.find((e) => String(e.id) === String(eventId));
  const eventName = selectedEvent && selectedEvent.name ? selectedEvent.name.trim().toLowerCase() : "";
  const showLoadField = !eventId || eventName === "sport" || eventName === "lernzeit";

  const conflicts = start && end && start < end
    ? findConflicts(
      repeat
        ? { weekday, start, end }
        : { event_date: date, start, end },
      events
    )
    : [];

  async function handleSave() {
    setError("");

    if (!eventId) {
      return setError("Bitte ein Ereignis auswählen.");
    }

    if (!repeat && !date) {
      return setError("Bitte ein Datum wählen.");
    }

    if (start >= end) {
      return setError("Die Endzeit muss nach der Startzeit liegen.");
    }

    if (conflicts.length > 0) {
      return setError(
        `Zu dieser Zeit gibt es schon „${conflicts[0].name}“ (${fmtMin(conflicts[0].start)}–${fmtMin(conflicts[0].end)}).`
      );
    }

    setSaving(true);

    try {
      await addOccurrence(eventId, {
        ...(repeat ? { weekday } : { eventDate: date }),
        startTime: start,
        endTime: end,
        ...(showLoadField ? { loadValue: Number(loadValue) } : {}),
      });

      setEventId("");
      setLoadValue(3);
      setStart("");
      setEnd("");
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ev-card">
      <h2>Ereignis hinzufügen</h2>

      <label>
        Ereignis
        <select
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            const ev = events.find((x) => String(x.id) === e.target.value);
            setLoadValue(ev?.load_value ?? 3);
          }}
        >
          <option value="">Bitte auswählen</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {iconFor(e)} {e.name}
            </option>
          ))}
        </select>
        {selectedEvent && (
          <small style={{ display: "block", marginTop: "6px" }}>
            {sublabelFor(selectedEvent)}
          </small>
        )}
      </label>

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

      <div className="ev-repeat">
        <span className="ev-repeat-label">
          Wöchentlich wiederholen?
        </span>

        <label className="ev-switch">
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
          />
          <span className="ev-slider"></span>
        </label>
      </div>

      {!repeat ? (
        <label>
          Datum
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      ) : (
        <label>
          Wochentag
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
          >
            <option value={1}>Montag</option>
            <option value={2}>Dienstag</option>
            <option value={3}>Mittwoch</option>
            <option value={4}>Donnerstag</option>
            <option value={5}>Freitag</option>
            <option value={6}>Samstag</option>
            <option value={7}>Sonntag</option>
          </select>
        </label>
      )}

      <div className="ev-row">
        <label>
          Von
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>

        <label>
          Bis
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>

      {conflicts.length > 0 && (
        <p className="ev-warn" role="status">
          Überschneidet sich mit{" "}
          {conflicts.map((c) =>
            `„${c.name}“ (${fmtMin(c.start)}–${fmtMin(c.end)})`
          ).join(", ")}.
          Bitte wähle eine andere Zeit.
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || conflicts.length > 0}
      >
        {saving ? "Speichern …" : "Ereignis speichern"}
      </button>
    </section>
  );
}

function Ereignisse() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get("date");
  const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(dateParam ?? "")
    ? dateParam
    : toDateStr(new Date());

  useEffect(() => {
    let active = true;
    listEvents()
      .then((data) => active && setEvents(data))
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, []);

  function handleSaved(savedDate) {
    navigate(savedDate ? `/kalender?date=${savedDate}` : "/kalender");
  }

  return (
    <div className="checkin-container ev-page">
      <h1>Ereignisse</h1>
      {error && <p className="error">{error}</p>}

      <EventForm
        events={events}
        onSaved={handleSaved}
        initialDate={initialDate}
      />
      {notice && <p className="success-message">{notice}</p>}
    </div>
  );
}

export default Ereignisse;