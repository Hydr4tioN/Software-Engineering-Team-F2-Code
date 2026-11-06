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
  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {

    //prufen, ob das Ereignis existiert
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
      throw new NotFoundException('Ereignis nicht gefunden.');
    }


    //prufen ob entweder ein Datum oder ein Wochentag angegeben wurde, aber nicht beides
    const hasDate = !!dto.eventDate;
    const hasWeekday = dto.weekday !== undefined && dto.weekday !== null;

    if (hasDate === hasWeekday) {
      throw new BadRequestException(
        'Bitte geben Sie entweder ein Datum oder einen Wochentag an.',
      );
    }

    if (hasDate && !/^\d{4}-\d{2}-\d{2}$/.test(dto.eventDate!)) {
      throw new BadRequestException(
        'Bitte geben Sie ein Datum im Format YYYY-MM-DD an.',
      );
    }

    if (
      hasWeekday &&
      (!Number.isInteger(dto.weekday) ||
        dto.weekday! < 1 ||
        dto.weekday! > 7)
    ) {
      throw new BadRequestException(
        'Der Wochentag muss zwischen 1 (Montag) und 7 (Sonntag) liegen.',
      );
    }


    //prufen ob die Startzeit und Endzeit im richtigen Format sind und ob die Endzeit nach der Startzeit liegt
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !timePattern.test(dto.startTime) ||
      !timePattern.test(dto.endTime)
    ) {
      throw new BadRequestException(
        'Die Uhrzeit muss im Format HH:mm angegeben werden.',
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        'Die Endzeit muss nach der Startzeit liegen.',
      );
    }

    //prufen ob es bereits ein Ereignis zur gleichen Zeit gibt
    const { data: occurrences, error: occurrenceError } = await supabase
      .from('event_occurrences')
      .select('id, event_date, weekday, start_time, end_time, repeat')
      .eq('user_id', userId);

    if (occurrenceError) {
      throw new InternalServerErrorException(
        'Die Terminprüfung ist fehlgeschlagen.',
      );
    }

    // Hilfsfunktion, um den Wochentag aus einem Datum zu ermitteln (1 = Montag, 7 = Sonntag)
    const getWeekday = (date: string) => {
      const day = new Date(`${date}T00:00:00Z`).getUTCDay();
      return day === 0 ? 7 : day;
    };

    const targetWeekday = hasDate
      ? getWeekday(dto.eventDate!)
      : dto.weekday!;

    const clashes = (occurrences ?? []).some((occurrence: any) => {
      const sameDay =
        occurrence.event_date === dto.eventDate ||
        (occurrence.repeat &&
          Number(occurrence.weekday) === targetWeekday) ||
        (hasWeekday &&
          occurrence.event_date &&
          getWeekday(occurrence.event_date) === targetWeekday);

      const overlapping =
        dto.startTime < occurrence.end_time &&
        dto.endTime > occurrence.start_time;

      return sameDay && overlapping;
    });

    if (clashes) {
      throw new ConflictException(
        'Zu dieser Zeit gibt es bereits ein anderes Ereignis.',
      );
    }

    // Ereignis in der Datenbank speichern
    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: eventId,
        user_id: userId,
        event_date: hasDate ? dto.eventDate : null,
        weekday: hasWeekday ? dto.weekday : null,
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
  
  async findAll(supabase: any, userId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_occurrences(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        'Die Ereignisse konnten nicht geladen werden.',
      );
    }

    return data;
  }
}