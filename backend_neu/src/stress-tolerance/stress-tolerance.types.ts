/**
 * Typen und Port für den Stresstoleranz-Endpoint (#220).
 *
 * Der Service kennt nur dieses Interface, nicht Supabase.
 * Die konkrete Datenquelle (Adapter) wird im Modul festgelegt –
 * gleiches Muster wie beim Kalender (CALENDAR_DATA_SOURCE).
 */

/** Ein Termin des Nutzers, der an einem bestimmten Tag stattfindet. */
export interface DayOccurrence {
  occurrenceId: string;
  eventId: string;
  eventName: string;
  isStatic: boolean;
  startTime: string; // HH:mm oder HH:mm:ss
  endTime: string;
}

/** Antwort des Endpoints – das Frontend rechnet selbst nichts mehr. */
export interface StressToleranceResult {
  date: string; // YYYY-MM-DD
  value: number; // 0 … max
  max: number;
  min: number;
  consideredOccurrences: number;
}

/**
 * Port: was der Service von außen braucht.
 * `client` ist der Supabase-Client im Namen des Users (aus dem Guard),
 * damit RLS greift – bewusst als Parameter, siehe DIA im PR.
 */
export interface StressToleranceDataSource {
  findOccurrencesForDay(
    client: unknown,
    userId: string,
    date: string,
  ): Promise<DayOccurrence[]>;

  /** Belastungswert je Ereignis (eventId → Wert, z. B. -30). */
  findLoadValues(
    client: unknown,
    userId: string,
    eventIds: string[],
  ): Promise<Map<string, number>>;
}

export const STRESS_TOLERANCE_DATA_SOURCE = "STRESS_TOLERANCE_DATA_SOURCE";
