
import { CalendarService } from './calendar.service';
import { BadRequestException } from '@nestjs/common';

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(() => {
    service = new CalendarService();
  });

  it('gibt die Ereignisse des ausgewählten Tages zurück', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: async () => ({
            data: [
              {
                id: '1',
                name: 'Lernzeit',
                event_occurrences: [
                  {
                    id: '10',
                    event_date: '2026-11-16',
                    weekday: null,
                    start_time: '10:00',
                    end_time: '11:00',
                  },
                ],
              },
            ],
            error: null,
          }),
        }),
      }),
    };

    const result = await service.getDay(
      supabase,
      'user1',
      '2026-11-16',
    );

    expect(result.events).toHaveLength(1);
    expect(result.events[0].name).toBe('Lernzeit');
  });

  it('wirft einen Fehler bei einem ungültigen Datum', async () => {
    await expect(
      service.getDay({}, 'user1', 'ungültig'),
    ).rejects.toThrow(BadRequestException);
  });

  it('gibt den richtigen Wochenzeitraum zurück', async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: async () => ({
            data: [],
            error: null,
          }),
        }),
      }),
    };

    const result = await service.getWeek(
      supabase,
      'user1',
      '2026-11-18',
    );

    expect(result.week_start).toBe('2026-11-16');
    expect(result.week_end).toBe('2026-11-22');
  });

  it('gibt wiederkehrende Ereignisse am richtigen Wochentag zurück', async () => {
  const supabase = {
    from: () => ({
      select: () => ({
        eq: async () => ({
          data: [
            {
              id: '1',
              name: 'Sport',
              event_occurrences: [
                {
                  id: '10',
                  event_date: null,
                  weekday: 3,
                  start_time: '14:00',
                  end_time: '15:00',
                },
              ],
            },
          ],
          error: null,
        }),
      }),
    }),
  };

  const result = await service.getWeek(
    supabase,
    'user1',
    '2026-11-18',
  );

  expect(result.events).toHaveLength(1);
  expect(result.events[0].date).toBe('2026-11-18');
  expect(result.events[0].name).toBe('Sport');
});
});
