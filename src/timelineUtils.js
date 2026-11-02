// Reine Funktionen für Belastung, Überlagerung und Blocklayout (ohne React).

export const DAY_NAMES = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

// Belastungsgrad-Tabelle: Symbol -> Startwert
export const LEVELS = [
  { key: "entspannt", label: "Entspannt", symbol: "😊", value: 0, color: "#5e9c76" },
  { key: "leicht", label: "Leicht", symbol: "🙂", value: -10, color: "#8aa65a" },
  { key: "moderat", label: "Moderat", symbol: "😐", value: -30, color: "#d1a33a" },
  { key: "anstrengend", label: "Anstrengend", symbol: "🙁", value: -40, color: "#d9783a" },
  { key: "erschoepfend", label: "Erschöpfend", symbol: "😞", value: -50, color: "#b9483f" },
];

// Wert -> Stufe über die Wertebereiche. Unter -50 (statische Ereignisse): kein Symbol.
export function levelOf(value) {
  if (value === null || value === undefined) return null;
  const v = Math.round(value);
  if (v >= -5) return 0;
  if (v >= -19) return 1;
  if (v >= -35) return 2;
  if (v >= -45) return 3;
  if (v >= -50) return 4;
  return null;
}

// Übergangslösung: solange das Backend load_value nicht speichert, merkt sich der Browser den Wert.
export const storeLoadFallback = (id, value) => localStorage.setItem(`load_${id}`, String(value));
export const loadOf = (event) => {
  if (event.load_value !== null && event.load_value !== undefined) return event.load_value;
  const v = localStorage.getItem(`load_${event.id}`);
  return v === null ? null : Number(v);
};

const pad = (n) => String(n).padStart(2, "0");
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toMinutes = (t) => {
  const [h, m] = t.split(":");
  return Number(h) * 60 + Number(m);
};
export const fmtMin = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
export const isoWeekday = (ds) => new Date(`${ds}T00:00:00`).getDay() || 7; // 1 = Montag ... 7 = Sonntag

// Echte Überlappung; direkt aneinander anschließende Termine zählen nicht.
const overlaps = (a, b) => a.start < b.end && b.start < a.end;

// Können zwei Termine am selben Tag stattfinden? (Datum/Datum, Wochentag/Wochentag, gemischt)
function sharesDay(a, b) {
  if (a.event_date && b.event_date) return a.event_date === b.event_date;
  if (!a.event_date && !b.event_date) return a.weekday === b.weekday;
  const dated = a.event_date ? a : b;
  const weekly = a.event_date ? b : a;
  return isoWeekday(dated.event_date) === weekly.weekday;
}

// Vorab-Warnung im Formular: welche bestehenden Termine kollidieren mit dem Kandidaten?
export function findConflicts(candidate, events) {
  const c = { ...candidate, start: toMinutes(candidate.start), end: toMinutes(candidate.end) };
  return events.flatMap((e) =>
    (e.event_occurrences ?? [])
      .filter((o) => sharesDay(c, o) && overlaps(c, { start: toMinutes(o.start_time), end: toMinutes(o.end_time) }))
      .map((o) => ({ name: e.name, start: toMinutes(o.start_time), end: toMinutes(o.end_time) })),
  );
}

// Alle Blöcke eines Tages inkl. Spur (lane) und Spaltenzahl, damit sich Überlagerungen nicht verdecken.
export function blocksForDay(events, ds) {
  const wd = isoWeekday(ds);
  const blocks = events.flatMap((e) =>
    (e.event_occurrences ?? [])
      .filter((o) => (o.event_date ? o.event_date === ds : o.weekday === wd))
      .map((o) => ({
        id: o.id,
        name: e.name,
        start: toMinutes(o.start_time),
        end: toMinutes(o.end_time),
        level: levelOf(loadOf(e)),
        clashes: [],
      })),
  );
  blocks.sort((a, b) => a.start - b.start || a.end - b.end);

  const laneEnd = [];
  for (const b of blocks) {
    let lane = 0;
    while (laneEnd[lane] > b.start) lane++;
    laneEnd[lane] = b.end;
    b.lane = lane;
  }
  for (const a of blocks) for (const b of blocks) if (a !== b && overlaps(a, b)) a.clashes.push(b);
  for (const b of blocks) b.cols = Math.max(b.lane, ...b.clashes.map((x) => x.lane)) + 1;
  return blocks;
}
