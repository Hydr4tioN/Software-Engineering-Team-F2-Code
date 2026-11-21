import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { isoWeekday } from "./stress-tolerance.day";
import {
  DayOccurrence,
  StressToleranceDataSource,
} from "./stress-tolerance.types";

/**
 * Adapter: die einzige Stelle im Modul, die Supabase-Tabellen kennt.
 * Ändert sich das Datenmodell (#202, #201), wird nur diese Datei angepasst.
 */
@Injectable()
export class SupabaseStressToleranceDataSource implements StressToleranceDataSource {
  async findOccurrencesForDay(
    client: any,
    userId: string,
    date: string,
  ): Promise<DayOccurrence[]> {
    // Einmalige Termine an diesem Datum ODER wöchentliche Termine an diesem Wochentag
    const { data, error } = await client
      .from("event_occurrences")
       .select("id, event_id, start_time, end_time, events(id, name)")
      .eq("user_id", userId)
      .or(
        `event_date.eq.${date},and(repeat.eq.true,weekday.eq.${isoWeekday(date)})`,
      );

        if (error) {
      console.error("[stress-tolerance] Supabase-Fehler:", error);
      throw new InternalServerErrorException(
        "Die Termine für die Stresstoleranz konnten nicht geladen werden.",
      );
    }

    return (data ?? []).map((row: any) => ({
      occurrenceId: row.id,
      eventId: row.event_id,
      eventName: row.events?.name ?? "",
      // TODO(#201): Spalte is_static gibt es in der DB noch nicht → vorerst nie statisch
      isStatic: false,
      startTime: row.start_time,
      endTime: row.end_time,
    }));
  }

  async findLoadValues(
    _client: any,
    _userId: string,
    _eventIds: string[],
  ): Promise<Map<string, number>> {
    // TODO(#202): Belastungswerte lesen, sobald Lewin festgelegt hat, wo sie gespeichert werden.
    // Bis dahin zählen alle Ereignisse als 0 → Stresstoleranz = 100.
    return new Map<string, number>();
  }
}
