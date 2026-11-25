
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DomainError } from './errors/domain.error';
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
        dto.weekday
      );
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
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

    // Ereignistermin speichern
    return await this.eventRepo.saveOccurrence(
      newOccurrence,
      supabase,
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
