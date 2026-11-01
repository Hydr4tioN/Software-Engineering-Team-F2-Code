
import { Injectable } from '@nestjs/common';
import {
  CalendarDataSource,
  CalendarOccurrence,
} from './calendar.types';

@Injectable()
export class CalendarDemoDataSource
  implements CalendarDataSource
{
  async findOccurrences(
    userId: string,
  ): Promise<CalendarOccurrence[]> {
    // Demo-Daten, später durch Supabase ersetzen.
    void userId;

    return [
      {
        id: 'demo-1',
        event_id: 'event-1',
        event_date: '2026-10-31',
        weekday: null,
        start_time: '09:00:00',
        end_time: '10:30:00',
        name: 'Mathevorlesung',
      },
      {
        id: 'demo-2',
        event_id: 'event-2',
        event_date: null,
        weekday: 1,
        start_time: '14:00:00',
        end_time: '15:30:00',
        name: 'Lerngruppe',
      },
    ];
  }
}
