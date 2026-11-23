import { DayOccurrence } from "./stress-tolerance.types";

/** Prüft Format YYYY-MM-DD und ob es das Datum wirklich gibt (kein 2026-02-30). */
export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
  );
}

/** Wochentag nach ISO: 1 = Montag … 7 = Sonntag (wie in event_occurrences.weekday). */
export function isoWeekday(date: string): number {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/**
 * Ermittelt die Belastungswerte aller Termine eines Tages.
 * - Normale Ereignisse: gespeicherter Belastungswert, sonst 0.
 * - Statische Ereignisse: vorerst nicht berücksichtigt.
 *   TODO(#201): Wert = Belastung „leicht“ × Dauer in Stunden.
 */
export function loadValuesForDay(
  occurrences: DayOccurrence[],
  loadValues: Map<string, number>,
): number[] {
  return occurrences
    .filter((occurrence) => !occurrence.isStatic)
    .map((occurrence) => loadValues.get(occurrence.eventId) ?? 0);
}
