
export interface CalendarOccurrence {
  id: string;
  event_id: string;
  event_date: string | null;
  weekday: number | null;
  start_time: string;
  end_time: string;
  name: string;
}

export interface CalendarDataSource {
  findOccurrences(
    userId: string,
  ): Promise<CalendarOccurrence[]>;
}

export const CALENDAR_DATA_SOURCE = 'CALENDAR_DATA_SOURCE';
