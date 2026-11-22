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
  constructor(private readonly eventRepo: EventRepository) {}
  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {
    //Überprüfen, ob das Ereignis existiert
    const exists = await this.eventRepo.checkEventExists(eventId, supabase);
    if (!exists) throw new NotFoundException('Ereignis nicht gefunden.');

    //Domain Logic: Erstellen & Validate 
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
    //Daten durch das Repository abrufen, um Konflikte zu überprüfen
    const existingOccurrences = await this.eventRepo.getOccurrencesByUser(userId, supabase);

    // Domain Logic: Policy Check
    if (ScheduleClashPolicy.hasClash(newOccurrence, existingOccurrences)) {
      throw new ConflictException('Zu dieser Zeit gibt es bereits ein anderes Ereignis.');
    }

    return await this.eventRepo.saveOccurrence(newOccurrence, supabase);

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
    );
  }

  const events = data ?? [];

  // Statische Ereignisse filtern
  const staticEvents = events
    .filter((event: any) => event.is_static === true)
    .map((event: any) => ({
      id: event.id,
      name: event.name,
    }));

  // Normale Ereignisse filtern
  const normalEvents = events
    .filter((event: any) => event.is_static !== true)
    .map((event: any) => ({
      id: event.id,
      name: event.name,
    }));

  return {
    normalEvents,
    staticEvents,
  };
}

  async findAll(supabase: any, userId: string) {
    const data = await this.eventRepo.findAllEvents(userId, supabase);
    return data;
  }
}