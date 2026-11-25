import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventRepository } from './event.repository';
import { EventOccurrence } from './entities/event.entity';

class FakeEventRepository implements EventRepository {
  public existingEventIds = new Set<string>(['ev-1', 'ev-2']);
  public occurrences: EventOccurrence[] = [];
  public savedCount = 0;

  async checkEventExists(eventId: string): Promise<boolean> {
    return this.existingEventIds.has(eventId);
  }

  async getOccurrencesByUser(userId: string): Promise<EventOccurrence[]> {
    return this.occurrences.filter((o) => o.userId === userId);
  }

  async saveOccurrence(occurrence: EventOccurrence): Promise<any> {
    this.occurrences.push(occurrence);
    this.savedCount++;
    return {
      id: `occ-${this.savedCount}`,
      event_id: occurrence.eventId,
      user_id: occurrence.userId,
      start_time: occurrence.startTime,
      end_time: occurrence.endTime,
      event_date: occurrence.eventDate ?? null,
      weekday: occurrence.weekday ?? null,
      repeat: occurrence.isRepeat,
    };
  }

  async findAllEvents(userId: string): Promise<any[]> {
    return [
      {
        id: 'ev-1',
        name: 'Sport',
        event_occurrences: this.occurrences.filter(
          (o) => o.userId === userId && o.eventId === 'ev-1',
        ),
      },
    ];
  }
}

describe('EventsService (with FakeEventRepository)', () => {
  let service: EventsService;
  let fakeRepo: FakeEventRepository;
  const dummyClient = {};

  beforeEach(() => {
    fakeRepo = new FakeEventRepository();
    service = new EventsService(fakeRepo);
  });

  it('sollte einen gültigen Termin speichern', async () => {
    const result = await service.addOccurrence(dummyClient, 'user-1', 'ev-1', {
      eventDate: '2026-11-23',
      startTime: '10:00',
      endTime: '12:00',
    });

    expect(result.event_id).toBe('ev-1');
    expect(fakeRepo.savedCount).toBe(1);
  });

  it('sollte NotFoundException werfen, wenn das Ereignis nicht existiert', async () => {
    await expect(
      service.addOccurrence(dummyClient, 'user-1', 'unknown-id', {
        eventDate: '2026-11-23',
        startTime: '10:00',
        endTime: '12:00',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(fakeRepo.savedCount).toBe(0);
  });

  it('sollte BadRequestException werfen, wenn Domain-Regeln verletzt werden', async () => {
    await expect(
      service.addOccurrence(dummyClient, 'user-1', 'ev-1', {
        eventDate: '2026-11-23',
        startTime: '14:00',
        endTime: '12:00', // Endzeit vor Startzeit
      }),
    ).rejects.toThrow(BadRequestException);

    expect(fakeRepo.savedCount).toBe(0);
  });

  it('sollte ConflictException werfen, wenn sich der Termin überschneidet', async () => {
    fakeRepo.occurrences.push(
      new EventOccurrence('ev-1', 'user-1', '10:00', '12:00', '2026-11-23', null),
    );

    await expect(
      service.addOccurrence(dummyClient, 'user-1', 'ev-2', {
        eventDate: '2026-11-23',
        startTime: '11:00',
        endTime: '13:00',
      }),
    ).rejects.toThrow(ConflictException);

    expect(fakeRepo.savedCount).toBe(0);
  });

  it('sollte alle Ereignisse eines Benutzers über das Repository laden', async () => {
    const events = await service.findAll(dummyClient, 'user-1');

    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('Sport');
  });

  it('sollte keinen Konflikt melden, wenn ein anderer Benutzer zur selben Zeit einen Termin hat', async () => {
    fakeRepo.occurrences.push(
      new EventOccurrence('ev-1', 'user-2', '10:00', '12:00', '2026-11-23', null),
    );

    const result = await service.addOccurrence(dummyClient, 'user-1', 'ev-1', {
      eventDate: '2026-11-23',
      startTime: '10:00',
      endTime: '12:00',
    });

    expect(result.user_id).toBe('user-1');
    expect(fakeRepo.savedCount).toBe(1);
  });

  it('sollte einen gültigen wöchentlichen Termin speichern', async () => {
    const result = await service.addOccurrence(dummyClient, 'user-1', 'ev-1', {
      weekday: 1,
      startTime: '08:00',
      endTime: '10:00',
    });

    expect(result.repeat).toBe(true);
    expect(result.weekday).toBe(1);
    expect(fakeRepo.savedCount).toBe(1);
  });
});