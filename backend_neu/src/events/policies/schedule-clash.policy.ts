import { EventOccurrence } from '../entities/event.entity';

export class ScheduleClashPolicy {
  static hasClash(newOccurrence: EventOccurrence, existingRecords: any[]): boolean {
    const targetWeekday = newOccurrence.getTargetWeekday();

    return existingRecords.some((occurrence) => {
      const sameDay =
        occurrence.event_date === newOccurrence.eventDate ||
        (occurrence.repeat && Number(occurrence.weekday) === targetWeekday) ||
        (!newOccurrence.isRepeat &&
          occurrence.event_date &&
          this.getWeekday(occurrence.event_date) === targetWeekday);

      const overlapping =
        newOccurrence.startTime < occurrence.end_time &&
        newOccurrence.endTime > occurrence.start_time;

      return sameDay && overlapping;
    });
  }

  private static getWeekday(date: string): number {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return day === 0 ? 7 : day;
  }
}