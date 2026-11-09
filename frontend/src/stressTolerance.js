// Übergangslösung für #200: Stresstoleranz eines Tages im Frontend berechnen.
// TODO(#220): Durch den Backend-Endpoint GET /api/stress-tolerance ersetzen, sobald
// die Belastungswerte im Backend gespeichert werden (#202). Die verbindliche Regel
// liegt in backend_neu/src/stress-tolerance/stress-tolerance.policy.ts (#198).
import { isoWeekday, loadOf } from "./timelineUtils";

export const STRESS_TOLERANCE = { START: 100, MIN: 0 };

// Belastungswerte aller Termine, die am Tag `dateStr` (YYYY-MM-DD) stattfinden.
// Noch ohne Wert × Dauer für statische Ereignisse (#201).
export function loadValuesForDay(events, dateStr) {
  const weekday = isoWeekday(dateStr);
  return events.flatMap((event) =>
    (event.event_occurrences ?? [])
      .filter((o) => (o.event_date ? o.event_date === dateStr : o.weekday === weekday))
      .map(() => loadOf(event) ?? 0),
  );
}

// Gleiche Regel wie im Backend: 100 + Summe der Belastungswerte, mindestens 0.
export function stressToleranceForDay(events, dateStr) {
  const sum = loadValuesForDay(events, dateStr).reduce((acc, v) => acc + v, 0);
  return Math.max(STRESS_TOLERANCE.MIN, STRESS_TOLERANCE.START + sum);
}
