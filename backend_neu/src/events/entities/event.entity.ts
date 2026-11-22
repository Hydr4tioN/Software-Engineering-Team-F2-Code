import { DomainError } from "../errors/domain.error";

export class EventOccurrence {
  public readonly isRepeat: boolean;

  constructor(
    public readonly eventId: string,
    public readonly userId: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly eventDate?: string | null,
    public readonly weekday?: number | null,
  ) {
    this.isRepeat = this.weekday !== undefined && this.weekday !== null;
    this.validate();
  }

  // Protected method to validate the entity's state
  private validate(): void {
    const hasDate = !!this.eventDate;

    if (hasDate === this.isRepeat) {
      throw new DomainError('Bitte geben Sie entweder ein Datum oder einen Wochentag an.');
    }

    if (hasDate && !/^\d{4}-\d{2}-\d{2}$/.test(this.eventDate!)) {
      throw new DomainError('Bitte geben Sie ein Datum im Format YYYY-MM-DD an.');
    }

    if (this.isRepeat && (!Number.isInteger(this.weekday) || this.weekday! < 1 || this.weekday! > 7)) {
      throw new DomainError('Der Wochentag muss zwischen 1 (Montag) und 7 (Sonntag) liegen.');
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(this.startTime) || !timePattern.test(this.endTime)) {
      throw new DomainError('Die Uhrzeit muss im Format HH:mm angegeben werden.');
    }

    if (this.startTime >= this.endTime) {
      throw new DomainError('Die Endzeit muss nach der Startzeit liegen.');
    }
  }

  // Protected method to assist with calculations for the Policy
  getTargetWeekday(): number {
    if (this.eventDate) {
      const day = new Date(`${this.eventDate}T00:00:00Z`).getUTCDay();
      return day === 0 ? 7 : day; // Sunday = 7
    }
    return this.weekday!;
  }
}