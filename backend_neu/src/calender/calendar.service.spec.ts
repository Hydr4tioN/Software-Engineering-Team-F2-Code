import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { CALENDAR_DATA_SOURCE } from './calendar.types';
import type { CalendarOccurrence } from './calendar.types';

describe('CalendarService - Wochentagsberechnung', () => {
  let service: CalendarService;

 
const mockDataSource = {
  findOccurrences: jest.fn<
    (userId: string) => Promise<CalendarOccurrence[]>
  >(),
};


  beforeEach(async () => {
    mockDataSource.findOccurrences.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: CALENDAR_DATA_SOURCE,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get(CalendarService);
  });

  it('zeigt einen Montagstermin am Montag an', async () => {
    mockDataSource.findOccurrences.mockResolvedValue([
      {
        id: '1',
        event_id: 'event-1',
        name: 'Mathe',
        event_date: null,
        weekday: 1,
        start_time: '09:00:00',
        end_time: '10:00:00',
      },
    ]);

    const result = await service.getDay(
      '2026-11-02',
      'test-user',
    );

    expect(result.events).toHaveLength(1);
    expect(result.events[0].name).toBe('Mathe');
  });

  it('zeigt keinen Montagstermin am Dienstag an', async () => {
    mockDataSource.findOccurrences.mockResolvedValue([
      {
        id: '1',
        event_id: 'event-1',
        name: 'Mathe',
        event_date: null,
        weekday: 1,
        start_time: '09:00:00',
        end_time: '10:00:00',
      },
    ]);

    const result = await service.getDay(
      '2026-11-03',
      'test-user',
    );

    expect(result.events).toHaveLength(0);
  });

  it('zeigt einen Sonntagstermin am Sonntag an', async () => {
    mockDataSource.findOccurrences.mockResolvedValue([
      {
        id: '2',
        event_id: 'event-2',
        name: 'Lerngruppe',
        event_date: null,
        weekday: 7,
        start_time: '14:00:00',
        end_time: '15:00:00',
      },
    ]);

    const result = await service.getDay(
      '2026-11-08',
      'test-user',
    );

    expect(result.events).toHaveLength(1);
    expect(result.events[0].name).toBe('Lerngruppe');
  });
});
