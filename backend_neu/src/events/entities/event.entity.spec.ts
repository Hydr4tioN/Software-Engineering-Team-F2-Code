import { EventOccurrence } from './event.entity';

describe('EventOccurrence Entity', () => {
  it('should create a valid occurrence with a specific date', () => {
    const occurrence = new EventOccurrence('event-1', 'user-1', '10:00', '12:00', '2026-11-20', null);
    
    expect(occurrence.isRepeat).toBe(false);
    expect(occurrence.getTargetWeekday()).toBe(5); // 2026-11-20 là thứ 6
  });

  it('should throw an error if start time is after end time', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '14:00', '12:00', '2026-11-20', null);
    }).toThrow('DOMAIN_ERROR: Die Endzeit muss nach der Startzeit liegen.');
  });

  it('should throw an error if both date and weekday are provided', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '10:00', '12:00', '2026-11-20', 3);
    }).toThrow('DOMAIN_ERROR: Bitte geben Sie entweder ein Datum oder einen Wochentag an.');
  });

  it('should throw an error if time format is invalid', () => {
    expect(() => {
      new EventOccurrence('event-1', 'user-1', '9:00', '12:00', '2026-11-20', null); // Thiếu số 0
    }).toThrow('DOMAIN_ERROR: Die Uhrzeit muss im Format HH:mm angegeben werden.');
  });
});