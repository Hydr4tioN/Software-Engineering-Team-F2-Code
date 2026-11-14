import { ScheduleClashPolicy } from './schedule-clash.policy';
import { EventOccurrence } from '../entities/event.entity';

describe('ScheduleClashPolicy', () => {
  const existingRecords = [
    {
      id: '1',
      event_date: '2026-11-20',
      weekday: null,
      start_time: '09:00',
      end_time: '11:00',
      repeat: false,
    },
    {
      id: '2',
      event_date: null,
      weekday: 3, 
      start_time: '14:00',
      end_time: '16:00',
      repeat: true,
    }
  ];

  it('should return false (no clash) if times do not overlap on the same day', () => {
    const newOccurrence = new EventOccurrence('event-2', 'user-1', '12:00', '14:00', '2026-11-20', null);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(false);
  });

  it('should return true (clash) if times overlap on a specific date', () => {
    const newOccurrence = new EventOccurrence('event-3', 'user-1', '10:00', '12:00', '2026-11-20', null);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(true);
  });

  it('should return true (clash) if times overlap with a repeating weekly event', () => {
    const newOccurrence = new EventOccurrence('event-4', 'user-1', '15:00', '17:00', '2026-11-18', null);
    
    const hasClash = ScheduleClashPolicy.hasClash(newOccurrence, existingRecords);
    expect(hasClash).toBe(true);
  });
});