import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto';

@Injectable()
export class EventsService {
  async createEvent(
    supabase: any,
    userId: string,
    dto: CreateEventDto,
  ) {
    const name = dto.name?.trim();

    if (!name) {
      throw new BadRequestException('Der Ereignisname darf nicht leer sein.');
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'Das Ereignis konnte nicht erstellt werden.',
      );
    }

    return data;
  }

  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {
    const hasDate = !!dto.eventDate;
    const hasWeekday = dto.weekday !== undefined && dto.weekday !== null;

    if (hasDate === hasWeekday) {
      throw new BadRequestException(
        'Bitte geben Sie entweder ein Datum oder einen Wochentag an.',
      );
    }

    if (hasWeekday && (
      !Number.isInteger(dto.weekday) ||
      dto.weekday! < 1 ||
      dto.weekday! > 7
    )) {
      throw new BadRequestException(
        'Der Wochentag muss zwischen 1 (Montag) und 7 (Sonntag) liegen.',
      );
    }

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

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .eq('user_id', userId)
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

    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: eventId,
        event_date: dto.eventDate ?? null,
        weekday: dto.weekday ?? null,
        start_time: dto.startTime,
        end_time: dto.endTime,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        'Die Ereignisse konnten nicht geladen werden.',
      );
    }

    return data;
  }
}