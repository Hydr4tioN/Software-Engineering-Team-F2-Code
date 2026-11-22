import { ScheduleClashPolicy } from './schedule-clash.policy';
import { EventOccurrence } from '../entities/event.entity';

describe('ScheduleClashPolicy', () => {
  const existingRecords: EventOccurrence[] = [
    new EventOccurrence('ev-1', 'user-1', '09:00', '11:00', '2026-11-20', undefined),
    new EventOccurrence('ev-2', 'user-1', '14:00', '16:00', undefined, 3),
  ];

  it('sollte false (keine Überschneidung) zurückgeben, wenn sich die Zeiten am selben Tag nicht überschneiden', () => {
    const newOccurrence = new EventOccurrence('event-2', 'user-1', '12:00', '14:00', '2026-11-20', undefined);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(false);
  });

  it('sollte true (Überschneidung) zurückgeben, wenn sich die Zeiten an einem bestimmten Datum überschneiden', () => {
    const newOccurrence = new EventOccurrence('event-3', 'user-1', '10:00', '12:00', '2026-11-20', undefined);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(true);
  });

  it('sollte true (Überschneidung) zurückgeben, wenn sich die Zeiten mit einem wöchentlich wiederkehrenden Termin überschneiden', () => {
    // 2026-11-18 ist ein Mittwoch (weekday = 3)
    const newOccurrence = new EventOccurrence('event-4', 'user-1', '15:00', '17:00', '2026-11-18', undefined);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(true);
  });

  it('sollte direkt aneinanderstoßende Termine (09:00–11:00 und 11:00–12:00) NICHT als Überschneidung werten', () => {
    const existing = [
      new EventOccurrence('ev-1', 'user-1', '09:00', '11:00', '2026-11-23', undefined),
    ];
    const adjacent = new EventOccurrence(
      'ev-2',
      'user-1',
      '11:00',
      '12:00',
      '2026-11-23',
      undefined,
    );
    const hasClash = ScheduleClashPolicy.hasClash(adjacent, existing);
    expect(hasClash).toBe(false);
  });

  it('sollte Überschneidung erkennen: neuer wöchentlicher Termin vs. bestehender Einzeltermin', () => {
    // 2026-11-23 ist ein Montag (weekday = 1)
    const existingSingle = [
      new EventOccurrence('ev-1', 'user-1', '10:00', '12:00', '2026-11-23', undefined),
    ];
    const newWeekly = new EventOccurrence(
      'ev-2',
      'user-1',
      '11:00',
      '13:00',
      undefined,
      1, // Montag
    );
    const hasClash = ScheduleClashPolicy.hasClash(newWeekly, existingSingle);
    expect(hasClash).toBe(true);
  });
});