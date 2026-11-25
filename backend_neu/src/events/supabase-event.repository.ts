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

  async getOccurrencesByUser(userId: string, supabase: any): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_occurrences')
      .select('id, event_date, weekday, start_time, end_time, repeat, load_value')
      .eq('user_id', userId);

    if (error) throw new InternalServerErrorException('Die Terminprüfung ist fehlgeschlagen.');
    return data || [];
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
        load_value: occurrence.loadValue,
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
