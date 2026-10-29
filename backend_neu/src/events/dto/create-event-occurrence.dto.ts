export class CreateEventOccurrenceDto {
  eventDate?: string;
  weekday?: number;
  startTime!: string;
  endTime!: string;
}