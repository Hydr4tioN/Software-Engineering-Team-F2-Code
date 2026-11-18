import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { STRESS_TOLERANCE } from "./stress-tolerance.constants";
import { isValidDate, loadValuesForDay } from "./stress-tolerance.day";
import { calculateStressTolerance } from "./stress-tolerance.policy";
import { STRESS_TOLERANCE_DATA_SOURCE } from "./stress-tolerance.types";
import type {
  StressToleranceDataSource,
  StressToleranceResult,
} from "./stress-tolerance.types";

/**
 * Application Service: koordiniert nur.
 * Daten holen (Port) → Belastungswerte zuordnen → Policy aus #198 aufrufen.
 */
@Injectable()
export class StressToleranceService {
  constructor(
    @Inject(STRESS_TOLERANCE_DATA_SOURCE)
    private readonly dataSource: StressToleranceDataSource,
  ) {}

  async getForDay(
    client: unknown,
    userId: string,
    date: string,
  ): Promise<StressToleranceResult> {
    if (!date || !isValidDate(date)) {
      throw new BadRequestException(
        "Bitte ein gültiges Datum im Format YYYY-MM-DD angeben.",
      );
    }

    const occurrences = await this.dataSource.findOccurrencesForDay(
      client,
      userId,
      date,
    );
    const eventIds = [...new Set(occurrences.map((o) => o.eventId))];
    const loadValues = eventIds.length
      ? await this.dataSource.findLoadValues(client, userId, eventIds)
      : new Map<string, number>();

    return {
      date,
      value: calculateStressTolerance(
        loadValuesForDay(occurrences, loadValues),
      ),
      max: STRESS_TOLERANCE.START,
      min: STRESS_TOLERANCE.MIN,
      consideredOccurrences: occurrences.length,
    };
  }
}
