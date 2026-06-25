import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateCheckInDto {
  /** US-001: Stresslevel 1–10 */
  @IsInt({ message: 'Stresslevel muss eine ganze Zahl sein' })
  @Min(1, { message: 'Stresslevel muss mindestens 1 sein' })
  @Max(10, { message: 'Stresslevel darf maximal 10 sein' })
  stress_level: number;

  /** US-002: Energielevel 1–10 */
  @IsInt({ message: 'Energielevel muss eine ganze Zahl sein' })
  @Min(1, { message: 'Energielevel muss mindestens 1 sein' })
  @Max(10, { message: 'Energielevel darf maximal 10 sein' })
  energy_level: number;

  /** Optional: Freitext-Notiz */
  @IsOptional()
  note?: string;
}