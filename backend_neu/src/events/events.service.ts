import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    if (!dto.eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(dto.eventDate)) {
      throw new BadRequestException(
        'Bitte geben Sie ein Datum im Format YYYY-MM-DD an.',
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
      throw new NotFoundException('Ereignis nicht gefunden.');
    }

    // Keine Überschneidung mit anderen Terminen desselben Nutzers
    const { data: clashes, error: clashError } = await supabase
      .from('event_occurrences')
      .select('id, events!inner(name, user_id)')
      .eq('event_date', dto.eventDate)
      .eq('events.user_id', userId)
      .lt('start_time', dto.endTime)
      .gt('end_time', dto.startTime)
      .limit(1);

    if (clashError) {
      throw new InternalServerErrorException(
        'Die Terminprüfung ist fehlgeschlagen.',
      );
    }

    if (clashes && clashes.length > 0) {
      throw new ConflictException(
        'Zu dieser Zeit gibt es bereits ein anderes Ereignis.',
      );
    }

    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: eventId,
        event_date: dto.eventDate,
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