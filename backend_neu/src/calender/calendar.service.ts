
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

type CalendarDayEvent = {
  id: string;
  event_id: string;
  name: string;
  start_time: string;
  end_time: string;
};

type CalendarWeekEvent = {
  id: string;
  event_id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class CalendarService {

  // TAGESANSICHT
  async getDay(
    supabase: any,
    userId: string,
    date: string,
  ) {
    // Datum validieren
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException(
        'Datum muss im Format YYYY-MM-DD angegeben werden.',
      );
    }

    const selectedDate = new Date(`${date}T12:00:00Z`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Ungültiges Datum.');
    }

    // Wochentag berechnen
    const weekday = selectedDate.getUTCDay() || 7;

    // Ereignisse aus Supabase laden
    const { data, error } = await supabase
      .from('events')
      .select('id, name, event_occurrences(*)')
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException(
        'Die Kalenderereignisse konnten nicht geladen werden.',
      );
    }

    // Ereignisse des ausgewählten Tages filtern
    const events: CalendarDayEvent[] = [];

    for (const event of data ?? []) {
      for (const occurrence of event.event_occurrences ?? []) {
        if (
          occurrence.event_date === date ||
          (
            occurrence.event_date === null &&
            occurrence.weekday === weekday
          )
        ) {
          events.push({
            id: occurrence.id,
            event_id: event.id,
            name: event.name,
            start_time: occurrence.start_time,
            end_time: occurrence.end_time,
          });
        }
      }
    }

    // Nach Uhrzeit sortieren
    events.sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );

    return {
      date,
      events,
    };
  }

  // WOCHENANSICHT
  async getWeek(
    supabase: any,
    userId: string,
    date: string,
  ) {
    // Datum validieren
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException(
        'Datum muss im Format YYYY-MM-DD angegeben werden.',
      );
    }

    const selectedDate = new Date(`${date}T12:00:00Z`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Ungültiges Datum.');
    }

    // Montag der Woche berechnen
    const weekday = selectedDate.getUTCDay() || 7;

    const monday = new Date(selectedDate);
    monday.setUTCDate(
      monday.getUTCDate() - weekday + 1,
    );

    // Alle sieben Tage erstellen
    const weekDates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + i);
      weekDates.push(day.toISOString().slice(0, 10));
    }

    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];

    // Ereignisse aus Supabase laden
    const { data, error } = await supabase
      .from('events')
      .select('id, name, event_occurrences(*)')
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException(
        'Die Kalenderereignisse konnten nicht geladen werden.',
      );
    }

    // Ereignisse der Woche filtern
    const events: CalendarWeekEvent[] = [];

    for (const event of data ?? []) {
      for (const occurrence of event.event_occurrences ?? []) {

        // Einmalige Ereignisse
        if (occurrence.event_date !== null) {
          if (
            occurrence.event_date >= weekStart &&
            occurrence.event_date <= weekEnd
          ) {
            events.push({
              id: occurrence.id,
              event_id: event.id,
              name: event.name,
              date: occurrence.event_date,
              start_time: occurrence.start_time,
              end_time: occurrence.end_time,
            });
          }
        } else {
          // Wöchentlich wiederkehrende Ereignisse
          for (let i = 0; i < 7; i++) {
            if (occurrence.weekday === i + 1) {
              events.push({
                id: occurrence.id,
                event_id: event.id,
                name: event.name,
                date: weekDates[i],
                start_time: occurrence.start_time,
                end_time: occurrence.end_time,
              });
            }
          }
        }
      }
    }

    // Nach Datum und Uhrzeit sortieren
    events.sort((a, b) =>
      a.date.localeCompare(b.date) ||
      a.start_time.localeCompare(b.start_time),
    );

    return {
      week_start: weekStart,
      week_end: weekEnd,
      events,
    };
  }
}
