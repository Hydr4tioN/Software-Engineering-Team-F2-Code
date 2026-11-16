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
      newOccurrence = new EventOccurrence(eventId, userId, dto.startTime, dto.endTime, dto.eventDate, dto.weekday);
    } catch (error: any) {
      throw new BadRequestException(error.message.replace('DOMAIN_ERROR: ', ''));
    }
    //Daten durch das Repository abrufen, um Konflikte zu überprüfen
    const existingOccurrences = await this.eventRepo.getOccurrencesByUser(userId, supabase);

    // Domain Logic: Policy Check
    if (ScheduleClashPolicy.hasClash(newOccurrence, existingOccurrences)) {
      throw new ConflictException('Zu dieser Zeit gibt es bereits ein anderes Ereignis.');
    }

    return await this.eventRepo.saveOccurrence(newOccurrence, supabase);

  }
  
  async findAll(supabase: any, userId: string) {
    const data = await this.eventRepo.findAllEvents(userId, supabase);
    return data;
  }
}