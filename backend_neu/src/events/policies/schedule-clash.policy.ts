import { EventOccurrence } from '../entities/event.entity';

export class ScheduleClashPolicy {
  static hasClash(
    newOcc: EventOccurrence,
    existingOccurrences: EventOccurrence[],
  ): boolean {
    return existingOccurrences.some((existing) => {
      const sameDay = this.isSameDay(newOcc, existing);
      if (!sameDay) return false;

      return (newOcc.startTime < existing.endTime ) && (existing.startTime < newOcc.endTime);
    });
  }

  private static isSameDay(a: EventOccurrence, b: EventOccurrence): boolean {
    if (!a.isRepeat && !b.isRepeat) {
      return a.eventDate === b.eventDate;
    }
    if (a.isRepeat && b.isRepeat) {
      return a.weekday === b.weekday;
    }
    const singleDate = a.isRepeat ? b.eventDate! : a.eventDate!;
    const recurringWeekday = a.isRepeat ? a.weekday : b.weekday;
    const jsDay = new Date(singleDate).getDay();
    const isoWeekday = jsDay === 0 ? 7 : jsDay;

    return isoWeekday === recurringWeekday;
  }
}