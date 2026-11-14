import { useEffect, useState } from "react";
import { createEvent, addOccurrence, listEvents } from "./eventsApi";
import {
  LEVELS, findConflicts, fmtMin, storeLoadFallback, toDateStr,
} from "./timelineUtils";
import "./Ereignisse.css";

function EventForm({ events, onSaved }) {
  const [eventId, setEventId] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [date, setDate] = useState(toDateStr(new Date()));
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const conflicts = start && end && start < end
    ? findConflicts({ event_date: date, start, end }, events)
    : [];

  async function handleSave() {
    setError("");
    if (!eventId && !name.trim()) return setError("Bitte einen Namen eingeben.");
    if (!date) return setError("Bitte ein Datum wählen.");
    if (start >= end) return setError("Die Endzeit muss nach der Startzeit liegen.");
    if (conflicts.length > 0) {
      return setError(`Zu dieser Zeit gibt es schon „${conflicts[0].name}“ (${fmtMin(conflicts[0].start)}–${fmtMin(conflicts[0].end)}).`);
    }

    setSaving(true);
    try {
      let id = eventId;
      if (!id) {
        const created = await createEvent(name.trim(), LEVELS[level].key);
        id = created.id;
        if (created.load_value == null) storeLoadFallback(id, LEVELS[level].value);
      }
      await addOccurrence(id, { eventDate: date, startTime: start, endTime: end });
      setName("");
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
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Neues Ereignis</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>

      {!eventId && (
        <>
          <label>
            Name
            <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="ev-label">Erwartete Belastung</div>
          <div className="ev-levels">
            {LEVELS.map((l, i) => (
              <button key={l.key} type="button" className="ev-lvbtn" aria-pressed={level === i}
                aria-label={l.label} title={l.label} onClick={() => setLevel(i)}>
                {l.symbol}
              </button>
            ))}
          </div>
        </>
      )}

      <label>Datum<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>

      <div className="ev-row">
        <label>Von<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>Bis<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      </div>

      {conflicts.length > 0 && (
        <p className="ev-warn" role="status">
          ⚠ Überschneidet sich mit {conflicts.map((c) => `„${c.name}“ (${fmtMin(c.start)}–${fmtMin(c.end)})`).join(", ")}.
          Bitte wähle eine andere Zeit.
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <button onClick={handleSave} disabled={saving || conflicts.length > 0}>
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