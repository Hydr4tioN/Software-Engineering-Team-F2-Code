import { EventOccurrence } from './event.entity';
import { DomainError } from '../errors/domain.error';

describe('EventOccurrence Entity', () => {
  it('sollte einen gültigen Termin mit einem bestimmten Datum erstellen', () => {
    const occurrence = new EventOccurrence('event-1', 'user-1', '10:00', '12:00', '2026-11-20', null);

    expect(occurrence.isRepeat).toBe(false);
    expect(occurrence.getTargetWeekday()).toBe(5); // Freitag
  });

  it('sollte einen gültigen wiederholenden wöchentlichen Termin erstellen', () => {
    const occurrence = new EventOccurrence('event-1', 'user-1', '10:00', '12:00', null, 3);

    expect(occurrence.isRepeat).toBe(true);
    expect(occurrence.getTargetWeekday()).toBe(3); // Mittwoch
  });

  it('sollte einen DomainError werfen, wenn die Startzeit nach der Endzeit liegt', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '14:00', '12:00', '2026-11-20', null);
    }).toThrow(DomainError);
  });

  it('sollte einen DomainError werfen, wenn Startzeit und Endzeit gleich sind (Grenzwert)', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '10:00', '10:00', '2026-11-20', null);
    }).toThrow(DomainError);
  });

  it('sollte einen DomainError werfen, wenn sowohl Datum als auch Wochentag angegeben sind', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '10:00', '12:00', '2026-11-20', 3);
    }).toThrow(DomainError);
  });

  it('sollte einen DomainError werfen, wenn weder Datum noch Wochentag angegeben sind', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '10:00', '12:00', null, null);
    }).toThrow(DomainError);
  });

  it('sollte einen DomainError werfen, wenn das Zeitformat ungültig ist', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '9:00', '12:00', '2026-11-20', null);
    }).toThrow(DomainError);
  });

  it('sollte einen DomainError werfen, wenn der Wochentag außerhalb des gültigen Bereichs (1–7) liegt', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '10:00', '12:00', null, 8);
    }).toThrow(DomainError);
  });
});