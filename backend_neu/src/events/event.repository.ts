import { EventOccurrence } from './entities/event.entity';

//  "Port" (Interface) 
export abstract class EventRepository {
  abstract checkEventExists(eventId: string, dbClient: any): Promise<boolean>;
  abstract getOccurrencesByUser(userId: string, dbClient: any): Promise<EventOccurrence[]>;
  abstract saveOccurrence(occurrence: EventOccurrence, dbClient: any): Promise<any>;
  abstract findAllEvents(userId: string, dbClient: any): Promise<any[]>;
}