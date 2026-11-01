import { useEffect, useState } from "react";
import { createEvent, addOccurrence, listEvents } from "./eventsApi";
import {
  DAY_NAMES, LEVELS, blocksForDay, findConflicts, fmtMin, storeLoadFallback, toDateStr,
} from "./timelineUtils";
import "./Ereignisse.css";

const PX_PER_MIN = 0.8;

function EventForm({ events, onSaved }) {
  const [eventId, setEventId] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [kind, setKind] = useState("date");
  const [date, setDate] = useState(toDateStr(new Date()));
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const conflicts = start && end && start < end
    ? findConflicts({ event_date: kind === "date" ? date : null, weekday: kind === "week" ? Number(weekday) : null, start, end }, events)
    : [];

  async function handleSave() {
    setError("");
    if (!eventId && !name.trim()) return setError("Bitte einen Namen eingeben.");
    if (kind === "date" && !date) return setError("Bitte ein Datum wählen.");
    if (start >= end) return setError("Die Endzeit muss nach der Startzeit liegen.");

    setSaving(true);
    try {
      let id = eventId;
      if (!id) {
        const created = await createEvent(name.trim(), LEVELS[level].key);
        id = created.id;
        if (created.load_value == null) storeLoadFallback(id, LEVELS[level].value);
      }
      await addOccurrence(
        id,
        kind === "date"
          ? { eventDate: date, startTime: start, endTime: end }
          : { weekday: Number(weekday), startTime: start, endTime: end },
      );
      setName("");
      setEventId("");
      onSaved(kind === "date" ? date : null, conflicts.length);
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

      <label>
        Termin
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="date">An einem Datum</option>
          <option value="week">Jede Woche</option>
        </select>
      </label>

      {kind === "date" ? (
        <label>Datum<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      ) : (
        <label>
          Wochentag
          <select value={weekday} onChange={(e) => setWeekday(e.target.value)}>
            {DAY_NAMES.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </select>
        </label>
      )}

      <div className="ev-row">
        <label>Von<input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>Bis<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      </div>

      {conflicts.length > 0 && (
        <p className="ev-warn" role="status">
          ⚠ Überschneidet sich mit {conflicts.map((c) => `„${c.name}“ (${fmtMin(c.start)}–${fmtMin(c.end)})`).join(", ")}.
          Du kannst trotzdem speichern.
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <button onClick={handleSave} disabled={saving}>{saving ? "Speichern …" : "Ereignis speichern"}</button>
    </section>
  );
}

function DayTimeline({ events, day }) {
  const blocks = blocksForDay(events, toDateStr(day));
  const h0 = Math.min(6, Math.floor(Math.min(...blocks.map((b) => b.start), 360) / 60));
  const h1 = Math.max(22, Math.ceil(Math.max(...blocks.map((b) => b.end), 1320) / 60));
  const hours = Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i);
  const top = (m) => (m - h0 * 60) * PX_PER_MIN;

  const pairs = [];
  blocks.forEach((a, i) => a.clashes.forEach((b) => {
    if (blocks.indexOf(b) > i) pairs.push([a, b]);
  }));

  return (
    <>
      {pairs.map(([a, b]) => (
        <p key={`${a.id}-${b.id}`} className="ev-warn" role="alert">
          ⚠ „{a.name}“ ({fmtMin(a.start)}–{fmtMin(a.end)}) überschneidet sich mit „{b.name}“ ({fmtMin(b.start)}–{fmtMin(b.end)}).
        </p>
      ))}
      {blocks.length === 0 && <p className="ev-empty">An diesem Tag gibt es noch keine Ereignisse.</p>}

      <div className="ev-timeline" style={{ height: (h1 - h0) * 60 * PX_PER_MIN + 10 }}>
        {hours.map((h) => (
          <div key={h} className="ev-hour" style={{ top: top(h * 60) }}><span>{h}:00</span></div>
        ))}
        <div className="ev-blocks">
          {blocks.map((b) => {
            const lv = b.level === null ? null : LEVELS[b.level];
            const tall = (b.end - b.start) * PX_PER_MIN >= 40;
            return (
              <div key={b.id} className={`ev-block${b.clashes.length ? " clash" : ""}`}
                title={`${b.name}, ${fmtMin(b.start)}–${fmtMin(b.end)}`}
                style={{
                  "--c": lv ? lv.color : "#4a7bd0",
                  top: top(b.start),
                  height: Math.max((b.end - b.start) * PX_PER_MIN, 26),
                  left: `${(b.lane * 100) / b.cols}%`,
                  width: `calc(${100 / b.cols}% - 4px)`,
                }}>
                <strong>{b.clashes.length > 0 && "⚠ "}{lv && `${lv.symbol} `}{b.name}</strong>
                {tall && <small>{fmtMin(b.start)}–{fmtMin(b.end)}</small>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Ereignisse() {
  const [events, setEvents] = useState([]);
  const [day, setDay] = useState(new Date());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    listEvents()
      .then((data) => active && setEvents(data))
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, []);

  async function handleSaved(date, conflictCount) {
    try {
      setEvents(await listEvents());
      if (date) setDay(new Date(`${date}T00:00:00`));
      setNotice(conflictCount ? `Gespeichert – Achtung: ${conflictCount} Überschneidung(en).` : "Ereignis gespeichert.");
    } catch (e) {
      setError(e.message);
    }
  }

  const shift = (n) => setDay((d) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; });

  return (
    <div className="checkin-container ev-page">
      <h1>Ereignisse</h1>
      {error && <p className="error">{error}</p>}

      <EventForm events={events} onSaved={handleSaved} />
      {notice && <p className="success-message">{notice}</p>}

      <section className="ev-card">
        <h2>Zeitleiste</h2>
        <div className="ev-nav">
          <button className="ev-iconbtn" aria-label="Vorheriger Tag" onClick={() => shift(-1)}>◀</button>
          <strong>{day.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</strong>
          <button className="ev-iconbtn" aria-label="Nächster Tag" onClick={() => shift(1)}>▶</button>
        </div>
        <button className="secondary ev-today" onClick={() => setDay(new Date())}>Heute</button>
        <DayTimeline events={events} day={day} />
      </section>
    </div>
  );
}

export default Ereignisse;
