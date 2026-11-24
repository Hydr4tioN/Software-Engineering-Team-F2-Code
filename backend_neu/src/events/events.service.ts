
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { EventRepository } from './event.repository';
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto';
import { EventOccurrence } from './entities/event.entity';
import { ScheduleClashPolicy } from './policies/schedule-clash.policy';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventRepo: EventRepository,
  ) {}

  // Ereignis zu einem Datum oder Wochentag hinzufügen
  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {
    // Prüfen, ob das Ereignis existiert
    const exists = await this.eventRepo.checkEventExists(
      eventId,
      supabase,
    );

    if (!exists) {
      throw new NotFoundException(
        'Ereignis nicht gefunden.',
      );
    }

    // Domain-Logik: Ereignistermin erstellen und validieren
    let newOccurrence: EventOccurrence;

    try {
      newOccurrence = new EventOccurrence(
        eventId,
        userId,
        dto.startTime,
        dto.endTime,
        dto.eventDate,
        dto.weekday,
      );
    } catch (error: any) {
      throw new BadRequestException(
        error.message.replace('DOMAIN_ERROR: ', ''),
      );
    }

    // Bereits vorhandene Ereignistermine laden
    const existingOccurrences =
      await this.eventRepo.getOccurrencesByUser(
        userId,
        supabase,
      );

    // Überschneidungen überprüfen
    if (
      ScheduleClashPolicy.hasClash(
        newOccurrence,
        existingOccurrences,
      )
    ) {
      throw new ConflictException(
        'Zu dieser Zeit gibt es bereits ein anderes Ereignis.',
      );
    }

<<<<<<< HEAD
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
        load_value: dto.loadValue,
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
  
async findForSelection(
  supabase: any,
  userId: string,
) {
  // Ereignisse des angemeldeten Benutzers laden
  const { data, error } = await supabase
    .from('events')
    .select('id, name, is_static')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    throw new InternalServerErrorException(
      'Die Ereignisse konnten nicht geladen werden.',
=======
    // Ereignistermin speichern
    return await this.eventRepo.saveOccurrence(
      newOccurrence,
      supabase,
>>>>>>> origin/main
    );
  }

  // Ereignisse für das Auswahlmenü laden (#193)
  async findForSelection(
    supabase: any,
    _userId: string,
  ) {
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

  // Alle Ereignisse des Benutzers laden
  async findAll(
    supabase: any,
    userId: string,
  ) {
    return await this.eventRepo.findAllEvents(
      userId,
      supabase,
    );
  }
}
