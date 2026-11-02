
import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';


import { CALENDAR_DATA_SOURCE } from './calendar.types';
import type { CalendarDataSource } from './calendar.types';

@Injectable()
export class CalendarService {
  constructor(
    @Inject(CALENDAR_DATA_SOURCE)
    private readonly dataSource: CalendarDataSource,
  ) {}

  async getDay(date: string, userId: string) {
    // Datum im Format YYYY-MM-DD prüfen
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
      throw new BadRequestException(
        'Datum muss im Format YYYY-MM-DD sein',
      );
    }

    const selectedDate = new Date(`${date}T12:00:00Z`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Ungültiges Datum');
    }

    // ISO-Wochentag: Montag = 1, Sonntag = 7
    const weekday = selectedDate.getUTCDay() || 7;

    const occurrences =
      await this.dataSource.findOccurrences(userId);

    const events = occurrences
      .filter((occurrence) => {
        // Einmalige Termine
        if (occurrence.event_date !== null) {
          return occurrence.event_date === date;
        }

        // Wöchentlich wiederkehrende Termine
        return occurrence.weekday === weekday;
      })
      .sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      )
      .map((occurrence) => ({
        id: occurrence.id,
        event_id: occurrence.event_id,
        name: occurrence.name,
        start_time: occurrence.start_time,
        end_time: occurrence.end_time,
      }));

    return {
      date,
      events,
    };
  }
}
