import { useEffect, useState } from "react";
import { addOccurrence, listEvents } from "./eventsApi";
import {
  findConflicts, fmtMin, toDateStr,
} from "./timelineUtils";
import "./Ereignisse.css";


function EventForm({ events, onSaved }) {
  const [eventId, setEventId] = useState("");
  const [date, setDate] = useState(toDateStr(new Date()));
  const [repeat, setRepeat] = useState(false);
  const [weekday, setWeekday] = useState(
    new Date().getDay() === 0 ? 7 : new Date().getDay()
  );
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      });

      setEventId("");
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
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Bitte auswählen</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
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
          ⚠ Überschneidet sich mit{" "}
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

  useEffect(() => {
    let active = true;
    listEvents()
      .then((data) => active && setEvents(data))
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, []);

  async function handleSaved() {
    try {
      setEvents(await listEvents());
      setNotice("Ereignis gespeichert.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="checkin-container ev-page">
      <h1>Ereignisse</h1>
      {error && <p className="error">{error}</p>}

      <EventForm events={events} onSaved={handleSaved} />
      {notice && <p className="success-message">{notice}</p>}
    </div>
  );
}

export default Ereignisse;