import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { EventOccurrence } from './entities/event.entity';

// "Adapter" 
@Injectable()
export class SupabaseEventRepository implements EventRepository {

  async checkEventExists(eventId: string, supabase: any): Promise<boolean> {
    const { data: event, error } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();

    if (error) throw new InternalServerErrorException('Das Ereignis konnte nicht überprüft werden.');
    return !!event;
  }

  async getOccurrencesByUser(userId: string, supabase: any): Promise<EventOccurrence[]> {
    const { data, error } = await supabase
      .from('event_occurrences')
      .select('id, event_id, event_date, weekday, start_time, end_time, repeat')
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException('Die Terminprüfung ist fehlgeschlagen.');
    }
    return (data || []).map((row: any) => this.toDomain(row, userId));
  }

  private toDomain(row: any, userId: string): EventOccurrence {
    const startTime = row.start_time?.slice(0, 5);
    const endTime = row.end_time?.slice(0, 5);

    return new EventOccurrence(
      row.event_id,
      userId,
      startTime,
      endTime,
      row.event_date ?? undefined,
      row.weekday ?? undefined,
    );
  }

  async saveOccurrence(occurrence: EventOccurrence, supabase: any): Promise<any> {
    const { data, error } = await supabase
      .from('event_occurrences')
      .insert({
        event_id: occurrence.eventId,
        user_id: occurrence.userId,
        event_date: occurrence.eventDate || null,
        weekday: occurrence.weekday || null,
        start_time: occurrence.startTime,
        end_time: occurrence.endTime,
        repeat: occurrence.isRepeat,
      })
      .select()
      .single();

    if (error) throw new InternalServerErrorException('Der Ereignistermin konnte nicht erstellt werden.');
    return data;
  }

  async findAllEvents(userId: string, supabase: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('events') 
      .select('*, event_occurrences(*)')
      .eq('event_occurrences.user_id', userId) 
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException('Die Ereignisse konnten nicht geladen werden.');
    }
    return data || [];
  }
}
