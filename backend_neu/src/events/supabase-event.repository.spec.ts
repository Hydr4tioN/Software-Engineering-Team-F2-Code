import { SupabaseEventRepository } from './supabase-event.repository';
import { EventOccurrence } from './entities/event.entity';

describe('SupabaseEventRepository (Adapter)', () => {
  const repo = new SupabaseEventRepository();

  const createMockSupabase = (data: any, error: any = null) => ({
    from: () => ({
      select: () => ({
        eq: async () => ({ data, error }),
      }),
    }),
  });

  it('sollte eine gültige DB-Zeile korrekt in ein EventOccurrence-Objekt mappen', async () => {
    const mockClient = createMockSupabase([
      {
        id: 'occ-1',
        event_id: 'e1',
        start_time: '09:00:00',
        end_time: '10:00:00',
        event_date: null,
        weekday: 3,
      },
    ]);

    const result = await repo.getOccurrencesByUser('user-1', mockClient);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(EventOccurrence);
    expect(result[0].startTime).toBe('09:00');
    expect(result[0].endTime).toBe('10:00');
    expect(result[0].isRepeat).toBe(true);
    expect(result[0].weekday).toBe(3);
  });

  it('sollte ungültige DB-Zeilen mit Warnung überspringen', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mockClient = createMockSupabase([
      {
        id: 'occ-valid',
        event_id: 'e1',
        start_time: '09:00:00',
        end_time: '10:00:00',
        event_date: null,
        weekday: 3,
      },
      {
        id: 'occ-broken',
        event_id: 'e2',
        start_time: '09:00:00',
        end_time: '10:00:00',
        event_date: '2026-11-25', // ungültig: Datum UND Wochentag
        weekday: 3,
      },
    ]);

    const result = await repo.getOccurrencesByUser('user-1', mockClient);

    expect(result).toHaveLength(1);
    expect(result[0].eventId).toBe('e1');
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
    
  });
});