import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto';
import { EventOccurrence } from './entities/event.entity';
import { ScheduleClashPolicy } from './policies/schedule-clash.policy';
@Injectable()
export class EventsService {
  async addOccurrence(
    supabase: any,
    userId: string,
    eventId: string,
    dto: CreateEventOccurrenceDto,
  ) {

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError) throw new InternalServerErrorException('Das Ereignis konnte nicht überprüft werden.');
    if (!event) throw new NotFoundException('Ereignis nicht gefunden.');

    //Erstellen eines neuen EventOccurrence-Objekts (Domain Logic)
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
      // Domain-Fehlerbehandlung -> HTTP-Fehlerbehandlung
      throw new BadRequestException(error.message.replace('DOMAIN_ERROR: ', ''));
    }

    // 3. Hochladen aller bestehenden EventOccurrences des Benutzers aus der Datenbank (Persistence)
    const { data: occurrences, error: occurrenceError } = await supabase
      .from('event_occurrences')
      .select('id, event_date, weekday, start_time, end_time, repeat')
      .eq('user_id', userId);

    if (occurrenceError) throw new InternalServerErrorException('Die Terminprüfung ist fehlgeschlagen.');

    // 4. Policy-Überprüfung: Überprüfen, ob es einen Terminüberschneidung gibt
    if (ScheduleClashPolicy.hasClash(newOccurrence, occurrences ?? [])) {
      throw new ConflictException('Zu dieser Zeit gibt es bereits ein anderes Ereignis.');
    }

    // 5. Speichern des neuen EventOccurrence in der Datenbank (Persistence)  
    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: newOccurrence.eventId,
        user_id: newOccurrence.userId,
        event_date: newOccurrence.eventDate || null,
        weekday: newOccurrence.weekday || null,
        start_time: newOccurrence.startTime,
        end_time: newOccurrence.endTime,
        repeat: newOccurrence.isRepeat,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException('Der Ereignistermin konnte nicht erstellt werden.');

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