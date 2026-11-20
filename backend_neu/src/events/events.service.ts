
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto';

@Injectable()
export class EventsService {

  // Ereignis zu einem Datum oder Wochentag hinzufügen
  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {

    // Prüfen, ob das Ereignis existiert
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError) {
      throw new InternalServerErrorException(
        'Das Ereignis konnte nicht überprüft werden.',
      );
    }

    if (!event) {
      throw new NotFoundException(
        'Ereignis nicht gefunden.',
      );
    }

    // Prüfen, ob Datum oder Wochentag angegeben wurde
    const hasDate = !!dto.eventDate;

    const hasWeekday =
      dto.weekday !== undefined &&
      dto.weekday !== null;

    if (hasDate === hasWeekday) {
      throw new BadRequestException(
        'Bitte entweder ein Datum oder einen Wochentag angeben.',
      );
    }

    // Datumsformat prüfen
    if (
      hasDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(dto.eventDate!)
    ) {
      throw new BadRequestException(
        'Datum muss im Format YYYY-MM-DD sein.',
      );
    }

    // Wochentag prüfen
    if (
      hasWeekday &&
      (!Number.isInteger(dto.weekday) ||
        dto.weekday! < 1 ||
        dto.weekday! > 7)
    ) {
      throw new BadRequestException(
        'Wochentag muss zwischen 1 und 7 liegen.',
      );
    }

    // Startzeit und Endzeit überprüfen
    const timePattern =
      /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !timePattern.test(dto.startTime) ||
      !timePattern.test(dto.endTime)
    ) {
      throw new BadRequestException(
        'Uhrzeit muss im Format HH:mm sein.',
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        'Endzeit muss nach der Startzeit liegen.',
      );
    }

    // Bereits vorhandene Termine laden
    const {
      data: occurrences,
      error: occurrenceError,
    } = await supabase
      .from('event_occurrences')
      .select(
        'id, event_date, weekday, start_time, end_time, repeat',
      )
      .eq('user_id', userId);

    if (occurrenceError) {
      throw new InternalServerErrorException(
        'Die Terminprüfung ist fehlgeschlagen.',
      );
    }

    // Wochentag aus Datum berechnen
    const getWeekday = (date: string) => {
      const day = new Date(
        `${date}T00:00:00Z`,
      ).getUTCDay();

      return day === 0 ? 7 : day;
    };

    const targetWeekday = hasDate
      ? getWeekday(dto.eventDate!)
      : dto.weekday!;

    // Überschneidungen überprüfen
    const clashes = (occurrences ?? []).some(
      (occurrence: any) => {

        const sameDay =
          occurrence.event_date === dto.eventDate ||
          (occurrence.repeat &&
            Number(occurrence.weekday) === targetWeekday) ||
          (hasWeekday &&
            occurrence.event_date &&
            getWeekday(occurrence.event_date) ===
              targetWeekday);

        const overlapping =
          dto.startTime < occurrence.end_time &&
          dto.endTime > occurrence.start_time;

        return sameDay && overlapping;
      },
    );

    if (clashes) {
      throw new ConflictException(
        'Zu dieser Zeit gibt es bereits ein anderes Ereignis.',
      );
    }

    // Ereignis speichern
    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: eventId,
        user_id: userId,
        event_date: hasDate
          ? dto.eventDate
          : null,
        weekday: hasWeekday
          ? dto.weekday
          : null,
        start_time: dto.startTime,
        end_time: dto.endTime,
        repeat: hasWeekday,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'Der Ereignistermin konnte nicht erstellt werden.',
      );
    }

    return data;
  }

  // Ereignisse für das Auswahlmenü laden
  async findForSelection(
    supabase: any,
    _userId: string,
  ) {

    // Ereignisse aus Supabase laden
    const { data, error } = await supabase
      .from('events')
      .select('id, name, type')
      .order('name', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        'Die Ereignisse konnten nicht geladen werden.',
      );
    }

    const events = data ?? [];

    // Statische Ereignisse
    const staticEvents = events
      .filter(
        (event: any) => event.type === 'statisch',
      )
      .map((event: any) => ({
        id: event.id,
        name: event.name,
      }));

    // Normale Ereignisse
    const normalEvents = events
      .filter(
        (event: any) => event.type === 'normal',
      )
      .map((event: any) => ({
        id: event.id,
        name: event.name,
      }));

    return {
      staticEvents,
      normalEvents,
    };
  }

  // Alle Ereignisse laden
  async findAll(
    supabase: any,
    _userId: string,
  ) {

    const { data, error } = await supabase
      .from('events')
      .select('*, event_occurrences(*)')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        'Die Ereignisse konnten nicht geladen werden.',
      );
    }

    return data;
  }
}
